import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Phone, MapPin } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { registerUser } from "../services/authApi";
import { useLanguage } from "../LanguageContext";
import { t } from "../i18n";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    village: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  const { language } = useLanguage();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t(language, "passwordsDoNotMatch"));
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage(t(language, "pleaseAgreeTerms"));
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        village: formData.village,
        password: formData.password,
      });

      navigate("/login", {
        state: {
          registrationSuccess: true,
          phone: formData.phone,
        },
      });
    } catch (error) {
      setErrorMessage(error.message || t(language, "registrationFailedTryAgain"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF4E3] via-[#FFFBF0] to-[#FFF8E7] py-8 px-4">
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
              <h1 className="text-5xl mb-4" style={{fontFamily: 'Georgia, serif'}}>
                <span className="text-[#C1440E]">ग्राम</span>सेतु
              </h1>
              <p className="text-2xl text-[#665a48] mb-6" style={{fontFamily: 'Georgia, serif'}}>
                {t(language, "financialSupportRuralFamily")}
              </p>
            </div>
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1764589181993-d22616fdd12b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMHRlcnJhY2VzJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3MzQwNzA2OHww&ixlib=rb-4.1.0&q=80&w=600"
                alt="Rural India landscape"
                className="w-full h-auto"
              />
            </div>

            <div className="bg-[#FFFBF0] rounded-3xl p-6 border-t-4 border-[#F5A623]">
              <h3 className="text-xl mb-4" style={{fontFamily: 'Georgia, serif'}}>Join 190M+ Rural Indians</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-[#665a48]">
                  <span className="text-[#C1440E] text-xl">✓</span>
                  Build your credit score without paperwork
                </li>
                <li className="flex items-center gap-3 text-[#665a48]">
                  <span className="text-[#F5A623] text-xl">✓</span>
                  Access ₹178K Cr worth of government schemes
                </li>
                <li className="flex items-center gap-3 text-[#665a48]">
                  <span className="text-[#4CAF50] text-xl">✓</span>
                  Secure savings and financial identity
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="bg-[#FFFBF0] rounded-3xl shadow-2xl p-8 md:p-10 border-t-4 border-[#C1440E]">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl mb-2" style={{fontFamily: 'Georgia, serif'}}>
                {t(language, "createAccount")}
              </h2>
              <p className="text-xl text-[#665a48]" style={{fontFamily: 'Georgia, serif'}}>
                {t(language, "openGraamSetuAccount")}
              </p>
              <p className="text-[#665a48] mt-3">
                {t(language, "joinGraamSetuFuture")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                  {t(language, "fullName")}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={t(language, "enterFullName")}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                  {t(language, "mobileNumber")}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t(language, "enterMobile")}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                  {t(language, "email")} ({t(language, "optional")})
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t(language, "emailPlaceholder")}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors"
                  />
                </div>
              </div>

              {/* Village/City */}
              <div>
                <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                  {t(language, "villageCity")}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    placeholder={t(language, "enterVillageCity")}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
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
                    placeholder={t(language, "createStrongPassword")}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors"
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

              {/* Confirm Password */}
              <div>
                <label className="block mb-2 text-[#2c2416]" style={{fontFamily: 'Georgia, serif'}}>
                  {t(language, "confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#665a48]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t(language, "reenterPassword")}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-[#C1440E]/20 rounded-2xl focus:outline-none focus:border-[#C1440E] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#665a48] hover:text-[#C1440E]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-1 rounded border-2 border-[#C1440E]/20 text-[#C1440E] focus:ring-[#C1440E]"
                  required
                />
                <label className="text-[#665a48] text-sm">
                  {t(language, "iAgreeGraamSetu")}{" "}
                  <a href="#" className="text-[#C1440E] hover:underline">
                    {t(language, "termsConditions")}
                  </a>{" "}
                  {t(language, "and")}{" "}
                  <a href="#" className="text-[#C1440E] hover:underline">
                    {t(language, "privacyPolicy")}
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C1440E] text-white py-4 rounded-2xl hover:bg-[#a33a0c] transition-all text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <UserPlus className="w-5 h-5" />
                <span style={{fontFamily: 'Georgia, serif'}}>
                  {isSubmitting ? t(language, "creatingAccount") : t(language, "createAccount")}
                </span>
              </button>

              <div className="text-center pt-4 border-t border-[#C1440E]/20">
                <p className="text-[#665a48]">
                  {t(language, "alreadyHaveAccount")}{" "}
                  <Link to="/login" className="text-[#C1440E] hover:underline font-medium">
                    {t(language, "loginHere")}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#C1440E] hover:underline"
          >
            {t(language, "backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
