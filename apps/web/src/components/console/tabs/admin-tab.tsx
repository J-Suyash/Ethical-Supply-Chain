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
      onStatus(`Actor ${actorAddress.slice(0, 10)}... registered as ${roleName}.`);
    });
  }

  async function revokeActor() {
    await withContract(async (contract) => {
      const tx = await contract.revokeActor(selectedRole, actorAddress);
      await tx.wait();
      const roleName =
        ROLE_OPTIONS.find((r) => r.hash === selectedRole)?.label ?? "unknown";
      onStatus(`${roleName} role revoked from ${actorAddress.slice(0, 10)}...`);
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
          ? `Address ${blacklistAddress.slice(0, 10)}... added to blacklist.`
          : `Address ${blacklistAddress.slice(0, 10)}... removed from blacklist.`,
      );
    });
  }

  async function togglePause(pause: boolean) {
    await withContract(async (contract) => {
      const tx = pause ? await contract.pause() : await contract.unpause();
      await tx.wait();
      onStatus(pause ? "Contract paused successfully." : "Contract unpaused successfully.");
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="govt-card">
        <div className="govt-card-header">Register / Revoke Actor</div>
        {!hasRole && (
          <p className="text-sm text-govt-red font-bold mb-3">NO ADMIN ROLE DETECTED</p>
        )}
        <div className="grid gap-3">
          <div className="govt-form-group">
            <label htmlFor="roleSelect">Role Assignment</label>
            <select
              id="roleSelect"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="govt-input"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.hash} value={opt.hash}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="govt-form-group">
            <label htmlFor="actorAddress">Wallet Address</label>
            <input
              id="actorAddress"
              value={actorAddress}
              onChange={(e) => setActorAddress(e.target.value)}
              placeholder="0x..."
              className="govt-input"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={registerActor}
            className="govt-btn govt-btn-primary"
          >
            Register Actor
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={revokeActor}
            className="govt-btn govt-btn-secondary"
          >
            Revoke Role
          </button>
        </div>
      </div>

      <div className="govt-card">
        <div className="govt-card-header">Authority Threshold Configuration</div>
        <div className="govt-form-group">
          <label htmlFor="thresholdInput">New Threshold Value</label>
          <input
            id="thresholdInput"
            type="number"
            min="1"
            value={thresholdInput}
            onChange={(e) => setThresholdInput(e.target.value)}
            placeholder="e.g. 2"
            className="govt-input"
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={updateThreshold}
          className="govt-btn govt-btn-primary"
        >
          Set Threshold
        </button>
      </div>

      <div className="govt-card">
        <div className="govt-card-header">Blacklist Management</div>
        <div className="grid gap-3">
          <div className="govt-form-group">
            <label htmlFor="blacklistAddress">Wallet Address</label>
            <input
              id="blacklistAddress"
              value={blacklistAddress}
              onChange={(e) => setBlacklistAddress(e.target.value)}
              placeholder="0x..."
              className="govt-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="blacklistToggle"
              checked={blacklistAction}
              onChange={(e) => setBlacklistAction(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="blacklistToggle" className="text-sm font-bold text-govt-blue">
              {blacklistAction ? "Add to Blacklist" : "Remove from Blacklist"}
            </label>
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={updateBlacklist}
          className="govt-btn govt-btn-primary mt-4"
        >
          Update Blacklist
        </button>
      </div>

      <div className="govt-card">
        <div className="govt-card-header">Contract Emergency Controls</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePause(true)}
            className="govt-btn govt-btn-danger"
          >
            Pause Contract
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePause(false)}
            className="govt-btn govt-btn-success"
          >
            Unpause Contract
          </button>
          <button
            type="button"
            disabled={Boolean(!account || isWorking)}
            onClick={loadRoleCounts}
            className="govt-btn govt-btn-secondary"
          >
            Load Role Counts
          </button>
        </div>
        {roleCounts && (
          <div className="mt-4 border border-govt-border bg-govt-gray-light p-3">
            <p className="text-sm font-bold text-govt-blue mb-2">Role Member Counts</p>
            <table className="govt-table">
              <tbody>
                {Object.entries(roleCounts).map(([role, count]) => (
                  <tr key={role}>
                    <td className="font-bold">{role}</td>
                    <td className="text-center">{count} Member{count !== 1 ? "s" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
