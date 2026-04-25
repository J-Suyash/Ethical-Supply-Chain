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
  getNetworkDisplayName,
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
  { id: "admin", label: "Admin", roleKey: "admin" as const },
  { id: "manufacturer", label: "Manufacturer", roleKey: "manufacturer" as const },
  { id: "authority", label: "Authority", roleKey: "authority" as const },
  { id: "distributor", label: "Distributor", roleKey: "distributor" as const },
  { id: "retailer", label: "Retailer", roleKey: "retailer" as const },
] as const;

export function OperatorDashboard() {
  const [isHydrated, setIsHydrated] = useState(false);
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
    console.log("[operator-dashboard] env", {
      proposedAddress: contractConfig.proposedAddress,
      demoChainId: contractConfig.demoChainId,
      demoChainName: contractConfig.demoChainName,
    });

    if (!contractConfig.proposedAddress) {
      setStatus("Proposed contract address is not configured.");
      return;
    }

    setIsWorking(true);
    try {
      console.log("[operator-dashboard] connectWallet:start", {
        configuredAddress: contractConfig.proposedAddress,
        demoChainId: contractConfig.demoChainId,
        demoChainName: contractConfig.demoChainName,
      });

      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      await ensureDemoNetwork(provider);
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      console.log("[operator-dashboard] connectWallet:network", {
        address,
        chainId: Number(network.chainId),
      });

      setAccount(address);
      setNetworkName(`${getNetworkDisplayName(network)} (${network.chainId.toString()})`);

      const contract = new Contract(
        contractConfig.proposedAddress,
        proposedAbi,
        signer,
      );

      console.log("[operator-dashboard] connectWallet:contract-created", {
        target: contract.target,
      });

      const { active } = await detectRoles(address, contract);
      await refreshContractState(contract);

      if (active.length === 0) {
        setStatus(
          `Connected: ${address.slice(0, 8)}... — No roles detected on this contract.`,
        );
      } else {
        setStatus(
          `Connected: ${address.slice(0, 8)}... — Roles assigned: ${active.join(", ")}.`,
        );
      }
    } catch (error) {
      console.error("[operator-dashboard] connectWallet:error", error);
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
    setIsHydrated(true);
  }, []);

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
      setStatus("Account changed. Please reconnect your wallet.");
    };

    const handleChainChanged = () => {
      setAccount("");
      setRoles(null);
      setStatus("Network changed. Please reconnect your wallet.");
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
    <div className="py-4">
      <div className="govt-section">
        <div className="govt-section-header flex items-center justify-between">
          <span>Operator Console — Proposed System</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={connectWallet}
              disabled={isWorking}
              className="govt-btn govt-btn-primary text-xs py-1.5"
            >
              {account ? "Reconnect Wallet" : "Connect MetaMask"}
            </button>
            <button
              type="button"
              onClick={handleSwitchNetwork}
              disabled={isWorking}
              className="govt-btn govt-btn-secondary text-xs py-1.5"
            >
              Switch to {contractConfig.demoChainName.toUpperCase()}
            </button>
          </div>
        </div>
        <div className="govt-section-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border border-govt-border bg-govt-gray-light p-3">
              <p className="text-xs font-bold text-govt-gray-dark">Connected Wallet</p>
              <p className="text-sm font-mono break-all mt-1">
                {account || "NOT CONNECTED"}
              </p>
              <p className="text-xs text-govt-gray-dark mt-1">
                {networkName || "NO NETWORK"}
              </p>
            </div>
            <div className="border border-govt-border bg-govt-gray-light p-3">
              <p className="text-xs font-bold text-govt-gray-dark">Contract Status</p>
              <p className="text-sm font-mono break-all mt-1">
                {contractConfig.proposedAddress || "NOT CONFIGURED"}
              </p>
              <p className="text-xs mt-1">
                <span className={contractPaused ? "text-govt-red font-bold" : "text-govt-green font-bold"}>
                  {contractPaused ? "PAUSED" : "ACTIVE"}
                </span>
                {" — "}Threshold: {threshold}
              </p>
            </div>
            <div className="border border-govt-border bg-govt-gray-light p-3">
              <p className="text-xs font-bold text-govt-gray-dark">Detected Roles</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {roles ? (
                  Object.entries(roles).map(([role, has]) => (
                    <span
                      key={role}
                      className={`govt-badge ${
                        has ? "govt-badge-success" : "bg-govt-gray-light text-govt-gray-dark border-govt-border"
                      }`}
                    >
                      {role.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-govt-gray-dark">Connect wallet to detect roles</span>
                )}
              </div>
            </div>
          </div>

          <div className="govt-status-bar mb-4">
            STATUS: {status}
          </div>

          <div className="govt-tabs">
            {TABS.map((tab) => {
              const hasRole = roles?.[tab.roleKey] ?? false;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`govt-tab ${isActive ? "active" : ""} ${
                    !hasRole ? "text-govt-gray-dark" : ""
                  }`}
                >
                  {tab.label}
                  {!hasRole && <span className="ml-1 text-govt-red text-[10px]">*</span>}
                </button>
              );
            })}
          </div>

          <div className="border border-govt-border border-t-0 p-4">
            {isHydrated && activeTab === "admin" && (
              <AdminTab
                account={account}
                hasRole={roles?.admin ?? false}
                onStatus={onStatusUpdate}
                onRefresh={onRefresh}
              />
            )}
            {isHydrated && activeTab === "manufacturer" && (
              <ManufacturerTab
                account={account}
                hasRole={roles?.manufacturer ?? false}
                onStatus={onStatusUpdate}
              />
            )}
            {isHydrated && activeTab === "authority" && (
              <AuthorityTab
                account={account}
                hasRole={roles?.authority ?? false}
                onStatus={onStatusUpdate}
              />
            )}
            {isHydrated && activeTab === "distributor" && (
              <DistributorTab
                account={account}
                hasRole={roles?.distributor ?? false}
                onStatus={onStatusUpdate}
              />
            )}
            {isHydrated && activeTab === "retailer" && (
              <RetailerTab
                account={account}
                hasRole={roles?.retailer ?? false}
                onStatus={onStatusUpdate}
              />
            )}
            {!isHydrated && (
              <p className="text-center text-sm text-govt-gray-dark py-8">Loading console...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
