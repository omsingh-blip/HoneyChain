
# HoneyChain Smart Contract Documentation

## 1. Overview

HoneyChain uses a Solidity smart contract to maintain tamper-resistant records of honey batches on the Ethereum blockchain.

The smart contract is named `HoneyChain` and is responsible for:

- Recording honey batch identifiers and their data hashes.
- Preventing duplicate blockchain records.
- Verifying whether submitted batch data matches the recorded hash.
- Retrieving blockchain records.
- Managing contract ownership.

The contract stores the batch hash rather than the complete honey batch information. The detailed batch information remains in the backend database.

---

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| Solidity | Smart contract programming language |
| Hardhat | Smart contract development and compilation |
| ethers.js | Backend interaction with the blockchain |
| Ethereum Sepolia | Blockchain deployment network |
| Node.js | Blockchain integration through the backend |

**Solidity Version:** `^0.8.28`

**License:** MIT

**Contract Name:** `HoneyChain`

---

## 3. Smart Contract Architecture

The contract maintains a mapping between a unique batch ID and its blockchain record.

Each batch record contains:

| Field | Data Type | Description |
|---|---|---|
| `batchId` | string | Unique honey batch identifier |
| `dataHash` | bytes32 | Hash representing the batch data |
| `recordedAt` | uint256 | Blockchain timestamp when recorded |
| `recordedBy` | address | Wallet address that recorded the batch |
| `exists` | bool | Indicates whether the record exists |

### Batch Mapping

```solidity
mapping(string => Batch) private batches;
```

The mapping uses the batch ID as its key and stores the corresponding `Batch` structure.

This allows the contract to retrieve and verify records using their batch identifiers.

---

## 4. Contract Ownership and Access Control

When the contract is deployed, the deploying wallet becomes its owner.

```solidity
constructor() {
    owner = msg.sender;
}
```

The contract uses the `onlyOwner` modifier to restrict administrative operations.

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}
```

Only the contract owner can:

- Record new honey batches.
- Transfer contract ownership.

The verification and retrieval functions are public and do not require ownership.

---

## 5. Smart Contract Functions

### 5.1 recordBatch()

**Purpose:** Records a honey batch on the blockchain.

```solidity
function recordBatch(
    string calldata batchId,
    bytes32 dataHash
) external onlyOwner
```

**Parameters:**

- `batchId`: Unique identifier of the honey batch.
- `dataHash`: Hash representing the batch information.

**Validation Rules:**

1. Batch ID cannot be empty.
2. Data hash cannot be zero.
3. A batch cannot be recorded more than once.
4. Only the contract owner can execute this function.

**Blockchain Operations:**

When a valid request is received:

- The batch ID is stored.
- The data hash is stored.
- The current blockchain timestamp is recorded.
- The caller's wallet address is stored.
- The batch existence flag is set to `true`.
- A `BatchRecorded` event is emitted.

**Example:**

```solidity
recordBatch(
    "BATCH-001",
    bytes32Hash
);
```

This operation changes blockchain state and requires a transaction.

### 5.2 verifyBatch()

**Purpose:** Checks whether a submitted data hash matches the hash recorded on the blockchain.

```solidity
function verifyBatch(
    string calldata batchId,
    bytes32 submittedHash
) external view returns (bool)
```

**Parameters:**

- `batchId`: Honey batch identifier.
- `submittedHash`: Hash calculated from the submitted batch information.

**Verification Logic:**

1. The contract searches for the requested batch.
2. If the batch does not exist, it returns `false`.
3. If the batch exists, its stored hash is compared with the submitted hash.
4. Matching hashes return `true`.
5. Different hashes return `false`.

**Example:**

```solidity
bool isValid = honeyChain.verifyBatch(
    "BATCH-001",
    submittedHash
);
```

This is a read-only function and does not require a blockchain transaction.

### 5.3 getBatch()

**Purpose:** Retrieves the blockchain record associated with a batch ID.

```solidity
function getBatch(
    string calldata batchId
)
    external
    view
    returns (
        string memory,
        bytes32,
        uint256,
        address,
        bool
    )
```

**Returned Information:**

- Batch ID.
- Recorded data hash.
- Recording timestamp.
- Recording wallet address.
- Batch existence status.

If a batch does not exist, the function returns the default values of the corresponding structure fields, including `exists = false`.

This function is read-only.

### 5.4 transferOwnership()

**Purpose:** Transfers administrative control of the contract to another wallet.

```solidity
function transferOwnership(
    address newOwner
) external onlyOwner
```

**Parameters:**

- `newOwner`: Wallet address that will become the new owner.

**Validation Rules:**

- Only the current owner can transfer ownership.
- The new owner address cannot be the zero address.

After a successful transfer:

- The previous owner is replaced.
- The new wallet receives administrative control.
- An `OwnershipTransferred` event is emitted.

---

## 6. Smart Contract Events

Events provide information about important blockchain operations.

### 6.1 BatchRecorded

```solidity
event BatchRecorded(
    string batchId,
    bytes32 dataHash,
    address indexed recordedBy,
    uint256 recordedAt
);
```

Emitted whenever a new honey batch is successfully recorded.

Event information includes:

- Batch identifier.
- Recorded data hash.
- Wallet address that recorded the batch.
- Blockchain timestamp.

The `recordedBy` address is indexed, allowing it to be used as an event filter.

### 6.2 OwnershipTransferred

```solidity
event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
);
```

Emitted whenever contract ownership changes.

It identifies the previous owner and the new owner.

---

## 7. Blockchain Verification Workflow

HoneyChain uses a hash-based verification process to check the integrity of honey batch information.

### Recording Workflow

1. A beekeeper creates a honey batch through the frontend.
2. The backend validates the submitted information.
3. The batch is stored in MongoDB.
4. The backend generates a hash representing the batch data.
5. The backend calls the `recordBatch()` smart contract function.
6. The blockchain stores the batch ID, hash, timestamp, and recording wallet.
7. The transaction information is saved in the backend database.

### Verification Workflow

1. A user requests public traceability information using a batch ID.
2. The backend retrieves the corresponding batch from MongoDB.
3. The backend calculates the hash of the relevant batch data.
4. The backend calls `verifyBatch()` on the smart contract.
5. The contract compares the submitted hash with the stored hash.
6. The backend returns the verification result to the frontend.

A matching hash indicates that the submitted data matches the hash recorded on the blockchain.

---

## 8. Blockchain and Database Integration

HoneyChain uses MongoDB and Ethereum together.

| MongoDB | Ethereum Blockchain |
|---|---|
| Stores complete batch information | Stores batch identifier and data hash |
| Stores honey type and quantity | Stores hash representing batch data |
| Stores hive and apiary details | Stores recording timestamp |
| Maintains batch lifecycle history | Stores recording wallet address |
| Supports application queries and updates | Provides tamper-resistant hash records |

This hybrid architecture keeps detailed application data in the database while using blockchain to verify data integrity.

### Important Design Consideration

The blockchain does not store the complete honey batch information.

It stores a cryptographic hash that can be compared with a hash calculated by the backend.

Therefore, blockchain verification establishes whether the submitted data matches the recorded hash. It does not independently prove that the original information entered by a beekeeper was truthful.

---

## 9. Deployment Configuration

The project uses Hardhat for smart contract development and compilation.

The backend communicates with the deployed contract through ethers.js.

The blockchain integration requires configuration values such as:

```env
BLOCKCHAIN_RPC_URL=YOUR_RPC_ENDPOINT
BLOCKCHAIN_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
BLOCKCHAIN_PRIVATE_KEY=YOUR_PRIVATE_KEY
```

These values must be configured through environment variables.

**Security considerations:**

- Never commit private keys to GitHub.
- Keep blockchain credentials on the backend.
- Do not expose the signing wallet's private key to the frontend.
- Restrict administrative contract operations to the owner wallet.

---

## 10. Limitations and Future Improvements

The current smart contract provides basic batch recording and hash verification.

Possible future improvements include:

- Adding batch update and revocation mechanisms.
- Supporting multiple authorized recording wallets.
- Adding role-based access control.
- Integrating additional traceability events.
- Improving event indexing and monitoring.
- Supporting more advanced verification workflows.
- Adding automated smart contract tests for edge cases and access control.

---

## 11. Conclusion

The HoneyChain smart contract provides a blockchain-based foundation for honey traceability.

By recording batch identifiers and cryptographic hashes on Ethereum, the system enables the backend to verify whether batch information matches its previously recorded blockchain representation.

The integration of Solidity, Hardhat, ethers.js, MongoDB, and the Ethereum network creates a hybrid architecture for managing honey batch information and verifying its integrity.
