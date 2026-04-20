"use client";

import { useMemo, useState } from "react";
import { Contract, ethers } from "ethers";
import { contractConfig, proposedAbi } from "@/lib/contracts";
import {
  getBrowserProvider,
  ensureDemoNetwork,
  switchToDemoNetwork,
  describeContractError,
} from "@/lib/wallet";

interface UploadResult {
  cid: string;
  fileName: string;
  objectKey: string;
}

interface ProposedProductSnapshot {
  stage: string;
  validationStatus: string;
  currentCustodian: string;
  approvalCount: string;
  rejectionCount: string;
  certificateHash: string;
}

export function WalletConsole() {
  const [account, setAccount] = useState<string>("");
  const [networkName, setNetworkName] = useState<string>("");
  const [status, setStatus] = useState<string>(
    "Connect your wallet to interact with deployed contracts.",
  );
  const [isWorking, setIsWorking] = useState(false);

  const [productSeed, setProductSeed] = useState("demo-product-001");
  const [certificateSource, setCertificateSource] = useState("demo-certificate");
  const [nextCustodian, setNextCustodian] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [proposedSnapshot, setProposedSnapshot] =
    useState<ProposedProductSnapshot | null>(null);

  async function handleSwitchNetwork() {
    try {
      await switchToDemoNetwork();
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      await ensureDemoNetwork(provider);
      setAccount(await signer.getAddress());
      const network = await provider.getNetwork();
      setNetworkName(`${network.name} (${network.chainId.toString()})`);
      setStatus(
        `Switched to ${contractConfig.demoChainName}. Transactions now use test ETH on that network.`,
      );
    } catch (error) {
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
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      await ensureDemoNetwork(provider);

      setAccount(await signer.getAddress());
      const network = await provider.getNetwork();
      setNetworkName(`${network.name} (${network.chainId.toString()})`);
      setStatus(
        `Wallet connected on ${contractConfig.demoChainName}. Transactions use test ETH, not mainnet ETH.`,
      );
    } catch (error) {
      setStatus(describeContractError(error));
    }
  }

  async function withProposedContract(
    action: (contract: Contract) => Promise<void>,
  ) {
    if (!contractConfig.proposedAddress) {
      setStatus(
        "Set NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS to use the console.",
      );
      return;
    }

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
      setStatus(`Uploaded to Filebase. CID: ${payload.cid}`);
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
        stage: summary.stage.toString(),
        validationStatus: summary.validationStatus.toString(),
        currentCustodian: summary.currentCustodian,
        approvalCount: summary.approvalCount.toString(),
        rejectionCount: summary.rejectionCount.toString(),
        certificateHash: summary.certificateHash,
      });
      setStatus(`Product ${productId} summary loaded.`);
    });
  }

  return (
    <section className="border border-line bg-panel">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="font-data text-muted">LIVE DEMO CONSOLE</p>
          <h2 className="font-display mt-2 text-4xl">WALLET & CONTRACTS</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={connectWallet}
            className="border border-line bg-foreground px-4 py-2 font-data text-background transition-colors hover:bg-accent"
          >
            {account ? "RECONNECT" : "CONNECT METAMASK"}
          </button>
          <button
            type="button"
            onClick={handleSwitchNetwork}
            className="border border-line bg-panel px-4 py-2 font-data text-foreground transition-colors hover:bg-panel-alt"
          >
            SWITCH TO {contractConfig.demoChainName.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="grid border-b border-line lg:grid-cols-2">
        <div className="border-r border-line px-6 py-4">
          <p className="font-data text-muted">WALLET</p>
          <p className="mt-2 break-all font-data text-foreground">
            {account || "NOT CONNECTED"}
          </p>
          <p className="mt-1 font-data text-muted">
            {networkName || "NO NETWORK"}
          </p>
        </div>
        <div className="px-6 py-4">
          <p className="font-data text-muted">CONTRACT</p>
          <p className="mt-2 break-all font-data text-foreground">
            {contractConfig.proposedAddress || "NOT CONFIGURED"}
          </p>
        </div>
      </div>

      <div className="border-b border-line bg-foreground px-6 py-3">
        <p className="font-data text-background">STATUS : {status}</p>
      </div>

      <div className="px-6 py-6">
        <p className="font-data text-muted">PROPOSED CONTRACT ACTIONS</p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="font-data text-muted">PRODUCT SEED</span>
            <input
              value={productSeed}
              onChange={(e) => setProductSeed(e.target.value)}
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-data text-muted">CERTIFICATE SOURCE OR CID</span>
            <input
              value={certificateSource}
              onChange={(e) => setCertificateSource(e.target.value)}
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-data text-muted">NEXT CUSTODIAN ADDRESS</span>
            <input
              value={nextCustodian}
              onChange={(e) => setNextCustodian(e.target.value)}
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-data text-muted">UPLOAD CERTIFICATE TO IPFS</span>
            <input
              type="file"
              onChange={(e) => void uploadEvidence(e.target.files?.[0] ?? null)}
              className="border border-line bg-panel px-3 py-2 font-data text-foreground"
            />
          </label>
          <div className="border border-line-muted bg-panel-alt px-3 py-2">
            <p className="font-data text-muted">PRODUCT ID : {productId}</p>
            <p className="font-data text-muted">CERT HASH : {certificateHash}</p>
            {uploadResult && (
              <p className="font-data text-muted">CID : {uploadResult.cid}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isWorking}
            onClick={() =>
              withProposedContract(async (contract) => {
                const tx = await contract.registerProduct(productId, certificateHash);
                await tx.wait();
                setStatus(`Product registered with id ${productId}.`);
              })
            }
            className="border border-line bg-foreground px-4 py-2 font-data text-background disabled:opacity-50"
          >
            REGISTER
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
                setStatus(`Advanced product ${productId} to the next stage.`);
              })
            }
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            ADVANCE STAGE
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
                  `Approval recorded. Status=${summary.validationStatus.toString()} approvals=${summary.approvalCount.toString()}`,
                );
              })
            }
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            APPROVE
          </button>
          <button
            type="button"
            disabled={isWorking}
            onClick={() =>
              withProposedContract(async (contract) => {
                const tx = await contract.rejectProduct(productId);
                await tx.wait();
                setStatus(`Rejection recorded for product ${productId}.`);
              })
            }
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            REJECT
          </button>
          <button
            type="button"
            disabled={isWorking}
            onClick={() => void refreshProposedSnapshot()}
            className="border border-line bg-panel px-4 py-2 font-data text-foreground disabled:opacity-50"
          >
            READ SUMMARY
          </button>
        </div>

        {proposedSnapshot && (
          <div className="mt-4 border border-line bg-panel-alt p-4">
            <div className="grid gap-1 font-data text-sm">
              <p>
                <span className="text-muted">STAGE :</span>{" "}
                <span className="text-foreground">{proposedSnapshot.stage}</span>
              </p>
              <p>
                <span className="text-muted">VALIDATION :</span>{" "}
                <span className="text-foreground">
                  {proposedSnapshot.validationStatus}
                </span>
              </p>
              <p>
                <span className="text-muted">APPROVALS :</span>{" "}
                <span className="text-foreground">
                  {proposedSnapshot.approvalCount}
                </span>
              </p>
              <p>
                <span className="text-muted">REJECTIONS :</span>{" "}
                <span className="text-foreground">
                  {proposedSnapshot.rejectionCount}
                </span>
              </p>
              <p>
                <span className="text-muted">CUSTODIAN :</span>{" "}
                <span className="text-foreground">
                  {proposedSnapshot.currentCustodian}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid border-t border-line md:grid-cols-2">
        <div className="border-r border-line px-6 py-4">
          <p className="font-data text-foreground">DEMO NOTE</p>
          <p className="mt-2 text-sm text-muted">
            Use a wallet with the correct role on the deployed contract. If MetaMask
            says ETH, that is test ETH on {contractConfig.demoChainName}, not mainnet
            ETH.
          </p>
        </div>
        <div className="px-6 py-4">
          <p className="font-data text-foreground">IPFS NOTE</p>
          <p className="mt-2 text-sm text-muted">
            File uploads use Filebase IPFS RPC API. The returned CID is hashed into
            the on-chain certificate field.
          </p>
        </div>
      </div>
    </section>
  );
}
