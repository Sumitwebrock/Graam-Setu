import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "../../config/firebase.js";

const agentsCollection = firestore.collection("agents");
const agentActivityCollection = firestore.collection("agent_activity");
const usersCollection = firestore.collection("users");
const familyProfilesCollection = firestore.collection("family_profiles");

export const createAgent = async (payload) => {
  const agentId = uuidv4();
  const now = dayjs().toISOString();

  const agent = {
    agent_id: agentId,
    name: payload.name,
    phone_number: payload.phone_number,
    location: payload.location || "",
    assigned_village: payload.assigned_village || "",
    bank_partner: payload.bank_partner || "",
    passwordHash: payload.passwordHash,
    created_at: now,
    updated_at: now,
  };

  await agentsCollection.doc(agentId).set(agent);
  return agent;
};

export const findAgentByPhone = async (phoneNumber) => {
  const snapshot = await agentsCollection.where("phone_number", "==", phoneNumber).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const getAgentById = async (agentId) => {
  const doc = await agentsCollection.doc(agentId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

export const logAgentActivity = async ({ agentId, actionType, userId, details }) => {
  const activity = {
    id: uuidv4(),
    agent_id: agentId,
    action_type: actionType,
    user_id: userId || null,
    timestamp: dayjs().toISOString(),
    details: details || {},
  };

  await agentActivityCollection.doc(activity.id).set(activity);
  return activity;
};

export const getAgentStats = async (agentId) => {
  const snapshot = await agentActivityCollection.where("agent_id", "==", agentId).get();
  if (snapshot.empty) {
    return {
      totalUsersAssisted: 0,
      schemesApplied: 0,
      savingsAssists: 0,
      fraudReportsSubmitted: 0,
    };
  }

  const userIds = new Set();
  let schemesApplied = 0;
  let savingsAssists = 0;
  let fraudReportsSubmitted = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.user_id) {
      userIds.add(data.user_id);
    }
    if (data.action_type === "assist_scheme") schemesApplied += 1;
    if (data.action_type === "assist_savings") savingsAssists += 1;
    if (data.action_type === "report_fraud") fraudReportsSubmitted += 1;
  });

  return {
    totalUsersAssisted: userIds.size,
    schemesApplied,
    savingsAssists,
    fraudReportsSubmitted,
  };
};

export const searchUsers = async ({ phone, name, village }) => {
  if (phone) {
    const snapshot = await usersCollection.where("phone", "==", phone).limit(10).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  if (name) {
    const snapshot = await usersCollection.where("name", "==", name).limit(20).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  if (village) {
    const fpSnap = await familyProfilesCollection.where("village", "==", village).limit(25).get();
    if (fpSnap.empty) return [];
    const userIds = fpSnap.docs.map((doc) => doc.id);
    const results = [];
    // Firestore getAll is not available in the lite mock; fetch sequentially.
    for (const uid of userIds) {
      const userDoc = await usersCollection.doc(uid).get();
      if (userDoc.exists) {
        results.push({ id: userDoc.id, ...userDoc.data() });
      }
    }
    return results;
  }

  return [];
};

export const getUserWithProfile = async (userId) => {
  const userDoc = await usersCollection.doc(userId).get();
  if (!userDoc.exists) return null;
  const user = { id: userDoc.id, ...userDoc.data() };

  const profileDoc = await familyProfilesCollection.doc(userId).get();
  const profile = profileDoc.exists ? profileDoc.data() : null;

  return { user, profile };
};
