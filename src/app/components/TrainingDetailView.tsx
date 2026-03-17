import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2, Play, CheckCircle, Lock } from 'lucide-react';
import { supabase, API_BASE_URL, getAuthHeaders } from '../../lib/supabase';
import { toast } from 'sonner';

/**
 * TrainingDetailView - Deep link handler for training QR code scans
 * 
 * When someone scans a training module QR code, they land here.
 * URL format: /training/:moduleId
 */

interface TrainingModule {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  videoTime?: string;
  information?: string;
  isPremium: boolean;
  courseTitle?: string;
}

export function TrainingDetailView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    loadUserSession();
    loadModule();
  }, [moduleId]);

  const loadUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUserEmail(session.user.email || null);
      setIsGuestMode(false);
      
      // Load subscription tier
      const tier = localStorage.getItem(`subscription_${session.user.email}`) || 'free';
      setSubscriptionTier(tier);
    } else {
      setIsGuestMode(true);
    }
  };

  const loadModule = async () => {
    if (!moduleId) return;
    
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/training/modules/${moduleId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setModule(data.module);
        
        // Check access
        const isPremium = data.module?.isPremium || false;
        const canAccess = !isPremium || subscriptionTier === 'premium' || subscriptionTier === 'enterprise';
        setHasAccess(canAccess);
      } else {
        toast.error('Training module not found');
        navigate('/training');
      }
    } catch (error) {
      console.error('Error loading training module:', error);
      toast.error('Failed to load training module');
      navigate('/training');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTraining = () => {
    if (!module) return;
    
    if (!hasAccess) {
      toast.error('Premium subscription required', {
        description: 'Upgrade to access premium training modules',
        duration: 4000
      });
      navigate('/subscription');
      return;
    }

    // Navigate to full training screen
    navigate('/training');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading training module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Training module not found</p>
          <button
            onClick={() => navigate('/training')}
            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Go to Training
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/training')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Training</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">nA</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Training Center</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Module Title */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {module.title}
            </h2>
            {module.isPremium && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold flex-shrink-0">
                {hasAccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Premium</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Premium</span>
                  </>
                )}
              </div>
            )}
          </div>

          {module.courseTitle && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Course:</span> {module.courseTitle}
            </div>
          )}

          {module.videoTime && (
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">Duration:</span> {module.videoTime}
            </div>
          )}

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {module.content}
          </p>
        </div>

        {/* Video Preview */}
        {module.videoUrl && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src={`${module.videoUrl}#t=0.1`}
                preload="metadata"
                muted
                playsInline
              />
              {!hasAccess && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-16 h-16 mx-auto mb-3" />
                    <p className="font-bold text-lg">Premium Content</p>
                    <p className="text-sm mt-1">Upgrade to unlock</p>
                  </div>
                </div>
              )}
              {hasAccess && (
                <button className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-20 h-20 bg-blue-900/90 group-hover:bg-blue-800 rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {module.information && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-blue-900 mb-2 text-sm">Learning Objectives</h3>
            <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
              {module.information}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {hasAccess ? (
            <button
              onClick={handleStartTraining}
              className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Start Training Module
            </button>
          ) : (
            <button
              onClick={() => navigate('/subscription')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-5 h-5" />
              Upgrade to Premium
            </button>
          )}

          <button
            onClick={() => navigate('/training')}
            className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl font-medium transition-colors"
          >
            Browse All Training Modules
          </button>
        </div>

        {/* Call to Action for Non-Users */}
        {isGuestMode && (
          <div className="mt-6 bg-white border-2 border-blue-200 rounded-xl p-6 text-center">
            <h3 className="font-bold text-blue-900 mb-2">Create Your Free Account</h3>
            <p className="text-gray-700 text-sm mb-4">
              Sign up to access training modules and track your progress!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Get Started Free
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
