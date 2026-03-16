import { Router } from "express";
import twilio from "twilio";
import { env } from "../../config/env.js";
import { routeWhatsAppMessage } from "./router.js";

const whatsappRouter = Router();

const twilioAuthToken = env.TWILIO_AUTH_TOKEN;

// Optional: verify Twilio signature when auth token is configured
function verifyTwilioSignature(req) {
  if (!twilioAuthToken) return true;
  try {
    const signature = req.headers["x-twilio-signature"]; // header name is lower-cased in Node
    const url = `${env.PUBLIC_BASE_URL || ""}${req.originalUrl}`;
    return twilio.validateRequest(twilioAuthToken, signature, url, req.body);
  } catch (error) {
    console.error("[WhatsApp] Signature validation failed", error?.message);
    return false;
  }
}

whatsappRouter.post("/webhook", async (req, res) => {
  if (!verifyTwilioSignature(req)) {
    return res.status(403).send("Invalid Twilio signature");
  }

  const fromRaw = req.body?.From || "";
  const body = req.body?.Body || "";

  // Twilio sends WhatsApp numbers as "whatsapp:+91xxxxxxxxxx"; strip the prefix.
  const from = fromRaw.replace(/^whatsapp:/i, "");

  try {
    const replyText = await routeWhatsAppMessage({ from, body });

    // Respond using TwiML so Twilio delivers the message back to WhatsApp.
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(replyText || "");

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("[WhatsApp] Webhook error", error?.message);
    res.status(200).send("");
  }
});

export default whatsappRouter;
