import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UniversalCard } from './UniversalCard';
import { NanoCard } from '../types';
import { supabase, API_BASE_URL, getAuthHeaders } from '../../lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CardDetailView - Deep link handler for QR code scans
 * 
 * When someone scans a QR code, they land here and see the full card details.
 * URL format: /card/:cardId
 */

export function CardDetailView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<NanoCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    loadUserSession();
    loadCard();
  }, [cardId]);

  const loadUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUserEmail(session.user.email || null);
      setIsGuestMode(false);
      
      // Load liked cards for this user
      const stored = localStorage.getItem(`likedCards_${session.user.email}`);
      if (stored) {
        setLikedCards(new Set(JSON.parse(stored)));
      }
    } else {
      setIsGuestMode(true);
    }
  };

  const loadCard = async () => {
    if (!cardId) return;
    
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setCard(data.card);
      } else {
        toast.error('Card not found');
        navigate('/app');
      }
    } catch (error) {
      console.error('Error loading card:', error);
      toast.error('Failed to load card');
      navigate('/app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!card) return;
    
    const isLiked = likedCards.has(card.id);
    const newLikedCards = new Set(likedCards);
    
    if (isLiked) {
      newLikedCards.delete(card.id);
    } else {
      newLikedCards.add(card.id);
    }
    
    setLikedCards(newLikedCards);

    // Update localStorage
    if (currentUserEmail) {
      localStorage.setItem(`likedCards_${currentUserEmail}`, JSON.stringify(Array.from(newLikedCards)));
    }

    // Optimistically update the UI
    setCard({
      ...card,
      likes: card.likes + (isLiked ? -1 : 1)
    });

    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE_URL}/cards/${card.id}/like`, {
        method: 'POST',
        headers,
      });
    } catch (error) {
      console.error('Error liking card:', error);
      // Revert on error
      setLikedCards(likedCards);
      setCard({
        ...card,
        likes: card.likes + (isLiked ? 1 : -1)
      });
    }
  };

  const handleEdit = () => {
    if (card) {
      navigate(`/edit/${card.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Card not found</p>
          <button
            onClick={() => navigate('/app')}
            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const isOwner = currentUserEmail && card.createdBy === currentUserEmail;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">nA</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">nAnoCards</h1>
          </div>
        </div>
      </div>

      {/* Card Display */}
      <div className="px-4 py-6">
        <UniversalCard
          id={card.id}
          title={card.title}
          videoUrl={card.videoUrl}
          videoTime={card.videoTime}
          likes={card.likes}
          isLiked={likedCards.has(card.id)}
          onLike={handleLike}
          cardNumber={cardId || '000'}
          informationText={card.information || card.insights?.information}
          qrCodeUrl={card.qrCodeUrl}
          onEdit={isOwner ? handleEdit : undefined}
        />

        {/* Card Metadata */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Card Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Card ID:</span>
              <span className="font-semibold text-gray-900">#{cardId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created by:</span>
              <span className="font-medium text-gray-900">{card.createdBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-700">
                {new Date(card.createdAt).toLocaleDateString()}
              </span>
            </div>
            {card.category && (
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="text-gray-700">{card.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action for Non-Users */}
        {isGuestMode && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <h3 className="font-bold text-blue-900 mb-2">Want to create your own nAnoCards?</h3>
            <p className="text-blue-800 text-sm mb-4">
              Sign up now to create, share, and manage your own AI product cards!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}