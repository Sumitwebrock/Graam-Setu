import {
  createGoal,
  getGoals,
  updateProgress,
  addSaving,
  getProgress,
  getSavingsAdvice,
  getReminderPreference,
  setReminderPreference,
} from "../services/savingsService.js";

export const createGoalController = async (req, res, next) => {
  try {
    const data = await createGoal(req.user.uid, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getGoalsController = async (req, res, next) => {
  try {
    if (req.params.userId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const data = await getGoals(req.params.userId);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const updateProgressController = async (req, res, next) => {
  try {
    const data = await updateProgress(req.user.uid, req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const savingsAdviceController = async (req, res, next) => {
  try {
    const data = await getSavingsAdvice(req.user.uid, req.body || {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const addSavingController = async (req, res, next) => {
  try {
    const data = await addSaving(req.user.uid, req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getProgressController = async (req, res, next) => {
  try {
    const data = await getProgress(req.user.uid, req.params.goalId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getReminderPreferenceController = async (req, res, next) => {
  try {
    const data = await getReminderPreference(req.user.uid);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const setReminderPreferenceController = async (req, res, next) => {
  try {
    const data = await setReminderPreference(req.user.uid, req.body || {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
