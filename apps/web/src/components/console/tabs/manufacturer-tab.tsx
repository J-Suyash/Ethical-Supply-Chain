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
  name: string;
  batchNumber: string;
  stage: string;
  validationStatus: string;
  currentCustodian: string;
  approvalCount: number;
  rejectionCount: number;
  certificateHash: string;
  createdAt: string;
  updatedAt: string;
  manufacturedAt: string;
  expiryAt: string;
}

export function ManufacturerTab({
  account,
  hasRole,
  onStatus,
}: ManufacturerTabProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [productSeed, setProductSeed] = useState("");
  const [productName, setProductName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [manufacturedAt, setManufacturedAt] = useState("");
  const [expiryAt, setExpiryAt] = useState("");
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
      onStatus(`File uploaded successfully. CID: ${payload.cid}`);
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsWorking(false);
    }
  }

  async function registerProduct() {
    if (!productId || !certificateHash || !productName || !batchNumber || !manufacturedAt || !expiryAt) {
      onStatus("Please fill in all required fields: product seed, certificate source, name, batch number, manufacturing date, and expiry date.");
      return;
    }
    await withContract(async (contract) => {
      const mfgTimestamp = Math.floor(new Date(manufacturedAt).getTime() / 1000);
      const expiryTimestamp = Math.floor(new Date(expiryAt).getTime() / 1000);
      const tx = await contract.registerProduct(productId, certificateHash, productName, batchNumber, manufacturerName, mfgTimestamp, expiryTimestamp);
      await tx.wait();
      onStatus(
        `Product registered successfully: ${productSeed}`,
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
      onStatus(`Product ${productSeed} advanced to next stage.`);
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
        name: p.name,
        batchNumber: p.batchNumber,
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
        manufacturedAt: new Date(Number(p.manufacturedAt) * 1000).toLocaleString(),
        expiryAt: new Date(Number(p.expiryAt) * 1000).toLocaleString(),
      });
      onStatus(`Product data loaded: ${productSeed}`);
    });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="govt-card">
        <div className="govt-card-header">Register New Product</div>
        {!hasRole && (
          <p className="text-sm text-govt-red font-bold mb-3">
            NO MANUFACTURER ROLE DETECTED
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="govt-form-group">
            <label htmlFor="mfgProductSeed">Product Identification Seed</label>
            <input
              id="mfgProductSeed"
              value={productSeed}
              onChange={(e) => setProductSeed(e.target.value)}
              placeholder="e.g. batch-2024-001"
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="mfgProductName">Product Name</label>
            <input
              id="mfgProductName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Aspirin 500mg"
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="mfgBatchNumber">Batch Number</label>
            <input
              id="mfgBatchNumber"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. BATCH-2024-001"
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="mfgManufacturerName">Manufacturer Name</label>
            <input
              id="mfgManufacturerName"
              value={manufacturerName}
              onChange={(e) => setManufacturerName(e.target.value)}
              placeholder="e.g. PharmaCo Ltd."
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="mfgManufacturedAt">Manufacturing Date</label>
            <input
              id="mfgManufacturedAt"
              type="date"
              value={manufacturedAt}
              onChange={(e) => setManufacturedAt(e.target.value)}
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="mfgExpiryAt">Expiry Date</label>
            <input
              id="mfgExpiryAt"
              type="date"
              value={expiryAt}
              onChange={(e) => setExpiryAt(e.target.value)}
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="mfgCertificateSource">Certificate Source / CID</label>
            <input
              id="mfgCertificateSource"
              value={certificateSource}
              onChange={(e) => setCertificateSource(e.target.value)}
              placeholder="Manual CID or text"
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="mfgFileUpload">Upload Certificate to IPFS</label>
            <input
              id="mfgFileUpload"
              type="file"
              onChange={(e) =>
                void uploadCertificate(e.target.files?.[0] ?? null)
              }
              className="govt-input"
            />
          </div>
        </div>
        {productId && (
          <div className="bg-govt-gray-light border border-govt-border p-3 mt-3">
            <p className="text-xs font-mono break-all">
              <span className="font-bold">Product ID:</span> {productId}
            </p>
            {certificateHash && (
              <p className="text-xs font-mono break-all mt-1">
                <span className="font-bold">Certificate Hash:</span> {certificateHash}
              </p>
            )}
            {uploadedCid && (
              <p className="text-xs font-mono break-all mt-1">
                <span className="font-bold">IPFS CID:</span> {uploadedCid}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={registerProduct}
          className="govt-btn govt-btn-primary mt-4"
        >
          Register Product
        </button>
      </div>

      <div className="govt-card">
        <div className="govt-card-header">Advance Product Stage</div>
        <div className="grid gap-3">
          <div className="govt-form-group">
            <label htmlFor="advProductSeed">Product Identification Seed</label>
            <input
              id="advProductSeed"
              value={productSeed}
              onChange={(e) => setProductSeed(e.target.value)}
              placeholder="Same seed as registration"
              className="govt-input"
            />
          </div>
          <div className="govt-form-group">
            <label htmlFor="advNextCustodian">Next Custodian Address</label>
            <input
              id="advNextCustodian"
              value={nextCustodian}
              onChange={(e) => setNextCustodian(e.target.value)}
              placeholder="0x... (leave empty for self)"
              className="govt-input"
            />
          </div>
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
        {snapshot && (
          <div className="mt-4 border border-govt-border bg-govt-gray-light">
            <p className="bg-govt-blue text-white px-3 py-2 text-sm font-bold">Product Record</p>
            <table className="govt-table">
              <tbody>
                <tr><td className="font-bold w-1/3">Name</td><td>{snapshot.name}</td></tr>
                <tr><td className="font-bold">Batch</td><td>{snapshot.batchNumber}</td></tr>
                <tr><td className="font-bold">Stage</td><td>{snapshot.stage}</td></tr>
                <tr><td className="font-bold">Validation</td><td>{snapshot.validationStatus}</td></tr>
                <tr><td className="font-bold">Approvals</td><td>{snapshot.approvalCount}</td></tr>
                <tr><td className="font-bold">Rejections</td><td>{snapshot.rejectionCount}</td></tr>
                <tr><td className="font-bold">Custodian</td><td className="font-mono text-xs break-all">{snapshot.currentCustodian}</td></tr>
                <tr><td className="font-bold">Mfg Date</td><td>{snapshot.manufacturedAt}</td></tr>
                <tr><td className="font-bold">Expiry</td><td>{snapshot.expiryAt}</td></tr>
                <tr><td className="font-bold">Created</td><td>{snapshot.createdAt}</td></tr>
                <tr><td className="font-bold">Updated</td><td>{snapshot.updatedAt}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
