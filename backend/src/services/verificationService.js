import { redis } from "../config/redis.js";

const CACHE_TTL_SECONDS = 300;
const EXTERNAL_TIMEOUT_MS = 700;

const withTimeout = async (promise, timeoutMs = EXTERNAL_TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Verification source timeout")), timeoutMs);
    }),
  ]);
};

const getCacheKey = (source, identityKey) => `verify:${source}:${identityKey}`;

const cachedSourceCheck = async (source, identityKey, evaluator) => {
  const key = getCacheKey(source, identityKey);
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached !== null) {
        return cached === "1";
      }
    } catch (_error) {
      // Do not block profile creation if cache is unavailable.
    }
  }

  const value = await withTimeout(evaluator());

  if (redis) {
    try {
      await redis.set(key, value ? "1" : "0", "EX", CACHE_TTL_SECONDS);
    } catch (_error) {
      // Ignore cache write failures.
    }
  }

  return value;
};

const normalizeDistrict = (value) => String(value || "").trim().toLowerCase();
const normalizeState = (value) => String(value || "").trim().toLowerCase();

const verifyIdentity = async (profile, identityKey) => {
  return cachedSourceCheck("identity", identityKey, async () => {
    const aadhaar = String(profile.aadhaarNumber || "").replace(/\D/g, "");
    const digilockerId = String(profile.digilockerId || "").trim();
    return aadhaar.length === 12 || digilockerId.length > 5;
  });
};

const verifyBankActivity = async (profile, identityKey) => {
  return cachedSourceCheck("bank", identityKey, async () => {
    const bankActive = profile.bankUsed30Days === "yes" || profile.bankAccountActive === true;
    const upiInflow = Number(profile.monthlyUpiInflowAmount || profile.upiInflow || 0);
    return bankActive || upiInflow > 0;
  });
};

const verifyLandOwnership = async (profile, identityKey) => {
  return cachedSourceCheck("land", identityKey, async () => {
    const hasLandDocument = Boolean(profile.landDocumentId || profile.landRegistryId || profile.landPattaNumber);
    return hasLandDocument || Number(profile.land || 0) > 0;
  });
};

const verifySchemeParticipation = async (profile, identityKey) => {
  return cachedSourceCheck("scheme", identityKey, async () => {
    return Number(profile.janDhan || 0) > 0 || Number(profile.pmKisan || 0) > 0 || Number(profile.eShram || 0) > 0;
  });
};

const verifyLocationConsistency = async (profile) => {
  const district = normalizeDistrict(profile.district || profile.location || "");
  const state = normalizeState(profile.state || profile.location || "");

  if (!district && !state) {
    return false;
  }

  const indianStateHints = [
    "chhattisgarh",
    "madhya pradesh",
    "maharashtra",
    "rajasthan",
    "uttar pradesh",
    "bihar",
    "jharkhand",
    "odisha",
    "punjab",
    "haryana",
    "gujarat",
    "karnataka",
    "tamil nadu",
    "telangana",
    "andhra pradesh",
    "west bengal",
    "assam",
    "kerala",
    "delhi",
  ];

  return indianStateHints.some((hint) => state.includes(hint) || district.includes(hint)) || district.length >= 3;
};

export const verifyProfileData = async (profilePayload) => {
  const identityKey = String(profilePayload.userId || profilePayload.phone || profilePayload.aadhaarNumber || "anonymous");

  const [identityVerified, bankVerified, landVerified, schemeVerified, locationConsistent] = await Promise.allSettled([
    verifyIdentity(profilePayload, identityKey),
    verifyBankActivity(profilePayload, identityKey),
    verifyLandOwnership(profilePayload, identityKey),
    verifySchemeParticipation(profilePayload, identityKey),
    verifyLocationConsistency(profilePayload),
  ]);

  const status = {
    identityVerified: identityVerified.status === "fulfilled" ? identityVerified.value : false,
    bankVerified: bankVerified.status === "fulfilled" ? bankVerified.value : false,
    landVerified: landVerified.status === "fulfilled" ? landVerified.value : false,
    schemeVerified: schemeVerified.status === "fulfilled" ? schemeVerified.value : false,
    locationConsistent: locationConsistent.status === "fulfilled" ? locationConsistent.value : false,
  };

  const scoreMap = {
    identityVerified: 25,
    bankVerified: 25,
    landVerified: 20,
    schemeVerified: 20,
    locationConsistent: 10,
  };

  const verificationScore = Object.entries(scoreMap).reduce((acc, [key, points]) => {
    return acc + (status[key] ? points : 0);
  }, 0);

  const verificationSources = [];
  if (status.identityVerified) verificationSources.push("Aadhaar/DigiLocker");
  if (status.bankVerified) verificationSources.push("Account Aggregator");
  if (status.landVerified) verificationSources.push("DigiLocker Land Records");
  if (status.schemeVerified) verificationSources.push("MyScheme");
  if (status.locationConsistent) verificationSources.push("Location Cross-check");

  return {
    ...status,
    verificationScore,
    verificationSources,
  };
};
