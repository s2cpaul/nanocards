import { useState, useEffect } from "react";

const GUEST_VISIT_LIMIT = 10;

/**
 * Custom hook for managing guest mode visits
 */
export function useGuestMode(isGuestMode: boolean) {
  const [guestVisitsRemaining, setGuestVisitsRemaining] = useState(GUEST_VISIT_LIMIT);
  const [showGuestBanner, setShowGuestBanner] = useState(true);

  useEffect(() => {
    if (isGuestMode) {
      const visitCount = parseInt(localStorage.getItem('guestVisits') || '0', 10);
      const remaining = Math.max(0, GUEST_VISIT_LIMIT - visitCount);
      setGuestVisitsRemaining(remaining);
    }
  }, [isGuestMode]);

  const incrementVisit = () => {
    if (isGuestMode) {
      const currentVisits = parseInt(localStorage.getItem('guestVisits') || '0', 10);
      const newVisits = currentVisits + 1;
      localStorage.setItem('guestVisits', newVisits.toString());
      setGuestVisitsRemaining(Math.max(0, GUEST_VISIT_LIMIT - newVisits));
    }
  };

  const dismissBanner = () => {
    setShowGuestBanner(false);
  };

  return {
    guestVisitsRemaining,
    showGuestBanner,
    incrementVisit,
    dismissBanner,
  };
}
