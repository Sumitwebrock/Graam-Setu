import { API_BASE_URL } from "./apiBase";

const getAuthUrls = (path) => {
  if (API_BASE_URL) {
    return [`${API_BASE_URL}${path}`];
  }

  if (typeof window !== "undefined" && (window.location.port === "5173" || window.location.port === "5174")) {
    const directBackendUrl = `${window.location.protocol}//${window.location.hostname}:8080${path}`;
    return [path, directBackendUrl];
  }

  return [path];
};

const parseErrorBody = async (response) => {
  const text = await response.text().catch(() => "");
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const parseApiResponse = async (response) => {
  const data = await parseErrorBody(response);
  if (!response.ok) {
    throw new Error(data.message || "Request failed. Please try again.");
  }
  return data;
};

const performAuthRequest = async (path, payload) => {
  const urls = getAuthUrls(path);
  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return await parseApiResponse(response);
    } catch (error) {
      lastError = error;

      // If a dev proxy request fails due to network/runtime issues, try direct backend URL once.
      if (error instanceof TypeError) {
        continue;
      }

      throw error;
    }
  }

  if (lastError instanceof TypeError) {
    throw new Error("Unable to reach the server. Please refresh the page and try again.");
  }

  throw lastError || new Error("Unable to complete the request.");
};

export const registerUser = async (payload) => {
  return performAuthRequest("/api/auth/register", payload);
};

export const loginUser = async (payload) => {
  return performAuthRequest("/api/auth/login-compat", payload);
};
