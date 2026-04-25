# 7. Proposed Algorithm

## Algorithm Name
**Threshold-Based Multi-Authority Ethical Validation Algorithm**

## Parameters

| Parameter | Value | Details |
|-----------|-------|---------|
| **Threshold** | **2 of 3** | `authorityThreshold = 2`. Requires at least 2 authorities registered on-chain. |
| **Approval Logic** | Majority threshold gate | If `approvalCount >= authorityThreshold`, status becomes `Approved` (uint8: 2). Once approved, product can advance from `Manufactured` to `Distributed`. |
| **Rejection Logic** | Majority threshold gate | If `rejectionCount >= authorityThreshold`, status becomes `Rejected` (uint8: 3). Once rejected, validation is terminal — product cannot progress further. |
| **Revocation** | **Yes, included** | `revokeActor()` is implemented. Safety guard: cannot revoke an authority if it would leave `authorityCount < threshold`. Admin can also `setBlacklist()` any actor instantly. |

## Algorithm Steps

1. **Register Product** — Manufacturer calls `registerProduct()` with `productId`, `certificateHash`, name, batch number, manufacturer name, MFG date, EXP date.
2. **Advance to Manufactured** — Manufacturer calls `advanceStage()` to move state from `Created` (0) to `Manufactured` (1).
3. **Authority Review** — Registered authorities review off-chain certificate evidence (stored on IPFS, referenced by on-chain hash).
4. **Vote Once** — Each authority can call `approveProduct()` or `rejectProduct()` exactly once per product. The `hasValidated` mapping enforces this.
5. **Threshold Check** — After each vote, the contract checks:
   - If `approvalCount >= authorityThreshold` → status = `Approved`
   - If `rejectionCount >= authorityThreshold` → status = `Rejected`
6. **Gate Enforcement** — `advanceStage()` blocks progression from `Manufactured` unless `validationStatus == Approved`.
7. **Lifecycle Continues** — Approved products advance through `Distributed` (2), `Retail` (3), `Sold` (4) with role and custodian checks at each step.

## Key Contract Functions

| Function | Caller | Purpose |
|----------|--------|---------|
| `registerProduct()` | MANUFACTURER_ROLE | Creates product on-chain |
| `advanceStage(productId, nextCustodian)` | Current custodian with correct role | Moves product to next stage |
| `approveProduct(productId)` | AUTHORITY_ROLE | Records approval vote |
| `rejectProduct(productId)` | AUTHORITY_ROLE | Records rejection vote |
| `setAuthorityThreshold(uint8)` | DEFAULT_ADMIN_ROLE | Updates threshold (must be <= authority count) |
| `revokeActor(role, account)` | DEFAULT_ADMIN_ROLE | Removes role (safety-checked for authorities) |
| `setBlacklist(account, status)` | DEFAULT_ADMIN_ROLE | Instantly blocks actor |

## Solidity Implementation Reference
- File: `packages/contracts/contracts/EthicalSupplyChain.sol`
- Threshold logic: lines 231-233 (approval), 253-255 (rejection)
- Stage gate: line 183 (`ValidationRequired` error)
- Duplicate vote prevention: lines 219-221, 241-243
