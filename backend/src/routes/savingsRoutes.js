import { Router } from "express";
import {
  createGoalController,
  getGoalsController,
  updateProgressController,
  addSavingController,
  getProgressController,
  savingsAdviceController,
  getReminderPreferenceController,
  setReminderPreferenceController,
} from "../controllers/savingsController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/create-goal", requireAuth, createGoalController);
router.get("/goals/:userId", requireAuth, getGoalsController);
router.post("/add-saving", requireAuth, addSavingController);
router.get("/progress/:goalId", requireAuth, getProgressController);
router.get("/reminder-preference", requireAuth, getReminderPreferenceController);
router.post("/reminder-preference", requireAuth, setReminderPreferenceController);

// Backward-compatible route kept for existing clients.
router.post("/update-progress", requireAuth, updateProgressController);
router.get("/advice", requireAuth, savingsAdviceController);

export default router;
