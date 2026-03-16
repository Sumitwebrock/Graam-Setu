import {
  calculateScore,
  getLatestScore,
  getScoreHistory,
  getScoreReport,
  getVerificationReport,
} from "../services/graamScoreService.js";

export const calculateScoreController = async (req, res, next) => {
  try {
    const result = await calculateScore(req.user.uid, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getScoreController = async (req, res, next) => {
  try {
    if (req.params.userId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const result = await getLatestScore(req.params.userId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getScoreHistoryController = async (req, res, next) => {
  try {
    if (req.params.userId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const result = await getScoreHistory(req.params.userId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getScoreReportController = async (req, res, next) => {
  try {
    const result = await getScoreReport(req.params.reportId);
    if (result.userId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getVerificationReportController = async (req, res, next) => {
  try {
    const result = await getVerificationReport(req.params.reportId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
