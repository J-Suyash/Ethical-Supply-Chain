# Implementation Notes

## Purpose
This document records the main implementation issues we discovered while building the base-paper system and the proposed research system, along with the fixes applied.

## Problem 1: The base paper flow was described in the report, but not represented in code
- Issue:
  - We had only implemented the proposed ethical supply-chain contract.
  - This made it difficult to demonstrate the difference between the original paper and our research contribution.
- Fix:
  - Added `packages/contracts/contracts/BasePaperMedicineSupplyChain.sol`.
  - The contract models the simpler paper workflow: consumer onboarding, UPC-style medicine creation, sale, buy, ship, receive, and consume.
- Result:
  - We can now compare the base system and the proposed system directly in code, tests, and the frontend.

## Problem 2: The comparison was visible in concept, but not provable in tests
- Issue:
  - The project could explain the gap verbally, but the codebase did not yet prove the behavioral difference.
- Fix:
  - Added `packages/contracts/test/Comparison.spec.ts`.
  - The comparison test shows that the base-paper contract can progress without ethical approval, while the proposed contract blocks distribution until the authority threshold is reached.
- Result:
  - The core research contribution is now testable, reproducible, and easier to present to the panel.

## Problem 3: The base contract used external ETH transfer without extra hardening
- Issue:
  - `BasePaperMedicineSupplyChain.sol` sends ETH during `buyMedicine()`.
  - During the skill review, this was identified as a case where CEI and `ReentrancyGuard` should be applied.
- Fix:
  - Added `ReentrancyGuard` to the base contract.
  - Applied `nonReentrant` to `buyMedicine()`.
- Result:
  - The fund-transfer path is safer and aligns better with Solidity security guidance.

## Problem 4: Some admin/account inputs were not validated
- Issue:
  - The contracts originally allowed some admin-facing functions to accept invalid zero addresses.
- Fix:
  - Added `InvalidAccount` validation in:
    - `EthicalSupplyChain` constructor
    - `EthicalSupplyChain.registerActor()`
    - `EthicalSupplyChain.setBlacklist()`
    - `BasePaperMedicineSupplyChain.addConsumer()`
- Result:
  - The contracts now reject invalid actor/account setup earlier and more clearly.

## Problem 5: The proposed contract had no emergency stop
- Issue:
  - The proposed system had governance controls, but no pause mechanism for emergency response.
- Fix:
  - Added `Pausable` to `packages/contracts/contracts/EthicalSupplyChain.sol`.
  - Added `pause()` and `unpause()` admin functions.
  - Applied `whenNotPaused` to the user-facing mutation functions.
- Result:
  - The proposed system can now stop product registration, validation, and stage movement during an emergency.

## Problem 6: Test coverage was good, but missing some boundary and security checks
- Issue:
  - The original tests covered the main lifecycle but not some hardening paths.
- Fix:
  - Expanded tests to cover:
    - zero-address deployment/admin validation
    - zero-address consumer registration
    - pause/unpause behavior
    - blacklisted actor stage progression block
    - overpayment refund behavior in the base sale flow
    - event emission for key state changes
- Result:
  - The test suite now checks both feature correctness and hardening behavior.

## Problem 7: The homepage became too large and harder to maintain
- Issue:
  - `apps/web/src/app/page.tsx` had grown into one very large page file.
  - This made it harder to maintain and did not align well with the project skill guidance.
- Fix:
  - Split the homepage into dedicated components under `apps/web/src/components/home/`.
  - Added page-level metadata in `apps/web/src/app/page.tsx`.
  - Replaced the visual hero paragraph with a semantic `h1`.
  - Changed the comparison layout to a semantic HTML table.
- Result:
- The frontend is easier to maintain, more semantic, and better structured for later contract-connected UI work.

## Problem 8: Live Filebase IPFS integration changed during implementation
- Issue:
  - We initially integrated Filebase through `@filebase/sdk`.
  - Then we switched to the S3-compatible API using the AWS SDK.
  - After checking the Filebase documentation again, we found the IPFS RPC API was the better fit for simple file pinning in this project.
- Fix:
  - Replaced the S3 upload route with Filebase's IPFS RPC endpoint in `apps/web/src/app/api/ipfs/upload/route.ts`.
  - Configured the route to call `https://rpc.filebase.io/api/v0/add` with `Authorization: Bearer <api-key>`.
  - Moved configuration to a single `FILEBASE_RPC_API_KEY` secret in `apps/web/.env.local`.
- Result:
  - The app now follows the Filebase IPFS RPC workflow documented by Filebase and is simpler to test with curl and standard multipart uploads.
  - The upload flow was verified successfully through both the local Next.js route and direct RPC authentication.

## Current outcome
- The base paper system is implemented.
- The proposed ethical supply-chain system is implemented.
- The behavioral difference between both systems is documented in code and tests.
- Security and maintainability issues identified during skill review have been addressed.

## Remaining work
- Connect the frontend to deployed contracts for live wallet-based interaction.
- Add gas/storage comparison metrics for the report.
- Build verification flows and panel/demo documentation.
