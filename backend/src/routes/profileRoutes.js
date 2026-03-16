import { Router } from "express";
import {
  createProfileController,
  getProfileController,
  updateProfileController,
  dashboardSummaryController,
} from "../controllers/profileController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { attachVerificationLayer } from "../middlewares/verificationMiddleware.js";

const router = Router();

router.post("/create", requireAuth, attachVerificationLayer, createProfileController);
router.put("/update", requireAuth, updateProfileController);
router.get("/dashboard-summary", requireAuth, dashboardSummaryController);
router.get("/:userId", requireAuth, getProfileController);

export default router;
