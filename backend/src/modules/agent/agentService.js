import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { getEligibleSchemes, applyForScheme } from "../../services/haqdarService.js";
import { getGoals, addSaving } from "../../services/savingsService.js";
import { reportFraud as reportFraudService } from "../../services/rightsService.js";
import {
  createAgent,
  findAgentByPhone,
  getAgentById,
  getAgentStats,
  logAgentActivity,
  searchUsers,
  getUserWithProfile,
} from "./agentModel.js";

const issueToken = (payload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY });

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

  const originalBuffer = Buffer.from(originalHash, "hex");
  const verifyBuffer = Buffer.from(hashToVerify, "hex");
  if (originalBuffer.length !== verifyBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, verifyBuffer);
};

export const registerAgent = async (payload) => {
  const name = (payload.name || "").trim();
  const phone_number = (payload.phone_number || "").trim();
  const password = payload.password || "";

  if (!name || !phone_number || !password) {
    throw new Error("Name, phone_number and password are required");
  }

  const existing = await findAgentByPhone(phone_number);
  if (existing) {
    throw new Error("Agent with this phone number already exists");
  }

  const passwordHash = hashPassword(password);
  const agent = await createAgent({
    name,
    phone_number,
    location: payload.location,
    assigned_village: payload.assigned_village,
    bank_partner: payload.bank_partner,
    passwordHash,
  });

  const token = issueToken({
    uid: agent.agent_id,
    role: "agent",
    agentId: agent.agent_id,
  });

  return {
    token,
    agent,
  };
};

export const loginAgent = async (payload) => {
  const phone_number = (payload.phone_number || "").trim();
  const password = payload.password || "";
  if (!phone_number || !password) {
    throw new Error("phone_number and password are required");
  }

  const agent = await findAgentByPhone(phone_number);
  if (!agent) {
    throw new Error("Agent not found");
  }

  const isValid = verifyPassword(password, agent.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = issueToken({
    uid: agent.agent_id,
    role: "agent",
    agentId: agent.agent_id,
  });

  return {
    token,
    agent,
  };
};

export const getAgentDashboard = async (agentId) => {
  const agent = await getAgentById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }
  const stats = await getAgentStats(agentId);
  return {
    agent: {
      agent_id: agent.agent_id,
      name: agent.name,
      phone_number: agent.phone_number,
      assigned_village: agent.assigned_village,
      bank_partner: agent.bank_partner,
    },
    stats,
  };
};

export const searchAgentUsers = async (agentId, query) => {
  // agentId reserved for future permission checks (e.g., restrict to assigned_village)
  void agentId;
  const users = await searchUsers({
    phone: query.phone || undefined,
    name: query.name || undefined,
    village: query.village || undefined,
  });
  return users;
};

export const getAgentUserDetail = async (agentId, userId) => {
  void agentId;
  const result = await getUserWithProfile(userId);
  if (!result) {
    throw new Error("User not found");
  }

  const { user, profile } = result;
  const [schemes, goals] = await Promise.all([
    getEligibleSchemes(user.id),
    getGoals(user.id),
  ]);

  return {
    user,
    profile,
    eligibleSchemes: schemes,
    savingsGoals: goals,
  };
};

export const assistScheme = async (agentId, payload) => {
  const { userId, schemePayload } = payload;
  if (!userId || !schemePayload) {
    throw new Error("userId and schemePayload are required");
  }

  const result = await applyForScheme(userId, schemePayload);

  await logAgentActivity({
    agentId,
    actionType: "assist_scheme",
    userId,
    details: { schemeId: schemePayload.schemeId },
  });

  return result;
};

export const assistSavings = async (agentId, payload) => {
  const { userId, goalId, amount } = payload;
  if (!userId || !goalId || amount == null) {
    throw new Error("userId, goalId and amount are required");
  }

  const result = await addSaving(userId, { goalId, amount });

  await logAgentActivity({
    agentId,
    actionType: "assist_savings",
    userId,
    details: { goalId, amount },
  });

  return result;
};

export const reportFraudForUser = async (agentId, payload) => {
  const { userId, fraud } = payload;
  if (!userId || !fraud) {
    throw new Error("userId and fraud payload are required");
  }

  const result = await reportFraudService(userId, fraud);

  await logAgentActivity({
    agentId,
    actionType: "report_fraud",
    userId,
    details: { fraudType: fraud.fraudType, district: fraud.district },
  });

  return result;
};
