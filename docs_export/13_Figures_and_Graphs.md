# 13. Figures and Graphs for Results

## Recommended Graphs

### 1. Bar Graph — Gas Comparison by Operation

**Data:**

| Operation | Base Paper (Gas) | Proposed (Gas) |
|-----------|-----------------|----------------|
| Create / Register | 145,056 | 76,085 |
| Sell / Advance Stage | 76,558 | 38,450 |
| Buy / Approve | 81,291 | 59,786 |

**Insight:** The proposed system uses **47% less gas** for product registration due to packed struct storage and compact data types.

---

### 2. Radar Chart — Multi-Dimensional Comparison

**Axes (scale 0-10):**

| Dimension | Existing | Proposed |
|-----------|----------|----------|
| Trust | 4 | 9 |
| Security | 5 | 9 |
| Governance | 3 | 9 |
| Transparency | 7 | 9 |
| Validation | 2 | 9 |
| Storage Efficiency | 5 | 8 |
| Gas Efficiency | 5 | 7 |
| Auditability | 6 | 9 |

---

### 3. Feature Comparison Table

| Feature | Existing | Proposed |
|---------|:--------:|:--------:|
| Multi-authority validation | ❌ | ✅ |
| Certificate verification | ❌ | ✅ |
| Blacklist enforcement | ❌ | ✅ |
| Emergency pause | ❌ | ✅ |
| Role revocation safety | ❌ | ✅ |
| Duplicate vote prevention | ❌ | ✅ |
| Custodian validation | ❌ | ✅ |
| Next-custodian role check | ❌ | ✅ |
| MFG/EXP date tracking | ❌ | ✅ |
| Public QR verification | ❌ | ✅ |
| Zero-address guards | ❌ | ✅ |
| Reentrancy protection | 🟡 | ✅ |
| Compact storage | ❌ | ✅ |

---

### 4. Algorithm Formula Comparison

**Existing Algorithm:**
```
function transition(state, actor):
    if actor == owner(state):
        return next_state(state)
    else:
        revert Unauthorized
```

**Proposed Algorithm:**
```
function transition(state, actor, product):
    if blacklisted(actor): revert AccountBlacklisted
    if paused(): revert ContractPaused
    if actor != custodian(product): revert NotCurrentCustodian
    if !hasRole(requiredRole(state), actor): revert InvalidRole
    
    if state == Manufactured:
        if validationStatus(product) != Approved:
            revert ValidationRequired
    
    return next_state(state)

function validate(product, authority, vote):
    if hasValidated(product, authority): revert AlreadyValidated
    if validationStatus(product) != Pending: revert ValidationClosed
    
    record vote
    
    if approvalCount >= authorityThreshold:
        validationStatus = Approved
    if rejectionCount >= authorityThreshold:
        validationStatus = Rejected
```

---

### 5. Lifecycle State Diagram Data

**Base Paper States:**
```
Created (0) → ForSale (1) → Sold (2) → Shipped (3) → Received (4) → Consumed (5)
```

**Proposed States:**
```
Created (0) → Manufactured (1) → Distributed (2) → Retail (3) → Sold (4)
                    ↑
            [Validation Gate]
         Approved / Rejected
```

**Validation Sub-States (Proposed only):**
```
Pending (0) → Approved (2)  [if approvals >= threshold]
           → Rejected (3)  [if rejections >= threshold]
```
