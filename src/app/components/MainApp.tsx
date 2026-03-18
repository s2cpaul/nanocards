import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { NanoCard } from "../types";
import { UniversalCard } from "./UniversalCard";
import { GlobalHeader } from "./GlobalHeader";
import { supabase, API_BASE_URL, getAuthHeaders, getCurrentSession, initializeAuth } from "../../lib/supabase";
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
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const loadCards = async () => {
    try {
      // Fetch cards from backend
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards`, { headers });

      if (!response.ok) {
        console.error('Failed to load cards from server', response.status);
        setCards([]);
        return;
      }

      const data = await response.json();
      const allCards: NanoCard[] = data.cards || [];

      // Ensure each card uses the server-assigned ID as the global card number
      const cardsWithNumbers = allCards.map((card: any) => ({
        ...card,
        globalCardNumber: card.globalCardNumber || card.id,
      }));

      setCards(cardsWithNumbers);
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
      try {
        console.log('[MainApp] Starting authentication initialization...');
        
        // Check for OAuth callback
        const isOAuthCallback = window.location.hash &&
          (window.location.hash.includes('access_token') || window.location.hash.includes('error'));

        if (isOAuthCallback) {
          console.log('[MainApp] OAuth callback detected, waiting for session...');
          setLoading(true);
          localStorage.removeItem('oauthInProgress');
          // Let the auth state listener handle it
          return;
        }

        // Try to restore existing session
        // Ensure auth system has a chance to initialize and refresh tokens
        await initializeAuth();
        const session = await getCurrentSession();
        
        if (!isMounted) return;

        if (session?.user?.email) {
          console.log('[MainApp] Session restored for:', session.user.email);
          const userEmail = session.user.email;
          setCurrentUserEmail(userEmail);
          setIsAdmin(userEmail === "carapaulson1@gmail.com");
          setIsGuestMode(false);
          hasProcessedAuth = true;
          localStorage.removeItem('oauthInProgress');
          
          // Load user data
          await Promise.all([
            loadCards(),
            loadLikedCards(),
            loadUserProfile()
          ]);
        } else {
          console.log('[MainApp] No existing session, using guest mode');
          setIsGuestMode(true);
          await loadCards();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[MainApp] Error during auth initialization:', error);
        setIsGuestMode(true);
        setLoading(false);
      }
    };

    // Set up auth state listener for future changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('[MainApp] Auth state change:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session && !hasProcessedAuth) {
          hasProcessedAuth = true;
          localStorage.removeItem('oauthInProgress');
          const userEmail = session.user.email || "";
          console.log('[MainApp] User signed in:', userEmail);
          
          setCurrentUserEmail(userEmail);
          setIsAdmin(userEmail === "carapaulson1@gmail.com");
          setIsGuestMode(false);
          setLoading(false);
          
          await Promise.all([
            loadCards(),
            loadLikedCards(),
            loadUserProfile()
          ]);
          
          // Clean up OAuth hash
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[MainApp] User signed out');
          localStorage.removeItem('oauthInProgress');
          hasProcessedAuth = false;
          setIsGuestMode(true);
          setCurrentUserEmail('');
          setDisplayName('');
          setSubscriptionTier('free');
          setUserPoints(0);
          await loadCards();
        }
      }
    );

    // Initialize auth on component mount
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
    // Allow anyone (including guests) to open the create flow UI. The CreateCard component
    // enforces that only authenticated users may submit/save a card (it checks isGuestMode).
    // Guests will be shown the form but will see a login prompt if they try to submit.
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

  const handleSaveCard = async (cardId: string, data: { title: string; informationText?: string }) => {
    try {
      // Use service role key for direct database access
      const { data: updateData, error } = await supabase
        .from('cards')
        .update({
          title: data.title,
          information: data.informationText,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId)
        .select();

      if (error) {
        console.error('Error updating card:', error);
        toast.error('Failed to update card');
        return;
      }

      // Update local state
      setCards(cards.map(card =>
        card.id === cardId ? { ...card, ...updateData[0] } : card
      ));

      toast.success('Card updated successfully');
      setEditingCardId(null);
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card');
    }
  };

  const handleToggleEdit = (cardId: string) => {
    setEditingCardId(editingCardId === cardId ? null : cardId);
  };

  // Filter cards - RULE: Card #001 is NEVER filtered out
  const filteredCards = cards
    .filter((card: any) => {
      // RULE: Card #001 is ALWAYS visible to everyone - it can never be filtered out
      const isCard001 = card.globalCardNumber === '001';
      if (isCard001) return true; // Card #001 ALWAYS passes through
      
      // For all other cards: must match search AND view
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.id.includes(searchQuery) ||
        card.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesView = cardView === "all" || card.createdBy === currentUserEmail;
      
      return matchesSearch && matchesView;
    })
    .sort((a: any, b: any) => {
      // RULE: Card #001 always appears first
      if (a.globalCardNumber === '001') return -1;
      if (b.globalCardNumber === '001') return 1;
      // Then sort by newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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
            <SelectTrigger className="w-full md:w-[220px] h-10 rounded-lg border border-gray-300 bg-gray-700 text-gray-100 text-base font-medium">
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
              
              // DEBUG: Log edit permissions
              if (card.id !== 'featured-001') {
                console.log(`MainApp - Card ${card.id}: createdBy="${card.createdBy}", userEmail="${currentUserEmail}", isOwner=${isOwner}`);
              }
              
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
                  onSave={(data) => handleSaveCard(card.id, data)}
                  isEditing={editingCardId === card.id}
                  onToggleEdit={() => handleToggleEdit(card.id)}
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
          aria-label="Create content"
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