import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "../config/firebase.js";
import { getSavingsAdviceFromClaude, sendWhatsAppReminder } from "./integrationService.js";

const goalsCollection = firestore.collection("savings_goals");
const reminderCollection = firestore.collection("savings_preferences");

const calculateTargets = ({ targetAmount, savedAmount, targetDate }) => {
  const target = Number(targetAmount || 0);
  const saved = Number(savedAmount || 0);
  const remaining = Math.max(0, target - saved);
  const weeksLeft = Math.max(1, dayjs(targetDate).diff(dayjs(), "week") || 1);
  const weeklyTarget = Math.ceil(remaining / weeksLeft);
  const progressPercentage = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  return { weeklyTarget, progressPercentage };
};

export const createGoal = async (uid, payload) => {
  const savedAmount = Number(payload.savedAmount ?? payload.currentAmount ?? 0);
  const goalType = payload.goalType || payload.goalName || "Emergency Fund";
  const { weeklyTarget, progressPercentage } = calculateTargets({
    targetAmount: payload.targetAmount,
    savedAmount,
    targetDate: payload.targetDate,
  });

  const goal = {
    goalId: uuidv4(),
    userId: uid,
    goalName: payload.goalName,
    goalType,
    targetAmount: Number(payload.targetAmount || 0),
    savedAmount,
    currentAmount: savedAmount,
    targetDate: payload.targetDate,
    weeklyTarget,
    progressPercentage,
    createdAt: dayjs().toISOString(),
  };

  await goalsCollection.doc(goal.goalId).set(goal);

  if (payload.whatsAppReminder && payload.phone) {
    await sendWhatsAppReminder(payload.phone, `Weekly reminder for ${goal.goalName}`);
  }

  return goal;
};

export const getGoals = async (uid) => {
  const snapshot = await goalsCollection.where("userId", "==", uid).get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const savedAmount = Number(data.savedAmount ?? data.currentAmount ?? 0);
    const { weeklyTarget, progressPercentage } = calculateTargets({
      targetAmount: data.targetAmount,
      savedAmount,
      targetDate: data.targetDate,
    });

    return {
      id: doc.id,
      ...data,
      savedAmount,
      currentAmount: savedAmount,
      weeklyTarget: Number(data.weeklyTarget || weeklyTarget),
      progressPercentage: Number(data.progressPercentage ?? progressPercentage),
    };
  });
};

export const updateProgress = async (uid, payload) => {
  const docRef = goalsCollection.doc(payload.goalId);
  const snap = await docRef.get();
  if (!snap.exists || snap.data().userId !== uid) {
    throw new Error("Goal not found");
  }

  const nextSavedAmount = Number(payload.savedAmount ?? payload.currentAmount ?? 0);
  const merged = {
    ...snap.data(),
    savedAmount: nextSavedAmount,
    currentAmount: nextSavedAmount,
    updatedAt: dayjs().toISOString(),
  };
  const { weeklyTarget, progressPercentage } = calculateTargets(merged);

  const updated = {
    ...merged,
    weeklyTarget,
    progressPercentage,
  };

  await docRef.set(updated, { merge: true });
  return updated;
};

export const addSaving = async (uid, payload) => {
  const docRef = goalsCollection.doc(payload.goalId);
  const snap = await docRef.get();
  if (!snap.exists || snap.data().userId !== uid) {
    throw new Error("Goal not found");
  }

  const amountToAdd = Math.max(0, Number(payload.amount || 0));
  const existing = snap.data();
  const currentSaved = Number(existing.savedAmount ?? existing.currentAmount ?? 0);
  const updatedSaved = currentSaved + amountToAdd;

  const merged = {
    ...existing,
    savedAmount: updatedSaved,
    currentAmount: updatedSaved,
    updatedAt: dayjs().toISOString(),
  };
  const { weeklyTarget, progressPercentage } = calculateTargets(merged);

  const updated = {
    ...merged,
    weeklyTarget,
    progressPercentage,
  };

  await docRef.set(updated, { merge: true });
  return updated;
};

export const getProgress = async (uid, goalId) => {
  const docRef = goalsCollection.doc(goalId);
  const snap = await docRef.get();
  if (!snap.exists || snap.data().userId !== uid) {
    throw new Error("Goal not found");
  }

  const goal = snap.data();
  const savedAmount = Number(goal.savedAmount ?? goal.currentAmount ?? 0);
  const { weeklyTarget, progressPercentage } = calculateTargets({
    targetAmount: goal.targetAmount,
    savedAmount,
    targetDate: goal.targetDate,
  });

  return {
    goalId: goal.goalId,
    goalName: goal.goalName,
    goalType: goal.goalType,
    targetAmount: Number(goal.targetAmount || 0),
    savedAmount,
    weeklyTarget: Number(goal.weeklyTarget || weeklyTarget),
    progressPercentage,
    targetDate: goal.targetDate,
  };
};

export const getSavingsAdvice = async (uid, payload) => {
  const goals = await getGoals(uid);
  const weeklyNeed = goals.map((goal) => {
    const savedAmount = Number(goal.savedAmount ?? goal.currentAmount ?? 0);
    const remaining = Math.max(0, Number(goal.targetAmount) - savedAmount);
    const weeksLeft = Math.max(1, dayjs(goal.targetDate).diff(dayjs(), "week"));
    return {
      goalName: goal.goalName,
      weeklySavingsRequired: Math.ceil(remaining / weeksLeft),
    };
  });

  const aiAdvice = await getSavingsAdviceFromClaude({ uid, weeklyNeed, context: payload.context });
  return { weeklyNeed, aiAdvice };
};

export const getReminderPreference = async (uid) => {
  const snap = await reminderCollection.doc(uid).get();
  if (!snap.exists) {
    return {
      userId: uid,
      weeklyReminderEnabled: false,
      preferredChannel: "whatsapp",
      reminderDay: "Sunday",
      updatedAt: null,
    };
  }
  return { userId: uid, ...snap.data() };
};

export const setReminderPreference = async (uid, payload) => {
  const data = {
    userId: uid,
    weeklyReminderEnabled: Boolean(payload.weeklyReminderEnabled),
    preferredChannel: payload.preferredChannel || "whatsapp",
    reminderDay: payload.reminderDay || "Sunday",
    updatedAt: dayjs().toISOString(),
  };
  await reminderCollection.doc(uid).set(data, { merge: true });
  return data;
};
