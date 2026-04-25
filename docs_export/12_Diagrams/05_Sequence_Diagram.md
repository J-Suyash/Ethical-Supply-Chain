# Sequence Diagram

## Mermaid Code

```mermaid
sequenceDiagram
    participant Admin
    participant Manufacturer
    participant Authority1
    participant Authority2
    participant Distributor
    participant Public
    participant UI as Next.js Frontend
    participant MM as MetaMask
    participant FB as Filebase IPFS
    participant SC as EthicalSupplyChain.sol

    Note over Admin,SC: SETUP PHASE
    Admin->>UI: Connect wallet
    UI->>MM: Request accounts
    MM-->>UI: Account address
    Admin->>UI: Register Manufacturer role
    UI->>MM: Sign transaction
    MM->>SC: registerActor(MANUFACTURER_ROLE, manufacturer)
    SC-->>MM: Transaction receipt
    Admin->>UI: Register Authority 1 role
    UI->>MM: Sign transaction
    MM->>SC: registerActor(AUTHORITY_ROLE, authority1)
    SC-->>MM: Transaction receipt
    Admin->>UI: Register Authority 2 role
    UI->>MM: Sign transaction
    MM->>SC: registerActor(AUTHORITY_ROLE, authority2)
    SC-->>MM: Transaction receipt

    Note over Manufacturer,SC: PRODUCT REGISTRATION
    Manufacturer->>UI: Upload certificate PDF
    UI->>FB: POST /api/v0/add
    FB-->>UI: Return CID
    Manufacturer->>UI: Enter product details + CID
    UI->>MM: Sign registerProduct transaction
    MM->>SC: registerProduct(productId, certHash, name, batch, mfg, exp)
    SC-->>MM: ProductRegistered event
    SC-->>MM: Transaction receipt

    Note over Manufacturer,SC: STAGE ADVANCEMENT
    Manufacturer->>UI: Click Advance Stage
    UI->>MM: Sign advanceStage transaction
    MM->>SC: advanceStage(productId, manufacturer)
    SC-->>MM: ProductStageAdvanced event (Created->Manufactured)

    Note over Authority1,SC: VALIDATION PHASE
    Authority1->>UI: Review certificate (off-chain)
    Authority1->>UI: Click Approve
    UI->>MM: Sign approveProduct transaction
    MM->>SC: approveProduct(productId)
    SC-->>MM: ProductApproved event (approvalCount=1)
    
    Authority2->>UI: Review certificate (off-chain)
    Authority2->>UI: Click Approve
    UI->>MM: Sign approveProduct transaction
    MM->>SC: approveProduct(productId)
    SC-->>MM: ProductApproved event (approvalCount=2, status=Approved)

    Note over Manufacturer,SC: DISTRIBUTION
    Manufacturer->>UI: Click Advance Stage
    UI->>MM: Sign advanceStage transaction
    MM->>SC: advanceStage(productId, distributor)
    SC-->>MM: ProductStageAdvanced event (Manufactured->Distributed)

    Distributor->>UI: Click Advance Stage
    UI->>MM: Sign advanceStage transaction
    MM->>SC: advanceStage(productId, retailer)
    SC-->>MM: ProductStageAdvanced event (Distributed->Retail)

    Note over Public,SC: VERIFICATION
    Public->>UI: Visit /verify page
    Public->>UI: Enter product seed
    UI->>SC: getProductSummary(productId) [read-only]
    SC-->>UI: Product data
    UI-->>Public: Display stage, status, approvals, certificate hash
    UI-->>Public: Display QR code for sharing
```

## Key Sequences

1. **Admin Setup:** Registers all actors (Manufacturer, Authorities) before any product flow
2. **IPFS Upload:** Certificate evidence stored off-chain, CID referenced on-chain
3. **Validation Gate:** Two authority approvals required before distribution can begin
4. **Custodian Transfer:** Each stage advance can transfer custody to the next-role actor
5. **Public Verification:** Completely read-only, no wallet required for queries
