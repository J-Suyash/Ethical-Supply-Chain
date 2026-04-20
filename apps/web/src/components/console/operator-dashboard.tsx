"use client";

import { useCallback, useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import {
  getBrowserProvider,
  ensureDemoNetwork,
  switchToDemoNetwork,
  describeContractError,
  ROLE_HASHES,
} from "@/lib/wallet";
import { AdminTab } from "./tabs/admin-tab";
import { ManufacturerTab } from "./tabs/manufacturer-tab";
import { AuthorityTab } from "./tabs/authority-tab";
import { DistributorTab } from "./tabs/distributor-tab";
import { RetailerTab } from "./tabs/retailer-tab";

interface WalletRoles {
  admin: boolean;
  manufacturer: boolean;
  distributor: boolean;
  retailer: boolean;
  authority: boolean;
}

const TABS = [
  { id: "admin", label: "ADMIN", roleKey: "admin" as const },
  { id: "manufacturer", label: "MANUFACTURER", roleKey: "manufacturer" as const },
  { id: "authority", label: "AUTHORITY", roleKey: "authority" as const },
  { id: "distributor", label: "DISTRIBUTOR", roleKey: "distributor" as const },
  { id: "retailer", label: "RETAILER", roleKey: "retailer" as const },
] as const;

export function OperatorDashboard() {
  const [account, setAccount] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [status, setStatus] = useState("Connect your wallet to begin.");
  const [isWorking, setIsWorking] = useState(false);
  const [roles, setRoles] = useState<WalletRoles | null>(null);
  const [activeTab, setActiveTab] = useState<string>("admin");
  const [contractPaused, setContractPaused] = useState(false);
  const [threshold, setThreshold] = useState(0);

  const detectRoles = useCallback(
    async (address: string, contract: Contract) => {
      const [admin, manufacturer, distributor, retailer, authority] =
        await Promise.all([
          contract.hasRole(ROLE_HASHES.DEFAULT_ADMIN_ROLE, address) as Promise<boolean>,
          contract.hasRole(ROLE_HASHES.MANUFACTURER_ROLE, address) as Promise<boolean>,
          contract.hasRole(ROLE_HASHES.DISTRIBUTOR_ROLE, address) as Promise<boolean>,
          contract.hasRole(ROLE_HASHES.RETAILER_ROLE, address) as Promise<boolean>,
          contract.hasRole(ROLE_HASHES.AUTHORITY_ROLE, address) as Promise<boolean>,
        ]);

      const detected = { admin, manufacturer, distributor, retailer, authority };
      setRoles(detected);

      const active = Object.entries(detected)
        .filter(([, v]) => v)
        .map(([k]) => k);

      if (active.length > 0) {
        setActiveTab(active[0]);
      }

      return { detected, active };
    },
    [],
  );

  const refreshContractState = useCallback(async (contract: Contract) => {
    const [paused, thresh] = await Promise.all([
      contract.paused() as Promise<boolean>,
      contract.authorityThreshold() as Promise<bigint>,
    ]);
    setContractPaused(paused);
    setThreshold(Number(thresh));
  }, []);

  async function connectWallet() {
    if (!contractConfig.proposedAddress) {
      setStatus("Set NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS to use the console.");
      return;
    }

    setIsWorking(true);
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      await ensureDemoNetwork(provider);
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setAccount(address);
      setNetworkName(`${network.name} (${network.chainId.toString()})`);

      const contract = new Contract(
        contractConfig.proposedAddress,
        proposedAbi,
        signer,
      );
      const { active } = await detectRoles(address, contract);
      await refreshContractState(contract);

      if (active.length === 0) {
        setStatus(
          `Connected as ${address.slice(0, 8)}... — no roles detected on this contract.`,
        );
      } else {
        setStatus(
          `Connected as ${address.slice(0, 8)}... — roles: ${active.join(", ")}.`,
        );
      }
    } catch (error) {
      setStatus(describeContractError(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleSwitchNetwork() {
    try {
      await switchToDemoNetwork();
      await connectWallet();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Network switch failed.");
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const eth = window.ethereum as ethers.Eip1193Provider & {
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
    };

    const handleAccountsChanged = () => {
      setAccount("");
      setRoles(null);
      setStatus("Account changed. Reconnect your wallet.");
    };

    const handleChainChanged = () => {
      setAccount("");
      setRoles(null);
      setStatus("Network changed. Reconnect your wallet.");
    };

    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const onStatusUpdate = useCallback((msg: string) => setStatus(msg), []);
  const onRefresh = useCallback(async () => {
    if (!account || !contractConfig.proposedAddress) return;
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const contract = new Contract(
        contractConfig.proposedAddress,
        proposedAbi,
        signer,
      );
      await detectRoles(account, contract);
      await refreshContractState(contract);
    } catch {}
  }, [account, detectRoles, refreshContractState]);

  return (
    <section className="border border-line bg-panel">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="font-data text-muted">PROPOSED SYSTEM</p>
          <h1 className="font-display mt-2 text-5xl">OPERATOR CONSOLE</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={connectWallet}
            disabled={isWorking}
            className="border border-line bg-foreground px-4 py-2 font-data text-background transition-colors hover:bg-accent disabled:opacity-50"
          >
            {account ? "RECONNECT" : "CONNECT METAMASK"}
          </button>
          <button
            type="button"
            onClick={handleSwitchNetwork}
            disabled={isWorking}
            className="border border-line bg-panel px-4 py-2 font-data text-foreground transition-colors hover:bg-panel-alt disabled:opacity-50"
          >
            SWITCH TO {contractConfig.demoChainName.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="grid border-b border-line lg:grid-cols-3">
        <div className="border-r border-line px-6 py-4">
          <p className="font-data text-muted">WALLET</p>
          <p className="mt-2 break-all font-data text-foreground">
            {account || "NOT CONNECTED"}
          </p>
          <p className="mt-1 font-data text-muted">{networkName || "NO NETWORK"}</p>
        </div>
        <div className="border-r border-line px-6 py-4">
          <p className="font-data text-muted">CONTRACT</p>
          <p className="mt-2 break-all font-data text-foreground">
            {contractConfig.proposedAddress || "NOT CONFIGURED"}
          </p>
          <p className="mt-1 font-data text-muted">
            {contractPaused ? "PAUSED" : "ACTIVE"} — THRESHOLD: {threshold}
          </p>
        </div>
        <div className="px-6 py-4">
          <p className="font-data text-muted">DETECTED ROLES</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {roles ? (
              Object.entries(roles).map(([role, has]) => (
                <span
                  key={role}
                  className={`border px-2 py-1 font-data ${
                    has
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-panel-alt text-muted"
                  }`}
                >
                  {role.toUpperCase()}
                </span>
              ))
            ) : (
              <span className="font-data text-muted">CONNECT WALLET TO DETECT</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-foreground px-6 py-3">
        <p className="font-data text-background">STATUS : {status}</p>
      </div>

      <div className="border-b border-line">
        <nav className="flex">
          {TABS.map((tab) => {
            const hasRole = roles?.[tab.roleKey] ?? false;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-r border-line px-5 py-3 font-data transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : hasRole
                      ? "bg-accent-soft text-accent hover:bg-accent hover:text-background"
                      : "bg-panel text-muted hover:bg-panel-alt"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "admin" && (
          <AdminTab
            account={account}
            hasRole={roles?.admin ?? false}
            onStatus={onStatusUpdate}
            onRefresh={onRefresh}
          />
        )}
        {activeTab === "manufacturer" && (
          <ManufacturerTab
            account={account}
            hasRole={roles?.manufacturer ?? false}
            onStatus={onStatusUpdate}
          />
        )}
        {activeTab === "authority" && (
          <AuthorityTab
            account={account}
            hasRole={roles?.authority ?? false}
            onStatus={onStatusUpdate}
          />
        )}
        {activeTab === "distributor" && (
          <DistributorTab
            account={account}
            hasRole={roles?.distributor ?? false}
            onStatus={onStatusUpdate}
          />
        )}
        {activeTab === "retailer" && (
          <RetailerTab
            account={account}
            hasRole={roles?.retailer ?? false}
            onStatus={onStatusUpdate}
          />
        )}
      </div>
    </section>
  );
}
