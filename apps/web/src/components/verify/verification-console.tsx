"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Contract, ethers } from "ethers";
import QRCode from "qrcode";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import { getBrowserProvider, ensureDemoNetwork } from "@/lib/wallet";

const STAGES = ["Created", "Manufactured", "Distributed", "Retail", "Sold"];

function StatusBadge({ status }: { status: number }) {
  if (status === 1) {
    return (
      <span className="govt-badge govt-badge-success">APPROVED</span>
    );
  }
  if (status === 2) {
    return (
      <span className="govt-badge govt-badge-danger">REJECTED</span>
    );
  }
  return (
    <span className="govt-badge govt-badge-warning">PENDING REVIEW</span>
  );
}

export function VerificationConsole() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Connect MetaMask wallet to read the deployed contract.");
  const [productSeed, setProductSeed] = useState(
    searchParams.get("seed") || "demo-product-001",
  );
  const [proposedResult, setProposedResult] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [certificateCidInput, setCertificateCidInput] = useState("");

  const productId = useMemo(
    () => ethers.id(productSeed || "demo-product-001"),
    [productSeed],
  );

  const qrLink = useMemo(() => {
    const params = new URLSearchParams({ seed: productSeed });
    if (certificateCidInput.trim()) {
      params.set("cid", certificateCidInput.trim());
    }
    if (typeof window === "undefined") return `/verify?${params.toString()}`;
    return `${window.location.origin}/verify?${params.toString()}`;
  }, [productSeed, certificateCidInput]);

  useEffect(() => {
    void QRCode.toDataURL(qrLink, { margin: 1, width: 220 }).then(setQrDataUrl);
  }, [qrLink]);

  async function readProposed() {
    if (!contractConfig.proposedAddress) {
      setStatus("Proposed contract address is not configured.");
      return;
    }

    setIsLoading(true);

    try {
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractConfig.proposedAddress, proposedAbi, signer);
      const summary = await contract.getProductSummary(productId);

      setProposedResult({
        productId,
        name: summary.name,
        batchNumber: summary.batchNumber,
        stage: summary.stage.toString(),
        validationStatus: summary.validationStatus.toString(),
        currentCustodian: summary.currentCustodian,
        approvalCount: summary.approvalCount.toString(),
        rejectionCount: summary.rejectionCount.toString(),
        certificateHash: summary.certificateHash,
        manufacturedAt: new Date(Number(summary.manufacturedAt) * 1000).toLocaleDateString(),
        expiryAt: new Date(Number(summary.expiryAt) * 1000).toLocaleDateString(),
      });
      setStatus(`Product data loaded successfully for seed: ${productSeed}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to read product data.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="py-4">
      <div className="govt-section">
        <div className="govt-section-header flex items-center gap-2">
          <span className="h-2 w-2 bg-govt-saffron" />
          Product Verification Portal
        </div>
        <div className="govt-section-body">
          <p className="text-sm mb-4">
            Search for any registered product in the Ethical Supply Chain system. Enter the product
            identification seed or scan the QR code on the product packaging. This is a read-only
            query — no blockchain transaction is required.
          </p>

          <div className="govt-status-bar mb-4">
            STATUS: {status}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-govt-blue mb-3 border-b border-govt-border pb-2">
                Product Search
              </h3>
              <div className="govt-form-group">
                <label htmlFor="productSeed">Product Identification Seed</label>
                <input
                  id="productSeed"
                  type="text"
                  value={productSeed}
                  onChange={(e) => setProductSeed(e.target.value)}
                  className="govt-input"
                  placeholder="e.g. demo-product-001"
                />
              </div>
              <div className="govt-form-group">
                <label htmlFor="certificateCid">Certificate CID (optional for PDF preview)</label>
                <input
                  id="certificateCid"
                  type="text"
                  value={certificateCidInput}
                  onChange={(e) => setCertificateCidInput(e.target.value)}
                  className="govt-input"
                  placeholder="e.g. Qm..."
                />
              </div>
              <div className="bg-govt-gray-light border border-govt-border p-3 mb-4">
                <p className="text-xs font-mono break-all">
                  <span className="font-bold">Derived Product ID:</span><br />
                  {productId}
                </p>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void readProposed()}
                className="govt-btn govt-btn-primary"
              >
                {isLoading ? "Searching..." : "Search Product"}
              </button>

              {proposedResult && (
                <div className="mt-4 border border-govt-border bg-govt-gray-light">
                  <h4 className="bg-govt-blue text-white px-3 py-2 text-sm font-bold">
                    Product Details
                  </h4>
                  <table className="govt-table">
                    <tbody>
                      <tr>
                        <td className="font-bold w-1/3">Product Name</td>
                        <td>{proposedResult.name || "—"}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Batch Number</td>
                        <td>{proposedResult.batchNumber || "—"}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Current Stage</td>
                        <td>
                          Stage {proposedResult.stage} —{" "}
                          {STAGES[Number(proposedResult.stage)] || "Unknown"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">Validation Status</td>
                        <td>
                          <StatusBadge status={Number(proposedResult.validationStatus)} />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">Approvals</td>
                        <td>{proposedResult.approvalCount}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Rejections</td>
                        <td>{proposedResult.rejectionCount}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Current Custodian</td>
                        <td className="font-mono text-xs break-all">{proposedResult.currentCustodian}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Manufacturing Date</td>
                        <td>{proposedResult.manufacturedAt}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Expiry Date</td>
                        <td>{proposedResult.expiryAt}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Certificate Hash</td>
                        <td className="font-mono text-xs break-all">{proposedResult.certificateHash}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-govt-blue mb-3 border-b border-govt-border pb-2">
                QR Code Verification
              </h3>
                <p className="text-sm text-govt-gray-dark mb-4">
                  Scan this QR code using a mobile device to open the product verification page
                  with the current product seed and certificate CID pre-filled.
                </p>
              <div className="flex flex-col items-start gap-4">
                {qrDataUrl ? (
                  <div className="border border-govt-border bg-white p-3 inline-block">
                    <img
                      src={qrDataUrl}
                      alt="QR code for verification"
                      width={200}
                      height={200}
                    />
                  </div>
                ) : (
                  <div className="flex h-[200px] w-[200px] items-center justify-center border border-govt-border bg-white text-sm text-govt-gray-dark">
                    Generating QR Code...
                  </div>
                )}
                <div className="w-full">
                  <label className="text-xs font-bold text-govt-gray-dark">Verification URL</label>
                  <p className="text-xs font-mono break-all bg-govt-gray-light border border-govt-border p-2 mt-1">
                    {qrLink}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="govt-section">
          <div className="govt-section-header">How Verification Works</div>
          <div className="govt-section-body text-sm">
            <p>
              Enter a human-readable product identification seed. The system computes the keccak256
              hash of the seed to derive the on-chain product ID. Product data is read directly from
              the deployed smart contract on the Sepolia testnet.
            </p>
          </div>
        </div>
        <div className="govt-section">
          <div className="govt-section-header">Usage Guidelines</div>
          <div className="govt-section-body text-sm">
            <p>
              This verification portal is intended for demonstration and public transparency purposes.
              No wallet connection or transaction submission is required for product lookup. Results
              reflect the current on-chain state at the time of query.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
