# Existing vs Proposed Comparison Flow

## Mermaid Code

```mermaid
flowchart TB
    subgraph Legend
        direction LR
        L1[Existing Only]:::existing
        L2[Proposed Only]:::proposed
        L3[Both Systems]:::both
    end

    subgraph Existing_System["EXISTING (Base Paper)"]
        direction TB
        E1[Create Medicine<br/>with UPC]:::both
        E2[Put For Sale]:::both
        E3[Consumer Buys]:::both
        E4[Owner Ships]:::both
        E5[Buyer Receives]:::both
        E6[Buyer Consumes]:::both
        
        E1 --> E2 --> E3 --> E4 --> E5 --> E6
        
        E_NoGate[NO VALIDATION GATE]:::existing
        E_NoGate -.-> E2
    end

    subgraph Proposed_System["PROPOSED (Our System)"]
        direction TB
        P1[Register Product<br/>with Certificate Hash]:::both
        P2[Advance to Manufactured]:::both
        
        P_Validation[VALIDATION GATE]:::proposed
        P_Auth1[Authority 1<br/>Approves / Rejects]:::proposed
        P_Auth2[Authority 2<br/>Approves / Rejects]:::proposed
        P_Auth3[Authority 3<br/>Approves / Rejects]:::proposed
        P_Threshold{Threshold >= 2?}:::proposed
        P_Approved[APPROVED]:::proposed
        P_Rejected[REJECTED<br/>Terminal]:::proposed
        
        P3[Advance to Distributed]:::both
        P4[Advance to Retail]:::both
        P5[Advance to Sold]:::both
        
        P1 --> P2 --> P_Validation
        P_Validation --> P_Auth1
        P_Validation --> P_Auth2
        P_Validation --> P_Auth3
        
        P_Auth1 --> P_Threshold
        P_Auth2 --> P_Threshold
        P_Auth3 --> P_Threshold
        
        P_Threshold -->|Yes: 2 Approvals| P_Approved
        P_Threshold -->|Yes: 2 Rejections| P_Rejected
        P_Threshold -->|No| P_Validation
        
        P_Approved --> P3 --> P4 --> P5
    end

    subgraph Differences["KEY DIFFERENCES"]
        direction TB
        D1[Existing: Single owner trust<br/>Proposed: Multi-authority threshold]:::proposed
        D2[Existing: No certificate check<br/>Proposed: IPFS hash anchoring]:::proposed
        D3[Existing: String state labels<br/>Proposed: Packed uint8 enums]:::proposed
        D4[Existing: No blacklist/pause<br/>Proposed: Full governance controls]:::proposed
        D5[Existing: 145k gas create<br/>Proposed: 76k gas register]:::proposed
    end

    style Existing_System fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style Proposed_System fill:#e1f5e1,stroke:#2e7d32,stroke-width:2px
    style Differences fill:#e3f2fd,stroke:#1565c0,stroke-width:2px

    classDef existing fill:#fff3e0,stroke:#ef6c00
    classDef proposed fill:#e1f5e1,stroke:#2e7d32
    classDef both fill:#f5f5f5,stroke:#616161
```

## Side-by-Side Comparison

| Aspect | Existing (Base Paper) | Proposed (Our System) |
|--------|----------------------|----------------------|
| **Identifier** | UPC (uint256) | bytes32 compact hash |
| **Creation** | `createMedicine()` | `registerProduct()` + certificateHash |
| **Validation Gate** | ❌ None | ✅ Mandatory at Manufactured stage |
| **Validators** | None | 3 Authorities (2-of-3 threshold) |
| **Certificate** | ❌ Not tracked | ✅ IPFS CID hash anchored on-chain |
| **Dates** | ❌ Not tracked | ✅ MFG date + EXP date (uint32) |
| **Custody** | Owner/Buyer | Current custodian with role checks |
| **Governance** | Simple owner | RBAC + blacklist + pause + revocation safety |
| **Storage** | Strings + uint256 | Packed struct (uint8, uint32) |
| **Gas (create)** | 145,056 | 76,085 |
| **States** | Created → ForSale → Sold → Shipped → Received → Consumed | Created → Manufactured → Distributed → Retail → Sold |
| **Trust Model** | Implicit (owner says it's OK) | Explicit (authorities must approve) |

## Visual Summary

```
EXISTING:  Create -> Sell -> Buy -> Ship -> Receive -> Consume
            (No gate — flows freely)

PROPOSED:  Register -> Manufactured -> [VALIDATION GATE]
                                          |
                              +-----------+-----------+
                              |                       |
                         Approved (2/3)          Rejected (2/3)
                              |                       |
                              v                       v
                    Distributed -> Retail        (Terminal)
                              |
                              v
                            Sold
```
