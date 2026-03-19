import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase, initializeAuth } from "@/supabase";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";

export function SimpleSignup() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation derived state
  const isMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const passwordValid = isMinLength && hasLetter && hasNumber;

  useEffect(() => {
    // focus email on mount
    const el = document.querySelector<HTMLInputElement>("#signup-email");
    el?.focus();
  }, []);

  const generatePassword = useCallback(() => {
    const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ"; // exclude l, o, i
    const numbers = "23456789"; // exclude 0,1
    const all = letters + numbers;

    function pick(set: string, n: number) {
      let s = "";
      for (let i = 0; i < n; i++) s += set[Math.floor(Math.random() * set.length)];
      return s;
    }

    let chars = pick(letters, 2) + pick(numbers, 2) + pick(all, 6);
    // shuffle
    chars = chars.split("").sort(() => Math.random() - 0.5).join("");

    setPassword(chars);
    setConfirmPassword(chars);
    setShowPassword(true);
    toast.success("Suggested password generated and filled");
  }, []);

  const onSuggestClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    generatePassword();
  }, [generatePassword]);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ageChecked) {
      toast.error("You must be 13 years of age or older");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!passwordValid) {
      toast.error("Password must be at least 8 characters and include letters and numbers");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      // Clear any guest-mode flags so the app shows the authenticated user
      try {
        localStorage.removeItem('guestMode');
        localStorage.removeItem('guestVisits');
      } catch (e) {
        /* ignore */
      }

      // Try to initialize auth state so header/profile updates immediately
      try {
        await initializeAuth();
      } catch (e) {
        console.warn('[SimpleSignup] initializeAuth failed', e);
      }

      // Regardless of whether email confirmation is required, send user to the app.
      toast.success('Account created — taking you to the app');
      navigate('/app');
    } catch (err: any) {
      console.error("Unexpected signup error:", err);
      toast.error(err?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }, [ageChecked, email, password, passwordValid, passwordsMatch, displayName, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a8a] to-[#0a0e2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-transparent">
        <div className="mb-6 flex items-center gap-3">
          <button
            aria-label="Go back"
            onClick={() => navigate("/")}
            className="text-white/90 p-2 rounded-md hover:bg-white/5"
          >
            <ArrowLeft strokeWidth={1.5} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-white text-3xl font-bold">Create Your Account</h1>
            <p className="text-white/60 text-sm mt-1">Before creating a card, you need to set up your account. Fill out the form below to get started.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 bg-white/5 p-6 rounded-xl">
          {/* Full Name */}
          <label className="block text-white/90 text-sm font-medium">Full Name</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-white/80">
              <User strokeWidth={1.5} />
            </div>
            <input
              id="signup-displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              aria-required="true"
              placeholder="Jane Doe"
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              aria-label="Full name"
            />
          </div>

          {/* Email */}
          <label className="block text-white/90 text-sm font-medium">Email Address</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-white/80">
              <Mail strokeWidth={1.5} />
            </div>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane@example.com"
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              aria-label="Email address"
            />
          </div>

          {/* Password */}
          <div className="flex items-center justify-between">
            <label className="block text-white/90 text-sm font-medium">Password</label>
            <button className="text-blue-300 text-sm" onClick={onSuggestClick}>
              <RefreshCw className="inline-block mr-1" strokeWidth={1.5} /> Suggest password
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-3 text-white/80">
              <Lock strokeWidth={1.5} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 8 characters (with numbers and letters)"
              className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-3 text-white/90"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
            </button>
          </div>

          {/* Password checklist */}
          <div className="flex flex-col gap-1 text-sm mt-1">
            <div className="flex items-center gap-2 text-white/80">
              {isMinLength ? <Check className="text-green-400" strokeWidth={1.5} /> : <X className="text-white/40" strokeWidth={1.5} />}
              <span className={isMinLength ? "text-white" : "text-white/60"}>8 characters minimum</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              {hasLetter ? <Check className="text-green-400" strokeWidth={1.5} /> : <X className="text-white/40" strokeWidth={1.5} />}
              <span className={hasLetter ? "text-white" : "text-white/60"}>Contains a letter</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              {hasNumber ? <Check className="text-green-400" strokeWidth={1.5} /> : <X className="text-white/40" strokeWidth={1.5} />}
              <span className={hasNumber ? "text-white" : "text-white/60"}>Contains a number</span>
            </div>
          </div>

          {/* Confirm Password */}
          <label className="block text-white/90 text-sm font-medium mt-2">Confirm Password</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-white/80">
              <Lock strokeWidth={1.5} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              aria-label="Confirm password"
            />
          </div>

          {!passwordsMatch && confirmPassword.length > 0 && (
            <p className="text-sm text-red-400">Passwords do not match</p>
          )}

          <label className="flex items-center gap-3 mt-1 text-white/90">
            <input
              type="checkbox"
              checked={ageChecked}
              onChange={(e) => setAgeChecked(e.target.checked)}
              required
              aria-required="true"
              className="w-4 h-4"
              aria-label="I am 13 years of age or older"
            />
            <span className="text-sm">I am 13 years of age or older</span>
          </label>

          <button
            type="submit"
            disabled={!passwordValid || !ageChecked || loading}
            className={`w-full rounded-xl py-3 mt-1 flex items-center justify-center ${
              loading ? "bg-white/80 text-[#1e3a8a]" : "bg-white text-[#1e3a8a]"
            }`}
            aria-disabled={(!passwordValid || !ageChecked || loading) ? "true" : "false"}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" strokeWidth={1.5} /> Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="flex items-center justify-between mt-3 text-sm">
            <button
              type="button"
              className="text-white/90 underline"
              onClick={() => navigate("/login")}
            >
              Already have an account? Log In
            </button>

            <button
              type="button"
              className="text-white/90 underline"
              onClick={() => {
                localStorage.setItem("guestMode", "true");
                navigate("/app");
              }}
            >
              Continue as guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SimpleSignup;
