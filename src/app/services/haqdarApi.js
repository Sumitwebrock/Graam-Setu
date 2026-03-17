import { API_BASE_URL } from "./apiBase";

const parseApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch data.");
  }
  return data;
};

const getAuthToken = () => localStorage.getItem("authToken");

const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Session expired. Please login again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getUserProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/profile/${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseApiResponse(response);
};

export const getProfileBasedSchemes = async () => {
  const response = await fetch(`${API_BASE_URL}/api/schemes`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseApiResponse(response);
};

export const getPaymentHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/api/schemes/payment-history`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseApiResponse(response);
};

export const getSchemeApplicationStatus = async ({ schemeId, schemeName }) => {
  const params = new URLSearchParams();
  if (schemeId) {
    params.set("schemeId", schemeId);
  }
  if (schemeName) {
    params.set("schemeName", schemeName);
  }

  const response = await fetch(`${API_BASE_URL}/api/schemes/application-status?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseApiResponse(response);
};