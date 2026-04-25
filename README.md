# Ethical Supply Chain

Blockchain-based pharmaceutical supply chain tracking system with multi-authority validation, deployed on Ethereum Sepolia.

## Overview

Ethical Supply Chain is a research-driven, production-grade system that tracks medicines through their full lifecycle — from manufacturer to consumer — using smart contracts on Ethereum. A threshold-based multi-authority validation gate ensures that only ethically verified products advance through the supply chain.

## Key Features

- **Smart Contract Verification** — On-chain lifecycle tracking with role-based access control (Admin, Manufacturer, Authority, Distributor, Retailer)
- **Multi-Authority Validation** — Threshold-based approval system where multiple authorities must validate a product before it proceeds
- **IPFS Certificate Storage** — Product certificates stored on Filebase IPFS with CID-based integrity verification
- **QR Code Verification** — Generate and scan QR codes to verify product authenticity on-chain
- **Blacklist & Pause Controls** — Admin-level safety mechanisms for compromised actors or emergency halts
- **Gas-Optimized Design** — Comparison-tested against a baseline implementation for efficiency

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Blockchain | Solidity, Hardhat, Ethers.js v6 |
| Storage | Filebase IPFS (RPC API) |
| Network | Ethereum Sepolia Testnet (Chain ID: 11155111) |
| Deployment | Cloudflare Pages (wrangler) |
| Package Manager | Bun |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3.5
- MetaMask browser extension (for live demo)
- Node.js >= 18

### Install Dependencies

```bash
bun install
```

### Run the Web App

```bash
bun run dev:web
```

The app will be available at `http://localhost:3000`.

### Run Contract Tests

```bash
bun run test:contracts
```

### Lint the Web App

```bash
bun run lint:web
```

### Build for Production

```bash
bun run build:web
```

## Deployment

### Cloudflare Pages

The app is configured for static export and deployment via Cloudflare Pages:

```bash
bun run build:web
npx wrangler pages deploy apps/web/out --project-name=ethical-supply-chain
```

Configuration is in `wrangler.toml` at the repo root.

### Contract Deployment

Deploy the baseline or proposed contract to a local Hardhat node:

```bash
bun run deploy:base:local
bun run deploy:proposed:local
```

Deploy to Sepolia testnet:

```bash
bun run deploy:base:sepolia
bun run deploy:proposed:sepolia
```

### Gas Comparison

Compare gas usage between baseline and proposed contracts:

```bash
bun run compare:gas
```

## Environment Variables

### Frontend (`apps/web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BASE_CONTRACT_ADDRESS` | Baseline contract address on Sepolia |
| `NEXT_PUBLIC_PROPOSED_CONTRACT_ADDRESS` | Proposed contract address on Sepolia |
| `NEXT_PUBLIC_DEMO_CHAIN_ID` | Chain ID (default: `11155111`) |
| `NEXT_PUBLIC_DEMO_CHAIN_NAME` | Chain name (default: `Sepolia`) |
| `FILEBASE_RPC_API_KEY` | Filebase IPFS RPC API key (server-side only) |

### Contracts (`packages/contracts/.env`)

| Variable | Description |
|---|---|
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint |
| `PRIVATE_KEY` | Deployer wallet private key |
| `ETHERSCAN_API_KEY` | Etherscan API key for verification |
| `AUTHORITY_THRESHOLD` | Number of authority approvals required |

## Directory Structure

```
├── apps/
│   └── web/                  # Next.js frontend application
│       ├── src/
│       │   ├── app/          # App Router pages (/, /verify, /console)
│       │   ├── components/   # React components (demo, verify, shared)
│       │   └── lib/          # Contract ABIs, utilities
│       └── out/              # Static build output (for Cloudflare Pages)
├── packages/
│   └── contracts/            # Hardhat Solidity workspace
│       ├── contracts/        # Smart contracts
│       │   ├── BasePaperMedicineSupplyChain.sol   # Baseline (paper comparison)
│       │   └── EthicalSupplyChain.sol             # Proposed product contract
│       ├── test/             # Contract test suites
│       └── scripts/          # Deployment and comparison scripts
├── DOCs/                     # Research papers and reference material
├── wrangler.toml             # Cloudflare Pages configuration
└── package.json              # Root workspace configuration
```

## Live Demo

The deployed frontend connects to the **Ethereum Sepolia testnet**. You will need MetaMask configured for Sepolia and some test ETH to interact with the contract.

- **Proposed Contract (Sepolia):** `0x32dA54F4c606fccB17fcB3f41416529b181cE4C7`
- **Baseline Contract (Sepolia):** `0x0262C4dEc9A16A5962e862926DD1AdA94c64A302`

> Note: MetaMask may display the balance as "ETH", but on Sepolia this is test ETH with no real-world value.

## Architecture

The system consists of two parallel contracts:

1. **Baseline Contract** (`BasePaperMedicineSupplyChain.sol`) — Mirrors the academic paper's medicine flow for comparison purposes. Simpler state model with no multi-authority gate.

2. **Proposed Contract** (`EthicalSupplyChain.sol`) — The production product. Extends the baseline with threshold-based ethical validation, role-based access control, blacklist support, and pause/unpause mechanisms.

The frontend prioritizes the proposed contract for all product-facing interactions while preserving the baseline for research comparison.

## License

Research project — see repository for details.
