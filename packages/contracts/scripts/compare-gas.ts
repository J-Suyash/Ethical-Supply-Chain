import { ethers } from "hardhat";

async function main() {
  const [admin, manufacturer, distributor, retailer, authorityOne, authorityTwo, buyer] =
    await ethers.getSigners();

  const baseFactory = await ethers.getContractFactory("BasePaperMedicineSupplyChain");
  const base = await baseFactory.deploy();
  await base.waitForDeployment();
  await (await base.addConsumer(buyer.address)).wait();

  const proposedFactory = await ethers.getContractFactory("EthicalSupplyChain");
  const proposed = await proposedFactory.deploy(admin.address, 2);
  await proposed.waitForDeployment();

  const manufacturerRole = await proposed.MANUFACTURER_ROLE();
  const distributorRole = await proposed.DISTRIBUTOR_ROLE();
  const retailerRole = await proposed.RETAILER_ROLE();
  const authorityRole = await proposed.AUTHORITY_ROLE();

  await (await proposed.registerActor(manufacturerRole, manufacturer.address)).wait();
  await (await proposed.registerActor(distributorRole, distributor.address)).wait();
  await (await proposed.registerActor(retailerRole, retailer.address)).wait();
  await (await proposed.registerActor(authorityRole, authorityOne.address)).wait();
  await (await proposed.registerActor(authorityRole, authorityTwo.address)).wait();

  const baseCreate = await base.connect(manufacturer).createMedicine.estimateGas(1n, "Base Medicine", "UPC-only traceability");
  await (await base.connect(manufacturer).createMedicine(1n, "Base Medicine", "UPC-only traceability")).wait();
  const baseSell = await base.connect(manufacturer).sellMedicine.estimateGas(1n, ethers.parseEther("0.01"));
  await (await base.connect(manufacturer).sellMedicine(1n, ethers.parseEther("0.01"))).wait();
  const baseBuy = await base.connect(buyer).buyMedicine.estimateGas(1n, { value: ethers.parseEther("0.01") });

  const productId = ethers.id("gas-product");
  const certificateHash = ethers.id("gas-proof");
  const proposedRegister = await proposed.connect(manufacturer).registerProduct.estimateGas(productId, certificateHash);
  await (await proposed.connect(manufacturer).registerProduct(productId, certificateHash)).wait();
  const proposedAdvanceManufactured = await proposed.connect(manufacturer).advanceStage.estimateGas(productId, manufacturer.address);
  await (await proposed.connect(manufacturer).advanceStage(productId, manufacturer.address)).wait();
  const proposedApprove = await proposed.connect(authorityOne).approveProduct.estimateGas(productId);

  console.log("Gas comparison snapshot");
  console.table([
    { action: "Base createMedicine", gas: baseCreate.toString() },
    { action: "Base sellMedicine", gas: baseSell.toString() },
    { action: "Base buyMedicine", gas: baseBuy.toString() },
    { action: "Proposed registerProduct", gas: proposedRegister.toString() },
    { action: "Proposed advanceStage (Created->Manufactured)", gas: proposedAdvanceManufactured.toString() },
    { action: "Proposed approveProduct", gas: proposedApprove.toString() },
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
