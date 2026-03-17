import { API_BASE_URL } from "./apiBase";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const getCurrentUserId = () => {
  const userRaw = localStorage.getItem("authUser");
  if (!userRaw) return "";
  try {
    const user = JSON.parse(userRaw);
    return user.uid || user.userId || "";
  } catch {
    return "";
  }
};

export const fetchSavingsGoals = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/savings/goals/${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const createSavingsGoal = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/savings/create-goal`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const addSavingAmount = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/savings/add-saving`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const fetchSavingsProgress = async (goalId) => {
  const response = await fetch(`${API_BASE_URL}/api/savings/progress/${encodeURIComponent(goalId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const fetchUserProfileForSavings = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/profile/${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const fetchReminderPreference = async () => {
  const response = await fetch(`${API_BASE_URL}/api/savings/reminder-preference`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const updateReminderPreference = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/savings/reminder-preference`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};
