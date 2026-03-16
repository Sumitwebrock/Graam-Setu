import axios from "axios";
import { env } from "../config/env.js";
import { buildApiClient } from "../utils/apiClient.js";

const mySchemeClient = env.MYSCHEME_API_BASE_URL
	? buildApiClient(env.MYSCHEME_API_BASE_URL, env.MYSCHEME_API_KEY)
	: null;
const dataGovClient = env.DATAGOV_API_BASE_URL
	? buildApiClient(env.DATAGOV_API_BASE_URL, env.DATAGOV_API_KEY)
	: null;
const cpgramsClient = env.CPGRAMS_API_BASE_URL
	? buildApiClient(env.CPGRAMS_API_BASE_URL, env.CPGRAMS_API_KEY)
	: null;
const digiLockerClient = env.DIGILOCKER_API_BASE_URL
	? buildApiClient(env.DIGILOCKER_API_BASE_URL, env.DIGILOCKER_API_KEY)
	: null;
const rbiAaClient = env.RBI_AA_API_BASE_URL
	? buildApiClient(env.RBI_AA_API_BASE_URL, env.RBI_AA_API_KEY)
	: null;

export const fetchMySchemes = async () => {
	if (!mySchemeClient) {
		return [
			{
				schemeId: "mys-001",
				name: "PM Kisan",
				maxIncome: 250000,
				states: [],
				eligibility: "Small and marginal farmers",
				benefit: "Direct benefit transfer",
				documents: ["Aadhaar", "Land record"],
			},
		];
	}

	const response = await mySchemeClient.get("/schemes");
	return response.data?.schemes || [];
};

export const fetchDbtPayments = async (uid) => {
	if (!dataGovClient) {
		return [];
	}
	const response = await dataGovClient.get("/dbt/payments", { params: { userId: uid } });
	return response.data?.payments || [];
};

export const fileCpgramsGrievance = async (payload) => {
	if (!cpgramsClient) {
		return { grievanceId: `mock-${Date.now()}`, status: "Submitted", ...payload };
	}

	const response = await cpgramsClient.post("/grievances", payload);
	return response.data;
};

export const verifyDigiLockerDocument = async (documentRef) => {
	if (!digiLockerClient) {
		return { verified: true, source: "mock" };
	}

	const response = await digiLockerClient.post("/verify", { documentRef });
	return response.data;
};

export const fetchNearestCscAndPostOffice = async (lat, lon) => {
	const query = `
		[out:json];
		(
			node["amenity"="post_office"](around:5000,${lat},${lon});
			node["office"="government"](around:5000,${lat},${lon});
		);
		out body;
	`;

	const response = await axios.get(env.OVERPASS_API_BASE_URL, {
		params: { data: query },
		timeout: 3000,
	});

	return response.data?.elements || [];
};

export const fetchFinancialDataWithConsent = async ({ uid, consentToken }) => {
	if (!rbiAaClient) {
		return { uid, accounts: [], source: "mock" };
	}

	const response = await rbiAaClient.get("/accounts", {
		headers: { "x-consent-token": consentToken },
		params: { userId: uid },
	});
	return response.data;
};

export const getLegalChatbotResponse = async ({ query, language }) => {
	if (!env.CLAUDE_API_BASE_URL || !env.CLAUDE_API_KEY) {
		return "Local legal guidance: contact district legal services authority for formal support.";
	}

	const response = await axios.post(
		env.CLAUDE_API_BASE_URL,
		{
			model: "claude-3-5-sonnet-latest",
			max_tokens: 400,
			messages: [
				{
					role: "user",
					content: `Answer in ${language}. Rural India legal rights query: ${query}`,
				},
			],
		},
		{
			headers: {
				"x-api-key": env.CLAUDE_API_KEY,
				"content-type": "application/json",
			},
			timeout: 3000,
		}
	);

	return response.data?.content?.[0]?.text || "No response from legal assistant.";
};

export const getSavingsAdviceFromClaude = async ({ weeklyNeed, context }) => {
	if (!env.CLAUDE_API_BASE_URL || !env.CLAUDE_API_KEY) {
		return "Save fixed weekly cash envelopes and prioritize emergency fund first.";
	}

	const response = await axios.post(
		env.CLAUDE_API_BASE_URL,
		{
			model: "claude-3-5-sonnet-latest",
			max_tokens: 350,
			messages: [
				{
					role: "user",
					content: `Create practical micro-savings advice for this plan: ${JSON.stringify({ weeklyNeed, context })}`,
				},
			],
		},
		{
			headers: {
				"x-api-key": env.CLAUDE_API_KEY,
				"content-type": "application/json",
			},
			timeout: 3000,
		}
	);

	return response.data?.content?.[0]?.text || "No AI savings advice available.";
};

export const sendWhatsAppReminder = async (phone, message) => {
	if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) {
		return { sent: false, reason: "Twilio not configured" };
	}

	const accountSid = env.TWILIO_ACCOUNT_SID;
	const authToken = env.TWILIO_AUTH_TOKEN;
	const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

	const body = new URLSearchParams({
		To: `whatsapp:${phone}`,
		From: env.TWILIO_WHATSAPP_FROM,
		Body: message,
	});

	const response = await axios.post(url, body, {
		auth: { username: accountSid, password: authToken },
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		timeout: 3000,
	});

	return { sent: true, sid: response.data.sid };
};

export const translateText = async (text, targetLanguage) => {
	if (!env.GOOGLE_TRANSLATE_API_KEY) {
		return text;
	}

	const response = await axios.post(
		"https://translation.googleapis.com/language/translate/v2",
		{
			q: text,
			target: targetLanguage,
			format: "text",
			key: env.GOOGLE_TRANSLATE_API_KEY,
		},
		{ timeout: 3000 }
	);

	return response.data?.data?.translations?.[0]?.translatedText || text;
};
