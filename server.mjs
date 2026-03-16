import cors from "cors";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = await open({
  filename: path.join(dataDir, "graamsetu.db"),
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    village TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) {
    return false;
  }

  const hashToVerify = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  const originalBuffer = Buffer.from(originalHash, "hex");
  const verifyBuffer = Buffer.from(hashToVerify, "hex");
  if (originalBuffer.length !== verifyBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, verifyBuffer);
};

const normalizeEmail = (email) => {
  const value = (email || "").trim().toLowerCase();
  return value === "" ? null : value;
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const fullName = (req.body.fullName || "").trim();
    const phone = (req.body.phone || "").trim();
    const email = normalizeEmail(req.body.email);
    const village = (req.body.village || "").trim();
    const password = req.body.password || "";

    if (!fullName || !phone || !village || !password) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const existing = await db.get(
      "SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?)",
      [phone, email]
    );

    if (existing) {
      return res.status(409).json({ message: "User already registered. Please login." });
    }

    const passwordHash = hashPassword(password);

    const result = await db.run(
      "INSERT INTO users (full_name, phone, email, village, password_hash) VALUES (?, ?, ?, ?, ?)",
      [fullName, phone, email, village, passwordHash]
    );

    return res.status(201).json({
      message: "Registration successful. Please login.",
      user: {
        id: result.lastID,
        fullName,
        phone,
        email,
        village,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const password = req.body.password || "";
    const identifier = (req.body.identifier || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required." });
    }

    const user = await db.get(
      "SELECT id, full_name, phone, email, village, password_hash FROM users WHERE phone = ? OR email = ?",
      [identifier, identifier.toLowerCase()]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    const isValidPassword = verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password." });
    }

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        phone: user.phone,
        email: user.email,
        village: user.village,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login." });
  }
});

app.listen(PORT, () => {
  console.log(`GraamSetu auth server running on port ${PORT}`);
});
