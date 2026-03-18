import { ArrowLeft, Zap, Globe, Lock, Layers, Code, Smartphone, HardDrive, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { HamburgerMenu } from "./HamburgerMenu";
import { useState, useEffect } from "react";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * AboutPlatformScreen - Platform overview
 * Clean line icons, no emojis, navy blue accents
 */
export function AboutPlatformScreen() {
  const navigate = useNavigate();
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    checkAuth();
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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast.success('Thanks for installing our app!');
        setIsInstalled(true);
      } else {
        toast.dismiss();
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
    }
  };

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-info bar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Back arrow + Title + Hamburger */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">About Platform</h1>
          </div>
          <HamburgerMenu
            currentUserEmail={currentUserEmail}
            isGuestMode={isGuestMode}
            userPoints={userPoints}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Hero Banner */}
        <div className="bg-[#1e3a8a] rounded-xl p-6 text-white mb-5">
          <h2 className="text-2xl font-bold mb-2">nAnoCards Platform</h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-4">
            A lightweight PWA for sharing AI product pitch cards. Built on edge infrastructure for global performance.
          </p>
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="bg-white text-[#1e3a8a] hover:bg-gray-100 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              aria-label="Install nAnoCards app"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              Install App
            </button>
          )}
        </div>

        {/* What is nAnoCards? */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            What is nAnoCards?
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Mobile-first Progressive Web App for creating and sharing mini cards displaying AI product pitches.
            Cards feature 40-character titles, video links, QR codes, and social engagement.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-center">
              <div className="font-semibold text-[#1e3a8a]">PWA</div>
              <div className="text-gray-500">Installable</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-center">
              <div className="font-semibold text-[#1e3a8a]">Mobile-First</div>
              <div className="text-gray-500">Responsive</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-center">
              <div className="font-semibold text-[#1e3a8a]">Lightweight</div>
              <div className="text-gray-500">Fast Load</div>
            </div>
          </div>
        </div>

        {/* Edge-Managed Architecture */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            Edge-Managed Architecture
          </h3>

          {/* Architecture Diagram */}
          <div className="space-y-2 mb-4">
            {/* Frontend */}
            <div className="flex items-center gap-4">
              <div className="w-20 text-xs font-semibold text-gray-500 text-right">Frontend</div>
              <div className="flex-1 bg-white border-2 border-blue-200 rounded-lg px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">React PWA</div>
                <div className="text-xs text-gray-500">Mobile-optimized UI</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-4">
              <div className="w-20"></div>
              <div className="flex-1 text-center text-gray-300 text-lg">&#8595;</div>
            </div>

            {/* Server */}
            <div className="flex items-center gap-4">
              <div className="w-20 text-xs font-semibold text-gray-500 text-right">Server</div>
              <div className="flex-1 bg-white border-2 border-green-200 rounded-lg px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">Hono on Deno Edge</div>
                <div className="text-xs text-gray-500">Supabase Edge Functions</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-4">
              <div className="w-20"></div>
              <div className="flex-1 text-center text-gray-300 text-lg">&#8595;</div>
            </div>

            {/* Database */}
            <div className="flex items-center gap-4">
              <div className="w-20 text-xs font-semibold text-gray-500 text-right">Database</div>
              <div className="flex-1 bg-white border-2 border-purple-200 rounded-lg px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">Supabase Postgres</div>
                <div className="text-xs text-gray-500">Auth, Storage, KV Table</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Three-tier architecture with edge computing for global low latency.
            Authentication, storage, and API routes managed at the edge for optimal performance.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <Zap className="w-6 h-6 text-gray-400 mb-2" strokeWidth={1.5} />
            <div className="font-semibold text-gray-900 text-sm mb-1">Lightweight</div>
            <div className="text-xs text-gray-500">Minimal bundle size, fast time-to-interactive</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <Globe className="w-6 h-6 text-gray-400 mb-2" strokeWidth={1.5} />
            <div className="font-semibold text-gray-900 text-sm mb-1">Edge Network</div>
            <div className="text-xs text-gray-500">Global CDN with low latency worldwide</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <Lock className="w-6 h-6 text-gray-400 mb-2" strokeWidth={1.5} />
            <div className="font-semibold text-gray-900 text-sm mb-1">Edge Auth</div>
            <div className="text-xs text-gray-500">Supabase Auth at edge locations</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <HardDrive className="w-6 h-6 text-gray-400 mb-2" strokeWidth={1.5} />
            <div className="font-semibold text-gray-900 text-sm mb-1">Edge Storage</div>
            <div className="text-xs text-gray-500">Blob storage with signed URLs</div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            Technology Stack
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Frontend:</span>
              <span className="font-semibold text-gray-900">React + Tailwind</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Server:</span>
              <span className="font-semibold text-gray-900">Hono + Deno</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Database:</span>
              <span className="font-semibold text-gray-900">Postgres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auth:</span>
              <span className="font-semibold text-gray-900">Supabase</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Storage:</span>
              <span className="font-semibold text-gray-900">Supabase</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment:</span>
              <span className="font-semibold text-gray-900">Stripe API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
