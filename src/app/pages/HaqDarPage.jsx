import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Gift, Calendar, IndianRupee, CheckCircle, Clock, AlertTriangle, ArrowRight, X } from "lucide-react";
import { getPaymentHistory, getProfileBasedSchemes, getSchemeApplicationStatus, getUserProfile } from "../services/haqdarApi";
import { useLanguage } from "../LanguageContext";

export default function HaqDarPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [partiallyEligibleSchemes, setPartiallyEligibleSchemes] = useState([]);
  const [notEligibleSchemes, setNotEligibleSchemes] = useState([]);
  const [paymentTimeline, setPaymentTimeline] = useState([]);
  const [trackingModal, setTrackingModal] = useState({
    open: false,
    loading: false,
    error: "",
    scheme: null,
    statusData: null,
  });
  const { language } = useLanguage();

  useEffect(() => {
    const loadHaqDarData = async () => {
      try {
        setLoading(true);
        setError("");

        const authUserRaw = localStorage.getItem("authUser");
        const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
        if (!authUser?.uid) {
          throw new Error("User session not found. Please login again.");
        }

        const [schemesData, paymentData, profileData] = await Promise.all([
          getProfileBasedSchemes(),
          getPaymentHistory().catch(() => []),
          getUserProfile(authUser.uid).catch(() => null),
        ]);

        setUserProfile(profileData || schemesData.userProfile || null);
        setEligibleSchemes(schemesData.eligibleSchemes || []);
        setPartiallyEligibleSchemes(schemesData.partiallyEligibleSchemes || []);
        setNotEligibleSchemes(schemesData.notEligibleSchemes || []);

        const timeline = (paymentData || []).map((item) => ({
          scheme: item.schemeId,
          amount: item.lastPayment?.amount || "Pending",
          date: item.nextExpected || item.lastPayment?.date || "TBD",
          status: String(item.status || "").toLowerCase().includes("received") ? "received" : "upcoming",
        }));
        setPaymentTimeline(timeline);
      } catch (err) {
        setError(err.message || "Failed to load scheme eligibility.");
      } finally {
        setLoading(false);
      }
    };

    loadHaqDarData();
  }, []);

  const schemeCards = useMemo(
    () => [
      ...eligibleSchemes.map((scheme) => ({ ...scheme, categoryLabel: "Eligible", categoryTone: "green" })),
      ...partiallyEligibleSchemes.map((scheme) => ({ ...scheme, categoryLabel: "Partially Eligible", categoryTone: "yellow" })),
      ...notEligibleSchemes.map((scheme) => ({ ...scheme, categoryLabel: "Not Eligible", categoryTone: "gray" })),
    ],
    [eligibleSchemes, partiallyEligibleSchemes, notEligibleSchemes]
  );

  const missingBenefits = useMemo(
    () =>
      partiallyEligibleSchemes.slice(0, 3).map((scheme) => ({
        scheme: scheme.name,
        amount: scheme.amount,
        duration: `${scheme.matchedCriteria}/${scheme.totalCriteria} criteria matched`,
        action: "Complete profile details to unlock full eligibility",
        applyUrl: scheme.applyUrl,
      })),
    [partiallyEligibleSchemes]
  );

  const totalBenefitsLabel = useMemo(() => {
    const extracted = eligibleSchemes
      .map((scheme) => String(scheme.amount || ""))
      .filter((amount) => amount.includes("₹"));
    return extracted.length > 0 ? extracted.slice(0, 2).join(" + ") : "As per eligible schemes";
  }, [eligibleSchemes]);

  const trackingProgress = useMemo(() => {
    if (!trackingModal.statusData?.steps) {
      return [];
    }

    const { steps, currentStage } = trackingModal.statusData;
    const currentIndex = steps.findIndex((step) => step === currentStage);

    return steps.map((step, index) => ({
      step,
      status: index < currentIndex ? "done" : index === currentIndex ? "current" : "pending"
    }));
  }, [trackingModal.statusData]);

  const openOfficialSchemeSite = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTrackApplication = async (scheme) => {
    setTrackingModal({
      open: true,
      loading: true,
      error: "",
      scheme,
      statusData: null,
    });

    try {
      const statusData = await getSchemeApplicationStatus({
        schemeId: scheme.schemeId,
        schemeName: scheme.name,
      });

      setTrackingModal({
        open: true,
        loading: false,
        error: "",
        scheme,
        statusData,
      });
    } catch (error) {
      setTrackingModal({
        open: true,
        loading: false,
        error: error.message || "Unable to fetch application status right now.",
        scheme,
        statusData: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAF9] to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl mb-3 text-gray-900">
            HaqDar
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            {language !== "en"
              ? "हक़दार - आपकी सरकारी योजना खोजक"
              : "HaqDar – your government scheme finder"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1B7F3A] to-[#4CAF50] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-8 h-8" />
              <span className="text-lg">{language !== "en" ? "योग्य योजनाएँ" : "Eligible Schemes"}</span>
            </div>
            <div className="text-5xl mb-2">{eligibleSchemes.length}</div>
            <p className="text-[#E8F5E9]">
              {language !== "en" ? "योजनाओं के लिए योग्य" : "Schemes you are eligible for"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#FF7A00] to-[#FFA726] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <IndianRupee className="w-8 h-8" />
              <span className="text-lg">{language !== "en" ? "कुल लाभ" : "Total Benefits"}</span>
            </div>
            <div className="text-lg md:text-xl mb-2">{totalBenefitsLabel}</div>
            <p className="text-white/80">{language !== "en" ? "वार्षिक लाभ" : "Per year (approx.)"}</p>
          </div>
          <div className="bg-gradient-to-br from-[#E91E63] to-[#F06292] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-lg">{language !== "en" ? "लंबित कार्य" : "Pending Actions"}</span>
            </div>
            <div className="text-5xl mb-2">{partiallyEligibleSchemes.length}</div>
            <p className="text-white/80">{language !== "en" ? "आवेदन करें" : "Schemes where you must apply"}</p>
          </div>
        </div>

        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 text-gray-700">Loading eligibility data...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-red-700">{error}</div>
        )}
        {userProfile && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 text-gray-700 text-sm">
            Profile: {userProfile.gender || "-"}, {userProfile.age || "-"} years, {userProfile.occupation || "-"}, {userProfile.state || "-"}
          </div>
        )}

        {/* Missing Benefits Alert */}
        <div className="bg-gradient-to-r from-[#FFF3E0] to-[#FFEBEE] border-2 border-[#FF7A00] rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-[#FF7A00] flex-shrink-0" />
            <div>
              <h2 className="text-2xl md:text-3xl mb-2 text-gray-900">
                {language !== "en" ? "छूटे हुए लाभ की सूचना" : "Missing Benefits Alert!"}
              </h2>
              <p className="text-lg text-gray-700">
                {language !== "en"
                  ? "आंशिक रूप से योग्य योजनाएँ – प्रोफ़ाइल पूरा करें"
                  : "Partially eligible schemes that need profile completion"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {missingBenefits.length === 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md text-gray-700">No partially eligible schemes right now.</div>
            )}
            {missingBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl text-gray-900 mb-2">{benefit.scheme}</h3>
                    <p className="text-gray-600 mb-2">{benefit.action}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[#FF7A00]">Amount: {benefit.amount}</span>
                      <span className="text-gray-600">Duration: {benefit.duration}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openOfficialSchemeSite(benefit.applyUrl)}
                    className="bg-[#FF7A00] text-white px-6 py-3 rounded-xl hover:bg-[#e66d00] transition-all whitespace-nowrap"
                  >
                    {language !== "en" ? "अभी आवेदन करें" : "Apply Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligible Schemes */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-gray-900">
            {language !== "en" ? "आपकी योजना पात्रता" : "Your Scheme Eligibility"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemeCards.map((scheme, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-md border-2 ${
                  scheme.categoryTone === "green"
                    ? "border-[#1B7F3A]"
                    : scheme.categoryTone === "yellow"
                    ? "border-[#FF7A00]"
                    : "border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${
                    scheme.categoryTone === "green"
                      ? "bg-[#E8F5E9]"
                      : scheme.categoryTone === "yellow"
                      ? "bg-[#FFF3E0]"
                      : "bg-gray-100"
                  } flex items-center justify-center`}>
                    <Gift className={`w-6 h-6 ${
                      scheme.categoryTone === "green"
                        ? "text-[#1B7F3A]"
                        : scheme.categoryTone === "yellow"
                        ? "text-[#FF7A00]"
                        : "text-gray-500"
                    }`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    scheme.categoryTone === "green"
                      ? "bg-[#E8F5E9] text-[#1B7F3A]"
                      : scheme.categoryTone === "yellow"
                      ? "bg-[#FFF3E0] text-[#FF7A00]"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {scheme.categoryLabel}
                  </span>
                </div>
                <h3 className="text-xl mb-2 text-gray-900">{scheme.name}</h3>
                {scheme.nameHindi && (
                  <p className="text-gray-600 text-sm mb-3">
                    {language !== "en" ? scheme.nameHindi : scheme.name}
                  </p>
                )}
                <p className="text-gray-700 mb-4">{scheme.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-[#1B7F3A]">{scheme.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Eligibility Match:</span>
                    <span className="text-gray-900">{scheme.matchScore || 0}%</span>
                  </div>
                </div>
                {scheme.categoryTone !== "gray" && (
                  <button
                    onClick={() => openOfficialSchemeSite(scheme.applyUrl)}
                    className="w-full bg-[#1B7F3A] text-white py-3 rounded-xl hover:bg-[#155d2b] transition-all flex items-center justify-center gap-2"
                  >
                    {language !== "en" ? "अभी आवेदन करें" : "Apply Now"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                {scheme.categoryTone === "green" && (
                  <button
                    onClick={() => handleTrackApplication(scheme)}
                    className="w-full mt-2 bg-[#2196F3] text-white py-3 rounded-xl hover:bg-[#1976D2] transition-all"
                  >
                    Track Application
                  </button>
                )}
                {scheme.categoryTone === "gray" && (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl cursor-not-allowed"
                  >
                    Not Eligible Right Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
          <h2 className="text-2xl md:text-3xl mb-6 text-gray-900">
            {language !== "en" ? "भुगतान समयरेखा" : "Payment Timeline"}
          </h2>
          {paymentTimeline.length === 0 && (
            <div className="text-gray-600">No payment timeline available yet.</div>
          )}
          <div className="space-y-6">
            {paymentTimeline.map((payment, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full ${
                    payment.status === "upcoming" ? "bg-[#FF7A00]" : "bg-[#1B7F3A]"
                  } flex items-center justify-center flex-shrink-0`}>
                    {payment.status === "upcoming" ? (
                      <Clock className="w-6 h-6 text-white" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {index < paymentTimeline.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 my-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl text-gray-900 mb-1">{payment.scheme}</h3>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{payment.date}</span>
                      </div>
                    </div>
                    <div className={`text-2xl ${
                      payment.status === "upcoming" ? "text-[#FF7A00]" : "text-[#1B7F3A]"
                    }`}>
                      {payment.amount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-[#E8F5E9] to-[#FFF3E0] rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl mb-2 text-gray-900">
                Discover More Schemes
              </h3>
              <p className="text-gray-700 text-lg">
                Check if your family qualifies for additional benefits
              </p>
            </div>
            <button
              onClick={() => navigate("/haqdar/find-more")}
              className="bg-[#1B7F3A] text-white px-8 py-4 rounded-xl hover:bg-[#155d2b] transition-all text-lg whitespace-nowrap shadow-lg"
            >
              Find More Schemes
            </button>
          </div>
        </div>
      </div>

      {trackingModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl text-gray-900">Track Application</h3>
                <p className="text-gray-600">{trackingModal.scheme?.nameHindi}</p>
              </div>
              <button
                onClick={() => setTrackingModal({ open: false, loading: false, error: "", scheme: null, statusData: null })}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close tracking panel"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {trackingModal.loading ? (
              <p className="text-gray-700">Fetching latest status from server...</p>
            ) : trackingModal.error ? (
              <p className="text-red-600">{trackingModal.error}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#F4F8F5] rounded-xl p-4">
                    <p className="text-sm text-gray-600">Reference ID</p>
                    <p className="text-gray-900">{trackingModal.statusData?.referenceId}</p>
                  </div>
                  <div className="bg-[#F4F8F5] rounded-xl p-4">
                    <p className="text-sm text-gray-600">Submitted On</p>
                    <p className="text-gray-900">{trackingModal.statusData?.submittedOn}</p>
                  </div>
                  <div className="bg-[#F4F8F5] rounded-xl p-4">
                    <p className="text-sm text-gray-600">Expected Decision</p>
                    <p className="text-gray-900">{trackingModal.statusData?.expectedDecision}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {trackingProgress.map((step) => (
                    <div key={step.step} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        step.status === "done"
                          ? "bg-[#1B7F3A]"
                          : step.status === "current"
                          ? "bg-[#FF7A00]"
                          : "bg-gray-300"
                      }`} />
                      <p className={`${step.status === "current" ? "text-gray-900" : "text-gray-600"}`}>{step.step}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setTrackingModal({ open: false, loading: false, error: "", scheme: null, statusData: null })}
                className="bg-[#1B7F3A] text-white px-5 py-2.5 rounded-lg hover:bg-[#155d2b] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
