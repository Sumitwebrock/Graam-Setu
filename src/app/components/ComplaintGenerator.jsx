import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import { useLanguage } from "../LanguageContext";

const PROBLEM_LABELS = {
  wages_not_paid: "मजदूरी नहीं मिली",
  minimum_wage_violation: "न्यूनतम मजदूरी उल्लंघन",
  government_scheme_denied: "सरकारी योजना से वंचित",
  loan_harassment: "लोन वसूली में परेशान करना",
  land_dispute: "जमीन विवाद",
  product_fraud: "खराब या फर्जी सामान",
};

export default function ComplaintGenerator({ profile, defaultProblemType }) {
  const { language } = useLanguage();
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [district, setDistrict] = useState(profile?.district || "");
  const [problemType, setProblemType] = useState(defaultProblemType || "product_fraud");
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    if (profile?.district) {
      setDistrict(profile.district);
    }
  }, [profile?.district]);

  useEffect(() => {
    if (defaultProblemType) {
      setProblemType(defaultProblemType);
    }
  }, [defaultProblemType]);

  const complaintText = useMemo(() => {
    const today = new Date().toLocaleDateString(language !== "en" ? "hi-IN" : "en-IN");
    const problemLabel = PROBLEM_LABELS[problemType] || "कानूनी शिकायत";
    if (language !== "en") {
      return `सेवा में,\nसंबंधित अधिकारी महोदय/महोदया\nजिला: ${district || "________"}\nदिनांक: ${today}\n\nविषय: ${problemLabel} के संबंध में शिकायत\n\nमहोदय/महोदया,\nमैं ${name || "________"} निवासी जिला ${district || "________"} हूँ। मुझे ${problemLabel} से संबंधित समस्या का सामना करना पड़ रहा है। कृपया मेरी शिकायत दर्ज कर उचित कार्यवाही करें।\n\nमैंने उपलब्ध दस्तावेज और विवरण संलग्न किए हैं। कृपया मुझे शिकायत संख्या और आगे की प्रक्रिया की जानकारी दें।\n\nधन्यवाद।\n\nभवदीय,\n${name || "________"}`;
    }
    return `To,\nThe Concerned Officer\nDistrict: ${district || "________"}\nDate: ${today}\n\nSubject: Complaint regarding ${problemLabel}\n\nSir/Madam,\nI, ${name || "________"}, resident of district ${district || "________"}, am facing an issue related to ${problemLabel}. I request you to kindly register my complaint and take appropriate action.\n\nI have attached the available documents and details. Please share the complaint number and next steps with me.\n\nThank you.\n\nSincerely,\n${name || "________"}`;
  }, [district, name, problemType, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaintText);
      setCopySuccess(
        language !== "en" ? "क्लिपबोर्ड पर कॉपी हो गया।" : "Copied to clipboard."
      );
      window.setTimeout(() => setCopySuccess(""), 2000);
    } catch {
      setCopySuccess(
        language !== "en" ? "कॉपी नहीं हो सका।" : "Copy failed."
      );
      window.setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  const handleDownloadPdf = () => {
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(complaintText, 180);
    pdf.text(lines, 15, 20);
    pdf.save("vidhi-complaint-letter.pdf");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`<pre style="font-family: sans-serif; white-space: pre-wrap; padding: 24px;">${complaintText}</pre>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-8 h-8 text-[#673AB7]" />
        <div>
          <h2 className="text-xl text-gray-900">
            {language !== "en" ? "शिकायत पत्र" : "Complaint Generator"} / शिकायत पत्र
          </h2>
          <p className="text-gray-600 mt-1">
            {language !== "en"
              ? "अपनी जानकारी भरें और एक तैयार शिकायत पत्र बनाएं।"
              : "Fill your details to generate a ready-to-use complaint letter."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={language !== "en" ? "नाम" : "Name"}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#673AB7]"
        />
        <input
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder={language !== "en" ? "ज़िला" : "District"}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#673AB7]"
        />
        <select value={problemType} onChange={(e) => setProblemType(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#673AB7]">
          {Object.entries(PROBLEM_LABELS).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-[#F8FAF9] p-5 border border-gray-200 mb-5 whitespace-pre-wrap text-gray-700 min-h-[260px]">
        {complaintText}
      </div>

      {copySuccess && <div className="mb-4 rounded-xl bg-[#E8F5E9] border border-[#1B7F3A]/20 p-3 text-[#1B7F3A] text-sm">{copySuccess}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <button onClick={handleDownloadPdf} className="bg-[#673AB7] text-white py-3 rounded-xl hover:bg-[#5E35B1] transition-all flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          {language !== "en" ? "पीडीएफ डाउनलोड करें" : "Download PDF"}
        </button>
        <button onClick={handlePrint} className="bg-[#FF7A00] text-white py-3 rounded-xl hover:bg-[#e66d00] transition-all flex items-center justify-center gap-2">
          <Printer className="w-4 h-4" />
          {language !== "en" ? "प्रिंट करें" : "Print"}
        </button>
        <button onClick={handleCopy} className="bg-[#1B7F3A] text-white py-3 rounded-xl hover:bg-[#155d2b] transition-all flex items-center justify-center gap-2">
          <Copy className="w-4 h-4" />
          {language !== "en" ? "टेक्स्ट कॉपी करें" : "Copy Text"}
        </button>
      </div>
    </div>
  );
}
