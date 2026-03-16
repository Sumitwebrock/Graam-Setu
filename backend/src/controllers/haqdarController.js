import {
  getEligibleSchemes,
  getEnrolledSchemes,
  applyForScheme,
  fileGrievance,
  getPaymentHistory,
  getApplicationStatus,
  getSchemesForUser,
} from "../services/haqdarService.js";

export const eligibleSchemesController = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (userId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const data = await getEligibleSchemes(userId);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const enrolledSchemesController = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (userId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const data = await getEnrolledSchemes(userId);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const applySchemeController = async (req, res, next) => {
  try {
    const data = await applyForScheme(req.user.uid, req.body);
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
};

export const grievanceController = async (req, res, next) => {
  try {
    const data = await fileGrievance(req.user.uid, req.body);
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
};

export const paymentHistoryController = async (req, res, next) => {
  try {
    const data = await getPaymentHistory(req.user.uid);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const applicationStatusController = async (req, res, next) => {
  try {
    const data = await getApplicationStatus(req.user.uid, {
      schemeId: req.query.schemeId,
      schemeName: req.query.schemeName,
    });
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const dynamicSchemesController = async (req, res, next) => {
  try {
    const data = await getSchemesForUser(req.user.uid);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};
