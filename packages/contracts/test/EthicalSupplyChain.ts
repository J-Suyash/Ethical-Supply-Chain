import { expect } from "chai";
import { ethers } from "hardhat";

describe("EthicalSupplyChain", function () {
  it("rejects zero-address admin at deployment", async function () {
    const factory = await ethers.getContractFactory("EthicalSupplyChain");

    await expect(factory.deploy(ethers.ZeroAddress, 2)).to.be.revertedWithCustomError(
      factory,
      "InvalidAccount",
    );
  });

  async function deployFixture() {
    const [
      admin,
      manufacturer,
      manufacturerTwo,
      distributor,
      retailer,
      authorityOne,
      authorityTwo,
      authorityThree,
      outsider,
    ] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("EthicalSupplyChain");
    const contract = await factory.deploy(admin.address, 2);

    const manufacturerRole = await contract.MANUFACTURER_ROLE();
    const distributorRole = await contract.DISTRIBUTOR_ROLE();
    const retailerRole = await contract.RETAILER_ROLE();
    const authorityRole = await contract.AUTHORITY_ROLE();

    await contract.registerActor(manufacturerRole, manufacturer.address);
    await contract.registerActor(manufacturerRole, manufacturerTwo.address);
    await contract.registerActor(distributorRole, distributor.address);
    await contract.registerActor(retailerRole, retailer.address);
    await contract.registerActor(authorityRole, authorityOne.address);
    await contract.registerActor(authorityRole, authorityTwo.address);
    await contract.registerActor(authorityRole, authorityThree.address);

    return {
      admin,
      manufacturer,
      manufacturerTwo,
      distributor,
      retailer,
      authorityOne,
      authorityTwo,
      authorityThree,
      outsider,
      contract,
      roles: {
        manufacturerRole,
        distributorRole,
        retailerRole,
        authorityRole,
      },
    };
  }

  it("registers a product and completes the gated lifecycle", async function () {
    const { contract, manufacturer, distributor, retailer, authorityOne, authorityTwo } =
      await deployFixture();

    const productId = ethers.id("product-001");
    const certificateHash = ethers.id("ipfs://certificate-001");
    const name = "Aspirin 500mg";
    const batchNumber = "BATCH-2024-001";
    const manufacturedAt = 1700000000n;
    const expiryAt = 1800000000n;

    await expect(
      contract.connect(manufacturer).registerProduct(productId, certificateHash, name, batchNumber, manufacturedAt, expiryAt),
    )
      .to.emit(contract, "ProductRegistered")
      .withArgs(productId, manufacturer.address, certificateHash);

    await contract.connect(manufacturer).advanceStage(productId, manufacturer.address);

    await expect(contract.connect(distributor).advanceStage(productId, retailer.address)).to.be.revertedWithCustomError(
      contract,
      "ValidationRequired",
    );

    await contract.connect(authorityOne).approveProduct(productId);
    await contract.connect(authorityTwo).approveProduct(productId);

    await contract.connect(manufacturer).advanceStage(productId, distributor.address);
    await contract.connect(distributor).advanceStage(productId, retailer.address);
    await contract.connect(retailer).advanceStage(productId, ethers.ZeroAddress);

    const summary = await contract.getProductSummary(productId);

    expect(summary.name).to.equal(name);
    expect(summary.batchNumber).to.equal(batchNumber);
    expect(summary.stage).to.equal(4n);
    expect(summary.validationStatus).to.equal(1n);
    expect(summary.currentCustodian).to.equal(retailer.address);
    expect(summary.approvalCount).to.equal(2n);
    expect(summary.manufacturedAt).to.equal(manufacturedAt);
    expect(summary.expiryAt).to.equal(expiryAt);
  });

  it("blocks duplicate or mixed votes from the same authority", async function () {
    const { contract, manufacturer, authorityOne } = await deployFixture();

    const productId = ethers.id("product-002");

    await contract.connect(manufacturer).registerProduct(productId, ethers.id("proof-002"), "Paracetamol", "BATCH-002", 1700000000n, 1800000000n);
    await contract.connect(authorityOne).approveProduct(productId);

    await expect(contract.connect(authorityOne).approveProduct(productId)).to.be.revertedWithCustomError(
      contract,
      "AlreadyValidated",
    );

    await expect(contract.connect(authorityOne).rejectProduct(productId)).to.be.revertedWithCustomError(
      contract,
      "AlreadyValidated",
    );
  });

  it("closes validation after the approval threshold is reached", async function () {
    const { contract, manufacturer, authorityOne, authorityTwo, authorityThree } = await deployFixture();

    const productId = ethers.id("product-003");

    await contract.connect(manufacturer).registerProduct(productId, ethers.id("proof-003"), "Ibuprofen", "BATCH-003", 1700000000n, 1800000000n);
    await contract.connect(authorityOne).approveProduct(productId);
    await contract.connect(authorityTwo).approveProduct(productId);

    await expect(contract.connect(authorityThree).approveProduct(productId)).to.be.revertedWithCustomError(
      contract,
      "ValidationClosed",
    );

    await expect(contract.connect(authorityThree).rejectProduct(productId)).to.be.revertedWithCustomError(
      contract,
      "ValidationClosed",
    );
  });

  it("marks a product as rejected when threshold rejections are reached", async function () {
    const { contract, manufacturer, authorityOne, authorityTwo, distributor } = await deployFixture();

    const productId = ethers.id("product-004");

    await contract.connect(manufacturer).registerProduct(productId, ethers.id("proof-004"), "Amoxicillin", "BATCH-004", 1700000000n, 1800000000n);
    await contract.connect(manufacturer).advanceStage(productId, manufacturer.address);
    await contract.connect(authorityOne).rejectProduct(productId);
    await contract.connect(authorityTwo).rejectProduct(productId);

    const summary = await contract.getProductSummary(productId);

    expect(summary.validationStatus).to.equal(2n);
    expect(summary.rejectionCount).to.equal(2n);

    await expect(contract.connect(distributor).advanceStage(productId, distributor.address)).to.be.revertedWithCustomError(
      contract,
      "ValidationRequired",
    );
  });

  it("blocks blacklisted actors from registration and validation", async function () {
    const { contract, manufacturer, authorityOne } = await deployFixture();

    const registrationProductId = ethers.id("product-005");
    await contract.setBlacklist(manufacturer.address, true);

    await expect(
      contract.connect(manufacturer).registerProduct(registrationProductId, ethers.id("proof-005"), "Omeprazole", "BATCH-005", 1700000000n, 1800000000n),
    ).to.be.revertedWithCustomError(contract, "AccountBlacklisted");

    const validationProductId = ethers.id("product-006");
    await contract.setBlacklist(manufacturer.address, false);
    await contract.connect(manufacturer).registerProduct(validationProductId, ethers.id("proof-006"), "Lisinopril", "BATCH-006", 1700000000n, 1800000000n);
    await contract.setBlacklist(authorityOne.address, true);

    await expect(contract.connect(authorityOne).approveProduct(validationProductId)).to.be.revertedWithCustomError(
      contract,
      "AccountBlacklisted",
    );
  });

  it("blocks blacklisted custodians from advancing stage", async function () {
    const { contract, manufacturer } = await deployFixture();

    const productId = ethers.id("product-blacklisted-stage");
    await contract.connect(manufacturer).registerProduct(productId, ethers.id("proof-blacklisted-stage"), "Metformin", "BATCH-BL", 1700000000n, 1800000000n);
    await contract.setBlacklist(manufacturer.address, true);

    await expect(contract.connect(manufacturer).advanceStage(productId, manufacturer.address)).to.be.revertedWithCustomError(
      contract,
      "AccountBlacklisted",
    );
  });

  it("restricts stage transitions to the current custodian with the expected role", async function () {
    const { contract, manufacturer, manufacturerTwo, distributor, outsider } = await deployFixture();

    const productId = ethers.id("product-007");

    await contract.connect(manufacturer).registerProduct(productId, ethers.id("proof-007"), "Atorvastatin", "BATCH-007", 1700000000n, 1800000000n);

    await expect(contract.connect(manufacturerTwo).advanceStage(productId, distributor.address)).to.be.revertedWithCustomError(
      contract,
      "NotCurrentCustodian",
    );

    await expect(contract.connect(outsider).advanceStage(productId, distributor.address)).to.be.revertedWithCustomError(
      contract,
      "InvalidRoleForStage",
    );
  });

  it("requires the next custodian to match the next lifecycle role", async function () {
    const { contract, manufacturer, authorityOne, authorityTwo, retailer } = await deployFixture();

    const productId = ethers.id("product-008");

    await contract.connect(manufacturer).registerProduct(productId, ethers.id("proof-008"), "Losartan", "BATCH-008", 1700000000n, 1800000000n);
    await expect(contract.connect(manufacturer).advanceStage(productId, retailer.address)).to.be.revertedWithCustomError(
      contract,
      "InvalidNextCustodian",
    );

    await contract.connect(manufacturer).advanceStage(productId, ethers.ZeroAddress);
    await contract.connect(authorityOne).approveProduct(productId);
    await contract.connect(authorityTwo).approveProduct(productId);
  });

  it("enforces threshold governance rules", async function () {
    const { contract, authorityThree, roles } = await deployFixture();

    await expect(contract.setAuthorityThreshold(0)).to.be.revertedWithCustomError(contract, "InvalidThreshold");
    await expect(contract.setAuthorityThreshold(4)).to.be.revertedWithCustomError(contract, "InvalidThreshold");

    await contract.setAuthorityThreshold(3);
    expect(await contract.authorityThreshold()).to.equal(3n);

    await expect(contract.revokeActor(roles.authorityRole, authorityThree.address)).to.be.revertedWithCustomError(
      contract,
      "ThresholdWouldExceedAuthorityCount",
    );

    await contract.setAuthorityThreshold(2);
    await contract.revokeActor(roles.authorityRole, authorityThree.address);

    expect(await contract.getRoleMemberCount(roles.authorityRole)).to.equal(2n);
  });

  it("rejects zero-address registrations and blacklist updates", async function () {
    const { contract, roles } = await deployFixture();

    await expect(contract.registerActor(roles.authorityRole, ethers.ZeroAddress)).to.be.revertedWithCustomError(
      contract,
      "InvalidAccount",
    );

    await expect(contract.setBlacklist(ethers.ZeroAddress, true)).to.be.revertedWithCustomError(
      contract,
      "InvalidAccount",
    );
  });

  it("lets admin pause and unpause user-facing actions", async function () {
    const { contract, manufacturer, authorityOne } = await deployFixture();

    await contract.pause();

    await expect(
      contract.connect(manufacturer).registerProduct(ethers.id("paused-product"), ethers.id("paused-proof"), "Paused Med", "BATCH-PAUSE", 1700000000n, 1800000000n),
    ).to.be.revertedWith("Pausable: paused");

    await contract.unpause();
    await contract.connect(manufacturer).registerProduct(ethers.id("paused-product"), ethers.id("paused-proof"), "Paused Med", "BATCH-PAUSE", 1700000000n, 1800000000n);
    await expect(contract.connect(authorityOne).approveProduct(ethers.id("paused-product"))).to.not.be.reverted;
  });

  it("rejects unknown products and zero product ids", async function () {
    const { contract, manufacturer, authorityOne } = await deployFixture();

    await expect(
      contract.connect(manufacturer).registerProduct(ethers.ZeroHash, ethers.id("proof-zero"), "Zero Med", "BATCH-ZERO", 1700000000n, 1800000000n),
    ).to.be.revertedWithCustomError(contract, "InvalidProductId");

    await expect(contract.connect(authorityOne).approveProduct(ethers.id("missing-product"))).to.be.revertedWithCustomError(
      contract,
      "UnknownProduct",
    );
  });
});
