import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Code, BookOpen, Key, Zap, Terminal, CheckCircle, ExternalLink, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { API_BASE_URL, getAuthHeaders, supabase } from "../../lib/supabase";
import { HamburgerMenu } from "./HamburgerMenu";

export function DevelopersScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    if (isGuestMode) {
      setHasAccess(false);
      setIsGuestMode(true);
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || "";
      setCurrentUserEmail(userEmail);

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        headers,
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Developers access requires Creator or Pro subscription
        const access = data.tier === "creator" || data.tier === "pro";
        setHasAccess(access);
        setUserPoints(data.points || 0);
      } else {
        console.warn('Subscription status check returned non-OK status:', response.status);
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking access (network or server issue):', error);
      // Gracefully handle the error - show the page but without access
      setHasAccess(false);
    }
    
    setLoading(false);
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
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading developer portal...</p>
        </div>
      </div>
    );
  }

  // Show upgrade screen for non-subscribers
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center relative">
          <button
            onClick={() => navigate('/app')}
            className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-6">
            <Code className="w-6 h-6 text-gray-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Developer API Access
          </h1>
          
          <p className="text-gray-600 text-lg mb-6">
            API access is exclusively available to{' '}
            <button
              onClick={() => navigate('/subscription?from=developers')}
              className="font-semibold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 transition-colors"
            >
              Creator
            </button>
            {' '}and{' '}
            <button
              onClick={() => navigate('/subscription?from=developers')}
              className="font-semibold text-purple-600 hover:text-purple-700 underline decoration-2 underline-offset-2 transition-colors"
            >
              Pro
            </button>
            {' '}subscribers.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-bold text-gray-900 mb-3">Developer Features:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>REST API access to nAnoCards data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>LMS integration with your platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Secure API key management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Comprehensive API documentation</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/subscription')}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-semibold"
            >
              Upgrade for API Access
            </Button>
            
            <Button
              onClick={() => navigate('/app')}
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-2 py-[7px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-[#1e3a8a]" />
              <h1 className="text-lg font-bold text-gray-900">Developers</h1>
            </div>
            <HamburgerMenu
              currentUserEmail={currentUserEmail}
              isGuestMode={isGuestMode}
              userPoints={userPoints}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-700 rounded-2xl p-8 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to nAnoCards API</h2>
          <p className="text-blue-100 mb-3">
            Integrate nAnoCards with your LMS platform and unlock powerful AI-driven content delivery.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-blue-50">Lightweight & Fast</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4 text-green-300" />
              <span className="text-blue-50">Edge-Managed Auth & Storage</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-blue-300" />
              <span className="text-blue-50">Global Low Latency</span>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">Quick Start Guide</h3>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Get Your API Key</h4>
                <p className="text-gray-600 mb-2">
                  Navigate to the API Key page to generate your authentication credentials.
                </p>
                <Button
                  onClick={() => navigate('/api-key')}
                  variant="outline"
                  className="text-sm"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Go to API Key
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Configure Your LMS</h4>
                <p className="text-gray-600 mb-2">
                  Add your API key to your LMS platform's integration settings.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-700">
                  API Endpoint: <span className="text-blue-600">https://api.nanocards.app/v1</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Make Your First Request</h4>
                <p className="text-gray-600 mb-2">
                  Test your connection with a simple API call.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto">
                  <pre className="text-green-400">
{`curl -X GET https://api.nanocards.app/v1/cards \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Start Building</h4>
                <p className="text-gray-600">
                  You're all set! Check out the API documentation for more endpoints and features.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-6 h-6 text-[#1e3a8a]" />
            <h3 className="text-xl font-bold text-gray-900">API Features</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Retrieve nAnoCards</h4>
              <p className="text-sm text-gray-600">
                Fetch all cards or filter by category, tags, and popularity.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Training Modules</h4>
              <p className="text-sm text-gray-600">
                Access Training Center content programmatically for LMS integration.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">User Progress Tracking</h4>
              <p className="text-sm text-gray-600">
                Monitor quiz completions, points earned, and learning milestones.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Webhook Support</h4>
              <p className="text-sm text-gray-600">
                Receive real-time notifications for card updates and user activities.
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-[#1e3a8a]" />
            <h3 className="text-xl font-bold text-gray-900">Resources</h3>
          </div>

          <div className="space-y-3">
            <a
              href="https://docs.nanocards.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900">API Documentation</h4>
                <p className="text-sm text-gray-600">Complete reference for all endpoints</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            <a
              href="https://docs.nanocards.app/examples"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900">Code Examples</h4>
                <p className="text-sm text-gray-600">Sample integrations in multiple languages</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            <a
              href="https://status.nanocards.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900">API Status</h4>
                <p className="text-sm text-gray-600">Monitor uptime and performance</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}