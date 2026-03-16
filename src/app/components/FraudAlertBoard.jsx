import { useEffect, useState } from "react";
import { AlertCircle, Shield } from "lucide-react";
import { fetchFraudAlerts, submitFraudReport } from "../services/vidhiApi";
import { useLanguage } from "../LanguageContext";

export default function FraudAlertBoard({ district, state }) {
  const { language } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    fraudType: "Loan App Fraud",
    description: "",
    district: district || "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, district: district || prev.district }));
  }, [district]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchFraudAlerts(district || formData.district || "general");
        setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.message ||
            (language !== "en"
              ? "अभी धोखाधड़ी अलर्ट उपलब्ध नहीं हैं।"
              : "Fraud alerts not available right now.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [district, formData.district]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setSuccessMessage("");
      await submitFraudReport({
        ...formData,
        district: formData.district || district || "Unknown",
        state,
      });
      setSuccessMessage(
        language !== "en"
          ? "रिपोर्ट जमा हो गई है। तुरंत मदद के लिए 1930 पर कॉल करें।"
          : "Report submitted. For urgent cases, call 1930."
      );
      setFormData((prev) => ({ ...prev, description: "" }));
      const refreshed = await fetchFraudAlerts(formData.district || district || "general");
      setAlerts(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      setError(
        err.message ||
          (language !== "en"
            ? "रिपोर्ट जमा नहीं हो सकी।"
            : "Could not submit the report.")
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-[#FF7A00]" />
        <div>
          <h2 className="text-xl text-gray-900">
            {language !== "en" ? "धोखाधड़ी चेतावनी" : "Fraud Alert Board"} / धोखाधड़ी चेतावनी
          </h2>
          <p className="text-gray-600 mt-1">
            {language !== "en"
              ? `${district || "आपके जिले"} के लिए अलर्ट देखें और रिपोर्ट दर्ज करें।`
              : `View alerts for ${district || "your district"} and submit a report.`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {loading && (
            <div className="rounded-xl bg-[#F8FAF9] p-4 text-gray-600">
              {language !== "en" ? "अलर्ट लोड हो रहे हैं..." : "Loading alerts..."}
            </div>
          )}
          {!loading && alerts.map((alert) => (
            <div key={alert.id} className={`p-5 rounded-xl border-l-4 ${alert.severity === "high" ? "bg-[#FFEBEE] border-[#d4183d]" : "bg-[#FFF3E0] border-[#FF7A00]"}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${alert.severity === "high" ? "text-[#d4183d]" : "text-[#FF7A00]"}`} />
                  <h3 className="text-base text-gray-900">{alert.fraudType}</h3>
                </div>
                <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleDateString("en-IN")}</span>
              </div>
              <p className="text-gray-700 text-sm">{alert.description}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-gradient-to-br from-[#F8FAF9] to-white p-6 border border-gray-200">
          <h3 className="text-base text-gray-900 mb-4">
            {language !== "en" ? "धोखाधड़ी रिपोर्ट" : "Fraud Report"} / रिपोर्ट भेजें
          </h3>
          <div className="space-y-4">
            <label className="block">
              <div className="text-sm text-gray-700 mb-2">
                {language !== "en" ? "धोखाधड़ी का प्रकार" : "Fraud Type"}
              </div>
              <select value={formData.fraudType} onChange={(e) => setFormData((prev) => ({ ...prev, fraudType: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#FF7A00]">
                <option>Loan App Fraud</option>
                <option>OTP Scam</option>
                <option>Scheme Enrollment Fraud</option>
                <option>Fake Job Scam</option>
              </select>
            </label>
            <label className="block">
              <div className="text-sm text-gray-700 mb-2">
                {language !== "en" ? "ज़िला" : "District"} / ज़िला
              </div>
              <input
                value={formData.district}
                onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#FF7A00]"
                placeholder={
                  language !== "en" ? "अपना जिला लिखें" : "Enter your district"
                }
              />
            </label>
            <label className="block">
              <div className="text-sm text-gray-700 mb-2">
                {language !== "en" ? "विवरण" : "Description"}
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#FF7A00]"
                placeholder={
                  language !== "en"
                    ? "क्या हुआ, कहाँ और कौन शामिल था, संक्षेप में लिखें"
                    : "What happened, where, and who was involved?"
                }
              />
            </label>
            {successMessage && <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-green-700 text-sm">{successMessage}</div>}
            {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-[#FF7A00] text-white py-3 rounded-xl hover:bg-[#e66d00] transition-all">
              {language !== "en" ? "रिपोर्ट जमा करें" : "Submit report"} / रिपोर्ट जमा करें
            </button>
            <a href="tel:1930" className="block w-full text-center bg-[#1B7F3A] text-white py-3 rounded-xl hover:bg-[#155d2b] transition-all">
              {language !== "en" ? "1930 पर कॉल करें" : "Call 1930"}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}