import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";
import dayjs from "dayjs";
import { auth, firestore } from "../config/firebase.js";
import { redis } from "../config/redis.js";
import { env } from "../config/env.js";

const OTP_TTL_SECONDS = 300;

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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

const normalizePhone = (phone) => (phone || "").replace(/\D/g, "").slice(-10);

export const startOtpLogin = async (phone) => {
  const cleanPhone = phone?.trim();
  if (!cleanPhone) {
    throw createHttpError("Phone is required", 400);
  }

  const otpSessionId = uuidv4();
  const mockOtp = "123456";

  if (redis) {
    await redis.set(
      `otp:${otpSessionId}`,
      JSON.stringify({ phone: cleanPhone, mockOtp, createdAt: dayjs().toISOString() }),
      "EX",
      OTP_TTL_SECONDS
    );
  }

  return {
    otpSessionId,
    expiresIn: OTP_TTL_SECONDS,
    message:
      "OTP initiated. Use Firebase client SDK for real OTP verification. For local testing, OTP is 123456.",
  };
};

export const verifyOtpAndIssueJwt = async ({ otpSessionId, otp, firebaseIdToken }) => {
  let phoneNumber = null;

  if (firebaseIdToken) {
    const decoded = await auth.verifyIdToken(firebaseIdToken);
    phoneNumber = decoded.phone_number;
  } else if (redis && otpSessionId && otp) {
    const payload = await redis.get(`otp:${otpSessionId}`);
    if (!payload) {
      throw createHttpError("OTP session expired or invalid", 400);
    }
    const parsed = JSON.parse(payload);
    if (parsed.mockOtp !== otp) {
      throw createHttpError("Invalid OTP", 401);
    }
    phoneNumber = parsed.phone;
  } else if (otp === "123456") {
    // Local development fallback OTP for non-Firebase flows.
    phoneNumber = "+919999999999";
  }

  if (!phoneNumber) {
    throw createHttpError("Unable to verify OTP", 401);
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByPhoneNumber(phoneNumber);
  } catch {
    userRecord = await auth.createUser({ phoneNumber });
  }

  const userDocRef = firestore.collection("users").doc(userRecord.uid);
  const userSnap = await userDocRef.get();

  const baseUser = {
    uid: userRecord.uid,
    phone: phoneNumber,
    name: userSnap.data()?.name || "",
    state: userSnap.data()?.state || "",
    district: userSnap.data()?.district || "",
    language: userSnap.data()?.language || "hi",
    role: userSnap.data()?.role || "citizen",
    updatedAt: dayjs().toISOString(),
  };

  await userDocRef.set(baseUser, { merge: true });

  const accessToken = issueToken({
    uid: baseUser.uid,
    phone: baseUser.phone,
    role: baseUser.role,
  });

  return {
    token: accessToken,
    user: baseUser,
  };
};

export const getProfileFromToken = async (uid) => {
  const snapshot = await firestore.collection("users").doc(uid).get();
  if (!snapshot.exists) {
    throw createHttpError("User not found", 404);
  }
  return { uid: snapshot.id, ...snapshot.data() };
};

export const registerCompatibility = async (payload) => {
  const phone = (payload.phone || "").trim();
  const phoneNormalized = normalizePhone(phone);
  const email = (payload.email || "").trim().toLowerCase();
  const name = (payload.fullName || "").trim();
  const password = payload.password || "";

  if (!phone || !name || !password) {
    throw createHttpError("Full name, phone and password are required", 400);
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByPhoneNumber(phone);
  } catch {
    userRecord = await auth.createUser({ phoneNumber: phone, displayName: name });
  }

  const userPayload = {
    uid: userRecord.uid,
    phone,
    phoneNormalized,
    email,
    name,
    passwordHash: hashPassword(password),
    state: payload.state || "",
    district: payload.district || "",
    language: payload.languagePreference || "hi",
    role: "citizen",
    updatedAt: dayjs().toISOString(),
  };

  await firestore.collection("users").doc(userRecord.uid).set(userPayload, { merge: true });
  await firestore.collection("family_profiles").doc(userRecord.uid).set(
    {
      userId: userRecord.uid,
      name,
      age: payload.age || null,
      gender: payload.gender || "",
      state: payload.state || "",
      district: payload.district || "",
      village: payload.village || "",
      occupation: payload.occupation || "",
      incomeRange: payload.incomeRange || "",
      familySize: payload.familySize || null,
      landOwnership: payload.landOwnership || "",
      houseType: payload.houseType || "",
      casteCategory: payload.casteCategory || "",
      bankAccountStatus: payload.bankAccountStatus || "",
      rationCardType: payload.rationCardType || "",
      languagePreference: payload.languagePreference || "hi",
      updatedAt: dayjs().toISOString(),
    },
    { merge: true }
  );

  return {
    message: "Registration successful. Please login with your credentials.",
    uid: userRecord.uid,
  };
};

export const loginCompatibility = async (payload) => {
  const identifier = (payload.identifier || "").trim();
  const password = payload.password || "";

  if (!identifier || !password) {
    throw createHttpError("Identifier and password are required", 400);
  }

  let userRecord = null;
  if (identifier.includes("@")) {
    const email = identifier.toLowerCase();
    const byEmail = await firestore.collection("users").where("email", "==", email).limit(1).get();
    if (!byEmail.empty) {
      userRecord = { uid: byEmail.docs[0].id, ...byEmail.docs[0].data() };
    }
  } else {
    const identifierNormalized = normalizePhone(identifier);
    const byPhone = await firestore.collection("users").where("phone", "==", identifier).limit(1).get();
    if (!byPhone.empty) {
      userRecord = { uid: byPhone.docs[0].id, ...byPhone.docs[0].data() };
    } else {
      const byPhoneNormalized = await firestore
        .collection("users")
        .where("phoneNormalized", "==", identifierNormalized)
        .limit(1)
        .get();
      if (!byPhoneNormalized.empty) {
        userRecord = { uid: byPhoneNormalized.docs[0].id, ...byPhoneNormalized.docs[0].data() };
      }
    }
  }

  if (!userRecord) {
    throw createHttpError("User not found. Please register first.", 404);
  }

  const isValidPassword = verifyPassword(password, userRecord.passwordHash);
  if (!isValidPassword) {
    throw createHttpError("Invalid password.", 401);
  }

  const accessToken = issueToken({
    uid: userRecord.uid,
    phone: userRecord.phone || identifier,
    role: userRecord.role || "citizen",
  });

  const user = {
    uid: userRecord.uid,
    phone: userRecord.phone || identifier,
    fullName: userRecord.name || "User",
    role: userRecord.role || "citizen",
  };

  return { token: accessToken, user };
};
