import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { supabase, API_BASE_URL } from "../../lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";

export function SignupScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      console.log('[SignupScreen] Creating account for:', email);
      const response = await fetch(`${API_BASE_URL}/make-server-d91f8206/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || email.split("@")[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Signup error:", data);
        toast.error(data.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('[SignupScreen] Account created, auto-logging in');
        
        // Auto-login the user immediately after signup
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginError) {
            console.error('[SignupScreen] Auto-login failed:', loginError);
            // Even if auto-login fails, account is created, let user go to app
            toast.success("Account created! Please log in with your credentials");
            navigate("/login", { replace: true });
            return;
          }

          if (loginData.session) {
            console.log('[SignupScreen] Auto-login successful');
            // Clear guest mode flag
            localStorage.removeItem('guestMode');
            localStorage.removeItem('guestVisits');
            toast.success("Account created and logged in!");
            navigate("/app", { replace: true });
          }
        } catch (autoLoginError) {
          console.error('[SignupScreen] Auto-login error:', autoLoginError);
          toast.success("Account created! Redirecting to login...");
          navigate("/login", { replace: true });
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error?.message || "Failed to create account");
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
        <h1 className="text-white text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-white/60 text-sm mb-8">Join nAnoCards today</p>

        <form onSubmit={handleSignup} className="w-full max-w-md space-y-4">
          {/* Display Name */}
          <div>
            <label htmlFor="signup-displayName" className="block text-white/80 text-sm font-medium mb-2">Display Name (Optional)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
              <input
                id="signup-displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-white/80 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-white/80 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirmPassword" className="block text-white/80 text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
              <input
                id="signup-confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-[#1e3a8a] hover:bg-white/90 font-semibold py-3 rounded-xl text-base shadow-lg disabled:opacity-50 h-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Login Link */}
          <div className="text-center pt-2">
            <span className="text-white/50 text-sm">Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-300 text-sm font-medium hover:text-blue-200 transition-colors"
            >
              Log In
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
