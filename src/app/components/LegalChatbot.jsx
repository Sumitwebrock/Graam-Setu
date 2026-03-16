import { useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { askLegalAssistant } from "../services/vidhiApi";
import { useLanguage } from "../LanguageContext";

const QUICK_QUESTIONS = [
  "I was paid less than minimum wage. What should I do?",
  "If a government scheme is rejected, where can I complain?",
  "A loan agent is threatening me. What are my rights?",
];

export default function LegalChatbot({ profile }) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeholder = useMemo(() => {
    if (profile?.occupation) {
      return language !== "en"
        ? `${profile.occupation} के रूप में मेरे क्या अधिकार हैं?`
        : `As a ${profile.occupation}, what are my rights?`;
    }
    return language !== "en"
      ? "अगर मुझे कम मजदूरी मिली है तो मेरे क्या अधिकार हैं?"
      : "What are my rights if I was paid less?";
  }, [profile, language]);

  const handleAsk = async (nextQuery) => {
    const finalQuery = (nextQuery || query).trim();
    if (!finalQuery) return;

    try {
      setLoading(true);
      setError("");
      const reply = await askLegalAssistant(finalQuery, language !== "en" ? "hi" : "en");
      setMessages((prev) => [...prev, { role: "user", text: finalQuery }, { role: "assistant", text: reply.answer }]);
      setQuery("");
    } catch (err) {
      setError(
        err.message ||
          (language !== "en"
            ? "अभी जवाब उपलब्ध नहीं है।"
            : "Answer not available right now.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-8 h-8 text-[#673AB7]" />
        <div>
          <h2 className="text-xl text-gray-900">
            {language !== "en" ? "कानूनी सहायक" : "Ask Legal Assistant"} / कानूनी सहायक
          </h2>
          <p className="text-gray-600 mt-1">
            {language !== "en"
              ? "सवाल पूछें और अगला स्पष्ट कदम जानें।"
              : "Ask a question and get clear next steps."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_QUESTIONS.map((item) => (
          <button
            key={item}
            onClick={() => handleAsk(item)}
            className="px-3 py-2 rounded-full bg-[#F3E5F5] text-[#673AB7] text-sm hover:bg-[#e9d7f7] transition-all"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-[#F8FAF9] p-4 min-h-[250px] max-h-[340px] overflow-auto mb-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-gray-500">
            {language !== "en"
              ? "जवाब पाने के लिए कोई सवाल पूछें।"
              : "Ask a question to get an answer."}
          </div>
        )}
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`rounded-2xl px-4 py-3 ${message.role === "assistant" ? "bg-white text-gray-800" : "bg-[#673AB7] text-white ml-auto max-w-[85%]"}`}>
            {message.text}
          </div>
        ))}
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm mb-4">{error}</div>}

      <div className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#673AB7]"
        />
        <button onClick={() => handleAsk()} disabled={loading} className="bg-[#673AB7] text-white px-5 rounded-xl hover:bg-[#5E35B1] transition-all disabled:opacity-60 flex items-center gap-2">
          <Send className="w-4 h-4" />
          {loading
            ? language !== "en" ? "भेजा जा रहा है" : "Sending"
            : language !== "en" ? "पूछें" : "Ask"}
        </button>
      </div>
    </div>
  );
}
