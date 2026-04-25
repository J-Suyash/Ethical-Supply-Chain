# 9. Technology Stack

## Final Confirmed Stack

| Layer | Technology | Version / Details |
|-------|-----------|-------------------|
| **Smart Contract Language** | Solidity | `^0.8.24` |
| **Contract Framework** | Hardhat | `^2.24.1` |
| **Contract Testing** | Chai + Hardhat Toolbox | `@nomicfoundation/hardhat-toolbox ^5.0.0` |
| **Contract Security Libraries** | OpenZeppelin Contracts | `v4.9.6` — AccessControlEnumerable, Pausable, ReentrancyGuard, Ownable2Step |
| **Frontend Framework** | Next.js | `16.2.1` (App Router) |
| **Frontend Language** | TypeScript | `^5` |
| **Styling** | Tailwind CSS | `v4` |
| **Blockchain Library** | Ethers.js | `^6.16.0` |
| **Wallet Integration** | MetaMask | EIP-1193 browser provider |
| **Off-Chain Storage** | IPFS via Filebase | RPC API endpoint: `https://rpc.filebase.io/api/v0/add` |
| **QR Codes** | qrcode (npm) | `^1.5.4` — generation for verification links |
| **Package Manager** | Bun | `1.3.5` |
| **Target Network** | Sepolia Testnet | Chain ID `11155111` |
| **Local Blockchain** | Hardhat Network | For local development and testing |

## Notable Exclusions

- **Ganache** — Not used. Hardhat local node is used instead (`hardhat node`).
- **Filebase SDK** — Not used. Direct RPC API is used for simpler pinning workflow.
- **AWS SDK / S3-compatible API** — Initially tried, then replaced with direct RPC API.

## Repository Structure

```
ethical-supply-chain/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/app/            # Pages: /, /verify
│       ├── src/components/     # UI components
│       ├── src/lib/            # Contracts, wallet, domain types
│       └── src/app/api/ipfs/   # Filebase upload route
├── packages/
│   └── contracts/              # Hardhat workspace
│       ├── contracts/          # .sol files
│       ├── test/               # .ts test suites
│       └── scripts/            # Deploy & gas comparison
└── DOCs/                       # Research paper & UML diagrams
```
