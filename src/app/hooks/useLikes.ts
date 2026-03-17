import { useState, useEffect } from "react";

/**
 * Custom hook for managing liked cards state
 */
export function useLikes(currentUserEmail: string) {
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentUserEmail) {
      loadLikedCards();
    }
  }, [currentUserEmail]);

  const loadLikedCards = () => {
    try {
      const stored = localStorage.getItem(`likedCards_${currentUserEmail}`);
      if (stored) {
        setLikedCards(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Error loading liked cards:', error);
    }
  };

  const toggleLike = (cardId: string) => {
    setLikedCards(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(cardId)) {
        newLiked.delete(cardId);
      } else {
        newLiked.add(cardId);
      }
      
      // Save to localStorage
      if (currentUserEmail) {
        localStorage.setItem(
          `likedCards_${currentUserEmail}`,
          JSON.stringify(Array.from(newLiked))
        );
      }
      
      return newLiked;
    });
  };

  const isLiked = (cardId: string) => likedCards.has(cardId);

  return {
    likedCards,
    toggleLike,
    isLiked,
  };
}
