import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("8080"),
  NODE_ENV: z.string().default("development"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRY: z.string().default("12h"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),
  MYSCHEME_API_BASE_URL: z.string().optional(),
  MYSCHEME_API_KEY: z.string().optional(),
  DATAGOV_API_BASE_URL: z.string().optional(),
  DATAGOV_API_KEY: z.string().optional(),
  CPGRAMS_API_BASE_URL: z.string().optional(),
  CPGRAMS_API_KEY: z.string().optional(),
  DIGILOCKER_API_BASE_URL: z.string().optional(),
  DIGILOCKER_API_KEY: z.string().optional(),
  OVERPASS_API_BASE_URL: z.string().default("https://overpass-api.de/api/interpreter"),
  RBI_AA_API_BASE_URL: z.string().optional(),
  RBI_AA_API_KEY: z.string().optional(),
  CLAUDE_API_BASE_URL: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  TWILIO_SCORE_TEMPLATE_SID: z.string().optional(),
  TWILIO_SAVINGS_TEMPLATE_SID: z.string().optional(),
  TWILIO_SCHEME_TEMPLATE_SID: z.string().optional(),
  TWILIO_FRAUD_TEMPLATE_SID: z.string().optional(),
  GOOGLE_TRANSLATE_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment config", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT),
};

