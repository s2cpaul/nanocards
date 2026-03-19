import { useState } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/supabase";
import { toast } from "sonner";
import { Trash2, RefreshCw } from "lucide-react";

/**
 * Admin utility to initialize database with ONE featured card #000
 * This deletes ALL cards and creates the single nAnoCards featured card
 */
export function InitFeaturedCard() {
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = async () => {
    if (!confirm("⚠️ WARNING: This will DELETE ALL CARDS and create only the featured card #000. Are you sure?")) {
      return;
    }

    setIsInitializing(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/init-featured-card`, {
        method: "POST",
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Database initialized! Featured card #000 created. All other cards deleted.");
        console.log("Initialization successful:", data);
        
        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.error || "Failed to initialize database");
        console.error("Initialization failed:", data);
      }
    } catch (error) {
      console.error("Error during initialization:", error);
      toast.error("Failed to initialize database");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Initialize Featured Card #000
          </h3>
          <p className="text-sm text-red-800 mb-4">
            This will <strong>DELETE ALL CARDS</strong> from the database and create a single featured card:
          </p>
          <ul className="text-sm text-red-800 mb-4 space-y-1">
            <li>• Card #000</li>
            <li>• Title: "nAnoCards: Edge Micro Learning"</li>
            <li>• Visible to ALL users in ALL views</li>
            <li>• Cannot be deleted by regular users</li>
          </ul>
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Initialize Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
