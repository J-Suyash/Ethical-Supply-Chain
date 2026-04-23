"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import { STAGE_LABELS } from "@/lib/wallet";

const SEPOLIA_RPC = "https://rpc.sepolia.org";

interface ProductData {
  name: string;
  batchNumber: string;
  stage: number;
  validationStatus: number;
  approvalCount: number;
  rejectionCount: number;
  currentCustodian: string;
  certificateHash: string;
  manufacturedAt: number;
  expiryAt: number;
}

function StageIndicator({ currentStage }: { currentStage: number }) {
  return (
    <div className="flex items-center gap-1">
      {STAGE_LABELS.map((label, i) => {
        const isActive = i <= currentStage;
        const isCurrent = i === currentStage;
        return (
          <div key={label} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                isCurrent
                  ? "border-accent bg-accent text-white"
                  : isActive
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line-muted bg-panel-alt text-muted"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-1.5 hidden text-xs font-medium sm:inline ${
                isCurrent ? "text-foreground" : isActive ? "text-accent" : "text-muted"
              }`}
            >
              {label}
            </span>
            {i < STAGE_LABELS.length - 1 && (
              <div
                className={`mx-1 h-px w-4 sm:w-6 ${
                  i < currentStage ? "bg-accent" : "bg-line-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ValidationBadge({ status }: { status: number }) {
  if (status === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success bg-success/10 px-3 py-1 font-data text-sm text-success">
        <span className="inline-block h-2 w-2 rounded-full bg-success" />
        APPROVED
      </span>
    );
  }
  if (status === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger bg-danger/10 px-3 py-1 font-data text-sm text-danger">
        <span className="inline-block h-2 w-2 rounded-full bg-danger" />
        REJECTED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted bg-panel-alt px-3 py-1 font-data text-sm text-muted">
      <span className="inline-block h-2 w-2 rounded-full bg-muted" />
      PENDING
    </span>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line-muted py-3 last:border-b-0">
      <span className="font-data text-[10px] tracking-widest text-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

export function ProductLanding({ seed }: { seed: string }) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const productId = useMemo(
    () => ethers.id(seed || "demo-product-001"),
    [seed],
  );

  useEffect(() => {
    if (!seed || !contractConfig.proposedAddress) {
      setLoading(false);
      setError("No product seed specified.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const provider = new JsonRpcProvider(SEPOLIA_RPC);
        const contract = new Contract(
          contractConfig.proposedAddress!,
          proposedAbi,
          provider,
        );
        const summary = await contract.getProductSummary(productId);

        if (cancelled) return;

        setProduct({
          name: summary.name,
          batchNumber: summary.batchNumber,
          stage: Number(summary.stage),
          validationStatus: Number(summary.validationStatus),
          approvalCount: Number(summary.approvalCount),
          rejectionCount: Number(summary.rejectionCount),
          currentCustodian: summary.currentCustodian,
          certificateHash: summary.certificateHash,
          manufacturedAt: Number(summary.manufacturedAt),
          expiryAt: Number(summary.expiryAt),
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load product data.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [seed, productId]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "—";
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = product ? product.expiryAt * 1000 < Date.now() : false;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col">
        <header className="border-b border-line px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="font-data text-xs tracking-widest text-muted hover:text-accent">
                ETHICAL SUPPLY CHAIN
              </Link>
              <h1 className="font-display mt-1 text-3xl md:text-4xl">PRODUCT VERIFICATION</h1>
            </div>
            <a
              href="/verify"
              className="border border-line bg-panel px-4 py-2 font-data text-xs text-foreground transition-colors hover:bg-panel-alt"
            >
              MANUAL LOOKUP
            </a>
          </div>
        </header>

        <div className="border-b border-line bg-foreground px-6 py-3">
          <p className="font-data text-[11px] tracking-widest text-background">
            SEED : {seed || "—"} &nbsp;|&nbsp; ID : {productId.slice(0, 18)}...
          </p>
        </div>

        {loading && (
          <div className="px-6 py-16 text-center">
            <p className="font-data text-muted">LOADING PRODUCT DATA...</p>
          </div>
        )}

        {error && (
          <div className="border-b border-line bg-danger/5 px-6 py-8 text-center">
            <p className="font-data text-danger">ERROR</p>
            <p className="mt-2 text-sm text-danger/80">{error}</p>
          </div>
        )}

        {product && (
          <>
            <section className="border-b border-line px-6 py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-4xl">
                    {product.name || "Unnamed Product"}
                  </h2>
                  <p className="mt-1 font-data text-xs text-muted">
                    BATCH {product.batchNumber || "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ValidationBadge status={product.validationStatus} />
                  {isExpired && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-danger bg-danger/10 px-3 py-1 font-data text-sm text-danger">
                      EXPIRED
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <p className="font-data text-[10px] tracking-widest text-muted">
                  SUPPLY CHAIN STAGE
                </p>
                <div className="mt-3">
                  <StageIndicator currentStage={product.stage} />
                </div>
              </div>
            </section>

            <section className="border-b border-line">
              <div className="grid md:grid-cols-2">
                <div className="border-b border-line px-6 py-0 md:border-b-0 md:border-r">
                  <p className="pt-3 font-data text-[10px] tracking-widest text-muted">
                    PRODUCT DETAILS
                  </p>
                  <FieldRow label="MANUFACTURED" value={formatDate(product.manufacturedAt)} />
                  <FieldRow label="EXPIRY DATE" value={formatDate(product.expiryAt)} />
                  <FieldRow label="BATCH NUMBER" value={product.batchNumber} />
                  <FieldRow
                    label="CERTIFICATE HASH"
                    value={product.certificateHash.slice(0, 18) + "..."}
                  />
                </div>
                <div className="px-6 py-0">
                  <p className="pt-3 font-data text-[10px] tracking-widest text-muted">
                    AUTHORITY VALIDATION
                  </p>
                  <FieldRow
                    label="APPROVALS"
                    value={`${product.approvalCount} authority${product.approvalCount !== 1 ? "s" : ""}`}
                  />
                  <FieldRow
                    label="REJECTIONS"
                    value={`${product.rejectionCount} authority${product.rejectionCount !== 1 ? "s" : ""}`}
                  />
                  <FieldRow
                    label="CURRENT CUSTODIAN"
                    value={`${product.currentCustodian.slice(0, 8)}...${product.currentCustodian.slice(-6)}`}
                  />
                </div>
              </div>
            </section>

            <section className="px-6 py-6">
              <div className="rounded border border-line bg-panel-alt px-4 py-3">
                <p className="font-data text-[10px] tracking-widest text-muted">
                  PRODUCT ID
                </p>
                <p className="mt-1 break-all font-mono text-xs text-foreground">
                  {productId}
                </p>
              </div>
            </section>
          </>
        )}

        <footer className="border-t border-line px-6 py-6">
          <div className="flex items-center justify-between">
            <span className="font-data text-xs text-muted">
              SEPOLIA : CHAIN 11155111
            </span>
            <span className="font-data text-xs text-muted">ESC V1</span>
          </div>
        </footer>
      </div>
    </main>
  );
}