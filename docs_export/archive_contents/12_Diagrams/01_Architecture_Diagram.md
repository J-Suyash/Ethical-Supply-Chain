# Architecture Diagram

## Mermaid Code

```mermaid
flowchart LR
    subgraph User_Layer
        U[User / Stakeholder]
    end

    subgraph Frontend_Layer
        F[Next.js App Router<br/>TypeScript + Tailwind v4]
        API[API Route<br/>/api/ipfs/upload]
    end

    subgraph Wallet_Layer
        W[MetaMask / Browser Wallet<br/>EIP-1193 Provider]
    end

    subgraph Blockchain_Layer
        subgraph Sepolia_Testnet
            BASE[BasePaperMedicineSupplyChain.sol<br/>0x0262...A302]
            PROP[EthicalSupplyChain.sol<br/>0x32dA...E4C7]
        end
    end

    subgraph OffChain_Storage
        FB[Filebase IPFS RPC API]
        IPFS[IPFS Network]
    end

    U --> F
    F --> W
    F --> API
    W --> BASE
    W --> PROP
    API --> FB
    FB --> IPFS
    IPFS -->|CID| PROP

    style PROP fill:#e1f5e1,stroke:#2e7d32,stroke-width:2px
    style BASE fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style F fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style FB fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

## Text Description

**Layer 1 — User:** Stakeholders include Manufacturer, Distributor, Retailer, Authority, Admin, and Public Verifier.

**Layer 2 — Frontend:** Next.js 16 App Router with TypeScript and Tailwind CSS v4. Two main routes: `/` (landing + demo console) and `/verify` (public verification + QR).

**Layer 3 — Wallet:** MetaMask injects EIP-1193 provider. Frontend uses Ethers.js v6 to interact.

**Layer 4 — Blockchain:** Sepolia Testnet (Chain ID 11155111). Two deployed contracts:
- Baseline: `0x0262C4dEc9A16A5962e862926DD1AdA94c64A302`
- Proposed: `0x32dA54F4c606fccB17fcB3f41416529b181cE4C7`

**Layer 5 — Off-Chain Storage:** Filebase IPFS RPC API pins certificate evidence. Returned CID is hashed and stored in the proposed contract.
