export const basePaperAbi = [
  "error ConsumerAlreadyRegistered(address account)",
  "error ConsumerNotRegistered(address account)",
  "error UnknownProduct(uint256 upc)",
  "error ProductAlreadyExists(uint256 upc)",
  "error InvalidPrice(uint256 price)",
  "error InvalidState(uint256 upc, uint8 expected, uint8 actual)",
  "error UnauthorizedActor(address actor)",
  "error InsufficientBid(uint256 requiredPrice, uint256 sentAmount)",
  "error InvalidAccount(address account)",
  "function createMedicine(uint256 upc, string name, string details) external",
  "function sellMedicine(uint256 upc, uint256 price) external",
  "function buyMedicine(uint256 upc) external payable",
  "function shipMedicine(uint256 upc) external",
  "function receiveMedicine(uint256 upc) external",
  "function consumeMedicine(uint256 upc) external",
  "function getProduct(uint256 upc) external view returns ((uint256 upc, string name, string details, string stateLabel, address owner, address buyer, uint256 price, uint8 state))",
] as const;

export const proposedAbi = [
  "error AccountBlacklisted(address account)",
  "error UnknownProduct(bytes32 productId)",
  "error ProductAlreadyExists(bytes32 productId)",
  "error ValidationClosed(bytes32 productId)",
  "error AlreadyValidated(bytes32 productId, address authority)",
  "error InvalidThreshold(uint8 threshold, uint256 authorityCount)",
  "error ValidationRequired(bytes32 productId)",
  "error InvalidRoleForStage(uint8 stage, address actor)",
  "error NotCurrentCustodian(bytes32 productId, address actor)",
  "error InvalidNextCustodian(uint8 stage, address custodian)",
  "error ThresholdWouldExceedAuthorityCount(uint8 threshold, uint256 authorityCount)",
  "error InvalidProductId()",
  "error InvalidAccount(address account)",
  "function registerProduct(bytes32 productId, bytes32 certificateHash) external",
  "function advanceStage(bytes32 productId, address nextCustodian) external",
  "function approveProduct(bytes32 productId) external",
  "function rejectProduct(bytes32 productId) external",
  "function getProductSummary(bytes32 productId) external view returns (uint8 stage, uint8 validationStatus, address currentCustodian, uint8 approvalCount, uint8 rejectionCount, bytes32 certificateHash)",
] as const;

export interface ContractConfig {
  basePaperAddress?: string;
  proposedAddress?: string;
  demoChainId: number;
  demoChainName: string;
}

export const contractConfig: ContractConfig = {
  basePaperAddress: process.env.NEXT_PUBLIC_BASE_CONTRACT_ADDRESS,
  proposedAddress: process.env.NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS,
  demoChainId: Number(process.env.NEXT_PUBLIC_DEMO_CHAIN_ID ?? "11155111"),
  demoChainName: process.env.NEXT_PUBLIC_DEMO_CHAIN_NAME ?? "Sepolia",
};
