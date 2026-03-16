import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { fetchGlossaryTerms } from "../services/vidhiApi";
import { useLanguage } from "../LanguageContext";

export default function LegalGlossary({ externalSearchTerm = "" }) {
  const { language } = useLanguage();
  const [search, setSearch] = useState("");
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTerms = async () => {
      try {
        setLoading(true);
        setError("");
        const query = search || externalSearchTerm;
        const data = await fetchGlossaryTerms(query);
        setTerms(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.message ||
            (language !== "en"
              ? "कानूनी शब्दावली लोड नहीं हुई।"
              : "Could not load legal glossary.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, [search, externalSearchTerm]);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-[#673AB7]" />
        <div>
          <h2 className="text-xl text-gray-900">
            {language !== "en" ? "कानूनी शब्दावली" : "Legal Glossary"} / कानूनी शब्दावली
          </h2>
          <p className="text-gray-600 mt-1">
            {language !== "en"
              ? "आम कानूनी शब्द खोजें (हिंदी अर्थ सहित)।"
              : "Search common legal terms (Hindi meanings included)."}
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language !== "en" ? "कोई शब्द खोजें..." : "Search a term..."}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 focus:outline-none focus:border-[#673AB7]"
        />
        <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
      </div>

      {loading && (
        <div className="rounded-xl bg-[#F8FAF9] p-4 text-gray-600">
          {language !== "en" ? "शब्दावली लोड हो रही है..." : "Loading glossary..."}
        </div>
      )}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

      <div className="space-y-3 max-h-[430px] overflow-auto pr-1">
        {terms.map((term) => (
          <div key={term.term} className="rounded-xl border border-gray-100 bg-[#F8FAF9] p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base text-gray-900">{term.termHindi}</h3>
              <span className="text-xs text-[#673AB7] bg-white rounded-full px-3 py-1 border border-[#673AB7]/10">{term.term}</span>
            </div>
            <p className="text-gray-700 text-sm">{term.meaningHindi}</p>
          </div>
        ))}
        {!loading && !terms.length && (
          <div className="rounded-xl bg-[#F8FAF9] p-4 text-gray-600">
            {language !== "en" ? "इस खोज के लिए कोई शब्द नहीं मिला।" : "No terms found for this search."}
          </div>
        )}
      </div>
    </div>
  );
}
