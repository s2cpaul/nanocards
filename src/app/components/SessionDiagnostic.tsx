import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";
import { toast } from "sonner";

/**
 * SessionDiagnostic - Debug page to check authentication status
 */
export function SessionDiagnostic() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [testResults, setTestResults] = useState<{
    hasSession: boolean;
    hasAccessToken: boolean;
    userEmail: string | null;
    canFetchCards: boolean;
    cardsCount: number;
    error: string | null;
  } | null>(null);

  const runDiagnostics = async () => {
    setChecking(true);
    setTestResults(null);
    
    try {
      // Check 1: Get session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      const hasSession = !!currentSession;
      const hasAccessToken = !!currentSession?.access_token;
      const userEmail = currentSession?.user?.email || null;
      
      // Check 2: Try to fetch cards
      let canFetchCards = false;
      let cardsCount = 0;
      let error = null;
      
      try {
        const headers = await getAuthHeaders();
        console.log('[Diagnostic] Testing API with headers:', headers);
        
        const response = await fetch(`${API_BASE_URL}/cards`, {
          headers,
        });
        
        if (response.ok) {
          const data = await response.json();
          canFetchCards = true;
          cardsCount = data.cards?.length || 0;
        } else {
          const errorData = await response.json();
          error = errorData.error || `HTTP ${response.status}`;
        }
      } catch (err: any) {
        error = err.message;
      }
      
      setTestResults({
        hasSession,
        hasAccessToken,
        userEmail,
        canFetchCards,
        cardsCount,
        error,
      });
      
      toast.success('Diagnostics complete!');
    } catch (err: any) {
      console.error('[Diagnostic] Error:', err);
      toast.error('Diagnostic failed: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleRefreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        toast.error('Failed to refresh session: ' + error.message);
      } else {
        toast.success('Session refreshed!');
        runDiagnostics();
      }
    } catch (err: any) {
      toast.error('Error refreshing session: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    runDiagnostics();
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Session Diagnostic</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            This page helps diagnose authentication issues. Run the diagnostic to see your session status.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={checking}
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Run Diagnostic
          </Button>
          <Button
            onClick={handleRefreshSession}
            variant="outline"
            className="border-gray-300"
          >
            Refresh Session
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>

        {/* Results */}
        {testResults && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900 text-lg">Diagnostic Results</h2>
            
            {/* Session Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Has Active Session</span>
                {testResults.hasSession ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              {testResults.hasSession && (
                <p className="text-sm text-gray-600">✓ Session found in browser</p>
              )}
              {!testResults.hasSession && (
                <p className="text-sm text-red-600">✗ No session - you need to log in</p>
              )}
            </div>

            {/* Access Token */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Has Access Token</span>
                {testResults.hasAccessToken ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              {testResults.hasAccessToken && (
                <p className="text-sm text-gray-600">✓ Valid access token present</p>
              )}
              {!testResults.hasAccessToken && (
                <p className="text-sm text-red-600">✗ Missing access token - session may be expired</p>
              )}
            </div>

            {/* User Email */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">User Email</span>
                {testResults.userEmail ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              {testResults.userEmail && (
                <p className="text-sm text-gray-600 font-mono">{testResults.userEmail}</p>
              )}
              {!testResults.userEmail && (
                <p className="text-sm text-red-600">Not logged in</p>
              )}
            </div>

            {/* API Access */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Can Fetch Cards</span>
                {testResults.canFetchCards ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              {testResults.canFetchCards && (
                <p className="text-sm text-gray-600">
                  ✓ Successfully fetched {testResults.cardsCount} card(s)
                </p>
              )}
              {!testResults.canFetchCards && (
                <div>
                  <p className="text-sm text-red-600 mb-1">✗ Failed to fetch cards</p>
                  {testResults.error && (
                    <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                      Error: {testResults.error}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Recommendations</h3>
              <ul className="text-sm text-yellow-900 space-y-1">
                {!testResults.hasSession && (
                  <li>• Please <button onClick={() => navigate('/login')} className="underline font-medium">log in</button> to access your cards</li>
                )}
                {testResults.hasSession && !testResults.hasAccessToken && (
                  <li>• Your session may be expired. Try clicking "Refresh Session" or log out and log back in</li>
                )}
                {testResults.hasAccessToken && !testResults.canFetchCards && (
                  <li>• You have a session but API calls are failing. Check the browser console for errors</li>
                )}
                {testResults.hasSession && testResults.hasAccessToken && testResults.canFetchCards && (
                  <li className="text-green-700">✓ Everything looks good! You should be able to edit your cards.</li>
                )}
              </ul>
            </div>

            {/* Session Details */}
            {session && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-2">Session Details</h3>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(
                    {
                      user: session.user?.email,
                      expires_at: new Date(session.expires_at * 1000).toLocaleString(),
                      token_type: session.token_type,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              variant="outline"
            >
              Go to Login
            </Button>
            <Button
              onClick={() => navigate('/app')}
              className="w-full"
              variant="outline"
            >
              Go to My nAnoCards
            </Button>
            <Button
              onClick={() => navigate('/quick-edit')}
              className="w-full"
              variant="outline"
            >
              Go to Quick Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
