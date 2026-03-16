import { Router } from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import graamScoreRoutes from "./graamScoreRoutes.js";
import haqdarRoutes from "./haqdarRoutes.js";
import savingsRoutes from "./savingsRoutes.js";
import rightsRoutes from "./rightsRoutes.js";
import verificationRoutes from "./verificationRoutes.js";
import verificationModuleRoutes from "./verificationModuleRoutes.js";
import agentRoutes from "./agentRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/score", graamScoreRoutes);
router.use("/schemes", haqdarRoutes);
router.use("/savings", savingsRoutes);
router.use("/verify", verificationRoutes);
router.use("/verification", verificationModuleRoutes);
router.use("/", rightsRoutes);
router.use("/agent", agentRoutes);

export default router;
