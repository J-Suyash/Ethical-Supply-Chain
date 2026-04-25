# Ethical Supply Chain — Complete Project Summary

## Table of Contents

- [What This Is](#what-this-is)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
  - [BasePaperMedicineSupplyChain (Baseline)](#basepapermedicinesupplychain-baseline)
  - [EthicalSupplyChain (Proposed)](#ethicalsupplychain-proposed)
  - [Key Differences](#key-differences)
- [Tests](#tests)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Components](#components)
  - [Design System](#design-system)
  - [Web3 Integration](#web3-integration)
- [Documentation](#documentation)
- [Environment Variables](#environment-variables)
- [Tech Stack Summary](#tech-stack-summary)
- [Remaining Work](#remaining-work)

---

## What This Is

A **blockchain-based ethical supply chain tracking system** built as a research prototype comparing a simpler base paper model against an enhanced proposal with multi-authority validation, role governance, and optimized on-chain storage. It's a Bun monorepo with a Solidity smart contract backend and a Next.js frontend.

**Research Contribution:** Replaces implicit single-point trust in traditional supply chain contracts with an explicit K-of-N multi-authority approval mechanism, ensuring ethical compliance is verified on-chain before products enter distribution.

---

## Architecture

```
User -> Next.js Frontend -> MetaMask -> Ethereum (Sepolia)
                                  |
                          API Route -> Filebase (IPFS)
```

**Monorepo structure:**

```
apps/web/              -> Next.js 16 + React 19 + Tailwind v4 frontend
packages/contracts/    -> Solidity + Hardhat smart contracts
.agents/skills/        -> Project-scoped agent skills
```

**Data flow:**
- **On-chain:** Product ID, lifecycle stage, owner, approval count, validation status
- **Off-chain (IPFS):** Certificates, compliance documents, quality reports

---

## Smart Contracts

### BasePaperMedicineSupplyChain (Baseline)

**File:** `packages/contracts/contracts/BasePaperMedicineSupplyChain.sol` (205 lines)

The original paper's system. Simple e-commerce flow with no regulatory oversight.

**Inherits:** `Ownable2Step`, `ReentrancyGuard` (OpenZeppelin)

**FSM (Finite State Machine):**

```
Created -> ForSale -> Sold -> Shipped -> Received -> Consumed
```

**Struct:**

| Field | Type | Description |
|-------|------|-------------|
| upc | uint256 | Universal product code |
| name | string | Medicine name |
| details | string | Description |
| stateLabel | string | Human-readable state string |
| owner | address payable | Current owner |
| buyer | address payable | Purchaser |
| price | uint256 | Sale price in wei |
| state | ProductState | Enum state index |

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| addConsumer(address) | onlyOwner | Registers new consumer |
| renounceConsumer() | onlyConsumer | Consumer unregisters itself |
| createMedicine(upc, name, details) | anyone | Creates a product |
| sellMedicine(upc, price) | owner only | Lists product for sale |
| buyMedicine(upc) | consumer only | Buys product with ETH |
| shipMedicine(upc) | owner only | Ships product to buyer |
| receiveMedicine(upc) | buyer only | Buyer receives product |
| consumeMedicine(upc) | owner only | Marks product consumed |
| getProduct(upc) | view | Returns full product struct |

**Key characteristics:**
- On-chain ETH payments with overpayment refunds
- Reentrancy guard on buy operation only
- No ethical validation, no role governance, no blacklist
- String-based state labels (gas-inefficient)

---

### EthicalSupplyChain (Proposed)

**File:** `packages/contracts/contracts/EthicalSupplyChain.sol` (296 lines)

The enhanced system with 3 core innovations: multi-authority validation, optimized storage, and dynamic role governance.

**Inherits:** `AccessControlEnumerable`, `Pausable` (OpenZeppelin)

**Roles:**

| Role | Constant | Purpose |
|------|----------|---------|
| DEFAULT_ADMIN_ROLE | bytes32(0) | Register/revoke actors, manage blacklist, pause |
| MANUFACTURER_ROLE | keccak256("MANUFACTURER_ROLE") | Register products, advance early stages |
| DISTRIBUTOR_ROLE | keccak256("DISTRIBUTOR_ROLE") | Advance distribution stage |
| RETAILER_ROLE | keccak256("RETAILER_ROLE") | Advance retail/sold stages |
| AUTHORITY_ROLE | keccak256("AUTHORITY_ROLE") | Approve/reject ethical validation |

**FSM (Finite State Machine):**

```
Created -> Manufactured -> [VALIDATION GATE] -> Distributed -> Retail -> Sold
```

The transition from Manufactured to Distributed is **blocked** until `threshold` number of authorities approve.

**Validation Sub-FSM:**

```
Pending
  |
  | approveProduct() -- approvalCount++
  |   if approvalCount >= threshold -> Approved
  |
  | rejectProduct() -- rejectionCount++
  |   if rejectionCount >= threshold -> Rejected
  |
  v
Approved  --or--  Rejected
```

**Struct (Optimized):**

| Field | Type | Description |
|-------|------|-------------|
| certificateHash | bytes32 | Hash of off-chain certificate |
| currentCustodian | address | Who currently holds the product |
| createdAt | uint32 | Block timestamp of creation |
| updatedAt | uint32 | Block timestamp of last update |
| stage | uint8 | ProductStage index |
| validationStatus | uint8 | ValidationStatus index |
| approvalCount | uint8 | Number of authority approvals |
| rejectionCount | uint8 | Number of authority rejections |

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| registerActor(role, account) | admin | Grants a role to an account |
| revokeActor(role, account) | admin | Revokes a role |
| setAuthorityThreshold(threshold) | admin | Updates approval threshold |
| setBlacklist(account, status) | admin | Blacklists/un-blacklists account |
| pause() / unpause() | admin | Emergency stop |
| registerProduct(id, hash) | manufacturer | Creates product at stage Created |
| advanceStage(id, nextCustodian) | role-gated | Advances product stage by 1 |
| approveProduct(id) | authority | Votes to approve product |
| rejectProduct(id) | authority | Votes to reject product |
| getProduct(id) | view | Returns full product struct |
| getProductSummary(id) | view | Returns key fields tuple |
| productExists(id) | view | Returns bool |

**Key characteristics:**
- Full RBAC with 4 roles + admin
- Multi-authority threshold approval (K-of-N)
- Blacklist enforcement via `onlyActiveRole` modifier
- Pausable for emergency stops
- Compact `uint8`/`uint32` struct packing (gas-optimized)
- No ETH transfers (custody chain focus)
- IPFS certificate hash for off-chain evidence

---

### Key Differences

| Aspect | Base Paper | Proposed |
|--------|------------|----------|
| Access control | Ownable2Step + consumer bool | RBAC with 4 roles |
| Product ID | uint256 upc | bytes32 hash |
| Validation | None | K-of-N authority approval |
| Governance | None | Blacklist, pause, role revocation |
| State encoding | Enum + strings | uint8 packed structs |
| Payment | ETH transfers | None (custody chain) |
| Reentrancy | Guarded on buy | Not needed |
| Custody tracking | owner/buyer fields | currentCustodian field |
| Timestamps | None | uint32 createdAt/updatedAt |
| Pausable | No | Yes |

**Core architectural difference:** The base paper contract is a simple e-commerce supply chain with no regulatory oversight. The proposed contract introduces a custody chain with role-based actors and an ethical validation gate enforced by multi-authority threshold voting. A product cannot advance from manufacturing to distribution without passing the approval of a configurable number of regulatory authorities.

---

## Tests

**Total: 18 tests across 3 files.**

### EthicalSupplyChain.ts (12 tests)

| # | Test | What It Covers |
|---|------|----------------|
| 1 | rejects zero-address admin at deployment | Constructor validation |
| 2 | registers a product and completes the gated lifecycle | Full happy path with validation gate |
| 3 | blocks duplicate or mixed votes from the same authority | AlreadyValidated error |
| 4 | closes validation after the approval threshold is reached | ValidationClosed error |
| 5 | marks a product as rejected when threshold rejections are reached | Rejected product stuck at Manufactured |
| 6 | blocks blacklisted actors from registration and validation | AccountBlacklisted error |
| 7 | blocks blacklisted custodians from advancing stage | AccountBlacklisted on advanceStage |
| 8 | restricts stage transitions to current custodian with expected role | NotCurrentCustodian, InvalidRoleForStage |
| 9 | requires the next custodian to match the next lifecycle role | InvalidNextCustodian |
| 10 | enforces threshold governance rules | InvalidThreshold, ThresholdWouldExceedAuthorityCount |
| 11 | rejects zero-address registrations and blacklist updates | InvalidAccount |
| 12 | lets admin pause and unpause user-facing actions | Pausable functionality |

### BasePaperMedicineSupplyChain.ts (5 tests)

| # | Test | What It Covers |
|---|------|----------------|
| 1 | full lifecycle: create -> sell -> buy -> ship -> receive -> consume | Happy path |
| 2 | rejects zero-address consumer registration | InvalidAccount |
| 3 | unregistered outsider cannot buy medicine | ConsumerNotRegistered |
| 4 | product can go from Created to Shipped without validation | No validation gate |
| 5 | refunds buyer overpayment | ETH refund mechanism |

### Comparison.spec.ts (1 test)

| # | Test | What It Covers |
|---|------|----------------|
| 1 | side-by-side: base goes to Shipped, proposed blocked at Manufactured | Core research contribution |

---

## Frontend

### Pages

| Route | File | Purpose |
|-------|------|---------|
| / | src/app/page.tsx | Landing page with 7 sections explaining base vs proposed |
| /verify | src/app/verify/page.tsx | Read-only product lookup with QR code generation |
| /api/ipfs/upload | src/app/api/ipfs/upload/route.ts | Server route for Filebase IPFS uploads |

### Components

#### Navigation

| Component | Type | Description |
|-----------|------|-------------|
| SiteNav | Server | Navigation header with Home/Verify links and contract status badges |

#### Home Page Sections

| Component | Type | Description |
|-----------|------|-------------|
| HeroSection | Server | Headline, badge pills, metrics cards, validation rule sidebar |
| SystemSections | Server | Base modules (3), proposed modules (4), lifecycle stages (5) |
| WorkingFlowSections | Server | Side-by-side base vs proposed step-by-step flows |
| ResearchGapsSection | Server | 4 research gap cards with titles and details |
| ComparisonSection | Server | 5-row feature comparison table (base vs proposed) |
| BuildStatusSection | Server | Milestone roadmap + stack alignment info |
| WalletConsole | Client | Full interactive Web3 demo with MetaMask integration |

#### Verify Page

| Component | Type | Description |
|-----------|------|-------------|
| VerificationConsole | Client | Read-only product lookup with QR codes for both contracts |

#### WalletConsole Features

- MetaMask wallet connection with Sepolia network enforcement
- Network switching via `wallet_switchEthereumChain`
- Base contract actions: Create, Sell, Buy, Ship, Receive, Consume, Read
- Proposed contract actions: Register, Advance Stage, Approve, Reject, Read Summary
- IPFS evidence upload via `/api/ipfs/upload`
- Sophisticated Solidity error decoder (12+ custom errors mapped to human-readable messages)
- Dual-panel layout: base contract on left, proposed on right

#### VerificationConsole Features

- Two input fields: UPC (base) and Product seed (proposed)
- Read-only contract calls for both systems
- QR code generation linking to `/verify?upc=...&seed=...`
- Pre-fills from URL search params

### Design System

**Theme:** Warm parchment/paper aesthetic

| Token | Value | Usage |
|-------|-------|-------|
| --background | #f5efe2 | Page background (cream) |
| --foreground | #18261f | Primary text (forest green) |
| --panel | rgba(255,251,243,0.78) | Semi-transparent panel |
| --panel-strong | rgba(255,248,236,0.94) | Opaque panel |
| --line | rgba(24,38,31,0.12) | Border color |
| --muted | #5e6f63 | Muted text (sage green) |
| --accent | #1f6b4f | Primary accent (forest green) |
| --accent-soft | #d3e6d8 | Soft accent background |
| --ink-gold | #9d6b2f | Gold/amber accent |

**Fonts:**
- Display: Cormorant Garamond (500-700 weights) — headings
- Body: Manrope (400-700 weights) — default text

**Utility classes:**
- `.paper-grid` — 42px grid lines with thin green lines
- `.paper-noise` — subtle paper texture via radial-gradient dots
- `.display-type` — applies Cormorant Garamond for headings

**Styling:** Tailwind CSS v4 with CSS-based configuration (no tailwind.config.js). Glass-morphism panels with backdrop-blur. Large rounded corners (22px-32px).

### Web3 Integration

**Library:** ethers.js v6

**Contract ABIs** (`src/lib/contracts.ts`):
- `basePaperAbi` — 18 entries (7 errors, 7 functions)
- `proposedAbi` — 17 entries (10 errors, 5 functions)

**Configuration:**
- `contractConfig` reads from `NEXT_PUBLIC_*` environment variables
- Default chain: Sepolia (chain ID 11155111)

**IPFS Flow:**
1. User uploads file in WalletConsole
2. POST to `/api/ipfs/upload`
3. Route forwards to `https://rpc.filebase.io/api/v0/add` with Bearer auth
4. Returns IPFS CID
5. CID is hashed via `ethers.id()` and stored as `certificateHash` on-chain

---

## Documentation

| File | Lines | Content |
|------|-------|---------|
| PLAN.md | 292 | Master project plan: objectives, base model, gaps, proposed improvements, architecture, algorithms, tech stack, 7-phase implementation |
| ARCHITECTURE_DIAGRAMS.md | 78 | 5 Mermaid diagrams: system flowchart, both workflows, trust model comparison, demo sequence |
| IMPLEMENTATION_NOTES.md | 105 | 8 problems encountered and their fixes |
| METHODOLOGY_REPORT.md | 139 | Research methodology, comparison criteria, testing approach, gas snapshot data |
| TESTING.md | 97 | Testing guide, deployment steps, demo walkthrough, verified RPC checks |
| tasks.md | 75 | Task tracker — 27 of 38 items complete (71%) |
| PROJECT_SUMMARY.md | — | This document |

---

## Environment Variables

### Smart Contracts (`packages/contracts/.env`)

| Variable | Description |
|----------|-------------|
| SEPOLIA_RPC_URL | Alchemy/Infura Sepolia RPC endpoint |
| PRIVATE_KEY | Deployer wallet private key (no 0x prefix) |
| ETHERSCAN_API_KEY | Etherscan API key for contract verification |
| AUTHORITY_THRESHOLD | Number of authority approvals required (default: 2) |

### Web Frontend (`apps/web/.env.local`)

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_BASE_CONTRACT_ADDRESS | Deployed baseline contract address |
| NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS | Deployed proposed contract address |
| NEXT_PUBLIC_DEMO_CHAIN_ID | Chain ID (default: 11155111 = Sepolia) |
| NEXT_PUBLIC_DEMO_CHAIN_NAME | Network name (default: Sepolia) |
| FILEBASE_RPC_API_KEY | Filebase bucket-scoped IPFS RPC API key |

### Current Sepolia Deployments

| Contract | Address |
|----------|---------|
| BasePaperMedicineSupplyChain | `0x0262C4dEc9A16A5962e862926DD1AdA94c64A302` |
| EthicalSupplyChain | `0x32dA54F4c606fccB17fcB3f41416529b181cE4C7` |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.24 |
| Contract Libraries | OpenZeppelin (AccessControlEnumerable, Pausable, Ownable2Step, ReentrancyGuard) |
| Contract Tooling | Hardhat, Chai, ethers.js v6, typechain |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-based config) |
| Storage | IPFS via Filebase RPC API |
| Wallet | MetaMask (EIP-1193) |
| Package Manager | Bun 1.3.5 (workspaces) |
| Blockchain | Ethereum Sepolia testnet |
| Optimizer | Solidity optimizer enabled (200 runs) |

---

## Remaining Work

### Research Framing (4 tasks)

- [ ] Review the base paper and extract the original lifecycle, storage model, and trust assumptions
- [ ] Write a gap analysis comparing the base system with the proposed ethical supply chain system
- [ ] Define the exact research contribution claims for validation, storage optimization, and governance
- [ ] Convert the qualitative evaluation section into measurable criteria and test cases

### Frontend (1 task)

- [ ] Add role-aware sections for product registration, lifecycle tracking, and authority approval

### Testing (2 tasks)

- [ ] Compare storage and gas implications of compact stage encoding versus string-based state
- [ ] Document assumptions, limitations, and security tradeoffs

### Documentation and Presentation (5 tasks)

- [ ] Draw architecture and workflow diagrams
- [ ] Write the methodology section from the implemented design
- [ ] Build a comparison table against the base paper system
- [ ] Prepare screenshots, metrics, and demo flow notes for presentation
- [ ] Prepare a viva-friendly explanation of the base algorithm, gaps, and proposed algorithm
