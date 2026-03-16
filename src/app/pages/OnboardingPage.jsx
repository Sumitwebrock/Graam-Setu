import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ArrowLeft, Mic, User, MapPin, Home } from "lucide-react";
import { SUPPORTED_LANGUAGES, useLanguage } from "../LanguageContext";
import { t } from "../i18n";

export default function OnboardingPage() {
  const { language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    familySize: "",
    language: language || "en"
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "language") {
      setLanguage(value);
    }
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#FFF3E0] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-gray-700 text-lg">
              {t(language, "stepOf3", { step })}
            </span>
            <span className="text-gray-700 text-lg">
              {t(language, "stepOf3", { step })}
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#1B7F3A] to-[#4CAF50] h-full transition-all duration-500 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-[#1B7F3A]" />
                </div>
                <h2 className="text-3xl md:text-4xl mb-2 text-gray-900">
                  {t(language, "personalInfo")}
                </h2>
                <p className="text-xl text-gray-600">
                  {t(language, "personalDetails")}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg mb-3 text-gray-700">
                    {t(language, "yourName")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={
                        t(language, "enterName")
                      }
                      className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#1B7F3A] focus:outline-none"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B7F3A]">
                      <Mic className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-lg mb-3 text-gray-700">
                    {t(language, "mobileNumber")}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={
                        t(language, "enterMobile")
                      }
                      className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#1B7F3A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg mb-3 text-gray-700">
                    {t(language, "preferredLanguage")}
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#1B7F3A] focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-[#FF7A00]" />
                </div>
                <h2 className="text-3xl md:text-4xl mb-2 text-gray-900">
                  {t(language, "locationDetails")}
                </h2>
                <p className="text-xl text-gray-600">
                  {t(language, "whereYouLive")}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg mb-3 text-gray-700">
                    {t(language, "village")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      placeholder={
                        t(language, "villagePlaceholder")
                      }
                      className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#1B7F3A] focus:outline-none"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF7A00]">
                      <Mic className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-lg mb-3 text-gray-700">
                    {t(language, "district")}
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Your district"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#1B7F3A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-lg mb-3 text-gray-700">
                    {t(language, "state")}
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#1B7F3A] focus:outline-none"
                  >
                    <option value="">{t(language, "selectState")}</option>
                    <option value="UP">Uttar Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="MP">Madhya Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="WB">West Bengal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Family Details */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-10 h-10 text-[#2196F3]" />
                </div>
                <h2 className="text-3xl md:text-4xl mb-2 text-gray-900">
                  {t(language, "familyDetails")}
                </h2>
                <p className="text-xl text-gray-600">
                  {t(language, "basicFamilyInfo")}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg mb-3 text-gray-700">
                    {t(language, "familySize")}
                  </label>
                  <select
                    name="familySize"
                    value={formData.familySize}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#1B7F3A] focus:outline-none"
                  >
                    <option value="">{t(language, "selectFamilySize")}</option>
                    <option value="1-2">{t(language, "members1to2")}</option>
                    <option value="3-4">{t(language, "members3to4")}</option>
                    <option value="5-6">{t(language, "members5to6")}</option>
                    <option value="7+">{t(language, "members7plus")}</option>
                  </select>
                </div>

                <div className="bg-[#E8F5E9] p-6 rounded-xl">
                  <h3 className="text-xl mb-4 text-gray-900">
                    {t(language, "whatGraamSetuCanDo")}
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-[#1B7F3A] text-xl">✓</span>
                      <span>{t(language, "buildCredit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1B7F3A] text-xl">✓</span>
                      <span>{t(language, "findSchemes")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1B7F3A] text-xl">✓</span>
                      <span>{t(language, "startSaving")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1B7F3A] text-xl">✓</span>
                      <span>{t(language, "legalRights")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-10">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-4 text-lg bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {t(language, "back")}
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-4 text-lg bg-[#1B7F3A] text-white rounded-xl hover:bg-[#155d2b] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {step === 3
                ? t(language, "completeSetup")
                : t(language, "next")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm mb-2">
            🔒 {t(language, "encryptedSafe")}
          </p>
          <p className="text-gray-600 text-sm">
            {t(language, "dataSafe")}
          </p>
        </div>
      </div>
    </div>
  );
}
