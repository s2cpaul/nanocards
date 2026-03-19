import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Key, Copy, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle, Crown, Code } from "lucide-react";
import { Button } from "./ui/button";
import { API_BASE_URL, getAuthHeaders, supabase } from "@/supabase";
import { HamburgerMenu } from "./HamburgerMenu";
import { toast } from "sonner";

export function ApiKeyScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyCreatedAt, setKeyCreatedAt] = useState<string | null>(null);

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
        // API Key access requires Creator or Pro subscription
        const access = data.tier === "creator" || data.tier === "pro";
        setHasAccess(access);
        setUserPoints(data.points || 0);

        // Load existing API key if access granted
        if (access) {
          await loadApiKey();
        }
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

  const loadApiKey = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api-key`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.apiKey) {
          setApiKey(data.apiKey);
          setKeyCreatedAt(data.createdAt);
        }
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const generateApiKey = async () => {
    setIsGenerating(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api-key/generate`, {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
        setKeyCreatedAt(data.createdAt);
        setShowKey(true);
        toast.success("API key generated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to generate API key");
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error("Failed to generate API key");
    }
    setIsGenerating(false);
  };

  const regenerateApiKey = async () => {
    if (!confirm("Are you sure you want to regenerate your API key? This will invalidate your current key and may break existing integrations.")) {
      return;
    }

    setIsGenerating(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api-key/regenerate`, {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
        setKeyCreatedAt(data.createdAt);
        setShowKey(true);
        toast.success("API key regenerated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to regenerate API key");
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast.error("Failed to regenerate API key");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard!");
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
          <p className="text-gray-600">Loading API key...</p>
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
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-6">
            <Key className="w-6 h-6 text-gray-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            API Key Required
          </h1>
          
          <p className="text-gray-600 text-lg mb-6">
            API key management is exclusively available to{' '}
            <button
              onClick={() => navigate('/subscription?from=api-key')}
              className="font-semibold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 transition-colors"
            >
              Creator
            </button>
            {' '}and{' '}
            <button
              onClick={() => navigate('/subscription?from=api-key')}
              className="font-semibold text-purple-600 hover:text-purple-700 underline decoration-2 underline-offset-2 transition-colors"
            >
              Pro
            </button>
            {' '}subscribers.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-bold text-gray-900 mb-3">What You Get:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Secure API key generation and management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Connect to any LMS platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Access to nAnoCards REST API</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Real-time data synchronization</span>
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
              <Key className="w-6 h-6 text-[#1e3a8a]" />
              <h1 className="text-lg font-bold text-gray-900">API Key</h1>
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
        {/* Quick Link to Developers */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">Need Help Getting Started?</h3>
              <p className="text-xs text-blue-700">Check out our developer quick start guide</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/developers')}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-100"
          >
            View Guide
          </Button>
        </div>

        {/* API Key Section */}
        {!apiKey ? (
          // No API Key - Generate New
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Key className="w-8 h-8 text-[#1e3a8a]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your API Key</h2>
            <p className="text-gray-600 mb-6">
              Create a secure API key to integrate nAnoCards with your LMS platform.
            </p>
            <Button
              onClick={generateApiKey}
              disabled={isGenerating}
              className="bg-[#1e3a8a] hover:bg-blue-800 text-white h-12 px-8"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Generate API Key
                </>
              )}
            </Button>
          </div>
        ) : (
          // API Key Exists
          <>
            {/* API Key Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Your API Key</h3>
                {keyCreatedAt && (
                  <span className="text-xs text-gray-500">
                    Created {new Date(keyCreatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Key Display */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-green-400 text-sm font-mono flex-1">
                    {showKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 hover:bg-gray-800 rounded transition-colors"
                      title={showKey ? "Hide key" : "Show key"}
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-gray-800 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Key
                </Button>
                <Button
                  onClick={regenerateApiKey}
                  disabled={isGenerating}
                  variant="outline"
                  className="text-orange-600 hover:bg-orange-50 border-orange-300"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Security Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Keep Your Key Secure</h4>
                  <p className="text-sm text-yellow-800">
                    Never share your API key publicly or commit it to version control. 
                    Treat it like a password and store it securely in environment variables.
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use Your API Key</h3>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-[#1e3a8a] text-white rounded-full text-xs font-bold">1</span>
                    Include in Request Headers
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`Authorization: Bearer YOUR_API_KEY`}
                    </pre>
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-[#1e3a8a] text-white rounded-full text-xs font-bold">2</span>
                    Example API Call
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`curl -X GET https://api.nanocards.app/v1/cards \\
  -H "Authorization: Bearer ${showKey ? apiKey : 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-xs">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    Connect to Your LMS
                  </h4>
                  <p className="text-sm text-gray-600 ml-8">
                    Add this API key to your LMS platform's integration settings. 
                    Consult your LMS documentation for specific configuration steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Supported Platforms */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Supported LMS Platforms</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <p className="font-semibold text-gray-900 text-sm">Canvas LMS</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <p className="font-semibold text-gray-900 text-sm">Moodle</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <p className="font-semibold text-gray-900 text-sm">Blackboard</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <p className="font-semibold text-gray-900 text-sm">Google Classroom</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <p className="font-semibold text-gray-900 text-sm">Schoology</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <p className="font-semibold text-gray-900 text-sm">Custom LMS</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}