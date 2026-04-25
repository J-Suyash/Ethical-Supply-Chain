# Deployment Diagram

## Mermaid Code

```mermaid
flowchart TB
    subgraph Client_Device
        direction TB
        Browser[Web Browser<br/>Chrome / Firefox / Safari]
        MM[MetaMask Extension<br/>Private Key Storage]
    end

    subgraph Frontend_Host
        direction TB
        NextJS[Next.js App<br/>Server-Side Rendering]
        API[API Route<br/>/api/ipfs/upload]
    end

    subgraph Blockchain_Network
        direction TB
        Sepolia[Sepolia Testnet<br/>Ethereum PoS Test Network]
        BASE[BasePaperMedicineSupplyChain.sol<br/>0x0262...A302]
        PROP[EthicalSupplyChain.sol<br/>0x32dA...E4C7]
    end

    subgraph OffChain_Storage
        Filebase[Filebase IPFS Node<br/>rpc.filebase.io]
        IPFS[IPFS Network<br/>Distributed Storage]
    end

    subgraph Dev_Environment
        direction TB
        LocalNode[Hardhat Local Node<br/>localhost:8545]
        LocalBase[Base Contract<br/>Local Deployment]
        LocalProp[Proposed Contract<br/>Local Deployment]
    end

    Browser --> NextJS
    Browser --> MM
    MM -->|Signs transactions| Sepolia
    NextJS -->|Reads contract state| Sepolia
    API -->|Pins files| Filebase
    Filebase -->|Replicates| IPFS
    Sepolia --> BASE
    Sepolia --> PROP
    LocalNode --> LocalBase
    LocalNode --> LocalProp

    style PROP fill:#e1f5e1,stroke:#2e7d32,stroke-width:2px
    style BASE fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style Sepolia fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style Filebase fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

## Deployment Details

### Production / Testnet Deployment

| Component | Location | Address / URL |
|-----------|----------|---------------|
| Next.js Frontend | Local development | `http://localhost:3000` |
| Base Contract | Sepolia | `0x0262C4dEc9A16A5962e862926DD1AdA94c64A302` |
| Proposed Contract | Sepolia | `0x32dA54F4c606fccB17fcB3f41416529b181cE4C7` |
| Filebase API | External | `https://rpc.filebase.io/api/v0/add` |

### Local Development Deployment

| Component | Command | Network |
|-----------|---------|---------|
| Hardhat Node | `bunx hardhat node` | `http://localhost:8545` |
| Deploy Base | `bun run deploy:base:localhost` | Local |
| Deploy Proposed | `bun run deploy:proposed:localhost` | Local |
| Run Frontend | `bun run dev:web` | `http://localhost:3000` |

### Network Configuration

```
Chain ID: 11155111
Chain Name: Sepolia
Currency: SepoliaETH (test ETH)
RPC: https://ethereum-sepolia-rpc.publicnode.com
```

**Note:** MetaMask displays "ETH" but on Sepolia this is test ETH, not mainnet ETH.
