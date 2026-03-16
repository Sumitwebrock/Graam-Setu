import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "../../config/firebase.js";
import { env } from "../../config/env.js";
import twilio from "twilio";

const OTP_EXPIRY_MINUTES = 5;

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

const sendWhatsappOtp = async (phone, otp) => {
  if (!twilioClient) {
    console.warn("[Verify] Twilio not configured. OTP:", otp);
    return;
  }

  const to = getWhatsappTo(phone);
  if (!to) {
    console.warn("[Verify] Invalid phone for OTP WhatsApp:", phone);
    return;
  }

  try {
    const message = await twilioClient.messages.create({
      from: env.TWILIO_WHATSAPP_FROM,
      to,
      body: `Aapka GraamSetu verification OTP hai: ${otp}. Yeh 5 minute ke liye valid hai. Isse kisi ke saath share mat kijiye.`,
    });
    console.log("[Verify] OTP WhatsApp sent, SID:", message.sid);
  } catch (error) {
    console.error("[Verify] Failed to send OTP via WhatsApp", {
      message: error?.message || String(error),
      code: error?.code,
      status: error?.status,
    });
  }
};

export const sendOtpController = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    const rawPhone = (req.body.phone || req.user?.phone || "").trim();
    if (!uid || !rawPhone) {
      return res.status(400).json({ message: "User and phone are required" });
    }

    const phoneNormalized = normalizePhone(rawPhone);

    // Prevent duplicate phone numbers mapped to different users.
    const existing = await firestore
      .collection("users")
      .where("phoneNormalized", "==", phoneNormalized)
      .get();

    const conflict = existing.docs.find((doc) => doc.id !== uid);
    if (conflict) {
      return res.status(409).json({ message: "Phone number already used by another user" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const now = dayjs();
    const expiresAt = now.add(OTP_EXPIRY_MINUTES, "minute").toISOString();

    // Persist OTP for this user.
    const otpDocId = uid;
    await firestore.collection("verification_otps").doc(otpDocId).set({
      userId: uid,
      phone: rawPhone,
      phoneNormalized,
      otp,
      createdAt: now.toISOString(),
      expiresAt,
      sessionId: uuidv4(),
    });

    // Store verification fields on user record (non-breaking for schemaless Firestore).
    await firestore.collection("users").doc(uid).set(
      {
        phone,
        phoneNormalized,
        phoneVerified: false,
        otpCode: otp,
        otpExpiry: expiresAt,
        verificationStatus: "UNVERIFIED",
      },
      { merge: true }
    );

    await sendWhatsappOtp(rawPhone, otp);

    return res.status(200).json({
      message: "OTP sent successfully",
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyOtpController = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    const { otp } = req.body || {};
    if (!uid || !otp) {
      return res.status(400).json({ message: "User and OTP are required" });
    }

    const otpDoc = await firestore.collection("verification_otps").doc(uid).get();
    const otpData = otpDoc.exists ? otpDoc.data() : null;

    if (!otpData || !otpData.otp || !otpData.expiresAt) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    const now = dayjs();
    if (now.isAfter(dayjs(otpData.expiresAt))) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(otpData.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await firestore.collection("users").doc(uid).set(
      {
        phoneVerified: true,
        verificationStatus: "UNVERIFIED",
        otpCode: null,
        otpExpiry: null,
      },
      { merge: true }
    );

    return res.status(200).json({ message: "Phone verified successfully" });
  } catch (error) {
    return next(error);
  }
};
