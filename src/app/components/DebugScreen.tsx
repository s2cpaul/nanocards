import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "./ui/button";
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

export function DebugScreen() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<{
    supabaseUrl: string;
    projectId: string;
    hasAnonKey: boolean;
    sessionExists: boolean;
    sessionEmail: string | null;
    error: string | null;
  }>({
    supabaseUrl: '',
    projectId: '',
    hasAnonKey: false,
    sessionExists: false,
    sessionEmail: null,
    error: null,
  });
  const [testing, setTesting] = useState(false);

  const checkStatus = async () => {
    setTesting(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabaseUrl = `https://${projectId}.supabase.co`;

      // Try to get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      setStatus({
        supabaseUrl,
        projectId: projectId || 'NOT SET',
        hasAnonKey,
        sessionExists: !!session,
        sessionEmail: session?.user?.email || null,
        error: sessionError?.message || null,
      });
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        error: error?.message || "Unknown error",
      }));
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a8a] to-[#0a0e2a] flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Back to Login</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <h1 className="text-white text-2xl font-bold mb-8">Debug Info</h1>

        <div className="w-full max-w-md space-y-4">
          {/* Supabase URL */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white/60 text-xs font-mono">Supabase URL</p>
                <p className="text-white text-sm break-all">{status.supabaseUrl}</p>
              </div>
              {status.supabaseUrl ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>

          {/* Project ID */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white/60 text-xs font-mono">Project ID</p>
                <p className="text-white text-sm font-mono">{status.projectId}</p>
              </div>
              {status.projectId !== 'NOT SET' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>

          {/* Anon Key */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white/60 text-xs font-mono">Anon Key Set</p>
                <p className="text-white text-sm">{status.hasAnonKey ? 'Yes' : 'No'}</p>
              </div>
              {status.hasAnonKey ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>

          {/* Session Status */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white/60 text-xs font-mono">Session Status</p>
                {status.sessionExists ? (
                  <p className="text-white text-sm">
                    Active: <span className="font-mono text-green-400">{status.sessionEmail}</span>
                  </p>
                ) : (
                  <p className="text-white text-sm">No active session</p>
                )}
              </div>
              {status.sessionExists ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>

          {/* Error */}
          {status.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{status.error}</p>
            </div>
          )}

          {/* Refresh Button */}
          <Button
            onClick={checkStatus}
            disabled={testing}
            className="w-full bg-white text-[#1e3a8a] hover:bg-white/90 font-semibold py-3 rounded-xl text-base shadow-lg disabled:opacity-50 h-auto mt-6"
          >
            {testing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Refresh Status
              </>
            )}
          </Button>

          {/* Summary */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
            <p className="text-blue-300 text-xs">
              <strong>If you're seeing a "fetch failed" error:</strong>
              <br />
              1. Make sure all green checkmarks above are present
              <br />
              2. Check your internet connection
              <br />
              3. Try refreshing the page
              <br />
              4. If Project ID is not set, environment variables may not be loaded
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
