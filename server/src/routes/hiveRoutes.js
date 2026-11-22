
import { Router } from "express";

import {
  createHive,
  getHives,
  getHiveById,
  updateHive,
  deactivateHive,
} from "../controllers/hiveController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All hive routes require authentication.
router.use(protect);

router.route("/")
  .post(createHive)
  .get(getHives);

router.route("/:id")
  .get(getHiveById)
  .patch(updateHive)
  .delete(deactivateHive);

export default router;
