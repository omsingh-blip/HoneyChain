
import mongoose from "mongoose";

const hiveSchema = new mongoose.Schema(
  {
    hiveId: {
      type: String,
      required: [true, "Hive ID is required"],
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: [true, "Hive name is required"],
      trim: true,
      maxlength: 80,
    },

    location: {
      type: String,
      required: [true, "Apiary location is required"],
      trim: true,
      maxlength: 120,
    },

    beeType: {
      type: String,
      enum: [
        "Indian Honey Bee",
        "Italian Honey Bee",
        "Carniolan Honey Bee",
        "Other / Unknown",
      ],
      default: "Other / Unknown",
    },

    status: {
      type: String,
      enum: [
        "Healthy",
        "Needs inspection",
        "Under observation",
      ],
      default: "Needs inspection",
    },

    lastInspection: {
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// A beekeeper cannot register the same hive ID twice.
// Different beekeepers can use the same hive ID.
hiveSchema.index(
  { owner: 1, hiveId: 1 },
  { unique: true }
);

const Hive = mongoose.model("Hive", hiveSchema);

export default Hive;
