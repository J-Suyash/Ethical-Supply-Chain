# Flow Diagram — Base Paper System

## Mermaid Code

```mermaid
flowchart TD
    Start([Start]) --> Create[Create Medicine<br/>with UPC]
    Create --> Sell[Put Medicine<br/>For Sale]
    Sell --> Buy[Consumer Buys<br/>Medicine]
    Buy --> Ship[Owner Ships<br/>Medicine]
    Ship --> Receive[Buyer Receives<br/>Medicine]
    Receive --> Consume[Buyer Consumes<br/>Medicine]
    Consume --> End([End])

    style Create fill:#e3f2fd
    style Sell fill:#e3f2fd
    style Buy fill:#e8f5e9
    style Ship fill:#e3f2fd
    style Receive fill:#e8f5e9
    style Consume fill:#fff3e0
```

## Flow Description

| Step | Actor | Action | Contract Function |
|------|-------|--------|-------------------|
| 1 | Manufacturer / Owner | Create medicine with UPC identifier | `createMedicine(upc, name, details)` |
| 2 | Owner | Set price and list for sale | `sellMedicine(upc, price)` |
| 3 | Registered Consumer | Send ETH to purchase | `buyMedicine(upc)` |
| 4 | Owner | Mark as shipped | `shipMedicine(upc)` |
| 5 | Buyer | Confirm receipt, ownership transfers | `receiveMedicine(upc)` |
| 6 | Buyer | Mark as consumed | `consumeMedicine(upc)` |

**Key Characteristic:** No external validation gate. Product flows directly from creation to consumption based on owner/consumer actions only.
