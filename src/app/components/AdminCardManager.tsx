import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Trash2, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { supabase, API_BASE_URL, getAuthHeaders } from "@/supabase";
import { NanoCard } from "../types";
import { InitFeaturedCard } from "./InitFeaturedCard";

/**
 * AdminCardManager - Owner-only page to manage and delete cards
 * Only accessible by carapaulson1@gmail.com
 */

export function AdminCardManager() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<NanoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email || session.user.email !== "carapaulson1@gmail.com") {
        toast.error("Access denied - Owner only");
        navigate("/");
        return;
      }

      setCurrentUserEmail(session.user.email);
      loadCards();
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/");
    }
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const cardsArray = data.cards || [];
        
        // Sort by createdAt to show in order
        const sorted = cardsArray.sort((a: NanoCard, b: NanoCard) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        setCards(sorted);
      } else {
        toast.error("Failed to load cards");
      }
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm(`Are you sure you want to delete card ${cardId}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(cardId);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        toast.success(`Card ${cardId} deleted successfully`);
        // Remove from local state
        setCards(cards.filter(card => card.id !== cardId));
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete card");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to delete card");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate("/main-app")}
              className="flex items-center gap-2 text-blue-900 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to App</span>
            </button>
            <Button
              onClick={loadCards}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Card Manager</h1>
          <p className="text-sm text-gray-600 mt-1">
            Owner-only page to manage all nAnoCards
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading cards...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Initialize Featured Card Button */}
            <InitFeaturedCard />

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-900 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900">Total Cards: {cards.length}</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Delete cards carefully - this action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Cards List */}
            {cards.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-medium">No cards found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-bold text-blue-900">
                            #{String(index + 1).padStart(3, '0')}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            ID: {card.id}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                          {card.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>❤️ {card.likes}</span>
                          <span>📅 {new Date(card.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          By: {card.createdBy}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleDelete(card.id)}
                        disabled={deleting === card.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        {deleting === card.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}