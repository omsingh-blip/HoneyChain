import mongoose from "mongoose";
import HoneyBatch from "../models/HoneyBatch.js";
import Hive from "../models/Hive.js";
import {
  recordBatchOnBlockchain,
  verifyBatchOnBlockchain,
} from "../services/blockchainService.js";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const blockchainRetryLocks = new Map();

const hiveDetails = "hiveId name location beeType";

const allowedStatuses = [
  "Harvested",
  "Processing",
  "Packaged",
];

const allowedBatchStatuses = [
  ...allowedStatuses,
  "Verified",
];


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

async function acquireBatchRetryLock(batchId) {
  const previousLock =
    blockchainRetryLocks.get(batchId) || Promise.resolve();

  let release;

  const currentLock = new Promise((resolve) => {
    release = resolve;
  });

  blockchainRetryLocks.set(batchId, currentLock);

  // Wait for the previous request to finish.
  await previousLock;

  return () => {
    if (blockchainRetryLocks.get(batchId) === currentLock) {
      blockchainRetryLocks.delete(batchId);
    }

    release();
  };
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function handleError(res, error) {
  console.error("Honey batch API error:", error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A batch with this ID already exists.",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
}

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

// --------------------------------------------------
// CREATE HONEY BATCH
// --------------------------------------------------

export async function createBatch(req, res) {
  try {
    const {
      batchId,
      honeyType,
      sourceHive,
      harvestDate,
      quantityKg,
      apiaryLocation,
      notes,
    } = req.body;

    if (
      !batchId ||
      !honeyType ||
      !sourceHive ||
      !harvestDate ||
      quantityKg === undefined ||
      !apiaryLocation
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required batch details.",
      });
    }

    // Verify that the hive belongs to this beekeeper.
    const hive = await Hive.findOne({
      hiveId: String(sourceHive).trim().toUpperCase(),
      owner: req.user._id,
      isActive: true,
    });

    if (!hive) {
      return res.status(404).json({
        success: false,
        message: "The selected hive was not found in your account.",
      });
    }

    // Create the batch in MongoDB first.
    const batch = await HoneyBatch.create({
      batchId,
      honeyType,
      sourceHive: hive._id,
      harvestDate,
      quantityKg,
      apiaryLocation,
      notes,
      owner: req.user._id,
    });

    let blockchainStatus = "pending";

    let responseMessage =
      "Honey batch created, but blockchain recording is pending.";

    try {
      const batchForBlockchain = await HoneyBatch.findById(batch._id)
        .populate("sourceHive", hiveDetails);

      const blockchainRecord = await recordBatchOnBlockchain(
        batchForBlockchain
      );

      batch.blockchain = blockchainRecord;

      await batch.save();

      blockchainStatus = "recorded";

      responseMessage =
        "Honey batch created and recorded on the blockchain.";
    } catch (blockchainError) {
      console.error(
        "Blockchain recording failed:",
        blockchainError
      );
    }

    const populatedBatch = await HoneyBatch.findById(batch._id)
      .populate("sourceHive", hiveDetails);

    return res.status(201).json({
      success: true,
      message: responseMessage,
      blockchainStatus,
      data: populatedBatch,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// --------------------------------------------------
// GET ALL BATCHES BELONGING TO LOGGED-IN USER
// --------------------------------------------------

export async function getBatches(req, res) {
  try {
    const {
      search = "",
      status,
      page = "1",
      limit = "20",
    } = req.query;

    if (typeof search !== "string" || search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid search query.",
      });
    }

    if (
      status &&
      !allowedBatchStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch status.",
      });
    }

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const filter = {
      owner: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        {
          batchId: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          honeyType: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          apiaryLocation: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    const [batches, total] = await Promise.all([
      HoneyBatch.find(filter)
        .populate("sourceHive", hiveDetails)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),

      HoneyBatch.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: batches,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// --------------------------------------------------
// GET ONE BATCH BELONGING TO LOGGED-IN USER
// --------------------------------------------------

export async function getBatchById(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch = await HoneyBatch.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("sourceHive", hiveDetails);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// --------------------------------------------------
// UPDATE HONEY BATCH DETAILS
// --------------------------------------------------

export async function updateBatch(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const allowedFields = [
      "honeyType",
      "sourceHive",
      "harvestDate",
      "quantityKg",
      "apiaryLocation",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    if (
      updates.quantityKg !== undefined &&
      (
        !Number.isFinite(Number(updates.quantityKg)) ||
        Number(updates.quantityKg) <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero.",
      });
    }

    if (updates.sourceHive !== undefined) {
      if (
        typeof updates.sourceHive !== "string" ||
        !updates.sourceHive.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid source hive.",
        });
      }

      const hive = await Hive.findOne({
        hiveId: updates.sourceHive.trim().toUpperCase(),
        owner: req.user._id,
        isActive: true,
      });

      if (!hive) {
        return res.status(404).json({
          success: false,
          message: "The selected active hive was not found.",
        });
      }

      updates.sourceHive = hive._id;
    }

    const batch = await HoneyBatch.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // Preserve blockchain immutability.
    if (batch.blockchain?.transactionHash) {
      return res.status(409).json({
        success: false,
        message:
          "This batch is already recorded on the blockchain. Its original details cannot be edited.",
      });
    }

    Object.assign(batch, updates);

    await batch.save();

    const updatedBatch = await HoneyBatch.findById(batch._id)
      .populate("sourceHive", hiveDetails);

    return res.status(200).json({
      success: true,
      message: "Honey batch updated successfully.",
      data: updatedBatch,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// --------------------------------------------------
// PUBLIC BATCH TRACEABILITY
// --------------------------------------------------

export async function traceBatch(req, res) {
  try {
    const { batchId } = req.params;

    if (
      typeof batchId !== "string" ||
      !batchId.trim() ||
      batchId.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch = await HoneyBatch.findOne({
      batchId: batchId.trim().toUpperCase(),
    }).populate("sourceHive", hiveDetails);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Honey batch not found.",
      });
    }

    const verification = await verifyBatchOnBlockchain(batch);

    const stages = [
      {
        title: "Honey Harvested",
        description: `Harvested from hive ${
          batch.sourceHive?.hiveId || "Unknown"
        }`,
        date: batch.harvestDate,
        completed: true,
      },
      {
        title: "Processing",
        description: "Honey processing stage",
        date: batch.processingDate,
        completed: Boolean(batch.processingDate),
      },
      {
        title: "Packaging",
        description: "Honey packaging stage",
        date: batch.packagingDate,
        completed: Boolean(batch.packagingDate),
      },
      {
        title: "Blockchain Verification",
        description: verification.verified
          ? "Batch data successfully verified on-chain."
          : verification.reason ||
            "Blockchain verification failed.",
        date: verification.recordedAt || null,
        completed: verification.verified,
      },
    ];

    // Explicit public response: do not expose owner IDs,
    // internal MongoDB IDs, or private notes.
    const publicBatch = {
      batchId: batch.batchId,
      honeyType: batch.honeyType,
      harvestDate: batch.harvestDate,
      quantityKg: batch.quantityKg,
      status: batch.status,
      apiaryLocation: batch.apiaryLocation,
      processingDate: batch.processingDate,
      packagingDate: batch.packagingDate,

      sourceHive: batch.sourceHive
        ? {
            hiveId: batch.sourceHive.hiveId,
            name: batch.sourceHive.name,
            location: batch.sourceHive.location,
            beeType: batch.sourceHive.beeType,
          }
        : null,

        blockchain: {
    network: batch.blockchain?.network || null,
    contractAddress: batch.blockchain?.contractAddress || null,
    transactionHash: batch.blockchain?.transactionHash || null,
    dataHash: batch.blockchain?.dataHash || null,
    recordedAt: batch.blockchain?.recordedAt || null,
  },
      statusHistory: batch.statusHistory.map((entry) => ({
        status: entry.status,
        changedAt: entry.changedAt,
      })),
    };

    return res.status(200).json({
      success: true,

      message: verification.verified
        ? "Batch data matches the hash recorded on the blockchain."
        : verification.reason ||
          "Batch could not be verified.",

      data: {
        batch: publicBatch,
        stages,
        blockchainVerified: verification.verified,
        verification,
      },
    });
  } catch (error) {
    console.error("Batch trace failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to trace this batch at the moment.",
    });
  }
}

// --------------------------------------------------
// UPDATE BATCH STATUS AND RECORD HISTORY
// --------------------------------------------------

export async function updateBatchStatus(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: Harvested, Processing, Packaged.",
      });
    }

    const batch = await HoneyBatch.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const previousStatus = batch.status;
    const statusChanged = previousStatus !== status;

    if (!Array.isArray(batch.statusHistory)) {
      batch.statusHistory = [];
    }

    // Add initial history for older batches.
    if (statusChanged && batch.statusHistory.length === 0) {
      batch.statusHistory.push({
        status: previousStatus,
        changedAt:
          batch.createdAt || batch.harvestDate || new Date(),
        changedBy: batch.owner,
        note: "Initial status (history tracking introduced)",
      });
    }

    if (statusChanged) {
      batch.status = status;

      batch.statusHistory.push({
        status,
        changedAt: new Date(),
        changedBy: req.user._id,
        note: `Status changed from ${previousStatus} to ${status}`,
      });
    }

    if (status === "Processing" && !batch.processingDate) {
      batch.processingDate = new Date();
    }

    if (status === "Packaged" && !batch.packagingDate) {
      batch.packagingDate = new Date();
    }

    await batch.save();

    const updatedBatch = await HoneyBatch.findById(batch._id)
      .populate("sourceHive", hiveDetails)
      .populate("statusHistory.changedBy", "name email");

    return res.status(200).json({
      success: true,

      message: statusChanged
        ? "Batch status updated and history recorded successfully."
        : "Batch already has this status.",

      data: updatedBatch,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// --------------------------------------------------
// RETRY BLOCKCHAIN RECORDING
// --------------------------------------------------


export async function retryBatchBlockchain(req, res) {
  let releaseLock;

  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batchId = req.params.id;

    // Serialize retry requests for this specific batch.
    releaseLock = await acquireBatchRetryLock(batchId);

    // Fetch fresh data after acquiring the lock.
    const batch = await HoneyBatch.findOne({
      _id: batchId,
      owner: req.user._id,
    }).populate("sourceHive", hiveDetails);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // Another request may have completed the recording.
    if (batch.blockchain?.transactionHash) {
      return res.status(200).json({
        success: true,
        message: "This batch is already recorded on the blockchain.",
        blockchainStatus: "recorded",
        data: batch,
      });
    }

    const blockchainRecord =
      await recordBatchOnBlockchain(batch);

    batch.blockchain = blockchainRecord;

    await batch.save();

    const updatedBatch = await HoneyBatch.findById(batch._id)
      .populate("sourceHive", hiveDetails);

    return res.status(200).json({
      success: true,
      message: "Batch successfully recorded on the blockchain.",
      blockchainStatus: "recorded",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Blockchain retry failed:", error);

    return res.status(500).json({
      success: false,
      message: "Blockchain retry failed. Please try again later.",
    });
  } finally {
    // Always release the lock, including on errors or early returns.
    releaseLock?.();
  }
}
