import { Router } from "express";
import { getVerificationReportController } from "../controllers/graamScoreController.js";

const router = Router();

router.get("/report/:reportId", getVerificationReportController);

export default router;
