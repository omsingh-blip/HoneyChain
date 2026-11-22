
import { ethers } from "ethers";
import { readFileSync } from "node:fs";
import path from "node:path";

// --------------------------------------------------
// CONTRACT ARTIFACT
// --------------------------------------------------

const artifactPath = path.resolve(
  process.cwd(),
  "../blockchain/artifacts/contracts/HoneyChain.sol/HoneyChain.json"
);

const artifact = JSON.parse(
  readFileSync(artifactPath, "utf8")
);

// --------------------------------------------------
// NETWORK CONFIGURATION
// --------------------------------------------------

const SUPPORTED_NETWORKS = {
  11155111n: "Ethereum Sepolia",
  31337n: "Hardhat Localhost",
};

async function getNetworkName(provider) {
  const network = await provider.getNetwork();

  const networkName = SUPPORTED_NETWORKS[network.chainId];

  if (!networkName) {
    throw new Error(
      `Unsupported blockchain network: ${network.chainId}`
    );
  }

  return networkName;
}

// --------------------------------------------------
// BLOCKCHAIN CONNECTION
// --------------------------------------------------

async function getBlockchainContext({ write = false } = {}) {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const contractAddress =
    process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

  if (!rpcUrl || !contractAddress) {
    throw new Error(
      "Blockchain environment variables are missing."
    );
  }

  if (!ethers.isAddress(contractAddress)) {
    throw new Error("Invalid blockchain contract address.");
  }

  if (write && !privateKey) {
    throw new Error(
      "Blockchain private key is not configured."
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const networkName = await getNetworkName(provider);

  const contractCode = await provider.getCode(contractAddress);

  if (contractCode === "0x") {
    throw new Error(
      "No smart contract was found at the configured address."
    );
  }

  const signer = write
    ? new ethers.Wallet(privateKey, provider)
    : provider;

  const contract = new ethers.Contract(
    contractAddress,
    artifact.abi,
    signer
  );

  if (write) {
    const contractOwner = await contract.owner();

    if (
      contractOwner.toLowerCase() !==
      signer.address.toLowerCase()
    ) {
      throw new Error(
        "The configured blockchain wallet is not the contract owner."
      );
    }
  }

  return {
    provider,
    contract,
    contractAddress,
    networkName,
  };
}

// --------------------------------------------------
// BATCH DATA AND HASH GENERATION
// --------------------------------------------------

function getBatchData(batch) {
  if (!batch?.batchId || !batch?.harvestDate) {
    throw new Error("Incomplete batch data.");
  }

  if (!batch.sourceHive?.hiveId) {
    throw new Error(
      "Source hive details must be populated before blockchain operations."
    );
  }

  const harvestDate = new Date(batch.harvestDate);

  if (Number.isNaN(harvestDate.getTime())) {
    throw new Error("Invalid batch harvest date.");
  }

  return {
    batchId: batch.batchId,
    honeyType: batch.honeyType,
    sourceHive: batch.sourceHive.hiveId,
    apiaryLocation: batch.apiaryLocation,
    quantityKg: batch.quantityKg,
    harvestDate: harvestDate.toISOString(),
  };
}

function calculateBatchHash(batch) {
  const batchData = getBatchData(batch);

  return ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(batchData))
  );
}

// --------------------------------------------------
// BLOCKCHAIN RECORD HELPERS
// --------------------------------------------------

async function getOnChainBatch(contract, batchId) {
  const existing = await contract.getBatch(batchId);

  return {
    batchId: existing[0],
    dataHash: existing[1],
    recordedAt: existing[2],
    recordedBy: existing[3],
    exists: existing[4],
  };
}

async function findBatchTransactionHash(
  contract,
  batchId
) {
  try {
    const configuredBlock =
      process.env.BLOCKCHAIN_DEPLOYMENT_BLOCK;

    const fromBlock =
      configuredBlock === undefined ||
      configuredBlock.trim() === ""
        ? 0
        : Number(configuredBlock);

    if (
      !Number.isSafeInteger(fromBlock) ||
      fromBlock < 0
    ) {
      throw new Error(
        "Invalid BLOCKCHAIN_DEPLOYMENT_BLOCK configuration."
      );
    }

    const events = await contract.queryFilter(
      contract.filters.BatchRecorded(),
      fromBlock,
      "latest"
    );

    const matchingEvent = events.find(
      (event) =>
        event.args.batchId === batchId
    );

    return matchingEvent?.transactionHash || null;
  } catch (error) {
    console.error(
      "Unable to retrieve batch transaction event:",
      error.message
    );

    return null;
  }
}

async function buildBlockchainRecord(
  contract,
  existing,
  batchId,
  networkName,
  contractAddress
) {
  const transactionHash =
    await findBatchTransactionHash(contract, batchId);

  return {
    network: networkName,
    contractAddress,
    transactionHash,
    dataHash: existing.dataHash,
    recordedAt: new Date(
      Number(existing.recordedAt) * 1000
    ),
  };
}

// --------------------------------------------------
// RECORD BATCH ON BLOCKCHAIN
// --------------------------------------------------

export async function recordBatchOnBlockchain(batch) {
  const {
    contract,
    contractAddress,
    networkName,
  } = await getBlockchainContext({ write: true });

  const dataHash = calculateBatchHash(batch);

  // Check whether the batch already exists.
  const existing = await getOnChainBatch(
    contract,
    batch.batchId
  );

  if (existing.exists) {
    if (existing.dataHash !== dataHash) {
      throw new Error(
        "This batch ID already exists on-chain with different data."
      );
    }

    return buildBlockchainRecord(
      contract,
      existing,
      batch.batchId,
      networkName,
      contractAddress
    );
  }

  try {
    const transaction = await contract.recordBatch(
      batch.batchId,
      dataHash
    );

    const receipt = await transaction.wait();

    if (!receipt || receipt.status !== 1) {
      throw new Error(
        "Blockchain transaction was not successful."
      );
    }

    // Read the confirmed blockchain record.
    const recorded = await getOnChainBatch(
      contract,
      batch.batchId
    );

    if (
      !recorded.exists ||
      recorded.dataHash !== dataHash
    ) {
      throw new Error(
        "Blockchain transaction completed, but the recorded data could not be confirmed."
      );
    }

    return {
      network: networkName,
      contractAddress,
      transactionHash: receipt.hash,
      dataHash,
      recordedAt: new Date(
        Number(recorded.recordedAt) * 1000
      ),
    };
  } catch (error) {
    // Another simultaneous request may have recorded
    // this batch before our transaction was processed.
    try {
      const latest = await getOnChainBatch(
        contract,
        batch.batchId
      );

      if (latest.exists) {
        if (latest.dataHash !== dataHash) {
          throw new Error(
            "This batch ID was recorded on-chain with different data."
          );
        }

        return buildBlockchainRecord(
          contract,
          latest,
          batch.batchId,
          networkName,
          contractAddress
        );
      }
    } catch (recoveryError) {
      if (
        recoveryError.message.includes(
          "recorded on-chain with different data"
        )
      ) {
        throw recoveryError;
      }

      console.error(
        "Blockchain recovery check failed:",
        recoveryError.message
      );
    }

    throw error;
  }
}

// --------------------------------------------------
// VERIFY BATCH ON BLOCKCHAIN
// --------------------------------------------------

export async function verifyBatchOnBlockchain(batch) {
  const {
    contract,
    contractAddress,
    networkName,
  } = await getBlockchainContext();

  const calculatedHash = calculateBatchHash(batch);

  const storedHash = batch.blockchain?.dataHash;

  if (!storedHash) {
    return {
      verified: false,
      reason: "No blockchain hash is saved in MongoDB.",
    };
  }

  if (!ethers.isHexString(storedHash, 32)) {
    return {
      verified: false,
      reason: "The stored blockchain hash is invalid.",
    };
  }

  // Check that the saved contract address matches
  // the contract currently being used.
  const savedContractAddress =
    batch.blockchain?.contractAddress;

  if (
    savedContractAddress &&
    savedContractAddress.toLowerCase() !==
      contractAddress.toLowerCase()
  ) {
    return {
      verified: false,
      reason:
        "The saved contract address does not match the configured contract.",
    };
  }

  const onChainBatch = await getOnChainBatch(
    contract,
    batch.batchId
  );

  if (!onChainBatch.exists) {
    return {
      verified: false,
      reason: "Batch does not exist on the blockchain.",
    };
  }

  const contractHash = onChainBatch.dataHash;

  const matchesMongoDB =
    calculatedHash === storedHash;

  const matchesBlockchain =
    calculatedHash === contractHash;

  const matchesStoredRecord =
    storedHash === contractHash;

  return {
    verified:
      matchesMongoDB &&
      matchesBlockchain &&
      matchesStoredRecord,

    network: networkName,

    calculatedHash,
    storedHash,
    contractHash,

    matchesMongoDB,
    matchesBlockchain,
    matchesStoredRecord,

    transactionHash:
      batch.blockchain?.transactionHash || null,

    recordedAt: new Date(
      Number(onChainBatch.recordedAt) * 1000
    ),
  };
}
