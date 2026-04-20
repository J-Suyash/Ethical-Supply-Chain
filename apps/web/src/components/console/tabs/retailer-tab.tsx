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
      onStatus(`Advanced product ${productSeed} through retail stage.`);
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
      onStatus(`Loaded product: ${productSeed}`);
    });
  }

  return (
    <div className="grid gap-px border border-line bg-line xl:grid-cols-2">
      <div className="bg-panel p-5">
        <p className="font-data text-foreground">RETAIL ACTIONS</p>
        {!hasRole && (
          <p className="mt-2 font-data text-danger">
            NO RETAILER ROLE DETECTED
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
          <label className="grid gap-1">
            <span className="font-data text-muted">
              NEXT CUSTODIAN ADDRESS (OPTIONAL)
            </span>
            <input
              value={nextCustodian}
              onChange={(e) => setNextCustodian(e.target.value)}
              placeholder="0x... (leave empty for self)"
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          {productId && (
            <p className="break-all font-data text-muted">ID : {productId}</p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={advanceStage}
            className="border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
          >
            ADVANCE STAGE
          </button>
          <button
            type="button"
            disabled={!account || isWorking}
            onClick={readProduct}
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            READ PRODUCT
          </button>
        </div>
      </div>

      <div className="bg-panel p-5">
        <p className="font-data text-foreground">PRODUCT STATUS</p>
        {snapshot ? (
          <div className="mt-4 border border-line bg-panel-alt p-4">
            <div className="grid gap-1 font-data text-sm">
              {Object.entries(snapshot).map(([key, value]) => (
                <p key={key}>
                  <span className="text-muted">{key.toUpperCase()} :</span>{" "}
                  <span className="text-foreground">{value}</span>
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 font-data text-muted">
            LOAD A PRODUCT TO SEE ITS RETAIL STATUS
          </p>
        )}
      </div>
    </div>
  );
}
