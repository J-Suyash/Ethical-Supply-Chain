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

interface ManufacturerTabProps {
  account: string;
  hasRole: boolean;
  onStatus: (msg: string) => void;
}

interface ProductSnapshot {
  stage: string;
  validationStatus: string;
  currentCustodian: string;
  approvalCount: number;
  rejectionCount: number;
  certificateHash: string;
  createdAt: string;
  updatedAt: string;
}

export function ManufacturerTab({
  account,
  hasRole,
  onStatus,
}: ManufacturerTabProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [productSeed, setProductSeed] = useState("");
  const [certificateSource, setCertificateSource] = useState("");
  const [nextCustodian, setNextCustodian] = useState("");
  const [snapshot, setSnapshot] = useState<ProductSnapshot | null>(null);
  const [uploadedCid, setUploadedCid] = useState("");

  const productId = useMemo(
    () => (productSeed ? ethers.id(productSeed) : ""),
    [productSeed],
  );
  const certificateHash = useMemo(
    () =>
      uploadedCid || certificateSource
        ? ethers.id(uploadedCid || certificateSource)
        : "",
    [certificateSource, uploadedCid],
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

  async function uploadCertificate(file: File | null) {
    if (!file) return;
    setIsWorking(true);
    onStatus(`Uploading ${file.name} to Filebase IPFS...`);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "IPFS upload failed.");
      setUploadedCid(payload.cid);
      setCertificateSource(payload.cid);
      onStatus(`Uploaded. CID: ${payload.cid}`);
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsWorking(false);
    }
  }

  async function registerProduct() {
    if (!productId || !certificateHash) {
      onStatus("Enter a product seed and certificate source.");
      return;
    }
    await withContract(async (contract) => {
      const tx = await contract.registerProduct(productId, certificateHash);
      await tx.wait();
      onStatus(
        `Product registered: ${productSeed} → ${productId.slice(0, 18)}...`,
      );
    });
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
      onStatus(`Advanced product ${productSeed} to next stage.`);
    });
  }

  async function readProduct() {
    if (!productId) {
      onStatus("Enter a product seed first.");
      return;
    }
    await withContract(async (contract) => {
      const p = await contract.getProduct(productId);
      setSnapshot({
        stage: STAGE_LABELS[Number(p.stage)] ?? String(p.stage),
        validationStatus:
          VALIDATION_LABELS[Number(p.validationStatus)] ??
          String(p.validationStatus),
        currentCustodian: p.currentCustodian,
        approvalCount: Number(p.approvalCount),
        rejectionCount: Number(p.rejectionCount),
        certificateHash: p.certificateHash,
        createdAt: new Date(Number(p.createdAt) * 1000).toLocaleString(),
        updatedAt: new Date(Number(p.updatedAt) * 1000).toLocaleString(),
      });
      onStatus(`Loaded product: ${productSeed}`);
    });
  }

  return (
    <div className="grid gap-px border border-line bg-line xl:grid-cols-2">
      <div className="bg-panel p-5">
        <p className="font-data text-foreground">REGISTER PRODUCT</p>
        {!hasRole && (
          <p className="mt-2 font-data text-danger">
            NO MANUFACTURER ROLE DETECTED
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
            <span className="font-data text-muted">CERTIFICATE SOURCE OR CID</span>
            <input
              value={certificateSource}
              onChange={(e) => setCertificateSource(e.target.value)}
              placeholder="Manual CID or text"
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-data text-muted">UPLOAD CERTIFICATE TO IPFS</span>
            <input
              type="file"
              onChange={(e) =>
                void uploadCertificate(e.target.files?.[0] ?? null)
              }
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          {productId && (
            <div className="border border-line-muted bg-panel-alt px-3 py-2">
              <p className="break-all font-data text-muted">ID : {productId}</p>
              {certificateHash && (
                <p className="break-all font-data text-muted">
                  CERT : {certificateHash}
                </p>
              )}
              {uploadedCid && (
                <p className="break-all font-data text-muted">
                  CID : {uploadedCid}
                </p>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={registerProduct}
          className="mt-4 border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
        >
          REGISTER PRODUCT
        </button>
      </div>

      <div className="bg-panel p-5">
        <p className="font-data text-foreground">ADVANCE STAGE</p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="font-data text-muted">PRODUCT SEED</span>
            <input
              value={productSeed}
              onChange={(e) => setProductSeed(e.target.value)}
              placeholder="same seed as registration"
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-data text-muted">NEXT CUSTODIAN ADDRESS</span>
            <input
              value={nextCustodian}
              onChange={(e) => setNextCustodian(e.target.value)}
              placeholder="0x... (leave empty for self)"
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={advanceStage}
            className="border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
          >
            ADVANCE
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
        {snapshot && (
          <div className="mt-4 border border-line bg-panel-alt p-4">
            <div className="grid gap-1 font-data text-sm">
              <p>
                <span className="text-muted">STAGE :</span>{" "}
                <span className="text-foreground">{snapshot.stage}</span>
              </p>
              <p>
                <span className="text-muted">VALIDATION :</span>{" "}
                <span className="text-foreground">
                  {snapshot.validationStatus}
                </span>
              </p>
              <p>
                <span className="text-muted">APPROVALS :</span>{" "}
                <span className="text-foreground">{snapshot.approvalCount}</span>
              </p>
              <p>
                <span className="text-muted">REJECTIONS :</span>{" "}
                <span className="text-foreground">
                  {snapshot.rejectionCount}
                </span>
              </p>
              <p>
                <span className="text-muted">CUSTODIAN :</span>{" "}
                <span className="text-foreground">
                  {snapshot.currentCustodian}
                </span>
              </p>
              <p>
                <span className="text-muted">CREATED :</span>{" "}
                <span className="text-foreground">{snapshot.createdAt}</span>
              </p>
              <p>
                <span className="text-muted">UPDATED :</span>{" "}
                <span className="text-foreground">{snapshot.updatedAt}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
