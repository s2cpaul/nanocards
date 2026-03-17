import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabase, getCurrentSession } from "../../lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check for existing session - fast redirect if already logged in
    const checkSession = async () => {
      try {
        setIsCheckingSession(true);
        const session = await getCurrentSession();
        
        if (session?.user?.email) {
          console.log('[LoginScreen] Existing session found for:', session.user.email);
          // Redirect to app immediately - user is already authenticated
          navigate("/app", { replace: true });
        } else {
          console.log('[LoginScreen] No existing session found');
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error('[LoginScreen] Error checking session:', error);
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      console.log('[LoginScreen] Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) {
        console.error("[LoginScreen] Auth error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Map specific error messages to user-friendly ones
        let errorMessage = "Login failed";
        
        if (error.message?.includes('Invalid login credentials') || 
            error.message?.includes('invalid_credentials')) {
          errorMessage = "Invalid email or password. Please check and try again.";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Please confirm your email first before logging in.";
        } else if (error.message?.includes('User not found')) {
          errorMessage = "No account found with this email. Please sign up first.";
        } else if (error.message?.includes('NetworkError') || 
                   error.message?.includes('Failed to fetch') ||
                   error.message?.includes('fetch')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.status === 0 || error.message?.includes('offline')) {
          errorMessage = "Unable to reach the server. Please check your internet connection.";
        } else if (error.message?.includes('Too many attempts')) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else {
          // Generic fallback - don't expose internal errors
          console.error('[LoginScreen] Unmapped error:', error.message);
          errorMessage = "Login temporarily unavailable. Please try again in a moment.";
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
      
      if (data.session) {
        console.log('[LoginScreen] Login successful for:', email);
        // Clear guest mode - user is now authenticated
        localStorage.removeItem('guestMode');
        localStorage.removeItem('guestVisits');
        
        toast.success(`Welcome back, ${email.split('@')[0]}!`);
        
        // Redirect to app with replace to prevent back button going to login
        navigate("/app", { replace: true });
      } else {
        console.error('[LoginScreen] Login completed but no session received');
        toast.error("Login failed - please try again");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("[LoginScreen] Unexpected error:", error);
      
      // Handle unexpected errors gracefully
      let errorMessage = "Login temporarily unavailable";
      
      if (error?.message?.includes('NetworkError') || 
          error?.message?.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your internet and try again.";
      } else if (error?.message?.includes('offline')) {
        errorMessage = "You appear to be offline. Please check your internet connection.";
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a8a] to-[#0a0e2a] flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Show loading state while checking existing session */}
      {isCheckingSession ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white/60 text-sm">Checking your session...</p>
        </div>
      ) : (
        <>
          {/* Form */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            <h1 className="text-white text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-white/60 text-sm mb-8">Log in to your nAnoCards account</p>

            <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-white/80 text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-white/80 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-[#1e3a8a] hover:bg-white/90 font-semibold py-3 rounded-xl text-base shadow-lg disabled:opacity-50 h-auto mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>

              <div className="text-center pt-2">
                <span className="text-white/50 text-sm">No account? </span>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-blue-300 text-sm font-medium hover:text-blue-200 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  localStorage.setItem("guestMode", "true");
                  navigate("/app");
                }}
                className="text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Continue as guest
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
