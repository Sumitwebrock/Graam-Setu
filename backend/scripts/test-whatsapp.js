// Temporary verification script for Twilio WhatsApp notifications
// Usage (from backend directory):
//   node scripts/test-whatsapp.js

import { env } from "../src/config/env.js";
import {
  sendScoreAlert,
  sendSavingsNudge,
  sendSchemeAlert,
  sendFraudAlert,
} from "../src/integrations/whatsapp/notify.js";

async function run() {
  console.log("[WhatsApp Test] Starting WhatsApp notification verification...");

  console.log("[WhatsApp Test] Env presence:", {
    TWILIO_ACCOUNT_SID: Boolean(env.TWILIO_ACCOUNT_SID),
    TWILIO_AUTH_TOKEN: Boolean(env.TWILIO_AUTH_TOKEN),
    TWILIO_WHATSAPP_FROM: Boolean(env.TWILIO_WHATSAPP_FROM),
    TWILIO_SCORE_TEMPLATE_SID: Boolean(env.TWILIO_SCORE_TEMPLATE_SID),
    TWILIO_SAVINGS_TEMPLATE_SID: Boolean(env.TWILIO_SAVINGS_TEMPLATE_SID),
    TWILIO_SCHEME_TEMPLATE_SID: Boolean(env.TWILIO_SCHEME_TEMPLATE_SID),
    TWILIO_FRAUD_TEMPLATE_SID: Boolean(env.TWILIO_FRAUD_TEMPLATE_SID),
  });

  const testPhone = process.env.TEST_WHATSAPP_PHONE || "+919340440814"; // adjust or override via env

  console.log("[WhatsApp Test] Using test phone:", testPhone);

  try {
    console.log("\n[WhatsApp Test] 1) sendScoreAlert...");
    await sendScoreAlert(testPhone, "Ramesh", 78, "Silver");

    console.log("\n[WhatsApp Test] 2) sendSavingsNudge...");
    await sendSavingsNudge(testPhone, "Ramesh", 2500, 5000, "Scooter down payment");

    console.log("\n[WhatsApp Test] 3) sendSchemeAlert...");
    await sendSchemeAlert(testPhone, "Ramesh", "PM-KISAN installment", 2000);

    console.log("\n[WhatsApp Test] 4) sendFraudAlert...");
    await sendFraudAlert(testPhone, "Ramesh", "UPI scam alert", "Raipur");

    console.log("\n[WhatsApp Test] Completed. Check above logs and WhatsApp device.");
  } catch (error) {
    console.error("[WhatsApp Test] Unexpected error while testing notifications", error);
  }
}

run();
