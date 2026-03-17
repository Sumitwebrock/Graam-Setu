import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { attachConsent } from "./middlewares/consentMiddleware.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorMiddleware.js";
import apiRoutes from "./routes/index.js";
import whatsappRouter from "./integrations/whatsapp/webhook.js";
import {
  sendFraudAlert,
  sendSavingsNudge,
  sendSchemeAlert,
  sendScoreAlert,
} from "./integrations/whatsapp/notify.js";

const openApiPath = fileURLToPath(new URL("./openapi/openapi.yaml", import.meta.url));
const openApiSpec = YAML.load(openApiPath);

const app = express();
const allowedOrigins = [
  ...new Set(
    (env.CLIENT_ORIGIN || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .concat([
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ])
  ),
];

const allowedDevOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1|(?:10|192\.168)(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(?::(?:5173|5174))?$/;

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return allowedDevOriginPattern.test(origin);
};

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients, configured origins, and local network Vite dev origins.
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
  })
);
// Support both JSON (existing APIs) and URL-encoded payloads (e.g. Twilio webhooks).
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));
app.use(attachConsent);

app.get("/", (_req, res) => {
  res.json({ name: "GraamSetu API", version: "1.0.0", status: "running", docs: "/docs", health: "/health" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "graamsetu-backend" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.post("/api/notify/score", async (req, res) => {
  const { phone, name, score, tier } = req.body || {};
  try {
    await sendScoreAlert(phone, name, score, tier);
  } catch (error) {
    console.error("[Notify] /score handler error", error?.message || error);
  }
  res.json({ success: true });
});

app.post("/api/notify/savings", async (req, res) => {
  const { phone, name, saved, goal, goalName } = req.body || {};
  try {
    await sendSavingsNudge(phone, name, saved, goal, goalName);
  } catch (error) {
    console.error("[Notify] /savings handler error", error?.message || error);
  }
  res.json({ success: true });
});

app.post("/api/notify/scheme", async (req, res) => {
  const { phone, name, schemeName, amount } = req.body || {};
  try {
    await sendSchemeAlert(phone, name, schemeName, amount);
  } catch (error) {
    console.error("[Notify] /scheme handler error", error?.message || error);
  }
  res.json({ success: true });
});

app.post("/api/notify/fraud", async (req, res) => {
  const { phone, name, fraudType, district } = req.body || {};
  try {
    await sendFraudAlert(phone, name, fraudType, district);
  } catch (error) {
    console.error("[Notify] /fraud handler error", error?.message || error);
  }
  res.json({ success: true });
});

app.use("/api/whatsapp", whatsappRouter);
app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
