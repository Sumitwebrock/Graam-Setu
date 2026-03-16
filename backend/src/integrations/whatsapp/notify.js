import twilio from "twilio";
import { env } from "../../config/env.js";

const hasTwilioConfig = Boolean(
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM
);

const client = hasTwilioConfig
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

if (hasTwilioConfig && client) {
  const sidTail = String(env.TWILIO_ACCOUNT_SID).slice(-4);
  console.log(
    "[WhatsApp] Twilio client initialized successfully (ACCOUNT SID ending:",
    sidTail,
    ")"
  );
} else {
  console.warn("[WhatsApp] Twilio client NOT initialized. Check environment variables.");
}

function getToNumber(phone) {
  if (!phone) return null;

  const raw = String(phone).trim();

  // If already in full WhatsApp format, trust it
  if (raw.startsWith("whatsapp:")) {
    return raw;
  }

  // Strip non-digits to support formats like +91-9340 440814
  const digits = raw.replace(/\D/g, "");

  // Handle full country-code form (e.g. 919340440814)
  if (/^91\d{10}$/.test(digits)) {
    return `whatsapp:+${digits}`;
  }

  // Handle bare 10-digit Indian mobile number
  if (/^\d{10}$/.test(digits)) {
    return `whatsapp:+91${digits}`;
  }

  return null;
}

async function sendWhatsAppMessage({ to, body, contentSid, contentVariables, metaTag }) {
  if (!client) {
    console.error("[WhatsApp] Twilio client not configured. Skipping send.", metaTag || "");
    return;
  }

  if (!to) {
    console.error("[WhatsApp] Invalid recipient number. Skipping send.", metaTag || "");
    return;
  }

  try {
    const base = {
      from: env.TWILIO_WHATSAPP_FROM,
      to,
    };

    console.log("[WhatsApp] Preparing message", {
      metaTag: metaTag || "",
      to,
      usesTemplate: Boolean(contentSid),
      contentSid: contentSid || null,
      contentVariables: contentVariables || null,
    });

    if (contentSid) {
      const message = await client.messages.create({
        ...base,
        contentSid,
        contentVariables,
      });
      console.log(
        "[WhatsApp] Template message sent successfully",
        metaTag || "",
        "SID:",
        message?.sid
      );
    } else {
      const message = await client.messages.create({
        ...base,
        body,
      });
      console.log(
        "[WhatsApp] Text message sent successfully",
        metaTag || "",
        "SID:",
        message?.sid
      );
    }
  } catch (error) {
    console.error("[WhatsApp] Failed to send message", metaTag || "", {
      message: error?.message || String(error),
      code: error?.code,
      moreInfo: error?.moreInfo,
      status: error?.status,
    });
  }
}

export async function sendScoreAlert(phone, name, score, tier) {
  try {
    const to = getToNumber(phone);
    const safeName = name || "mitra";
    const safeTier = tier || "BUILDING";
    const safeScore = typeof score === "number" ? score : Number(score) || 0;

    const templateSid = env.TWILIO_SCORE_TEMPLATE_SID;

    console.log("[WhatsApp] Triggering score alert for", {
      phone,
      to,
      name: safeName,
      score: safeScore,
      tier: safeTier,
      templateSid: templateSid || null,
    });

    if (templateSid) {
      const contentVariables = JSON.stringify({
        1: safeName,
        2: `${safeScore}/100`,
        3: safeTier,
      });

      await sendWhatsAppMessage({
        to,
        contentSid: templateSid,
        contentVariables,
        metaTag: "score-alert", 
      });
    } else {
      const body =
        `Namaste ${safeName} 👋\n` +
        `Aapka GraamScore ready hai! 🎯\n` +
        `Score: ${safeScore}/100 (${safeTier})\n\n` +
        "Is score se aapko better loan options mil sakte hain. " +
        "Aap apna detailed report GraamSetu app me dekh sakte hain.\n" +
        "— Team GraamSetu";

      await sendWhatsAppMessage({ to, body, metaTag: "score-alert" });
    }
  } catch (error) {
    console.error("[WhatsApp] Error in sendScoreAlert", error?.message || error);
  }
}

export async function sendSavingsNudge(phone, name, saved, goal, goalName) {
  try {
    const to = getToNumber(phone);
    const safeName = name || "mitra";
    const safeGoalName = goalName || "BachatBox goal";
    const savedAmt = Number(saved) || 0;
    const goalAmt = Number(goal) || 0;

    const templateSid = env.TWILIO_SAVINGS_TEMPLATE_SID;

    console.log("[WhatsApp] Triggering savings nudge for", {
      phone,
      to,
      name: safeName,
      goalName: safeGoalName,
      saved: savedAmt,
      goal: goalAmt,
      templateSid: templateSid || null,
    });

    if (templateSid) {
      const contentVariables = JSON.stringify({
        1: safeName,
        2: safeGoalName,
        3: `₹${savedAmt.toLocaleString("en-IN")}`,
        4: `₹${goalAmt.toLocaleString("en-IN")}`,
      });

      await sendWhatsAppMessage({
        to,
        contentSid: templateSid,
        contentVariables,
        metaTag: "savings-nudge",
      });
    } else {
      const body =
        `Hi ${safeName} 🌾\n` +
        `Aapki bachat update: ${safeGoalName}\n` +
        `Ab tak: ₹${savedAmt.toLocaleString("en-IN")} / ₹${goalAmt.toLocaleString("en-IN")}\n\n` +
        "Har hafte thoda-thoda save karte rahiye, " +
        "aapka goal jaldi poora hoga 💪\n" +
        "Yeh ek friendly reminder hai GraamSetu taraf se.";

      await sendWhatsAppMessage({ to, body, metaTag: "savings-nudge" });
    }
  } catch (error) {
    console.error("[WhatsApp] Error in sendSavingsNudge", error?.message || error);
  }
}

export async function sendSchemeAlert(phone, name, schemeName, amount) {
  try {
    const to = getToNumber(phone);
    const safeName = name || "mitra";
    const safeScheme = schemeName || "sarkari yojana";
    const amt = Number(amount) || 0;

    const templateSid = env.TWILIO_SCHEME_TEMPLATE_SID;

    console.log("[WhatsApp] Triggering scheme alert for", {
      phone,
      to,
      name: safeName,
      schemeName: safeScheme,
      amount: amt,
      templateSid: templateSid || null,
    });

    if (templateSid) {
      const contentVariables = JSON.stringify({
        1: safeName,
        2: safeScheme,
        3: amt > 0 ? `₹${amt.toLocaleString("en-IN")}` : "",
      });

      await sendWhatsAppMessage({
        to,
        contentSid: templateSid,
        contentVariables,
        metaTag: "scheme-alert",
      });
    } else {
      const body =
        `Namaste ${safeName} 🙏\n` +
        `${safeScheme} ka payment 15 din se pending lag raha hai.\n` +
        (amt > 0
          ? `Approx amount: ₹${amt.toLocaleString("en-IN")}\n\n`
          : "\n") +
        "Kripya apne bank / BC agent se follow-up kijiye. " +
        "Yeh ek alert hai taaki aapko apna haq ka paisa mil sake.\n" +
        "— GraamSetu";

      await sendWhatsAppMessage({ to, body, metaTag: "scheme-alert" });
    }
  } catch (error) {
    console.error("[WhatsApp] Error in sendSchemeAlert", error?.message || error);
  }
}

export async function sendFraudAlert(phone, name, fraudType, district) {
  try {
    const to = getToNumber(phone);
    const safeName = name || "mitra";
    const safeFraud = fraudType || "digital fraud";
    const safeDistrict = district || "aapke zila";

    const templateSid = env.TWILIO_FRAUD_TEMPLATE_SID;

    console.log("[WhatsApp] Triggering fraud alert for", {
      phone,
      to,
      name: safeName,
      fraudType: safeFraud,
      district: safeDistrict,
      templateSid: templateSid || null,
    });

    if (templateSid) {
      const contentVariables = JSON.stringify({
        1: safeName,
        2: safeFraud,
        3: safeDistrict,
      });

      await sendWhatsAppMessage({
        to,
        contentSid: templateSid,
        contentVariables,
        metaTag: "fraud-alert",
      });
    } else {
      const body =
        `Dear ${safeName},\n` +
        `${safeDistrict} region me ${safeFraud} ke kuch cases report hue hain.\n\n` +
        "Please dhyan rakhiye:\n" +
        "- Koi bhi OTP ya PIN kisi ko mat batayiye\n" +
        "- Koi unknown link pe click mat kijiye\n" +
        "- Koi doubt ho to turant apne bank ya GraamSetu BC se baat kijiye\n\n" +
        "Yeh message aapki suraksha ke liye hai. — GraamSetu";

      await sendWhatsAppMessage({ to, body, metaTag: "fraud-alert" });
    }
  } catch (error) {
    console.error("[WhatsApp] Error in sendFraudAlert", error?.message || error);
  }
}
