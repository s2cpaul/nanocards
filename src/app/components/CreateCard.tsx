import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { API_BASE_URL, getAuthHeaders, supabase } from "@/supabase";
import { STAGES } from "../constants/stages";
import { HamburgerMenu } from "./HamburgerMenu";

// Create a new nAnoCard with video, objectives, and metadata
export function CreateCard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoTime, setVideoTime] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [preallocatedId, setPreallocatedId] = useState<string | null>(null);
  const [stage, setStage] = useState("");
  const [categories, setCategories] = useState<string[]>(["Business"]);
  const [courseTitle, setCourseTitle] = useState("");
  const [existingCourseTitles, setExistingCourseTitles] = useState<string[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userTier, setUserTier] = useState("Free");
  const [insights, setInsights] = useState({
    information: "",
    whitePaper: "",
    officialSite: "",
    linkedin: "",
    discord: "",
    notion: "",
    youtube: "",
    github: "",
    link: "",
    twitter: "",
    facebook: "",
    instagram: "",
    email: "",
  });
  const [enableInteractive, setEnableInteractive] = useState(false);
  const [interactiveType, setInteractiveType] = useState<'quiz' | 'survey' | 'dragdrop'>('quiz');
  const [interactiveQuestion, setInteractiveQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [dragItems, setDragItems] = useState(["", "", ""]);
  const [dropZones, setDropZones] = useState(["", "", ""]);
  const [allowTextResponse, setAllowTextResponse] = useState(false);
  const [textLines, setTextLines] = useState<string[]>([""]);

  useEffect(() => {
    const checkAuth = async () => {
      // Check actual Supabase session FIRST
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is logged in - NOT guest mode
        setIsGuestMode(false);
        setCurrentUserEmail(session.user.email || '');
        
        // Clear any stale guestMode flag
        localStorage.removeItem('guestMode');
        
        try {
          const headers = await getAuthHeaders();
          const response = await fetch(`${API_BASE_URL}/subscription/status`, { headers });
          if (response.ok) {
            const data = await response.json();
            setUserPoints(data.points || 0);
            setUserTier(data.tier || 'Free');
          }
        } catch (error) {
          console.error('Error fetching user points:', error);
        }

        // Reserve a sequential immutable card id for this user when opening the create form
        try {
          const headers2 = await getAuthHeaders();
          const res = await fetch(`${API_BASE_URL}/cards/next`, { method: 'POST', headers: headers2 });
          if (res.ok) {
            const json = await res.json();
            if (json?.id) setPreallocatedId(json.id);
          } else {
            console.warn('Failed to reserve card id');
          }
        } catch (err) {
          console.error('Error reserving card id:', err);
        }
      } else {
        // No session - check if guest mode
        const guestMode = localStorage.getItem('guestMode') === 'true';
        setIsGuestMode(guestMode);
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (categories.includes('Training')) {
      loadExistingCourseTitles();
    }
  }, [categories]);

  const loadExistingCourseTitles = async () => {
    try {
      setLoadingCourses(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoadingCourses(false);
        return;
      }
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/courses/titles`, { headers });
      const data = await response.json();
      if (response.ok) {
        setExistingCourseTitles(data.courseTitles || []);
      }
    } catch (error) {
      console.error('Error loading course titles:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  const handleCategoryToggle = (category: string) => {
    if (category === 'Business' && categories.includes('Business')) {
      toast.error('Business category is required and cannot be removed');
      return;
    }

    const isPremium = userTier === 'pro' || userTier === 'enterprise' ||
                      userTier === 'Pro' || userTier === 'Enterprise';
    const isOwner = currentUserEmail === 'carapaulson1@gmail.com';
    
    if ((category === 'Training' || category === 'Customer Service') && !isPremium && !isOwner) {
      toast.error(`Upgrade to Pro or Enterprise to use ${category} category`, {
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/subscription'),
        },
      });
      return;
    }

    setCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else if (prev.length < 3) {
        return [...prev, category];
      } else {
        toast.error('Maximum 3 categories allowed');
        return prev;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuestMode) {
      toast.error('Please login to create cards');
      return;
    }

    if (categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    // Validate video time (max 2 minutes)
    const timeParts = videoTime.split(':').map(part => parseInt(part, 10));
    let totalSeconds = 0;
    if (timeParts.length === 2) {
      totalSeconds = timeParts[0] * 60 + timeParts[1];
    } else if (timeParts.length === 3) {
      totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else {
      toast.error('Invalid video time format. Use mm:ss');
      return;
    }

    if (totalSeconds > 120) {
      toast.error('Videos must be 2 minutes (2:00) or less');
      return;
    }

    setSubmitting(true);

    try {
      const headers = await getAuthHeaders();
      const filteredInsights = Object.fromEntries(
        Object.entries(insights).filter(([_, value]) => value !== '')
      );

      const response = await fetch(`${API_BASE_URL}/cards`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          objective,
          thumbnail,
          videoTime,
          videoUrl,
          stage,
          categories,
          courseTitle,
          appOrigin: window.location.origin,
          preallocatedId: preallocatedId || undefined,
           insights: filteredInsights,
           interactive: enableInteractive ? {
             type: interactiveType,
             question: interactiveQuestion,
             textLines: textLines.filter(line => line.trim() !== ''),
             options: interactiveType === 'quiz' || interactiveType === 'survey' ? options.filter(o => o.trim() !== '') : undefined,
             correctAnswer: interactiveType === 'quiz' ? correctAnswer : undefined,
             dragItems: interactiveType === 'dragdrop' ? dragItems.filter(i => i.trim() !== '') : undefined,
             dropZones: interactiveType === 'dragdrop' ? dropZones.filter(z => z.trim() !== '') : undefined,
             allowTextResponse: interactiveType === 'survey' ? allowTextResponse : undefined,
           } : undefined,
         }),
       });

      const data = await response.json();

      if (response.ok) {
        toast.success('Card created successfully');
        navigate('/app');
      } else {
        if (response.status === 403 && data.tier) {
          toast.error('Card limit reached', {
            description: data.error,
            duration: 8000,
            action: {
              label: 'Upgrade',
              onClick: () => navigate('/subscription'),
            },
          });
        } else {
          toast.error(data.error || 'Failed to create card');
        }
      }
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    } finally {
      setSubmitting(false);
    }
  };

  const allCategories = ['Business', 'Training', 'Personal', 'nAno Academy'];
  const isOwner = currentUserEmail === 'carapaulson1@gmail.com';
  const isPremiumTier = userTier === 'pro' || userTier === 'enterprise' ||
                        userTier === 'Pro' || userTier === 'Enterprise';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Create nAnoCard</h1>
          </div>
          <HamburgerMenu
            currentUserEmail={currentUserEmail}
            isGuestMode={isGuestMode}
            userPoints={userPoints}
            userTier={userTier}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
              Card Title * (40 characters max)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 40))}
              placeholder="Enter card title"
              required
              className="mt-1 bg-white border-gray-300"
              maxLength={40}
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/40 characters</p>
          </div>

          {/* Immutable Card ID (reserved on form open) */}
          <div>
            <Label className="text-sm font-semibold text-gray-900">Card ID</Label>
            <input
              type="text"
              value={preallocatedId ?? ''}
              readOnly
              disabled
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">This card number is reserved and cannot be changed.</p>
          </div>

          {/* Objective */}
          <div>
            <Label htmlFor="objective" className="text-sm font-semibold text-gray-900">
              Objective * (256 characters max)
            </Label>
            <Input
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value.slice(0, 256))}
              placeholder="Enter card objective"
              required
              className="mt-1 bg-white border-gray-300"
              maxLength={256}
            />
            <p className="text-xs text-gray-400 mt-1">{objective.length}/256 characters</p>
          </div>

          {/* Thumbnail */}
          <div>
            <Label htmlFor="thumbnail" className="text-sm font-semibold text-gray-900">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
              type="url"
              className="mt-1 bg-white border-gray-300"
            />
          </div>

          {/* Video Time */}
          <div>
            <Label htmlFor="videoTime" className="text-sm font-semibold text-gray-900">
              Video Time * (max 2 minutes)
            </Label>
            <Input
              id="videoTime"
              value={videoTime}
              onChange={(e) => setVideoTime(e.target.value)}
              placeholder="1:59 or 2:00 (mm:ss)"
              required
              className="mt-1 bg-white border-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">Videos must be 2 minutes (120 seconds) or less</p>
          </div>

          {/* Video URL */}
          <div>
            <Label htmlFor="videoUrl" className="text-sm font-semibold text-gray-900">Video URL *</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              type="url"
              required
              className="mt-1 bg-white border-gray-300"
            />
          </div>

          {/* Stage */}
          <div>
            <Label htmlFor="stage" className="text-sm font-semibold text-gray-900">Stage (Optional)</Label>
            <Select value={stage} onValueChange={(value) => setStage(value)}>
              <SelectTrigger className="w-full mt-1 bg-white border-gray-300">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-sm font-semibold text-gray-900">Categories * (Select 1-3)</Label>
            <div className="mt-2 space-y-3">
              {allCategories.map((cat) => {
                const isLocked = (cat === 'Training' || cat === 'Customer Service') && !isPremiumTier && !isOwner;
                const isOwnerOnly = cat === 'nAno Academy' && !isOwner;

                if (cat === 'nAno Academy' && !isOwner) return null;

                return (
                  <div key={cat} className="flex items-center space-x-3">
                    <Checkbox
                      id={`category-${cat}`}
                      checked={categories.includes(cat)}
                      onCheckedChange={() => handleCategoryToggle(cat)}
                      disabled={isLocked || isOwnerOnly}
                      className={`border-gray-300 ${(isLocked || isOwnerOnly) ? 'opacity-50' : ''}`}
                    />
                    <label
                      htmlFor={`category-${cat}`}
                      className={`text-sm font-medium cursor-pointer flex-1 ${
                        (isLocked || isOwnerOnly) ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {cat}
                      {cat === 'Business' && (
                        <span className="ml-2 text-xs text-[#1e3a8a]">(Required)</span>
                      )}
                      {cat === 'nAno Academy' && isOwner && (
                        <span className="ml-2 text-xs text-gray-500">(Owner only)</span>
                      )}
                      {isLocked && (
                        <span className="ml-2 text-xs text-gray-500">(Pro/Enterprise only)</span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {categories.length > 0 ? `${categories.length} selected` : 'Please select at least 1 category'}
            </p>
          </div>

          {/* Course Title (Training) */}
          {categories.includes('Training') && (
            <div>
              <Label htmlFor="courseTitle" className="text-sm font-semibold text-gray-900">Course Title</Label>
              {existingCourseTitles.length > 0 ? (
                <div className="space-y-2">
                  <Select value={courseTitle} onValueChange={(value) => setCourseTitle(value)}>
                    <SelectTrigger className="w-full mt-1 bg-white border-gray-300">
                      <SelectValue placeholder="Select existing course or type new" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingCourseTitles.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">Or type a new course title below:</p>
                  <Input
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Enter new course title"
                    className="bg-white border-gray-300"
                  />
                </div>
              ) : (
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Enter course title"
                  className="mt-1 bg-white border-gray-300"
                />
              )}
              {loadingCourses && <p className="text-xs text-gray-400 mt-1">Loading existing courses...</p>}
            </div>
          )}

          {/* Information */}
          <div>
            <Label htmlFor="information" className="text-sm font-semibold text-gray-900">
              Information (info icon tooltip)
            </Label>
            <Textarea
              id="information"
              value={insights.information}
              onChange={(e) => setInsights({ ...insights, information: e.target.value })}
              placeholder="Text that appears when users hover the info icon..."
              className="mt-1 bg-white border-gray-300 min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Social Links */}
          {[
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
            { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/...' },
            { key: 'notion', label: 'Notion', placeholder: 'https://notion.so/...' },
            { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
            { key: 'github', label: 'GitHub', placeholder: 'https://github.com/...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <Label htmlFor={key} className="text-sm font-semibold text-gray-900">{label}</Label>
              <Input
                id={key}
                value={(insights as any)[key]}
                onChange={(e) => setInsights({ ...insights, [key]: e.target.value })}
                placeholder={placeholder}
                type="url"
                className="mt-1 bg-white border-gray-300"
              />
            </div>
          ))}

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-[#1e3a8a] hover:bg-blue-800 text-white font-semibold rounded-xl"
            >
              {submitting ? 'Creating...' : 'Create nAnoCard'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}