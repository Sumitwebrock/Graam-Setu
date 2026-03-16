import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { fetchConsumerHelp } from "../services/vidhiApi";
import { useLanguage } from "../LanguageContext";

const ISSUES = [
  { key: "defective_product", labelHindi: "खराब सामान", label: "Defective Product" },
  { key: "fake_medicine", labelHindi: "नकली दवा", label: "Fake Medicine" },
  { key: "service_fraud", labelHindi: "सेवा में धोखा", label: "Service Fraud" },
];

export default function ConsumerRightsHelper() {
  const { language } = useLanguage();
  const [selectedIssue, setSelectedIssue] = useState("defective_product");
  const [issueData, setIssueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIssue = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchConsumerHelp(selectedIssue);
        setIssueData(data);
      } catch (err) {
        setError(
          err.message ||
            (language !== "en"
              ? "उपभोक्ता जानकारी नहीं मिली।"
              : "Could not load consumer help information.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadIssue();
  }, [selectedIssue]);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md mb-8">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-8 h-8 text-[#2196F3]" />
        <div>
          <h2 className="text-xl text-gray-900">
            {language !== "en" ? "उपभोक्ता अधिकार" : "Consumer Rights"} / उपभोक्ता अधिकार
          </h2>
          <p className="text-gray-600 mt-1">
            {language !== "en"
              ? "अगर सामान, दवा या सेवा खराब या धोखाधड़ी वाली हो तो क्या करें।"
              : "What to do if a product, medicine, or service is defective or fraudulent."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {ISSUES.map((issue) => (
          <button
            key={issue.key}
            onClick={() => setSelectedIssue(issue.key)}
            className={`px-4 py-3 rounded-xl border ${selectedIssue === issue.key ? "bg-[#2196F3] text-white border-[#2196F3]" : "bg-[#F8FAF9] border-gray-200 text-gray-700"}`}
          >
            <div className="text-sm font-medium">
              {language !== "en" ? issue.labelHindi : issue.label}
            </div>
            <div className={`text-xs ${selectedIssue === issue.key ? "text-white/80" : "text-gray-500"}`}>{issue.labelHindi}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-xl bg-[#F8FAF9] p-4 text-gray-600">
          {language !== "en" ? "मार्गदर्शन लोड हो रहा है..." : "Loading guidance..."}
        </div>
      )}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

      {issueData && !loading && (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl bg-gradient-to-br from-[#E3F2FD] to-white p-6">
            <h3 className="text-base text-gray-900 mb-3">
              {language !== "en"
                ? issueData.issueHindi
                : issueData.issueEnglish || issueData.issueHindi}
            </h3>
            <p className="text-gray-700 mb-4">
              {language !== "en"
                ? issueData.explanationHindi
                : issueData.explanationEnglish || issueData.explanationHindi}
            </p>
            <div className="rounded-xl bg-white p-4 border border-[#2196F3]/10 mb-4">
              <div className="text-sm text-[#2196F3] mb-1">
                {language !== "en" ? "आपका अधिकार" : "Your right"} / आपका अधिकार
              </div>
              <p className="text-gray-800">
                {language !== "en"
                  ? issueData.rightsHindi
                  : issueData.rightsEnglish || issueData.rightsHindi}
              </p>
            </div>
            <div className="space-y-3">
              {(language !== "en" ? issueData.stepsHindi : issueData.stepsEnglish || issueData.stepsHindi)?.map((step, index) => (
                <div key={`${step}-${index}`} className="rounded-xl bg-white p-4 border border-gray-100 text-gray-700">
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#FFF3E0] to-white p-6 flex flex-col justify-center">
            <div className="text-sm text-[#FF7A00] mb-2">
              {language !== "en" ? "उपभोक्ता हेल्पलाइन" : "Consumer Helpline"}
            </div>
            <a href={`tel:${issueData.helpline}`} className="text-xl text-[#FF7A00] mb-4 hover:underline">
              {issueData.helpline}
            </a>
            <p className="text-gray-700">
              {language !== "en"
                ? "बिल, फोटो, रैपर, स्क्रीनशॉट और चैट रिकॉर्ड संभालकर रखें। यही आपकी शिकायत को मजबूत बनाते हैं।"
                : "Keep the bill, photos, wrapper, screenshots and chat records safe. These strengthen your complaint."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}