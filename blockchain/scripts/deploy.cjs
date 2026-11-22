
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HoneyChain contract...");

  const [deployer] = await ethers.getSigners();

  console.log("Deploying account:", deployer.address);

  const HoneyChain = await ethers.getContractFactory("HoneyChain");

  const honeyChain = await HoneyChain.deploy();

  await honeyChain.waitForDeployment();

  const contractAddress = await honeyChain.getAddress();

  console.log("-----------------------------------");
  console.log("HoneyChain deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Contract owner:", await honeyChain.owner());
  console.log("-----------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
