"use client";

import { useMemo, useState } from "react";
import { BrowserProvider, Contract, ethers, parseEther } from "ethers";
import { basePaperAbi, contractConfig, proposedAbi } from "@/lib/contracts";

interface UploadResult {
  cid: string;
  fileName: string;
  objectKey: string;
}

interface BaseProductSnapshot {
  name: string;
  details: string;
  stateLabel: string;
  owner: string;
  buyer: string;
  price: string;
}

interface ProposedProductSnapshot {
  stage: string;
  validationStatus: string;
  currentCustodian: string;
  approvalCount: string;
  rejectionCount: string;
  certificateHash: string;
}

async function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required for live contract interaction.");
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

function describeContractError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Transaction failed.";
  }

  const typedError = error as Error & {
    data?: string;
    shortMessage?: string;
    info?: { error?: { data?: string; message?: string }; payload?: { method?: string } };
    cause?: { data?: string; message?: string };
  };

  const data = typedError.data ?? typedError.info?.error?.data ?? typedError.cause?.data;
  const rawMessage = typedError.message || typedError.shortMessage || typedError.info?.error?.message || typedError.cause?.message || "";

  const knownSelectors: Record<string, string> = {
    "0xbcd4cd5b": `UPC ${typedError.message.match(/0x[bB]cd4cd5b[0-9a-fA-F]{64}/) ? "already exists" : "already exists on the contract. Use a new UPC value."}`,
    "0x64bdcb19": "That UPC was not found on the base-paper contract.",
    "0x15ca0bb9": "The connected wallet is not authorized for this base-paper action.",
    "0x7ee2c6d9": "This action is not valid for the product's current lifecycle state.",
    "0x49c9ba9d": "The buyer sent less ETH than the listed testnet price.",
    "0x98787928": "Authorities must approve the product before it can move forward.",
  };

  for (const [selector, message] of Object.entries(knownSelectors)) {
    if (rawMessage.includes(selector) || (typeof data === "string" && data.startsWith(selector))) {
      if (selector === "0xbcd4cd5b") {
        return "UPC already exists on the contract. Use a new UPC value such as 101 or 1001.";
      }

      return message;
    }
  }

  if (typeof data === "string") {
    try {
      const baseInterface = new ethers.Interface(basePaperAbi);
      const decodedBase = baseInterface.parseError(data);
      if (decodedBase?.name === "ProductAlreadyExists") {
        return `UPC ${decodedBase.args[0].toString()} already exists on the contract. Use a new UPC value.`;
      }
      if (decodedBase?.name === "UnknownProduct") {
        return `UPC ${decodedBase.args[0].toString()} was not found.`;
      }
      if (decodedBase?.name === "ConsumerNotRegistered") {
        return `The connected wallet is not registered as a consumer in the base-paper contract.`;
      }
      if (decodedBase?.name === "UnauthorizedActor") {
        return "The connected wallet does not have permission for this base-paper action.";
      }
      if (decodedBase?.name === "InvalidState") {
        return "This action is not valid for the product's current lifecycle state.";
      }
    } catch {}

    try {
      const proposedInterface = new ethers.Interface(proposedAbi);
      const decodedProposed = proposedInterface.parseError(data);
      if (decodedProposed?.name === "ProductAlreadyExists") {
        return "This proposed product id already exists. Use a different product seed.";
      }
      if (decodedProposed?.name === "ValidationRequired") {
        return "Authorities must approve the product before it can move forward.";
      }
      if (decodedProposed?.name === "AccountBlacklisted") {
        return "The connected wallet is blacklisted in the proposed contract.";
      }
      if (decodedProposed?.name === "InvalidRoleForStage") {
        return "The connected wallet does not have the required role for this lifecycle stage.";
      }
      if (decodedProposed?.name === "NotCurrentCustodian") {
        return "The connected wallet is not the current custodian of this product.";
      }
      if (decodedProposed?.name === "AlreadyValidated") {
        return "This authority has already voted on the product.";
      }
    } catch {}
  }

  if (rawMessage.includes("estimateGas")) {
    return "The contract rejected this action before sending the transaction. Check the form values, role, and current product state.";
  }

  return rawMessage;
}

export function WalletConsole() {
  const [account, setAccount] = useState<string>("");
  const [networkName, setNetworkName] = useState<string>("");
  const [status, setStatus] = useState<string>("Connect your wallet to interact with deployed contracts.");
  const [isWorking, setIsWorking] = useState(false);

  const [baseUpc, setBaseUpc] = useState("1");
  const [baseName, setBaseName] = useState("Amoxicillin");
  const [baseDetails, setBaseDetails] = useState("Base paper medicine demo record");
  const [basePrice, setBasePrice] = useState("0.01");

  const [productSeed, setProductSeed] = useState("demo-product-001");
  const [certificateSource, setCertificateSource] = useState("demo-certificate");
  const [nextCustodian, setNextCustodian] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [baseSnapshot, setBaseSnapshot] = useState<BaseProductSnapshot | null>(null);
  const [proposedSnapshot, setProposedSnapshot] = useState<ProposedProductSnapshot | null>(null);

  async function switchToDemoNetwork() {
    if (typeof window === "undefined" || !window.ethereum?.request) {
      setStatus("MetaMask is required to switch networks.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${contractConfig.demoChainId.toString(16)}` }],
      });

      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const network = await ensureDemoNetwork(provider);
      setAccount(await signer.getAddress());
      setNetworkName(`${network.name} (${network.chainId.toString()})`);
      setStatus(`Switched to ${contractConfig.demoChainName}. Transactions now use test ETH on that network.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Network switch failed.");
    }
  }

  const productId = useMemo(() => ethers.id(productSeed || "demo-product-001"), [productSeed]);
  const certificateHash = useMemo(
    () => ethers.id(uploadResult?.cid || certificateSource || "demo-certificate"),
    [certificateSource, uploadResult],
  );

  async function connectWallet() {
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const network = await ensureDemoNetwork(provider);

      setAccount(await signer.getAddress());
      setNetworkName(`${network.name} (${network.chainId.toString()})`);
      setStatus(`Wallet connected on ${contractConfig.demoChainName}. Transactions use test ETH, not mainnet ETH.`);
    } catch (error) {
      setStatus(describeContractError(error));
    }
  }

  async function withBaseContract(action: (contract: Contract, signerAddress: string) => Promise<void>) {
    if (!contractConfig.basePaperAddress) {
      setStatus("Set NEXT_PUBLIC_BASE_CONTRACT_ADDRESS to use the base-paper console.");
      return;
    }

    setIsWorking(true);

    try {
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = new Contract(contractConfig.basePaperAddress, basePaperAbi, signer);
      await action(contract, signerAddress);
    } catch (error) {
      setStatus(describeContractError(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function withProposedContract(action: (contract: Contract) => Promise<void>) {
    if (!contractConfig.proposedAddress) {
      setStatus("Set NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS to use the proposed-system console.");
      return;
    }

    setIsWorking(true);

    try {
      const provider = await getBrowserProvider();
      await ensureDemoNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractConfig.proposedAddress, proposedAbi, signer);
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

      const payload = (await response.json()) as UploadResult & { error?: string };
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

  async function refreshBaseSnapshot() {
    await withBaseContract(async (contract) => {
      const product = await contract.getProduct(BigInt(baseUpc));
      setBaseSnapshot({
        name: product.name,
        details: product.details,
        stateLabel: product.stateLabel,
        owner: product.owner,
        buyer: product.buyer,
        price: product.price.toString(),
      });
      setStatus(`Base medicine ${baseUpc} snapshot loaded.`);
    });
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
      setStatus(`Proposed product ${productId} summary loaded.`);
    });
  }

  return (
    <section className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Live demo console</p>
          <h2 className="display-type mt-3 text-4xl leading-none">Wallet, contracts, and IPFS</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={connectWallet}
            className="rounded-full border border-line bg-panel-strong px-4 py-2 text-sm font-semibold text-foreground"
          >
            {account ? "Reconnect wallet" : "Connect MetaMask"}
          </button>
          <button
            type="button"
            onClick={switchToDemoNetwork}
            className="rounded-full border border-line bg-panel-strong px-4 py-2 text-sm font-semibold text-foreground"
          >
            Switch to {contractConfig.demoChainName}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[24px] border border-line bg-panel-strong p-4 text-sm leading-6 text-muted">
          <p className="font-semibold text-foreground">Wallet</p>
          <p className="mt-2 break-all">{account || "Not connected"}</p>
          <p className="mt-2">{networkName || "No network selected"}</p>
          <p className="mt-2">Expected network: {contractConfig.demoChainName} ({contractConfig.demoChainId})</p>
        </article>
        <article className="rounded-[24px] border border-line bg-panel-strong p-4 text-sm leading-6 text-muted">
          <p className="font-semibold text-foreground">Base contract</p>
          <p className="mt-2 break-all">{contractConfig.basePaperAddress || "Set NEXT_PUBLIC_BASE_CONTRACT_ADDRESS"}</p>
        </article>
        <article className="rounded-[24px] border border-line bg-panel-strong p-4 text-sm leading-6 text-muted">
          <p className="font-semibold text-foreground">Proposed contract</p>
          <p className="mt-2 break-all">{contractConfig.proposedAddress || "Set NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS"}</p>
        </article>
      </div>

      <div className="mt-6 rounded-[24px] border border-line bg-[#173b2f] px-4 py-4 text-sm text-[#e6efe9]">
        <p className="font-semibold">Status</p>
        <p className="mt-2 break-words">{status}</p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-[24px] border border-line bg-panel-strong p-5">
          <p className="text-sm font-semibold text-foreground">Base paper contract actions</p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm text-muted">
              UPC
              <input value={baseUpc} onChange={(event) => setBaseUpc(event.target.value)} className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
            <label className="grid gap-1 text-sm text-muted">
              Medicine name
              <input value={baseName} onChange={(event) => setBaseName(event.target.value)} className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
            <label className="grid gap-1 text-sm text-muted">
              Details
              <textarea value={baseDetails} onChange={(event) => setBaseDetails(event.target.value)} className="min-h-24 rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
            <label className="grid gap-1 text-sm text-muted">
              Price in ETH
              <input value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withBaseContract(async (contract) => {
                  const tx = await contract.createMedicine(BigInt(baseUpc), baseName, baseDetails);
                  await tx.wait();
                  setStatus(`Base medicine ${baseUpc} created.`);
                })
              }
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create medicine
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withBaseContract(async (contract) => {
                  const tx = await contract.sellMedicine(BigInt(baseUpc), parseEther(basePrice));
                  await tx.wait();
                  setStatus(`Base medicine ${baseUpc} listed for sale at ${basePrice} ETH.`);
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              List for sale
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withBaseContract(async (contract) => {
                  const tx = await contract.buyMedicine(BigInt(baseUpc), { value: parseEther(basePrice) });
                  await tx.wait();
                  setStatus(`Base medicine ${baseUpc} purchased for ${basePrice} ETH.`);
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Buy medicine
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withBaseContract(async (contract) => {
                  const tx = await contract.shipMedicine(BigInt(baseUpc));
                  await tx.wait();
                  setStatus(`Base medicine ${baseUpc} shipped.`);
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Ship
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withBaseContract(async (contract) => {
                  const tx = await contract.receiveMedicine(BigInt(baseUpc));
                  await tx.wait();
                  setStatus(`Base medicine ${baseUpc} received by current wallet.`);
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Receive
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withBaseContract(async (contract) => {
                  const tx = await contract.consumeMedicine(BigInt(baseUpc));
                  await tx.wait();
                  setStatus(`Base medicine ${baseUpc} consumed by current wallet.`);
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Consume
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void refreshBaseSnapshot()}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Read product
            </button>
          </div>
          {baseSnapshot ? (
            <div className="mt-4 rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm text-muted">
              <p><span className="font-semibold text-foreground">State:</span> {baseSnapshot.stateLabel}</p>
              <p><span className="font-semibold text-foreground">Name:</span> {baseSnapshot.name}</p>
              <p><span className="font-semibold text-foreground">Owner:</span> {baseSnapshot.owner}</p>
              <p><span className="font-semibold text-foreground">Buyer:</span> {baseSnapshot.buyer}</p>
              <p><span className="font-semibold text-foreground">Price:</span> {baseSnapshot.price}</p>
            </div>
          ) : null}
        </article>

        <article className="rounded-[24px] border border-line bg-panel-strong p-5">
          <p className="text-sm font-semibold text-foreground">Proposed contract actions</p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm text-muted">
              Product seed
              <input value={productSeed} onChange={(event) => setProductSeed(event.target.value)} className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
            <label className="grid gap-1 text-sm text-muted">
              Certificate source or CID
              <input value={certificateSource} onChange={(event) => setCertificateSource(event.target.value)} className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
            <label className="grid gap-1 text-sm text-muted">
              Next custodian address
              <input value={nextCustodian} onChange={(event) => setNextCustodian(event.target.value)} className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
            <label className="grid gap-1 text-sm text-muted">
              Upload certificate to Filebase IPFS
              <input type="file" onChange={(event) => void uploadEvidence(event.target.files?.[0] ?? null)} className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-foreground" />
            </label>
            <div className="rounded-2xl border border-line bg-white/70 px-3 py-2 text-sm text-muted">
              <p>Product id: {productId}</p>
              <p>Certificate hash: {certificateHash}</p>
              {uploadResult ? <p>Uploaded CID: {uploadResult.cid}</p> : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withProposedContract(async (contract) => {
                  const tx = await contract.registerProduct(productId, certificateHash);
                  await tx.wait();
                  setStatus(`Proposed product registered with id ${productId}.`);
                })
              }
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Register product
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withProposedContract(async (contract) => {
                  const tx = await contract.advanceStage(productId, nextCustodian || account || ethers.ZeroAddress);
                  await tx.wait();
                  setStatus(`Advanced product ${productId} to the next stage.`);
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Advance stage
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
                    `Approval recorded. Status=${summary.validationStatus.toString()} approvals=${summary.approvalCount.toString()} currentCustodian=${summary.currentCustodian}`,
                  );
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Approve product
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() =>
                withProposedContract(async (contract) => {
                  const tx = await contract.rejectProduct(productId);
                  await tx.wait();
                  setStatus(`Rejection recorded for proposed product ${productId}.`);
                })
              }
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Reject product
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void refreshProposedSnapshot()}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Read summary
            </button>
          </div>
          {proposedSnapshot ? (
            <div className="mt-4 rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm text-muted">
              <p><span className="font-semibold text-foreground">Stage:</span> {proposedSnapshot.stage}</p>
              <p><span className="font-semibold text-foreground">Validation:</span> {proposedSnapshot.validationStatus}</p>
              <p><span className="font-semibold text-foreground">Approvals:</span> {proposedSnapshot.approvalCount}</p>
              <p><span className="font-semibold text-foreground">Rejections:</span> {proposedSnapshot.rejectionCount}</p>
              <p><span className="font-semibold text-foreground">Custodian:</span> {proposedSnapshot.currentCustodian}</p>
            </div>
          ) : null}
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-muted">
        <article className="rounded-[24px] border border-line bg-panel-strong p-4">
          <p className="font-semibold text-foreground">Live demo note</p>
          <p className="mt-2">
            Use a wallet with the correct role on the deployed contract. For example, manufacturer for
            registration and authority addresses for approvals.
          </p>
          <p className="mt-2 font-semibold text-foreground">
            If MetaMask says ETH, that is normal. On {contractConfig.demoChainName} it is test ETH,
            not mainnet ETH.
          </p>
        </article>
        <article className="rounded-[24px] border border-line bg-panel-strong p-4">
          <p className="font-semibold text-foreground">IPFS note</p>
          <p className="mt-2">
            File uploads go through the server route using Filebase&apos;s IPFS RPC API, then the
            returned CID is hashed into the on-chain certificate field.
          </p>
        </article>
        <article className="rounded-[24px] border border-line bg-panel-strong p-4">
          <p className="font-semibold text-foreground">Suggested localhost demo flow</p>
          <p className="mt-2">
            1. Use the first Hardhat account as admin/manufacturer. 2. Create and sell the base-paper
            medicine. 3. Switch to a consumer account to buy/receive/consume. 4. Return to the first
            account to register the proposed product, then switch to authority accounts to approve it.
          </p>
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
