import axios from "axios";

export const buildApiClient = (baseURL, apiKey, timeout = 3000) => {
  const client = axios.create({
    baseURL,
    timeout,
  });

  client.interceptors.request.use((config) => {
    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }
    return config;
  });

  return client;
};
