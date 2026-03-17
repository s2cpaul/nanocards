/**
 * SubscriptionScreen - Pricing and subscription management
 * Clean design: line icons only, no emojis, navy blue theme
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, X as XIcon, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { GlobalHeader } from "./GlobalHeader";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";
import { UI_TEXT } from "../constants";

export function SubscriptionScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [userEmail, setUserEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  const isStudentEmail = (email: string) => {
    const freeDomains = ['.edu', '.k12.', '.mil', '@oratf.info'];
    return freeDomains.some(domain => email.toLowerCase().includes(domain));
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isGuest = localStorage.getItem('guestMode') === 'true';
      setIsGuestMode(isGuest);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setUserEmail(session.user.email || "");
      setDisplayName(session.user.user_metadata.display_name || "");

      try {
        const headers = await getAuthHeaders();
        const profileResponse = await fetch(`${API_BASE_URL}/user/profile`, { headers });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setDisplayName(profileData.displayName || '');
          setCurrentTier(profileData.subscriptionTier || 'free');
          setUserPoints(profileData.points || 0);
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleUpgrade = async (tier: string) => {
    navigate(`/checkout?tier=${tier}`);
  };

  const handleContactSales = () => {
    const subject = encodeURIComponent('nAnoCards Custom Enterprise Inquiry');
    const body = encodeURIComponent(`Hello,\n\nI'm interested in learning more about the Custom Enterprise plan for 100+ users.\n\nName: \nOrganization: \nNumber of Users: \nSpecial Requirements: \n\nBest regards`);
    window.location.href = `mailto:sales@nanocards.com?subject=${subject}&body=${body}`;
    toast.success('Opening email client...');
  };

  const handleLogout = async () => {
    if (isGuestMode) {
      localStorage.removeItem('guestMode');
      navigate('/');
    } else {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin"></div>
      </div>
    );
  }

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Browse and explore nAnoCards",
      features: [
        "Unlimited viewing (no account required)",
        "Browse all nAnoCards",
        "1 free card with account creation",
        "Auto-generated QR codes",
        "Social media links",
        "Like & share features",
      ],
      limitations: [
        "Only 1 card creation allowed",
        UI_TEXT.NO_LEARNING_ACCESS,
        "Limited to basic features",
      ],
      buttonText: currentTier === "free" ? "Current Plan" : "Select Plan",
      current: currentTier === "free",
    },
    ...(userEmail && isStudentEmail(userEmail) ? [{
      id: "student",
      name: "Student",
      price: "FREE",
      period: "with verified email",
      description: "Free for students",
      features: [
        "Everything in Free, plus:",
        "2 cards",
        "Integrated engagement",
        "Learning & Development",
        "Valid with .edu, .k12, .mil, or @oratf.info",
      ],
      buttonText: currentTier === "student" ? "Current Plan" : "Activate Student Plan",
      current: currentTier === "student",
      studentPlan: true,
    }] : []),
    {
      id: "creator",
      name: "Creator",
      price: "$4.99",
      period: "per month",
      description: "Full access for creators",
      features: [
        "Everything in Free, plus:",
        "10 cards",
        "Integrated engagement",
        "Learning & Development",
        "Advanced analytics",
        "Priority support",
      ],
      buttonText: currentTier === "creator" ? "Current Plan" : "Upgrade to Creator",
      current: currentTier === "creator",
      popular: !userEmail || !isStudentEmail(userEmail),
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For professionals",
      features: [
        "Everything in Creator, plus:",
        "Up to 49 cards",
        "Training & Customer Service categories",
        "Advanced analytics dashboard",
        "Team collaboration tools",
        "Premium support",
      ],
      buttonText: currentTier === "pro" ? "Current Plan" : "Upgrade to Pro",
      current: currentTier === "pro",
    },
    {
      id: "enterprise",
      name: "Enterprise Teams",
      price: "$12.99",
      period: "per seat/month",
      description: "Up to 499 seats with LMS integration",
      features: [
        "Everything in Pro, plus:",
        "LMS integration (Canvas, Blackboard, etc.)",
        "SSO/SAML authentication",
        "Dedicated account manager",
        "Custom training sessions",
        "Up to 499 team members",
        "Enterprise-grade SLA",
      ],
      buttonText: currentTier === "enterprise" ? "Current Plan" : "Upgrade to Enterprise",
      current: currentTier === "enterprise",
    },
    {
      id: "custom",
      name: "Custom Enterprise",
      price: "Contact Us",
      period: "custom pricing",
      description: "For organizations with 100+ users",
      features: [
        "Everything in Enterprise, plus:",
        "Unlimited team members (100+)",
        "White-label solution available",
        "Custom integrations & API access",
        "Dedicated infrastructure",
        "On-premise deployment options",
        "24/7 premium support",
      ],
      buttonText: "Contact Sales",
      current: currentTier === "custom",
      isContactSales: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <GlobalHeader
        currentUserEmail={userEmail}
        displayName={displayName}
        isGuestMode={isGuestMode}
        userPoints={userPoints}
        subscriptionTier={currentTier}
        onLogout={handleLogout}
      />

      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-medium">Back to Cards</span>
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Choose Your Plan</h1>
          <p className="text-sm text-gray-500">Unlock premium features for nAnoCards</p>

          {currentTier !== "free" && userEmail && (
            <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
              <Check className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
              <span className="text-gray-700 font-medium text-xs">
                Current: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-4xl mx-auto">
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              className={`relative bg-white border-2 ${
                plan.current ? "border-[#1e3a8a]"
                : plan.popular ? "border-gray-900"
                : "border-gray-200"
              } rounded-xl px-4 py-4 shadow-sm ${
                plan.popular ? "md:scale-105 shadow-md" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gray-900 text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              {plan.current && userEmail && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#1e3a8a] text-white px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" strokeWidth={1.5} />
                    Current Plan
                  </div>
                </div>
              )}

              <div className="text-center mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-0.5">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-0.5">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.id !== "free" && plan.id !== "custom" && (
                    <span className="text-gray-500 text-xs">/mo</span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{plan.description}</p>
              </div>

              <div className="space-y-1.5 mb-4">
                {plan.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-gray-800 text-xs leading-snug">{feature}</p>
                  </div>
                ))}

                {plan.limitations?.map((limitation: string, index: number) => (
                  <div key={`limit-${index}`} className="flex items-start gap-2">
                    <XIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-gray-500 text-xs leading-snug">{limitation}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  if (plan.isContactSales) handleContactSales();
                  else if (!plan.current && plan.id !== "free") handleUpgrade(plan.id);
                }}
                disabled={plan.current || processingTier !== null}
                className={`w-full h-10 rounded-xl text-sm font-semibold ${
                  plan.current ? "bg-gray-300 cursor-not-allowed"
                  : plan.id === "student" ? "bg-gray-700 hover:bg-gray-800"
                  : plan.id === "creator" ? "bg-[#1e3a8a] hover:bg-blue-800"
                  : plan.id === "pro" ? "bg-gray-900 hover:bg-gray-800"
                  : plan.id === "enterprise" ? "bg-gray-800 hover:bg-gray-900"
                  : plan.id === "custom" ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-400"
                } text-white`}
              >
                {processingTier === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" strokeWidth={1.5} />
                    Processing...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center max-w-4xl mx-auto">
          <p className="text-gray-600 text-xs">
            <strong className="text-gray-800">Secure Payments:</strong> All payments processed securely through Stripe.
            Your credit card information is never stored on our servers. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
