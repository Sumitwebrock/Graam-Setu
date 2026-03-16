import { Router } from "express";
import {
  eligibleSchemesController,
  enrolledSchemesController,
  applySchemeController,
  grievanceController,
  paymentHistoryController,
  applicationStatusController,
  dynamicSchemesController,
} from "../controllers/haqdarController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, dynamicSchemesController);
router.get("/eligible/:userId", requireAuth, eligibleSchemesController);
router.get("/enrolled/:userId", requireAuth, enrolledSchemesController);
router.post("/apply", requireAuth, applySchemeController);
router.post("/grievance", requireAuth, grievanceController);
router.get("/payment-history", requireAuth, paymentHistoryController);
router.get("/application-status", requireAuth, applicationStatusController);

export default router;
