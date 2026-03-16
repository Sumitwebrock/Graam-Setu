import {
  createProfile,
  getProfile,
  updateProfile,
  getDashboardSummary,
} from "../services/profileService.js";

export const createProfileController = async (req, res, next) => {
  try {
    const profile = await createProfile(req.user.uid, {
      ...req.body,
      ...(req.verificationMeta || {}),
    });
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
};

export const getProfileController = async (req, res, next) => {
  try {
    if (req.params.userId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const profile = await getProfile(req.params.userId);
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

export const updateProfileController = async (req, res, next) => {
  try {
    const profile = await updateProfile(req.user.uid, req.body);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const dashboardSummaryController = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user.uid);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};
