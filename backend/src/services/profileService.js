import dayjs from "dayjs";
import { firestore } from "../config/firebase.js";

const familyCollection = firestore.collection("family_profiles");

export const createProfile = async (uid, payload) => {
  const data = {
    userId: uid,
    ...payload,
    updatedAt: dayjs().toISOString(),
  };
  await familyCollection.doc(uid).set(data, { merge: true });
  return data;
};

export const getProfile = async (uid) => {
  const snapshot = await familyCollection.doc(uid).get();
  if (!snapshot.exists) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }
  return { id: snapshot.id, ...snapshot.data() };
};

export const updateProfile = async (uid, updates) => {
  const docRef = familyCollection.doc(uid);
  await docRef.set({ ...updates, updatedAt: dayjs().toISOString() }, { merge: true });
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

export const getDashboardSummary = async (uid) => {
  const [profileSnap, scoreSnap, savingsSnap, entitlementSnap] = await Promise.all([
    familyCollection.doc(uid).get(),
    firestore.collection("graam_scores").where("userId", "==", uid).limit(1).get(),
    firestore.collection("savings_goals").where("userId", "==", uid).get(),
    firestore.collection("haqdar_entitlements").where("userId", "==", uid).get(),
  ]);

  return {
    profileComplete: profileSnap.exists,
    graamScore: scoreSnap.docs[0]?.data()?.score || null,
    activeSavingsGoals: savingsSnap.size,
    enrolledSchemes: entitlementSnap.docs.filter((doc) => doc.data().enrolledStatus).length,
    verificationScore: profileSnap.data()?.verificationScore ?? null,
    fraudRisk: profileSnap.data()?.fraudRisk ?? null,
  };
};
