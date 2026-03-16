import { useState } from "react";
import { jsPDF } from "jspdf";
import { ArrowRight, ArrowLeft, Download, User, Smartphone, Home, Gift, Shield, Award, CheckCircle, TrendingUp } from "lucide-react";

export default function GraamScorePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    age: "",
    village: "",
    location: "",
    occupation: "",
    income: "",
    loanNeed: "",
    
    // Financial Data
    upiTxn: "",
    upiInflow: "",
    bills: "",
    recharge: "",
    shg: "",
    informal: "",
    
    // Assets
    land: "",
    house: "",
    livestock: "",
    savings: "",
    janDhan: "",
    pmKisan: "",
    eShram: "",

    // Financial Health
    totalMonthlyEmi: "",
    activeLoans: "",
    defaultHistory: "",
    monthlyUpiInflowAmount: "",
    bankUsed30Days: "",
    aadhaarLinkedBank: "",
    loanPurpose: "",
    incomeType: "",
    peakMonthlyIncome: "",
    leanMonthIncome: ""
  });

  const [finalScore, setFinalScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({});
  const [tierInfo, setTierInfo] = useState({});
  const [financialMetrics, setFinancialMetrics] = useState({
    foir: 0,
    maxAdditionalEmi: 0,
    estimatedLoanCeiling: 0,
    totalExistingEmi: 0,
    activeLoans: "",
    defaultHistory: ""
  });
  const [stepErrors, setStepErrors] = useState({});
  const [step4Errors, setStep4Errors] = useState({});

  const step1Fields = ["name", "age", "village", "location", "occupation", "income", "loanNeed"];
  const step2Fields = ["upiTxn", "upiInflow", "bills", "recharge", "shg", "informal"];
  const step3Fields = ["land", "house", "livestock", "savings", "janDhan", "pmKisan", "eShram"];

  const fieldLabels = {
    name: "Full Name",
    age: "Age",
    village: "Village / Town",
    location: "District & State",
    occupation: "Primary Occupation",
    income: "Monthly Income",
    loanNeed: "Loan Amount Needed",
    upiTxn: "Monthly UPI Transactions",
    upiInflow: "Average Monthly UPI Inflow",
    bills: "Electricity / Water Bills",
    recharge: "Mobile Recharge Frequency",
    shg: "SHG Membership",
    informal: "Informal Loan Repayment Record",
    land: "Land Ownership",
    house: "Type of House",
    livestock: "Livestock Ownership",
    savings: "Savings / Bank Balance",
    janDhan: "Jan Dhan Account",
    pmKisan: "PM Kisan / MGNREGA",
    eShram: "e-Shram / Aadhaar-linked Bank Account"
  };

  // Sample Profiles
  const samples = {
    ramesh: {
      name: 'Ramesh Kumar', age: 42, village: 'Kurud', location: 'Dhamtari, Chhattisgarh',
      income: 22000, loanNeed: 75000, occupation: 'farmer',
      upiTxn: '2', upiInflow: '2', bills: '3', recharge: '1',
      shg: '1', informal: '3',
      land: '2', house: '1', livestock: '2', savings: '1',
      janDhan: '2', pmKisan: '2', eShram: '1',
      totalMonthlyEmi: '3500', activeLoans: '2', defaultHistory: 'no',
      monthlyUpiInflowAmount: '22000', bankUsed30Days: 'yes', aadhaarLinkedBank: 'yes',
      loanPurpose: 'agriculture', incomeType: 'regular', peakMonthlyIncome: '', leanMonthIncome: ''
    },
    priya: {
      name: 'Priya Devi', age: 34, village: 'Rajim', location: 'Gariaband, Chhattisgarh',
      income: 15000, loanNeed: 30000, occupation: 'vendor',
      upiTxn: '3', upiInflow: '1', bills: '2', recharge: '2',
      shg: '3', informal: '3',
      land: '0', house: '1', livestock: '0', savings: '1',
      janDhan: '2', pmKisan: '0', eShram: '2',
      totalMonthlyEmi: '1800', activeLoans: '1', defaultHistory: 'minor',
      monthlyUpiInflowAmount: '14000', bankUsed30Days: 'yes', aadhaarLinkedBank: 'yes',
      loanPurpose: 'business', incomeType: 'daily_wage', peakMonthlyIncome: '', leanMonthIncome: ''
    },
    arjun: {
      name: 'Arjun Sahu', age: 28, village: 'Bilaspur', location: 'Bilaspur, Chhattisgarh',
      income: 12000, loanNeed: 20000, occupation: 'artisan',
      upiTxn: '1', upiInflow: '1', bills: '1', recharge: '1',
      shg: '0', informal: '2',
      land: '0', house: '0', livestock: '0', savings: '0',
      janDhan: '1', pmKisan: '0', eShram: '1',
      totalMonthlyEmi: '1000', activeLoans: 'none', defaultHistory: 'no',
      monthlyUpiInflowAmount: '8000', bankUsed30Days: 'yes', aadhaarLinkedBank: 'no',
      loanPurpose: 'education', incomeType: 'irregular', peakMonthlyIncome: '', leanMonthIncome: ''
    }
  };

  const fillSample = (key) => {
    setFormData(samples[key]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setStepErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setStep4Errors((prev) => {
      if (!prev[field] && !(field === "incomeType" && prev.peakMonthlyIncome) && !(field === "incomeType" && prev.leanMonthIncome)) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      if (field === "incomeType" && value !== "seasonal") {
        delete next.peakMonthlyIncome;
        delete next.leanMonthIncome;
      }
      return next;
    });
  };

  const toAmount = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const formatCurrency = (amount) => `₹${Math.max(0, Math.round(amount)).toLocaleString('en-IN')}`;

  const validateRequiredFields = (fields) => {
    const errors = {};
    fields.forEach((field) => {
      if (!String(formData[field] || "").trim()) {
        errors[field] = "This field is required";
      }
    });
    return errors;
  };

  const validateStep1 = () => {
    const errors = validateRequiredFields(step1Fields);

    if (String(formData.age || "").trim() && Number(formData.age) <= 0) {
      errors.age = "Age must be greater than 0";
    }
    if (String(formData.income || "").trim() && Number(formData.income) <= 0) {
      errors.income = "Monthly income must be greater than 0";
    }
    if (String(formData.loanNeed || "").trim() && Number(formData.loanNeed) <= 0) {
      errors.loanNeed = "Loan amount must be greater than 0";
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = validateRequiredFields(step2Fields);
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = validateRequiredFields(step3Fields);
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const hasErrorsForFields = (fields) => fields.some((field) => Boolean(stepErrors[field]));

  const getMissingFieldsSummary = (fields) => {
    const missingLabels = fields
      .filter((field) => stepErrors[field])
      .map((field) => fieldLabels[field] || field);
    return missingLabels.join(", ");
  };

  const handleStep1Next = () => {
    if (!validateStep1()) {
      return;
    }
    setStepErrors({});
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    if (!validateStep2()) {
      return;
    }
    setStepErrors({});
    setCurrentStep(3);
  };

  const handleStep3Next = () => {
    if (!validateStep3()) {
      return;
    }
    setStepErrors({});
    setCurrentStep(4);
  };

  const validateStep4 = () => {
    const errors = {};
    const requiredFields = [
      "totalMonthlyEmi",
      "activeLoans",
      "defaultHistory",
      "monthlyUpiInflowAmount",
      "bankUsed30Days",
      "aadhaarLinkedBank",
      "loanPurpose",
      "incomeType"
    ];

    requiredFields.forEach((field) => {
      if (!String(formData[field] || "").trim()) {
        errors[field] = "This field is required";
      }
    });

    if (String(formData.totalMonthlyEmi || "").trim() && Number(formData.totalMonthlyEmi) < 0) {
      errors.totalMonthlyEmi = "EMI cannot be negative";
    }

    if (String(formData.monthlyUpiInflowAmount || "").trim() && Number(formData.monthlyUpiInflowAmount) < 0) {
      errors.monthlyUpiInflowAmount = "UPI inflow cannot be negative";
    }

    if (formData.incomeType === "seasonal") {
      if (!String(formData.peakMonthlyIncome || "").trim()) {
        errors.peakMonthlyIncome = "Peak monthly income is required for seasonal income";
      }
      if (!String(formData.leanMonthIncome || "").trim()) {
        errors.leanMonthIncome = "Lean month income is required for seasonal income";
      }
      if (String(formData.peakMonthlyIncome || "").trim() && Number(formData.peakMonthlyIncome) < 0) {
        errors.peakMonthlyIncome = "Peak monthly income cannot be negative";
      }
      if (String(formData.leanMonthIncome || "").trim() && Number(formData.leanMonthIncome) < 0) {
        errors.leanMonthIncome = "Lean month income cannot be negative";
      }
    }

    setStep4Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateScore = () => {
    if (!validateStep4()) {
      return;
    }
    setStepErrors({});
    calculateScore();
  };

  const getTier = (score) => {
    if (score >= 75) return { 
      label: 'PRIME', 
      color: '#1B7F3A', 
      bg: '#E8F5E9', 
      desc: 'Excellent credit profile. Eligible for best rates and maximum loan amounts from partner NBFCs.' 
    };
    if (score >= 50) return { 
      label: 'STANDARD', 
      color: '#F5A623', 
      bg: '#FFF3E0', 
      desc: 'Good credit profile. Eligible for most microfinance products with standard interest rates.' 
    };
    if (score >= 25) return { 
      label: 'DEVELOPING', 
      color: '#FF9800', 
      bg: '#FFF3E0', 
      desc: 'Building credit profile. Eligible for smaller loans with guarantor or collateral.' 
    };
    return { 
      label: 'BUILDING', 
      color: '#C1440E', 
      bg: '#FDF4E3', 
      desc: 'Early stage. Follow the roadmap below to build your credit profile within 3–6 months.' 
    };
  };

  const calculateScore = () => {
    const get = (field) => parseInt(formData[field] || 0);

    // UPI Behaviour (25 pts)
    const upiScore = (get('upiTxn') === 3 ? 15 : get('upiTxn') === 2 ? 10 : get('upiTxn') === 1 ? 5 : 0)
                   + (get('upiInflow') === 3 ? 10 : get('upiInflow') === 2 ? 7 : get('upiInflow') === 1 ? 3 : 0);

    // Bill Payment (20 pts)
    const billScore = (get('bills') === 3 ? 14 : get('bills') === 2 ? 9 : get('bills') === 1 ? 4 : 0)
                    + (get('recharge') === 2 ? 6 : get('recharge') === 1 ? 3 : 0);

    // SHG & Community (20 pts)
    const shgScore = (get('shg') === 3 ? 13 : get('shg') === 2 ? 8 : get('shg') === 1 ? 4 : 0)
                   + (get('informal') === 3 ? 7 : get('informal') === 2 ? 4 : get('informal') === 1 ? 1 : 0);

    // Assets (20 pts)
    const assetScore = (get('land') === 3 ? 8 : get('land') === 2 ? 5 : get('land') === 1 ? 2 : 0)
                     + (get('house') === 2 ? 5 : get('house') === 1 ? 2 : 0)
                     + (get('livestock') === 2 ? 4 : get('livestock') === 1 ? 2 : 0)
                     + (get('savings') === 2 ? 3 : get('savings') === 1 ? 1 : 0);

    // Government Participation (15 pts)
    const govScore = (get('janDhan') === 2 ? 5 : get('janDhan') === 1 ? 2 : 0)
                   + (get('pmKisan') === 2 ? 5 : 0)
                   + (get('eShram') === 2 ? 5 : get('eShram') === 1 ? 3 : 0);

    // Repayment Capacity (30 bonus pts)
    const monthlyIncome = toAmount(formData.income);
    const totalExistingEmi = toAmount(formData.totalMonthlyEmi);
    const foirRaw = monthlyIncome > 0 ? (totalExistingEmi / monthlyIncome) * 100 : (totalExistingEmi > 0 ? 100 : 0);

    const foirScore = foirRaw < 20 ? 12 : foirRaw <= 35 ? 9 : foirRaw <= 50 ? 5 : 0;
    const defaultScore = formData.defaultHistory === 'no' ? 10 : formData.defaultHistory === 'minor' ? 5 : 0;
    const activeLoansScore = (formData.activeLoans === 'none' || formData.activeLoans === '1')
      ? 8
      : formData.activeLoans === '2'
        ? 5
        : formData.activeLoans === '3'
          ? 2
          : 0;

    const repaymentScore = foirScore + defaultScore + activeLoansScore;

    const baseTotal = upiScore + billScore + shgScore + assetScore + govScore;
    const rawTotal = Math.min(130, baseTotal + repaymentScore);
    let normalizedScore = Math.round((rawTotal / 130) * 100);

    if (formData.defaultHistory === 'yes') {
      normalizedScore = Math.min(normalizedScore, 35);
    }

    const maxAdditionalEmi = Math.max(0, (monthlyIncome * 0.5) - totalExistingEmi);
    const estimatedLoanCeiling = maxAdditionalEmi * 24;
    const foir = Math.round(foirRaw);

    setScoreBreakdown({
      'UPI Behaviour': { score: upiScore, max: 25 },
      'Bill Discipline': { score: billScore, max: 20 },
      'SHG & Community': { score: shgScore, max: 20 },
      'Asset Base': { score: assetScore, max: 20 },
      'Govt. Schemes': { score: govScore, max: 15 },
      'Repayment Capacity': { score: repaymentScore, max: 30 }
    });

    setFinancialMetrics({
      foir,
      maxAdditionalEmi,
      estimatedLoanCeiling,
      totalExistingEmi,
      activeLoans: formData.activeLoans,
      defaultHistory: formData.defaultHistory
    });

    const tier = getTier(normalizedScore);

    setFinalScore(normalizedScore);
    setTierInfo(tier);
    setCurrentStep(5);

    try {
      const phone = typeof window !== "undefined" ? window.verifiedMobile : null;
      if (typeof phone === "string" && /^\d{10}$/.test(phone)) {
        const applicantName = formData.name || "Applicant";
        fetch("/api/notify/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            name: applicantName,
            score: normalizedScore,
            tier: tier.label,
          }),
        }).catch(() => {
          // Swallow notification errors to avoid breaking UI
        });
      }
    } catch {
      // Ignore any unexpected errors from notification hook
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('en-IN');
    const applicantName = formData.name || 'Applicant';

    let y = 20;
    doc.setFontSize(20);
    doc.text('GraamScore Credit Report', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Date: ${date}`, 14, y);
    y += 7;
    doc.text(`Applicant: ${applicantName}`, 14, y);
    y += 7;
    doc.text(`Location: ${formData.village || '-'}, ${formData.location || '-'}`, 14, y);
    y += 12;

    doc.setFontSize(14);
    doc.text(`GraamScore: ${finalScore}/100 (${tierInfo.label || '-'})`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Financial Health Metrics', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`FOIR: ${financialMetrics.foir}%`, 14, y);
    y += 6;
    doc.text(`Max Additional EMI: ${formatCurrency(financialMetrics.maxAdditionalEmi)}`, 14, y);
    y += 6;
    doc.text(`Estimated Loan Ceiling (24 months): ${formatCurrency(financialMetrics.estimatedLoanCeiling)}`, 14, y);
    y += 6;
    doc.text(`Default History: ${formData.defaultHistory === 'no' ? 'No defaults' : formData.defaultHistory === 'minor' ? 'Minor delays (1-2 times)' : 'Defaulted'}`, 14, y);
    y += 6;
    doc.text(`Active Loans: ${formData.activeLoans === 'none' ? 'None' : formData.activeLoans === '4plus' ? '4 or more' : formData.activeLoans || '-'}`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Score Breakdown', 14, y);
    y += 8;
    doc.setFontSize(10);

    Object.entries(scoreBreakdown).forEach(([label, { score, max }]) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${label}: ${score}/${max}`, 14, y);
      y += 6;
    });

    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    y += 6;
    doc.setFontSize(9);
    doc.text('Scored under RBI Microfinance Framework 2022 | MFIN Guidelines Compliant', 14, y);

    doc.save(`GraamScore_${applicantName.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
  };

  const getLoanEligibility = (score) => {
    return [
      { name: 'MUDRA Shishu', amount: 50000, rate: 8.5, tenure: '3 years', eligible: score >= 30 },
      { name: 'MUDRA Kishore', amount: 500000, rate: 10, tenure: '5 years', eligible: score >= 50 },
      { name: 'PM SVANidhi', amount: 50000, rate: 7, tenure: '1 year', eligible: score >= 25 },
      { name: 'Kisan Credit Card', amount: 300000, rate: 7, tenure: 'Revolving', eligible: score >= 45 },
      { name: 'NABARD SHG Linkage', amount: 200000, rate: 9, tenure: '3 years', eligible: score >= 40 },
      { name: 'Stand-Up India', amount: 1000000, rate: 8, tenure: '7 years', eligible: score >= 60 }
    ];
  };

  const getRoadmap = (breakdown) => {
    const suggestions = [];
    
    if (breakdown['UPI Behaviour']?.score < 15) {
      suggestions.push({
        icon: '📱',
        action: 'Increase UPI transactions to 50+ per month',
        gain: 10,
        time: '2 months'
      });
    }
    
    if (breakdown['Bill Discipline']?.score < 14) {
      suggestions.push({
        icon: '💡',
        action: 'Pay electricity & water bills on time for 12 months',
        gain: 8,
        time: '1 year'
      });
    }
    
    if (breakdown['SHG & Community']?.score < 13) {
      suggestions.push({
        icon: '👥',
        action: 'Join a Self Help Group with perfect repayment record',
        gain: 13,
        time: '6 months'
      });
    }
    
    if (breakdown['Asset Base']?.score < 12) {
      suggestions.push({
        icon: '🏡',
        action: 'Build savings above ₹10,000',
        gain: 5,
        time: '3 months'
      });
    }
    
    if (breakdown['Govt. Schemes']?.score < 10) {
      suggestions.push({
        icon: '🏛️',
        action: 'Register for e-Shram and link Aadhaar to bank account',
        gain: 5,
        time: '1 month'
      });
    }
    
    return suggestions;
  };

  const occupationEmoji = {
    farmer: '🧑‍🌾',
    vendor: '🛒',
    artisan: '🪡',
    daily_wage: '🔨',
    small_shop: '🏪'
  };

  const resetForm = () => {
    setFormData({
      name: "", age: "", village: "", location: "", occupation: "", income: "", loanNeed: "",
      upiTxn: "", upiInflow: "", bills: "", recharge: "", shg: "", informal: "",
      land: "", house: "", livestock: "", savings: "", janDhan: "", pmKisan: "", eShram: "",
      totalMonthlyEmi: "", activeLoans: "", defaultHistory: "", monthlyUpiInflowAmount: "",
      bankUsed30Days: "", aadhaarLinkedBank: "", loanPurpose: "", incomeType: "", peakMonthlyIncome: "", leanMonthIncome: ""
    });
    setCurrentStep(1);
    setFinalScore(0);
    setScoreBreakdown({});
    setTierInfo({});
    setStepErrors({});
    setStep4Errors({});
    setFinancialMetrics({
      foir: 0,
      maxAdditionalEmi: 0,
      estimatedLoanCeiling: 0,
      totalExistingEmi: 0,
      activeLoans: "",
      defaultHistory: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF4E3] to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#C1440E] to-[#F5A623] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-sm">
            🌾 Rural Credit Intelligence Platform
          </div>
          <h1 className="text-4xl md:text-6xl mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            GraamScore
          </h1>
          <p className="text-2xl md:text-3xl mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            ग्राम स्कोर
          </p>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Alternative credit scoring for rural India — Building credit identity for the 190 million Indians invisible to traditional banking
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-5xl mb-2" style={{ fontFamily: 'Georgia, serif' }}>190M+</div>
              <div className="text-sm text-white/80">Credit Invisible Indians</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl mb-2" style={{ fontFamily: 'Georgia, serif' }}>₹20L Cr</div>
              <div className="text-sm text-white/80">Unmet Rural Credit Gap</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl mb-2" style={{ fontFamily: 'Georgia, serif' }}>48%</div>
              <div className="text-sm text-white/80">Moneylender Interest Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* RBI Badge */}
        <div className="bg-white border-2 border-[#F5A623] rounded-2xl p-4 mb-8 flex items-start gap-3 shadow-md">
          <Shield className="w-6 h-6 text-[#C1440E] flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-700">
            <strong className="text-[#C1440E]">RBI Account Aggregator Framework:</strong> All data is consent-based. We use alternative signals banks ignore — UPI, bills, SHG records — to build your credit identity.
          </div>
        </div>

        {/* Steps Progress Bar */}
        {currentStep < 5 && (
          <div className="flex justify-center gap-0 mb-12 bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md">
            {[
              { num: '01', label: 'Profile', icon: User },
              { num: '02', label: 'Financial', icon: Smartphone },
              { num: '03', label: 'Assets', icon: Home },
              { num: '04', label: 'Health', icon: Shield }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className={`flex-1 text-center py-5 px-3 border-r-2 border-gray-200 last:border-r-0 transition-all ${
                    currentStep === idx + 1 ? 'bg-[#FDF4E3] text-[#C1440E]' : 
                    currentStep > idx + 1 ? 'bg-gray-50 text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-xl mb-1" style={{ fontFamily: 'Georgia, serif' }}>{step.num}</div>
                  <div className="text-xs md:text-sm font-medium">{step.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Personal Details</h2>
              </div>
              <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                व्यक्तिगत विवरण
              </p>

              {hasErrorsForFields(step1Fields) && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700">
                  Please fill all required fields to generate an accurate score.
                  <div className="mt-1">Missing: {getMissingFieldsSummary(step1Fields)}</div>
                </div>
              )}

              {/* Sample Profiles */}
              <div className="mb-8">
                <div className="text-sm font-medium text-gray-700 mb-3">Quick Fill — Try a Sample Profile</div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => fillSample('ramesh')} className="px-5 py-3 bg-[#FDF4E3] border-2 border-[#F5A623] rounded-xl text-sm text-gray-700 hover:bg-[#F5A623] hover:text-white transition-all font-medium">
                    🧑‍🌾 Ramesh (Farmer)
                  </button>
                  <button onClick={() => fillSample('priya')} className="px-5 py-3 bg-[#FDF4E3] border-2 border-[#F5A623] rounded-xl text-sm text-gray-700 hover:bg-[#F5A623] hover:text-white transition-all font-medium">
                    👩 Priya (Vendor)
                  </button>
                  <button onClick={() => fillSample('arjun')} className="px-5 py-3 bg-[#FDF4E3] border-2 border-[#F5A623] rounded-xl text-sm text-gray-700 hover:bg-[#F5A623] hover:text-white transition-all font-medium">
                    👨 Arjun (Artisan)
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none focus:ring-2 focus:ring-[#C1440E]/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="e.g. 38"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none focus:ring-2 focus:ring-[#C1440E]/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Village / Town</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                    placeholder="e.g. Kurud"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none focus:ring-2 focus:ring-[#C1440E]/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">District & State</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. Dhamtari, Chhattisgarh"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none focus:ring-2 focus:ring-[#C1440E]/20"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-700">Primary Occupation</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'farmer', label: '🌾 Farmer' },
                      { value: 'vendor', label: '🛒 Street Vendor' },
                      { value: 'artisan', label: '🪡 Artisan' },
                      { value: 'daily_wage', label: '🔨 Daily Wage' },
                      { value: 'small_shop', label: '🏪 Small Shop' }
                    ].map(occ => (
                      <button
                        key={occ.value}
                        onClick={() => handleInputChange('occupation', occ.value)}
                        className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.occupation === occ.value
                            ? 'border-[#C1440E] bg-[#C1440E] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#F5A623]'
                        }`}
                      >
                        {occ.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={formData.income}
                    onChange={(e) => handleInputChange('income', e.target.value)}
                    placeholder="e.g. 18000"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none focus:ring-2 focus:ring-[#C1440E]/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Loan Amount Needed (₹)</label>
                  <input
                    type="number"
                    value={formData.loanNeed}
                    onChange={(e) => handleInputChange('loanNeed', e.target.value)}
                    placeholder="e.g. 50000"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none focus:ring-2 focus:ring-[#C1440E]/20"
                  />
                </div>
              </div>

              <button
                onClick={handleStep1Next}
                className="w-full mt-10 bg-gradient-to-r from-[#C1440E] to-[#F5A623] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Continue to Financial Data
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Financial Data */}
        {currentStep === 2 && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>UPI & Payment Behaviour</h2>
              </div>
              <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                वित्तीय व्यवहार डेटा
              </p>

              {hasErrorsForFields(step2Fields) && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700">
                  Please fill all required fields to generate an accurate score.
                  <div className="mt-1">Missing: {getMissingFieldsSummary(step2Fields)}</div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Monthly UPI Transactions (count)</label>
                  <select
                    value={formData.upiTxn}
                    onChange={(e) => handleInputChange('upiTxn', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select range</option>
                    <option value="3">50+ transactions/month</option>
                    <option value="2">20–50 transactions/month</option>
                    <option value="1">Under 20/month</option>
                    <option value="0">No UPI account</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Average Monthly UPI Inflow (₹)</label>
                  <select
                    value={formData.upiInflow}
                    onChange={(e) => handleInputChange('upiInflow', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select range</option>
                    <option value="3">Above ₹20,000</option>
                    <option value="2">₹8,000 – ₹20,000</option>
                    <option value="1">₹2,000 – ₹8,000</option>
                    <option value="0">Below ₹2,000</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent"></div>
                  <span className="text-sm font-bold text-[#C1440E]" style={{ fontFamily: 'Georgia, serif' }}>Bill Payment History</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent"></div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Electricity / Water Bills Paid On Time (last 12 months)</label>
                  <select
                    value={formData.bills}
                    onChange={(e) => handleInputChange('bills', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="3">10–12 months on time</option>
                    <option value="2">7–9 months on time</option>
                    <option value="1">4–6 months on time</option>
                    <option value="0">Less than 4 months</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Mobile Recharge Frequency</label>
                  <select
                    value={formData.recharge}
                    onChange={(e) => handleInputChange('recharge', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="2">Weekly or prepaid auto-renew</option>
                    <option value="1">Monthly</option>
                    <option value="0">Irregular</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent"></div>
                  <span className="text-sm font-bold text-[#C1440E]" style={{ fontFamily: 'Georgia, serif' }}>SHG & Community Finance</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent"></div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Self Help Group (SHG) Membership</label>
                  <select
                    value={formData.shg}
                    onChange={(e) => handleInputChange('shg', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="3">Active member, perfect repayment</option>
                    <option value="2">Active member, minor delays</option>
                    <option value="1">Former member</option>
                    <option value="0">Not a member</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Informal Loans — Repayment Record</label>
                  <select
                    value={formData.informal}
                    onChange={(e) => handleInputChange('informal', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="3">Always repaid on time</option>
                    <option value="2">Occasional delays</option>
                    <option value="1">Frequent delays</option>
                    <option value="0">Defaults / never repaid</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-10">
                <button
                  onClick={handleStep2Next}
                  className="flex-1 bg-gradient-to-r from-[#C1440E] to-[#F5A623] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Continue to Asset Profile
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full mt-3 bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:border-[#C1440E] hover:text-[#C1440E] transition-all flex items-center justify-center gap-2 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assets */}
        {currentStep === 3 && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Asset Profile</h2>
              </div>
              <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                संपत्ति प्रोफ़ाइल
              </p>

              {hasErrorsForFields(step3Fields) && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700">
                  Please fill all required fields to generate an accurate score.
                  <div className="mt-1">Missing: {getMissingFieldsSummary(step3Fields)}</div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Land Ownership</label>
                  <select
                    value={formData.land}
                    onChange={(e) => handleInputChange('land', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="3">Owns 2+ acres</option>
                    <option value="2">Owns less than 2 acres</option>
                    <option value="1">Leased / rented farmland</option>
                    <option value="0">No land</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Type of House</label>
                  <select
                    value={formData.house}
                    onChange={(e) => handleInputChange('house', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="2">Pucca (permanent structure)</option>
                    <option value="1">Semi-pucca</option>
                    <option value="0">Kachha / temporary</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Livestock Ownership</label>
                  <select
                    value={formData.livestock}
                    onChange={(e) => handleInputChange('livestock', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="2">Owns cattle / poultry (income-generating)</option>
                    <option value="1">Small livestock (personal use)</option>
                    <option value="0">None</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Savings / Bank Balance</label>
                  <select
                    value={formData.savings}
                    onChange={(e) => handleInputChange('savings', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="2">Above ₹10,000</option>
                    <option value="1">₹1,000 – ₹10,000</option>
                    <option value="0">Below ₹1,000</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent"></div>
                  <span className="text-sm font-bold text-[#C1440E]" style={{ fontFamily: 'Georgia, serif' }}>Government Scheme Participation</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent"></div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Jan Dhan Account</label>
                  <select
                    value={formData.janDhan}
                    onChange={(e) => handleInputChange('janDhan', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="2">Yes, actively used</option>
                    <option value="1">Yes, dormant</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">PM Kisan / MGNREGA Beneficiary</label>
                  <select
                    value={formData.pmKisan}
                    onChange={(e) => handleInputChange('pmKisan', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="2">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">e-Shram / Aadhaar-linked Bank Account</label>
                  <select
                    value={formData.eShram}
                    onChange={(e) => handleInputChange('eShram', e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="2">Both e-Shram registered + Aadhaar-linked account</option>
                    <option value="1">Only Aadhaar-linked account</option>
                    <option value="0">Neither</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-10">
                <button
                  onClick={handleStep3Next}
                  className="flex-1 bg-gradient-to-r from-[#C1440E] to-[#F5A623] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Continue to Financial Health
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full mt-3 bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:border-[#C1440E] hover:text-[#C1440E] transition-all flex items-center justify-center gap-2 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Financial Health */}
        {currentStep === 4 && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Financial Health</h2>
              </div>
              <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                Helps banks assess your repayment capacity
              </p>

              {Object.keys(step4Errors).length > 0 && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700">
                  Please fill all required Financial Health fields to generate an accurate score.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Total Existing Monthly EMI (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalMonthlyEmi}
                    onChange={(e) => handleInputChange('totalMonthlyEmi', e.target.value)}
                    placeholder="e.g. 3500"
                    className={`bg-white border-2 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none ${step4Errors.totalMonthlyEmi ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  <div className="text-xs text-gray-500">Add all loan repayments — SHG, MFI, bank, moneylender combined</div>
                  {step4Errors.totalMonthlyEmi && <div className="text-xs text-red-600">{step4Errors.totalMonthlyEmi}</div>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Number of Active Loans</label>
                  <select
                    value={formData.activeLoans}
                    onChange={(e) => handleInputChange('activeLoans', e.target.value)}
                    className={`bg-white border-2 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none ${step4Errors.activeLoans ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">Select</option>
                    <option value="none">None</option>
                    <option value="1">1 loan</option>
                    <option value="2">2 loans</option>
                    <option value="3">3 loans</option>
                    <option value="4plus">4 or more</option>
                  </select>
                  {step4Errors.activeLoans && <div className="text-xs text-red-600">{step4Errors.activeLoans}</div>}
                </div>

                <div className="md:col-span-2 flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-700">Any loan default or serious delay in last 24 months</label>
                  <div className={`flex flex-wrap gap-3 ${step4Errors.defaultHistory ? 'rounded-xl border-2 border-red-300 p-3' : ''}`}>
                    {[
                      { value: 'no', label: 'No (never)' },
                      { value: 'minor', label: 'Minor delays (1–2 times)' },
                      { value: 'yes', label: 'Yes (defaulted)' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleInputChange('defaultHistory', opt.value)}
                        className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.defaultHistory === opt.value
                            ? 'border-[#C1440E] bg-[#C1440E] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#F5A623]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {step4Errors.defaultHistory && <div className="text-xs text-red-600">{step4Errors.defaultHistory}</div>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Monthly UPI Inflow Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyUpiInflowAmount}
                    onChange={(e) => handleInputChange('monthlyUpiInflowAmount', e.target.value)}
                    placeholder="e.g. 18000"
                    className={`bg-white border-2 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none ${step4Errors.monthlyUpiInflowAmount ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  <div className="text-xs text-gray-500">Actual money received in your bank account via UPI per month</div>
                  {step4Errors.monthlyUpiInflowAmount && <div className="text-xs text-red-600">{step4Errors.monthlyUpiInflowAmount}</div>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Bank account actively used in last 30 days</label>
                  <div className={`flex gap-3 ${step4Errors.bankUsed30Days ? 'rounded-xl border-2 border-red-300 p-3' : ''}`}>
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleInputChange('bankUsed30Days', opt.value)}
                        className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.bankUsed30Days === opt.value
                            ? 'border-[#C1440E] bg-[#C1440E] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#F5A623]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {step4Errors.bankUsed30Days && <div className="text-xs text-red-600">{step4Errors.bankUsed30Days}</div>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Aadhaar-linked bank account</label>
                  <div className={`flex gap-3 ${step4Errors.aadhaarLinkedBank ? 'rounded-xl border-2 border-red-300 p-3' : ''}`}>
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleInputChange('aadhaarLinkedBank', opt.value)}
                        className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.aadhaarLinkedBank === opt.value
                            ? 'border-[#C1440E] bg-[#C1440E] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#F5A623]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {step4Errors.aadhaarLinkedBank && <div className="text-xs text-red-600">{step4Errors.aadhaarLinkedBank}</div>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Loan Purpose</label>
                  <select
                    value={formData.loanPurpose}
                    onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                    className={`bg-white border-2 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none ${step4Errors.loanPurpose ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">Select purpose</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical emergency</option>
                    <option value="home_repair">Home repair</option>
                    <option value="other">Other</option>
                  </select>
                  {step4Errors.loanPurpose && <div className="text-xs text-red-600">{step4Errors.loanPurpose}</div>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Income Type</label>
                  <select
                    value={formData.incomeType}
                    onChange={(e) => handleInputChange('incomeType', e.target.value)}
                    className={`bg-white border-2 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none ${step4Errors.incomeType ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">Select type</option>
                    <option value="regular">Regular monthly</option>
                    <option value="seasonal">Seasonal (harvest-based)</option>
                    <option value="daily_wage">Daily wage</option>
                    <option value="irregular">Irregular</option>
                  </select>
                  {step4Errors.incomeType && <div className="text-xs text-red-600">{step4Errors.incomeType}</div>}
                </div>

                {formData.incomeType === 'seasonal' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Peak monthly income (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.peakMonthlyIncome}
                        onChange={(e) => handleInputChange('peakMonthlyIncome', e.target.value)}
                        placeholder="e.g. 45000"
                        className={`bg-white border-2 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none ${step4Errors.peakMonthlyIncome ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      <div className="text-xs text-gray-500">Your highest earning month — for farmers this is harvest season</div>
                      {step4Errors.peakMonthlyIncome && <div className="text-xs text-red-600">{step4Errors.peakMonthlyIncome}</div>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Lean month income (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.leanMonthIncome}
                        onChange={(e) => handleInputChange('leanMonthIncome', e.target.value)}
                        placeholder="e.g. 9000"
                        className={`bg-white border-2 rounded-xl px-4 py-3 text-gray-900 focus:border-[#C1440E] focus:outline-none ${step4Errors.leanMonthIncome ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      <div className="text-xs text-gray-500">Your lowest earning month income</div>
                      {step4Errors.leanMonthIncome && <div className="text-xs text-red-600">{step4Errors.leanMonthIncome}</div>}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-10">
                <button
                  onClick={handleGenerateScore}
                  className="flex-1 bg-gradient-to-r from-[#C1440E] to-[#F5A623] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  ⚡ Generate My GraamScore
                  <TrendingUp className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setCurrentStep(3)}
                className="w-full mt-3 bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:border-[#C1440E] hover:text-[#C1440E] transition-all flex items-center justify-center gap-2 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {currentStep === 5 && (
          <div className="animate-fadeIn space-y-8">
            {/* Score Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-full flex items-center justify-center text-3xl">
                  {occupationEmoji[formData.occupation] || '👤'}
                </div>
                <div>
                  <div className="text-2xl mb-1 text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>{formData.name}</div>
                  <div className="text-sm text-gray-600">📍 {formData.village}, {formData.location}</div>
                  <div className="text-sm text-gray-500 mt-1">Loan Request: ₹{Number(formData.loanNeed || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Score Display */}
              <div className="text-center py-8">
                <div className="relative w-56 h-56 mx-auto mb-8">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
                    <circle cx="100" cy="100" r="85" fill="none" stroke="#f0f0f0" strokeWidth="14" />
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke={tierInfo.color || '#C1440E'}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray="534"
                      strokeDashoffset={534 - (534 * finalScore) / 100}
                      style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2" style={{ fontFamily: 'Georgia, serif', color: tierInfo.color }}>{finalScore}</div>
                      <div className="text-sm text-gray-500 font-medium">GraamScore</div>
                    </div>
                  </div>
                </div>

                <div
                  className="inline-block px-8 py-3 rounded-full mb-4 text-xl font-bold shadow-md"
                  style={{
                    fontFamily: 'Georgia, serif',
                    background: tierInfo.bg,
                    color: tierInfo.color,
                    border: `2px solid ${tierInfo.color}`
                  }}
                >
                  {tierInfo.label}
                </div>
                <p className="text-base text-gray-600 max-w-lg mx-auto leading-relaxed">{tierInfo.desc}</p>
              </div>

              {/* Financial Health Cards */}
              <div className="grid md:grid-cols-3 gap-5 mb-8">
                <div className="bg-gradient-to-br from-white to-[#FDF4E3] border-2 rounded-2xl p-5" style={{
                  borderColor: financialMetrics.foir < 30 ? '#1B7F3A' : financialMetrics.foir <= 50 ? '#F5A623' : '#C1440E'
                }}>
                  <div className="text-sm text-gray-600 mb-2 font-medium">Debt-to-Income Ratio</div>
                  <div className="text-3xl font-bold mb-2" style={{
                    fontFamily: 'Georgia, serif',
                    color: financialMetrics.foir < 30 ? '#1B7F3A' : financialMetrics.foir <= 50 ? '#F5A623' : '#C1440E'
                  }}>
                    {financialMetrics.foir}%
                  </div>
                  <div className="text-xs text-gray-500">RBI limit is 50%</div>
                </div>

                <div className="bg-gradient-to-br from-white to-[#FDF4E3] border-2 border-gray-200 rounded-2xl p-5">
                  <div className="text-sm text-gray-600 mb-2 font-medium">You Can Still Repay</div>
                  <div className="text-3xl font-bold mb-2 text-[#1B7F3A]" style={{ fontFamily: 'Georgia, serif' }}>
                    {formatCurrency(financialMetrics.maxAdditionalEmi)}
                  </div>
                  <div className="text-xs text-gray-500">Per month safely</div>
                </div>

                <div className="bg-gradient-to-br from-white to-[#FDF4E3] border-2 border-gray-200 rounded-2xl p-5">
                  <div className="text-sm text-gray-600 mb-2 font-medium">Estimated Loan Ceiling</div>
                  <div className="text-3xl font-bold mb-2 text-[#C1440E]" style={{ fontFamily: 'Georgia, serif' }}>
                    {formatCurrency(financialMetrics.estimatedLoanCeiling)}
                  </div>
                  <div className="text-xs text-gray-500">Based on 24-month tenure</div>
                </div>
              </div>

              {/* Conditional Warnings */}
              <div className="space-y-3 mb-8">
                {financialMetrics.foir > 50 && (
                  <div className="bg-red-50 border-2 border-red-300 text-red-800 rounded-xl p-4 text-sm font-medium">
                    ⚠️ Repayments exceed 50% of income — ineligible for new loans under RBI Microfinance Guidelines 2022
                  </div>
                )}
                {financialMetrics.activeLoans === '4plus' && (
                  <div className="bg-orange-50 border-2 border-orange-300 text-orange-800 rounded-xl p-4 text-sm font-medium">
                    ⚠️ 4 or more active loans detected — exceeds MFIN responsible lending limit of 3 lenders
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-lg font-bold text-[#C1440E]" style={{ fontFamily: 'Georgia, serif' }}>Score Breakdown</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {Object.entries(scoreBreakdown).map(([label, { score, max }]) => {
                  const pct = Math.round((score / max) * 100);
                  const barColor = pct >= 70 ? '#1B7F3A' : pct >= 40 ? '#F5A623' : '#C1440E';
                  return (
                    <div key={label} className="bg-gradient-to-br from-[#FDF4E3] to-white border-2 border-gray-200 rounded-2xl p-5">
                      <div className="text-sm text-gray-600 mb-3 font-medium">{label}</div>
                      <div className="bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, background: barColor }}
                        ></div>
                      </div>
                      <div className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: barColor }}>
                        {score} / {max}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Loan Eligibility */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Loan Eligibility</h2>
              </div>
              <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>ऋण पात्रता</p>

              <div className="grid md:grid-cols-2 gap-5">
                {getLoanEligibility(finalScore).map((loan, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${loan.eligible ? 'from-green-50 to-white border-green-200' : 'from-gray-50 to-white border-gray-200'} border-2 rounded-2xl p-6 transition-all hover:shadow-lg`}>
                    <div className="text-xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: loan.eligible ? '#1B7F3A' : '#666' }}>{loan.name}</div>
                    <div className="text-3xl mb-2 text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>{`₹${loan.amount.toLocaleString('en-IN')}`}</div>
                    <div className="text-sm text-gray-600 mb-4">@ {loan.rate}% p.a. | {loan.tenure}</div>
                    <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wide ${
                      loan.eligible
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-500 border border-gray-300'
                    }`}>
                      {loan.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Roadmap */}
            {getRoadmap(scoreBreakdown).length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Score Improvement Roadmap</h2>
                </div>
                <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>स्कोर सुधार योजना</p>

                <div className="space-y-4">
                  {getRoadmap(scoreBreakdown).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-5 bg-gradient-to-r from-[#FDF4E3] to-white border-2 border-[#F5A623] rounded-2xl p-5 hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-base text-gray-800 mb-2 font-medium">{item.action}</div>
                        <div className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1B7F3A' }}>+{item.gain} points in {item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-5">
              <button onClick={downloadReport} className="flex-1 bg-gradient-to-r from-[#C1440E] to-[#F5A623] text-white px-8 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3" style={{ fontFamily: 'Georgia, serif' }}>
                <Download className="w-6 h-6" />
                Download Credit Report (PDF)
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-8 py-5 rounded-2xl hover:border-[#C1440E] hover:text-[#C1440E] hover:shadow-xl transition-all flex items-center justify-center gap-3 font-bold text-lg"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <ArrowLeft className="w-6 h-6" />
                Score Another Applicant
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}
