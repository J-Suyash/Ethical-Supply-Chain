"use client";

import { useState } from "react";
import { Contract } from "ethers";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import {
  getBrowserProvider,
  ensureDemoNetwork,
  describeContractError,
  ROLE_HASHES,
} from "@/lib/wallet";

interface AdminTabProps {
  account: string;
  hasRole: boolean;
  onStatus: (msg: string) => void;
  onRefresh: () => Promise<void>;
}

const ROLE_OPTIONS = [
  { label: "Manufacturer", hash: ROLE_HASHES.MANUFACTURER_ROLE },
  { label: "Distributor", hash: ROLE_HASHES.DISTRIBUTOR_ROLE },
  { label: "Retailer", hash: ROLE_HASHES.RETAILER_ROLE },
  { label: "Authority", hash: ROLE_HASHES.AUTHORITY_ROLE },
] as const;

export function AdminTab({
  account,
  hasRole,
  onStatus,
  onRefresh,
}: AdminTabProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [actorAddress, setActorAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0].hash);
  const [thresholdInput, setThresholdInput] = useState("");
  const [blacklistAddress, setBlacklistAddress] = useState("");
  const [blacklistAction, setBlacklistAction] = useState(true);
  const [roleCounts, setRoleCounts] = useState<Record<string, number> | null>(
    null,
  );

  const disabled = !account || !hasRole || isWorking;

  async function withContract(action: (contract: Contract) => Promise<void>) {
    if (!contractConfig.proposedAddress) return;
    setIsWorking(true);
    try {
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new Contract(
        contractConfig.proposedAddress,
        proposedAbi,
        signer,
      );
      await action(contract);
      await onRefresh();
    } catch (error) {
      onStatus(describeContractError(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function registerActor() {
    await withContract(async (contract) => {
      const tx = await contract.registerActor(selectedRole, actorAddress);
      await tx.wait();
      const roleName =
        ROLE_OPTIONS.find((r) => r.hash === selectedRole)?.label ?? "unknown";
      onStatus(`Registered ${actorAddress.slice(0, 10)}... as ${roleName}.`);
    });
  }

  async function revokeActor() {
    await withContract(async (contract) => {
      const tx = await contract.revokeActor(selectedRole, actorAddress);
      await tx.wait();
      const roleName =
        ROLE_OPTIONS.find((r) => r.hash === selectedRole)?.label ?? "unknown";
      onStatus(`Revoked ${roleName} role from ${actorAddress.slice(0, 10)}...`);
    });
  }

  async function updateThreshold() {
    await withContract(async (contract) => {
      const tx = await contract.setAuthorityThreshold(Number(thresholdInput));
      await tx.wait();
      onStatus(`Authority threshold updated to ${thresholdInput}.`);
    });
  }

  async function updateBlacklist() {
    await withContract(async (contract) => {
      const tx = await contract.setBlacklist(blacklistAddress, blacklistAction);
      await tx.wait();
      onStatus(
        blacklistAction
          ? `Blacklisted ${blacklistAddress.slice(0, 10)}...`
          : `Removed ${blacklistAddress.slice(0, 10)}... from blacklist.`,
      );
    });
  }

  async function togglePause(pause: boolean) {
    await withContract(async (contract) => {
      const tx = pause ? await contract.pause() : await contract.unpause();
      await tx.wait();
      onStatus(pause ? "Contract paused." : "Contract unpaused.");
    });
  }

  async function loadRoleCounts() {
    if (!contractConfig.proposedAddress) return;
    setIsWorking(true);
    try {
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new Contract(
        contractConfig.proposedAddress,
        proposedAbi,
        signer,
      );
      const counts: Record<string, number> = {};
      for (const opt of ROLE_OPTIONS) {
        counts[opt.label] = Number(await contract.getRoleMemberCount(opt.hash));
      }
      setRoleCounts(counts);
      onStatus("Role member counts loaded.");
    } catch (error) {
      onStatus(describeContractError(error));
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="grid gap-px border border-line bg-line xl:grid-cols-2">
      <div className="bg-panel p-5">
        <p className="font-data text-foreground">REGISTER / REVOKE ACTOR</p>
        {!hasRole && (
          <p className="mt-2 font-data text-danger">NO ADMIN ROLE DETECTED</p>
        )}
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="font-data text-muted">ROLE</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.hash} value={opt.hash}>
                  {opt.label.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="font-data text-muted">ADDRESS</span>
            <input
              value={actorAddress}
              onChange={(e) => setActorAddress(e.target.value)}
              placeholder="0x..."
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={registerActor}
            className="border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
          >
            REGISTER
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={revokeActor}
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            REVOKE
          </button>
        </div>
      </div>

      <div className="bg-panel p-5">
        <p className="font-data text-foreground">AUTHORITY THRESHOLD</p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="font-data text-muted">NEW THRESHOLD</span>
            <input
              type="number"
              min="1"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="e.g. 2"
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={updateThreshold}
          className="mt-4 border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
        >
          SET THRESHOLD
        </button>
      </div>

      <div className="bg-panel p-5">
        <p className="font-data text-foreground">BLACKLIST MANAGEMENT</p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="font-data text-muted">ADDRESS</span>
            <input
              value={blacklistAddress}
              onChange={(e) => setBlacklistAddress(e.target.value)}
              placeholder="0x..."
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          <label className="flex items-center gap-2 font-data text-muted">
            <input
              type="checkbox"
              checked={blacklistAction}
              onChange={(e) => setBlacklistAction(e.target.checked)}
              className="h-4 w-4 border-line accent-accent"
            />
            {blacklistAction ? "ADD TO BLACKLIST" : "REMOVE FROM BLACKLIST"}
          </label>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={updateBlacklist}
          className="mt-4 border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
        >
          UPDATE BLACKLIST
        </button>
      </div>

      <div className="bg-panel p-5">
        <p className="font-data text-foreground">CONTRACT CONTROLS</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePause(true)}
            className="border border-line bg-danger px-4 py-2 font-data text-white disabled:opacity-50"
          >
            PAUSE
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePause(false)}
            className="border border-line bg-success px-4 py-2 font-data text-white disabled:opacity-50"
          >
            UNPAUSE
          </button>
          <button
            type="button"
            disabled={!account || isWorking}
            onClick={loadRoleCounts}
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            LOAD ROLE COUNTS
          </button>
        </div>
        {roleCounts && (
          <div className="mt-4 border border-line bg-panel-alt p-4">
            <div className="grid gap-1 font-data text-sm">
              {Object.entries(roleCounts).map(([role, count]) => (
                <p key={role}>
                  <span className="text-muted">{role.toUpperCase()} :</span>{" "}
                  <span className="text-foreground">
                    {count} MEMBER{count !== 1 ? "S" : ""}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
