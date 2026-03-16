import dayjs from "dayjs";
import twilio from "twilio";
import { firestore } from "../../config/firebase.js";
import { env } from "../../config/env.js";

const hasTwilioConfig = Boolean(
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM
);

const twilioClient = hasTwilioConfig
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

const normalizePhone = (phone) => (phone || "").replace(/\D/g, "").slice(-10);

const getWhatsappTo = (phone) => {
  const digits = normalizePhone(phone);
  if (!/^\d{10}$/.test(digits)) return null;
  return `whatsapp:+91${digits}`;
};

const sendVerificationStatusWhatsapp = async (phone, status) => {
  if (!twilioClient) {
    console.warn("[Verify] Twilio not configured for status change, status=", status);
    return;
  }

  const to = getWhatsappTo(phone);
  if (!to) {
    console.warn("[Verify] Invalid phone for status WhatsApp:", phone);
    return;
  }

  let body;
  if (status === "VERIFIED") {
    body =
      "Aapka GraamSetu account verify ho gaya hai. Ab BC agents aur sarkari authorities aapke data ko trusted maan sakte hain.";
  } else if (status === "REJECTED") {
    body =
      "Aapki GraamSetu verification request reject ho gayi hai. Kripya apne documents update karke dobara apply kijiye.";
  } else {
    body = `Aapke GraamSetu account ka verification status: ${status}`;
  }

  try {
    const message = await twilioClient.messages.create({
      from: env.TWILIO_WHATSAPP_FROM,
      to,
      body,
    });
    console.log("[Verify] Status WhatsApp sent, SID:", message.sid, "status=", status);
  } catch (error) {
    console.error("[Verify] Failed to send status via WhatsApp", {
      message: error?.message || String(error),
      code: error?.code,
      status: error?.status,
    });
  }
};

export const getPendingVerificationsController = async (_req, res, next) => {
  try {
    const snapshot = await firestore
      .collection("users")
      .where("verificationStatus", "==", "PENDING_AGENT_REVIEW")
      .get();

    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

export const getUserVerificationDetailController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const userSnap = await firestore.collection("users").doc(userId).get();
    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileSnap = await firestore.collection("family_profiles").doc(userId).get();
    const docsSnap = await firestore
      .collection("verification_documents")
      .where("userId", "==", userId)
      .get();

    const user = { id: userSnap.id, ...userSnap.data() };
    const profile = profileSnap.exists ? { id: profileSnap.id, ...profileSnap.data() } : null;
    const documents = docsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.status(200).json({ user, profile, documents });
  } catch (error) {
    return next(error);
  }
};

const updateUserVerificationStatus = async (agentId, userId, status, reason) => {
  const updates = {
    verificationStatus: status,
    verificationReviewedAt: dayjs().toISOString(),
    verificationReviewedBy: agentId,
  };

  if (reason) {
    updates.verificationReviewNote = reason;
  }

  await firestore.collection("users").doc(userId).set(updates, { merge: true });

  const userSnap = await firestore.collection("users").doc(userId).get();
  const user = userSnap.exists ? userSnap.data() : null;
  if (user?.phone) {
    await sendVerificationStatusWhatsapp(user.phone, status);
  }

  // Simple fraud flag: mark rejected users as risky.
  if (status === "REJECTED") {
    await firestore.collection("users").doc(userId).set({ riskFlag: true }, { merge: true });
  }

  return { userId, status, reason: reason || null };
};

export const verifyUserController = async (req, res, next) => {
  try {
    const agentId = req.user?.uid;
    const { userId } = req.body || {};
    if (!agentId || !userId) {
      return res.status(400).json({ message: "agent and userId are required" });
    }

    const result = await updateUserVerificationStatus(agentId, userId, "VERIFIED");
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const rejectUserController = async (req, res, next) => {
  try {
    const agentId = req.user?.uid;
    const { userId, reason } = req.body || {};
    if (!agentId || !userId) {
      return res.status(400).json({ message: "agent and userId are required" });
    }

    const result = await updateUserVerificationStatus(agentId, userId, "REJECTED", reason);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
