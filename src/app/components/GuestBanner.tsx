import { AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useEffect } from "react";

interface GuestBannerProps {
  visitsRemaining: number;
  onDismiss: () => void;
}

/**
 * Banner component for guest mode users
 */
export function GuestBanner({ visitsRemaining, onDismiss }: GuestBannerProps) {
  const navigate = useNavigate();

  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            <strong>Welcome Guest!</strong>{" "}
            <button
              onClick={() => navigate("/login")}
              className="underline font-semibold hover:text-blue-700"
            >
              Sign up for unlimited access!
            </button>
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-blue-600 hover:text-blue-800"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}