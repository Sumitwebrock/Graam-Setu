import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  TrendingUp, 
  Gift, 
  Heart, 
  PiggyBank, 
  Scale, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Shield,
  LogOut
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SUPPORTED_LANGUAGES, useLanguage } from "../LanguageContext";
import { t } from "../i18n";

export default function LandingPage() {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
    const [logoFailed, setLogoFailed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== "undefined" && localStorage.getItem("isAuthenticated") === "true"
  );
  const [agentDashboard, setAgentDashboard] = useState(null);
  const [agentError, setAgentError] = useState(null);

  // Load BC Agent dashboard summary if an agent token is present.
  useEffect(() => {
    const token = localStorage.getItem("gs_agent_token");
    if (!token) return;

    fetch("/api/agent/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load agent dashboard");
        }
        return res.json();
      })
      .then((data) => {
        setAgentDashboard(data);
      })
      .catch((err) => {
        console.error("BC Agent dashboard error", err);
        setAgentError("Could not load BC Agent dashboard");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setIsAuthenticated(false);
    navigate("/");
  };

  // Scroll handler for smooth anchor links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Carousel slides
  const carouselSlides = [
    {
      image: "https://images.unsplash.com/photo-1708593343442-7595427ddf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYSUyMHZpbGxhZ2UlMjBjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MXx8fHwxNzczNDA3MDY4fDA&ixlib=rb-4.1.0&q=80&w=1200",
      caption: "Today, i.e., on 20.02.2026, under the guidance of Hon'ble Finance Minister of India, GraamSetu executed MoU with Finance Department, Govt of India regarding Digital Financial Inclusion for Rural Families."
    },
    {
      image: "https://images.unsplash.com/photo-1764589181993-d22616fdd12b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMHRlcnJhY2VzJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3MzQwNzA2OHww&ixlib=rb-4.1.0&q=80&w=1200",
      caption: "GraamSetu launches comprehensive financial literacy program across 5000+ villages, empowering rural families with financial knowledge and digital skills."
    },
    {
      image: "https://images.unsplash.com/photo-1609252285522-ed0ebdd43551?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBydXJhbCUyMHdvbWFuJTIwZW1wb3dlcm1lbnR8ZW58MXx8fHwxNzczNDA3MDY4fDA&ixlib=rb-4.1.0&q=80&w=1200",
      caption: "GraamSetu helps rural women build a secure financial identity, enabling economic independence and entrepreneurship."
    },
    {
      image: "https://images.unsplash.com/photo-1707286563398-7f97699cf29a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMEluZGlhJTIwdmlsbGFnZSUyMHdoZWF0JTIwZmllbGR8ZW58MXx8fHwxNzczNDA3MDY3fDA&ixlib=rb-4.1.0&q=80&w=1200",
      caption: "GraamScore helps 50,000+ farmers access credit based on real agricultural data, eliminating traditional documentation barriers."
    }
  ];

  const notices = [
    "Notice Board",
    "Reservation Roster Register as on 31-12-2025",
    "GraamSetu Recruitment 2026 - Applications Open",
    "New Government Schemes Added: PM-KISAN, MGNREGA Updates",
    "Financial Literacy Workshop - Register Now"
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    beforeChange: (current, next) => setCurrentSlide(next),
    appendDots: dots => (
      <div style={{ bottom: "20px" }}>
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-all mt-4"></div>
    )
  };

  const modules = [
    {
      icon: TrendingUp,
      title: "GraamScore",
      titleHindi: "ग्राम स्कोर",
      link: "/graamscore",
      color: "#C1440E"
    },
    {
      icon: Gift,
      title: "HaqDar",
      titleHindi: "हक़दार",
      link: "/haqdar",
      color: "#F5A623"
    },
    {
      icon: PiggyBank,
      title: "BachatBox",
      titleHindi: "बचत बॉक्स",
      link: "/bachatbox",
      color: "#2196F3"
    },
    {
      icon: Scale,
      title: "VidhiSahay",
      titleHindi: "विधि सहाय",
      link: "/vidhisahay",
      color: "#7B3F00"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Info Bar */}
      <div className="bg-[#C1440E] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t(language, "atmTollFree")}: 1800 123 6230 / 1800 833 1004
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline flex items-center gap-1">
              <Mail className="w-4 h-4" /> {t(language, "career")}
            </a>
            <span>|</span>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="hover:underline">{t(language, "login")}</Link>
                <span>|</span>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="hover:underline flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                {t(language, "logout")}
              </button>
            )}
            <a href="#" className="hover:underline">{t(language, "internetBanking")}</a>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> 1800 233 2300
            </span>
            <Link to="/agent/login" className="hover:underline flex items-center gap-1 text-xs md:text-sm">
              <Shield className="w-4 h-4" />
              {t(language, "bcAgentLogin")}
            </Link>
            <Facebook className="w-4 h-4 cursor-pointer" />
            <Twitter className="w-4 h-4 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 flex items-center">
                  {logoFailed ? (
                    <div className="w-16 h-16 bg-gradient-to-br from-[#C1440E] to-[#F5A623] rounded-lg flex items-center justify-center text-white text-2xl">
                      🌾
                    </div>
                  ) : (
                    <img
                      src="/graamsetu-logo.png"
                      alt="GraamSetu logo"
                    className="h-20 w-auto object-contain"
                      onError={() => setLogoFailed(true)}
                    />
                  )}
              </div>
              <div>
                <h1 className="text-3xl mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                  <span className="text-[#C1440E]">ग्रामसेतु</span>
                </h1>
                <p className="text-lg text-[#C1440E]" style={{ fontFamily: 'Georgia, serif' }}>
                  {t(language, "financialBridge")}
                </p>
                <p className="text-xs text-[#665a48]">
                  {t(language, "govInitiative")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center px-3 py-1.5 border border-[#C1440E]/40 rounded-full text-[#C1440E] bg-white">
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                  aria-label="Select language"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-[#2c2416]">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Ctext x='10' y='40' font-family='Arial' font-size='24' fill='%23C1440E'%3EDigital India%3C/text%3E%3C/svg%3E"
                  alt="Digital India" 
                  className="h-16"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Icons Navigation */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  to={module.link}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FDF4E3] hover:bg-[#C1440E] hover:text-white rounded transition-all whitespace-nowrap group"
                >
                  <Icon className="w-5 h-5" style={{ color: module.color }} />
                  <span className="text-sm font-medium">
                    {language !== "en" ? module.titleHindi : module.title}
                  </span>
                </Link>
              );
            })}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2196F3] text-white rounded hover:bg-[#1976D2] transition-all whitespace-nowrap text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{t(language, "login")}</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#F5A623] text-white rounded hover:bg-[#C1440E] transition-all whitespace-nowrap text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">{t(language, "register")}</span>
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#C1440E] text-white rounded hover:bg-[#8B2E0B] transition-all whitespace-nowrap text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">{t(language, "logout")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interest Rates & Notice Board Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 bg-[#4CAF50] text-white px-4 py-2 rounded">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">{t(language, "interestRates")}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#F5A623] text-white px-4 py-2 rounded md:col-span-2">
              <Award className="w-5 h-5" />
              <div className="flex-1 overflow-hidden">
                <div className="animate-scroll whitespace-nowrap">
                  {notices.map((notice, index) => (
                    <span key={index} className="inline-block mx-8">
                      {notice}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Carousel */}
      <section className="relative bg-gradient-to-br from-[#8B2E0B] via-[#C1440E] to-[#D97706] overflow-hidden">
        {/* Geometric Background Patterns */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 right-20 w-40 h-40 border-4 border-white transform rotate-12"></div>
          <div className="absolute top-40 right-60 w-32 h-32 border-4 border-white transform rotate-45"></div>
          <div className="absolute bottom-20 right-40 w-24 h-24 border-4 border-white"></div>
          <div className="absolute top-1/2 right-20 w-48 h-48 border-4 border-white rounded-full"></div>
          <svg className="absolute top-32 right-10" width="100" height="100" viewBox="0 0 100 100">
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="white" strokeWidth="3"/>
          </svg>
          <svg className="absolute bottom-40 right-80" width="80" height="80" viewBox="0 0 100 100">
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="white" strokeWidth="3"/>
          </svg>
        </div>

        {/* Dark overlay for more depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>

        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          {/* Hero Text */}
          <div className="max-w-3xl mb-10">
            <h1 className="text-white mb-4" style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700' }}>
              आपका हक़। आपका पैसा। एक जगह।
            </h1>
            <p className="text-white/90 text-lg" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
              Your rights. Your money. One place.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            <Slider ref={sliderRef} {...sliderSettings}>
              {carouselSlides.map((slide, index) => (
                <div key={index} className="outline-none">
                  <div className="px-4">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto max-w-5xl">
                      <ImageWithFallback
                        src={slide.image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-64 md:h-80 object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
            
            {/* Custom Navigation Arrows */}
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-[#C1440E]" />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-xl transition-all"
            >
              <ChevronRight className="w-5 h-5 text-[#C1440E]" />
            </button>
          </div>

          {/* Caption */}
          <div className="mt-6 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <p className="text-white text-center leading-relaxed">
                {carouselSlides[currentSlide].caption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BC Agent Dashboard Snapshot (only for logged-in agents) */}
      {(agentDashboard || agentError) && (
        <section className="py-8 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-2xl text-[#2c2416]"
                style={{ fontFamily: "Georgia, serif", fontWeight: "700" }}
              >
                {t(language, "bcAgentDashboard")}
              </h2>
              {agentDashboard?.agent && (
                <p className="text-sm text-[#665a48]">
                  {t(language, "agentLabel")}: {agentDashboard.agent.name}
                </p>
              )}
            </div>

            {agentDashboard ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-[#FFFBF0] border border-[#C1440E18] p-3" style={{ borderRadius: "8px" }}>
                  <p className="text-xs text-[#665a48] mb-1">
                    {t(language, "usersAssisted")}
                  </p>
                  <p className="text-2xl text-[#C1440E] font-semibold">
                    {agentDashboard.stats.totalUsersAssisted}
                  </p>
                </div>
                <div className="bg-[#FFFBF0] border border-[#C1440E18] p-3" style={{ borderRadius: "8px" }}>
                  <p className="text-xs text-[#665a48] mb-1">
                    {t(language, "schemesApplied")}
                  </p>
                  <p className="text-2xl text-[#C1440E] font-semibold">
                    {agentDashboard.stats.schemesApplied}
                  </p>
                </div>
                <div className="bg-[#FFFBF0] border border-[#C1440E18] p-3" style={{ borderRadius: "8px" }}>
                  <p className="text-xs text-[#665a48] mb-1">
                    {t(language, "savingsAssists")}
                  </p>
                  <p className="text-2xl text-[#C1440E] font-semibold">
                    {agentDashboard.stats.savingsAssists}
                  </p>
                </div>
                <div className="bg-[#FFFBF0] border border-[#C1440E18] p-3" style={{ borderRadius: "8px" }}>
                  <p className="text-xs text-[#665a48] mb-1">
                    {t(language, "fraudReports")}
                  </p>
                  <p className="text-2xl text-[#C1440E] font-semibold">
                    {agentDashboard.stats.fraudReportsSubmitted}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#665a48]">
                {t(language, "bcAuthorizedOnly")}
              </p>
            )}

            {agentError && (
              <p className="mt-3 text-xs text-red-600">{agentError}</p>
            )}
          </div>
        </section>
      )}

      {/* Context Section - Real Prose */}
      <section className="py-10 bg-[#FDF4E3]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#FFFBF0] border border-[#C1440E18] p-6" style={{ borderRadius: '8px' }}>
            <p className="text-[#665a48] leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400' }}>
              India has 190 million people with no credit score. ₹1.78 lakh crore in government benefits goes unclaimed every year. Women in rural areas hold less than 2% of formal financial accounts. GraamSetu helps families access both credit and their rights, in one place, using RBI Account Aggregator framework and voice-first Hindi support.
            </p>
          </div>
        </div>
      </section>

      {/* Services - Vertical List */}
      <section className="py-10 bg-[#FDF4E3]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  to={module.link}
                  className="flex items-start gap-6 bg-[#FFFBF0] border border-[#C1440E18] p-4 hover:border-[#C1440E] transition-all group"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="text-5xl text-[#C1440E] opacity-30" style={{ fontFamily: 'Georgia, serif', fontWeight: '700', minWidth: '60px' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6" style={{ color: module.color }} />
                      <h3 className="text-xl" style={{ fontFamily: 'Georgia, serif', fontWeight: '700' }}>
                        {module.title}
                      </h3>
                      <span className="text-sm text-[#665a48]" style={{ fontFamily: 'Georgia, serif' }}>
                        {module.titleHindi}
                      </span>
                    </div>
                    <p className="text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
                      {module.title === 'GraamScore' && 'Alternative credit identity built from real financial behaviour.'}
                      {module.title === 'HaqDar' && 'Discover government schemes you qualify for based on your profile.'}
                      {module.title === 'BachatBox' && 'Goal-based savings tools with government scheme integration.'}
                      {module.title === 'VidhiSahay' && 'Know your legal rights and protections under financial law.'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-[#FDF4E3]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-2xl mb-6 text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '700' }}>
            अभी शुरू करें — यह सेवा बिलकुल मुफ़्त है।
          </p>
          <p className="text-lg mb-8 text-[#665a48]" style={{ fontFamily: 'Georgia, serif', fontWeight: '400' }}>
            Start now — this service is completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-[#C1440E] text-white px-8 py-3 hover:bg-[#8B2E0B] transition-all"
              style={{ borderRadius: '6px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
            >
              Register करें
            </Link>
            <Link
              to="/login"
              className="bg-[#FFFBF0] border border-[#C1440E] text-[#C1440E] px-8 py-3 hover:bg-[#C1440E] hover:text-white transition-all"
              style={{ borderRadius: '6px', fontFamily: 'Georgia, serif', fontWeight: '700' }}
            >
              Login करें
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2c2416] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                <span className="text-[#F5A623]">ग्राम</span>सेतु
              </h3>
              <p className="text-gray-300 mb-2">
                Financial Bridge for Rural India
              </p>
              <p className="text-gray-400 text-sm">
                भारत के गाँवों का वित्तीय सेतु
              </p>
            </div>
            <div>
              <h4 className="text-lg mb-4" style={{ fontFamily: 'Georgia, serif' }}>Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-300 hover:text-[#F5A623]">Dashboard</Link></li>
                <li><Link to="/register" className="text-gray-300 hover:text-[#F5A623]">Register</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-[#F5A623]">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#F5A623]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg mb-4" style={{ fontFamily: 'Georgia, serif' }}>Services</h4>
              <ul className="space-y-2">
                <li><Link to="/graamscore" className="text-gray-300 hover:text-[#F5A623]">GraamScore</Link></li>
                <li><Link to="/haqdar" className="text-gray-300 hover:text-[#F5A623]">HaqDar</Link></li>
                <li><Link to="/bachatbox" className="text-gray-300 hover:text-[#F5A623]">BachatBox</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg mb-4" style={{ fontFamily: 'Georgia, serif' }}>Contact</h4>
              <div className="space-y-3">
                <a href="tel:1800-123-4567" className="flex items-center gap-2 text-gray-300 hover:text-[#F5A623]">
                  <Phone className="w-5 h-5" />
                  1800-123-4567
                </a>
                <a href="mailto:info@graamsetu.in" className="flex items-center gap-2 text-gray-300 hover:text-[#F5A623]">
                  <Mail className="w-5 h-5" />
                  info@graamsetu.in
                </a>
                <div className="flex gap-3 mt-4">
                  <Facebook className="w-6 h-6 cursor-pointer hover:text-[#F5A623]" />
                  <Twitter className="w-6 h-6 cursor-pointer hover:text-[#F5A623]" />
                  <Instagram className="w-6 h-6 cursor-pointer hover:text-[#F5A623]" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 GraamSetu. All rights reserved. | Made with ❤️ for Rural India
            </p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for scrolling text */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          display: inline-block;
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}