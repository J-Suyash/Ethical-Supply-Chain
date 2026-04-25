# 8. System Architecture

## Confirmed Architecture Flow

```
User / Stakeholder
    |
    v
Next.js Frontend (App Router, TypeScript, Tailwind CSS v4)
    |
    |---> MetaMask / Browser Wallet (EIP-1193 provider)
    |           |
    |           |---> BasePaperMedicineSupplyChain.sol (baseline comparison)
    |           |
    |           +---> EthicalSupplyChain.sol (proposed product)
    |                       |
    |                       +---> Sepolia Testnet (Chain ID: 11155111)
    |
    +---> Next.js API Route (/api/ipfs/upload)
                |
                v
        Filebase IPFS RPC API (https://rpc.filebase.io/api/v0/add)
                |
                v
            CID Returned
                |
                v
        Hashed into certificateHash
                |
                v
        Stored in EthicalSupplyChain.sol Product struct
```

## Exact Modules

| # | Module Name | File Location | Purpose |
|---|-------------|---------------|---------|
| 1 | **Role Governance** | `EthicalSupplyChain.sol` lines 70-128 | Admin-controlled actor onboarding, role revocation, blacklist enforcement, emergency pause/unpause |
| 2 | **Product Registry** | `EthicalSupplyChain.sol` lines 138-214 | Packed struct storage (`Product`), stage advancement, custodian transfer, state validation |
| 3 | **Ethical Validation** | `EthicalSupplyChain.sol` lines 216-258 | Authority approve/reject with threshold logic, duplicate-vote prevention, terminal rejection state |
| 4 | **Public Verification** | `apps/web/src/app/verify/page.tsx` + `getProductSummary()` | Read-only product lookup, QR code generation, manual seed-based verification |
| 5 | **IPFS Pinning** | `apps/web/src/app/api/ipfs/upload/route.ts` | Filebase RPC API integration for certificate evidence upload |
| 6 | **Wallet Console** | `apps/web/src/components/demo/wallet-console.tsx` | Live MetaMask interaction for register, advance, approve, reject, read |
| 7 | **Baseline System** | `BasePaperMedicineSupplyChain.sol` | Paper-mirror contract for comparison: create, sell, buy, ship, receive, consume |

## Data Flow

### Product Registration Flow
1. Manufacturer uploads certificate PDF to `/api/ipfs/upload`
2. Filebase returns CID
3. Frontend hashes CID with keccak256 → `certificateHash`
4. Manufacturer calls `registerProduct()` with product details + `certificateHash`
5. Contract stores packed `Product` struct on Sepolia

### Validation Flow
1. Product in `Manufactured` stage (1)
2. Authority 1 calls `approveProduct()` → approvalCount = 1
3. Authority 2 calls `approveProduct()` → approvalCount = 2
4. Threshold met (2 >= 2) → validationStatus = `Approved` (2)
5. Manufacturer calls `advanceStage()` → moves to `Distributed` (2)
6. Custodian transfers to Distributor → continues to Retail → Sold

### Public Verification Flow
1. User visits `/verify`
2. Enters product seed (e.g., "demo-product-001")
3. Frontend derives `productId = keccak256(seed)`
4. Calls `getProductSummary(productId)` read-only
5. Displays: name, batch, stage, validation status, approvals, rejections, custodian, MFG/EXP dates, certificate hash
6. QR code generated linking to same verification URL
