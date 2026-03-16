import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Gift,
  Heart,
  PiggyBank,
  Scale,
  Bell,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  X
} from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { t } from "../i18n";
import { fetchUserProfile, sendVerificationOtp, verifyOtpCode, uploadVerificationDocument } from "../services/verificationApi";

export default function Dashboard() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationInfo, setVerificationInfo] = useState({
    phoneVerified: false,
    verificationStatus: "UNVERIFIED",
    riskFlag: false,
    phone: "",
  });
  const [otpSending, setOtpSending] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [docType, setDocType] = useState("AADHAAR");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const fileInputRef = useRef(null);
  const userName = localStorage.getItem("userName") || "User";
   const { language } = useLanguage();

  useEffect(() => {
    // Check if user just logged in
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      setShowWelcomePopup(true);
      sessionStorage.removeItem("justLoggedIn");
      
      // Auto-close popup after 4 seconds
      setTimeout(() => {
        setShowWelcomePopup(false);
      }, 4000);
    }
  }, []);

  useEffect(() => {
    const loadVerification = async () => {
      setVerificationLoading(true);
      setVerificationError("");
      try {
        const profile = await fetchUserProfile();
        setVerificationInfo({
          phoneVerified: Boolean(profile.phoneVerified),
          verificationStatus: profile.verificationStatus || "UNVERIFIED",
          riskFlag: Boolean(profile.riskFlag),
          phone: profile.phone || "",
        });
      } catch (error) {
        setVerificationError(error.message || "Unable to load verification status");
      } finally {
        setVerificationLoading(false);
      }
    };

    loadVerification();
  }, []);

  const modules = [
    {
      icon: TrendingUp,
      title: "GraamScore",
      titleHindi: "ग्राम स्कोर",
      subtitle: "Credit Score",
      value: "685",
      status: "Good",
      color: "#C1440E",
      borderColor: "#C1440E",
      link: "/graamscore"
    },
    {
      icon: Gift,
      title: "HaqDar",
      titleHindi: "हक़दार",
      subtitle: "Eligible Schemes",
      value: "7",
      status: "New",
      color: "#F5A623",
      borderColor: "#F5A623",
      link: "/haqdar"
    },
    {
      icon: PiggyBank,
      title: "BachatBox",
      titleHindi: "बचत बॉक्स",
      subtitle: "Total Savings",
      value: "₹12,450",
      status: "On Track",
      color: "#2196F3",
      borderColor: "#2196F3",
      link: "/bachatbox"
    },
    {
      icon: Scale,
      title: "VidhiSahay",
      titleHindi: "विधि सहाय",
      subtitle: "Legal Rights",
      value: "5 Guides",
      status: "Read",
      color: "#7B3F00",
      borderColor: "#7B3F00",
      link: "/vidhisahay"
    }
  ];

  const actionItems = [
    {
      title: "Complete your Aadhaar verification",
      titleHindi: "अपना आधार सत्यापन पूरा करें",
      subtitle: "Unlock all features",
      icon: AlertCircle,
      urgent: true
    },
    {
      title: "₹8,500 pension waiting for approval",
      titleHindi: "₹8,500 पेंशन स्वीकृति के लिए प्रतीक्षारत",
      subtitle: "HaqDar - Widow Pension Scheme",
      icon: Gift,
      urgent: true
    },
    {
      title: "Your GraamScore increased by 25 points!",
      titleHindi: "आपका ग्राम स्कोर 25 अंक बढ़ा!",
      subtitle: "Keep up the good work",
      icon: TrendingUp,
      urgent: false
    }
  ];

  const recentActivity = [
    {
      action: "Applied for PM-KISAN scheme",
      actionHindi: "पीएम-किसान योजना के लिए आवेदन किया",
      time: "2 hours ago",
      status: "pending"
    },
    {
      action: "Savings goal created: ₹50,000",
      actionHindi: "बचत लक्ष्य बनाया: ₹50,000",
      time: "Yesterday",
      status: "completed"
    },
    {
      action: "Credit score updated",
      actionHindi: "क्रेडिट स्कोर अपडेट किया गया",
      time: "3 days ago",
      status: "completed"
    }
  ];

  const handleSendOtp = async () => {
    try {
      setVerificationError("");
      setOtpSending(true);
      await sendVerificationOtp(verificationInfo.phone);
    } catch (error) {
      setVerificationError(error.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    try {
      setVerificationError("");
      setOtpVerifying(true);
      await verifyOtpCode(otpCode.trim());
      setVerificationInfo((prev) => ({ ...prev, phoneVerified: true }));
    } catch (error) {
      setVerificationError(error.message || "Failed to verify OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  const handleChooseFileClick = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      setVerificationError(t(language, "pleaseSelectDocument"));
      return;
    }
    try {
      setVerificationError("");
      setDocUploading(true);
      await uploadVerificationDocument(docType, docFile, aadhaarNumber);
      setVerificationInfo((prev) => ({ ...prev, verificationStatus: "PENDING_AGENT_REVIEW" }));
    } catch (error) {
      setVerificationError(error.message || "Failed to upload document");
    } finally {
      setDocUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF4E3] py-10 px-4">
      {/* Welcome Popup Modal */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#C1440E] to-[#F5A623] p-8 md:p-12 max-w-md w-full transform animate-scaleIn relative" style={{ borderRadius: '8px' }}>
            {/* Close Button */}
            <button
              onClick={() => setShowWelcomePopup(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 transition-all"
              style={{ borderRadius: '6px' }}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Content */}
            <div className="text-center text-white">
              <h2 className="text-4xl mb-3" style={{ fontFamily: 'Georgia, serif', fontWeight: '700' }}>
                {t(language, "welcomeUser", { userName })}
              </h2>
              <p className="text-lg mb-6" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                {t(language, "welcomeToGraamSetu")}
              </p>

              <div className="bg-white/10 backdrop-blur p-3.5 mb-6" style={{ borderRadius: '8px' }}>
                <p className="text-white/90" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                  {t(language, "dashboardJourneyText")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700' }}>
            {t(language, "welcomeBackUser", { userName })}
          </h1>
          <p className="text-xl text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
            {t(language, "yourDashboardHere")}
          </p>
        </div>

        {/* Most Urgent Action First */}
        <div className="mb-10">
          <div className="bg-[#FFFBF0] border border-[#F5A623] p-3.5" style={{ borderRadius: '8px' }}>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '4px' }}>
                <AlertCircle className="w-6 h-6 text-[#F5A623]" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '18px' }}>
                  {t(language, "completeAadhaarVerification")}
                </h3>
                <p className="text-[#665a48] mb-1" style={{ fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '14px' }}>
                  {t(language, "finishUnlockFeatures")}
                </p>
                <p className="text-[#665a48] text-sm" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                  {t(language, "unlockAllFeatures")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Panel */}
        <div className="mb-10">
          <div className="bg-[#FFFBF0] border border-[#C1440E18] p-5 shadow-sm" style={{ borderRadius: '10px' }}>
            {/* Panel header with steps */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C1440E]/10 flex items-center justify-center" style={{ borderRadius: '999px' }}>
                  <CheckCircle className="w-5 h-5 text-[#C1440E]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '700' }}>
                    {t(language, "twoStepVerification")}
                  </p>
                  <h2 className="text-lg" style={{ fontFamily: 'Georgia, serif', fontWeight: '700' }}>
                    {t(language, "secureYourProfile")}
                  </h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-white border border-[#C1440E18] text-[#665a48]" style={{ borderRadius: '999px', fontFamily: 'Georgia, serif' }}>
                  1. {t(language, "phoneOtp")}
                </span>
                <span className="px-3 py-1 bg-white border border-[#C1440E18] text-[#665a48]" style={{ borderRadius: '999px', fontFamily: 'Georgia, serif' }}>
                  2. {t(language, "documentCheck")}
                </span>
                <span className="px-3 py-1 bg-white border border-[#C1440E18] text-[#665a48]" style={{ borderRadius: '999px', fontFamily: 'Georgia, serif' }}>
                  3. {t(language, "agentApproval")}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="mb-2" style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700' }}>
                  {t(language, "yourVerificationStatus")}
                </h2>
                {verificationLoading ? (
                  <p className="text-[#665a48] text-sm">{t(language, "loadingVerificationStatus")}</p>
                ) : (
                  <div className="space-y-1 text-sm text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                    <p>
                      {t(language, "phoneVerificationLabel")}{" "}
                      <span className={verificationInfo.phoneVerified ? "text-green-700" : "text-[#F5A623]"}>
                        {verificationInfo.phoneVerified
                          ? t(language, "verified")
                          : t(language, "pending")}
                      </span>
                    </p>
                    <p>
                      {t(language, "profileStatusLabel")}{" "}
                      <span className={verificationInfo.verificationStatus === "VERIFIED" ? "text-green-700" : verificationInfo.verificationStatus === "REJECTED" ? "text-red-700" : "text-[#F5A623]"}>
                        {verificationInfo.verificationStatus}
                      </span>
                    </p>
                    {verificationInfo.riskFlag && (
                      <p className="text-red-700 text-xs">
                        {t(language, "profileFlaggedRisky")}
                      </p>
                    )}
                  </div>
                )}
                {verificationError && (
                  <p className="mt-2 text-xs text-red-700">{verificationError}</p>
                )}
              </div>

              {/* Phone OTP section */}
              <div className="flex-1 border border-[#C1440E18] bg-white p-3.5" style={{ borderRadius: '8px' }}>
                <h3 className="mb-2" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '16px' }}>
                  {t(language, "phoneOtpVerification")}
                </h3>
                <p className="text-xs text-[#665a48] mb-3" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                  {t(language, "receiveOtpWhatsapp")}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending}
                    className="px-3 py-2 bg-[#C1440E] text-white text-xs hover:bg-[#8B2E0B] disabled:opacity-60"
                    style={{ borderRadius: '4px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
                  >
                    {otpSending
                      ? t(language, "sendingOtp")
                      : t(language, "sendOtp")}
                  </button>
                  <form onSubmit={handleVerifyOtp} className="flex gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder={t(language, "otpPlaceholder")}
                      className="flex-1 px-2 py-1.5 border border-[#C1440E18] text-xs focus:outline-none focus:border-[#C1440E]"
                      style={{ borderRadius: '4px' }}
                    />
                    <button
                      type="submit"
                      disabled={otpVerifying}
                      className="px-3 py-1.5 bg-[#1B7F3A] text-white text-xs hover:bg-[#155d2b] disabled:opacity-60"
                      style={{ borderRadius: '4px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
                    >
                      {otpVerifying
                        ? t(language, "verifying")
                        : t(language, "verifyOtp")}
                    </button>
                  </form>
                </div>
              </div>

              {/* Document upload section */}
              <div className="flex-1 border border-[#C1440E18] bg-white p-3.5" style={{ borderRadius: '8px' }}>
                <h3 className="mb-2" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '16px' }}>
                  {t(language, "documentUpload")}
                </h3>
                <form onSubmit={handleUploadDocument} className="space-y-2">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#C1440E18] text-xs focus:outline-none focus:border-[#C1440E]"
                    style={{ borderRadius: '4px' }}
                  >
                    <option value="AADHAAR">Aadhaar card</option>
                    <option value="INCOME_CERTIFICATE">Income certificate</option>
                    <option value="CASTE_CERTIFICATE">Caste certificate</option>
                    <option value="RATION_CARD">Ration card</option>
                  </select>
                  {docType === "AADHAAR" && (
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder={t(language, "aadhaarPlaceholder")}
                      className="w-full px-2 py-1.5 border border-[#C1440E18] text-xs focus:outline-none focus:border-[#C1440E]"
                      style={{ borderRadius: '4px' }}
                    />
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleChooseFileClick}
                      className="px-3 py-1.5 bg-[#FDF4E3] border border-[#C1440E18] hover:border-[#C1440E] text-[#2c2416]"
                      style={{ borderRadius: '4px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
                    >
                      {t(language, "chooseFile")}
                    </button>
                    <span className="text-[#665a48] truncate flex-1" title={docFile ? docFile.name : ''}>
                      {docFile ? docFile.name : t(language, "noFileChosen")}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-[10px] text-[#665a48] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                    {t(language, "pdfImageLimit")}
                  </p>
                  <button
                    type="submit"
                    disabled={docUploading}
                    className="w-full px-3 py-1.5 bg-[#C1440E] text-white text-xs hover:bg-[#8B2E0B] disabled:opacity-60"
                    style={{ borderRadius: '4px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
                  >
                    {docUploading
                      ? t(language, "uploading")
                      : t(language, "uploadDocument")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Modules - Vertical List */}
        <div className="mb-10">
          <h2 className="mb-8" style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700' }}>
            {t(language, "services")}
          </h2>
          <div className="space-y-4">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Link key={module.title} to={module.link}>
                  <div className="flex items-start gap-6 bg-[#FFFBF0] border border-[#C1440E18] p-3.5 hover:border-[#C1440E] transition-all group"
                    style={{ borderRadius: '8px' }}
                  >
                    <div className="text-4xl text-[#C1440E] opacity-30" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', minWidth: '50px' }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5" style={{ color: module.color }} />
                        <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '18px' }}>
                          {language === "en" ? module.title : module.titleHindi}
                        </h3>
                        {language === "en" ? (
                          <span className="text-sm text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                            {module.titleHindi}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '14px' }}>
                          {module.subtitle}: {module.value}
                        </p>
                        <span className="text-xs px-3 py-1 text-white" style={{ backgroundColor: module.color, borderRadius: '4px', fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                          {module.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Action Items */}
          <div>
            <h2 className="mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700' }}>
              {t(language, "actionItems")}
            </h2>
            <p className="text-[#665a48] mb-6" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
              {t(language, "thingsToDoNext")}
            </p>
            <div className="space-y-4">
              {actionItems.slice(1).map((item, index) => (
                <div
                  key={index}
                  className="bg-[#FFFBF0] border p-3.5"
                  style={{ 
                    borderRadius: '8px',
                    borderColor: item.urgent ? '#F5A623' : '#C1440E18'
                  }}
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#FDF4E3] flex items-center justify-center flex-shrink-0"
                      style={{ borderRadius: '4px' }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.urgent ? '#F5A623' : '#C1440E' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '16px' }}>
                        {language === "en" ? item.title : item.titleHindi}
                      </h3>
                      <p className="text-[#665a48] text-sm" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700' }}>
              {t(language, "recentActivity")}
            </h2>
            <p className="text-[#665a48] mb-6" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
              {t(language, "yourLatestActions")}
            </p>
            <div className="bg-[#FFFBF0] border border-[#C1440E18] p-3.5" style={{ borderRadius: '8px' }}>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-[#C1440E18] last:border-b-0 last:pb-0">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                      style={{ 
                        borderRadius: '4px',
                        backgroundColor: activity.status === "completed" ? '#E8F5E9' : '#FFF3E0'
                      }}
                    >
                      {activity.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-[#F5A623]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#2c2416] mb-1" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '14px' }}>
                        {language === "en" ? activity.action : activity.actionHindi}
                      </p>
                      <p className="text-sm text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-10 bg-[#FFFBF0] border border-[#C1440E18] p-3.5" style={{ borderRadius: '8px' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="mb-2" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '20px' }}>
                {t(language, "needHelp")}
              </h3>
              <p className="text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                {t(language, "support24x7")}
              </p>
            </div>
            <a
              href="tel:1800-123-4567"
              className="bg-[#C1440E] text-white px-8 py-3 hover:bg-[#8B2E0B] transition-all whitespace-nowrap"
              style={{ borderRadius: '6px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
            >
              {t(language, "callHelpline")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}