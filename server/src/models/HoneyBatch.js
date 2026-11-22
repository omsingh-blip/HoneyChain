
import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Harvested", "Processing", "Packaged", "Verified"],
      required: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const honeyBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: [true, "Batch ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    honeyType: {
      type: String,
      required: [true, "Honey variety is required"],
      trim: true,
      maxlength: 100,
    },

    sourceHive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hive",
      required: [true, "Source hive is required"],
    },

    harvestDate: {
      type: Date,
      required: [true, "Harvest date is required"],
      validate: {
        validator(value) {
          return value <= new Date();
        },
        message: "Harvest date cannot be in the future",
      },
    },

    quantityKg: {
      type: Number,
      required: [true, "Harvest quantity is required"],
      min: [0.1, "Quantity must be greater than zero"],
      max: [100000, "Quantity exceeds the allowed limit"],
    },

    status: {
      type: String,
      enum: ["Harvested", "Processing", "Packaged", "Verified"],
      default: "Harvested",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    apiaryLocation: {
      type: String,
      required: [true, "Apiary location is required"],
      trim: true,
      maxlength: 120,
    },

    processingDate: {
      type: Date,
      default: null,
    },

    packagingDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    blockchain: {
      network: {
        type: String,
        default: null,
      },

      contractAddress: {
        type: String,
        default: null,
      },

      transactionHash: {
        type: String,
        default: null,
      },

      dataHash: {
        type: String,
        default: null,
      },

      recordedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add initial lifecycle event when a batch is created.
honeyBatchSchema.pre("save", function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status || "Harvested",
      changedAt: new Date(),
      changedBy: this.owner,
      note: "Batch created",
    });
  }
});

// Database indexes
honeyBatchSchema.index({ harvestDate: -1 });

honeyBatchSchema.index({
  sourceHive: 1,
  harvestDate: -1,
});

honeyBatchSchema.index({
  owner: 1,
  createdAt: -1,
});

const HoneyBatch = mongoose.model("HoneyBatch", honeyBatchSchema);

export default HoneyBatch;
