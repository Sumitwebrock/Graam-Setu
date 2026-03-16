import {
  startOtpLogin,
  verifyOtpAndIssueJwt,
  getProfileFromToken,
  registerCompatibility,
  loginCompatibility,
} from "../services/authService.js";

export const login = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const response = await startOtpLogin(phone);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const response = await verifyOtpAndIssueJwt(req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const profile = async (req, res, next) => {
  try {
    const response = await getProfileFromToken(req.user.uid);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const registerCompatController = async (req, res, next) => {
  try {
    const response = await registerCompatibility(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginCompatController = async (req, res, next) => {
  try {
    const response = await loginCompatibility(req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
