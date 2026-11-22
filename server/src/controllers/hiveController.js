
import mongoose from "mongoose";
import Hive from "../models/Hive.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function handleError(res, error) {
  console.error("Hive API error:", error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A hive with this ID already exists.",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
}

// CREATE HIVE
export async function createHive(req, res) {
  try {
    const {
      hiveId,
      name,
      location,
      beeType,
      status,
      lastInspection,
      notes,
    } = req.body;

    if (!hiveId || !name || !location) {
      return res.status(400).json({
        success: false,
        message: "Hive ID, name and location are required.",
      });
    }

    const hive = await Hive.create({
      hiveId,
      name,
      location,
      beeType,
      status,
      lastInspection,
      notes,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Hive created successfully.",
      data: hive,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// GET ALL HIVES BELONGING TO LOGGED-IN USER
export async function getHives(req, res) {
  try {
    const {
      search = "",
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {
      owner: req.user._id,
      isActive: true,
    };

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        { hiveId: { $regex: safeSearch, $options: "i" } },
        { name: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const [hives, total] = await Promise.all([
      Hive.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),

      Hive.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: hives,
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

// GET ONE HIVE
export async function getHiveById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hive ID.",
      });
    }

    const hive = await Hive.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true,
    });

    if (!hive) {
      return res.status(404).json({
        success: false,
        message: "Hive not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: hive,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// UPDATE HIVE
export async function updateHive(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hive ID.",
      });
    }

    const allowedFields = [
      "name",
      "location",
      "beeType",
      "status",
      "lastInspection",
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

    const hive = await Hive.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
        isActive: true,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hive) {
      return res.status(404).json({
        success: false,
        message: "Hive not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hive updated successfully.",
      data: hive,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// SOFT DELETE HIVE
export async function deactivateHive(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hive ID.",
      });
    }

    const hive = await Hive.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
        isActive: true,
      },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!hive) {
      return res.status(404).json({
        success: false,
        message: "Hive not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hive deactivated successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}
