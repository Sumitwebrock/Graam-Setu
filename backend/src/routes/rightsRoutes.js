import { Router } from "express";
import {
  rightsBySituationController,
  minimumWageController,
  consumerHelpController,
  reportFraudController,
  districtFraudController,
  glossaryController,
  legalAidController,
  chatbotQueryController,
} from "../controllers/rightsController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/rights/situation/:type", rightsBySituationController);
router.get("/rights/minimum-wage", minimumWageController);
router.get("/rights/consumer/:issue", consumerHelpController);
router.get("/rights/glossary", glossaryController);
router.get("/rights/legal-aid", legalAidController);
router.post("/fraud/report", requireAuth, reportFraudController);
router.get("/fraud/district/:district", districtFraudController);
router.post("/chatbot/query", requireAuth, chatbotQueryController);

export default router;
