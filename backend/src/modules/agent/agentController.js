import {
  registerAgent,
  loginAgent,
  getAgentDashboard,
  searchAgentUsers,
  getAgentUserDetail,
  assistScheme,
  assistSavings,
  reportFraudForUser,
} from "./agentService.js";

export const registerAgentController = async (req, res, next) => {
  try {
    const response = await registerAgent(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginAgentController = async (req, res, next) => {
  try {
    const response = await loginAgent(req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const dashboardController = async (req, res, next) => {
  try {
    const response = await getAgentDashboard(req.user.uid);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const searchUsersController = async (req, res, next) => {
  try {
    const response = await searchAgentUsers(req.user.uid, req.query);
    res.status(200).json({ users: response });
  } catch (error) {
    next(error);
  }
};

export const getUserDetailController = async (req, res, next) => {
  try {
    const response = await getAgentUserDetail(req.user.uid, req.params.id);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const assistSchemeController = async (req, res, next) => {
  try {
    const response = await assistScheme(req.user.uid, req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const assistSavingsController = async (req, res, next) => {
  try {
    const response = await assistSavings(req.user.uid, req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const reportFraudController = async (req, res, next) => {
  try {
    const response = await reportFraudForUser(req.user.uid, req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
