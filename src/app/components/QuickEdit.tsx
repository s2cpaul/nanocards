import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { API_BASE_URL, getAuthHeaders, supabase } from "../../lib/supabase";
import { NanoCard } from "../types";
import { HamburgerMenu } from "./HamburgerMenu";

export function QuickEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<NanoCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [title, setTitle] = useState("");
  const [videoTime, setVideoTime] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [country, setCountry] = useState("");
  const [stage, setStage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [insights, setInsights] = useState({
    linkedin: "",
    discord: "",
    youtube: "",
    github: "",
  });

  // Load user's cards on mount
  useEffect(() => {
    const loadUserCards = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          setIsGuestMode(true);
          setLoading(false);
          toast.error('Please login to edit cards');
          return;
        }

        setCurrentUserEmail(session.user.email);
        setIsGuestMode(false);

        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/cards`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          // Filter to only show user's own cards (exclude protected card #000)
          const userCards = data.cards.filter((card: NanoCard) => 
            card.createdBy === session.user.email && card.id !== "000"
          );
          setCards(userCards);
        }
        
        // Get user points
        const pointsResponse = await fetch(`${API_BASE_URL}/subscription/status`, {
          headers,
        });
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          setUserPoints(pointsData.points || 0);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
        toast.error('Failed to load your cards');
      } finally {
        setLoading(false);
      }
    };

    loadUserCards();
  }, []);

  const handleLogout = async () => {
    if (isGuestMode) {
      localStorage.removeItem('guestMode');
      navigate('/');
    } else {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  // When a card is selected, populate the form
  const handleCardSelect = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setSelectedCardId(cardId);
      setTitle(card.title);
      setVideoTime(card.videoTime);
      setVideoUrl(card.videoUrl || "");
      setCountry(card.country || "");
      setStage(card.stage || "");
      setInsights({
        linkedin: card.insights?.linkedin || "",
        discord: card.insights?.discord || "",
        youtube: card.insights?.youtube || "",
        github: card.insights?.github || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCardId) {
      toast.error('Please select a card to edit');
      return;
    }

    if (isGuestMode) {
      toast.error('Please login to edit cards');
      navigate('/login');
      return;
    }

    // Double-check session before making API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error('Your session has expired', {
        description: 'Please log in again to edit cards',
      });
      navigate('/login');
      return;
    }

    // Validate video time is 120 seconds (2 minutes) or less
    const timeParts = videoTime.split(':').map(part => parseInt(part, 10));
    let totalSeconds = 0;
    
    if (timeParts.length === 2) {
      totalSeconds = timeParts[0] * 60 + timeParts[1];
    } else if (timeParts.length === 3) {
      totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else {
      toast.error('Invalid video time format', {
        description: 'Please use mm:ss format (e.g., 2:00)',
        duration: 4000,
      });
      return;
    }

    if (totalSeconds > 120) {
      toast.error('Video time exceeds limit', {
        description: 'Videos must be 2 minutes (2:00) or less',
        duration: 4000,
      });
      return;
    }
    
    setSubmitting(true);

    try {
      const headers = await getAuthHeaders();
      
      console.log('[QuickEdit] Updating card:', selectedCardId);
      console.log('[QuickEdit] Current user:', currentUserEmail);
      
      // Filter out empty insights
      const filteredInsights = Object.fromEntries(
        Object.entries(insights).filter(([_, value]) => value !== '')
      );

      const response = await fetch(`${API_BASE_URL}/cards/${selectedCardId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title,
          videoTime,
          videoUrl,
          country,
          stage,
          insights: filteredInsights,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Card updated successfully!');
        navigate('/app');
      } else {
        console.error('[QuickEdit] Failed to update card:', data.error);
        
        // Provide helpful error messages
        if (response.status === 401) {
          toast.error('Authentication failed', {
            description: 'Please log in again to edit your cards',
          });
          navigate('/login');
        } else if (response.status === 403) {
          toast.error('Permission denied', {
            description: 'You can only edit your own cards',
          });
        } else {
          toast.error(data.error || 'Failed to update card');
        }
      }
    } catch (error) {
      console.error('[QuickEdit] Error updating card:', error);
      toast.error('Failed to update card', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCardId) {
      toast.error('Please select a card to delete');
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete this card?\n\nTitle: ${title}\nID: ${selectedCardId}\n\nThis action cannot be undone.`)) {
      return;
    }

    setSubmitting(true);

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/cards/${selectedCardId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Card deleted successfully!');
        // Remove card from local state
        setCards(cards.filter(c => c.id !== selectedCardId));
        // Clear form
        setSelectedCardId('');
        setTitle('');
        setVideoTime('');
        setVideoUrl('');
        setCountry('');
        setStage('');
        setInsights({
          linkedin: '',
          discord: '',
          youtube: '',
          github: '',
        });
      } else {
        console.error('[QuickEdit] Failed to delete card:', data.error);
        
        if (response.status === 401) {
          toast.error('Authentication failed', {
            description: 'Please log in again',
          });
          navigate('/login');
        } else if (response.status === 403) {
          toast.error('Permission denied', {
            description: 'You can only delete your own cards',
          });
        } else {
          toast.error(data.error || 'Failed to delete card');
        }
      }
    } catch (error) {
      console.error('[QuickEdit] Error deleting card:', error);
      toast.error('Failed to delete card', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your cards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Quick Edit</h1>
          </div>
          <HamburgerMenu
            currentUserEmail={currentUserEmail}
            isGuestMode={isGuestMode}
            userPoints={userPoints}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {cards.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Edit2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No Cards to Edit
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't created any cards yet.
            </p>
            <Button
              onClick={() => navigate('/create')}
              className="bg-[#1e3a8a] hover:bg-blue-800 text-white"
            >
              Create Your First Card
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Selector */}
            <div>
              <Label htmlFor="cardSelect" className="text-gray-900 font-medium">
                Select Card to Edit *
              </Label>
              <Select
                value={selectedCardId}
                onValueChange={handleCardSelect}
              >
                <SelectTrigger className="w-full mt-2 bg-white">
                  <SelectValue placeholder="Choose a card" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.title} (ID: {card.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Only show form if a card is selected */}
            {selectedCardId && (
              <>
                {/* Card Title */}
                <div>
                  <Label htmlFor="title" className="text-gray-900 font-medium">
                    Card Title * (max 60 characters)
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                    placeholder="Enter card title"
                    required
                    className="mt-2 bg-gray-50"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {title.length}/60 characters
                  </p>
                </div>

                {/* Video Time */}
                <div>
                  <Label htmlFor="videoTime" className="text-gray-900 font-medium">
                    Video Time * (max 2 minutes)
                  </Label>
                  <Input
                    id="videoTime"
                    value={videoTime}
                    onChange={(e) => setVideoTime(e.target.value)}
                    placeholder="1:59 or 2:00 (mm:ss)"
                    required
                    className="mt-2 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Videos must be 2 minutes (120 seconds) or less
                  </p>
                </div>

                {/* Video URL */}
                <div>
                  <Label htmlFor="videoUrl" className="text-gray-900 font-medium">
                    Video URL *
                  </Label>
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    required
                    className="mt-2 bg-gray-50"
                  />
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="country" className="text-gray-900 font-medium">
                    Country
                  </Label>
                  <Select
                    value={country}
                    onValueChange={(value) => setCountry(value)}
                  >
                    <SelectTrigger className="w-full mt-2 bg-gray-50">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="es">Spain</SelectItem>
                      <SelectItem value="it">Italy</SelectItem>
                      <SelectItem value="nl">Netherlands</SelectItem>
                      <SelectItem value="se">Sweden</SelectItem>
                      <SelectItem value="no">Norway</SelectItem>
                      <SelectItem value="dk">Denmark</SelectItem>
                      <SelectItem value="fi">Finland</SelectItem>
                      <SelectItem value="ch">Switzerland</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stage */}
                <div>
                  <Label htmlFor="stage" className="text-gray-900 font-medium">
                    Stage (Optional)
                  </Label>
                  <Select
                    value={stage}
                    onValueChange={(value) => setStage(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="validation">Validation</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="execution">Execution</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="reinvention">Reinvention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* LinkedIn */}
                <div>
                  <Label htmlFor="linkedin" className="text-gray-900 font-medium">
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={insights.linkedin}
                    onChange={(e) => setInsights({ ...insights, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/..."
                    type="url"
                    className="mt-2 bg-gray-50"
                  />
                </div>

                {/* Discord */}
                <div>
                  <Label htmlFor="discord" className="text-gray-900 font-medium">
                    Discord
                  </Label>
                  <Input
                    id="discord"
                    value={insights.discord}
                    onChange={(e) => setInsights({ ...insights, discord: e.target.value })}
                    placeholder="https://discord.gg/..."
                    type="url"
                    className="mt-2 bg-gray-50"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <Label htmlFor="youtube" className="text-gray-900 font-medium">
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={insights.youtube}
                    onChange={(e) => setInsights({ ...insights, youtube: e.target.value })}
                    placeholder="https://youtube.com/..."
                    type="url"
                    className="mt-2 bg-gray-50"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <Label htmlFor="github" className="text-gray-900 font-medium">
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    value={insights.github}
                    onChange={(e) => setInsights({ ...insights, github: e.target.value })}
                    placeholder="https://github.com/..."
                    type="url"
                    className="mt-2 bg-gray-50"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-[#1e3a8a] hover:bg-blue-800 text-white font-semibold rounded-xl"
                  >
                    {submitting ? 'Updating...' : 'Update nAnoCard'}
                  </Button>
                </div>

                {/* Delete Button */}
                <div className="pt-2">
                  <Button
                    type="button"
                    disabled={submitting}
                    className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl"
                    onClick={handleDeleteCard}
                  >
                    {submitting ? 'Deleting...' : 'Delete nAnoCard'}
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </div>

      {/* Help Button - Bottom Right */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-50"
        onClick={() => navigate('/instructions')}
      >
        <span className="text-xl font-semibold">?</span>
      </button>
    </div>
  );
}