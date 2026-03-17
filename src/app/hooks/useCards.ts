import { useState, useEffect } from "react";
import { NanoCard } from "../types";
import { API_BASE_URL, getAuthHeaders } from "../../lib/supabase";
import { toast } from "sonner";

/**
 * Custom hook for managing nanocard CRUD operations
 */
export function useCards(currentUserEmail: string, isGuestMode: boolean) {
  const [cards, setCards] = useState<NanoCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUserEmail || isGuestMode) {
      loadCards();
    }
  }, [currentUserEmail, isGuestMode]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cards`, {
        headers: await getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      } else {
        console.error('Failed to load cards');
        setCards([]);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const likeCard = async (cardId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}/like`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      });

      if (response.ok) {
        // Update local state
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === cardId ? { ...card, likes: card.likes + 1 } : card
          )
        );
      }
    } catch (error) {
      console.error('Error liking card:', error);
      toast.error('Failed to like card');
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });

      if (response.ok) {
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
        toast.success('Card deleted successfully');
      } else {
        toast.error('Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

  return {
    cards,
    loading,
    loadCards,
    likeCard,
    deleteCard,
    setCards,
  };
}
