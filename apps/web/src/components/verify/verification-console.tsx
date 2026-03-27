"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BrowserProvider, Contract, ethers } from "ethers";
import QRCode from "qrcode";
import { basePaperAbi, contractConfig, proposedAbi } from "@/lib/contracts";

async function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required for verification reads in the browser.");
  }

  const provider = new BrowserProvider(window.ethereum as ethers.Eip1193Provider);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

async function ensureDemoNetwork(provider: BrowserProvider) {
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== contractConfig.demoChainId) {
    throw new Error(
      `Wrong network. Switch MetaMask to ${contractConfig.demoChainName} (chain id ${contractConfig.demoChainId}).`,
    );
  }

  return network;
}

interface VerificationConsoleProps {
  initialBaseUpc?: string;
  initialProductSeed?: string;
}

export function VerificationConsole({
  initialBaseUpc = "1",
  initialProductSeed = "demo-product-001",
}: VerificationConsoleProps) {
  const [status, setStatus] = useState("Connect MetaMask to read the deployed contracts.");
  const [baseUpc, setBaseUpc] = useState(initialBaseUpc);
  const [productSeed, setProductSeed] = useState(initialProductSeed);
  const [baseResult, setBaseResult] = useState<Record<string, string> | null>(null);
  const [proposedResult, setProposedResult] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const qrLink = useMemo(() => {
    const params = new URLSearchParams({
      upc: baseUpc,
      seed: productSeed,
    });

    if (typeof window === "undefined") {
      return `/verify?${params.toString()}`;
    }

    return `${window.location.origin}/verify?${params.toString()}`;
  }, [baseUpc, productSeed]);

  useEffect(() => {
    void QRCode.toDataURL(qrLink, {
      margin: 1,
      width: 220,
    }).then(setQrDataUrl);
  }, [qrLink]);

  async function readBase() {
    if (!contractConfig.basePaperAddress) {
      setStatus("Base contract address is missing from NEXT_PUBLIC_BASE_CONTRACT_ADDRESS.");
      return;
    }

    setIsLoading(true);

    try {
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractConfig.basePaperAddress, basePaperAbi, signer);
      const product = await contract.getProduct(BigInt(baseUpc));

      setBaseResult({
        upc: baseUpc,
        name: product.name,
        details: product.details,
        state: product.stateLabel,
        owner: product.owner,
        buyer: product.buyer,
        price: product.price.toString(),
      });
      setStatus(`Loaded base-paper medicine ${baseUpc}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to read base-paper product.");
    } finally {
      setIsLoading(false);
    }
  }

  async function readProposed() {
    if (!contractConfig.proposedAddress) {
      setStatus("Proposed contract address is missing from NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS.");
      return;
    }

    setIsLoading(true);

    try {
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractConfig.proposedAddress, proposedAbi, signer);
      const summary = await contract.getProductSummary(ethers.id(productSeed));

      setProposedResult({
        productId: ethers.id(productSeed),
        stage: summary.stage.toString(),
        validationStatus: summary.validationStatus.toString(),
        currentCustodian: summary.currentCustodian,
        approvalCount: summary.approvalCount.toString(),
        rejectionCount: summary.rejectionCount.toString(),
        certificateHash: summary.certificateHash,
      });
      setStatus(`Loaded proposed product ${productSeed}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to read proposed product.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Manual verification</p>
          <h1 className="display-type mt-3 text-5xl leading-none text-foreground">Read both systems side by side</h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted">
          Use this page during demos when you want quick proof of the recorded state without sending a new transaction.
        </p>
      </div>

      <div className="mt-6 rounded-[24px] border border-line bg-[#173b2f] px-4 py-4 text-sm text-[#e6efe9]">
        <p className="font-semibold">Status</p>
        <p className="mt-2 break-words">{status}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[24px] border border-line bg-panel-strong p-5">
          <p className="text-sm font-semibold text-foreground">Base paper verification</p>
          <label className="mt-4 grid gap-1 text-sm text-muted">
            UPC
            <input
              value={baseUpc}
              onChange={(event) => setBaseUpc(event.target.value)}
              className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground"
            />
          </label>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void readBase()}
            className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Read base product
          </button>
          {baseResult ? (
            <div className="mt-4 rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm text-muted">
              {Object.entries(baseResult).map(([key, value]) => (
                <p key={key}>
                  <span className="font-semibold capitalize text-foreground">{key}:</span> {value}
                </p>
              ))}
            </div>
          ) : null}
        </article>

        <article className="rounded-[24px] border border-line bg-panel-strong p-5">
          <p className="text-sm font-semibold text-foreground">Proposed verification</p>
          <label className="mt-4 grid gap-1 text-sm text-muted">
            Product seed
            <input
              value={productSeed}
              onChange={(event) => setProductSeed(event.target.value)}
              className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground"
            />
          </label>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void readProposed()}
            className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Read proposed product
          </button>
          {proposedResult ? (
            <div className="mt-4 rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm text-muted">
              {Object.entries(proposedResult).map(([key, value]) => (
                <p key={key}>
                  <span className="font-semibold capitalize text-foreground">{key}:</span> {value}
                </p>
              ))}
            </div>
          ) : null}
        </article>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[24px] border border-line bg-panel-strong p-5 text-sm text-muted">
          <p className="font-semibold text-foreground">QR verification link</p>
          <p className="mt-2">
            Generate a QR code for the current verification inputs and scan it during the panel demo
            to open this lookup page directly.
          </p>
          <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="QR code for verification page"
                width={220}
                height={220}
                unoptimized
                className="rounded-2xl border border-line bg-white p-3"
              />
            ) : (
              <div className="flex h-[220px] w-[220px] items-center justify-center rounded-2xl border border-line bg-white text-center text-sm">
                Generating QR...
              </div>
            )}
            <div className="space-y-3">
              <p className="max-w-md break-all rounded-2xl border border-line bg-white/70 px-4 py-3">{qrLink}</p>
              <p>
                Suggested use: scan after you have already created the base product or proposed
                product, then read the on-chain result from the `/verify` page.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-line bg-panel-strong p-5 text-sm text-muted">
          <p className="font-semibold text-foreground">Verification mapping</p>
          <div className="mt-4 space-y-2">
            <p>
              <span className="font-semibold text-foreground">Base query:</span> `upc`
            </p>
            <p>
              <span className="font-semibold text-foreground">Proposed query:</span> `seed`
            </p>
            <p>
              <span className="font-semibold text-foreground">Derived product id:</span>{" "}
              {ethers.id(productSeed)}
            </p>
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-muted">
        <article className="rounded-[24px] border border-line bg-panel-strong p-4">
          <p className="font-semibold text-foreground">Base paper reader</p>
          <p className="mt-2">Use UPC to show simple sale and ownership state from the original flow.</p>
        </article>
        <article className="rounded-[24px] border border-line bg-panel-strong p-4">
          <p className="font-semibold text-foreground">Proposed reader</p>
          <p className="mt-2">Use the seed to derive the product id and inspect stage plus validation status.</p>
        </article>
        <article className="rounded-[24px] border border-line bg-panel-strong p-4">
          <p className="font-semibold text-foreground">Panel use</p>
          <p className="mt-2">This page is useful after transactions are complete and you need a quick proof screen during presentation.</p>
        </article>
      </div>
    </section>
  );
}

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}
