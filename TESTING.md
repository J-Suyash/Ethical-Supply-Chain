# Testing Guide

## Current completeness
- The baseline contract from the base paper is implemented.
- The proposed contract with threshold validation and governance is implemented.
- The landing page comparison view is implemented.
- Wallet-connected contract demo and Filebase IPFS upload flow are implemented.
- The live demo console can now create, sell, buy, ship, receive, consume, register, approve, reject, and read product summaries.

## Local testing
- Run contract tests:
  - `bun run test:contracts`
- Run the frontend locally:
  - `bun run dev:web`
- Validate frontend quality:
  - `bun run lint:web`
  - `bun run build:web`

## Local deployment
- Deploy the baseline contract to the local Hardhat network:
  - `bun run deploy:base:local`
- Deploy the proposed contract to the local Hardhat network:
  - `bun run deploy:proposed:local`

## Persistent local blockchain for manual interaction
1. Start a local node in one terminal:
   - `bunx hardhat node --config packages/contracts/hardhat.config.ts`
2. Deploy to that node from the project root in another terminal:
   - `bun run deploy:base:localhost`
   - `bun run deploy:proposed:localhost`
3. Use the printed addresses for later frontend or script integration.

## Testnet deployment
1. Copy `packages/contracts/.env.example` to `packages/contracts/.env`
2. Fill in:
   - `SEPOLIA_RPC_URL`
   - `PRIVATE_KEY`
   - `ETHERSCAN_API_KEY` (optional for verification later)
   - `AUTHORITY_THRESHOLD`
3. Fund the deployer wallet with Sepolia ETH from a faucet.
4. Deploy:
   - `bun run deploy:base:sepolia`
   - `bun run deploy:proposed:sepolia`
5. Current Sepolia deployments:
   - Base paper contract: `0x0262C4dEc9A16A5962e862926DD1AdA94c64A302`
   - Proposed contract: `0x32dA54F4c606fccB17fcB3f41416529b181cE4C7`
6. Note:
   - Contract verification on Etherscan was skipped because `ETHERSCAN_API_KEY` is not configured yet.

## Frontend live integration setup
1. Copy `apps/web/.env.example` to `apps/web/.env.local`
2. Set:
   - `NEXT_PUBLIC_BASE_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS`
   - `FILEBASE_RPC_API_KEY`
3. Start the frontend:
   - `bun run dev:web`
4. Open the live demo console on the homepage.
5. Connect MetaMask and use a wallet that has the right contract role.
6. Upload a document through the proposed-system panel to pin it to Filebase IPFS and use the returned CID in the certificate hash flow.
7. If MetaMask is on the wrong network, use the in-app `Switch to Sepolia` button first.

## Verified RPC checks
- Direct Filebase RPC authentication check:
  - `curl -X POST -H "Authorization: Bearer <api-key>" "https://rpc.filebase.io/api/v0/version"`
- Local upload route check:
  - `curl -X POST "http://127.0.0.1:3000/api/ipfs/upload" -F "file=@/path/to/file"`

## Browser demo routes
- Main comparison and live interaction:
  - `http://127.0.0.1:3000/`
- Manual verification page:
  - `http://127.0.0.1:3000/verify`

## Gas comparison snapshot
- Run:
  - `bun run compare:gas`
- This prints a simple side-by-side gas estimate for baseline and proposed flows.

## What to demonstrate
- Baseline system:
  - Create medicine
  - Put it for sale
  - Buy, ship, receive, consume
  - Note that no ethical validation is required
- Proposed system:
  - Register product
  - Move to manufacturing
  - Show that movement to distribution is blocked until threshold approvals are reached
  - Show blacklist and authority-governance protections

## What is not complete yet
- Frontend forms for live interaction with deployed contracts
- Automated gas comparison scripts
- Filebase upload depends on a valid bucket-scoped RPC API key
- Public QR/manual verification flow
- Report-ready diagrams and methodology write-up
