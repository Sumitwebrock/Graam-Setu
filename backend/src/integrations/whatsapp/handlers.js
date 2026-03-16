import axios from "axios";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { getUserByPhone } from "../../services/userLookupService.js";
import {
  formatBachatResponse,
  formatFraudIntro,
  formatGenericError,
  formatHaqdarResponse,
  formatMissingUser,
  formatVidhiOptions,
} from "./formatter.js";

const API_BASE_URL = env.API_BASE_URL || `http://localhost:${env.PORT || 4000}/api`;

async function resolveUserFromPhone(phoneNumber) {
  if (!phoneNumber) {
    return null;
  }

  // use dedicated service; implement it as a thin wrapper over your existing profile storage
  const user = await getUserByPhone(phoneNumber);
  return user || null;
}

function createInternalJwtForUser(user) {
  // Issue a short-lived token that mirrors what the auth middleware expects.
  // We avoid touching existing auth logic and only reuse the same secret.
  const payload = {
    uid: user.id,
    role: user.role || "user",
  };

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "10m" });
}

export async function handleHaqdarCommand(phoneNumber) {
  const user = await resolveUserFromPhone(phoneNumber);
  if (!user) {
    return formatMissingUser(phoneNumber);
  }

  try {
    const url = `${API_BASE_URL}/schemes/eligible/${user.id}`;
    const token = createInternalJwtForUser(user);
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-internal-whatsapp": "1",
      },
    });
    const schemes = Array.isArray(data?.schemes) ? data.schemes : data;
    return formatHaqdarResponse(schemes);
  } catch (error) {
    console.error("[WhatsApp][HAQDAR] API error", error?.message);
    return formatGenericError();
  }
}

export async function handleBachatCommand(phoneNumber) {
  const user = await resolveUserFromPhone(phoneNumber);
  if (!user) {
    return formatMissingUser(phoneNumber);
  }

  try {
    const url = `${API_BASE_URL}/savings/goals/${user.id}`;
    const token = createInternalJwtForUser(user);
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-internal-whatsapp": "1",
      },
    });
    const goals = Array.isArray(data?.goals) ? data.goals : data;
    return formatBachatResponse(goals);
  } catch (error) {
    console.error("[WhatsApp][BACHAT] API error", error?.message);
    return formatGenericError();
  }
}

export async function handleVidhiCommand(_phoneNumber) {
  // For now we just return static options and direct user to the app.
  return formatVidhiOptions();
}

export async function handleFraudCommand(_phoneNumber) {
  // If you decide later, you can start a multi-step conversation and
  // pipe messages into your existing fraud reporting endpoint.
  return formatFraudIntro();
}
