"use client";

import { useEffect, useMemo, useState } from "react";
import { Contract, ethers } from "ethers";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import {
  getBrowserProvider,
  ensureDemoNetwork,
  switchToDemoNetwork,
  describeContractError,
  getNetworkDisplayName,
} from "@/lib/wallet";

interface UploadResult {
  cid: string;
  fileName: string;
  objectKey: string;
}

interface ProposedProductSnapshot {
  name: string;
  batchNumber: string;
  stage: string;
  validationStatus: string;
  currentCustodian: string;
  approvalCount: string;
  rejectionCount: string;
  certificateHash: string;
  manufacturedAt: string;
  expiryAt: string;
}

export function WalletConsole() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [networkName, setNetworkName] = useState<string>("");
  const [status, setStatus] = useState<string>(
    "Connect your wallet to interact with deployed contracts.",
  );
  const [isWorking, setIsWorking] = useState(false);

  const [productSeed, setProductSeed] = useState("demo-product-001");
  const [productName, setProductName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [manufacturedAt, setManufacturedAt] = useState("");
  const [expiryAt, setExpiryAt] = useState("");
  const [certificateSource, setCertificateSource] = useState("demo-certificate");
  const [nextCustodian, setNextCustodian] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [proposedSnapshot, setProposedSnapshot] =
    useState<ProposedProductSnapshot | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  async function handleSwitchNetwork() {
    try {
      console.log("[wallet-console] handleSwitchNetwork:start", {
        configuredAddress: contractConfig.proposedAddress,
        demoChainId: contractConfig.demoChainId,
      });
      await switchToDemoNetwork();
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      await ensureDemoNetwork(provider);
      setAccount(await signer.getAddress());
      const network = await provider.getNetwork();
      setNetworkName(`${getNetworkDisplayName(network)} (${network.chainId.toString()})`);
      setStatus(
        `Wallet connected on ${contractConfig.demoChainName}. Note: Transactions use test ETH, not mainnet ETH.`,
      );
    } catch (error) {
      console.error("[wallet-console] handleSwitchNetwork:error", error);
      setStatus(error instanceof Error ? error.message : "Network switch failed.");
    }
  }

  const productId = useMemo(
    () => ethers.id(productSeed || "demo-product-001"),
    [productSeed],
  );
  const certificateHash = useMemo(
    () => ethers.id(uploadResult?.cid || certificateSource || "demo-certificate"),
    [certificateSource, uploadResult],
  );

  async function connectWallet() {
    try {
      console.log("[wallet-console] connectWallet:start", {
        configuredAddress: contractConfig.proposedAddress,
        demoChainId: contractConfig.demoChainId,
        demoChainName: contractConfig.demoChainName,
      });
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      await ensureDemoNetwork(provider);

      setAccount(await signer.getAddress());
      const network = await provider.getNetwork();
      setNetworkName(`${getNetworkDisplayName(network)} (${network.chainId.toString()})`);
      console.log("[wallet-console] connectWallet:network", {
        chainId: Number(network.chainId),
      });
      setStatus(
        `Wallet connected on ${contractConfig.demoChainName}. Note: Transactions use test ETH, not mainnet ETH.`,
      );
    } catch (error) {
      console.error("[wallet-console] connectWallet:error", error);
      setStatus(describeContractError(error));
    }
  }

  async function withProposedContract(
    action: (contract: Contract) => Promise<void>,
  ) {
    if (!contractConfig.proposedAddress) {
      setStatus(
        "Proposed contract address is not configured. Set NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS.",
      );
      return;
    }

    setIsWorking(true);

    try {
      console.log("[wallet-console] withProposedContract:start", {
        configuredAddress: contractConfig.proposedAddress,
      });
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new Contract(
        contractConfig.proposedAddress,
        proposedAbi,
        signer,
      );
      console.log("[wallet-console] withProposedContract:contract-created", {
        target: contract.target,
      });
      await action(contract);
    } catch (error) {
      console.error("[wallet-console] withProposedContract:error", error);
      setStatus(describeContractError(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function uploadEvidence(file: File | null) {
    if (!file) return;

    setIsWorking(true);
    setStatus(`Uploading ${file.name} to Filebase IPFS...`);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadResult & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "IPFS upload failed.");
      }

      setUploadResult(payload);
      setCertificateSource(payload.cid);
      setStatus(`File uploaded successfully. CID: ${payload.cid}`);
    } catch (error) {
      setStatus(describeContractError(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function refreshProposedSnapshot() {
    await withProposedContract(async (contract) => {
      const summary = await contract.getProductSummary(productId);
      setProposedSnapshot({
        name: summary.name,
        batchNumber: summary.batchNumber,
        stage: summary.stage.toString(),
        validationStatus: summary.validationStatus.toString(),
        currentCustodian: summary.currentCustodian,
        approvalCount: summary.approvalCount.toString(),
        rejectionCount: summary.rejectionCount.toString(),
        certificateHash: summary.certificateHash,
        manufacturedAt: new Date(Number(summary.manufacturedAt) * 1000).toLocaleString(),
        expiryAt: new Date(Number(summary.expiryAt) * 1000).toLocaleString(),
      });
      setStatus(`Product summary loaded successfully.`);
    });
  }

  return (
    <div className="py-4">
      <div className="govt-section">
        <div className="govt-section-header flex items-center justify-between">
          <span>Wallet Console — Contract Interaction Panel</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={connectWallet}
              className="govt-btn govt-btn-primary text-xs py-1.5"
            >
              {account ? "Reconnect Wallet" : "Connect MetaMask"}
            </button>
            <button
              type="button"
              onClick={handleSwitchNetwork}
              className="govt-btn govt-btn-secondary text-xs py-1.5"
            >
              Switch to {contractConfig.demoChainName.toUpperCase()}
            </button>
          </div>
        </div>
        <div className="govt-section-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border border-govt-border bg-govt-gray-light p-3">
              <p className="text-xs font-bold text-govt-gray-dark">Connected Wallet</p>
              <p className="text-sm font-mono break-all mt-1">
                {account || "NOT CONNECTED"}
              </p>
              <p className="text-xs text-govt-gray-dark mt-1">
                {networkName || "NO NETWORK DETECTED"}
              </p>
            </div>
            <div className="border border-govt-border bg-govt-gray-light p-3">
              <p className="text-xs font-bold text-govt-gray-dark">Proposed Contract Address</p>
              <p className="text-sm font-mono break-all mt-1">
                {contractConfig.proposedAddress || "NOT CONFIGURED"}
              </p>
            </div>
          </div>

          <div className="govt-status-bar mb-4">
            STATUS: {status}
          </div>

          <h3 className="text-sm font-bold text-govt-blue mb-3 border-b border-govt-border pb-2">
            Proposed Contract — Product Registration Form
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="govt-form-group">
              <label htmlFor="productSeed">Product Identification Seed</label>
              <input
                id="productSeed"
                value={productSeed}
                onChange={(e) => setProductSeed(e.target.value)}
                className="govt-input"
              />
            </div>
            <div className="govt-form-group">
              <label htmlFor="productName">Product Name</label>
              <input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Aspirin 500mg"
                className="govt-input"
              />
            </div>
            <div className="govt-form-group">
              <label htmlFor="batchNumber">Batch Number</label>
              <input
                id="batchNumber"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. BATCH-2024-001"
                className="govt-input"
              />
            </div>
            <div className="govt-form-group">
              <label htmlFor="manufacturerName">Manufacturer Name</label>
              <input
                id="manufacturerName"
                value={manufacturerName}
                onChange={(e) => setManufacturerName(e.target.value)}
                placeholder="e.g. PharmaCo Ltd."
                className="govt-input"
              />
            </div>
            <div className="govt-form-group">
              <label htmlFor="manufacturedAt">Manufacturing Date</label>
              <input
                id="manufacturedAt"
                type="date"
                value={manufacturedAt}
                onChange={(e) => setManufacturedAt(e.target.value)}
                className="govt-input"
              />
            </div>
            <div className="govt-form-group">
              <label htmlFor="expiryAt">Expiry Date</label>
              <input
                id="expiryAt"
                type="date"
                value={expiryAt}
                onChange={(e) => setExpiryAt(e.target.value)}
                className="govt-input"
              />
            </div>
            <div className="govt-form-group">
              <label htmlFor="certificateSource">Certificate Source / IPFS CID</label>
              <input
                id="certificateSource"
                value={certificateSource}
                onChange={(e) => setCertificateSource(e.target.value)}
                className="govt-input"
              />
            </div>
            <div className="govt-form-group">
              <label htmlFor="nextCustodian">Next Custodian Address</label>
              <input
                id="nextCustodian"
                value={nextCustodian}
                onChange={(e) => setNextCustodian(e.target.value)}
                className="govt-input"
                placeholder="0x..."
              />
            </div>
          </div>

          <div className="govt-form-group">
            <label>Upload Certificate Document to IPFS</label>
            <input
              type="file"
              onChange={(e) => void uploadEvidence(e.target.files?.[0] ?? null)}
              className="govt-input"
            />
          </div>

          <div className="bg-govt-gray-light border border-govt-border p-3 mb-4">
            <p className="text-xs font-mono">
              <span className="font-bold">Product ID:</span><br />
              {productId}
            </p>
            <p className="text-xs font-mono mt-2">
              <span className="font-bold">Certificate Hash:</span><br />
              {certificateHash}
            </p>
            {uploadResult && (
              <p className="text-xs font-mono mt-2">
                <span className="font-bold">IPFS CID:</span><br />
                {uploadResult.cid}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withProposedContract(async (contract) => {
                  if (!productName || !batchNumber || !manufacturedAt || !expiryAt) {
                    setStatus("Please fill in product name, batch number, manufacturing date, and expiry date.");
                    return;
                  }
                  const mfgTimestamp = Math.floor(new Date(manufacturedAt).getTime() / 1000);
                  const expiryTimestamp = Math.floor(new Date(expiryAt).getTime() / 1000);
                  const tx = await contract.registerProduct(productId, certificateHash, productName, batchNumber, manufacturerName, mfgTimestamp, expiryTimestamp);
                  await tx.wait();
                  setStatus(`Product registered successfully. ID: ${productId.slice(0, 10)}...`);
                })
              }
              className="govt-btn govt-btn-primary"
            >
              Register Product
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withProposedContract(async (contract) => {
                  const tx = await contract.advanceStage(
                    productId,
                    nextCustodian || account || ethers.ZeroAddress,
                  );
                  await tx.wait();
                  setStatus(`Product advanced to next stage successfully.`);
                })
              }
              className="govt-btn govt-btn-secondary"
            >
              Advance Stage
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withProposedContract(async (contract) => {
                  const tx = await contract.approveProduct(productId);
                  await tx.wait();
                  const summary = await contract.getProductSummary(productId);
                  setStatus(
                    `Approval recorded. Validation Status: ${summary.validationStatus.toString()}, Approvals: ${summary.approvalCount.toString()}`,
                  );
                })
              }
              className="govt-btn govt-btn-success"
            >
              Approve Product
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withProposedContract(async (contract) => {
                  const tx = await contract.rejectProduct(productId);
                  await tx.wait();
                  setStatus(`Rejection recorded for product.`);
                })
              }
              className="govt-btn govt-btn-danger"
            >
              Reject Product
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void refreshProposedSnapshot()}
              className="govt-btn govt-btn-secondary"
            >
              Read Summary
            </button>
          </div>

          {proposedSnapshot && (
            <div className="mt-4 border border-govt-border bg-govt-gray-light">
              <h4 className="bg-govt-blue text-white px-3 py-2 text-sm font-bold">
                Product Summary Result
              </h4>
              <table className="govt-table">
                <tbody>
                  <tr>
                    <td className="font-bold w-1/3">Product Name</td>
                    <td>{proposedSnapshot.name}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Batch Number</td>
                    <td>{proposedSnapshot.batchNumber}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Stage</td>
                    <td>{proposedSnapshot.stage}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Validation Status</td>
                    <td>{proposedSnapshot.validationStatus}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Approvals</td>
                    <td>{proposedSnapshot.approvalCount}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Rejections</td>
                    <td>{proposedSnapshot.rejectionCount}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Current Custodian</td>
                    <td className="font-mono text-xs break-all">{proposedSnapshot.currentCustodian}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Manufacturing Date</td>
                    <td>{proposedSnapshot.manufacturedAt}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Expiry Date</td>
                    <td>{proposedSnapshot.expiryAt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="govt-section">
          <div className="govt-section-header">Demo Guidelines</div>
          <div className="govt-section-body text-sm">
            <p>
              Use a wallet with the correct role assignment on the deployed contract. If MetaMask
              displays ETH balance, note that this is test ETH on {contractConfig.demoChainName},
              not mainnet ETH. Ensure proper role assignment before attempting contract operations.
            </p>
          </div>
        </div>
        <div className="govt-section">
          <div className="govt-section-header">IPFS Storage Information</div>
          <div className="govt-section-body text-sm">
            <p>
              Certificate file uploads use the Filebase IPFS RPC API. The returned Content
              Identifier (CID) is hashed client-side and stored as the on-chain certificate field.
              Original documents remain accessible via IPFS gateways.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
