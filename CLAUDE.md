# CLAUDE.md

## Project summary
This repository contains a research-driven blockchain supply-chain project with two layers:

- a **baseline system** that mirrors the selected paper `DOCs/Blockchain-Based-Medicine-Supply-Chain-for-Transparent-Healthcare-Tracking.pdf`
- a **proposed product system** that extends the baseline with threshold-based ethical validation and stronger governance

The baseline exists for comparison, tests, and panel discussion.
The proposed system is the actual product that the web app should prioritize.

## Product direction
The end-user product should focus on the proposed contract, not the baseline.

Current product intent:

- `/`
  - landing / overview page
  - currently mixes product demo and research explanation
  - should become a stronger product landing page over time
- `/verify`
  - proposed-system verification page
  - supports manual lookup and QR generation
  - QR scanning is a target feature when not yet present
- `/console`
  - planned operator dashboard for the proposed system
  - should eventually hold the full role-based workflow for admin, manufacturer, authority, distributor, and retailer

Important:

- do not remove the baseline contract/tests unless explicitly asked
- do not let the baseline dominate the product-facing UI

## Repository layout
- `apps/web`
  - Next.js App Router app
  - TypeScript
  - Tailwind CSS v4
- `packages/contracts`
  - Hardhat-based Solidity workspace
  - contracts, tests, deploy scripts
- `DOCs/`
  - source paper and research material
- root docs
  - `tasks.md`
  - `TESTING.md`
  - `IMPLEMENTATION_NOTES.md`
  - `METHODOLOGY_REPORT.md`
  - `ARCHITECTURE_DIAGRAMS.md`

## Core contracts

### Baseline comparison contract
- `packages/contracts/contracts/BasePaperMedicineSupplyChain.sol`

Models the paper-like medicine flow:

1. create medicine with UPC
2. sell medicine
3. buy medicine
4. ship medicine
5. receive medicine
6. consume medicine

Notes:

- no multi-authority gate
- simpler state model
- intended for comparison only

### Proposed product contract
- `packages/contracts/contracts/EthicalSupplyChain.sol`

Models the product flow:

1. register product with `bytes32 productId` and `bytes32 certificateHash`
2. advance `Created -> Manufactured`
3. authority approvals/rejections
4. threshold decides `Approved` or `Rejected`
5. only approved products continue into later lifecycle stages

Important controls:

- `DEFAULT_ADMIN_ROLE`
- `MANUFACTURER_ROLE`
- `DISTRIBUTOR_ROLE`
- `RETAILER_ROLE`
- `AUTHORITY_ROLE`
- blacklist support
- pause/unpause support
- duplicate-vote prevention
- current-custodian checks
- next-custodian role checks

## Current deployed contracts

### Sepolia
- Base paper contract: `0x0262C4dEc9A16A5962e862926DD1AdA94c64A302`
- Proposed contract: `0x32dA54F4c606fccB17fcB3f41416529b181cE4C7`

The frontend should point to the proposed Sepolia deployment for real demos.

## Important files

### Contracts and tests
- `packages/contracts/contracts/BasePaperMedicineSupplyChain.sol`
- `packages/contracts/contracts/EthicalSupplyChain.sol`
- `packages/contracts/test/BasePaperMedicineSupplyChain.ts`
- `packages/contracts/test/EthicalSupplyChain.ts`
- `packages/contracts/test/Comparison.spec.ts`

### Deployment and metrics
- `packages/contracts/scripts/deploy-base.ts`
- `packages/contracts/scripts/deploy-proposed.ts`
- `packages/contracts/scripts/compare-gas.ts`

### Web app
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/verify/page.tsx`
- `apps/web/src/components/demo/wallet-console.tsx`
- `apps/web/src/components/verify/verification-console.tsx`
- `apps/web/src/components/shared/site-nav.tsx`
- `apps/web/src/app/api/ipfs/upload/route.ts`
- `apps/web/src/lib/contracts.ts`

## Filebase IPFS integration
Use the Filebase **IPFS RPC API**, not the Filebase SDK and not the S3-compatible API.

Current route:
- `apps/web/src/app/api/ipfs/upload/route.ts`

Endpoint:
- `https://rpc.filebase.io/api/v0/add`

Auth:
- `Authorization: Bearer <FILEBASE_RPC_API_KEY>`

Returned value:
- CID from the RPC response `Hash`

The CID is hashed client-side into the `certificateHash` used by the proposed contract.

## Environment variables

### Frontend env
File:
- `apps/web/.env.local`

Expected keys:
- `NEXT_PUBLIC_BASE_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_DEMO_CHAIN_ID`
- `NEXT_PUBLIC_DEMO_CHAIN_NAME`
- `FILEBASE_RPC_API_KEY`

Notes:

- `FILEBASE_RPC_API_KEY` is server-side only even though it is stored in the frontend app env file
- do not expose secrets via `NEXT_PUBLIC_*`

### Contracts env
File:
- `packages/contracts/.env`

Expected keys:
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- `ETHERSCAN_API_KEY`
- `AUTHORITY_THRESHOLD`

## Commands

### Web
- `bun run dev:web`
- `bun run build:web`
- `bun run lint:web`

### Contracts
- `bun run test:contracts`
- `bun run deploy:base:local`
- `bun run deploy:proposed:local`
- `bun run deploy:base:localhost`
- `bun run deploy:proposed:localhost`
- `bun run deploy:base:sepolia`
- `bun run deploy:proposed:sepolia`
- `bun run compare:gas`

## MetaMask and network rules
The live demo is meant to run on **Sepolia**.

Expected defaults:

- chain id: `11155111`
- chain name: `Sepolia`

UI expectations:

- detect wrong network
- offer `Switch to Sepolia`
- explain that MetaMask may show `ETH`, but on Sepolia that means **test ETH**, not mainnet ETH

## Error handling expectations
Frontend contract interactions should convert common custom errors into readable messages.

Especially handle:

- product already exists
- unknown product
- invalid lifecycle state
- unauthorized actor
- insufficient payment / wrong bid
- validation required
- duplicate authority vote
- wrong role for stage
- not current custodian

Avoid dumping raw ethers `estimateGas` failure text directly to the user when a clearer explanation is possible.

## Testing expectations
Before finishing substantial work, run:

- `bun run test:contracts`
- `bun run lint:web`
- `bun run build:web`

Current contract coverage includes:

- baseline lifecycle flow
- proposed lifecycle and validation flow
- blacklist behavior
- pause/unpause behavior
- zero-address guards
- comparison between baseline and proposed behavior

## Current implementation status
Implemented:

- baseline comparison contract
- proposed product contract
- baseline vs proposed tests
- Sepolia deployments for both contracts
- Filebase RPC upload route
- live wallet demo console
- manual verification page
- QR generation for verification links
- gas comparison script

Still in progress / missing:

- richer `/console` operator dashboard
- cleaner product-style landing page on `/`
- QR scanning if not yet implemented
- final presentation screenshots and viva script
- optional Etherscan verification when API key is available

## Source-of-truth docs
Read these first when you need project context:

1. `tasks.md`
2. `TESTING.md`
3. `IMPLEMENTATION_NOTES.md`
4. `METHODOLOGY_REPORT.md`
5. `ARCHITECTURE_DIAGRAMS.md`

## Repo-specific guidance
- prefer small, local changes
- preserve the baseline system for research comparison
- prioritize the proposed system in product-facing UI
- use `apply_patch` for manual edits
- use Bun commands from the repo root
- if changing Next.js behavior, respect `apps/web/AGENTS.md` and `apps/web/CLAUDE.md`
