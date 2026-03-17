import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Calendar,
  Award,
  Star,
  TrendingUp,
  Heart,
  Edit3,
  ChevronLeft,
  Eye,
  EyeOff,
  Crown,
  Trophy,
  BookOpen,
  Check,
  Home,
  ShoppingCart,
  Brain,
  Grid3x3,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { NanoCard } from "../types";
import { UniversalCard } from "./UniversalCard";
import { HamburgerMenu } from "./HamburgerMenu";
import { GlobalHeader } from "./GlobalHeader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";

/**
 * Profile screen component - displays user info, stats, and settings
 */
export function ProfileScreen() {
  const navigate = useNavigate();
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [userCards, setUserCards] = useState<NanoCard[]>([]);
  const [userStats, setUserStats] = useState({
    totalCards: 0,
    totalLikes: 0,
    points: 0,
    cardsEarned: 0,
  });
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for dev mode
      const urlParams = new URLSearchParams(window.location.search);
      const devMode = urlParams.get("dev") === "cara";

      if (devMode) {
        setCurrentUserEmail("carapaulson1@gmail.com");
        setIsAdmin(true);
        setDisplayName("Cara Paulson");
        loadUserData("carapaulson1@gmail.com");
        return;
      }

      // Check actual auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const guestMode = localStorage.getItem("guestMode");
        if (guestMode) {
          setIsGuestMode(true);
          setCurrentUserEmail(guestMode);
          setDisplayName("Guest User");
          loadUserData(guestMode);
        } else {
          navigate("/");
        }
        return;
      }

      const userEmail = session.user.email || "";
      setCurrentUserEmail(userEmail);
      setIsAdmin(userEmail === "carapaulson1@gmail.com");
      // Use email prefix as fallback display name
      const initialName = session.user.user_metadata?.name || userEmail.split("@")[0] || "User";
      setDisplayName(initialName);
      loadUserData(userEmail);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/");
    }
  };

  const loadUserData = async (email: string) => {
    try {
      setLoading(true);

      // Load user profile from backend
      const profileResponse = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: await getAuthHeaders(),
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        // Update display name from backend, or keep the fallback we set earlier
        if (profileData.displayName) {
          setDisplayName(profileData.displayName);
        }
        setSubscriptionTier(profileData.subscriptionTier || 'free');
        setUserStats(prev => ({
          ...prev,
          points: profileData.points || 0,
        }));
        console.log('ProfileScreen: Loaded user profile:', profileData);
      }

      // Load user's cards
      const response = await fetch(`${API_BASE_URL}/cards`, {
        headers: await getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const allCards = data.cards || [];
        
        // Sort all cards by createdAt (oldest first) to get consistent global numbering
        const sortedByCreation = allCards.sort((a: NanoCard, b: NanoCard) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Assign global card numbers based on creation order
        const cardsWithNumbers = sortedByCreation.map((card: NanoCard, index: number) => ({
          ...card,
          globalCardNumber: String(index + 1).padStart(3, '0')
        }));
        
        // Filter to only show user's own cards
        const myCards = cardsWithNumbers.filter((card: any) => card.createdBy === email);
        setUserCards(myCards);

        // Calculate stats
        const totalLikes = myCards.reduce((sum: number, card: any) => sum + card.likes, 0);

        setUserStats(prev => ({
          ...prev,
          totalCards: myCards.length,
          totalLikes,
        }));
      }

      // Load liked cards from localStorage
      const stored = localStorage.getItem(`likedCards_${email}`);
      if (stored) {
        setLikedCards(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("guestMode");
      localStorage.removeItem("guestVisits");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleSaveName = () => {
    setDisplayName(tempName);
    localStorage.setItem(`displayName_${currentUserEmail}`, tempName);
    setEditingName(false);
    toast.success("Name updated");
  };

  const handleLike = async (cardId: string) => {
    // Toggle like in local state
    setLikedCards((prev) => {
      const newLiked = new Set(prev);
      if (newLiked.has(cardId)) {
        newLiked.delete(cardId);
      } else {
        newLiked.add(cardId);
      }
      localStorage.setItem(`likedCards_${currentUserEmail}`, JSON.stringify(Array.from(newLiked)));
      return newLiked;
    });

    // Call API
    try {
      await fetch(`${API_BASE_URL}/cards/${cardId}/like`, {
        method: "POST",
        headers: await getAuthHeaders(),
      });
    } catch (error) {
      console.error("Error liking card:", error);
    }
  };

  const getTierBadge = () => {
    const tierConfig: Record<string, { name: string; color: string; icon: JSX.Element }> = {
      free: { name: "Free", color: "bg-gray-100 text-gray-800", icon: <User className="w-4 h-4" /> },
      student: { name: "Student", color: "bg-blue-100 text-blue-800", icon: <User className="w-4 h-4" /> },
      creator: { name: "Creator", color: "bg-purple-100 text-purple-800", icon: <Crown className="w-4 h-4" /> },
      pro: { name: "Pro", color: "bg-indigo-100 text-indigo-800", icon: <Crown className="w-4 h-4" /> },
      enterprise: { name: "Enterprise", color: "bg-yellow-100 text-yellow-800", icon: <Crown className="w-4 h-4" /> },
    };

    const tier = tierConfig[subscriptionTier] || tierConfig.free;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tier.color} font-semibold`}>
        {tier.icon}
        {tier.name}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Global Header */}
      <GlobalHeader
        currentUserEmail={currentUserEmail}
        displayName={displayName}
        isGuestMode={isGuestMode}
        userPoints={userStats.points}
        subscriptionTier={subscriptionTier}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/app")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Cards</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {displayName ? displayName.charAt(0).toUpperCase() : currentUserEmail.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter your name"
                      className="max-w-xs"
                    />
                    <button
                      onClick={handleSaveName}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {displayName || "User"}
                    </h2>
                    <button
                      onClick={() => {
                        setTempName(displayName);
                        setEditingName(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{currentUserEmail}</span>
                </div>
                {getTierBadge()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button
                onClick={() => navigate("/subscription")}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full md:w-auto text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Cards */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Cards</p>
                <p className="text-3xl font-bold text-blue-900">{userStats.totalCards}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Grid3x3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Cards Earned */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Cards Earned</p>
                <p className="text-3xl font-bold text-blue-900">{userStats.cardsEarned}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Likes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Likes</p>
                <p className="text-3xl font-bold text-blue-900">{userStats.totalLikes}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          {/* Points */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Points Earned</p>
                <p className="text-3xl font-bold text-blue-900">{userStats.points}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* My Cards Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">My nAnoCards</h3>
            <Button
              onClick={() => navigate("/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New
            </Button>
          </div>

          {userCards.length === 0 ? (
            <div className="text-center py-12">
              <Grid3x3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't created any cards yet</p>
              <Button
                onClick={() => navigate("/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Card
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCards.map((card: any) => {
                const isOwner = card.createdBy === currentUserEmail;
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
                    qrCodeUrl={card.qrCodeUrl}
                    onEdit={isOwner ? () => navigate(`/edit/${card.id}`) : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates about your cards</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">Get the latest news and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Show Points Badge</p>
                <p className="text-sm text-gray-600">Display your points in the app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}