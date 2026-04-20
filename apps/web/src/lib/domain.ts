export const lifecycleStages = [
  {
    id: "01",
    name: "Created",
    owner: "Manufacturer",
    note: "Product registered on-chain with a compact bytes32 ID and certificate digest.",
  },
  {
    id: "02",
    name: "Manufactured",
    owner: "Manufacturer",
    note: "Batch enters ethical review. Cannot progress without threshold approval.",
  },
  {
    id: "03",
    name: "Distributed",
    owner: "Distributor",
    note: "Custody transfers after authority threshold is reached.",
  },
  {
    id: "04",
    name: "Retail",
    owner: "Retailer",
    note: "Public traceability remains available for QR and manual lookup.",
  },
  {
    id: "05",
    name: "Sold",
    owner: "Retailer",
    note: "Lifecycle closes with immutable status and certificate reference.",
  },
] as const;

export const systemModules = [
  {
    name: "Role Governance",
    detail: "Admin-controlled actor onboarding, revocation, and blacklist enforcement.",
  },
  {
    name: "Product Registry",
    detail: "Packed state fields keep contract storage compact while preserving custody history.",
  },
  {
    name: "Ethical Validation",
    detail: "Authorities approve or reject certificate digests until the threshold decides outcome.",
  },
  {
    name: "Public Verification",
    detail: "Anyone can verify stage, custodian, and validation status from a single product ID.",
  },
] as const;

export const metrics = [
  { label: "Authority Threshold", value: "2 of 3", hint: "Minimum approval quorum" },
  { label: "On-chain State", value: "Compact", hint: "Packed enum-sized fields" },
  { label: "Evidence Model", value: "Hash + IPFS", hint: "Digests on-chain, docs off-chain" },
  { label: "Governance", value: "Admin Registry", hint: "Role-based access control" },
] as const;

export const features = [
  {
    title: "Threshold Validation",
    detail: "Multi-authority approval gate prevents single points of trust failure.",
  },
  {
    title: "Immutable Audit Trail",
    detail: "Every stage transition, approval, and rejection is permanently recorded on-chain.",
  },
  {
    title: "IPFS Evidence",
    detail: "Certificates stored off-chain with on-chain digest anchoring for cost-effective proof.",
  },
  {
    title: "Blacklist Enforcement",
    detail: "Compromised actors can be blacklisted without disrupting the entire supply chain.",
  },
] as const;
