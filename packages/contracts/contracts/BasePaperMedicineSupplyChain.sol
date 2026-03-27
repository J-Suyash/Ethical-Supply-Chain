// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BasePaperMedicineSupplyChain is Ownable2Step, ReentrancyGuard {
    enum ProductState {
        Created,
        ForSale,
        Sold,
        Shipped,
        Received,
        Consumed
    }

    struct Product {
        uint256 upc;
        string name;
        string details;
        string stateLabel;
        address payable owner;
        address payable buyer;
        uint256 price;
        ProductState state;
    }

    mapping(address => bool) public consumers;
    mapping(uint256 => Product) private products;

    event ConsumerAdded(address indexed account);
    event ConsumerRemoved(address indexed account);
    event ProductCreated(uint256 indexed upc, address indexed owner, string stateLabel);
    event ProductForSale(uint256 indexed upc, uint256 price, string stateLabel);
    event ProductSold(uint256 indexed upc, address indexed buyer, uint256 price, string stateLabel);
    event ProductShipped(uint256 indexed upc, string stateLabel);
    event ProductReceived(uint256 indexed upc, address indexed owner, string stateLabel);
    event ProductConsumed(uint256 indexed upc, address indexed consumer, string stateLabel);

    error ConsumerAlreadyRegistered(address account);
    error ConsumerNotRegistered(address account);
    error UnknownProduct(uint256 upc);
    error ProductAlreadyExists(uint256 upc);
    error InvalidPrice(uint256 price);
    error InvalidState(uint256 upc, ProductState expected, ProductState actual);
    error UnauthorizedActor(address actor);
    error InsufficientBid(uint256 requiredPrice, uint256 sentAmount);
    error InvalidAccount(address account);

    modifier onlyConsumer() {
        if (!consumers[msg.sender]) {
            revert ConsumerNotRegistered(msg.sender);
        }
        _;
    }

    modifier productExists(uint256 upc) {
        if (products[upc].owner == address(0)) {
            revert UnknownProduct(upc);
        }
        _;
    }

    constructor() {
        consumers[msg.sender] = true;
        emit ConsumerAdded(msg.sender);
    }

    function addConsumer(address account) external onlyOwner {
        if (account == address(0)) {
            revert InvalidAccount(account);
        }

        if (consumers[account]) {
            revert ConsumerAlreadyRegistered(account);
        }

        consumers[account] = true;
        emit ConsumerAdded(account);
    }

    function renounceConsumer() external onlyConsumer {
        consumers[msg.sender] = false;
        emit ConsumerRemoved(msg.sender);
    }

    function createMedicine(uint256 upc, string calldata name, string calldata details) external {
        if (products[upc].owner != address(0)) {
            revert ProductAlreadyExists(upc);
        }

        products[upc] = Product({
            upc: upc,
            name: name,
            details: details,
            stateLabel: "Owned",
            owner: payable(msg.sender),
            buyer: payable(address(0)),
            price: 0,
            state: ProductState.Created
        });

        emit ProductCreated(upc, msg.sender, "Owned");
    }

    function sellMedicine(uint256 upc, uint256 price) external productExists(upc) {
        Product storage product = products[upc];

        if (product.owner != msg.sender) {
            revert UnauthorizedActor(msg.sender);
        }

        if (price == 0) {
            revert InvalidPrice(price);
        }

        product.price = price;
        product.state = ProductState.ForSale;
        product.stateLabel = "For Sale";

        emit ProductForSale(upc, price, product.stateLabel);
    }

    function buyMedicine(uint256 upc) external payable productExists(upc) onlyConsumer nonReentrant {
        Product storage product = products[upc];

        if (product.state != ProductState.ForSale) {
            revert InvalidState(upc, ProductState.ForSale, product.state);
        }

        if (msg.value < product.price) {
            revert InsufficientBid(product.price, msg.value);
        }

        product.buyer = payable(msg.sender);
        product.state = ProductState.Sold;
        product.stateLabel = "Sold";

        (bool success, ) = product.owner.call{value: product.price}("");
        require(success, "Payment failed");

        if (msg.value > product.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - product.price}("");
            require(refundSuccess, "Refund failed");
        }

        emit ProductSold(upc, msg.sender, product.price, product.stateLabel);
    }

    function shipMedicine(uint256 upc) external productExists(upc) {
        Product storage product = products[upc];

        if (product.owner != msg.sender) {
            revert UnauthorizedActor(msg.sender);
        }

        if (product.state != ProductState.Sold) {
            revert InvalidState(upc, ProductState.Sold, product.state);
        }

        product.state = ProductState.Shipped;
        product.stateLabel = "Shipped";

        emit ProductShipped(upc, product.stateLabel);
    }

    function receiveMedicine(uint256 upc) external productExists(upc) {
        Product storage product = products[upc];

        if (product.buyer != msg.sender) {
            revert UnauthorizedActor(msg.sender);
        }

        if (product.state != ProductState.Shipped) {
            revert InvalidState(upc, ProductState.Shipped, product.state);
        }

        product.owner = payable(msg.sender);
        product.state = ProductState.Received;
        product.stateLabel = "Owned";

        emit ProductReceived(upc, msg.sender, product.stateLabel);
    }

    function consumeMedicine(uint256 upc) external productExists(upc) {
        Product storage product = products[upc];

        if (product.owner != msg.sender) {
            revert UnauthorizedActor(msg.sender);
        }

        if (product.state != ProductState.Received) {
            revert InvalidState(upc, ProductState.Received, product.state);
        }

        product.state = ProductState.Consumed;
        product.stateLabel = "Consumed";

        emit ProductConsumed(upc, msg.sender, product.stateLabel);
    }

    function getProduct(uint256 upc) external view productExists(upc) returns (Product memory) {
        return products[upc];
    }
}
