import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { supabase, getCurrentSession } from "../../lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2, ArrowLeft, Eye, EyeOff, Check, X, RefreshCw } from "lucide-react";

export function SignupScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // Password validation states
  const passwordValidations = {
    length: password.length >= 8,
    hasLetters: /[a-zA-Z]/.test(password),
    hasNumbers: /\d/.test(password),
  };

  const generateSecurePassword = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allChars = letters + numbers;
    
    let result = '';
    
    // Ensure at least one letter and one number
    result += letters[Math.floor(Math.random() * letters.length)];
    result += numbers[Math.floor(Math.random() * numbers.length)];
    
    // Fill remaining characters
    for (let i = 2; i < 10; i++) {
      result += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = result.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(shuffled);
    setConfirmPassword(shuffled);
  };

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
      
      // URGENT FIX: Use Supabase Auth directly instead of API endpoint
      // The API endpoint doesn't exist yet, so we bypass it
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
          },
          emailRedirectTo: undefined, // Auto-confirm, no email needed
        },
      });

      if (signupError) {
        console.error("[SignupScreen] Signup error:", signupError.message);
        
        // Map error messages to user-friendly ones
        let errorMessage = signupError.message || "Failed to create account";
        
        // If account already exists
        if (errorMessage.toLowerCase().includes('already registered') || 
            errorMessage.toLowerCase().includes('user already exists')) {
          console.log('[SignupScreen] Account already exists, redirecting to login');
          toast.success("Account already exists. Redirecting to login...");
          setTimeout(() => navigate("/login", { replace: true }), 1000);
          setIsLoading(false);
          return;
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      if (signupData.user) {
        console.log('[SignupScreen] Account created successfully, attempting auto-login');
        
        // Auto-login the user immediately after signup
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password,
          });

          if (loginError) {
            console.error('[SignupScreen] Auto-login failed:', loginError);
            toast.error("Account created! Please log in manually with your credentials.");
            setTimeout(() => navigate("/login", { replace: true }), 1000);
            return;
          }

          if (loginData.session) {
            console.log('[SignupScreen] Auto-login successful for:', email);
            // Clear guest mode flag
            localStorage.removeItem('guestMode');
            localStorage.removeItem('guestVisits');
            
            // If the user did NOT choose to keep signed in, sign them out when the tab/window closes
            if (!keepSignedIn) {
              const signOutOnClose = async () => {
                try {
                  await supabase.auth.signOut();
                } catch (e) {
                  console.error('Error signing out on close:', e);
                }
              };
              window.addEventListener('beforeunload', signOutOnClose);
            }
            
            toast.success(`Welcome, ${email.split('@')[0]}!`);
            // Redirect with replace to prevent back button going to signup
            navigate("/app", { replace: true });
          } else {
            console.error('[SignupScreen] Login completed but no session');
            toast.error("Account created! Please log in manually.");
            navigate("/login", { replace: true });
          }
        } catch (autoLoginError: any) {
          console.error('[SignupScreen] Unexpected auto-login error:', autoLoginError);
          toast.error("Account created! Please log in manually with your credentials.");
          setTimeout(() => navigate("/login", { replace: true }), 1000);
        }
      } else {
        console.error('[SignupScreen] Signup response missing user data');
        toast.error("Failed to create account - please try again");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("[SignupScreen] Unexpected error:", error);
      toast.error(error.message || "Failed to create account");
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password strength indicators */}
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className={`h-1 rounded-full flex-1 ${passwordValidations.length ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(password.length * 10, 100)}%` }} />
                <span className="text-xs text-white/70">{password.length >= 8 ? 'Long enough' : 'At least 8 characters'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-1 rounded-full flex-1 ${passwordValidations.hasLetters ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: passwordValidations.hasLetters ? '100%' : '0%' }} />
                <span className="text-xs text-white/70">{passwordValidations.hasLetters ? 'Contains letters' : 'Add letters'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-1 rounded-full flex-1 ${passwordValidations.hasNumbers ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: passwordValidations.hasNumbers ? '100%' : '0%' }} />
                <span className="text-xs text-white/70">{passwordValidations.hasNumbers ? 'Contains numbers' : 'Add numbers'}</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirmPassword" className="block text-white/80 text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
              <input
                id="signup-confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Keep me signed in */}
          <div className="flex items-center gap-2">
            <input
              id="keep-signed-in"
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-gray-100"
            />
            <label htmlFor="keep-signed-in" className="text-white/70 text-sm cursor-pointer select-none">
              Keep me signed in
            </label>
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

          {/* Password generator */}
          <div className="flex items-center justify-between text-white/50 text-sm">
            <button
              type="button"
              onClick={generateSecurePassword}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Generate secure password
            </button>
            <div className="flex gap-2">
              <span className={`flex items-center gap-1 ${passwordValidations.length ? 'text-green-400' : 'text-red-400'}`}>
                {passwordValidations.length ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                Min 8 chars
              </span>
              <span className={`flex items-center gap-1 ${passwordValidations.hasLetters ? 'text-green-400' : 'text-red-400'}`}>
                {passwordValidations.hasLetters ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                Letters
              </span>
              <span className={`flex items-center gap-1 ${passwordValidations.hasNumbers ? 'text-green-400' : 'text-red-400'}`}>
                {passwordValidations.hasNumbers ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                Numbers
              </span>
            </div>
          </div>

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
