// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControlEnumerable} from "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

contract EthicalSupplyChain is AccessControlEnumerable, Pausable {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");

    enum ProductStage {
        Created,
        Manufactured,
        Distributed,
        Retail,
        Sold
    }

    enum ValidationStatus {
        Pending,
        Approved,
        Rejected
    }

    struct Product {
        string name;
        string batchNumber;
        string manufacturerName;
        bytes32 certificateHash;
        address currentCustodian;
        uint32 createdAt;
        uint32 updatedAt;
        uint32 manufacturedAt;
        uint32 expiryAt;
        uint8 stage;
        uint8 validationStatus;
        uint8 approvalCount;
        uint8 rejectionCount;
    }

    uint8 public authorityThreshold;

    mapping(bytes32 => Product) private products;
    mapping(bytes32 => mapping(address => bool)) public hasValidated;
    mapping(address => bool) public blacklisted;

    event ProductRegistered(bytes32 indexed productId, address indexed manufacturer, bytes32 certificateHash);
    event ProductStageAdvanced(bytes32 indexed productId, ProductStage indexed stage, address indexed actor, address nextCustodian);
    event ProductApproved(bytes32 indexed productId, address indexed authority, uint8 approvalCount);
    event ProductRejected(bytes32 indexed productId, address indexed authority, uint8 rejectionCount);
    event ValidationThresholdUpdated(uint8 newThreshold);
    event BlacklistUpdated(address indexed account, bool blacklistedStatus);

    error AccountBlacklisted(address account);
    error UnknownProduct(bytes32 productId);
    error ProductAlreadyExists(bytes32 productId);
    error ValidationClosed(bytes32 productId);
    error AlreadyValidated(bytes32 productId, address authority);
    error InvalidThreshold(uint8 threshold, uint256 authorityCount);
    error ValidationRequired(bytes32 productId);
    error InvalidRoleForStage(ProductStage stage, address actor);
    error NotCurrentCustodian(bytes32 productId, address actor);
    error InvalidNextCustodian(ProductStage stage, address custodian);
    error ThresholdWouldExceedAuthorityCount(uint8 threshold, uint256 authorityCount);
    error InvalidProductId();
    error InvalidAccount(address account);

    modifier onlyActiveRole(bytes32 role) {
        if (blacklisted[msg.sender]) {
            revert AccountBlacklisted(msg.sender);
        }

        _checkRole(role, msg.sender);
        _;
    }

    constructor(address admin, uint8 threshold) {
        if (admin == address(0)) {
            revert InvalidAccount(admin);
        }

        if (threshold == 0) {
            revert InvalidThreshold(threshold, 0);
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        authorityThreshold = threshold;
    }

    function registerActor(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) {
            revert InvalidAccount(account);
        }

        grantRole(role, account);
    }

    function revokeActor(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (role == AUTHORITY_ROLE && hasRole(role, account)) {
            uint256 authorityCount = getRoleMemberCount(AUTHORITY_ROLE);
            if (authorityCount <= authorityThreshold) {
                revert ThresholdWouldExceedAuthorityCount(authorityThreshold, authorityCount - 1);
            }
        }

        revokeRole(role, account);
    }

    function setAuthorityThreshold(uint8 threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 authorityCount = getRoleMemberCount(AUTHORITY_ROLE);
        if (threshold == 0 || threshold > authorityCount) {
            revert InvalidThreshold(threshold, authorityCount);
        }

        authorityThreshold = threshold;
        emit ValidationThresholdUpdated(threshold);
    }

    function setBlacklist(address account, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) {
            revert InvalidAccount(account);
        }

        blacklisted[account] = status;
        emit BlacklistUpdated(account, status);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function registerProduct(
        bytes32 productId,
        bytes32 certificateHash,
        string calldata name,
        string calldata batchNumber,
        string calldata manufacturerName,
        uint32 manufacturedAt,
        uint32 expiryAt
    ) external onlyActiveRole(MANUFACTURER_ROLE) whenNotPaused {
        if (productId == bytes32(0)) {
            revert InvalidProductId();
        }

        if (_exists(productId)) {
            revert ProductAlreadyExists(productId);
        }

        products[productId] = Product({
            name: name,
            batchNumber: batchNumber,
            manufacturerName: manufacturerName,
            certificateHash: certificateHash,
            currentCustodian: msg.sender,
            createdAt: uint32(block.timestamp),
            updatedAt: uint32(block.timestamp),
            manufacturedAt: manufacturedAt,
            expiryAt: expiryAt,
            stage: uint8(ProductStage.Manufactured),
            validationStatus: uint8(ValidationStatus.Pending),
            approvalCount: 0,
            rejectionCount: 0
        });

        emit ProductRegistered(productId, msg.sender, certificateHash);
    }

    function advanceStage(bytes32 productId, address nextCustodian) external whenNotPaused {
        Product storage product = _requireProduct(productId);

        if (blacklisted[msg.sender]) {
            revert AccountBlacklisted(msg.sender);
        }

        ProductStage currentStage = ProductStage(product.stage);

        if (currentStage == ProductStage.Manufactured && product.validationStatus != uint8(ValidationStatus.Approved)) {
            revert ValidationRequired(productId);
        }

        if (currentStage == ProductStage.Sold) {
            revert InvalidRoleForStage(currentStage, msg.sender);
        }

        bytes32 requiredRole = _requiredRoleForStage(currentStage);
        if (!hasRole(requiredRole, msg.sender)) {
            revert InvalidRoleForStage(currentStage, msg.sender);
        }

        if (product.currentCustodian != msg.sender) {
            revert NotCurrentCustodian(productId, msg.sender);
        }

        bytes32 nextRequiredRole = _requiredRoleForStage(ProductStage(uint8(currentStage) + 1));
        if (nextCustodian != address(0) && !hasRole(nextRequiredRole, nextCustodian)) {
            revert InvalidNextCustodian(ProductStage(uint8(currentStage) + 1), nextCustodian);
        }

        ProductStage nextStage = ProductStage(uint8(currentStage) + 1);
        product.stage = uint8(nextStage);
        product.updatedAt = uint32(block.timestamp);

        if (nextCustodian != address(0)) {
            product.currentCustodian = nextCustodian;
        }

        emit ProductStageAdvanced(productId, nextStage, msg.sender, product.currentCustodian);
    }

    function approveProduct(bytes32 productId) external onlyActiveRole(AUTHORITY_ROLE) whenNotPaused {
        Product storage product = _requireProduct(productId);

        if (hasValidated[productId][msg.sender]) {
            revert AlreadyValidated(productId, msg.sender);
        }

        if (product.validationStatus != uint8(ValidationStatus.Pending)) {
            revert ValidationClosed(productId);
        }

        hasValidated[productId][msg.sender] = true;
        product.approvalCount += 1;
        product.updatedAt = uint32(block.timestamp);

        if (product.approvalCount >= authorityThreshold) {
            product.validationStatus = uint8(ValidationStatus.Approved);
        }

        emit ProductApproved(productId, msg.sender, product.approvalCount);
    }

    function rejectProduct(bytes32 productId) external onlyActiveRole(AUTHORITY_ROLE) whenNotPaused {
        Product storage product = _requireProduct(productId);

        if (hasValidated[productId][msg.sender]) {
            revert AlreadyValidated(productId, msg.sender);
        }

        if (product.validationStatus != uint8(ValidationStatus.Pending)) {
            revert ValidationClosed(productId);
        }

        hasValidated[productId][msg.sender] = true;
        product.rejectionCount += 1;
        product.updatedAt = uint32(block.timestamp);

        if (product.rejectionCount >= authorityThreshold) {
            product.validationStatus = uint8(ValidationStatus.Rejected);
        }

        emit ProductRejected(productId, msg.sender, product.rejectionCount);
    }

    function getProduct(bytes32 productId) external view returns (Product memory) {
        return _requireProduct(productId);
    }

    function getProductSummary(bytes32 productId)
        external
        view
        returns (
            string memory name,
            string memory batchNumber,
            string memory manufacturerName,
            ProductStage stage,
            ValidationStatus validationStatus,
            address currentCustodian,
            uint8 approvalCount,
            uint8 rejectionCount,
            bytes32 certificateHash,
            uint32 manufacturedAt,
            uint32 expiryAt
        )
    {
        Product storage product = _requireProduct(productId);

        return (
            product.name,
            product.batchNumber,
            product.manufacturerName,
            ProductStage(product.stage),
            ValidationStatus(product.validationStatus),
            product.currentCustodian,
            product.approvalCount,
            product.rejectionCount,
            product.certificateHash,
            product.manufacturedAt,
            product.expiryAt
        );
    }

    function productExists(bytes32 productId) external view returns (bool) {
        return _exists(productId);
    }

    function _requireProduct(bytes32 productId) internal view returns (Product storage product) {
        product = products[productId];
        if (product.currentCustodian == address(0)) {
            revert UnknownProduct(productId);
        }
    }

    function _exists(bytes32 productId) internal view returns (bool) {
        return products[productId].currentCustodian != address(0);
    }

    function _requiredRoleForStage(ProductStage stage) internal pure returns (bytes32) {
        if (stage == ProductStage.Manufactured) {
            return MANUFACTURER_ROLE;
        }

        if (stage == ProductStage.Distributed) {
            return DISTRIBUTOR_ROLE;
        }

        return RETAILER_ROLE;
    }
}
