import { useEffect, useState } from "react";
import { MapPin, PhoneCall } from "lucide-react";
import { fetchLegalAidCenters } from "../services/vidhiApi";
import { useLanguage } from "../LanguageContext";

export default function LegalAidLocator({ state, district }) {
  const { language } = useLanguage();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCenters = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchLegalAidCenters(state || "", district || "");
        setCenters(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.message ||
            (language !== "en"
              ? "नजदीकी सहायता केंद्र लोड नहीं हो सके।"
              : "Could not load nearby centers.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, [state, district]);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-8 h-8 text-[#1B7F3A]" />
        <div>
          <h2 className="text-xl text-gray-900">
            {language !== "en" ? "सहायता केंद्र" : "Legal Aid Locator"} / सहायता केंद्र
          </h2>
          <p className="text-gray-600 mt-1">
            {language !== "en"
              ? "अपने ज़िले और राज्य के आधार पर नज़दीकी कानूनी सहायता केंद्र खोजें।"
              : "Find nearby legal help centers based on your district and state."}
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl bg-[#F8FAF9] p-4 text-gray-600">
          {language !== "en" ? "केंद्र खोजे जा रहे हैं..." : "Finding centers..."}
        </div>
      )}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

      <div className="space-y-4">
        {centers.map((center) => (
          <div key={center.id} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#E8F5E9] to-white p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-base text-gray-900">{center.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{center.location}</p>
              </div>
              <span className="text-sm text-[#1B7F3A] bg-white px-3 py-1 rounded-full border border-[#1B7F3A]/10">{center.distance}</span>
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm text-gray-500">Timing</div>
                <div className="text-gray-700">{center.openHours}</div>
              </div>
              <a href={`tel:${center.contactNumber}`} className="inline-flex items-center gap-2 bg-[#1B7F3A] text-white px-4 py-3 rounded-xl hover:bg-[#155d2b] transition-all">
                <PhoneCall className="w-4 h-4" />
                {center.contactNumber}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
