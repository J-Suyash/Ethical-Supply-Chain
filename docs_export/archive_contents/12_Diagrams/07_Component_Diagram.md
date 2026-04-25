# Component Diagram

## Mermaid Code

```mermaid
flowchart TB
    subgraph Frontend
        direction TB
        Pages[Pages<br/>/ , /verify]
        Components[Components<br/>WalletConsole, VerificationConsole, SiteNav]
        Lib[Lib<br/>contracts.ts, wallet.ts, domain.ts]
        API[API Routes<br/>/api/ipfs/upload]
    end

    subgraph Wallet
        MM[MetaMask<br/>EIP-1193 Provider]
    end

    subgraph Contracts
        direction TB
        BASE[BasePaperMedicineSupplyChain.sol<br/>Baseline Comparison]
        PROP[EthicalSupplyChain.sol<br/>Proposed Product]
    end

    subgraph Testing
        direction TB
        T1[EthicalSupplyChain.ts<br/>Proposed tests]
        T2[BasePaperMedicineSupplyChain.ts<br/>Baseline tests]
        T3[Comparison.spec.ts<br/>Side-by-side tests]
        T4[compare-gas.ts<br/>Gas metrics]
    end

    subgraph Deployment
        direction TB
        D1[deploy-base.ts<br/>Local + Sepolia]
        D2[deploy-proposed.ts<br/>Local + Sepolia]
    end

    subgraph External
        FB[Filebase IPFS RPC<br/>Certificate Storage]
        SEP[Sepolia Testnet<br/>Chain 11155111]
    end

    Pages --> Components
    Components --> Lib
    Lib --> API
    Lib --> MM
    MM --> BASE
    MM --> PROP
    API --> FB
    BASE --> SEP
    PROP --> SEP
    T1 --> PROP
    T2 --> BASE
    T3 --> BASE
    T3 --> PROP
    T4 --> BASE
    T4 --> PROP
    D1 --> BASE
    D2 --> PROP

    style PROP fill:#e1f5e1,stroke:#2e7d32,stroke-width:2px
    style BASE fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style T3 fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style FB fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

## Component Descriptions

| Component | Type | Responsibility |
|-----------|------|----------------|
| **Pages** | Next.js App Router | Route handling for `/` (landing + demo) and `/verify` (public lookup) |
| **Components** | React Components | WalletConsole (live interaction), VerificationConsole (QR + lookup), SiteNav (navigation) |
| **Lib** | TypeScript Modules | Contract ABIs/config, wallet utilities, domain types/stage definitions |
| **API Routes** | Next.js API | Filebase IPFS upload proxy (`/api/ipfs/upload`) |
| **MetaMask** | Browser Extension | Wallet connection, transaction signing, network switching |
| **Base Contract** | Solidity | Baseline system for research comparison |
| **Proposed Contract** | Solidity | Main product with threshold validation |
| **Test Suites** | Hardhat + Chai | Feature tests, security tests, comparison tests, gas benchmarks |
| **Deploy Scripts** | Hardhat Scripts | Local deployment and Sepolia testnet deployment |
| **Filebase** | External API | IPFS pinning for certificate evidence |
| **Sepolia** | External Network | Ethereum testnet for live demos |
