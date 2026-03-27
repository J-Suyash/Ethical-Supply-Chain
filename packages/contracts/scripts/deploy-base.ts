import "dotenv/config";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("BasePaperMedicineSupplyChain");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("BasePaperMedicineSupplyChain deployed");
  console.log(`network: ${network.name}`);
  console.log(`deployer: ${deployer.address}`);
  console.log(`address: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
