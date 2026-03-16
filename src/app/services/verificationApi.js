const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const parseApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
};

export const fetchUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    headers: {
      ...authHeaders(),
    },
  });
  return parseApiResponse(response);
};

export const sendVerificationOtp = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/api/verification/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(phone ? { phone } : {}),
  });
  return parseApiResponse(response);
};

export const verifyOtpCode = async (otp) => {
  const response = await fetch(`${API_BASE_URL}/api/verification/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ otp }),
  });
  return parseApiResponse(response);
};

export const uploadVerificationDocument = async (documentType, file, aadhaarNumber) => {
  const formData = new FormData();
  formData.append("documentType", documentType);
  if (aadhaarNumber) {
    formData.append("aadhaarNumber", aadhaarNumber);
  }
  formData.append("document", file);

  const response = await fetch(`${API_BASE_URL}/api/verification/upload-document`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
    body: formData,
  });
  return parseApiResponse(response);
};
