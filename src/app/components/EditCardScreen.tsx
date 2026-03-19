import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import { NanoCard } from "../types";
import { supabase, API_BASE_URL, getAuthHeaders } from "@/supabase";
import { toast } from "sonner";

/**
 * EditCardScreen - Edit or create a nanocard
 * Can be used to:
 * - Edit existing card (pass cardId in query params)
 * - Create new card (no cardId)
 */
export function EditCardScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get("cardId");

  const [isLoading, setIsLoading] = useState(!!cardId); // Load if editing
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [formData, setFormData] = useState<Partial<NanoCard>>({
    title: "",
    videoUrl: "",
    videoTime: "",
    information: "",
    likes: 0,
    createdBy: "",
    createdAt: new Date().toISOString(),
    visibility: "public",
    isPublic: true,
    insights: {},
    qrCodeUrl: "",
    globalCardNumber: "",
  });

  useEffect(() => {
    checkAuth();
    if (cardId) loadCard();
  }, [cardId]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        toast.error("You must be logged in to edit cards");
        navigate("/");
        return;
      }
      setCurrentUserEmail(session.user.email);
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    }
  };

  const loadCard = async () => {
    try {
      setIsLoading(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(data.card);
      } else {
        toast.error("Failed to load card");
        navigate("/app/top-cards");
      }
    } catch (error) {
      console.error("Error loading card:", error);
      toast.error("Error loading card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title?.trim()) {
      toast.error("Card title is required");
      return;
    }
    if (!formData.videoUrl?.trim()) {
      toast.error("Video URL is required");
      return;
    }
    if (!formData.videoTime?.trim()) {
      toast.error("Video duration is required");
      return;
    }

    setIsSaving(true);
    try {
      const headers = await getAuthHeaders();
      const cardData = {
        ...formData,
        createdBy: currentUserEmail,
        createdAt: formData.createdAt || new Date().toISOString(),
      };

      let response;
      if (cardId) {
        // Update existing card
        response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(cardData),
        });
      } else {
        // Create new card
        response = await fetch(`${API_BASE_URL}/cards`, {
          method: "POST",
          headers,
          body: JSON.stringify(cardData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        toast.success(cardId ? "Card updated successfully" : "Card created successfully");
        
        // Set the new card ID if creating
        if (!cardId && result.card?.id) {
          setFormData({ ...formData, id: result.card.id });
        }
        
        // Redirect back to cards list
        setTimeout(() => navigate("/app/top-cards"), 500);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save card");
      }
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error("Error saving card");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!cardId) {
      toast.error("Cannot delete unsaved card");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this card? This cannot be undone.")) {
      return;
    }

    setIsSaving(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        toast.success("Card deleted successfully");
        setTimeout(() => navigate("/app/top-cards"), 500);
      } else {
        toast.error("Failed to delete card");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Error deleting card");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/app/top-cards")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cards
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {cardId ? "Edit Card" : "Create New Card"}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Card Title (max 40 chars)
            </label>
            <input
              type="text"
              maxLength={40}
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., nAnoCards Overview"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(formData.title || "").length}/40 characters
            </p>
          </div>

          {/* Video URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Video URL
            </label>
            <input
              type="url"
              value={formData.videoUrl || ""}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be a valid video URL (mp4, webm, etc)
            </p>
          </div>

          {/* Video Duration */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Video Duration
            </label>
            <input
              type="text"
              value={formData.videoTime || ""}
              onChange={(e) => setFormData({ ...formData, videoTime: e.target.value })}
              placeholder="e.g., 2:30"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Format: M:SS or MM:SS</p>
          </div>

          {/* Information/Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Card Information
            </label>
            <textarea
              value={formData.information || ""}
              onChange={(e) => setFormData({ ...formData, information: e.target.value })}
              placeholder="Describe what this card is about..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Visibility
            </label>
            <select
              aria-label="Card Visibility"
              value={formData.visibility || "public"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  visibility: e.target.value as "public" | "private",
                  isPublic: e.target.value === "public",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="public">Public (Everyone can see)</option>
              <option value="private">Private (Only you can see)</option>
            </select>
          </div>

          {/* Card Number (display only) */}
          {formData.globalCardNumber && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Card Number: <span className="font-semibold">#{formData.globalCardNumber}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : cardId ? "Update Card" : "Create Card"}
            </button>

            {cardId && (
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
