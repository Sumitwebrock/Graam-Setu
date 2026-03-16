import admin from "firebase-admin";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { env } from "./env.js";

const hasServiceAccount =
  env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY;

const useMockFirebase = !hasServiceAccount && !env.FIREBASE_PROJECT_ID;

if (!useMockFirebase && !admin.apps.length) {
  if (hasServiceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    admin.initializeApp({
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const makeQuerySnapshot = (docs) => ({
  empty: docs.length === 0,
  size: docs.length,
  docs: docs.map((doc) => ({ id: doc.id, data: () => deepClone(doc.data) })),
});

const createMockFirestore = () => {
  const store = new Map();

  const getCollectionMap = (name) => {
    if (!store.has(name)) {
      store.set(name, new Map());
    }
    return store.get(name);
  };

  const makeCollection = (name, currentFilters = [], order = null, limitCount = null) => {
    const collectionMap = getCollectionMap(name);

    const runQuery = () => {
      let docs = Array.from(collectionMap.entries()).map(([id, data]) => ({ id, data }));

      for (const filter of currentFilters) {
        docs = docs.filter((doc) => {
          if (filter.op !== "==") {
            return false;
          }
          return doc.data?.[filter.field] === filter.value;
        });
      }

      if (order) {
        docs.sort((a, b) => {
          const av = a.data?.[order.field];
          const bv = b.data?.[order.field];
          if (av === bv) {
            return 0;
          }
          const cmp = av > bv ? 1 : -1;
          return order.direction === "desc" ? -cmp : cmp;
        });
      }

      if (typeof limitCount === "number") {
        docs = docs.slice(0, limitCount);
      }

      return makeQuerySnapshot(docs);
    };

    return {
      doc: (id) => ({
        set: async (payload, options = {}) => {
          const current = collectionMap.get(id) || {};
          collectionMap.set(id, options.merge ? { ...current, ...deepClone(payload) } : deepClone(payload));
        },
        get: async () => {
          const data = collectionMap.get(id);
          return {
            id,
            exists: Boolean(data),
            data: () => (data ? deepClone(data) : undefined),
          };
        },
      }),
      where: (field, op, value) => makeCollection(name, [...currentFilters, { field, op, value }], order, limitCount),
      orderBy: (field, direction = "asc") => makeCollection(name, currentFilters, { field, direction }, limitCount),
      limit: (value) => makeCollection(name, currentFilters, order, value),
      get: async () => runQuery(),
    };
  };

  return {
    collection: (name) => makeCollection(name),
  };
};

const createMockAuth = () => {
  const usersByUid = new Map();
  const uidByPhone = new Map();

  return {
    verifyIdToken: async (token) => {
      const uid = token?.replace("mock-token-", "") || uuidv4();
      const user = usersByUid.get(uid) || { uid, phoneNumber: "+919999999999" };
      return { uid: user.uid, phone_number: user.phoneNumber };
    },
    getUserByPhoneNumber: async (phoneNumber) => {
      const uid = uidByPhone.get(phoneNumber);
      if (!uid) {
        throw new Error("User not found");
      }
      return usersByUid.get(uid);
    },
    createUser: async ({ phoneNumber, displayName }) => {
      const uid = uuidv4();
      const user = { uid, phoneNumber, displayName: displayName || "", createdAt: dayjs().toISOString() };
      usersByUid.set(uid, user);
      uidByPhone.set(phoneNumber, uid);
      return user;
    },
  };
};

const createMockStorage = () => ({
  bucket: () => ({
    file: (path) => ({
      save: async () => {},
      makePublic: async () => {},
      publicUrl: () => `https://mock-storage.local/${path}`,
    }),
  }),
});

export const auth = useMockFirebase ? createMockAuth() : admin.auth();
export const firestore = useMockFirebase ? createMockFirestore() : admin.firestore();
export const storage = useMockFirebase ? createMockStorage() : admin.storage();
