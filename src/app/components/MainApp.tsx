import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { NanoCard } from "../types";
import { UniversalCard } from "./UniversalCard";
import { GlobalHeader } from "./GlobalHeader";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { WelcomeModal } from "./WelcomeModal";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

/**
 * MainApp - Primary card browsing screen
 *
 * Displays nAnoCards with search, filtering, and card actions.
 * Works in guest mode - no login required.
 */
export function MainApp() {
  const navigate = useNavigate();
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("guest@example.com");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(true);
  const [cards, setCards] = useState<NanoCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<NanoCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());

  // Initialize in guest mode
  useEffect(() => {
    loadCards();
    loadLikedCards();
  }, []);

  // Load cards from local storage or use demo cards
  const loadCards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from localStorage first
      const savedCards = localStorage.getItem('nanocards_cards');
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards);
        setCards(parsedCards);
        setFilteredCards(parsedCards);
      } else {
        // Use demo cards if no saved cards
        const demoCards: NanoCard[] = [
          {
            id: "demo-1",
            title: "Welcome to nAnoCards!",
            objective: "Get started with the simplified offline version",
            videoTime: "0:30",
            information: "This is a demo card. Create your own cards to get started. This simplified version works entirely offline with local storage - no API keys needed!",
            likes: 0,
            createdBy: "demo@example.com",
            createdAt: new Date().toISOString(),
            category: "demo",
            isPublic: true,
            insights: {}
          }
        ];
        setCards(demoCards);
        setFilteredCards(demoCards);
        localStorage.setItem('nanocards_cards', JSON.stringify(demoCards));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      setError('Failed to load cards');
    } finally {
      setIsLoading(false);
    }
  };

  // Load liked cards from localStorage
  const loadLikedCards = () => {
    try {
      const saved = localStorage.getItem('nanocards_liked');
      if (saved) {
        setLikedCards(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading liked cards:', error);
    }
  };

  // Filter cards based on search and category
  useEffect(() => {
    let filtered = cards;

    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.objective?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.information?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(card => card.category === selectedCategory);
    }

    setFilteredCards(filtered);
  }, [cards, searchQuery, selectedCategory]);

  const handleLogout = () => {
    // Logout logic here
    navigate("/");
  };

  const handleLikeCard = (cardId: string) => {
    const newLikedCards = new Set(likedCards);
    if (newLikedCards.has(cardId)) {
      newLikedCards.delete(cardId);
    } else {
      newLikedCards.add(cardId);
    }
    setLikedCards(newLikedCards);
    localStorage.setItem('nanocards_liked', JSON.stringify([...newLikedCards]));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading nAnoCards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader
        currentUserEmail={currentUserEmail}
        displayName="Guest User"
        isGuestMode={isGuestMode}
        userPoints={0}
        subscriptionTier="free"
        onLogout={() => {}} // No-op in guest mode
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="demo">Demo</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Welcome Message */}
        {isGuestMode && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to nAnoCards!
            </h1>
            <p className="text-gray-600">
              You're using the simplified offline version of nAnoCards. No API keys required!
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Cards</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create your first card to get started!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <UniversalCard
                key={card.id}
                id={card.id}
                title={card.title}
                videoUrl={card.videoUrl}
                videoTime={card.videoTime}
                likes={card.likes}
                isLiked={likedCards.has(card.id)}
                onLike={() => handleLikeCard(card.id)}
                cardNumber={card.globalCardNumber || card.id}
                informationText={card.information}
                thumbnail={card.thumbnailUrl}
                qrCodeUrl={card.qrCodeUrl}
              />
            ))}
          </div>
        )}
      </div>

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onGetStarted={() => setShowWelcomeModal(false)}
      />

      <PWAInstallPrompt />
    </div>
  );
}