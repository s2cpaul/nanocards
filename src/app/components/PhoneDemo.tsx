import { useState } from "react";
import { Monitor, Smartphone, Check, Crown, Mail, Github } from "lucide-react";
const appScreenshot = "";

export function PhoneDemo() {
  const [activeView, setActiveView] = useState<"login" | "app" | "subscription">("login");
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
            Mobile-first AI product pitch cards<br />
            for innovators & entrepreneurs!
          </p>
          
          {/* View Toggle */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setActiveView("login")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeView === "login"
                  ? "bg-blue-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveView("app")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeView === "app"
                  ? "bg-blue-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Main App
            </button>
            <button
              onClick={() => setActiveView("subscription")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeView === "subscription"
                  ? "bg-blue-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pricing
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Card Information */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card information
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="relative">
                            <input
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
                              type="text"
                              placeholder="MM / YY"
                              className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-r border-gray-300"
                            />
                            <input
                              type="text"
                              placeholder="CVC"
                              className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder name
                        </label>
                        <input
                          type="text"
                          placeholder="Full name on card"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Country */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country or region
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
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
                    <img 
                      src={appScreenshot} 
                      alt="nAnoCards App" 
                      className="w-full h-full object-contain object-top"
                      style={{ marginTop: '38px' }}
                    />
                  ) : activeView === "login" ? (
                    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-gray-950 via-blue-950 to-black flex items-center justify-center px-6">
                      <div className="w-full max-w-sm">
                        {/* Logo/Header */}
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-2xl mb-4 shadow-xl relative"
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
                          </div>
                          <h1 className="text-2xl font-bold text-white mb-1"
                            style={{
                              fontSize: '1.68rem',
                              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            nAnoCards
                          </h1>
                          <p className="text-sm text-white"
                            style={{
                              fontSize: '0.98rem'
                            }}
                          >
                            AI product pitch cards for innovators
                          </p>
                        </div>

                        {/* Login Buttons */}
                        <div className="space-y-3">
                          {/* Gmail */}
                          <button className="w-full bg-gradient-to-b from-gray-100 via-white to-gray-200 hover:from-gray-200 hover:via-gray-50 hover:to-gray-300 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg border border-gray-400">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-sm text-black">Sign in with Google</span>
                          </button>

                          {/* Outlook */}
                          <button className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <span className="text-sm">Continue with Outlook</span>
                          </button>

                          {/* GitHub */}
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg">
                            <Github className="w-5 h-5" />
                            <span className="text-sm">Continue with GitHub</span>
                          </button>

                          {/* LinkedIn */}
                          <button className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <span className="text-sm">Continue with LinkedIn</span>
                          </button>

                          {/* Discord */}
                          <button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            <span className="text-sm">Continue with Discord</span>
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                          <p className="text-xs text-blue-200">
                            Login promotes creativity & entrepreneurship
                          </p>
                          <p className="text-xs text-blue-300 mt-2">
                            No account needed to browse!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full overflow-y-auto pt-12 px-3 pb-6 bg-white">
                      {/* Pricing Header */}
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl mb-2">
                          <Zap className="w-5 h-5 text-gray-600" />
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
            <h3 className="font-bold text-gray-900 mb-2">PWA Ready</h3>
            <p className="text-sm text-gray-600">
              Install as an app on any device
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Fast & Clean</h3>
            <p className="text-sm text-gray-600">
              Optimized performance with clean ad-free design
            </p>
          </div>
        </div>

        {/* Dev Link */}
        <div className="mt-8 text-center">
          <a 
            href="/app" 
            className="text-xs text-gray-400 hover:text-blue-900 transition-colors"
          >
            Development Mode →
          </a>
        </div>
      </div>
    </div>
  );
}