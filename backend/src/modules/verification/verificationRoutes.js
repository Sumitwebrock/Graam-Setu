import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/authMiddleware.js";
import { sendOtpController, verifyOtpController } from "./otpController.js";
import { uploadMiddleware, uploadDocumentController } from "./documentController.js";
import {
  getPendingVerificationsController,
  getUserVerificationDetailController,
  verifyUserController,
  rejectUserController,
} from "./agentVerificationController.js";

const router = Router();

// Citizen-facing verification APIs (authenticated user).
router.post("/send-otp", requireAuth, sendOtpController);
router.post("/verify-otp", requireAuth, verifyOtpController);
router.post("/upload-document", requireAuth, uploadMiddleware, uploadDocumentController);

// BC Agent verification APIs.
router.get("/agent/pending-verifications", requireAuth, requireRole("agent"), getPendingVerificationsController);
router.get("/agent/user/:userId", requireAuth, requireRole("agent"), getUserVerificationDetailController);
router.post("/agent/verify-user", requireAuth, requireRole("agent"), verifyUserController);
router.post("/agent/reject-user", requireAuth, requireRole("agent"), rejectUserController);

export default router;
