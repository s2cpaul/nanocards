import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, TrendingUp } from "lucide-react";
import { UniversalCard } from "./UniversalCard";
import { GlobalHeader } from "./GlobalHeader";
import { NanoCard } from "../types";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";
import { toast } from "sonner";
import { Input } from "./ui/input";

/**
 * TopCardsScreen - Browse all nAnoCards sorted by likes
 *
 * Shows all cards from the backend. Card #001 ("nAnoCards: Edge Micro Learning")
 * is the featured card visible to everyone. No hardcoded duplicates.
 * Each card has a unique ID and unique QR code.
 */
export function TopCardsScreen() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<NanoCard[]>([]);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [isGuestMode, setIsGuestMode] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState("free");

  useEffect(() => {
    checkAuth();
    loadCards();
  }, []);

  const checkAuth = async () => {
    try {
      const isGuest = localStorage.getItem("guestMode") === "true";
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        setIsGuestMode(false);

        // Load profile
        try {
          const headers = await getAuthHeaders();
          const response = await fetch(`${API_BASE_URL}/user/profile`, { headers });
          if (response.ok) {
            const data = await response.json();
            setDisplayName(data.displayName || "");
            setUserPoints(data.points || 0);
            setSubscriptionTier(data.subscriptionTier || "free");
          }
        } catch (err) {
          console.error("Error loading profile:", err);
        }
      } else {
        setIsGuestMode(true);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsGuestMode(true);
    }
  };

  const handleLogout = async () => {
    if (isGuestMode) {
      localStorage.removeItem("guestMode");
      navigate("/");
    } else {
      await supabase.auth.signOut();
      setCurrentUserEmail("");
      setIsGuestMode(true);
      navigate("/");
    }
  };

  const loadCards = async () => {
    setIsLoading(true);
    try {
      // Create featured card #001 - ALWAYS VIEWABLE BY ALL (no auth required)
      // This is the primary introduction card for nAnoCards
      const featuredCard: any = {
        id: 'featured-001',
        title: 'nAnoCards Overview',
        videoUrl: 'https://ffhowwvlytnoulijclac.supabase.co/storage/v1/object/public/nano/nAnoCards-short.mp4',
        videoTime: '2:30',
        likes: 1000,
        createdBy: 'carapaulson1@gmail.com', // Created by Cara - so she can edit it
        createdAt: new Date(0).toISOString(), // Very old date so it sorts to top
        information: 'Watch this quick demo to learn how to create and share your nano learning cards with the world.',
        insights: {},
        globalCardNumber: '001',
        isPublic: true, // Explicitly public - viewable by all
        visibility: 'public', // Public visibility
      };

      let cardsArray = [featuredCard]; // START with featured card - ALWAYS shown

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/cards`, { headers });

        if (response.ok) {
          const data = await response.json();
          const apiCards = data.cards || [];
          // Add any cards from the API after the featured card
          cardsArray = [featuredCard, ...apiCards];
        }
      } catch (error) {
        console.error("Error fetching cards from API:", error);
        // Still show featured card even if API fails
      }

      // Sort by creation date (oldest first) to assign consistent card numbers
      const sortedByCreation = cardsArray.sort((a: NanoCard, b: NanoCard) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Assign global card numbers
      const cardsWithNumbers = sortedByCreation.map((card: NanoCard, index: number) => ({
        ...card,
        globalCardNumber: String(index + 1).padStart(3, "0"),
      }));

      // Sort by likes for display
      const sortedByLikes = cardsWithNumbers.sort((a: any, b: any) => b.likes - a.likes);
      setCards(sortedByLikes);
    } catch (error) {
      console.error("Error loading cards:", error);
      // FALLBACK: Show at least the featured card
      const featuredCard: any = {
        id: 'featured-001',
        title: 'nAnoCards Overview',
        videoUrl: 'https://ffhowwvlytnoulijclac.supabase.co/storage/v1/object/public/nano/nAnoCards-short.mp4',
        videoTime: '2:30',
        likes: 1000,
        createdBy: 'carapaulson1@gmail.com', // Created by Cara - so she can edit it
        createdAt: new Date(0).toISOString(),
        information: 'Watch this quick demo to learn how to create and share your nano learning cards with the world.',
        insights: {},
        globalCardNumber: '001',
        isPublic: true,
        visibility: 'public',
      };
      setCards([featuredCard]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (cardId: string) => {
    const isLiked = likedCards.has(cardId);
    const newLikedCards = new Set(likedCards);

    if (isLiked) newLikedCards.delete(cardId);
    else newLikedCards.add(cardId);

    setLikedCards(newLikedCards);

    // Optimistic update
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, likes: card.likes + (isLiked ? -1 : 1) }
          : card
      )
    );

    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE_URL}/cards/${cardId}/like`, {
        method: "POST",
        headers,
      });
    } catch (error) {
      console.error("Error liking card:", error);
      // Revert on error
      setLikedCards(likedCards);
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ? { ...card, likes: card.likes + (isLiked ? 1 : -1) }
            : card
        )
      );
    }
  };

  // Filter by search
  const filteredCards = cards.filter((card) => {
    const query = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(query) ||
      card.id.toLowerCase().includes(query) ||
      card.createdBy?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <GlobalHeader
        currentUserEmail={currentUserEmail}
        displayName={displayName}
        isGuestMode={isGuestMode}
        userPoints={userPoints}
        subscriptionTier={subscriptionTier}
        onLogout={handleLogout}
      />

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
          <Input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 rounded-lg border-gray-300 bg-white"
          />
        </div>

        {/* Featured by most popular pill */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            Featured by most popular
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-3 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading top cards...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {filteredCards.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                {searchQuery ? "No cards match your search." : "No cards yet."}
              </div>
            ) : (
              filteredCards.map((card: any) => {
                const canEdit = !isGuestMode &&
                  (currentUserEmail === "carapaulson1@gmail.com" || card.createdBy === currentUserEmail);

                // DEBUG: Log edit permissions
                if (card.id !== 'featured-001') {
                  console.log(`Card ${card.id}: createdBy="${card.createdBy}", userEmail="${currentUserEmail}", canEdit=${canEdit}`);
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
                    thumbnail={card.thumbnail || card.insights?.thumbnail}
                    qrCodeUrl={card.qrCodeUrl}
                    onEdit={canEdit ? () => navigate(`/quick-edit?cardId=${card.id}`) : undefined}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}