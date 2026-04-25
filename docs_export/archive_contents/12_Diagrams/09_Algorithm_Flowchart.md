# Algorithm Flowchart

## Mermaid Code

```mermaid
flowchart TD
    Start([Start]) --> Register[Register Product<br/>Manufacturer]
    Register --> Mfg[Advance to Manufactured<br/>Manufacturer]
    Mfg --> Pending[Status: PENDING<br/>Awaiting Authority Votes]
    
    Pending --> Vote{Authority Votes}
    Vote -->|Approve| ApproveCount[approvalCount++]
    Vote -->|Reject| RejectCount[rejectionCount++]
    
    ApproveCount --> CheckApprove{approvalCount >=<br/>authorityThreshold?}
    RejectCount --> CheckReject{rejectionCount >=<br/>authorityThreshold?}
    
    CheckApprove -->|Yes| Approved[Status: APPROVED]
    CheckApprove -->|No| CheckDup{Already voted?<br/>hasValidated == true}
    CheckReject -->|Yes| Rejected[Status: REJECTED<br/>Terminal State]
    CheckReject -->|No| CheckDup
    
    CheckDup -->|Yes| ErrorDup[Revert:<br/>AlreadyValidated]
    CheckDup -->|No| Pending
    
    ErrorDup --> EndError([End - Error])
    Rejected --> EndRejected([End - Rejected])
    
    Approved --> CheckStage{Current Stage<br/>== Manufactured?}
    CheckStage -->|Yes| CheckCustodian{Actor ==<br/>currentCustodian?}
    CheckStage -->|No| NextStage[Advance to Next Stage]
    
    CheckCustodian -->|Yes| CheckRole{Has required<br/>role for stage?}
    CheckCustodian -->|No| ErrorCust[Revert:<br/>NotCurrentCustodian]
    
    CheckRole -->|Yes| CheckPause{Contract<br/>paused?}
    CheckRole -->|No| ErrorRole[Revert:<br/>InvalidRoleForStage]
    
    CheckPause -->|No| CheckBlacklist{Actor<br/>blacklisted?}
    CheckPause -->|Yes| ErrorPause[Revert:<br/>ContractPaused]
    
    CheckBlacklist -->|No| CheckValidation{validationStatus<br/>== Approved?}
    CheckBlacklist -->|Yes| ErrorBlack[Revert:<br/>AccountBlacklisted]
    
    CheckValidation -->|Yes| Advance[Execute Stage Advance]
    CheckValidation -->|No| ErrorVal[Revert:<br/>ValidationRequired]
    
    NextStage --> CheckCustodian
    Advance --> Continue{Distributed /<br/>Retail / Sold}
    Continue -->|More stages| NextStage
    Continue -->|Final stage| EndSuccess([End - Success])
    
    ErrorCust --> EndError
    ErrorRole --> EndError
    ErrorPause --> EndError
    ErrorBlack --> EndError
    ErrorVal --> EndError

    style Approved fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style Rejected fill:#ffebee,stroke:#c62828,stroke-width:3px
    style Pending fill:#fff8e1
    style EndSuccess fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style EndRejected fill:#ffebee,stroke:#c62828,stroke-width:2px
    style EndError fill:#fce4ec,stroke:#c62828,stroke-width:2px
    style ErrorDup fill:#fce4ec
    style ErrorCust fill:#fce4ec
    style ErrorRole fill:#fce4ec
    style ErrorPause fill:#fce4ec
    style ErrorBlack fill:#fce4ec
    style ErrorVal fill:#fce4ec
```

## Algorithm Pseudocode

```solidity
// Threshold-Based Multi-Authority Ethical Validation Algorithm

function registerProduct(productId, certificateHash, metadata):
    require(msg.sender has MANUFACTURER_ROLE)
    require(product does not exist)
    store Product struct with stage = Created
    emit ProductRegistered

function advanceStage(productId, nextCustodian):
    require(contract not paused)
    require(msg.sender not blacklisted)
    
    product = getProduct(productId)
    currentStage = product.stage
    
    require(msg.sender has role for currentStage)
    require(msg.sender == product.currentCustodian)
    
    if currentStage == Manufactured:
        require(product.validationStatus == Approved)
    
    nextStage = currentStage + 1
    if nextCustodian != address(0):
        require(nextCustodian has role for nextStage)
    
    product.stage = nextStage
    product.currentCustodian = nextCustodian
    emit ProductStageAdvanced

function approveProduct(productId):
    require(contract not paused)
    require(msg.sender has AUTHORITY_ROLE)
    require(msg.sender not blacklisted)
    
    product = getProduct(productId)
    require(product.validationStatus == Pending)
    require(!hasValidated[productId][msg.sender])
    
    hasValidated[productId][msg.sender] = true
    product.approvalCount++
    
    if product.approvalCount >= authorityThreshold:
        product.validationStatus = Approved
    
    emit ProductApproved

function rejectProduct(productId):
    require(contract not paused)
    require(msg.sender has AUTHORITY_ROLE)
    require(msg.sender not blacklisted)
    
    product = getProduct(productId)
    require(product.validationStatus == Pending)
    require(!hasValidated[productId][msg.sender])
    
    hasValidated[productId][msg.sender] = true
    product.rejectionCount++
    
    if product.rejectionCount >= authorityThreshold:
        product.validationStatus = Rejected
    
    emit ProductRejected
```

## Guard Conditions Summary

| Guard | Where Enforced | Failure Result |
|-------|---------------|----------------|
| Not paused | `whenNotPaused` modifier | `ContractPaused` revert |
| Not blacklisted | `onlyActiveRole` modifier | `AccountBlacklisted` revert |
| Correct role | `hasRole` check | `InvalidRoleForStage` revert |
| Current custodian | `currentCustodian` comparison | `NotCurrentCustodian` revert |
| Validation passed | `validationStatus` check at Manufactured stage | `ValidationRequired` revert |
| Valid next custodian | `hasRole` check on nextCustodian | `InvalidNextCustodian` revert |
| No duplicate votes | `hasValidated` mapping | `AlreadyValidated` revert |
| Validation still open | `validationStatus == Pending` check | `ValidationClosed` revert |
