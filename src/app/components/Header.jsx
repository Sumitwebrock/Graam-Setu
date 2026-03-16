import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Globe, LogOut } from "lucide-react";
import { SUPPORTED_LANGUAGES, useLanguage } from "../LanguageContext";
import { t } from "../i18n";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  // Don't render header on landing page (it has its own custom header)
  if (isLandingPage) {
    return null;
  }

  return (
    <header className="bg-[#FFFBF0] shadow-sm sticky top-0 z-50 border-b border-[#C1440E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {logoFailed ? (
              <span className="text-[#C1440E] text-xl md:text-2xl" style={{ fontFamily: "Georgia, serif" }}>
                ग्
              </span>
            ) : (
              <img
                src="/graamsetu-logo.png"
                alt="GraamSetu logo"
                className="h-11 w-auto md:h-13 object-contain"
                onError={() => setLogoFailed(true)}
              />
            )}
            <div>
              <h1 className="text-xl md:text-2xl text-[#C1440E]" style={{fontFamily: 'Georgia, serif'}}>
                GraamSetu
              </h1>
              <p className="text-xs text-[#665a48] hidden sm:block">{t(language, "welcomeSubtext")}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isLandingPage && !isAuthPage && isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-[#665a48] hover:text-[#C1440E] transition-colors px-3 py-2 font-medium"
              >
                {t(language, "dashboard")}
              </Link>
              <Link
                to="/graamscore"
                className="text-[#665a48] hover:text-[#C1440E] transition-colors px-3 py-2 font-medium"
              >
                {t(language, "graamScore")}
              </Link>
              <a
                href="tel:1800-123-4567"
                className="text-[#665a48] hover:text-[#C1440E] transition-colors px-3 py-2 font-medium"
              >
                📞 {t(language, "helpline")}
              </a>
            </nav>
          )}

          {/* Language Toggle & User Actions */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-2 bg-[#FDF4E3] text-[#C1440E] rounded-xl border border-[#C1440E]/20"
              aria-label="Select language"
            >
              <Globe className="w-5 h-5" />
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="bg-transparent text-sm md:text-base font-medium focus:outline-none"
                aria-label="Language selector"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-[#2c2416]">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated && !isAuthPage && (
              <>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#FDF4E3] rounded-xl">
                  <span className="text-sm text-[#665a48]">👋</span>
                  <span className="text-sm text-[#C1440E] font-medium">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#FDF4E3] text-[#C1440E] rounded-xl hover:bg-[#C1440E] hover:text-white transition-all border border-[#C1440E]/20"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t(language, "logout")}
                  </span>
                </button>
              </>
            )}

            {!isLandingPage && !isAuthPage && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-[#665a48] hover:text-[#C1440E]"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {!isLandingPage && !isAuthPage && isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              to="/dashboard"
              className="block px-4 py-3 text-[#665a48] hover:bg-[#FDF4E3] hover:text-[#C1440E] rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t(language, "dashboard")}
            </Link>
            <Link
              to="/graamscore"
              className="block px-4 py-3 text-[#665a48] hover:bg-[#FDF4E3] hover:text-[#C1440E] rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t(language, "graamScore")}
            </Link>
            <a
              href="tel:1800-123-4567"
              className="block px-4 py-3 text-[#665a48] hover:bg-[#FDF4E3] hover:text-[#C1440E] rounded-xl transition-colors"
            >
              📞 {t(language, "helpline")}: 1800-123-4567
            </a>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-[#665a48] hover:bg-[#FDF4E3] hover:text-[#C1440E] rounded-xl transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                {t(language, "logout")}
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}