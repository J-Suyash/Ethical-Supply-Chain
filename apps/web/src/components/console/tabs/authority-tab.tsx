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
      onStatus(`Loaded summary for ${productSeed}.`);
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
    <div className="grid gap-px border border-line bg-line xl:grid-cols-2">
      <div className="bg-panel p-5">
        <p className="font-data text-foreground">REVIEW PRODUCT</p>
        {!hasRole && (
          <p className="mt-2 font-data text-danger">
            NO AUTHORITY ROLE DETECTED
          </p>
        )}
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="font-data text-muted">PRODUCT SEED</span>
            <input
              value={productSeed}
              onChange={(e) => setProductSeed(e.target.value)}
              placeholder="e.g. batch-2024-001"
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          {productId && (
            <p className="break-all font-data text-muted">ID : {productId}</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!account || isWorking}
            onClick={loadSummary}
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            LOAD SUMMARY
          </button>
          <button
            type="button"
            disabled={disabled || alreadyVoted === true}
            onClick={approve}
            className="border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
          >
            APPROVE
          </button>
          <button
            type="button"
            disabled={disabled || alreadyVoted === true}
            onClick={reject}
            className="border border-line bg-danger px-4 py-2 font-data text-white disabled:opacity-50"
          >
            REJECT
          </button>
        </div>
        {alreadyVoted === true && (
          <p className="mt-3 font-data text-muted">
            YOU HAVE ALREADY VOTED ON THIS PRODUCT
          </p>
        )}
      </div>

      <div className="bg-panel p-5">
        <p className="font-data text-foreground">VALIDATION STATUS</p>
        {summary ? (
          <div className="mt-4 border border-line bg-panel-alt p-4">
            <div className="grid gap-1 font-data text-sm">
              {Object.entries(summary).map(([key, value]) => (
                <p key={key}>
                  <span className="text-muted">{key.toUpperCase()} :</span>{" "}
                  <span className="text-foreground">{value}</span>
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 font-data text-muted">
            ENTER A PRODUCT SEED AND CLICK LOAD SUMMARY
          </p>
        )}
      </div>
    </div>
  );
}
