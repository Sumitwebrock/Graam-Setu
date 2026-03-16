import { verifyProfileData } from "../services/verificationService.js";
import { detectFraudRisk } from "../services/fraudService.js";

const LAYER_TIMEOUT_MS = 2200;

const withTimeout = async (promise, timeoutMs = LAYER_TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Verification layer timeout")), timeoutMs)),
  ]);
};

export const attachVerificationLayer = async (req, _res, next) => {
  try {
    const profilePayload = { ...req.body, userId: req.user?.uid };
    const verification = await withTimeout(verifyProfileData(profilePayload));
    const fraud = await withTimeout(detectFraudRisk(profilePayload, verification));

    req.verificationMeta = {
      ...verification,
      ...fraud,
      verificationLevel: verification.verificationScore,
    };
    return next();
  } catch (error) {
    req.verificationMeta = {
      identityVerified: false,
      bankVerified: false,
      landVerified: false,
      schemeVerified: false,
      locationConsistent: false,
      verificationScore: 0,
      verificationLevel: 0,
      verificationSources: [],
      fraudRisk: "LOW",
      fraudFlags: ["Verification temporarily unavailable"],
    };
    return next();
  }
};
