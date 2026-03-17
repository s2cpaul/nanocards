import { useNavigate } from "react-router";
import { Smartphone, Monitor, Crown } from "lucide-react";
import nAnoLogo from "@/assets/nAnoLogo.png";

/**
 * LandingPage - Public marketing page for nAnoCards platform
 * 
 * This is the first page visitors see when arriving at the site.
 * Features brand identity, value proposition, and clear CTA to enter the app.
 * No login required - users can browse freely.
 */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Title */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          nAnoCards
        </h1>
        <p className="text-gray-600 text-base px-6">
          Mobile-first AI product cards<br />
          for innovators & entrepreneurs!
        </p>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex justify-center pt-4 pb-6">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full p-1.5">
          <button
            className="px-8 py-3 rounded-full text-sm font-semibold bg-[#1e3a8a] text-white transition-all"
          >
            Welcome
          </button>
          <button
            onClick={() => navigate("/subscription")}
            className="px-8 py-3 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate("/app")}
            className="px-8 py-3 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all"
          >
            Main App
          </button>
        </div>
      </div>

      {/* Phone Mockup */}
      <div className="flex items-center justify-center px-6 pb-12">
        <div className="relative w-full max-w-sm">
          {/* Phone Frame - iPhone 14 Pro style */}
          <div className="relative bg-[#0a0a14] rounded-[3.5rem] p-3 shadow-2xl">
            
            {/* Volume Buttons - Left Side */}
            <div className="absolute -left-[3px] top-28 w-[3px] h-8 bg-[#0a0a14] rounded-l-sm"></div>
            <div className="absolute -left-[3px] top-40 w-[3px] h-14 bg-[#0a0a14] rounded-l-sm"></div>
            <div className="absolute -left-[3px] top-56 w-[3px] h-14 bg-[#0a0a14] rounded-l-sm"></div>
            
            {/* Power Button - Right Side */}
            <div className="absolute -right-[3px] top-44 w-[3px] h-20 bg-[#0a0a14] rounded-r-sm"></div>
            
            {/* Screen Content */}
            <div className="relative bg-gradient-to-b from-[#1e3a8a] via-[#0f1f4a] to-[#0a0e2a] rounded-[3rem] overflow-hidden aspect-[9/19.5]">
              
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-[26px] bg-black rounded-full z-20"></div>
              
              {/* Status Icons - Top Right (dark style) */}
              <div className="absolute top-3.5 right-6 flex items-center gap-1.5 z-10">
                <svg className="w-4 h-4" viewBox="0 0 20 16" fill="none">
                  <rect x="0" y="8" width="3" height="6" rx="1" fill="#0a0a14"/>
                  <rect x="5" y="5" width="3" height="9" rx="1" fill="#0a0a14"/>
                  <rect x="10" y="2" width="3" height="12" rx="1" fill="#0a0a14"/>
                  <rect x="15" y="0" width="3" height="14" rx="1" fill="#0a0a14"/>
                </svg>
                <svg className="w-5 h-4" viewBox="0 0 20 14" fill="none">
                  <path d="M1 5C4.5 1.5 15.5 1.5 19 5" stroke="#0a0a14" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M5 9C7.5 6.5 12.5 6.5 15 9" stroke="#0a0a14" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="10" cy="12" r="1.5" fill="#0a0a14"/>
                </svg>
                <svg className="w-6 h-3.5" viewBox="0 0 28 14" fill="none">
                  <rect x="0.5" y="0.5" width="23" height="13" rx="3.5" stroke="#0a0a14" strokeWidth="1.5"/>
                  <rect x="2.5" y="2.5" width="19" height="9" rx="2" fill="#0a0a14"/>
                  <rect x="24.5" y="4" width="2.5" height="6" rx="1" fill="#0a0a14"/>
                </svg>
              </div>

              {/* Content */}
              <div className="flex flex-col items-center justify-start h-full px-8 pt-24">
                
                {/* Logo */}
                <div className="mb-8">
                  <img src={nAnoLogo} alt="nAnoCards logo" className="w-24 h-24 rounded-2xl" />
                </div>

                {/* Title */}
                <h2 className="text-[2rem] font-bold text-white text-center mb-4 tracking-tight">
                  nAnoCards
                </h2>
                
                {/* Subtitle */}
                <p className="text-base text-gray-300 text-center mb-10 leading-relaxed">
                  Mobile-first learning<br />
                  with AI product cards!
                </p>

                {/* Look Around Button - WHITE background with BLUE text */}
                <button
                  onClick={() => navigate("/app")}
                  className="bg-blue-100 text-[#1e3a8a] font-bold text-base px-10 py-4 rounded-xl hover:bg-blue-200 transition-colors shadow-lg tracking-wide"
                >
                  LOOK AROUND
                </button>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-gray-500 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Mobile-First */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6 text-[#1e3a8a]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Mobile-First
            </h3>
            <p className="text-gray-600 text-sm">
              Designed for mobile with clean, compact layouts
            </p>
          </div>

          {/* Works Everywhere */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-6 h-6 text-[#1e3a8a]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Works Everywhere
            </h3>
            <p className="text-gray-600 text-sm">
              Responsive design that scales to any screen
            </p>
          </div>

          {/* Premium Features */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Crown className="w-6 h-6 text-[#1e3a8a]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Premium Features
            </h3>
            <p className="text-gray-600 text-sm">
              Training center, analytics, and LMS integration
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}