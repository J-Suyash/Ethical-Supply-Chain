import "dotenv/config";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const threshold = Number(process.env.AUTHORITY_THRESHOLD ?? "2");

  if (!Number.isInteger(threshold) || threshold <= 0) {
    throw new Error("AUTHORITY_THRESHOLD must be a positive integer");
  }

  const factory = await ethers.getContractFactory("EthicalSupplyChain");
  const contract = await factory.deploy(deployer.address, threshold);
  await contract.waitForDeployment();

  console.log("EthicalSupplyChain deployed");
  console.log(`network: ${network.name}`);
  console.log(`deployer/admin: ${deployer.address}`);
  console.log(`threshold: ${threshold}`);
  console.log(`address: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
