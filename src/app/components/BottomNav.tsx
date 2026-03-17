import { Home, BookOpen, Star, User, Plus, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

interface BottomNavProps {
  onCreateClick: () => void;
  currentUserEmail: string;
}

/**
 * Bottom navigation bar for mobile
 */
export function BottomNav({ onCreateClick, currentUserEmail }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex items-center justify-around py-2">
        <button
          onClick={() => navigate("/app")}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive("/app") ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>

        <button
          onClick={() => navigate("/training")}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive("/training") ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-xs">Training</span>
        </button>

        {currentUserEmail && (
          <button
            onClick={onCreateClick}
            className="flex flex-col items-center gap-1 px-3 py-2 -mt-6 bg-blue-600 text-white rounded-full shadow-lg"
          >
            <Plus className="w-8 h-8" />
          </button>
        )}

        <button
          onClick={() => navigate("/subscription")}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive("/subscription") ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <Star className="w-6 h-6" />
          <span className="text-xs">Premium</span>
        </button>

        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive("/profile") ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
}