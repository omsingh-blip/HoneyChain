require("dotenv").config();

const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS is missing from .env");
  }

  // Connect to the deployed HoneyChain contract
  const honeyChain = await ethers.getContractAt(
    "HoneyChain",
    contractAddress
  );

  // Sample honey batch metadata
  const batchMetadata = {
    batchId: "HC-BATCH-001",
    honeyType: "Wildflower Honey",
    apiaryLocation: "Bhopal, Madhya Pradesh",
    quantityKg: 25,
    harvestDate: "2026-11-21",
  };

  // Generate a cryptographic hash of the batch data
  const dataHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(batchMetadata))
  );

  console.log("\nRecording honey batch...");
  console.log("Batch ID:", batchMetadata.batchId);
  console.log("Data Hash:", dataHash);

  // Record the batch on the blockchain
  const transaction = await honeyChain.recordBatch(
    batchMetadata.batchId,
    dataHash
  );

  const receipt = await transaction.wait();

  console.log("\nBatch recorded successfully!");
  console.log("Transaction Hash:", receipt.hash);

  // Retrieve the stored batch
  const storedBatch = await honeyChain.getBatch(
    batchMetadata.batchId
  );

  console.log("\nRetrieved Blockchain Record:");
  console.log("Batch ID:", storedBatch[0]);
  console.log("Stored Hash:", storedBatch[1]);
  console.log("Recorded At:", new Date(
    Number(storedBatch[2]) * 1000
  ).toLocaleString());
  console.log("Recorded By:", storedBatch[3]);
  console.log("Exists:", storedBatch[4]);

  // Verify the submitted data against the stored hash
  const isVerified = await honeyChain.verifyBatch(
    batchMetadata.batchId,
    dataHash
  );

  console.log("\nVerification Result:", isVerified);
}

main().catch((error) => {
  console.error("\nBlockchain test failed:", error);
  process.exitCode = 1;
});