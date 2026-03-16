import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { fetchMinimumWage } from "../services/vidhiApi";
import { useLanguage } from "../LanguageContext";

const STATES = ["Chhattisgarh", "Uttar Pradesh", "Bihar", "Maharashtra", "Rajasthan"];
const OCCUPATIONS = ["Construction Worker", "Agricultural Worker", "Domestic Worker", "Driver"];

export default function MinimumWageChecker({ defaultState, defaultOccupation }) {
  const { language } = useLanguage();
  const [state, setState] = useState(defaultState || "Chhattisgarh");
  const [occupation, setOccupation] = useState(defaultOccupation || "Construction Worker");
  const [wageData, setWageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultState) setState(defaultState);
  }, [defaultState]);

  useEffect(() => {
    if (defaultOccupation) setOccupation(defaultOccupation);
  }, [defaultOccupation]);

  useEffect(() => {
    const loadWage = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchMinimumWage(state, occupation);
        setWageData(data);
      } catch (err) {
        setError(
          err.message ||
            (language !== "en"
              ? "मजदूरी जानकारी नहीं मिली।"
              : "Could not load wage information.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadWage();
  }, [state, occupation]);

  return (
    <div className="bg-gradient-to-br from-[#FFEBEE] to-[#FFF3E0] rounded-2xl p-6 md:p-8 border-2 border-[#d4183d] mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-8 h-8 text-[#d4183d]" />
        <div>
          <h2 className="text-xl text-gray-900">
            {language !== "en" ? "न्यूनतम मजदूरी" : "Minimum Wage Checker"} / न्यूनतम मजदूरी
          </h2>
          <p className="text-gray-600 mt-1">
            {language !== "en"
              ? "राज्य और काम चुनें ताकि अनुमानित न्यूनतम मजदूरी देख सकें।"
              : "Select state and occupation to see an estimated minimum wage."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <label className="block">
          <div className="text-sm text-gray-700 mb-2">
            {language !== "en" ? "राज्य" : "State"} / राज्य
          </div>
          <select value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:border-[#d4183d]">
            {STATES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="text-sm text-gray-700 mb-2">
            {language !== "en" ? "काम" : "Occupation"} / काम
          </div>
          <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:border-[#d4183d]">
            {OCCUPATIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <div className="rounded-xl bg-white p-4 text-gray-600">
          {language !== "en" ? "मजदूरी जानकारी लोड हो रही है..." : "Loading wage data..."}
        </div>
      )}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

      {wageData && !loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between p-4 bg-white rounded-xl">
              <span className="text-gray-700">State:</span>
              <span className="text-gray-900">{wageData.state}</span>
            </div>
            <div className="flex justify-between p-4 bg-white rounded-xl">
              <span className="text-gray-700">Occupation:</span>
              <span className="text-gray-900">{wageData.occupation}</span>
            </div>
            <div className="flex justify-between p-4 bg-white rounded-xl">
              <span className="text-gray-700">Minimum Wage:</span>
              <span className="text-[#1B7F3A] text-base font-medium">₹{wageData.amountPerDay}/day</span>
            </div>
            <div className="flex justify-between p-4 bg-[#d4183d] text-white rounded-xl">
              <span>Monthly Estimate:</span>
              <span className="text-base font-medium">₹{Number(wageData.amountPerMonth || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl flex flex-col justify-center">
            <h3 className="text-base text-gray-900 mb-3">
              {language !== "en" ? "सरल समझ" : "Easy explanation (सरल समझ)"}
            </h3>
            <p className="text-gray-700 mb-4">
              {language !== "en"
                ? wageData.explanationHindi
                : wageData.explanationEnglish || wageData.explanationHindi}
            </p>
            <p className="text-sm text-gray-500">
              {language !== "en" ? "स्रोत" : "Source"}: {wageData.source}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}