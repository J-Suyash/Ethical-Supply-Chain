# Class Diagram

## Mermaid Code

```mermaid
classDiagram
    class Ownable2Step {
        +owner() address
        +pendingOwner() address
        +transferOwnership(address)
        +acceptOwnership()
        +renounceOwnership()
    }

    class ReentrancyGuard {
        +nonReentrant modifier
    }

    class AccessControlEnumerable {
        +hasRole(bytes32, address) bool
        +getRoleMemberCount(bytes32) uint256
        +getRoleMember(bytes32, uint256) address
        +grantRole(bytes32, address)
        +revokeRole(bytes32, address)
        +renounceRole(bytes32, address)
    }

    class Pausable {
        +paused() bool
        +pause()
        +unpause()
        +whenNotPaused modifier
        +whenPaused modifier
    }

    class BasePaperMedicineSupplyChain {
        +consumers(address) bool
        +products(uint256) Product
        +addConsumer(address)
        +renounceConsumer()
        +createMedicine(uint256, string, string)
        +sellMedicine(uint256, uint256)
        +buyMedicine(uint256) payable nonReentrant
        +shipMedicine(uint256)
        +receiveMedicine(uint256)
        +consumeMedicine(uint256)
        +getProduct(uint256) Product
    }

    class EthicalSupplyChain {
        +MANUFACTURER_ROLE bytes32
        +DISTRIBUTOR_ROLE bytes32
        +RETAILER_ROLE bytes32
        +AUTHORITY_ROLE bytes32
        +authorityThreshold uint8
        +products(bytes32) Product
        +hasValidated(bytes32, address) bool
        +blacklisted(address) bool
        +registerActor(bytes32, address)
        +revokeActor(bytes32, address)
        +setAuthorityThreshold(uint8)
        +setBlacklist(address, bool)
        +pause()
        +unpause()
        +registerProduct(bytes32, bytes32, string, string, string, uint32, uint32)
        +advanceStage(bytes32, address) whenNotPaused
        +approveProduct(bytes32) whenNotPaused
        +rejectProduct(bytes32) whenNotPaused
        +getProduct(bytes32) Product
        +getProductSummary(bytes32) tuple
        +productExists(bytes32) bool
    }

    class Product~Base~ {
        +uint256 upc
        +string name
        +string details
        +string stateLabel
        +address payable owner
        +address payable buyer
        +uint256 price
        +ProductState state
    }

    class Product~Proposed~ {
        +string name
        +string batchNumber
        +string manufacturerName
        +bytes32 certificateHash
        +address currentCustodian
        +uint32 createdAt
        +uint32 updatedAt
        +uint32 manufacturedAt
        +uint32 expiryAt
        +uint8 stage
        +uint8 validationStatus
        +uint8 approvalCount
        +uint8 rejectionCount
    }

    class ProductState {
        <<enum>>
        Created
        ForSale
        Sold
        Shipped
        Received
        Consumed
    }

    class ProductStage {
        <<enum>>
        Created
        Manufactured
        Distributed
        Retail
        Sold
    }

    class ValidationStatus {
        <<enum>>
        Pending
        Approved
        Rejected
    }

    Ownable2Step <|-- BasePaperMedicineSupplyChain
    ReentrancyGuard <|-- BasePaperMedicineSupplyChain
    AccessControlEnumerable <|-- EthicalSupplyChain
    Pausable <|-- EthicalSupplyChain

    BasePaperMedicineSupplyChain --> Product~Base~ : uses
    BasePaperMedicineSupplyChain --> ProductState : uses
    EthicalSupplyChain --> Product~Proposed~ : uses
    EthicalSupplyChain --> ProductStage : uses
    EthicalSupplyChain --> ValidationStatus : uses
```

## Class Descriptions

### BasePaperMedicineSupplyChain
- **Inherits:** Ownable2Step, ReentrancyGuard
- **Purpose:** Mirrors the base paper workflow for comparison
- **Key Storage:** `mapping(uint256 => Product) products`, `mapping(address => bool) consumers`
- **Security:** ReentrancyGuard on `buyMedicine()`, Ownable2Step for admin

### EthicalSupplyChain
- **Inherits:** AccessControlEnumerable, Pausable
- **Purpose:** Proposed system with threshold validation and governance
- **Key Storage:** `mapping(bytes32 => Product) products`, `mapping(bytes32 => mapping(address => bool)) hasValidated`, `mapping(address => bool) blacklisted`
- **Security:** RBAC, blacklist, pause, zero-address guards, threshold safety

### Product (Base)
- Uses uint256 UPC identifier
- String-based state labels
- Direct ETH transfers with refund logic

### Product (Proposed)
- Uses bytes32 compact identifier
- Packed fields: uint8 enums, uint32 timestamps
- Certificate hash anchoring for IPFS evidence
- Validation counters for threshold logic
