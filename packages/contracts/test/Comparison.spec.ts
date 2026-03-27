import { expect } from "chai";
import { ethers } from "hardhat";

describe("Base vs Proposed Comparison", function () {
  it("shows that the base system progresses without multi-authority approval while the proposed system gates movement", async function () {
    const [admin, manufacturer, distributor, authorityOne, authorityTwo, buyer] = await ethers.getSigners();

    const baseFactory = await ethers.getContractFactory("BasePaperMedicineSupplyChain");
    const base = await baseFactory.deploy();
    await base.addConsumer(buyer.address);
    await base.connect(manufacturer).createMedicine(1, "Base Medicine", "UPC-only traceability");
    await base.connect(manufacturer).sellMedicine(1, ethers.parseEther("1"));
    await base.connect(buyer).buyMedicine(1, { value: ethers.parseEther("1") });
    await base.connect(manufacturer).shipMedicine(1);

    const proposedFactory = await ethers.getContractFactory("EthicalSupplyChain");
    const proposed = await proposedFactory.deploy(admin.address, 2);
    const manufacturerRole = await proposed.MANUFACTURER_ROLE();
    const distributorRole = await proposed.DISTRIBUTOR_ROLE();
    const authorityRole = await proposed.AUTHORITY_ROLE();

    await proposed.registerActor(manufacturerRole, manufacturer.address);
    await proposed.registerActor(distributorRole, distributor.address);
    await proposed.registerActor(authorityRole, authorityOne.address);
    await proposed.registerActor(authorityRole, authorityTwo.address);

    const productId = ethers.id("compare-product");
    await proposed.connect(manufacturer).registerProduct(productId, ethers.id("ipfs://compare-proof"));
    await proposed.connect(manufacturer).advanceStage(productId, manufacturer.address);

    await expect(proposed.connect(manufacturer).advanceStage(productId, distributor.address)).to.be.revertedWithCustomError(
      proposed,
      "ValidationRequired",
    );

    const baseProduct = await base.getProduct(1);
    const proposedProduct = await proposed.getProductSummary(productId);

    expect(baseProduct.stateLabel).to.equal("Shipped");
    expect(proposedProduct.validationStatus).to.equal(0n);
    expect(proposedProduct.stage).to.equal(1n);
  });
});
