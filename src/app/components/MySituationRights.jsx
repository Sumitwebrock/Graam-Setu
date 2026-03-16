import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { fetchSituationRights } from "../services/vidhiApi";
import { useLanguage } from "../LanguageContext";

const SITUATIONS = [
  { key: "wages_not_paid", label: "Wages Not Paid", labelHindi: "मजदूरी नहीं मिली" },
  { key: "minimum_wage_violation", label: "Minimum Wage Violation", labelHindi: "न्यूनतम मजदूरी से कम भुगतान" },
  { key: "government_scheme_denied", label: "Government Scheme Denied", labelHindi: "सरकारी योजना नहीं मिली" },
  { key: "loan_harassment", label: "Loan Harassment", labelHindi: "लोन में परेशान करना" },
  { key: "land_dispute", label: "Land Dispute", labelHindi: "जमीन का विवाद" },
  { key: "product_fraud", label: "Product Fraud", labelHindi: "खराब या फर्जी सामान" },
];

const ENGLISH_SUMMARIES = {
  wages_not_paid:
    "If you have worked but wages are not paid on time, you have the right to receive full payment and any pending amount.",
  minimum_wage_violation:
    "If you are paid less than the legal minimum wage for your work, you can ask for the difference and complain to labour authorities.",
  government_scheme_denied:
    "If a government scheme benefit is wrongly denied or delayed, you can ask for written reasons and file a complaint.",
  loan_harassment:
    "If loan agents or apps threaten or harass you for repayment, you can complain to authorities and cyber‑crime helplines.",
  land_dispute:
    "For boundary or ownership disputes over land, you can use land records and legal remedies to protect your rights.",
  product_fraud:
    "If a product is defective, fake or not as promised, you can demand repair, replacement or refund under consumer rights.",
};

const ENGLISH_RIGHTS = {
  wages_not_paid: "Right to receive full due wages on time for the work you have done.",
  minimum_wage_violation: "Right to at least the legal minimum wage fixed for your category of work.",
  government_scheme_denied: "Right to fair access to eligible government schemes with written reasons if rejected.",
  loan_harassment: "Right to be free from threats, abuse or illegal recovery practices while repaying a loan.",
  land_dispute: "Right to protect your lawful share in land using proper records and legal process.",
  product_fraud: "Right to safe, genuine products and to complain against fraud or cheating.",
};

const ENGLISH_STEPS = {
  wages_not_paid: [
    "Keep records of work days, attendance and wages promised.",
    "First ask the employer or contractor in writing or on WhatsApp for pending wages.",
    "If payment is still not given, complain to the labour office or Lok Seva Kendra.",
  ],
  minimum_wage_violation: [
    "Check the legal minimum wage for your category of work and state.",
    "Compare it with what you are actually paid per day or month.",
    "If it is lower, complain to the labour inspector or district labour office.",
  ],
  government_scheme_denied: [
    "Keep your application number, Aadhaar, ration card and eligibility documents together.",
    "Ask the block or scheme office for written reasons for rejection or delay.",
    "If not resolved, complain on the public grievance portal or to the district collector.",
  ],
  loan_harassment: [
    "Save call recordings, messages and screenshots of threats or abuse.",
    "Do not share extra contacts or personal documents with loan agents.",
    "Complain to the cyber‑crime or police helpline with all evidence.",
  ],
  land_dispute: [
    "Collect land records, maps and inheritance or sale documents.",
    "Do not sign blank papers or informal agreements about the land.",
    "Approach the revenue office or court with documents for proper dispute resolution.",
  ],
  product_fraud: [
    "Keep the bill, warranty card and photos or video of the defective product.",
    "Ask the shop or company in writing for repair, replacement or refund.",
    "If they refuse, complain to the consumer helpline or consumer commission.",
  ],
};

const ENGLISH_COMPLAINT_DESTINATIONS = {
  wages_not_paid: [
    "District labour office",
    "Labour inspector",
    "Lok Seva Kendra or District Legal Services Authority",
  ],
  minimum_wage_violation: [
    "District labour office",
    "Labour inspector",
    "Lok Seva Kendra or District Legal Services Authority",
  ],
  government_scheme_denied: [
    "Block development office",
    "District complaint cell",
    "Public grievance portal (CPGRAMS)",
  ],
  loan_harassment: [
    "Local police station",
    "Cyber‑crime helpline",
    "Bank or lending regulator / ombudsman",
  ],
  land_dispute: [
    "Revenue office / tehsildar",
    "Sub‑registrar office",
    "Civil court or legal aid clinic",
  ],
  product_fraud: [
    "Local consumer forum",
    "Consumer helpline 1915",
    "District consumer commission",
  ],
};

export default function MySituationRights({ defaultSituation, recommendedSituations = [], searchTerm = "", onSituationChange }) {
  const [selectedSituation, setSelectedSituation] = useState(defaultSituation || SITUATIONS[0].key);
  const [rightsData, setRightsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { language } = useLanguage();

  useEffect(() => {
    if (defaultSituation) {
      setSelectedSituation(defaultSituation);
    }
  }, [defaultSituation]);

  useEffect(() => {
    const loadRights = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchSituationRights(selectedSituation);
        setRightsData(data);
        onSituationChange?.(selectedSituation, data);
      } catch (err) {
        setError(err.message || "Could not load situation details.");
      } finally {
        setLoading(false);
      }
    };

    loadRights();
  }, [selectedSituation, onSituationChange]);

  const filteredSituations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return SITUATIONS;
    return SITUATIONS.filter((item) => `${item.label} ${item.labelHindi}`.toLowerCase().includes(query));
  }, [searchTerm]);

  const currentSituationMeta = useMemo(
    () => SITUATIONS.find((item) => item.key === selectedSituation) || SITUATIONS[0],
    [selectedSituation],
  );

  const englishSummary = ENGLISH_SUMMARIES[selectedSituation] || "This section explains your rights and next steps.";
  const englishRight = ENGLISH_RIGHTS[selectedSituation] || "Key right related to this situation.";

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md mb-8">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="w-8 h-8 text-[#d4183d]" />
        <div>
          <h2 className="text-xl text-gray-900">My Situation (मेरी स्थिति)</h2>
          <p className="text-gray-600 mt-1">Pick an issue to see your rights and next steps.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {filteredSituations.map((item) => (
          <button
            key={item.key}
            onClick={() => setSelectedSituation(item.key)}
            className={`px-4 py-3 rounded-xl border transition-all text-left ${
              item.key === selectedSituation
                ? "bg-[#673AB7] text-white border-[#673AB7]"
                : "bg-[#F8FAF9] text-gray-700 border-gray-200 hover:border-[#673AB7]"
            }`}
          >
            <div className="text-sm font-medium">{item.label}</div>
            <div className={`text-xs ${item.key === selectedSituation ? "text-white/80" : "text-gray-500"}`}>{item.labelHindi}</div>
            {recommendedSituations.includes(item.key) && (
              <div className={`mt-2 text-[11px] ${item.key === selectedSituation ? "text-[#F8EAFE]" : "text-[#673AB7]"}`}>Recommended for you</div>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="rounded-xl bg-[#F8FAF9] p-4 text-gray-600">Loading rights...</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

      {rightsData && !loading && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-gradient-to-br from-[#F3E5F5] to-white p-6 border border-[#673AB7]/10">
            <div className="mb-4">
              <h3 className="text-lg text-gray-900 mb-2">
                {currentSituationMeta.label} / {currentSituationMeta.labelHindi}
              </h3>
              {language !== "en" && rightsData.title && (
                <p className="text-sm text-gray-700 mb-1">{rightsData.title}</p>
              )}
              <p className="text-gray-800">{language !== "en" ? rightsData.explanationHindi || englishSummary : englishSummary}</p>
            </div>
            <div className="rounded-xl bg-white p-4 border border-[#673AB7]/10 mb-4">
              <div className="text-sm text-[#673AB7] mb-1">Your right / आपका अधिकार</div>
              <p className="text-gray-800">
                {language !== "en" ? rightsData.rightsHindi || englishRight : englishRight}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3 text-gray-900">
                <CheckCircle2 className="w-5 h-5 text-[#1B7F3A]" />
                <span className="text-sm font-medium">What to do / क्या करें</span>
              </div>
              <div className="space-y-3">
                {(language !== "en" && rightsData.stepsHindi?.length
                  ? rightsData.stepsHindi
                  : ENGLISH_STEPS[selectedSituation] || []
                ).map((step, index) => (
                  <div key={`${step}-${index}`} className="flex gap-3 rounded-xl bg-white p-4 border border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#1B7F3A] text-white flex items-center justify-center text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#E8F5E9] to-white p-6 border border-[#1B7F3A]/10">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
              <FileText className="w-5 h-5 text-[#1B7F3A]" />
              <span className="text-sm font-medium">Where to complain / कहाँ शिकायत करें</span>
            </div>
            <div className="space-y-3 mb-6">
              {(language !== "en" && rightsData.complaintWhereHindi?.length
                ? rightsData.complaintWhereHindi
                : ENGLISH_COMPLAINT_DESTINATIONS[selectedSituation] || []
              ).map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-xl bg-white p-4 border border-[#1B7F3A]/10 text-gray-700">
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-[#1B7F3A] text-white p-5">
              <div className="text-sm text-white/80 mb-1">Useful helpline / उपयोगी हेल्पलाइन</div>
              <a href={`tel:${rightsData.helpline || "15100"}`} className="text-xl hover:underline">
                {rightsData.helpline || "15100"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}