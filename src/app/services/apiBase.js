const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const isPrivateDevHost = (hostname) => {
	return (
		hostname === "localhost" ||
		hostname === "127.0.0.1" ||
		hostname.startsWith("192.168.") ||
		hostname.startsWith("10.") ||
		/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
	);
};

const getApiBaseUrl = () => {
	if (configuredApiBaseUrl) {
		if (typeof window !== "undefined" && (window.location.port === "5173" || window.location.port === "5174")) {
			try {
				const parsed = new URL(configuredApiBaseUrl);
				if (isPrivateDevHost(parsed.hostname) && parsed.port && parsed.port !== "8080") {
					return "";
				}
			} catch {
				// Ignore parsing errors and use configured value as-is.
			}
		}

		return configuredApiBaseUrl;
	}

	return "";
};

export const API_BASE_URL = getApiBaseUrl();