# Tasks

## 1. Research framing and validation
- [ ] Review the base paper and extract the original lifecycle, storage model, and trust assumptions
- [ ] Write a gap analysis comparing the base system with the proposed ethical supply chain system
- [ ] Define the exact research contribution claims for validation, storage optimization, and governance
- [ ] Convert the qualitative evaluation section into measurable criteria and test cases

## 2. Comparison-first implementation plan
- [x] Represent the proposed research system as a Bun-based Solidity + Next.js workspace
- [x] Represent the base paper system as a baseline smart contract without ethical validation or governance extensions
- [x] Keep both systems comparable with the same product lifecycle and actor model where possible
- [x] Surface the differences in the frontend so the panel can see base vs proposed behavior clearly
- [x] Prepare comparison-friendly test scenarios using the same product flow on both systems

## 3. System specification
- [x] Define actors: admin, manufacturer, distributor, retailer, authority, and public verifier
- [x] Define lifecycle states as a compact enum-based finite state machine
- [x] Define ethical validation states and threshold approval rules
- [x] Define blacklist and role revocation behavior
- [x] Define the on-chain/off-chain data split for product data and certification evidence

## 4. Smart contract architecture
- [x] Create a role and governance module for actor registration, authority management, and blacklisting
- [x] Create a product registry module for product creation, ownership, and lifecycle transitions
- [x] Create an ethical validation module for certificate references and multi-authority approvals
- [x] Emit audit events for creation, movement, validation, revocation, and blacklist actions
- [x] Keep the contract storage layout optimized through packed structs and enum/uint usage
- [x] Add a baseline contract that mirrors the simpler paper workflow for comparison

## 5. Frontend architecture
- [x] Scaffold a Bun-based Next.js app with TypeScript and Tailwind CSS
- [x] Add a landing dashboard that explains the architecture and intended actor workflows
- [x] Add a side-by-side view for the base paper system and the proposed research system
- [x] Refactor the landing page into smaller maintainable components
- [ ] Add role-aware sections for product registration, lifecycle tracking, and authority approval
- [x] Add a public verification view for QR/manual lookup workflows
- [x] Add shared domain types so the UI matches the contract model

## 6. Smart contract implementation
- [x] Implement actor roles and admin controls
- [x] Implement product registration with compact storage fields
- [x] Implement stage transition guards based on expected actor role and current state
- [x] Implement ethical certification submission and threshold approval tracking
- [x] Prevent duplicate approvals and block blacklisted actors from interacting
- [x] Add read helpers for product trace and validation status
- [x] Implement the base paper flow with simpler single-track state and no multi-authority gate

## 7. Testing and evaluation
- [x] Write contract tests for happy path lifecycle progression
- [x] Write tests for threshold approval success and failure scenarios
- [x] Write tests for unauthorized access, duplicate approvals, and blacklist enforcement
- [x] Add side-by-side tests showing how the base system behaves differently from the proposed one
- [x] Add local deployment scripts for both baseline and proposed contracts
- [x] Add testnet-ready Hardhat configuration for Sepolia deployment
- [x] Add security-focused tests for zero-address, pause, blacklist, and refund scenarios
- [x] Add a gas comparison script for baseline vs proposed contract actions
- [x] Deploy both baseline and proposed contracts to Sepolia
- [ ] Compare storage and gas implications of compact stage encoding versus string-based state
- [ ] Document assumptions, limitations, and security tradeoffs

## 8. Documentation and presentation
- [ ] Draw architecture and workflow diagrams
- [ ] Write the methodology section from the implemented design
- [ ] Build a comparison table against the base paper system
- [ ] Prepare screenshots, metrics, and demo flow notes for presentation
- [ ] Prepare a viva-friendly explanation of the base algorithm, gaps, and proposed algorithm
- [x] Document implementation problems faced and how they were fixed
- [x] Draft a methodology/report section based on the base paper and current implementation
- [x] Draft architecture and workflow diagrams for presentation use

## Current implementation status
- Proposed contract implemented: `packages/contracts/contracts/EthicalSupplyChain.sol`
- Proposed validation tests implemented: `packages/contracts/test/EthicalSupplyChain.ts`
- Base paper baseline contract implemented: `packages/contracts/contracts/BasePaperMedicineSupplyChain.sol`
- Base vs proposed comparison tests implemented: `packages/contracts/test/Comparison.spec.ts`
- Local and Sepolia deployment scripts implemented: `packages/contracts/scripts/`
- Testing and deployment guide added: `TESTING.md`
- Implementation issue log added: `IMPLEMENTATION_NOTES.md`
- Methodology/report draft added: `METHODOLOGY_REPORT.md`
- Architecture diagram draft added: `ARCHITECTURE_DIAGRAMS.md`
- Frontend prototype implemented: `apps/web/src/app/page.tsx`
- Next implementation target: finalize report/presentation assets, extend role dashboards, and prepare Sepolia demo deployment

## Comparison notes for the panel
- Base system: blockchain lifecycle tracking with role-based stage updates and no explicit ethical validation threshold.
- Proposed system: lifecycle tracking plus threshold-based multi-authority validation, blacklist enforcement, and compact storage.
- Strongest research contribution: replacing implicit trust with an explicit approval algorithm over certificate evidence.
- Optional future work: AI anomaly detection, IoT monitoring, and deeper benchmarking beyond the MVP.
