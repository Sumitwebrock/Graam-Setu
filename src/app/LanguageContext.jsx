import { createContext, useContext, useEffect, useState } from "react";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "as", label: "অসমীয়া (Assamese)" },
];

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const isSupportedLanguage = (value) =>
    SUPPORTED_LANGUAGES.some((lang) => lang.code === value);

  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    const savedLanguage = localStorage.getItem("language") || "en";
    return isSupportedLanguage(savedLanguage) ? savedLanguage : "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("language", language);
    } catch {
      // ignore storage errors
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
