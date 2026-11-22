
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HoneyChain {
    address public owner;

    struct Batch {
        string batchId;
        bytes32 dataHash;
        uint256 recordedAt;
        address recordedBy;
        bool exists;
    }

    // Batch ID => blockchain record
    mapping(string => Batch) private batches;

    event BatchRecorded(
        string batchId,
        bytes32 dataHash,
        address indexed recordedBy,
        uint256 recordedAt
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Record a honey batch on the blockchain.
    function recordBatch(
        string calldata batchId,
        bytes32 dataHash
    ) external onlyOwner {
        require(bytes(batchId).length > 0, "Batch ID is required");
        require(dataHash != bytes32(0), "Invalid data hash");
        require(!batches[batchId].exists, "Batch already recorded");

        batches[batchId] = Batch({
            batchId: batchId,
            dataHash: dataHash,
            recordedAt: block.timestamp,
            recordedBy: msg.sender,
            exists: true
        });

        emit BatchRecorded(
            batchId,
            dataHash,
            msg.sender,
            block.timestamp
        );
    }

    // Check whether the submitted data hash matches the recorded hash.
    function verifyBatch(
        string calldata batchId,
        bytes32 submittedHash
    ) external view returns (bool) {
        Batch storage batch = batches[batchId];

        if (!batch.exists) {
            return false;
        }

        return batch.dataHash == submittedHash;
    }

    // Retrieve a batch's blockchain record.
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
    {
        Batch storage batch = batches[batchId];

        return (
            batch.batchId,
            batch.dataHash,
            batch.recordedAt,
            batch.recordedBy,
            batch.exists
        );
    }

    // Transfer contract administration to another wallet.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
