// Simple user lookup service used by WhatsApp integration.
// This is intentionally isolated so that the core APIs remain unchanged.

import { firestore } from "../config/firebase.js";

// Adjust collection name/fields if your profile model differs.
export async function getUserByPhone(phoneNumber) {
  if (!phoneNumber) return null;

  const snapshot = await firestore
    .collection("users")
    .where("phone", "==", phoneNumber)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}
