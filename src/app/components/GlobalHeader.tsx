import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User as UserIcon, ShoppingCart } from 'lucide-react';
import { HamburgerMenu } from './HamburgerMenu';
import nAnoLogo from '@/assets/nAnoLogo.png';

interface GlobalHeaderProps {
  currentUserEmail: string;
  displayName?: string;
  isGuestMode: boolean;
  userPoints: number;
  subscriptionTier?: string;
  onLogout: () => void;
}

export function GlobalHeader({
  currentUserEmail,
  displayName,
  isGuestMode,
  userPoints,
  subscriptionTier = 'free',
  onLogout,
}: GlobalHeaderProps) {
  const navigate = useNavigate();
  const [showUserPopup, setShowUserPopup] = useState(false);

  const isOwner = currentUserEmail === 'carapaulson1@gmail.com';

  const getSubscriptionDisplay = () => {
    if (isOwner) return 'Enterprise';
    const labels: Record<string, string> = {
      free: 'Free', student: 'Student', creator: 'Creator',
      pro: 'Pro', enterprise: 'Enterprise',
    };
    return labels[subscriptionTier] || 'Free';
  };

  const getTierColor = () => {
    const colors: Record<string, string> = {
      free: 'bg-gray-500', student: 'bg-gray-600', creator: 'bg-[#1e3a8a]',
      pro: 'bg-gray-800', enterprise: 'bg-gray-900',
    };
    if (isOwner) return 'bg-gray-900';
    return colors[subscriptionTier] || 'bg-gray-500';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Logo & Title */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <img src={nAnoLogo} alt="nAnoCards" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-gray-900">nAnoCards</span>
          </button>

          {/* Right - Icons */}
          <div className="flex items-center gap-1">
            {/* User Icon with Hover Info */}
            <div className="relative">
              <button
                onClick={() => navigate('/profile')}
                onMouseEnter={() => setShowUserPopup(true)}
                onMouseLeave={() => setShowUserPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={displayName ? `Welcome back ${displayName.split(' ')[0]}` : 'My Account'}
              >
                <UserIcon className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
              </button>

              {/* User Info Popup */}
              {showUserPopup && !isGuestMode && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 pointer-events-none">
                  <div className="p-4">
                    {displayName && (
                      <p className="text-sm font-semibold text-gray-900 mb-1">{displayName}</p>
                    )}
                    <p className="text-xs text-gray-500 break-all mb-3">{currentUserEmail}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Tier</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium text-white ${getTierColor()}`}>
                          {getSubscriptionDisplay()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Points</p>
                        <p className="text-sm font-bold text-gray-900">{userPoints}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart / Pricing */}
            <button
              onClick={() => navigate('/subscription')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Plans & Pricing"
            >
              <ShoppingCart className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
            </button>

            {/* Hamburger Menu */}
            <HamburgerMenu
              currentUserEmail={currentUserEmail}
              isGuestMode={isGuestMode}
              userPoints={userPoints}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
