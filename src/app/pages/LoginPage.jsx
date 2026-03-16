import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogIn, Mail, Lock, Eye, EyeOff, Phone, Smartphone } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { loginUser } from "../services/authApi";
import { useLanguage } from "../LanguageContext";
import { t } from "../i18n";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("phone"); // phone or email
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    phone: location.state?.phone || "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const identifier = loginMethod === "phone" ? formData.phone.trim() : formData.email.trim().toLowerCase();
    if (!identifier) {
      setErrorMessage(loginMethod === "phone" ? t(language, "enterPhonePrompt") : t(language, "enterEmailPrompt"));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginUser({
        identifier,
        password: formData.password,
      });

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userName", response.user.fullName.split(" ")[0]);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("authUser", JSON.stringify(response.user));
      sessionStorage.setItem("justLoggedIn", "true");
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message || t(language, "loginFailedCheckCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF4E3] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Info */}
          <div className="hidden md:block">
            <div className="mb-8">
              <img
                src="/graamsetu-logo.png"
                alt="GraamSetu logo"
                className="h-20 w-auto object-contain mb-4"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <h1 className="mb-4" style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700' }}>
                <span className="text-[#C1440E]">ग्राम</span>सेतु
              </h1>
              <p className="text-xl text-[#665a48] mb-6" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                {t(language, "financialSupportRuralFamily")}
              </p>
            </div>
            
            <div className="relative overflow-hidden shadow-md mb-8" style={{ borderRadius: '8px' }}>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1708593343442-7595427ddf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYSUyMHZpbGxhZ2UlMjBjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MXx8fHwxNzczNDA3MDY4fDA&ixlib=rb-4.1.0&q=80&w=600"
                alt="Rural India community"
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C1440E]/10 flex items-center justify-center" style={{ borderRadius: '4px' }}>
                  <Lock className="w-5 h-5 text-[#C1440E]" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontWeight: '700' }}>100% Secure</p>
                  <p className="text-sm text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>Bank-level encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5A623]/10 flex items-center justify-center" style={{ borderRadius: '4px' }}>
                  <LogIn className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontWeight: '700' }}>Government approved</p>
                  <p className="text-sm text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>RBI & DPDP compliant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-[#FFFBF0] border border-[#C1440E18] p-3.5" style={{ borderRadius: '8px' }}>
            <div className="mb-8">
              <h2 className="mb-2" style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700' }}>
                {t(language, "welcomeBack")}
              </h2>
              <p className="text-lg text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                {t(language, "goodToSeeYou")}
              </p>
              <p className="text-[#665a48] mt-3" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                {t(language, "loginAccessDashboard")}
              </p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-8 bg-[#FDF4E3] p-1" style={{ borderRadius: '6px' }}>
              <button
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 py-3 px-4 transition-all flex items-center justify-center gap-2 ${
                  loginMethod === "phone"
                    ? "bg-white text-[#C1440E]"
                    : "text-[#665a48]"
                }`}
                style={{ borderRadius: '4px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Phone</span>
              </button>
              <button
                onClick={() => setLoginMethod("email")}
                className={`flex-1 py-3 px-4 transition-all flex items-center justify-center gap-2 ${
                  loginMethod === "email"
                    ? "bg-white text-[#C1440E]"
                    : "text-[#665a48]"
                }`}
                style={{ borderRadius: '4px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Email</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {location.state?.registrationSuccess && (
                <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {t(language, "registrationSuccessLoginNow")}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {loginMethod === "phone" ? (
                <div>
                  <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                    {t(language, "phoneNumber")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={
                        t(language, "enterTenDigitMobile")
                      }
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors text-lg"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                    {t(language, "email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={
                        t(language, "enterEmailAddress")
                      }
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors text-lg"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                  {t(language, "password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={
                      t(language, "enterPassword")
                    }
                    className="w-full pl-12 pr-12 py-4 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors text-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#665a48] hover:text-[#C1440E]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-2 border-[#C1440E]/20 text-[#C1440E] focus:ring-[#C1440E]"
                  />
                  <span className="text-[#665a48]">
                    {t(language, "rememberMe")}
                  </span>
                </label>
                <a href="#" className="text-[#C1440E] hover:underline">
                  {t(language, "forgotPassword")}
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C1440E] text-white py-4 rounded-2xl hover:bg-[#a33a0c] transition-all text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <LogIn className="w-5 h-5" />
                <span style={{fontFamily: 'Georgia, serif'}}>
                  {isSubmitting
                    ? t(language, "loggingIn")
                    : t(language, "loginToDashboard")}
                </span>
              </button>

              <div className="text-center pt-4 border-t border-[#C1440E]/20">
                <p className="text-[#665a48]">
                  {t(language, "dontHaveAccount")}{" "}
                  <Link to="/register" className="text-[#C1440E] hover:underline font-medium">
                    {t(language, "registerNow")}
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 p-4 bg-[#FDF4E3] rounded-2xl border border-[#C1440E]/20">
              <p className="text-sm text-[#665a48] mb-2">
                {t(language, "registerThenLoginHint")}
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#C1440E] hover:underline"
          >
            ← {t(language, "backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}