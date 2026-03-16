import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/authMiddleware.js";
import {
  registerAgentController,
  loginAgentController,
  dashboardController,
  searchUsersController,
  getUserDetailController,
  assistSchemeController,
  assistSavingsController,
  reportFraudController,
} from "./agentController.js";
import {
  getPendingVerificationsController,
  getUserVerificationDetailController,
  verifyUserController,
  rejectUserController,
} from "../verification/agentVerificationController.js";

const router = Router();

// Public endpoints for agent onboarding
router.post("/register", registerAgentController);
router.post("/login", loginAgentController);

// All routes below require authenticated agent
router.use(requireAuth, requireRole("agent"));

router.get("/dashboard", dashboardController);
router.get("/users/search", searchUsersController);
router.get("/user/:id", getUserDetailController);
router.post("/assist-scheme", assistSchemeController);
router.post("/assist-savings", assistSavingsController);
router.post("/report-fraud", reportFraudController);
router.get("/pending-verifications", getPendingVerificationsController);
router.get("/user/:userId/verification", getUserVerificationDetailController);
router.post("/verify-user", verifyUserController);
router.post("/reject-user", rejectUserController);

export default router;
