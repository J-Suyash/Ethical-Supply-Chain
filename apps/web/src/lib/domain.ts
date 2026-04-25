export const lifecycleStages = [
  {
    id: "01",
    name: "Product Registration",
    owner: "Manufacturer",
    note: "Product registered on-chain with unique identification and certificate digest.",
  },
  {
    id: "02",
    name: "Manufacturing Complete",
    owner: "Manufacturer",
    note: "Batch enters ethical review stage. Cannot proceed without threshold approval.",
  },
  {
    id: "03",
    name: "Distribution",
    owner: "Distributor",
    note: "Custody transfer authorized after authority threshold is reached.",
  },
  {
    id: "04",
    name: "Retail Stock",
    owner: "Retailer",
    note: "Public traceability available through QR code and manual verification.",
  },
  {
    id: "05",
    name: "Sold to Consumer",
    owner: "Retailer",
    note: "Lifecycle closes with immutable status and certificate reference on record.",
  },
] as const;

export const systemModules = [
  {
    name: "Role-Based Access Control",
    detail: "Administrator-controlled actor onboarding, revocation, and blacklist enforcement mechanisms.",
  },
  {
    name: "Product Registry System",
    detail: "Optimized on-chain state fields maintain compact storage while preserving complete custody history.",
  },
  {
    name: "Ethical Validation Framework",
    detail: "Designated authorities approve or reject certificate digests until configured threshold determines outcome.",
  },
  {
    name: "Public Verification Portal",
    detail: "Any citizen may verify product stage, custodian, and validation status using product identification number.",
  },
] as const;

export const metrics = [
  { label: "Authority Threshold", value: "2 of 3", hint: "Minimum approval quorum required" },
  { label: "On-Chain Storage", value: "Optimized", hint: "Packed enum-sized state fields" },
  { label: "Evidence Model", value: "Hash + IPFS", hint: "Digests stored on-chain, documents off-chain" },
  { label: "Governance Model", value: "Admin Registry", hint: "Role-based access control system" },
] as const;

export const features = [
  {
    title: "Multi-Authority Threshold Validation",
    detail: "Multiple authority approval gate prevents single points of trust failure. Minimum quorum required for progression.",
  },
  {
    title: "Immutable Audit Trail",
    detail: "Every stage transition, approval, and rejection is permanently recorded on the blockchain for transparency.",
  },
  {
    title: "IPFS Evidence Storage",
    detail: "Certificates stored off-chain using decentralized storage with on-chain digest anchoring for cost-effective proof.",
  },
  {
    title: "Blacklist Enforcement System",
    detail: "Compromised or unauthorized actors can be blacklisted without disrupting the entire supply chain operations.",
  },
] as const;
