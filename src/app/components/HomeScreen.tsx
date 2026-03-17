import { useState } from "react";
import { Monitor, Smartphone, Check, Crown, Zap, Home as HomeIcon, Plus, User, Heart, Play, BookOpen, Star, ShoppingCart, Menu, Search, Globe, Linkedin, MessageCircle, FileText, Youtube, Share2, Instagram, Mail, Link } from "lucide-react";
import { useNavigate } from "react-router";
const appScreenshot = "";
const mainAppScreenshot = "";
import { DemoMainAppScreen } from "./DemoMainAppScreen";

/**
 * HomeScreen - LANDING PAGE for nAnoCards
 * 
 * This is the main landing page with three tabs:
 * - Welcome: Introduction screen with nA logo and "LOOK AROUND" button
 * - Pricing: Subscription plans display
 * - Main App: Navigates to /top-cards (Top NanoCards feed)
 */
export function HomeScreen() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"welcome" | "app" | "subscription">("welcome");
  const [selectedPlan, setSelectedPlan] = useState<typeof pricingPlans[0] | null>(null);

  // Pricing plans for demo
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      color: "from-gray-600 to-gray-700",
      features: ["Unlimited viewing", "1 free card", "Social features"],
    },
    {
      name: "Student",
      price: "FREE",
      color: "from-green-600 to-emerald-600",
      badge: ".edu/.k12/.mil/@oratf.info",
      features: ["2 cards", "Integrated engagement", "Training Center"],
    },
    {
      name: "Creator",
      price: "$4.99",
      popular: true,
      color: "from-blue-600 to-purple-600",
      features: ["10 cards", "Integrated engagement", "Training Center"],
    },
    {
      name: "Pro",
      price: "$9.99",
      color: "from-blue-900 to-blue-900",
      features: ["Up to 49 cards", "Training Center", "Integrated analysis"],
    },
    {
      name: "Enterprise",
      price: "$12.99",
      color: "from-gray-800 to-gray-900",
      features: ["LMS integration", "SSO/SAML", "Dedicated support"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            nAnoCards
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Mobile-first AI product cards<br />
            for innovators & entrepreneurs!
          </p>
          
          {/* View Toggle */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setActiveView("welcome")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeView === "welcome"
                  ? "bg-blue-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Welcome
            </button>
            <button
              onClick={() => setActiveView("subscription")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeView === "subscription"
                  ? "bg-blue-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => setActiveView("app")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeView === "app"
                  ? "bg-blue-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Main App
            </button>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="flex justify-center items-center">
          <div className="relative">
            {/* Phone Frame with realistic shadows */}
            <div className="relative bg-black rounded-[3.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-[390px] h-[844px] border-[3px] border-gray-800">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[130px] h-[35px] bg-black rounded-b-[2rem] z-20 shadow-lg"></div>
              
              {/* Screen Bezel */}
              <div className="relative bg-white rounded-[2.75rem] w-full h-full overflow-hidden shadow-inner">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-transparent z-10 flex items-center justify-between px-8 pt-3">
                  {activeView === "app" ? (
                    <div className="w-full"></div>
                  ) : (
                    <>
                      <span className="text-[15px] font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-[17px] h-[11px]" viewBox="0 0 17 11" fill="none">
                          <rect x="0.5" y="0.5" width="3.5" height="10" rx="0.5" fill="black"/>
                          <rect x="5" y="2" width="3.5" height="9" rx="0.5" fill="black"/>
                          <rect x="9.5" y="3.5" width="3.5" height="7.5" rx="0.5" fill="black"/>
                          <rect x="14" y="5" width="3.5" height="6" rx="0.5" fill="black" fillOpacity="0.4"/>
                        </svg>
                        <svg className="w-[15px] h-[11px]" viewBox="0 0 15 11" fill="none">
                          <path d="M7.5 0C5.016 0 2.532 0.825 0 2.475V5.5C0 5.5 2.484 3.85 7.5 3.85C12.516 3.85 15 5.5 15 5.5V2.475C12.468 0.825 9.984 0 7.5 0Z" fill="black"/>
                        </svg>
                        <div className="w-[25px] h-[12px] border-[1.5px] border-black rounded-[3px] relative">
                          <div className="absolute inset-[1.5px] bg-black rounded-[1.5px]"></div>
                          <div className="absolute -right-[2px] top-[3px] w-[1.5px] h-[6px] bg-black rounded-r-[1px]"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* App Content */}
                <div className="absolute inset-0 overflow-hidden">
                  {selectedPlan ? (
                    // Stripe Checkout Screen
                    <div className="w-full h-full overflow-y-auto pt-12 px-4 pb-6 bg-white">
                      {/* Header with Back Button */}
                      <div className="flex items-center mb-6">
                        <button 
                          onClick={() => setSelectedPlan(null)}
                          className="text-blue-600 text-sm font-medium"
                        >
                          ← Back
                        </button>
                        <h2 className="flex-1 text-center text-lg font-bold text-gray-900 pr-12">
                          Checkout
                        </h2>
                      </div>

                      {/* Stripe Logo */}
                      <div className="flex items-center justify-center mb-6">
                        <svg className="w-16 h-16" viewBox="0 0 60 25" fill="none">
                          <path fill="#635BFF" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 01-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 00-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
                        </svg>
                      </div>

                      {/* Selected Plan Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Plan</span>
                          <span className="text-sm font-bold text-gray-900">{selectedPlan.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">Amount</span>
                          <span className="text-lg font-bold text-gray-900">
                            {selectedPlan.price}
                            {selectedPlan.price !== "FREE" && selectedPlan.price !== "$0" && (
                              <span className="text-xs text-gray-500">/month</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="mb-4">
                        <label htmlFor="home-email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          id="home-email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Card Information */}
                      <div className="mb-4">
                        <label htmlFor="home-cardnumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Card information
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="relative">
                            <input
                              id="home-cardnumber"
                              type="text"
                              placeholder="1234 1234 1234 1234"
                              className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-b border-gray-300"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                              <svg className="w-6 h-4" viewBox="0 0 32 20" fill="none">
                                <rect width="32" height="20" rx="3" fill="#EB001B"/>
                                <rect x="12" width="8" height="20" fill="#F79E1B" opacity="0.8"/>
                              </svg>
                              <svg className="w-6 h-4" viewBox="0 0 32 20" fill="none">
                                <rect width="32" height="20" rx="3" fill="#0066B2"/>
                              </svg>
                            </div>
                          </div>
                          <div className="flex">
                            <input
                              id="home-cardexpiry"
                              type="text"
                              placeholder="MM / YY"
                              className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-r border-gray-300"
                            />
                            <input
                              id="home-cardcvc"
                              type="text"
                              placeholder="CVC"
                              className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div className="mb-6">
                        <label htmlFor="home-cardholder" className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder name
                        </label>
                        <input
                          id="home-cardholder"
                          type="text"
                          placeholder="Full name on card"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Country */}
                      <div className="mb-6">
                        <label htmlFor="home-country" className="block text-sm font-medium text-gray-700 mb-2">
                          Country or region
                        </label>
                        <select id="home-country" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Other</option>
                        </select>
                      </div>

                      {/* Subscribe Button */}
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors shadow-md mb-3">
                        Subscribe
                      </button>

                      {/* Powered by Stripe */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Powered by{" "}
                          <span className="font-semibold text-blue-600">Stripe</span>
                        </p>
                      </div>

                      {/* Security Notice */}
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-xs text-blue-800">
                            Your payment information is secure and encrypted
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : activeView === "app" ? (
                    // Main App Screen - Top nAnoCards Feed (exact match to screenshot)
                    <DemoMainAppScreen />
                  ) : activeView === "subscription" ? (
                    <div className="w-full h-full overflow-y-auto pt-12 px-3 pb-6 bg-white">
                      {/* Pricing Header */}
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-900 rounded-full mb-2">
                          <Crown className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                          nAnoCards Pricing
                        </h2>
                        <p className="text-xs text-gray-600">
                          Choose your plan
                        </p>
                      </div>

                      {/* Pricing Cards */}
                      <div className="space-y-3">
                        {pricingPlans.map((plan, index) => (
                          <div
                            key={index}
                            className={`relative bg-white border-2 ${
                              plan.popular ? "border-blue-900" : "border-gray-200"
                            } rounded-lg p-3 shadow-md`}
                          >
                            {plan.popular && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                <div className="bg-blue-900 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                  Most Popular
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                  {plan.name}
                                </h3>
                                {plan.badge && (
                                  <p className="text-[9px] text-green-600 font-medium">
                                    {plan.badge}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  {plan.price}
                                </div>
                                {plan.price !== "FREE" && plan.price !== "$0" && (
                                  <div className="text-[9px] text-gray-500">/month</div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1 mb-2">
                              {plan.features.map((feature, fIndex) => (
                                <div key={fIndex} className="flex items-start gap-1.5">
                                  <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-[10px] text-gray-700 leading-tight">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <button
                              className={`w-full py-1.5 rounded-md text-[11px] font-semibold text-white bg-gradient-to-r ${plan.color}`}
                              onClick={() => setSelectedPlan(plan)}
                            >
                              Select Plan
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Note */}
                      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <p className="text-[9px] text-gray-600 text-center">
                          Demo preview only. Visit app for full details.
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Welcome Screen
                    <div 
                      className="w-full h-full overflow-y-auto bg-gradient-to-br from-gray-950 via-blue-950 to-black flex items-center justify-center px-6"
                    >
                      <div className="w-full max-w-sm -mt-[100px]">
                        {/* Logo/Header */}
                        <div className="text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/top-cards');
                            }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-2xl mb-4 shadow-xl relative hover:scale-105 transition-transform cursor-pointer -mt-4"
                            style={{
                              border: '3px solid #374151',
                              boxShadow: `
                                inset 2px 2px 4px rgba(255, 255, 255, 0.3),
                                inset -2px -2px 4px rgba(0, 0, 0, 0.5),
                                0 0 0 1px #6B7280,
                                0 0 0 2px #374151,
                                0 0 0 3px #9CA3AF,
                                0 20px 40px rgba(0, 0, 0, 0.4)
                              `
                            }}
                          >
                            <span className="text-4xl font-bold text-white">nA</span>
                          </button>
                          <h1 className="text-2xl font-bold text-white mb-1"
                            style={{
                              fontSize: '1.68rem',
                              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            nAnoCards
                          </h1>
                          <p className="text-white text-base mb-6" style={{ fontSize: '1.15rem' }}>
                            AI product cards for innovators!
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="space-y-3 mb-6">
                            <button
                              onClick={() => {
                                localStorage.setItem('guestMode', 'true');
                                window.location.href = '/app';
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg"
                              style={{ fontSize: '0.92rem' }}
                            >
                              View Cards
                            </button>
                            
                            <button
                              onClick={() => {
                                window.location.href = '/login';
                              }}
                              className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg"
                              style={{ fontSize: '0.92rem' }}
                            >
                              Log In
                            </button>
                            
                            <button
                              onClick={() => {
                                window.location.href = '/signup';
                              }}
                              className="w-full bg-transparent hover:bg-white/5 text-blue-300 font-medium py-2 px-8 rounded-lg transition-colors"
                              style={{ fontSize: '0.85rem' }}
                            >
                              Sign Up
                            </button>
                          </div>

                          {/* Footer */}
                          <p className="text-xs text-blue-400 mt-8"
                            style={{
                              fontSize: '0.7rem'
                            }}
                          >
                            Login promotes creativity & entrepreneurship
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-[5px] bg-white/40 rounded-full"></div>
              
              {/* Volume Buttons */}
              <div className="absolute -left-[17px] top-[120px] w-[3px] h-[32px] bg-black rounded-l-sm"></div>
              <div className="absolute -left-[17px] top-[170px] w-[3px] h-[60px] bg-black rounded-l-sm"></div>
              <div className="absolute -left-[17px] top-[240px] w-[3px] h-[60px] bg-black rounded-l-sm"></div>
              
              {/* Power Button */}
              <div className="absolute -right-[17px] top-[200px] w-[3px] h-[80px] bg-black rounded-r-sm"></div>
            </div>

            {/* Subtle glow effects */}
            <div className="absolute -z-10 top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 rounded-[4rem] blur-3xl scale-105"></div>
            
            {/* Decorative Elements */}
            <div className="absolute -z-20 top-1/4 -left-32 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -z-20 top-1/3 -right-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-blue-900" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Mobile-First</h3>
            <p className="text-sm text-gray-600">
              Designed for mobile with clean, compact layouts
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Monitor className="w-6 h-6 text-purple-900" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Works Everywhere</h3>
            <p className="text-sm text-gray-600">
              Responsive design that scales to any screen
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-green-900" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Premium Features</h3>
            <p className="text-sm text-gray-600">
              Training center, analytics, and LMS integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}