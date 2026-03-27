import { expect } from "chai";
import { ethers } from "hardhat";

describe("BasePaperMedicineSupplyChain", function () {
  async function deployFixture() {
    const [owner, buyer, outsider] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("BasePaperMedicineSupplyChain");
    const contract = await factory.deploy();

    await contract.addConsumer(buyer.address);

    return { contract, owner, buyer, outsider };
  }

  it("creates a medicine, lists it for sale, and completes the base paper buyer flow", async function () {
    const { contract, owner, buyer } = await deployFixture();

    await expect(contract.createMedicine(1, "Amoxicillin", "UPC-based medicine record"))
      .to.emit(contract, "ProductCreated")
      .withArgs(1, owner.address, "Owned");

    await expect(contract.sellMedicine(1, ethers.parseEther("1")))
      .to.emit(contract, "ProductForSale")
      .withArgs(1, ethers.parseEther("1"), "For Sale");

    await expect(contract.connect(buyer).buyMedicine(1, { value: ethers.parseEther("1") }))
      .to.emit(contract, "ProductSold")
      .withArgs(1, buyer.address, ethers.parseEther("1"), "Sold");

    await contract.shipMedicine(1);
    await contract.connect(buyer).receiveMedicine(1);
    await contract.connect(buyer).consumeMedicine(1);

    const product = await contract.getProduct(1);

    expect(product.state).to.equal(5n);
    expect(product.stateLabel).to.equal("Consumed");
    expect(product.owner).to.equal(buyer.address);
  });

  it("rejects zero-address consumer registration", async function () {
    const { contract } = await deployFixture();

    await expect(contract.addConsumer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      contract,
      "InvalidAccount",
    );
  });

  it("uses consumer registration from the base paper role algorithm", async function () {
    const { contract, outsider } = await deployFixture();

    await contract.createMedicine(99, "Role Check", "consumer registration required");
    await contract.sellMedicine(99, 1n);

    await expect(contract.connect(outsider).buyMedicine(99, { value: 1n })).to.be.revertedWithCustomError(
      contract,
      "ConsumerNotRegistered",
    );
  });

  it("allows the sale flow without any ethical validation gate", async function () {
    const { contract, owner, buyer } = await deployFixture();

    await contract.createMedicine(2, "Paracetamol", "No certificate threshold in base paper flow");
    await contract.sellMedicine(2, ethers.parseEther("1"));
    await contract.connect(buyer).buyMedicine(2, { value: ethers.parseEther("1") });
    await contract.connect(owner).shipMedicine(2);

    const product = await contract.getProduct(2);
    expect(product.stateLabel).to.equal("Shipped");
  });

  it("refunds buyer overpayment in the base sale flow", async function () {
    const { contract, buyer } = await deployFixture();

    await contract.createMedicine(3, "Refund Check", "tests CEI-compatible refund path");
    await contract.sellMedicine(3, ethers.parseEther("1"));

    const before = await ethers.provider.getBalance(buyer.address);
    const tx = await contract.connect(buyer).buyMedicine(3, { value: ethers.parseEther("2") });
    const receipt = await tx.wait();
    const gasCost = receipt!.gasUsed * receipt!.gasPrice;
    const after = await ethers.provider.getBalance(buyer.address);

    expect(before - after).to.equal(ethers.parseEther("1") + gasCost);
  });

  it("only allows the buyer to receive shipped medicine", async function () {
    const { contract, buyer, outsider } = await deployFixture();

    await contract.createMedicine(4, "Receive Check", "buyer-only receive path");
    await contract.sellMedicine(4, ethers.parseEther("1"));
    await contract.connect(buyer).buyMedicine(4, { value: ethers.parseEther("1") });
    await contract.shipMedicine(4);

    await expect(contract.connect(outsider).receiveMedicine(4)).to.be.revertedWithCustomError(
      contract,
      "UnauthorizedActor",
    );
  });
});
