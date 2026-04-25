"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import { STAGE_LABELS } from "@/lib/wallet";

const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

interface ProductData {
  name: string;
  batchNumber: string;
  manufacturerName: string;
  stage: number;
  validationStatus: number;
  approvalCount: number;
  rejectionCount: number;
  currentCustodian: string;
  certificateHash: string;
  manufacturedAt: number;
  expiryAt: number;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timed out. Please try again.")), ms);
    promise.then((val) => {
      clearTimeout(timer);
      resolve(val);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function describeError(err: unknown): string {
  if (!(err instanceof Error)) return "Failed to load product data.";
  const msg = err.message.toLowerCase();
  if (msg.includes("unknownproduct")) return "Product not found in registry. It may not have been registered yet.";
  if (msg.includes("timeout")) return "Network request timed out. Please check your connection and try again.";
  if (msg.includes("network")) return "Network error. Cannot connect to blockchain RPC endpoint.";
  return err.message;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: number }) {
  if (status === 1) {
    return (
      <span className="govt-badge govt-badge-success text-sm px-3 py-1">APPROVED</span>
    );
  }
  if (status === 2) {
    return (
      <span className="govt-badge govt-badge-danger text-sm px-3 py-1">REJECTED</span>
    );
  }
  return (
    <span className="govt-badge govt-badge-warning text-sm px-3 py-1">PENDING REVIEW</span>
  );
}

type FetchState =
  | { status: "idle"; product: null; error: string }
  | { status: "loading"; product: null; error: null }
  | { status: "success"; product: ProductData; error: null }
  | { status: "error"; product: null; error: string };

type FetchAction =
  | { type: "fetch" }
  | { type: "success"; product: ProductData }
  | { type: "error"; error: string };

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case "fetch":
      return { status: "loading", product: null, error: null };
    case "success":
      return { status: "success", product: action.product, error: null };
    case "error":
      return { status: "error", product: null, error: action.error };
  }
}

export function ProductLanding({
  seed,
  initialCid = "",
}: {
  seed: string;
  initialCid?: string;
}) {
  const hasSeed = Boolean(seed && contractConfig.proposedAddress);
  const [state, dispatch] = useReducer(
    fetchReducer,
    hasSeed
      ? { status: "loading" as const, product: null, error: null }
      : { status: "idle" as const, product: null, error: "No product identification seed specified." },
  );
  const [showDetails, setShowDetails] = useState(false);
  const [certificateCidInput, setCertificateCidInput] = useState(initialCid);

  const productId = useMemo(
    () => ethers.id(seed || "demo-product-001"),
    [seed],
  );

  useEffect(() => {
    if (!seed || !contractConfig.proposedAddress) return;

    let cancelled = false;
    dispatch({ type: "fetch" });

    const provider = new JsonRpcProvider(SEPOLIA_RPC);
    const contract = new Contract(
      contractConfig.proposedAddress!,
      proposedAbi,
      provider,
    );

    withTimeout(contract.getProductSummary(productId), 15000)
      .then((summary) => {
        if (cancelled) return;
        dispatch({
          type: "success",
          product: {
            name: summary.name,
            batchNumber: summary.batchNumber,
            manufacturerName: summary.manufacturerName,
            stage: Number(summary.stage),
            validationStatus: Number(summary.validationStatus),
            approvalCount: Number(summary.approvalCount),
            rejectionCount: Number(summary.rejectionCount),
            currentCustodian: summary.currentCustodian,
            certificateHash: summary.certificateHash,
            manufacturedAt: Number(summary.manufacturedAt),
            expiryAt: Number(summary.expiryAt),
          },
        });
      })
      .catch((err) => {
        if (!cancelled) dispatch({ type: "error", error: describeError(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [seed, productId]);

  const [currentTime] = useState(() => Date.now());
  const { product, error } = state;
  const loading = state.status === "loading";
  const isExpired = product ? product.expiryAt * 1000 < currentTime : false;

  const currentCertificateHash = product?.certificateHash ?? "";
  const normalizedCid = certificateCidInput.trim();
  const hasCertificateCid = normalizedCid.length > 0;
  const certificateUrl = hasCertificateCid
    ? `https://steady-teal-squid.myfilebase.com/ipfs/${normalizedCid}`
    : "";

  return (
    <main className="min-h-screen bg-govt-bg">
      <div className="govt-container px-4 py-4" style={{ maxWidth: "800px" }}>
        <div className="flex items-center gap-2 mb-4 text-xs">
          <Link href="/" className="text-govt-blue hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/verify" className="text-govt-blue hover:underline">
            Verify Product
          </Link>
          <span>/</span>
          <span className="text-govt-gray-dark">Product Details</span>
        </div>

        {loading && (
          <div className="govt-section">
            <div className="govt-section-body text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-govt-border border-t-govt-blue" />
              <p className="mt-4 text-sm text-govt-gray-dark">
                Loading product data from blockchain registry...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="govt-section">
            <div className="govt-section-body text-center py-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <span className="text-2xl text-govt-red">&#9888;</span>
              </div>
              <h2 className="mt-4 text-base font-bold text-govt-blue">Product Not Found in Registry</h2>
              <p className="mt-2 text-sm text-govt-gray-dark">{error}</p>
              <Link
                href="/verify"
                className="govt-btn govt-btn-secondary mt-4 inline-block"
              >
                Try Manual Lookup
              </Link>
            </div>
          </div>
        )}

        {product && (
          <div className="space-y-4">
            <div className="govt-section">
              <div className="govt-section-header flex items-center justify-between">
                <span>Product Information</span>
                <StatusBadge status={product.validationStatus} />
              </div>
              <div className="govt-section-body">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-govt-gray-dark">Product Name</p>
                    <p className="text-base font-bold text-govt-blue">
                      {product.name || "Unnamed Product"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-govt-gray-dark">Manufacturer</p>
                    <p className="text-sm">{product.manufacturerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-govt-gray-dark">Batch Number</p>
                    <p className="text-sm font-mono">{product.batchNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-govt-gray-dark">Product Seed</p>
                    <p className="text-sm font-mono">{seed}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-govt-gray-dark">Manufacturing Date</p>
                    <p className="text-sm">{formatDate(product.manufacturedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-govt-gray-dark">Expiry Date</p>
                    <p className={`text-sm ${isExpired ? "text-govt-red font-bold" : ""}`}>
                      {formatDate(product.expiryAt)}
                      {isExpired && " (EXPIRED)"}
                    </p>
                  </div>
                </div>

                {isExpired && (
                  <div className="mt-4 bg-red-50 border border-govt-red px-3 py-2 text-sm font-bold text-govt-red">
                    WARNING: This product has passed its expiry date and should not be consumed.
                  </div>
                )}
              </div>
            </div>

            <div className="govt-section">
              <div className="govt-section-header">Supply Chain Stage Progress</div>
              <div className="govt-section-body">
                <table className="govt-table">
                  <thead>
                    <tr>
                      <th style={{ width: "10%" }}>#</th>
                      <th>Stage</th>
                      <th style={{ width: "25%" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STAGE_LABELS.map((label, i) => {
                      const isDone = i < product.stage;
                      const isCurrent = i === product.stage;
                      return (
                        <tr key={label} className={isCurrent ? "bg-blue-50" : ""}>
                          <td className="text-center font-bold">{i + 1}</td>
                          <td className="font-bold">{label}</td>
                          <td>
                            {isDone ? (
                              <span className="govt-badge govt-badge-success">Completed</span>
                            ) : isCurrent ? (
                              <span className="govt-badge govt-badge-warning">Current Stage</span>
                            ) : (
                              <span className="text-govt-gray-dark">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="govt-section">
              <div className="govt-section-header">Authority Validation Record</div>
              <div className="govt-section-body">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-govt-green bg-green-50 p-4 text-center">
                    <p className="text-3xl font-bold text-green-700">{product.approvalCount}</p>
                    <p className="text-xs font-bold text-green-700 mt-1">Approvals Received</p>
                  </div>
                  <div className="border border-govt-red bg-red-50 p-4 text-center">
                    <p className="text-3xl font-bold text-red-700">{product.rejectionCount}</p>
                    <p className="text-xs font-bold text-red-700 mt-1">Rejections Recorded</p>
                  </div>
                </div>
                <p className="text-xs text-govt-gray-dark mt-3">
                  Threshold requirement: 2 of 3 authority approvals needed for product validation.
                </p>
              </div>
            </div>

            <div className="govt-section">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-left govt-section-header cursor-pointer hover:bg-govt-blue-light"
              >
                Technical Details {showDetails ? "(Click to Hide)" : "(Click to View)"}
              </button>
              {showDetails && (
                <div className="govt-section-body">
                  <table className="govt-table">
                    <tbody>
                      <tr>
                        <td className="font-bold w-1/3">Product ID (bytes32)</td>
                        <td className="font-mono text-xs break-all">{productId}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Certificate Hash</td>
                        <td className="font-mono text-xs break-all">{product.certificateHash}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Current Custodian Address</td>
                        <td className="font-mono text-xs break-all">{product.currentCustodian}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Network</td>
                        <td>Sepolia Testnet (Chain ID: 11155111)</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Contract Version</td>
                        <td>ESC V1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="govt-section">
              <div className="govt-section-header">Certificate Document (IPFS)</div>
              <div className="govt-section-body">
                <div className="govt-form-group">
                  <label htmlFor="certificateCidInput">Certificate CID</label>
                  <input
                    id="certificateCidInput"
                    type="text"
                    value={certificateCidInput}
                    onChange={(e) => setCertificateCidInput(e.target.value)}
                    placeholder="Paste IPFS CID from upload response"
                    className="govt-input"
                  />
                    <p className="text-xs text-govt-gray-dark mt-2">
                      This certificate preview is loaded from CID in the verification link or manually pasted here.
                    </p>
                </div>

                {!hasCertificateCid && (
                  <div className="border border-govt-border bg-govt-gray-light p-3 text-sm">
                    <p className="text-govt-red font-bold">CID required for preview</p>
                    <p className="text-govt-gray-dark mt-1">
                      Add the certificate CID to load PDF preview from Filebase IPFS.
                    </p>
                    <p className="text-xs mt-2 font-mono break-all">
                      On-chain certificate hash: {currentCertificateHash || "—"}
                    </p>
                  </div>
                )}

                {hasCertificateCid && certificateUrl && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="govt-btn govt-btn-primary"
                      >
                        Open Certificate PDF
                      </a>
                      <p className="text-xs text-govt-gray-dark break-all">CID: {normalizedCid}</p>
                    </div>
                    <div className="border border-govt-border bg-white rounded-sm overflow-hidden">
                      <iframe
                        title="Product certificate preview"
                        src={certificateUrl}
                        className="w-full"
                        style={{ minHeight: "70vh" }}
                      />
                    </div>
                    <p className="text-xs text-govt-gray-dark">
                      On some mobile browsers, inline PDF preview may not be supported. Use &quot;Open Certificate PDF&quot; to view in the device PDF viewer.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-xs text-govt-gray-dark py-2">
              Data read directly from the Ethereum blockchain. No wallet connection required.
            </p>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/verify" className="text-sm text-govt-blue hover:underline">
            Return to Product Lookup
          </Link>
        </div>
      </div>
    </main>
  );
}
