# 11. Comparison Metrics

## Final Values for Graph Generation

### Quantitative Metrics Table

| Metric | Existing (Base Paper) | Proposed | Improvement |
|--------|----------------------|----------|-------------|
| **Trust** | 4 | 9 | Base: single-owner implicit trust. Proposed: multi-authority explicit threshold removes single point of failure. |
| **Security** | 5 | 9 | Base: basic ownership checks only. Proposed: RBAC + blacklist + pause + reentrancy guard + zero-address validation. |
| **Governance** | 3 | 9 | Base: simple owner model, no revocation safety. Proposed: admin registry, authority threshold with revocation guards, emergency pause. |
| **Transparency** | 7 | 9 | Both on-chain traceable. Proposed adds explicit validation status, certificate hash anchoring, and approval audit trail. |
| **Validation** | 2 | 9 | Base: no validation gate — product flows directly. Proposed: mandatory threshold approval (2-of-3) before distribution. |
| **Storage Efficiency** | 5 | 8 | Base: strings + uint256 fields. Proposed: packed struct with uint8 enums, uint32 timestamps, compact bytes32 IDs. |
| **Gas Efficiency** | 5 | 7 | Base create: 145,056 gas. Proposed register: 76,085 gas (47% reduction). |
| **Auditability** | 6 | 9 | Base: basic events. Proposed: detailed events for register, stage advance, approve, reject, blacklist, threshold updates. |

### Feature Comparison Table

| Feature | Existing (Base Paper) | Proposed |
|---------|----------------------|----------|
| Multi-authority validation | ❌ No | ✅ Yes (threshold-based) |
| Certificate verification | ❌ No | ✅ Yes (IPFS hash anchoring) |
| Blacklist enforcement | ❌ No | ✅ Yes |
| Emergency pause | ❌ No | ✅ Yes |
| Role revocation safety | ❌ No | ✅ Yes (threshold guard) |
| Duplicate vote prevention | ❌ No | ✅ Yes |
| Custodian validation | ❌ No | ✅ Yes |
| Next-custodian role check | ❌ No | ✅ Yes |
| MFG/EXP date tracking | ❌ No | ✅ Yes |
| Public QR verification | ❌ No | ✅ Yes |
| Zero-address guards | ❌ No | ✅ Yes |
| Reentrancy protection | 🟡 Partial | ✅ Yes |
| Compact storage | ❌ No | ✅ Yes |

### Algorithm Formula Comparison

**Existing (Base Paper):**
```
State(t+1) = f(State(t), Actor)
Where f is any valid state transition by the current owner.
No external validation gate exists.
```

**Proposed:**
```
State(t+1) = f(State(t), Actor)  IF  validationStatus == Approved

Where validationStatus is determined by:
    approvalCount >= authorityThreshold  →  Approved
    rejectionCount >= authorityThreshold  →  Rejected

And Actor must:
    1. Hold correct role for current stage
    2. Be the current custodian
    3. Not be blacklisted
    4. Pass whenNotPaused check
```

### Recommended Graph Types

1. **Bar Graph** — Gas comparison per operation (Base vs Proposed)
2. **Radar Chart** — 8-dimensional comparison (Trust, Security, Governance, Transparency, Validation, Storage, Gas, Auditability)
3. **Comparison Table** — Feature-by-feature checklist (Existing vs Proposed)
4. **Algorithm Formula** — Mathematical/logical representation of both systems
