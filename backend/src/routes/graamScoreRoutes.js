import { Router } from "express";
import {
  calculateScoreController,
  getScoreController,
  getScoreHistoryController,
  getScoreReportController,
  getVerificationReportController,
} from "../controllers/graamScoreController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireFinancialConsent } from "../middlewares/consentMiddleware.js";

const router = Router();

router.post("/calculate", requireAuth, requireFinancialConsent, calculateScoreController);
router.get("/history/:userId", requireAuth, getScoreHistoryController);
router.get("/report/:reportId", requireAuth, getScoreReportController);
router.get("/verify/report/:reportId", getVerificationReportController);
router.get("/:userId", requireAuth, getScoreController);

export default router;
