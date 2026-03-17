import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

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

      // Check for guest mode
      const guestMode = localStorage.getItem('guestMode') === 'true';
      if (guestMode) {
        setIsGuestMode(true);
        setLoading(false);
        return;
      }

      // Check actual auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        setIsGuestMode(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
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
