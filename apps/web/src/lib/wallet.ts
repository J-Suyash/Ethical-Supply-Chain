import { BrowserProvider, ethers, Interface } from "ethers";
import { contractConfig, proposedAbi } from "./contracts";

export async function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required for live contract interaction.");
  }

  const provider = new BrowserProvider(window.ethereum as ethers.Eip1193Provider);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export async function ensureDemoNetwork(provider: BrowserProvider): Promise<BrowserProvider> {
  const network = await provider.getNetwork();

  if (Number(network.chainId) === contractConfig.demoChainId) {
    return provider;
  }

  try {
    await switchToDemoNetwork();
  } catch {
    throw new Error(
      `Wrong network. Switch MetaMask to ${contractConfig.demoChainName} (chain ${contractConfig.demoChainId}).`,
    );
  }

  const fresh = new BrowserProvider(window.ethereum as ethers.Eip1193Provider);
  const switched = await fresh.getNetwork();

  if (Number(switched.chainId) !== contractConfig.demoChainId) {
    throw new Error(
      `Wrong network. Switch MetaMask to ${contractConfig.demoChainName} (chain ${contractConfig.demoChainId}).`,
    );
  }

  return fresh;
}

export function getNetworkDisplayName(network: Awaited<ReturnType<BrowserProvider["getNetwork"]>>): string {
  try {
    if (network.name) return network.name;
  } catch {
    // ethers v6 throws on unregistered networks
  }
  if (Number(network.chainId) === 11155111) return "Sepolia";
  return `Chain ${network.chainId}`;
}

export async function switchToDemoNetwork() {
  if (typeof window === "undefined" || !window.ethereum?.request) {
    throw new Error("MetaMask is required to switch networks.");
  }

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${contractConfig.demoChainId.toString(16)}` }],
  });
}

export function describeContractError(error: unknown) {
  console.error("[wallet] Contract interaction error", error);

  if (!(error instanceof Error)) {
    return "Transaction failed.";
  }

  const typedError = error as Error & {
    code?: string | number;
    data?: string;
    shortMessage?: string;
    info?: { error?: { code?: number; data?: string; message?: string }; payload?: { method?: string } };
    cause?: { data?: string; message?: string };
  };

  if (
    typedError.code === "ACTION_REJECTED" ||
    typedError.code === 4001 ||
    typedError.info?.error?.code === 4001
  ) {
    return "Transaction cancelled — you rejected it in MetaMask.";
  }

  const data = typedError.data ?? typedError.info?.error?.data ?? typedError.cause?.data;
  const rawMessage = typedError.message || typedError.shortMessage || typedError.info?.error?.message || typedError.cause?.message || "";

  if (typeof data === "string") {
    try {
      const iface = new Interface(proposedAbi);
      const decoded = iface.parseError(data);
      if (decoded?.name === "ProductAlreadyExists") {
        return "This product ID already exists. Use a different product seed.";
      }
      if (decoded?.name === "ValidationRequired") {
        return "Authorities must approve the product before it can move forward.";
      }
      if (decoded?.name === "AccountBlacklisted") {
        return "The connected wallet is blacklisted.";
      }
      if (decoded?.name === "InvalidRoleForStage") {
        return "The connected wallet does not have the required role for this stage.";
      }
      if (decoded?.name === "NotCurrentCustodian") {
        return "The connected wallet is not the current custodian of this product.";
      }
      if (decoded?.name === "AlreadyValidated") {
        return "This authority has already voted on the product.";
      }
      if (decoded?.name === "InvalidThreshold") {
        return "Invalid threshold. Must be > 0 and <= number of registered authorities.";
      }
      if (decoded?.name === "ThresholdWouldExceedAuthorityCount") {
        return "Cannot remove this authority — threshold would become unreachable.";
      }
      if (decoded?.name === "InvalidAccount") {
        return "Invalid account address (cannot be zero address).";
      }
      if (decoded?.name === "ValidationClosed") {
        return "Validation is already closed for this product.";
      }
      if (decoded?.name === "UnknownProduct") {
        return "Product not found on the contract.";
      }
      if (decoded?.name === "InvalidProductId") {
        return "Invalid product ID.";
      }
      if (decoded?.name === "InvalidNextCustodian") {
        return "The next custodian does not have the required role for the next stage.";
      }
    } catch {}
  }

  if (rawMessage.includes("estimateGas")) {
    return "The contract rejected this action. Check form values, role, and product state.";
  }

  return rawMessage;
}

export const ROLE_HASHES = {
  DEFAULT_ADMIN_ROLE: ethers.ZeroHash,
  MANUFACTURER_ROLE: ethers.id("MANUFACTURER_ROLE"),
  DISTRIBUTOR_ROLE: ethers.id("DISTRIBUTOR_ROLE"),
  RETAILER_ROLE: ethers.id("RETAILER_ROLE"),
  AUTHORITY_ROLE: ethers.id("AUTHORITY_ROLE"),
} as const;

export const STAGE_LABELS = ["Created", "Manufactured", "Distributed", "Retail", "Sold"] as const;
export const VALIDATION_LABELS = ["Pending", "Approved", "Rejected"] as const;

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}
