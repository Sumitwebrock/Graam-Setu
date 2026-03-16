import { useEffect, useMemo, useState } from "react";
import { Search, Scale, AlertCircle, MapPin, MessageCircle } from "lucide-react";
import ComplaintGenerator from "../components/ComplaintGenerator";
import ConsumerRightsHelper from "../components/ConsumerRightsHelper";
import FraudAlertBoard from "../components/FraudAlertBoard";
import LegalAidLocator from "../components/LegalAidLocator";
import LegalChatbot from "../components/LegalChatbot";
import LegalGlossary from "../components/LegalGlossary";
import MinimumWageChecker from "../components/MinimumWageChecker";
import MySituationRights from "../components/MySituationRights";
import ProfileLegalHighlights from "../components/ProfileLegalHighlights";
import { getCurrentVidhiUser, getVidhiUserProfile } from "../services/vidhiApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const occupationToWageRole = (occupation) => {
  const normalized = normalizeText(occupation);
  if (normalized.includes("construction")) return "Construction Worker";
  if (normalized.includes("farm") || normalized.includes("agri")) return "Agricultural Worker";
  if (normalized.includes("domestic")) return "Domestic Worker";
  if (normalized.includes("driver")) return "Driver";
  return "Construction Worker";
};

const buildRecommendations = (profile) => {
  const recommendations = [];
  const occupation = normalizeText(profile?.occupation);
  const gender = normalizeText(profile?.gender);
  const maritalStatus = normalizeText(profile?.maritalStatus);
  const landOwned = Number(profile?.landOwned || 0);

  if (occupation.includes("construction") || occupation.includes("worker") || occupation.includes("labour")) {
    recommendations.push({
      title: "Wages & worker rights (मजदूरी अधिकार)",
      description: "Minimum wage, unpaid wages, and the complaint path are prioritized for your occupation.",
      color: "from-[#FF7A00] to-[#FFA726]",
      icon: "wage",
    });
  }

  if (gender === "female") {
    recommendations.push({
      title: "Women safety & support (महिला सहायता)",
      description: "Domestic violence support, property rights and key helplines are highlighted for you.",
      color: "from-[#E91E63] to-[#F06292]",
      icon: "rights",
    });
  }

  if (occupation.includes("farmer") || occupation.includes("agri") || landOwned > 0) {
    recommendations.push({
      title: "Land & farming rights (जमीन अधिकार)",
      description: "Land records, boundary issues, inheritance and scheme-related complaints are included.",
      color: "from-[#1B7F3A] to-[#4CAF50]",
      icon: "land",
    });
  }

  if (maritalStatus.includes("widow")) {
    recommendations.push({
      title: "Widow pension & inheritance (विधवा सहायता)",
      description: "Key steps for pension, inheritance, and government support are highlighted.",
      color: "from-[#673AB7] to-[#9575CD]",
      icon: "rights",
    });
  }

  recommendations.push({
    title: "Fraud prevention (धोखाधड़ी से बचाव)",
    description: "See local alerts for loan app scams, OTP fraud, fake scheme registrations, and consumer fraud.",
    color: "from-[#D84315] to-[#FF8A65]",
    icon: "alert",
  });

  return recommendations.slice(0, 4);
};

const buildSuggestedActions = (profile) => {
  const actions = [];
  const occupation = normalizeText(profile?.occupation);
  const gender = normalizeText(profile?.gender);
  const maritalStatus = normalizeText(profile?.maritalStatus);

  if (occupation.includes("construction") || occupation.includes("worker") || occupation.includes("labour")) {
    actions.push("Keep a note of wages, attendance, and contractor details—this helps most in a complaint.");
  }
  if (gender === "female") {
    actions.push("Save Women Helpline 181 and your district legal aid contact in your phone.");
  }
  if (maritalStatus.includes("widow")) {
    actions.push("Keep pension papers, family register, passbook, and spouse documents in one file.");
  }
  actions.push("If a scheme is denied, ask for the application number and rejection reason in writing.");
  actions.push("For fraud/OTP scams/loan threats, report immediately on 1930.");
  return actions.slice(0, 4);
};

const getRecommendedSituations = (profile) => {
  const occupation = normalizeText(profile?.occupation);
  const gender = normalizeText(profile?.gender);
  const maritalStatus = normalizeText(profile?.maritalStatus);
  const landOwned = Number(profile?.landOwned || 0);
  const situations = [];

  if (occupation.includes("construction") || occupation.includes("worker") || occupation.includes("labour")) {
    situations.push("minimum_wage_violation", "wages_not_paid");
  }
  if (occupation.includes("farmer") || occupation.includes("agri") || landOwned > 0) {
    situations.push("land_dispute");
  }
  if (gender === "female" || maritalStatus.includes("widow")) {
    situations.push("government_scheme_denied");
  }
  situations.push("loan_harassment", "product_fraud");

  return [...new Set(situations)];
};

export default function VidhiSahayPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [selectedSituation, setSelectedSituation] = useState("product_fraud");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError("");
        const authUser = getCurrentVidhiUser();
        if (!authUser?.uid) {
          throw new Error("User profile नहीं मिला। दोबारा login करें।");
        }
        const data = await getVidhiUserProfile(authUser.uid);
        setProfile(data);
      } catch (error) {
        setProfileError(error.message || "प्रोफाइल जानकारी अभी उपलब्ध नहीं है।");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const recommendedSituations = useMemo(() => getRecommendedSituations(profile), [profile]);
  const recommendations = useMemo(() => buildRecommendations(profile), [profile]);
  const suggestedActions = useMemo(() => buildSuggestedActions(profile), [profile]);
  const defaultSituation = recommendedSituations[0] || "product_fraud";
  const defaultOccupation = occupationToWageRole(profile?.occupation);

  useEffect(() => {
    setSelectedSituation(defaultSituation);
  }, [defaultSituation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAF9] to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl mb-3 text-gray-900">VidhiSahayak / विधि सहायक</h1>
          <p className="text-base md:text-lg text-gray-600">Profile-based legal guidance (with key steps in Hindi) / जरूरी बातें हिंदी में</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search (खोजें): issue, rights, complaint, legal terms..."
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-[#673AB7] focus:outline-none pr-12"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
        </div>

        {loadingProfile && (
          <div className="bg-white rounded-2xl p-4 shadow-md mb-8 text-gray-600">Loading your profile...</div>
        )}

        {profileError && (
          <div className="bg-[#FFF3E0] border border-[#FF7A00]/30 rounded-2xl p-4 shadow-sm mb-8 text-gray-700">
            {profileError} Showing general guidance even without a profile.
          </div>
        )}

        {profile && !loadingProfile && (
          <div className="bg-white rounded-2xl p-4 shadow-md mb-8 text-sm text-gray-700 border border-gray-100">
            Profile: {profile.gender || "-"}, {profile.age || "-"} yrs, {profile.occupation || "-"}, {profile.district || "-"}, {profile.state || "-"}
          </div>
        )}

        <ProfileLegalHighlights profile={profile} recommendations={recommendations} suggestedActions={suggestedActions} />

        <MySituationRights
          defaultSituation={defaultSituation}
          recommendedSituations={recommendedSituations}
          searchTerm={searchTerm}
          onSituationChange={(key) => setSelectedSituation(key)}
        />

        <div className="mt-8 mb-8">
          <Tabs defaultValue="wage" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-gray-900">Detailed tools</h2>
              <TabsList>
                <TabsTrigger value="wage">Minimum wage</TabsTrigger>
                <TabsTrigger value="consumer">Consumer rights</TabsTrigger>
                <TabsTrigger value="fraud">Fraud alerts</TabsTrigger>
                <TabsTrigger value="complaint">Complaint letter</TabsTrigger>
                <TabsTrigger value="aid">Legal aid</TabsTrigger>
                <TabsTrigger value="glossary">Glossary & chat</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="wage">
              <MinimumWageChecker defaultState={profile?.state || "Chhattisgarh"} defaultOccupation={defaultOccupation} />
            </TabsContent>

            <TabsContent value="consumer">
              <ConsumerRightsHelper />
            </TabsContent>

            <TabsContent value="fraud">
              <FraudAlertBoard district={profile?.district} state={profile?.state} />
            </TabsContent>

            <TabsContent value="complaint">
              <ComplaintGenerator profile={profile} defaultProblemType={selectedSituation} />
            </TabsContent>

            <TabsContent value="aid">
              <LegalAidLocator state={profile?.state} district={profile?.district} />
            </TabsContent>

            <TabsContent value="glossary">
              <div className="grid gap-8 lg:grid-cols-2">
                <LegalGlossary externalSearchTerm={searchTerm} />
                <LegalChatbot profile={profile} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#E8F5E9] to-white rounded-2xl p-6 shadow-md border-2 border-[#1B7F3A]">
            <Scale className="w-10 h-10 text-[#1B7F3A] mb-4" />
            <h3 className="text-base mb-3 text-gray-900">Free Legal Aid (DLSA)</h3>
            <p className="text-gray-700 mb-4">Even without a lawyer, the District Legal Services Authority can help you.</p>
            <a href="tel:15100" className="block w-full bg-[#1B7F3A] text-white py-3 rounded-xl hover:bg-[#155d2b] transition-all text-center">
              Call 15100
            </a>
          </div>
          <div className="bg-gradient-to-br from-[#FFF3E0] to-white rounded-2xl p-6 shadow-md border-2 border-[#FF7A00]">
            <AlertCircle className="w-10 h-10 text-[#FF7A00] mb-4" />
            <h3 className="text-base mb-3 text-gray-900">Quick Complaint Help</h3>
            <p className="text-gray-700 mb-4">Keep complaint records for scheme denial, wage disputes, or loan harassment.</p>
            <a href="tel:1076" className="block w-full bg-[#FF7A00] text-white py-3 rounded-xl hover:bg-[#e66d00] transition-all text-center">
              1076 (Complaint line)
            </a>
          </div>
          <div className="bg-gradient-to-br from-[#F3E5F5] to-white rounded-2xl p-6 shadow-md border-2 border-[#673AB7]">
            <MapPin className="w-10 h-10 text-[#673AB7] mb-4" />
            <h3 className="text-base mb-3 text-gray-900">Women Support</h3>
            <p className="text-gray-700 mb-4">For women’s safety, domestic violence, or property rights, use helplines and legal aid.</p>
            <a href="tel:181" className="block w-full bg-[#673AB7] text-white py-3 rounded-xl hover:bg-[#5E35B1] transition-all text-center">
              Call 181
            </a>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-[#673AB7] to-[#9575CD] rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg mb-2">Ask Legal Assistant / कानूनी सवाल पूछें</h3>
              <p className="text-white/90 text-sm">Ask a question, get next steps, and then contact legal aid if needed.</p>
            </div>
            <div className="bg-white text-[#673AB7] px-4 py-3 rounded-xl text-sm shadow-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Simple guidance, clear steps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
