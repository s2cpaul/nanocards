import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { NanoCard } from "../types";
import { UniversalCard } from "./UniversalCard";
import { GlobalHeader } from "./GlobalHeader";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { WelcomeModal } from "./WelcomeModal";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

/**
 * MainApp - Primary card browsing screen
 *
 * Displays nAnoCards with search, filtering, and card actions.
 * No login required for browsing (guest mode supported).
 */
export function MainApp() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<NanoCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardView, setCardView] = useState<"all" | "my">("all");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [showGuestBanner, setShowGuestBanner] = useState(true);

  const loadCards = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards`, { headers });
      const data = await response.json();

      if (response.ok) {
        const cardsArray = data.cards || [];
        const sortedByCreation = cardsArray.sort((a: NanoCard, b: NanoCard) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const cardsWithNumbers = sortedByCreation.map((card: NanoCard, index: number) => ({
          ...card,
          globalCardNumber: String(index + 1).padStart(3, '0'),
        }));

        setCards(cardsWithNumbers);
      } else {
        console.error('Failed to load cards:', data.error);
        setCards([]);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedCards = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/likes`, { headers });
      const data = await response.json();
      if (response.ok) {
        setLikedCards(new Set(data.likes || []));
      }
    } catch (error) {
      console.error('Failed to load liked cards:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/user/profile`, { headers });
      const data = await response.json();
      if (response.ok) {
        setSubscriptionTier(data.subscriptionTier || 'free');
        setDisplayName(data.displayName || '');
        setUserPoints(data.points || 0);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const urlParams = new URLSearchParams(window.location.search);
    const devMode = urlParams.get('dev') === 'cara';
    const viewParam = urlParams.get('view');
    if (viewParam === 'all' || viewParam === 'my') setCardView(viewParam);

    const points = parseInt(localStorage.getItem('userPoints') || '0');
    setUserPoints(points);

    if (devMode) {
      setCurrentUserEmail("carapaulson1@gmail.com");
      setIsAdmin(true);
      setIsGuestMode(false);
      loadCards();
      loadLikedCards();
      return;
    }

    let isMounted = true;
    let hasProcessedAuth = false;

    const initAuth = async () => {
      const isOAuthCallback = window.location.hash &&
        (window.location.hash.includes('access_token') || window.location.hash.includes('error'));

      if (isOAuthCallback) {
        setLoading(true);
        localStorage.removeItem('oauthInProgress');
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Session error:', error);
      if (!isMounted) return;

      if (session) {
        const userEmail = session.user.email || "";
        setCurrentUserEmail(userEmail);
        setIsAdmin(userEmail === "carapaulson1@gmail.com");
        setIsGuestMode(false);
        hasProcessedAuth = true;
        localStorage.removeItem('oauthInProgress');
        loadCards();
        loadLikedCards();
        loadUserProfile();
      } else {
        setIsGuestMode(true);
        loadCards();
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session && !hasProcessedAuth) {
          hasProcessedAuth = true;
          localStorage.removeItem('oauthInProgress');
          const userEmail = session.user.email || "";
          setCurrentUserEmail(userEmail);
          setIsAdmin(userEmail === "carapaulson1@gmail.com");
          setIsGuestMode(false);
          setLoading(false);
          loadCards();
          loadLikedCards();
          loadUserProfile();
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('oauthInProgress');
          setIsGuestMode(true);
          setCurrentUserEmail('');
          loadCards();
        }
      }
    );

    initAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    if (isGuestMode) {
      localStorage.removeItem('guestMode');
      navigate('/');
    } else {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  const handleCreateCard = () => {
    if (isGuestMode) {
      toast.error('Account required to create cards', {
        description: 'Please login to create your own nAnoCards',
        duration: 4000,
      });
      return;
    }
    navigate('/create');
  };

  const handleLike = async (cardId: string) => {
    if (isGuestMode) {
      const newLikedCards = new Set(likedCards);
      if (newLikedCards.has(cardId)) {
        newLikedCards.delete(cardId);
      } else {
        newLikedCards.add(cardId);
      }
      setLikedCards(newLikedCards);
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}/like`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      if (response.ok) {
        setCards(cards.map(card =>
          card.id === cardId ? data.card : card
        ));
        const newLikedCards = new Set(likedCards);
        if (data.isLiked) newLikedCards.add(cardId);
        else newLikedCards.delete(cardId);
        setLikedCards(newLikedCards);
      } else {
        toast.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleDelete = async (cardId: string) => {
    if (isGuestMode) {
      toast.error('Account required');
      return;
    }
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Card deleted');
        setCards(cards.filter(card => card.id !== cardId));
      } else {
        toast.error(data.error || 'Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

  // Filter cards
  const filteredCards = cards
    .filter((card: any) => {
      // Card #001 is always visible to everyone
      const isCard001 = card.globalCardNumber === '001';
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.id.includes(searchQuery) ||
        card.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesView = cardView === "all" || card.createdBy === currentUserEmail;
      
      // Show card #001 always, or show other cards if they match search and view
      return isCard001 || (matchesSearch && matchesView);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader
        currentUserEmail={currentUserEmail}
        displayName={displayName}
        isGuestMode={isGuestMode}
        userPoints={userPoints}
        subscriptionTier={subscriptionTier}
        onLogout={handleLogout}
      />

      <div className="max-w-2xl mx-auto px-2 pt-0 pb-24">
        {/* Guest Banner */}
        {isGuestMode && showGuestBanner && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#1e3a8a] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="flex-1">
              <button
                onClick={() => navigate('/subscription')}
                className="text-sm text-[#1e3a8a] hover:text-blue-700 underline font-medium"
              >
                View Pricing Tiers
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter - Sticky */}
        <div className="sticky top-[57px] z-40 bg-gray-50 pb-2 -mx-2 px-2 pt-0">
          <div className="relative mb-3 pt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <Input
              type="text"
              placeholder="Search by keyword, topic, user, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 rounded-lg border-gray-300 bg-white"
            />
          </div>

          <Select value={cardView} onValueChange={(value: "all" | "my") => setCardView(value)}>
            <SelectTrigger className="w-[184px] h-9 rounded-lg border-gray-300 bg-gray-900 text-white text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Top nAnoCards</SelectItem>
              <SelectItem value="my">My nAnoCards</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards */}
        <div className="flex flex-col items-center gap-3">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No cards found. {searchQuery ? "Try adjusting your search." : "Create your first nAnoCard."}
            </div>
          ) : (
            filteredCards.map((card: any) => {
              const isOwner = !isGuestMode && (currentUserEmail === "carapaulson1@gmail.com" || card.createdBy === currentUserEmail);
              return (
                <UniversalCard
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  videoUrl={card.videoUrl}
                  videoTime={card.videoTime}
                  likes={card.likes}
                  isLiked={likedCards.has(card.id)}
                  onLike={() => handleLike(card.id)}
                  cardNumber={card.globalCardNumber}
                  informationText={card.information || card.insights?.information}
                  onEdit={isOwner ? () => navigate(`/quick-edit?cardId=${card.id}`) : undefined}
                  thumbnail={card.thumbnail}
                  qrCodeUrl={card.qrCodeUrl}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Floating Create Button */}
      <div className="fixed bottom-2.5 right-2.5">
        <button
          onClick={handleCreateCard}
          className="w-12 h-12 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity"
        >
          <Plus className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onGetStarted={() => {
          setShowWelcomeModal(false);
          navigate('/instructions');
        }}
      />

      <PWAInstallPrompt />

      {/* Dev Link */}
      <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 z-10">
        <a href="/app?dev=cara" className="text-[10px] text-gray-300 hover:text-gray-500 underline">dev</a>
      </div>
    </div>
  );
}