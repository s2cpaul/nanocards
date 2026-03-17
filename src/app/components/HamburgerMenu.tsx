import { useState } from "react";
import { useNavigate } from "react-router";
import {
  X,
  Menu,
  HelpCircle,
  TrendingUp,
  Info,
  BookOpen,
  Settings as SettingsIcon,
  Star,
  Smartphone,
  LogIn,
  LogOut,
  Plus,
} from "lucide-react";

interface HamburgerMenuProps {
  currentUserEmail: string | null;
  isGuestMode: boolean;
  userPoints?: number;
  userTier?: string;
  onLogout?: () => void;
}

/**
 * Hamburger menu - clean line icons, no colors, no emojis
 */
export function HamburgerMenu({ currentUserEmail, isGuestMode, userPoints = 0, userTier = "Free", onLogout }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    setIsOpen(false);
  };

  const menuItems = [
    { icon: HelpCircle, label: "How It Works", path: "/instructions" },
    { icon: TrendingUp, label: "Top nAnoCards", path: "/top-cards" },
    { icon: Info, label: "About Platform", path: "/about-platform" },
    { icon: BookOpen, label: "Learning & Development", path: "/training" },
    { icon: Plus, label: "Add Content", path: "/add-content" },
    { icon: Star, label: "Premium Plans", path: "/subscription" },
    { icon: Smartphone, label: "Demo", path: "/demo" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-14 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 w-72 overflow-hidden">
            {/* Guest Mode */}
            {isGuestMode && (
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-3">Guest Mode</p>
                <button
                  onClick={() => handleNavigate("/login")}
                  className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4" strokeWidth={1.5} />
                  Log In
                </button>
              </div>
            )}

            {/* Menu Items */}
            <nav className="py-1">
              {menuItems.map(({ icon: Icon, label, path }) => (
                <button
                  key={path}
                  onClick={() => handleNavigate(path)}
                  className="w-full px-6 py-3.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                >
                  <Icon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                  <span className="text-sm text-gray-900">{label}</span>
                </button>
              ))}

              {/* Settings */}
              {!isGuestMode && currentUserEmail && (
                <button
                  onClick={() => handleNavigate("/settings")}
                  className="w-full px-6 py-3.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left border-t border-gray-100"
                >
                  <SettingsIcon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                  <span className="text-sm text-gray-900">Settings</span>
                </button>
              )}

              {/* Logout */}
              {!isGuestMode && currentUserEmail && (
                <button
                  onClick={handleLogoutClick}
                  className="w-full px-6 py-3.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                >
                  <LogOut className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                  <span className="text-sm text-gray-900">Log Out</span>
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
