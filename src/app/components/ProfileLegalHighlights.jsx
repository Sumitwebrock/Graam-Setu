import { ShieldCheck, Scale, Landmark, BadgeAlert } from "lucide-react";
import { useLanguage } from "../LanguageContext";

const iconMap = {
  rights: ShieldCheck,
  wage: Scale,
  land: Landmark,
  alert: BadgeAlert,
};

export default function ProfileLegalHighlights({ profile, recommendations, suggestedActions }) {
  const { language } = useLanguage();
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] mb-8">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-[#673AB7]/10">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="text-xl text-gray-900">
              {language !== "en"
                ? "प्रोफाइल-आधारित कानूनी मदद"
                : "Profile-based legal help"} (प्रोफाइल-आधारित मदद)
            </h2>
            <p className="text-gray-600 mt-2">
              {language !== "en"
                ? "आपकी प्रोफाइल और ज़िले के आधार पर तैयार।"
                : "Prepared using your profile and district."}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-[#F3E5F5] text-[#673AB7] text-sm">
            {profile?.district || "Update district"} • {profile?.state || "Update state"}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((item) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={item.title} className={`rounded-2xl p-5 bg-gradient-to-br ${item.color} text-white`}>
                <Icon className="w-7 h-7 mb-4" />
                <h3 className="text-base mb-2">{item.title}</h3>
                <p className="text-white/90 text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5E9] to-white rounded-2xl p-6 md:p-8 shadow-md border border-[#1B7F3A]/15">
        <h2 className="text-lg text-gray-900 mb-4">
          {language !== "en" ? "अब क्या करें" : "What to do now"}
        </h2>
        <div className="space-y-3">
          {suggestedActions.map((action, index) => (
            <div key={`${action}-${index}`} className="rounded-xl bg-white p-4 border border-[#1B7F3A]/10">
              <div className="text-xs text-[#1B7F3A] mb-1">
                {language !== "en" ? `सलाह ${index + 1}` : `Tip ${index + 1}`}
              </div>
              <p className="text-gray-700">{action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}