import { useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * TopCardsScreen - Redirects to the main app feed
 *
 * This component exists to redirect any existing references from /top-cards
 * to the new main app feed location, preserving behavior without duplicating the view.
 */
export function TopCardsScreen() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/app'); }, [navigate]);
  return null;
}