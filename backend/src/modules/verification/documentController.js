import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { firestore } from "../../config/firebase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../../uploads/documents");

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadsRoot);
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${timestamp}-${safeOriginal}`);
  },
});

export const uploadMiddleware = multer({ storage }).single("document");

const normalizeAadhaar = (value) => String(value || "").replace(/\D/g, "");

export const uploadDocumentController = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    const { documentType, aadhaarNumber } = req.body || {};

    if (!uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    if (!documentType) {
      return res.status(400).json({ message: "documentType is required" });
    }

    const allowedTypes = ["AADHAAR", "INCOME_CERTIFICATE", "CASTE_CERTIFICATE", "RATION_CARD"];
    if (!allowedTypes.includes(documentType)) {
      return res.status(400).json({ message: "Unsupported documentType" });
    }

    let aadhaarNormalized = null;
    if (documentType === "AADHAAR" && aadhaarNumber) {
      aadhaarNormalized = normalizeAadhaar(aadhaarNumber);
      if (aadhaarNormalized.length !== 12) {
        return res.status(400).json({ message: "Invalid Aadhaar number" });
      }

      // Prevent duplicate Aadhaar numbers across users.
      const existing = await firestore
        .collection("verification_documents")
        .where("aadhaarNumber", "==", aadhaarNormalized)
        .get();

      const conflict = existing.docs.find((doc) => doc.data()?.userId && doc.data().userId !== uid);
      if (conflict) {
        await firestore.collection("users").doc(uid).set({ riskFlag: true }, { merge: true });
        return res.status(409).json({ message: "Aadhaar already used by another user" });
      }
    }

    const relativePath = path.relative(path.resolve(__dirname, "../../../"), req.file.path);
    const now = dayjs().toISOString();

    const docRef = await firestore.collection("verification_documents").add({
      userId: uid,
      documentType,
      filePath: relativePath,
      uploadDate: now,
      aadhaarNumber: aadhaarNormalized,
    });

    // Mark user as pending agent review once they have any document.
    await firestore.collection("users").doc(uid).set(
      {
        verificationStatus: "PENDING_AGENT_REVIEW",
        riskFlag: false,
      },
      { merge: true }
    );

    return res.status(201).json({
      id: docRef.id,
      userId: uid,
      documentType,
      filePath: relativePath,
      uploadDate: now,
    });
  } catch (error) {
    return next(error);
  }
};
