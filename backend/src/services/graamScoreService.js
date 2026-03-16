import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "../config/firebase.js";
import { createScoreReportPdf } from "../utils/pdf.js";

const scoreCollection = firestore.collection("graam_scores");

const clamp = (value, max) => Math.max(0, Math.min(Number(value || 0), max));

const buildTier = (score) => {
  if (score >= 75) return "Prime";
  if (score >= 50) return "Standard";
  if (score >= 25) return "Developing";
  return "Building";
};

const buildLoanEligibility = (score) => {
  if (score >= 75) return ["Kisan Credit Card", "Low-interest SHG top-up"]; 
  if (score >= 50) return ["Micro enterprise loan", "Livestock finance"];
  if (score >= 25) return ["Guided credit builder program"];
  return ["Savings-first and subsidy-linked credit coaching"];
};

const resolveVerificationLevel = (verificationScore) => {
  const value = Number(verificationScore || 0);
  if (value >= 80) return "High";
  if (value >= 50) return "Medium";
  return "Low";
};

export const calculateScore = async (uid, payload) => {
  const profileSnap = await firestore.collection("family_profiles").doc(uid).get();
  const profile = profileSnap.exists ? profileSnap.data() : {};

  const verificationMeta = {
    verificationScore: Number(profile.verificationScore || 0),
    fraudRisk: profile.fraudRisk || "LOW",
    identityVerified: Boolean(profile.identityVerified),
    bankVerified: Boolean(profile.bankVerified),
    landVerified: Boolean(profile.landVerified),
    schemeVerified: Boolean(profile.schemeVerified),
    verificationSources: Array.isArray(profile.verificationSources) ? profile.verificationSources : [],
  };

  const weightedAssetBase = verificationMeta.landVerified
    ? clamp(payload.assetBase, 20)
    : Math.round(clamp(payload.assetBase, 20) * 0.4);

  const weightedUpiBehaviour = verificationMeta.bankVerified
    ? clamp(payload.upiBehaviour, 25)
    : Math.round(clamp(payload.upiBehaviour, 25) * 0.6);

  const weightedGovtSchemes = verificationMeta.schemeVerified
    ? clamp(payload.govtSchemeParticipation, 15)
    : Math.round(clamp(payload.govtSchemeParticipation, 15) * 0.6);

  const identityMultiplier = verificationMeta.identityVerified ? 1 : 0.85;

  const breakdown = {
    upiBehaviour: weightedUpiBehaviour,
    billPaymentDiscipline: clamp(payload.billPaymentDiscipline, 20),
    shgMembership: clamp(payload.shgMembership, 20),
    assetBase: weightedAssetBase,
    govtSchemeParticipation: weightedGovtSchemes,
  };

  const weightedTotal = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const score = Math.round(weightedTotal * identityMultiplier);
  const tier = buildTier(score);
  const loanEligibility = buildLoanEligibility(score);
  const verificationLevel = resolveVerificationLevel(verificationMeta.verificationScore);

  const reportId = uuidv4();
  const reportPdfUrl = await createScoreReportPdf({ userId: uid, score, tier, breakdown });

  const record = {
    reportId,
    userId: uid,
    score,
    tier,
    breakdown,
    loanEligibility,
    reportPdfUrl,
    verificationLevel,
    verificationScore: verificationMeta.verificationScore,
    verificationSources: verificationMeta.verificationSources,
    fraudRisk: verificationMeta.fraudRisk,
    identityVerified: verificationMeta.identityVerified,
    bankVerified: verificationMeta.bankVerified,
    landVerified: verificationMeta.landVerified,
    schemeVerified: verificationMeta.schemeVerified,
    createdAt: dayjs().toISOString(),
  };

  await scoreCollection.doc(reportId).set(record);
  return record;
};

export const getLatestScore = async (uid) => {
  const snapshot = await scoreCollection
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error("Score not found");
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const getScoreHistory = async (uid) => {
  const snapshot = await scoreCollection.where("userId", "==", uid).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getScoreReport = async (reportId) => {
  const snapshot = await scoreCollection.doc(reportId).get();
  if (!snapshot.exists) {
    throw new Error("Report not found");
  }
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    verificationLevel: data.verificationLevel || resolveVerificationLevel(data.verificationScore),
    fraudRisk: data.fraudRisk || "LOW",
    verificationSources: Array.isArray(data.verificationSources) ? data.verificationSources : [],
  };
};

export const getVerificationReport = async (reportId) => {
  const report = await getScoreReport(reportId);
  return {
    score: report.score,
    tier: report.tier,
    verificationLevel: Number(report.verificationScore || 0),
    fraudRisk: report.fraudRisk || "LOW",
  };
};
