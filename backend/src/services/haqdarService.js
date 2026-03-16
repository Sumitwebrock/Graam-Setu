import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "../config/firebase.js";
import { redis } from "../config/redis.js";
import {
  fetchMySchemes,
  fetchDbtPayments,
  fileCpgramsGrievance,
  verifyDigiLockerDocument,
} from "./integrationService.js";

const entitlementCollection = firestore.collection("haqdar_entitlements");
const schemeCollection = firestore.collection("scheme_database");

const DEFAULT_SCHEME_CATALOG = [
  {
    schemeId: "PM-KISAN",
    name: "PM-KISAN",
    nameHindi: "प्रधानमंत्री किसान सम्मान निधि",
    description: "Direct income support to farmers",
    amount: "₹6,000/year",
    applyUrl: "https://pmkisan.gov.in/",
    criteria: { occupation: ["farmer"], landOwned: true },
  },
  {
    schemeId: "WIDOW-PENSION",
    name: "Widow Pension Scheme",
    nameHindi: "विधवा पेंशन योजना",
    description: "Monthly pension for widows",
    amount: "₹1,000/month",
    applyUrl: "https://nsap.nic.in/",
    criteria: { maritalStatus: ["widow"], gender: ["female"] },
  },
  {
    schemeId: "PMUY",
    name: "Ujjwala Yojana",
    nameHindi: "उज्ज्वला योजना",
    description: "Free LPG connection support for low-income households",
    amount: "Free LPG connection",
    applyUrl: "https://www.pmuy.gov.in/",
    criteria: { gender: ["female"], maxIncome: 250000 },
  },
  {
    schemeId: "PMMVY",
    name: "Maternity Benefit",
    nameHindi: "मातृत्व लाभ योजना",
    description: "Cash assistance for pregnant women",
    amount: "₹6,000",
    applyUrl: "https://pmmvy.wcd.gov.in/",
    criteria: { gender: ["female"], minAge: 18, maxAge: 45 },
  },
  {
    schemeId: "PMJAY",
    name: "Ayushman Bharat",
    nameHindi: "आयुष्मान भारत",
    description: "Health insurance for eligible families",
    amount: "₹5 Lakh coverage",
    applyUrl: "https://pmjay.gov.in/",
    criteria: { rationCardType: ["bpl", "priority", "aay"] },
  },
  {
    schemeId: "APY",
    name: "Atal Pension Yojana",
    nameHindi: "अटल पेंशन योजना",
    description: "Pension scheme for workers",
    amount: "₹1,000-5,000/month",
    applyUrl: "https://www.npscra.nsdl.co.in/scheme-details.php",
    criteria: { minAge: 18, maxAge: 40, occupation: ["farmer", "vendor", "daily_wage", "labor"] },
  },
  {
    schemeId: "PMJDY",
    name: "Pradhan Mantri Jan Dhan Yojana",
    nameHindi: "प्रधानमंत्री जन धन योजना",
    description: "Basic zero-balance bank account and financial inclusion benefits",
    amount: "Zero-balance bank account",
    applyUrl: "https://pmjdy.gov.in/",
    criteria: {},
  },
  {
    schemeId: "PMSBY",
    name: "Pradhan Mantri Suraksha Bima Yojana",
    nameHindi: "प्रधानमंत्री सुरक्षा बीमा योजना",
    description: "Low-cost accidental insurance coverage",
    amount: "Insurance up to ₹2 lakh",
    applyUrl: "https://jansuraksha.gov.in/",
    criteria: {},
  },
  {
    schemeId: "MYSCHEME",
    name: "MyScheme Discovery Portal",
    nameHindi: "मायस्कीम योजना खोज पोर्टल",
    description: "Find additional central and state schemes relevant to your family",
    amount: "Multiple benefits",
    applyUrl: "https://www.myscheme.gov.in/",
    criteria: {},
  },
];

const normalizeString = (value) => String(value || "").trim().toLowerCase();

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = normalizeString(value);
  return ["true", "yes", "1", "y"].includes(normalized);
};

const parseIncomeValue = (value) => {
  if (value == null) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }

  const normalized = normalizeString(value)
    .replace(/,/g, "")
    .replace(/rs\.?/g, "")
    .replace(/inr/g, "")
    .replace(/per\s*month/g, "")
    .replace(/\s+/g, " ");

  const lakhMatch = normalized.match(/(\d+(?:\.\d+)?)\s*l/);
  if (lakhMatch) {
    return Math.round(Number(lakhMatch[1]) * 100000);
  }

  const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*[-to]+\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    return Math.round((Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2);
  }

  const firstNumber = normalized.match(/\d+(?:\.\d+)?/);
  return firstNumber ? Number(firstNumber[0]) : null;
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null || value === "") {
    return [];
  }
  return [value];
};

const getSchemeCriteria = (scheme) => {
  if (scheme.criteria && typeof scheme.criteria === "object") {
    return scheme.criteria;
  }

  const inferred = {};
  const name = normalizeString(scheme.name || scheme.schemeName);

  if (scheme.gender) {
    inferred.gender = toArray(scheme.gender);
  }
  if (scheme.occupation) {
    inferred.occupation = toArray(scheme.occupation);
  }
  if (scheme.casteCategory) {
    inferred.casteCategory = toArray(scheme.casteCategory);
  }
  if (scheme.rationCardType) {
    inferred.rationCardType = toArray(scheme.rationCardType);
  }
  if (scheme.maritalStatus) {
    inferred.maritalStatus = toArray(scheme.maritalStatus);
  }
  if (scheme.state || scheme.states) {
    inferred.state = toArray(scheme.state || scheme.states);
  }
  if (scheme.district || scheme.districts) {
    inferred.district = toArray(scheme.district || scheme.districts);
  }
  if (scheme.minAge != null) {
    inferred.minAge = Number(scheme.minAge);
  }
  if (scheme.maxAge != null) {
    inferred.maxAge = Number(scheme.maxAge);
  }
  if (scheme.maxIncome != null) {
    inferred.maxIncome = Number(scheme.maxIncome);
  }
  if (scheme.landOwned != null) {
    inferred.landOwned = scheme.landOwned;
  }

  if (!inferred.gender && /widow pension|widow/i.test(name)) {
    inferred.gender = ["female"];
    inferred.maritalStatus = ["widow"];
  }

  if (!inferred.landOwned && /pm-kisan|kisan/i.test(name)) {
    inferred.landOwned = true;
    inferred.occupation = inferred.occupation || ["farmer"];
  }

  if (!inferred.gender && /women|mahila|maternity|matritva|maternity benefit/i.test(name)) {
    inferred.gender = ["female"];
  }

  return inferred;
};

const evaluateCriterion = (profile, key, expectedValue) => {
  const expected = toArray(expectedValue).map(normalizeString).filter(Boolean);
  const profileValue = profile?.[key];

  if (key === "minAge") {
    const age = Number(profile.age || 0);
    return age >= Number(expectedValue || 0);
  }
  if (key === "maxAge") {
    const age = Number(profile.age || 0);
    return age > 0 && age <= Number(expectedValue || 0);
  }
  if (key === "maxIncome") {
    const income = parseIncomeValue(profile.incomeRange);
    return income != null && income <= Number(expectedValue || 0);
  }
  if (key === "landOwned") {
    return normalizeBoolean(profileValue) === normalizeBoolean(expectedValue);
  }

  if (expected.length === 0) {
    return true;
  }

  return expected.includes(normalizeString(profileValue));
};

const isClearlyIrrelevant = (scheme, profile, criteria) => {
  const name = normalizeString(scheme.name || scheme.schemeName);
  const gender = normalizeString(profile.gender);
  const maritalStatus = normalizeString(profile.maritalStatus);

  if (criteria.gender && criteria.gender.map(normalizeString).includes("female") && gender && gender !== "female") {
    return true;
  }

  if (/widow pension|widow/i.test(name)) {
    return gender !== "female" || maritalStatus !== "widow";
  }

  return false;
};

const mapSchemeForUi = (scheme, category, matchedCount, totalCriteria) => ({
  schemeId: scheme.schemeId || scheme.id || uuidv4(),
  name: scheme.name || scheme.schemeName || "Scheme",
  nameHindi: scheme.nameHindi || "",
  description: scheme.description || scheme.eligibility || "Government benefit scheme",
  amount: scheme.amount || scheme.benefit || "As per scheme rules",
  applyUrl: scheme.applyUrl || scheme.website || scheme.url || "https://www.myscheme.gov.in/",
  category,
  matchedCriteria: matchedCount,
  totalCriteria,
  matchScore: totalCriteria === 0 ? 100 : Math.round((matchedCount / totalCriteria) * 100),
});

const filterEligibleSchemes = (userProfile, schemeDatabase) => {
  const eligibleSchemes = [];
  const partiallyEligibleSchemes = [];
  const notEligibleSchemes = [];

  for (const scheme of schemeDatabase) {
    const criteria = getSchemeCriteria(scheme);
    const criteriaEntries = Object.entries(criteria).filter(([_, value]) => value != null && value !== "");

    if (isClearlyIrrelevant(scheme, userProfile, criteria)) {
      continue;
    }

    if (criteriaEntries.length === 0) {
      eligibleSchemes.push(mapSchemeForUi(scheme, "eligible", 0, 0));
      continue;
    }

    let matched = 0;
    for (const [key, value] of criteriaEntries) {
      if (evaluateCriterion(userProfile, key, value)) {
        matched += 1;
      }
    }

    if (matched === criteriaEntries.length) {
      eligibleSchemes.push(mapSchemeForUi(scheme, "eligible", matched, criteriaEntries.length));
    } else if (matched > 0) {
      partiallyEligibleSchemes.push(mapSchemeForUi(scheme, "partially_eligible", matched, criteriaEntries.length));
    } else {
      notEligibleSchemes.push(mapSchemeForUi(scheme, "not_eligible", matched, criteriaEntries.length));
    }
  }

  return {
    eligibleSchemes,
    partiallyEligibleSchemes,
    notEligibleSchemes,
  };
};

const loadProfileAndSchemes = async (uid) => {
  const [profileSnap, userSnap, localSchemes, remoteSchemes] = await Promise.all([
    firestore.collection("family_profiles").doc(uid).get(),
    firestore.collection("users").doc(uid).get(),
    schemeCollection.get(),
    fetchMySchemes(),
  ]);

  const profile = { ...(userSnap.data() || {}), ...(profileSnap.data() || {}) };
  const local = localSchemes.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const sourceSchemes = local.length > 0 ? [...local, ...remoteSchemes] : [...DEFAULT_SCHEME_CATALOG, ...remoteSchemes];
  const dedup = Object.values(
    sourceSchemes.reduce((acc, item) => {
      const key = item.schemeId || item.id || uuidv4();
      acc[key] = { schemeId: key, ...item };
      return acc;
    }, {})
  );

  return { profile, dedupSchemes: dedup };
};

export const getEligibleSchemes = async (uid) => {
  const cached = redis ? await redis.get(`eligible:${uid}`) : null;
  if (cached) {
    return JSON.parse(cached);
  }

  const { profile, dedupSchemes } = await loadProfileAndSchemes(uid);
  const categorized = filterEligibleSchemes(profile, dedupSchemes);
  const eligibleSchemes = categorized.eligibleSchemes;

  if (redis) {
    await redis.set(`eligible:${uid}`, JSON.stringify(eligibleSchemes), "EX", 3600);
  }

  return eligibleSchemes;
};

export const getSchemesForUser = async (uid) => {
  const { profile, dedupSchemes } = await loadProfileAndSchemes(uid);
  const categorized = filterEligibleSchemes(profile, dedupSchemes);

  return {
    userProfile: {
      userId: uid,
      gender: profile.gender || null,
      age: profile.age || null,
      occupation: profile.occupation || null,
      incomeRange: profile.incomeRange || null,
      casteCategory: profile.casteCategory || null,
      landOwned: profile.landOwned ?? null,
      state: profile.state || null,
      district: profile.district || null,
      maritalStatus: profile.maritalStatus || null,
      rationCardType: profile.rationCardType || null,
    },
    ...categorized,
  };
};

export const getEnrolledSchemes = async (uid) => {
  const snapshot = await entitlementCollection.where("userId", "==", uid).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const applyForScheme = async (uid, payload) => {
  if (payload.digiLockerDocRef) {
    await verifyDigiLockerDocument(payload.digiLockerDocRef);
  }

  const entry = {
    userId: uid,
    schemeId: payload.schemeId,
    enrolledStatus: true,
    lastPayment: null,
    nextExpected: null,
    appliedAt: dayjs().toISOString(),
    documents: payload.documents || [],
  };
  const docRef = entitlementCollection.doc(uuidv4());
  await docRef.set(entry);
  return { id: docRef.id, ...entry };
};

export const fileGrievance = async (uid, payload) => {
  const grievance = await fileCpgramsGrievance({
    userId: uid,
    description: payload.description,
    category: payload.category,
  });
  return grievance;
};

export const getPaymentHistory = async (uid) => {
  const enrolled = await getEnrolledSchemes(uid);
  const payments = await fetchDbtPayments(uid);

  return enrolled.map((item) => {
    const payment = payments.find((p) => p.schemeId === item.schemeId);
    return {
      schemeId: item.schemeId,
      lastPayment: payment?.lastPayment || item.lastPayment,
      nextExpected: payment?.nextExpected || item.nextExpected,
      status: payment?.status || "Pending",
    };
  });
};

const DEFAULT_TRACKING_STEPS = [
  "Submitted",
  "KYC Verified",
  "Document Verification",
  "District Approval",
  "Payment Scheduled",
];

const pickCurrentStage = (appliedAt) => {
  if (!appliedAt) {
    return DEFAULT_TRACKING_STEPS[2];
  }

  const elapsedDays = Math.max(dayjs().diff(dayjs(appliedAt), "day"), 0);
  const stageIndex = Math.min(Math.floor(elapsedDays / 3), DEFAULT_TRACKING_STEPS.length - 1);
  return DEFAULT_TRACKING_STEPS[stageIndex];
};

export const getApplicationStatus = async (uid, { schemeId, schemeName }) => {
  const enrolled = await getEnrolledSchemes(uid);
  const normalizedName = String(schemeName || "").toLowerCase().trim();

  let application = null;
  if (schemeId) {
    application = enrolled.find((item) => item.schemeId === schemeId) || null;
  }

  if (!application && normalizedName) {
    application =
      enrolled.find((item) => String(item.schemeName || item.schemeId || "").toLowerCase().trim() === normalizedName) || null;
  }

  const now = dayjs();
  const createdAt = application?.appliedAt || now.subtract(5, "day").toISOString();
  const currentStage = pickCurrentStage(createdAt);
  const status = application ? "In Progress" : "Estimated";

  return {
    schemeId: schemeId || application?.schemeId || "unknown-scheme",
    schemeName: schemeName || application?.schemeName || application?.schemeId || "Scheme",
    referenceId: application?.id ? `APP-${application.id.slice(0, 8).toUpperCase()}` : `EST-${uid.slice(0, 6).toUpperCase()}-${now.format("DDMM")}`,
    submittedOn: dayjs(createdAt).format("DD MMM YYYY"),
    expectedDecision: dayjs(createdAt).add(15, "day").format("DD MMM YYYY"),
    currentStage,
    steps: DEFAULT_TRACKING_STEPS,
    status,
    source: application ? "enrollment-record" : "estimated-from-user-profile",
  };
};
