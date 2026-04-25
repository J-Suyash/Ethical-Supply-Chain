"use client";

import { useMemo, useState } from "react";
import { Contract, ethers } from "ethers";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import {
  getBrowserProvider,
  ensureDemoNetwork,
  describeContractError,
  STAGE_LABELS,
  VALIDATION_LABELS,
} from "@/lib/wallet";

interface AuthorityTabProps {
  account: string;
  hasRole: boolean;
  onStatus: (msg: string) => void;
}

export function AuthorityTab({
  account,
  hasRole,
  onStatus,
}: AuthorityTabProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [productSeed, setProductSeed] = useState("");
  const [summary, setSummary] = useState<Record<string, string> | null>(null);
  const [alreadyVoted, setAlreadyVoted] = useState<boolean | null>(null);

  const productId = useMemo(
    () => (productSeed ? ethers.id(productSeed) : ""),
    [productSeed],
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
    } catch (error) {
      onStatus(describeContractError(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function loadSummary() {
    if (!productId) {
      onStatus("Enter a product seed first.");
      return;
    }
    await withContract(async (contract) => {
      const s = await contract.getProductSummary(productId);
      setSummary({
        stage: STAGE_LABELS[Number(s.stage)] ?? String(s.stage),
        validation:
          VALIDATION_LABELS[Number(s.validationStatus)] ??
          String(s.validationStatus),
        approvals: String(s.approvalCount),
        rejections: String(s.rejectionCount),
        custodian: s.currentCustodian,
      });
      const voted = (await contract.hasValidated(
        productId,
        account,
      )) as boolean;
      setAlreadyVoted(voted);
      onStatus(`Product summary loaded for ${productSeed}.`);
    });
  }

  async function approve() {
    if (!productId) return;
    await withContract(async (contract) => {
      const tx = await contract.approveProduct(productId);
      await tx.wait();
      onStatus(`Approval recorded for ${productSeed}.`);
      await loadSummary();
    });
  }

  async function reject() {
    if (!productId) return;
    await withContract(async (contract) => {
      const tx = await contract.rejectProduct(productId);
      await tx.wait();
      onStatus(`Rejection recorded for ${productSeed}.`);
      await loadSummary();
    });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="govt-card">
        <div className="govt-card-header">Review Product for Validation</div>
        {!hasRole && (
          <p className="text-sm text-govt-red font-bold mb-3">
            NO AUTHORITY ROLE DETECTED
          </p>
        )}
        <div className="govt-form-group">
          <label htmlFor="authProductSeed">Product Identification Seed</label>
          <input
            id="authProductSeed"
            value={productSeed}
            onChange={(e) => setProductSeed(e.target.value)}
            placeholder="e.g. batch-2024-001"
            className="govt-input"
          />
        </div>
        {productId && (
          <p className="text-xs font-mono break-all text-govt-gray-dark mt-1">
            <span className="font-bold">Product ID:</span> {productId}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!account || isWorking}
            onClick={loadSummary}
            className="govt-btn govt-btn-secondary"
          >
            Load Summary
          </button>
          <button
            type="button"
            disabled={disabled || alreadyVoted === true}
            onClick={approve}
            className="govt-btn govt-btn-success"
          >
            Approve Product
          </button>
          <button
            type="button"
            disabled={disabled || alreadyVoted === true}
            onClick={reject}
            className="govt-btn govt-btn-danger"
          >
            Reject Product
          </button>
        </div>
        {alreadyVoted === true && (
          <p className="mt-3 text-sm text-govt-gray-dark font-bold">
            You have already voted on this product.
          </p>
        )}
      </div>

      <div className="govt-card">
        <div className="govt-card-header">Validation Status</div>
        {summary ? (
          <div className="mt-3">
            <table className="govt-table">
              <tbody>
                <tr><td className="font-bold w-1/3">Current Stage</td><td>{summary.stage}</td></tr>
                <tr><td className="font-bold">Validation Status</td><td>{summary.validation}</td></tr>
                <tr><td className="font-bold">Approvals</td><td>{summary.approvals}</td></tr>
                <tr><td className="font-bold">Rejections</td><td>{summary.rejections}</td></tr>
                <tr><td className="font-bold">Current Custodian</td><td className="font-mono text-xs break-all">{summary.custodian}</td></tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-govt-gray-dark">
            Enter a product seed and click &quot;Load Summary&quot; to view validation status.
          </p>
        )}
      </div>
    </div>
  );
}
