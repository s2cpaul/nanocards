import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { GlobalHeader } from "./GlobalHeader";
import { supabase, API_BASE_URL, getAuthHeaders } from "@/supabase";
import { User, Mail, Calendar, Heart, FileText, LogOut, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function AccountScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [stats, setStats] = useState({
    cardsCreated: 0,
    totalLikes: 0,
    pointsEarned: 0,
  });

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to view your account");
        navigate("/");
        return;
      }

      const email = session.user.email || "";
      const created = session.user.created_at || "";
      
      setUserEmail(email);
      setCreatedAt(new Date(created).toLocaleDateString());
      
      // Load user profile and stats
      await loadUserProfile(email);
      await loadUserStats(email);
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading account:", error);
      toast.error("Failed to load account information");
      setLoading(false);
    }
  };

  const loadUserProfile = async (email: string) => {
    try {
      const headers = await getAuthHeaders();
      // Use /user/profile endpoint to get subscription tier and display name
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setDisplayName(data.displayName || email.split("@")[0]);
        setSubscriptionTier(data.subscriptionTier || "free");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Use email prefix as fallback
      setDisplayName(email.split("@")[0]);
    }
  };

  const loadUserStats = async (email: string) => {
    try {
      const headers = await getAuthHeaders();
      
      // Get user's cards
      const cardsResponse = await fetch(`${API_BASE_URL}/cards`, { headers });
      if (cardsResponse.ok) {
        const allCards = await cardsResponse.json();
        const userCards = allCards.filter((card: any) => card.createdBy === email);
        const totalLikes = userCards.reduce((sum: number, card: any) => sum + (card.likes || 0), 0);
        
        setStats({
          cardsCreated: userCards.length,
          totalLikes: totalLikes,
          pointsEarned: parseInt(localStorage.getItem("userPoints") || "0"),
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("guestMode");
      localStorage.removeItem("userPoints");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <GlobalHeader title="My Account" showBackButton={true} />

      <div className="px-4 pt-20 pb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-4">
          {/* Avatar Circle */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3">
              <User className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
            
            {/* Subscription Tier Badge */}
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
              <Crown className="w-4 h-4 text-blue-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-blue-700 capitalize">
                {subscriptionTier === "enterprise" ? "Owner (Enterprise)" : `${subscriptionTier} Tier`}
              </span>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <Mail className="w-5 h-5 text-gray-400" strokeWidth={2} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base text-gray-900">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <Calendar className="w-5 h-5 text-gray-400" strokeWidth={2} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-base text-gray-900">{createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" strokeWidth={2} />
            <p className="text-2xl font-bold text-gray-900">{stats.cardsCreated}</p>
            <p className="text-xs text-gray-500">Cards</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" strokeWidth={2} />
            <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
            <p className="text-xs text-gray-500">Likes</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pointsEarned}</p>
            <p className="text-xs text-gray-500">Points</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/profile-setup")}
            className="w-full bg-white text-gray-900 hover:bg-gray-50 h-12 text-base font-medium rounded-xl shadow-sm border border-gray-200"
          >
            <User className="w-5 h-5 mr-2" strokeWidth={2} />
            Edit Profile
          </Button>

          <Button
            onClick={() => navigate("/settings")}
            className="w-full bg-white text-gray-900 hover:bg-gray-50 h-12 text-base font-medium rounded-xl shadow-sm border border-gray-200"
          >
            Settings
          </Button>

          <Button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 h-12 text-base font-medium rounded-xl shadow-sm border border-red-200"
          >
            <LogOut className="w-5 h-5 mr-2" strokeWidth={2} />
            Logout
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/70">
            nAnoCards v1.0
          </p>
          <p className="text-xs text-white/50 mt-1">
            AI product cards for innovators
          </p>
        </div>
      </div>
    </div>
  );
}
