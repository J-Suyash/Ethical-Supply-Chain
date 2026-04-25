# Use Case Diagram

## Mermaid Code

```mermaid
flowchart LR
    subgraph Actors
        Admin([Admin])
        Manufacturer([Manufacturer])
        Distributor([Distributor])
        Retailer([Retailer])
        Authority([Authority])
        Public([Public Verifier])
    end

    subgraph Use_Cases_Proposed
        UC1[Register Product]
        UC2[Advance Stage]
        UC3[Approve Product]
        UC4[Reject Product]
        UC5[Register Actor]
        UC6[Revoke Actor]
        UC7[Set Blacklist]
        UC8[Set Threshold]
        UC9[Pause Contract]
        UC10[Verify Product]
        UC11[Upload Certificate]
    end

    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    
    Manufacturer --> UC1
    Manufacturer --> UC2
    
    Distributor --> UC2
    
    Retailer --> UC2
    
    Authority --> UC3
    Authority --> UC4
    
    Public --> UC10
    
    Manufacturer -.-> UC11

    style UC1 fill:#e3f2fd
    style UC3 fill:#e8f5e9
    style UC4 fill:#ffebee
    style UC10 fill:#fff8e1
    style UC7 fill:#ffebee
    style UC9 fill:#ffebee
```

## Use Case Descriptions

| Use Case | Primary Actor | Description |
|----------|--------------|-------------|
| **UC1: Register Product** | Manufacturer | Creates a new product on-chain with certificate hash, batch number, MFG/EXP dates |
| **UC2: Advance Stage** | Manufacturer / Distributor / Retailer | Moves product to next lifecycle stage if all guards pass |
| **UC3: Approve Product** | Authority | Records an approval vote for a product under validation |
| **UC4: Reject Product** | Authority | Records a rejection vote for a product under validation |
| **UC5: Register Actor** | Admin | Grants a role (Manufacturer, Distributor, Retailer, Authority) to an address |
| **UC6: Revoke Actor** | Admin | Removes a role from an address (with safety guards for authorities) |
| **UC7: Set Blacklist** | Admin | Instantly blocks/unblocks an actor from all interactions |
| **UC8: Set Threshold** | Admin | Updates the authority approval threshold (must be <= authority count) |
| **UC9: Pause Contract** | Admin | Emergency stop for all mutation functions |
| **UC10: Verify Product** | Public Verifier | Read-only lookup of product status, stage, approvals, certificate hash |
| **UC11: Upload Certificate** | Manufacturer | Uploads certificate evidence to IPFS via Filebase API |
