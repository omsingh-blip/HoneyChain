import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  traceBatch,
  updateBatchStatus,
  retryBatchBlockchain,
} from "../controllers/honeyBatchController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public traceability rate limiter.
const traceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many traceability requests. Please try again after 15 minutes.",
  },
});

const blockchainRetryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many blockchain retry requests. Please try again after 15 minutes.",
  },
});

// Public route: customers can trace batches without logging in.
router.get("/trace/:batchId", traceLimiter, traceBatch);

// All routes below this point require authentication.
router.use(protect);

router.post(
  "/:id/blockchain/retry",
  blockchainRetryLimiter,
  retryBatchBlockchain
);

router.route("/")
  .post(createBatch)
  .get(getBatches);

router.get("/:id", getBatchById);
router.patch("/:id", updateBatch);
router.patch("/:id/status", updateBatchStatus);

export default router;
