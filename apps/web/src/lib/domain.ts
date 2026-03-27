export const lifecycleStages = [
  {
    id: "01",
    name: "Created",
    owner: "Manufacturer",
    note: "A compact `bytes32` product id and certificate digest are registered on-chain.",
  },
  {
    id: "02",
    name: "Manufactured",
    owner: "Manufacturer",
    note: "The batch becomes eligible for ethical review and cannot progress without approval.",
  },
  {
    id: "03",
    name: "Distributed",
    owner: "Distributor",
    note: "Custody moves after the authority threshold is reached.",
  },
  {
    id: "04",
    name: "Retail",
    owner: "Retailer",
    note: "Public traceability remains available for QR and manual lookup flows.",
  },
  {
    id: "05",
    name: "Sold",
    owner: "Retailer",
    note: "The lifecycle closes with an immutable status and certificate reference.",
  },
] as const;

export const basePaperFlow = [
  "MetaMask-backed login and actor access to the blockchain app.",
  "Register a farm or source and link medicine records to a UPC.",
  "Create a medicine, list it for sale, and accept a buyer offer above the set price.",
  "Ship, receive, and consume the medicine while transaction hashes record each step.",
] as const;

export const proposedFlow = [
  "Register a compact product record with a certificate digest reference.",
  "Advance from creation into manufacturing under role and custodian checks.",
  "Run threshold-based ethical approval before the product can move into distribution.",
  "Continue distribution and retail traceability with blacklist and governance controls.",
] as const;

export const researchGaps = [
  {
    title: "Single-trust validation",
    detail: "The base paper focuses on UPC traceability but does not require multi-authority approval before movement continues.",
  },
  {
    title: "Heavier state model",
    detail: "The base flow is event-rich but does not optimize storage layout or compact lifecycle encoding for gas efficiency.",
  },
  {
    title: "No governance recovery",
    detail: "The paper includes role-style access examples, but not blacklist handling or threshold-safe authority revocation.",
  },
  {
    title: "Certification not formalized",
    detail: "The paper emphasizes transparency and QR verification, but it does not model ethical evidence approval in the contract lifecycle.",
  },
] as const;

export const comparisonRows = [
  {
    feature: "Core algorithm",
    base: "UPC registration and role-based product sale/ship/receive flow",
    proposed: "UPC-like tracking plus threshold-based ethical validation over certificate hashes",
  },
  {
    feature: "Trust model",
    base: "Implicit trust in the acting owner or single workflow controller",
    proposed: "Explicit trust through 2-of-3 authority approvals before onward movement",
  },
  {
    feature: "Storage design",
    base: "String-heavy lifecycle labels and direct on-chain product flow",
    proposed: "Packed enum-like state, compact fields, and off-chain evidence references",
  },
  {
    feature: "Governance",
    base: "Basic role ownership pattern",
    proposed: "Admin registry, blacklist support, and safe threshold-aware authority management",
  },
  {
    feature: "Failure handling",
    base: "No ethical validation terminal state",
    proposed: "Pending, approved, and rejected validation states with replay protection",
  },
] as const;

export const basePaperModules = [
  {
    name: "Consumer role onboarding",
    detail: "The paper includes an ownable consumer-role contract pattern as its explicit algorithm example.",
  },
  {
    name: "UPC product registration",
    detail: "Medicines are tracked with a UPC and blockchain transaction history for visibility and barcode lookup.",
  },
  {
    name: "Marketplace transfer flow",
    detail: "Products move through sale, buyer bid, shipping, receiving, and consumption without an ethical gate.",
  },
] as const;

export const systemModules = [
  {
    name: "Role governance",
    detail: "Admin-controlled actor onboarding, revocation, and blacklist enforcement for the MVP.",
  },
  {
    name: "Product registry",
    detail: "Packed state fields keep the contract storage light while preserving custody history.",
  },
  {
    name: "Ethical validation",
    detail: "Authorities approve or reject a certificate digest until the threshold decides the outcome.",
  },
  {
    name: "Public verification",
    detail: "Consumers and auditors can verify stage, custodian, and validation status from a single product id.",
  },
] as const;

export const milestoneTasks = [
  "Finalize the base paper comparison and baseline assumptions.",
  "Wire the Bun workspace to the Hardhat contract package and Next.js frontend.",
  "Expose typed product and validation read models to the UI.",
  "Add QR lookup and wallet-connected role actions after contract integration is stable.",
] as const;

export const metrics = [
  { label: "Authority threshold", value: "2 of 3", hint: "Minimum approval quorum for the first prototype." },
  { label: "On-chain state", value: "Compact enums", hint: "Stage and validation status use uint-sized fields." },
  { label: "Evidence model", value: "Hash + IPFS", hint: "Store digests on-chain and documents off-chain." },
  { label: "Governance model", value: "Admin registry", hint: "Safer and easier to reason about for the MVP stage." },
] as const;
