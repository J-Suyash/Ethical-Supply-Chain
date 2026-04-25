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

interface RetailerTabProps {
  account: string;
  hasRole: boolean;
  onStatus: (msg: string) => void;
}

export function RetailerTab({ account, hasRole, onStatus }: RetailerTabProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [productSeed, setProductSeed] = useState("");
  const [nextCustodian, setNextCustodian] = useState("");
  const [snapshot, setSnapshot] = useState<Record<string, string> | null>(null);

  const productId = useMemo(
    () => (productSeed ? ethers.id(productSeed) : ""),
    [productSeed],
  );

  const disabled = !account || !hasRole || isWorking;

  async function withContract(action: (contract: Contract) => Promise<void>) {
    if (!contractConfig.proposedAddress) return;
    setIsWorking(true);
    try {
      let provider = await getBrowserProvider();
      provider = await ensureDemoNetwork(provider);
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

  async function advanceStage() {
    if (!productId) {
      onStatus("Enter a product seed first.");
      return;
    }
    await withContract(async (contract) => {
      const custodian = nextCustodian || account || ethers.ZeroAddress;
      const tx = await contract.advanceStage(productId, custodian);
      await tx.wait();
      onStatus(`Product ${productSeed} advanced through retail stage.`);
    });
  }

  async function readProduct() {
    if (!productId) {
      onStatus("Enter a product seed first.");
      return;
    }
    await withContract(async (contract) => {
      const s = await contract.getProductSummary(productId);
      setSnapshot({
        stage: STAGE_LABELS[Number(s.stage)] ?? String(s.stage),
        validation:
          VALIDATION_LABELS[Number(s.validationStatus)] ??
          String(s.validationStatus),
        approvals: String(s.approvalCount),
        rejections: String(s.rejectionCount),
        custodian: s.currentCustodian,
      });
      onStatus(`Product data loaded: ${productSeed}`);
    });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="govt-card">
        <div className="govt-card-header">Retail Stage Actions</div>
        {!hasRole && (
          <p className="text-sm text-govt-red font-bold mb-3">
            NO RETAILER ROLE DETECTED
          </p>
        )}
        <div className="grid gap-3">
          <div className="govt-form-group">
            <label htmlFor="retProductSeed">Product Identification Seed</label>
            <input
              id="retProductSeed"
              value={productSeed}
              onChange={(e) => setProductSeed(e.target.value)}
              placeholder="e.g. batch-2024-001"
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="retNextCustodian">Next Custodian Address (Optional)</label>
            <input
              id="retNextCustodian"
              value={nextCustodian}
              onChange={(e) => setNextCustodian(e.target.value)}
              placeholder="0x... (leave empty for self)"
              className="govt-input"
            />
          </div>
          {productId && (
            <p className="text-xs font-mono break-all text-govt-gray-dark">
              <span className="font-bold">Product ID:</span> {productId}
            </p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={advanceStage}
            className="govt-btn govt-btn-primary"
          >
            Advance Stage
          </button>
          <button
            type="button"
            disabled={!account || isWorking}
            onClick={readProduct}
            className="govt-btn govt-btn-secondary"
          >
            Read Product
          </button>
        </div>
      </div>

      <div className="govt-card">
        <div className="govt-card-header">Product Retail Status</div>
        {snapshot ? (
          <div className="mt-3">
            <table className="govt-table">
              <tbody>
                <tr><td className="font-bold w-1/3">Current Stage</td><td>{snapshot.stage}</td></tr>
                <tr><td className="font-bold">Validation Status</td><td>{snapshot.validation}</td></tr>
                <tr><td className="font-bold">Approvals</td><td>{snapshot.approvals}</td></tr>
                <tr><td className="font-bold">Rejections</td><td>{snapshot.rejections}</td></tr>
                <tr><td className="font-bold">Current Custodian</td><td className="font-mono text-xs break-all">{snapshot.custodian}</td></tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-govt-gray-dark">
            Load a product to view its retail status.
          </p>
        )}
      </div>
    </div>
  );
}
