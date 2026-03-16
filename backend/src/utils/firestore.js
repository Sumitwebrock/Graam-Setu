export const upsertByUserId = async (collectionRef, userId, payload) => {
  const docRef = collectionRef.doc(userId);
  await docRef.set(payload, { merge: true });
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

export const listByUserId = async (collectionRef, userId) => {
  const snapshot = await collectionRef.where("userId", "==", userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
