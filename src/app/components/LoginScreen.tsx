import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing session - fast redirect if already logged in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          console.log('[LoginScreen] Existing session found, redirecting to app');
          navigate("/app", { replace: true });
        }
      } catch (error) {
        console.error('[LoginScreen] Error checking session:', error);
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
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error);
        console.error("Error message:", error.message);
        console.error("Error status:", error.status);
        
        // Provide more specific error messages
        let errorMessage = "Failed to login";
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Please confirm your email first";
        } else if (error.message?.includes('NetworkError') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          errorMessage = "Network error - please check your internet connection and try again";
        } else if (error.status === 0) {
          errorMessage = "Cannot reach Supabase - check your internet connection";
        } else {
          errorMessage = error.message || "Failed to login";
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
      
      if (data.session) {
        console.log('[LoginScreen] Login successful, clearing guest mode');
        // Clear guest mode flag when successfully logging in
        localStorage.removeItem('guestMode');
        localStorage.removeItem('guestVisits');
        toast.success("Welcome back!");
        // Use replace: true to prevent back button going to login
        navigate("/app", { replace: true });
      } else {
        toast.error("Login failed - no session created");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error type:", error?.constructor?.name);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack?.split('\n')[0],
      });
      
      let errorMessage = "Failed to login";
      if (error?.message?.includes('NetworkError') || error?.message?.includes('fetch')) {
        errorMessage = "Network error - please check your internet connection";
      } else if (error?.message?.includes('offline')) {
        errorMessage = "You appear to be offline - please check your internet";
      } else {
        errorMessage = error?.message || "Failed to login";
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
    </div>
  );
}
