const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "VidhiSahay data load nahi hua.");
  }
  return data;
};

const getAuthHeaders = (includeJson = false) => {
  const token = localStorage.getItem("authToken");
  const headers = includeJson ? { "Content-Type": "application/json" } : {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getCurrentVidhiUser = () => {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getVidhiUserProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/profile/${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const fetchSituationRights = async (type) => {
  const response = await fetch(`${API_BASE_URL}/api/rights/situation/${encodeURIComponent(type)}?lang=hi`, {
    method: "GET",
  });

  return parseResponse(response);
};

export const fetchMinimumWage = async (state, occupation) => {
  const params = new URLSearchParams({ state, occupation });
  const response = await fetch(`${API_BASE_URL}/api/rights/minimum-wage?${params.toString()}`, {
    method: "GET",
  });

  return parseResponse(response);
};

export const fetchConsumerHelp = async (issue) => {
  const response = await fetch(`${API_BASE_URL}/api/rights/consumer/${encodeURIComponent(issue)}`, {
    method: "GET",
  });

  return parseResponse(response);
};

export const fetchFraudAlerts = async (district) => {
  const response = await fetch(`${API_BASE_URL}/api/fraud/district/${encodeURIComponent(district || "general")}`, {
    method: "GET",
  });

  return parseResponse(response);
};

export const submitFraudReport = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/fraud/report`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const fetchGlossaryTerms = async (search = "") => {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }

  const response = await fetch(`${API_BASE_URL}/api/rights/glossary${params.toString() ? `?${params.toString()}` : ""}`, {
    method: "GET",
  });

  return parseResponse(response);
};

export const fetchLegalAidCenters = async (state, district) => {
  const params = new URLSearchParams();
  if (state) params.set("state", state);
  if (district) params.set("district", district);

  const response = await fetch(`${API_BASE_URL}/api/rights/legal-aid?${params.toString()}`, {
    method: "GET",
  });

  return parseResponse(response);
};

export const askLegalAssistant = async (query, language = "hi") => {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/query`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ query, language }),
  });

  return parseResponse(response);
};