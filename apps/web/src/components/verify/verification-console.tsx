"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Contract, ethers } from "ethers";
import QRCode from "qrcode";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import { getBrowserProvider, ensureDemoNetwork } from "@/lib/wallet";

export function VerificationConsole() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Connect MetaMask to read the deployed contract.");
  const [productSeed, setProductSeed] = useState(
    searchParams.get("seed") || "demo-product-001",
  );
  const [proposedResult, setProposedResult] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const productId = useMemo(
    () => ethers.id(productSeed || "demo-product-001"),
    [productSeed],
  );

  const qrLink = useMemo(() => {
    const params = new URLSearchParams({ seed: productSeed });
    if (typeof window === "undefined") return `/verify?${params.toString()}`;
    return `${window.location.origin}/verify?${params.toString()}`;
  }, [productSeed]);

  useEffect(() => {
    void QRCode.toDataURL(qrLink, { margin: 1, width: 220 }).then(setQrDataUrl);
  }, [qrLink]);

  async function readProposed() {
    if (!contractConfig.proposedAddress) {
      setStatus("Proposed contract address is missing.");
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
        stage: summary.stage.toString(),
        validationStatus: summary.validationStatus.toString(),
        currentCustodian: summary.currentCustodian,
        approvalCount: summary.approvalCount.toString(),
        rejectionCount: summary.rejectionCount.toString(),
        certificateHash: summary.certificateHash,
      });
      setStatus(`Loaded product ${productSeed}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to read product.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="border border-line bg-panel">
      <div className="border-b border-line px-6 py-5">
        <p className="font-data text-muted">PUBLIC VERIFICATION</p>
        <h1 className="font-display mt-2 text-5xl">VERIFY PRODUCT</h1>
        <p className="mt-3 max-w-lg text-sm text-muted">
          Look up any product on the Ethical Supply Chain contract. No transaction
          required — read-only query against the deployed Sepolia contract.
        </p>
      </div>

      <div className="border-b border-line bg-foreground px-6 py-3">
        <p className="font-data text-background">STATUS : {status}</p>
      </div>

      <div className="grid border-b border-line lg:grid-cols-2">
        <div className="border-r border-line p-6">
          <p className="font-data text-muted">PRODUCT LOOKUP</p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="font-data text-muted">PRODUCT SEED</span>
              <input
                value={productSeed}
                onChange={(e) => setProductSeed(e.target.value)}
                className="border border-line bg-panel px-3 py-2 font-data text-foreground"
              />
            </label>
            <div className="border border-line-muted bg-panel-alt px-3 py-2">
              <p className="break-all font-data text-muted">
                DERIVED ID : {productId}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void readProposed()}
            className="mt-4 border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
          >
            READ PRODUCT
          </button>

          {proposedResult && (
            <div className="mt-4 border border-line bg-panel-alt p-4">
              <div className="grid gap-1 font-data text-sm">
                {Object.entries(proposedResult).map(([key, value]) => (
                  <p key={key}>
                    <span className="text-muted">{key.toUpperCase()} :</span>{" "}
                    <span className="text-foreground">{value}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <p className="font-data text-muted">QR VERIFICATION LINK</p>
          <p className="mt-2 text-sm text-muted">
            Scan this QR code to open the verification page with the current product
            seed pre-filled.
          </p>
          <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR code for verification"
                width={220}
                height={220}
                className="border border-line bg-white p-3"
              />
            ) : (
              <div className="flex h-[220px] w-[220px] items-center justify-center border border-line bg-white font-data text-muted">
                GENERATING...
              </div>
            )}
            <div className="space-y-3">
              <p className="max-w-md break-all border border-line-muted bg-panel-alt px-4 py-3 font-data text-sm text-muted">
                {qrLink}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="border-r border-line px-6 py-4">
          <p className="font-data text-foreground">QUERY METHOD</p>
          <p className="mt-2 text-sm text-muted">
            Enter a human-readable seed. The keccak256 hash of the seed is used as
            the on-chain product ID.
          </p>
        </div>
        <div className="px-6 py-4">
          <p className="font-data text-foreground">PANEL USE</p>
          <p className="mt-2 text-sm text-muted">
            Use this page during demos when you need quick proof of recorded state
            without sending a new transaction.
          </p>
        </div>
      </div>
    </section>
  );
}
