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
  "function registerProduct(bytes32 productId, bytes32 certificateHash, string name, string batchNumber, string manufacturerName, uint32 manufacturedAt, uint32 expiryAt) external",
  "function advanceStage(bytes32 productId, address nextCustodian) external",
  "function approveProduct(bytes32 productId) external",
  "function rejectProduct(bytes32 productId) external",
  "function getProductSummary(bytes32 productId) external view returns (string name, string batchNumber, string manufacturerName, uint8 stage, uint8 validationStatus, address currentCustodian, uint8 approvalCount, uint8 rejectionCount, bytes32 certificateHash, uint32 manufacturedAt, uint32 expiryAt)",
  "function getProduct(bytes32 productId) external view returns (string name, string batchNumber, string manufacturerName, bytes32 certificateHash, address currentCustodian, uint32 createdAt, uint32 updatedAt, uint32 manufacturedAt, uint32 expiryAt, uint8 stage, uint8 validationStatus, uint8 approvalCount, uint8 rejectionCount)",
  "function productExists(bytes32 productId) external view returns (bool)",
  "function registerActor(bytes32 role, address account) external",
  "function revokeActor(bytes32 role, address account) external",
  "function setAuthorityThreshold(uint8 threshold) external",
  "function setBlacklist(address account, bool status) external",
  "function pause() external",
  "function unpause() external",
  "function authorityThreshold() external view returns (uint8)",
  "function blacklisted(address account) external view returns (bool)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function getRoleMemberCount(bytes32 role) external view returns (uint256)",
  "function getRoleMember(bytes32 role, uint256 index) external view returns (address)",
  "function paused() external view returns (bool)",
  "function hasValidated(bytes32 productId, address authority) external view returns (bool)",
  "function MANUFACTURER_ROLE() external view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() external view returns (bytes32)",
  "function RETAILER_ROLE() external view returns (bytes32)",
  "function AUTHORITY_ROLE() external view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
] as const;

export interface ContractConfig {
  proposedAddress?: string;
  demoChainId: number;
  demoChainName: string;
}

export const contractConfig: ContractConfig = {
  proposedAddress: process.env.NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS,
  demoChainId: Number(process.env.NEXT_PUBLIC_DEMO_CHAIN_ID ?? "11155111"),
  demoChainName: process.env.NEXT_PUBLIC_DEMO_CHAIN_NAME ?? "Sepolia",
};
