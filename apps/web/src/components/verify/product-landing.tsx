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
  if (msg.includes("unknownproduct")) return "Product not found on the contract. It may not have been registered yet.";
  if (msg.includes("timeout")) return "Network request timed out. The RPC endpoint may be slow.";
  if (msg.includes("network")) return "Network error. Cannot connect to Sepolia RPC.";
  return err.message;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: number }) {
  if (status === 1) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Approved
      </span>
    );
  }
  if (status === 2) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
      Pending Review
    </span>
  );
}

function StageTracker({ currentStage }: { currentStage: number }) {
  return (
    <div className="flex items-center justify-between">
      {STAGE_LABELS.map((label, i) => {
        const isDone = i < currentStage;
        const isCurrent = i === currentStage;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium ${
                  isCurrent ? "text-blue-600" : isDone ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STAGE_LABELS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  i < currentStage ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
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

export function ProductLanding({ seed }: { seed: string }) {
  const hasSeed = Boolean(seed && contractConfig.proposedAddress);
  const [state, dispatch] = useReducer(
    fetchReducer,
    hasSeed
      ? { status: "loading" as const, product: null, error: null }
      : { status: "idle" as const, product: null, error: "No product seed specified." },
  );
  const [showDetails, setShowDetails] = useState(false);

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-6 sm:py-10">

        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-medium tracking-widest text-gray-400 transition-colors hover:text-blue-600"
          >
            ETHICAL SUPPLY CHAIN
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-gray-900">
            Product Verification
          </h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">
              Loading product data from the blockchain...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-12 rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="mt-4 text-base font-semibold text-gray-900">Product Not Found</h2>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <Link
              href="/verify"
              className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              Try Manual Lookup
            </Link>
          </div>
        )}

        {/* Product Card */}
        {product && (
          <div className="mt-6 space-y-4">

            {/* Main Info Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900">
                    {product.name || "Unnamed Product"}
                  </h2>
                  {product.manufacturerName && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      by {product.manufacturerName}
                    </p>
                  )}
                </div>
                <StatusBadge status={product.validationStatus} />
              </div>

              {isExpired && (
                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  This product has passed its expiry date.
                </div>
              )}
            </div>

            {/* Key Details */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400">Batch Number</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {product.batchNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Product Seed</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{seed}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Manufactured</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatDate(product.manufacturedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Expires</p>
                  <p className={`mt-1 text-sm font-semibold ${isExpired ? "text-red-600" : "text-gray-900"}`}>
                    {formatDate(product.expiryAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Authority Validation */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Authority Validation</h3>
              <div className="mt-3 flex gap-3">
                <div className="flex-1 rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{product.approvalCount}</p>
                  <p className="mt-0.5 text-xs font-medium text-emerald-600">
                    Approval{product.approvalCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-1 rounded-xl bg-red-50 p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{product.rejectionCount}</p>
                  <p className="mt-0.5 text-xs font-medium text-red-600">
                    Rejection{product.rejectionCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Supply Chain Stage */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Supply Chain Stage</h3>
              <div className="mt-4">
                <StageTracker currentStage={product.stage} />
              </div>
            </div>

            {/* Collapsible Technical Details */}
            <div className="rounded-2xl bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">Technical Details</span>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${showDetails ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showDetails && (
                <div className="border-t border-gray-100 px-6 pb-5 pt-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-400">Product ID</p>
                      <p className="mt-1 break-all font-mono text-xs text-gray-600">{productId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Certificate Hash</p>
                      <p className="mt-1 break-all font-mono text-xs text-gray-600">{product.certificateHash}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Current Custodian</p>
                      <p className="mt-1 break-all font-mono text-xs text-gray-600">{product.currentCustodian}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Network</p>
                      <p className="mt-1 text-xs text-gray-600">Sepolia Testnet (Chain 11155111)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Note */}
            <p className="px-2 text-center text-xs text-gray-400">
              Data read directly from the Ethereum blockchain. No wallet required.
            </p>
          </div>
        )}

        {/* Bottom Nav */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/verify"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-blue-600"
          >
            Manual Lookup →
          </Link>
        </div>
      </div>
    </main>
  );
}
