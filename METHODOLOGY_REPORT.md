# Methodology and Report Notes

## 1. Base paper identification
The selected base paper is `DOCs/Blockchain-Based-Medicine-Supply-Chain-for-Transparent-Healthcare-Tracking.pdf`.

From the paper, the baseline system centers on:
- Ethereum smart contracts for medicine tracking
- UPC-based product identification
- role-oriented blockchain participation
- transaction history for traceability
- sale, shipment, receiving, and consumption flow

The paper also includes a role-management style algorithm example in the consumer role contract and demonstrates a product flow that moves from creation to sale and final consumption.

## 2. Extracted baseline algorithm
The baseline algorithm represented in our implementation is:

1. Register an actor in the system
2. Create a medicine linked to a UPC-like identifier
3. Put the medicine up for sale
4. Allow a consumer to buy the medicine
5. Ship the medicine to the buyer
6. Allow the buyer to receive it
7. Allow the buyer to consume it

This baseline is implemented in:
- `packages/contracts/contracts/BasePaperMedicineSupplyChain.sol`

## 3. Research gaps identified
From the base paper and implementation review, the main gaps are:

### Gap 1: No explicit multi-authority validation
The paper focuses on product traceability, but it does not require approval from multiple trusted authorities before a product moves through the lifecycle.

### Gap 2: No ethical certificate approval model
The paper supports transparency and product lookup, but it does not model a contract-level certificate approval process tied to product movement.

### Gap 3: Limited governance controls
The paper includes role concepts, but not blacklist controls, revocation safety, or emergency pause behavior.

### Gap 4: Less optimized state representation
The baseline flow is traceability-oriented, but it does not emphasize compact storage design for gas efficiency.

## 4. Proposed algorithm
To address the gaps, the proposed system introduces a threshold-based validation algorithm:

1. A manufacturer registers a product with a compact identifier and certificate hash
2. The product moves into manufacturing state
3. Authorities review the certificate evidence
4. Each authority can vote once only
5. If approvals reach the threshold, the product is approved
6. If rejections reach the threshold, the product is rejected
7. Only approved products can continue into distribution

This proposed system is implemented in:
- `packages/contracts/contracts/EthicalSupplyChain.sol`

## 5. Comparison methodology
The comparison is performed using two coded systems:

### Baseline system
- `BasePaperMedicineSupplyChain.sol`
- models the paper flow directly

### Proposed system
- `EthicalSupplyChain.sol`
- adds threshold validation, blacklist governance, compact state, and emergency pause

### Comparison criteria
- trust model
- lifecycle enforcement
- validation logic
- governance controls
- storage/gas characteristics

## 6. Testing methodology
The project uses automated tests to validate both systems.

### Baseline tests
- product creation
- sale and purchase flow
- shipping, receiving, consuming
- consumer-role enforcement
- refund behavior

### Proposed tests
- threshold approval path
- threshold rejection path
- duplicate-vote prevention
- blacklist enforcement
- pause/unpause behavior
- invalid-address rejection
- custodian and role checks

### Direct comparison test
- proves that the baseline system can progress without authority approval
- proves that the proposed system blocks progression until authority approval is reached

## 7. Gas snapshot
Current script-based gas comparison:

- Base `createMedicine`: `145056`
- Base `sellMedicine`: `76558`
- Base `buyMedicine`: `81291`
- Proposed `registerProduct`: `76085`
- Proposed `advanceStage (Created -> Manufactured)`: `38450`
- Proposed `approveProduct`: `59786`

These values come from:
- `packages/contracts/scripts/compare-gas.ts`

## 8. Implementation challenges and fixes
The project encountered several issues during implementation:

- the base paper system was not initially represented in code
- the comparison existed conceptually but not as a direct executable test
- the baseline contract fund-transfer path needed stronger protection
- some admin/account inputs needed zero-address checks
- the proposed system lacked an emergency pause mechanism
- the homepage became too large and needed modularization
- Filebase integration changed from SDK to S3-compatible API and finally to the IPFS RPC API to better match the required pinning workflow

These are documented in:
- `IMPLEMENTATION_NOTES.md`

## 9. Current status
Completed:
- baseline contract
- proposed contract
- side-by-side automated comparison tests
- local/live demo frontend shell
- gas comparison script
- Filebase upload route using the IPFS RPC API

Pending:
- verify the live Filebase RPC key against the `/api/v0/add` flow
- full wallet-role demo walkthrough on testnet
- QR verification flow
- final diagrams and presentation deck
