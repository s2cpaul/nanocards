import { Button } from "./ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles, Video, LinkIcon, TrendingUp, QrCode, Download, Share2, Heart, CheckCircle2, MessageSquare, Menu, UserPlus } from "lucide-react";
import { HamburgerMenu } from "./HamburgerMenu";
import { GlobalHeader } from "./GlobalHeader";
import { useState, useEffect } from "react";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstructionsScreen() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [showAccountForm, setShowAccountForm] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const checkAuth = async () => {
    const isGuest = localStorage.getItem('guestMode') === 'true';
    setIsGuestMode(isGuest);

    if (!isGuest) {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserEmail(session?.user?.email || "");

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/subscription/status`, { headers });
        if (response.ok) {
          const data = await response.json();
          setUserPoints(data.points || 0);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    }
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

  const handleCreateCard = () => {
    navigate('/create');
  };

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    const promptEvent = e as unknown as BeforeInstallPromptEvent;
    setDeferredPrompt(promptEvent);
  };

  const handleAppInstalled = () => {
    setIsInstalled(true);
    toast.success("nAnoCards was installed successfully!");
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success("nAnoCards installation accepted!");
    } else {
      toast.info("nAnoCards installation dismissed.");
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Header */}
      <GlobalHeader
        currentUserEmail={currentUserEmail}
        isGuestMode={isGuestMode}
        userPoints={userPoints}
        onLogout={handleLogout}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-8 h-8 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to nAnoCards!</h2>
              <p className="text-blue-100 mb-3">
                Create self promotion or mini pitch cards for your AI products in just a few steps. 
                Share them anywhere with auto-generated QR codes.
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <div className="bg-white/10 px-3 py-1 rounded-full">
                  ⚡ Lightweight PWA
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full">
                  🌐 Edge-Managed Storage
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full">
                  🚀 Blazing Fast
                </div>
              </div>
              {!isInstalled && deferredPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="mt-4 bg-white text-[#1e3a8a] hover:bg-blue-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install nAnoCards App
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 0: Create Your Account */}
        {showAccountForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Account</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Before creating a card, you need to set up your account. Fill out the form below to get started.
                </p>
                
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="instructions-fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="instructions-fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="instructions-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="instructions-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="instructions-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="instructions-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="instructions-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="instructions-confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Age Confirmation */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="ageConfirm"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="ageConfirm" className="text-sm text-gray-700">
                      I am 13 years of age or older
                    </label>
                  </div>

                  {/* Create Account Button */}
                  <button
                    onClick={() => {
                      if (!fullName || !email || !password || !confirmPassword) {
                        toast.error("Please fill out all fields");
                        return;
                      }
                      if (password !== confirmPassword) {
                        toast.error("Passwords do not match");
                        return;
                      }
                      if (password.length < 6) {
                        toast.error("Password must be at least 6 characters");
                        return;
                      }
                      if (!ageConfirmed) {
                        toast.error("You must be 13 years or older to create an account");
                        return;
                      }
                      
                      // Hide form and show success
                      setShowAccountForm(false);
                      toast.success("Account created! Now you can proceed to create your card.");
                    }}
                    className="w-full bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-950 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button - Shows after account creation */}
        {!showAccountForm && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <p className="text-sm font-semibold text-green-900">
                Account Created Successfully!
              </p>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Welcome to nAnoCards! You can now proceed with the steps below to create your first card.
            </p>
          </div>
        )}

        {/* Step 1: Basic Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 px-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span>1. Add Your Card Title</span>
          </h3>
          <p className="text-gray-600 text-sm mb-3 px-2">
            Write a clear, compelling title that describes your AI product or pitch. 
            Keep it concise—this will be the headline of your nAnoCard.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium">Example:</p>
            <p className="text-sm text-gray-900">"U+Bar: Service, Security & Hospitality"</p>
          </div>
        </div>

        {/* Step 2: Video Link */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 px-2">
            <Video className="w-5 h-5 text-gray-600" />
            <span>2. Link Your Video & Set Duration</span>
          </h3>
          <p className="text-gray-600 text-sm mb-3 px-2">
            Add a YouTube or video URL to your pitch video. Users can click the play button to watch it.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
            <div>
              <p className="text-sm text-gray-700 font-medium mb-1">Video URL:</p>
              <input 
                type="text" 
                placeholder="https://youtube.com/watch?v=example"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                readOnly
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium mb-1">Video Time (max 2 minutes):</p>
              <input 
                type="text" 
                placeholder="1:59 or 2:00 (mm:ss)"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: Videos must be 2 minutes (120 seconds) or less
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Insights & Links */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 px-2">
            <LinkIcon className="w-5 h-5 text-gray-600" />
            <span>3. Add Insights & Resources</span>
          </h3>
          <p className="text-gray-600 text-sm mb-3 px-2">
            Link to relevant resources that support your pitch. All fields are optional, 
            but more links = more credibility!
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium mb-2">Available Links:</p>
            <ul className="space-y-1 text-sm text-gray-900">
              <li>• <strong>Information:</strong> General info page</li>
              <li>• <strong>White Paper:</strong> Technical documentation</li>
              <li>• <strong>Official Site:</strong> Your main website</li>
              <li>• <strong>LinkedIn:</strong> Company profile</li>
              <li>• <strong>Discord:</strong> Community server</li>
              <li>• <strong>YouTube:</strong> Video channel</li>
              <li>• <strong>GitHub:</strong> Code repository</li>
              <li>• <strong>X (Twitter):</strong> Social profile</li>
              <li>• <strong>Email:</strong> Contact email</li>
              <li>• <strong>Other Link:</strong> Any other resource</li>
            </ul>
          </div>
        </div>

        {/* Step 4: Stage Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center font-bold mt-0.5">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span>Select Your Stage (Optional)</span>
              </h3>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Let viewers know what stage your AI product is at. This helps potential investors, 
            partners, and users understand where you are in your journey.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium mb-3">The 6 Stages of Innovation:</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-900">
              <div>• <strong>Idea</strong></div>
              <div>• <strong>Validation</strong></div>
              <div>• <strong>Planning</strong></div>
              <div>• <strong>Execution</strong></div>
              <div>• <strong>Growth</strong></div>
              <div>• <strong>Reinvention</strong></div>
            </div>
          </div>
        </div>

        {/* Step 5: QR Code */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 px-2">
            <QrCode className="w-5 h-5 text-gray-600" />
            <span>5. Get Your QR Code</span>
          </h3>
          <p className="text-gray-600 text-sm mb-3 px-2">
            Every nAnoCard automatically generates a unique QR code. 
            Click the 
            <Download className="inline w-4 h-4 mx-1 text-gray-500" />
            icon to download it for print materials, presentations, or sharing!
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <QrCode className="w-16 h-16 mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-700 font-medium">Auto-generated for every card</p>
          </div>
        </div>

        {/* Step 6: Share & Engage */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 px-2">
            <Share2 className="w-5 h-5 text-gray-600" />
            <span>6. Share & Get Likes</span>
          </h3>
          <p className="text-gray-600 text-sm mb-3 px-2">
            Your card will appear in the feed sorted by likes. The more engaging your 
            content, the more 
            <Heart className="inline w-4 h-4 mx-1 text-red-500" />
            likes you'll receive!
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium mb-2">Pro Tips:</p>
            <ul className="space-y-1 text-sm text-gray-900">
              <li>• Keep titles clear and benefit-focused</li>
              <li>• Use short, compelling video pitches (2-5 min)</li>
              <li>• Add as many relevant links as possible</li>
              <li>• Share your QR code on social media</li>
            </ul>
          </div>
        </div>

        {/* Engagement Features - Premium Tier */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 px-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <span>Add Engagement Features (Optional)</span>
          </h3>
          <p className="text-gray-600 text-sm mb-3 px-2">
            Make your nAnoCards interactive! Add quizzes, surveys, or feedback questions to engage your audience and gather valuable insights.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 font-medium mb-2">Available Engagement Types:</p>
            <ul className="space-y-1 text-sm text-gray-900">
              <li>• <strong>Knowledge Check:</strong> Quiz questions to test understanding</li>
              <li>• <strong>Survey Question:</strong> Gather opinions and feedback</li>
              <li>• <strong>Feedback Question:</strong> Collect audience responses</li>
            </ul>
            <p className="text-xs text-gray-600 mt-2">
              Add up to 3 engagement items per card
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-semibold mb-2">
              Available with Paid Tiers:
            </p>
            <ul className="space-y-1 text-sm text-gray-900">
              <li>• <strong>Student (FREE)</strong> - Up to 3 engagement items</li>
              <li>• <strong>Creator ($4.99/mo)</strong> - Up to 3 per card</li>
              <li>• <strong>Pro ($9.99/mo)</strong> - Up to 3 per card</li>
              <li>• <strong>Enterprise Teams ($12.99/seat/mo)</strong> - Up to 3 per card, up to 99 seats</li>
              <li>• <strong>Custom Enterprise (100+)</strong> - Unlimited features</li>
            </ul>
            <button
              onClick={() => navigate('/subscription')}
              className="w-full mt-3 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              View Pricing Tiers →
            </button>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="bg-purple-400 text-purple-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              !
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">
                Free Account Includes 1 Card
              </p>
              <p className="text-sm text-purple-800">
                Every account gets one free nAnoCard to create. Make it count! 
                Choose your best AI product pitch.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleCreateCard}
          className="w-full h-14 bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-950 hover:to-indigo-800 text-white rounded-xl text-lg font-semibold shadow-lg"
        >
          Create My nAnoCard Now
        </Button>

        {/* Back to Feed */}
        <button
          onClick={() => navigate('/app')}
          className="w-full text-center text-gray-600 hover:text-gray-900 text-sm py-2"
        >
          Back to Feed
        </button>

        {/* PWA Install Prompt */}
        {!isInstalled && deferredPrompt && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full z-50">
            <p className="text-sm text-gray-700 mb-2">
              Install nAnoCards app for a better experience?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallPWA}
                className="flex-1 bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-950 hover:to-indigo-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Install App
              </button>
              <button
                onClick={() => setDeferredPrompt(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}