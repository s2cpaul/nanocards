import { useState, useEffect } from "react";
import { supabase, initializeAuth } from "../../lib/supabase";

/**
 * Custom hook for managing authentication state
 */
export function useAuth() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for dev mode
      const urlParams = new URLSearchParams(window.location.search);
      const devMode = urlParams.get('dev') === 'cara';
      
      if (devMode) {
        setCurrentUserEmail("carapaulson1@gmail.com");
        setIsGuestMode(false);
        setLoading(false);
        return;
      }

      // Ensure auth initialization (restores session from localStorage/cookies)
      try {
        await initializeAuth();
      } catch (err) {
        console.warn('[useAuth] initializeAuth failed:', err);
      }

      // Check actual auth session FIRST (before guest mode)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        setIsGuestMode(false);
        setLoading(false);
        return;
      }

      // Check for guest mode ONLY if no valid session
      const guestMode = localStorage.getItem('guestMode') === 'true';
      if (guestMode) {
        setIsGuestMode(true);
        setLoading(false);
        return;
      }

      // No session and no guest mode
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('guestMode');
    localStorage.removeItem('guestVisits');
    setCurrentUserEmail("");
    setIsGuestMode(false);
  };

  return {
    currentUserEmail,
    isGuestMode,
    loading,
    logout,
    setCurrentUserEmail,
    setIsGuestMode,
  };
}
