# Flow Diagram — Proposed System

## Mermaid Code

```mermaid
flowchart TD
    Start([Start]) --> Register[Register Product<br/>with Certificate Hash]
    Register --> Advance1[Advance Stage<br/>Created -> Manufactured]
    Advance1 --> Review{Authority Review}
    
    Review -->|Authority 1| Approve1[Approve Product]
    Review -->|Authority 1| Reject1[Reject Product]
    Review -->|Authority 2| Approve2[Approve Product]
    Review -->|Authority 2| Reject2[Reject Product]
    Review -->|Authority 3| Approve3[Approve Product]
    Review -->|Authority 3| Reject3[Reject Product]
    
    Approve1 --> Check1{Threshold Met?}
    Approve2 --> Check1
    Approve3 --> Check1
    Reject1 --> Check2{Threshold Met?}
    Reject2 --> Check2
    Reject3 --> Check2
    
    Check1 -->|Yes: approvalCount >= 2| Approved[Status: APPROVED]
    Check1 -->|No| Wait[Status: PENDING<br/>Awaiting more votes]
    Wait --> Review
    
    Check2 -->|Yes: rejectionCount >= 2| Rejected[Status: REJECTED<br/>Terminal State]
    Check2 -->|No| Wait
    
    Approved --> Advance2[Advance Stage<br/>Manufactured -> Distributed]
    Advance2 --> Advance3[Advance Stage<br/>Distributed -> Retail]
    Advance3 --> Advance4[Advance Stage<br/>Retail -> Sold]
    Advance4 --> End([End])
    
    Rejected --> EndRejected([End])

    style Register fill:#e3f2fd
    style Advance1 fill:#e3f2fd
    style Approved fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style Rejected fill:#ffebee,stroke:#c62828,stroke-width:3px
    style Wait fill:#fff8e1
    style Advance2 fill:#e3f2fd
    style Advance3 fill:#e3f2fd
    style Advance4 fill:#e3f2fd
```

## Flow Description

| Step | Actor | Action | Contract Function |
|------|-------|--------|-------------------|
| 1 | Manufacturer | Register product with certificate hash, MFG/EXP dates | `registerProduct(...)` |
| 2 | Manufacturer | Move to manufacturing state | `advanceStage(productId, nextCustodian)` |
| 3 | Authority 1,2,3 | Review off-chain certificate, vote approve or reject | `approveProduct(productId)` / `rejectProduct(productId)` |
| 4 | Contract | Auto-check threshold after each vote | Internal logic |
| 5 | — | If approvals >= 2: status = Approved | — |
| 6 | — | If rejections >= 2: status = Rejected (terminal) | — |
| 7 | Manufacturer | Only if Approved: advance to Distributed | `advanceStage(productId, distributor)` |
| 8 | Distributor | Advance to Retail | `advanceStage(productId, retailer)` |
| 9 | Retailer | Advance to Sold | `advanceStage(productId, zeroAddress)` |

**Key Characteristic:** Mandatory validation gate at `Manufactured` stage. Product CANNOT progress to distribution without threshold approval (2-of-3).
