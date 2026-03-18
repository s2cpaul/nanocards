import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Search,
  Crown,
  X,
  Plus,
  BookOpen,
  Edit2,
  Download,
  Info,
  FileText,
  Globe,
  Linkedin,
  MessageCircle,
  Youtube,
  Github,
  Share2,
  Camera,
  Mail,
  Link as LinkIcon,
  Heart,
  Edit3,
  Trash2,
  Save,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders, supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { HamburgerMenu } from "./HamburgerMenu";
import { GlobalHeader } from "./GlobalHeader";
import { QRCodeSVG } from 'qrcode.react';
import { EditCardModal, CardEditData } from "./EditCardModal";
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

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration?: string;
  order: number;
  category: "Applied AI Leadership" | "Customer Service Training" | "nAnoCards Academy";
  createdAt: string;
  createdBy: string;
  isPlaceholder?: boolean;
  information?: string; // Add information field for thought bubble
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

export function TrainingScreen() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [sneakPeekActive, setSneakPeekActive] = useState(true);
  const [showInfoPopup, setShowInfoPopup] = useState<string | null>(null); // Track which card's popup is showing
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All Categories" | "Applied AI Leadership" | "Customer Service Training" | "nAnoCards Academy">("All Categories");
  
  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  
  // Video state - mirror NanoCard behavior
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [showInteractive, setShowInteractive] = useState<string | null>(null);
  
  // Quick edit modal state
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    duration: "",
    category: "Applied AI Leadership" as "Applied AI Leadership" | "Customer Service Training" | "nAnoCards Academy"
  });

  useEffect(() => {
    checkAccess();
    loadModules();
  }, []);

  // 120-second sneak peek timer - show upgrade modal for GUEST MODE users only
  useEffect(() => {
    if (!loading && !hasAccess && isGuestMode) {
      const timer = setTimeout(() => {
        setSneakPeekActive(false);
      }, 120000); // 120 seconds = 2 minutes

      return () => clearTimeout(timer);
    }
  }, [loading, hasAccess, isGuestMode]);

  // Helper function to check if a module is free
  const isModuleFree = (module: TrainingModule) => {
    // First 10 Applied AI Leadership modules are free for everyone
    return module.category === "Applied AI Leadership" && module.order <= 10;
  };

  // Remove the 5-second upgrade modal timer - we don't want this anymore
  // This upgrade modal should NEVER show for carapaulson1@gmail.com

  const checkAccess = async () => {
    // Check if in guest mode
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    if (isGuestMode) {
      setHasAccess(false);
      setIsGuestMode(true);
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || "";
      setCurrentUserEmail(userEmail);

      // Check if user is admin (only carapaulson1@gmail.com)
      const adminEmail = "carapaulson1@gmail.com";
      setIsAdmin(userEmail === adminEmail);

      // carapaulson1@gmail.com always has access - NEVER show premium modal
      if (userEmail === adminEmail) {
        setHasAccess(true);
        setDisplayName("Cara Paulson");
        setSubscriptionTier("enterprise");
        setLoading(false);
        return;
      }

      // Check subscription status for other users
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers,
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('TrainingScreen: Loaded user profile:', data);
        // Training requires paid subscription (Creator or Pro tier)
        const access = data.subscriptionTier === "creator" || data.subscriptionTier === "pro" || data.subscriptionTier === "enterprise";
        setHasAccess(access);
        setUserPoints(data.points || 0);
        setSubscriptionTier(data.subscriptionTier || "free");
        setDisplayName(data.displayName || "");
        console.log('TrainingScreen: Display Name Set To:', data.displayName);
      } else {
        console.warn('User profile fetch returned non-OK status:', response.status);
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking access (network or server issue):', error);
      // Gracefully handle the error - show the page but without access
      setHasAccess(false);
    }
    
    setLoading(false);
  };

  const loadModules = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/training/modules`, {
        headers,
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const apiModules = data.modules || [];
        
        // If no modules from API, add default training module
        if (apiModules.length === 0) {
          const defaultModule: TrainingModule = {
            id: 'training:001',
            title: 'Workforce AI Literacy',
            description: 'Master the fundamentals of AI in the modern workforce',
            content: 'This comprehensive training module covers essential AI literacy skills for today\'s workforce. Learn how to effectively use AI tools, understand AI ethics, and apply AI concepts in professional settings. Watch the video to understand the key principles of AI literacy in the workplace.',
            videoUrl: 'https://lompxaggrcfmmsjkbgyt.supabase.co/storage/v1/object/public/nanocard/WorkforcePromo.mp4',
            duration: '2:30',
            order: 1,
            category: 'Applied AI Leadership',
            createdAt: new Date().toISOString(),
            createdBy: 'carapaulson1@gmail.com',
            information: 'Essential AI literacy training for modern workforce development'
          };
          setModules([defaultModule]);
        } else {
          setModules(apiModules);
        }
      } else {
        console.warn('Training modules fetch returned non-OK status:', response.status);
        // Add default module if API fails
        const defaultModule: TrainingModule = {
          id: 'training:001',
          title: 'Workforce AI Literacy',
          description: 'Master the fundamentals of AI in the modern workforce',
          content: 'This comprehensive training module covers essential AI literacy skills for today\'s workforce. Learn how to effectively use AI tools, understand AI ethics, and apply AI concepts in professional settings. Watch the video to understand the key principles of AI literacy in the workplace.',
          videoUrl: 'https://lompxaggrcfmmsjkbgyt.supabase.co/storage/v1/object/public/nanocard/WorkforcePromo.mp4',
          duration: '2:30',
          order: 1,
          category: 'Applied AI Leadership',
          createdAt: new Date().toISOString(),
          createdBy: 'carapaulson1@gmail.com',
          information: 'Essential AI literacy training for modern workforce development'
        };
        setModules([defaultModule]);
      }
    } catch (error) {
      console.error('Error loading training modules (network or server issue):', error);
      // Add default module if network error
      const defaultModule: TrainingModule = {
        id: 'training:001',
        title: 'Workforce AI Literacy',
        description: 'Master the fundamentals of AI in the modern workforce',
        content: 'This comprehensive training module covers essential AI literacy skills for today\'s workforce. Learn how to effectively use AI tools, understand AI ethics, and apply AI concepts in professional settings. Watch the video to understand the key principles of AI literacy in the workplace.',
        videoUrl: 'https://lompxaggrcfmmsjkbgyt.supabase.co/storage/v1/object/public/nanocard/WorkforcePromo.mp4',
        duration: '2:30',
        order: 1,
        category: 'Applied AI Leadership',
        createdAt: new Date().toISOString(),
        createdBy: 'carapaulson1@gmail.com',
        information: 'Essential AI literacy training for modern workforce development'
      };
      setModules([defaultModule]);
    }
  };

  const handleCreateModule = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/training/modules`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          order: modules.length + 1
        }),
      });

      if (response.ok) {
        toast.success("Module created successfully");
        resetForm();
        loadModules();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create module");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("Failed to create module");
    }
  };

  const handleUpdateModule = async (moduleId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/training/modules/${moduleId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Module updated successfully");
        resetForm();
        loadModules();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update module");
      }
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/training/modules/${moduleId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        toast.success("Module deleted");
        loadModules();
      } else {
        toast.error("Failed to delete module");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module");
    }
  };

  const startEdit = (module: TrainingModule) => {
    setEditingId(module.id);
    setFormData({
      title: module.title,
      description: module.description || "",
      content: module.content,
      videoUrl: module.videoUrl || "",
      duration: module.duration || "",
      category: module.category,
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: "",
      category: "Applied AI Leadership",
    });
  };

  const handleLogout = async () => {
    if (isGuestMode) {
      localStorage.removeItem('guestMode');
      navigate('/');
    } else {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  const handleQuickEdit = (module: TrainingModule) => {
    setEditingModule(module);
    setShowQuickEditModal(true);
  };

  const handleQuickEditSave = async (data: CardEditData) => {
    if (!editingModule) return;
    setIsSavingQuickEdit(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/training/modules/${editingModule.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: data.title,
          description: data.objective,
          content: data.information,
          videoUrl: data.videoUrl,
          duration: data.videoTime,
          category: editingModule.category,
        }),
      });

      if (response.ok) {
        toast.success("Module updated");
        setShowQuickEditModal(false);
        setEditingModule(null);
        loadModules();
      } else {
        toast.error("Failed to update module");
      }
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    } finally {
      setIsSavingQuickEdit(false);
    }
  };

  // Filter and sort modules - use only database modules (no hardcoded duplicates)
  const allModules = [...modules];
  
  const filteredAndSortedModules = allModules
    .filter(module => {
      // Search filter
      const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter - show all categories or filter by selected
      const matchesCategory = selectedCategory === "All Categories" || module.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by order number (1, 2, 3, 4...) for logical sequence
      return a.order - b.order;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading training content...</p>
        </div>
      </div>
    );
  }

  // Show purple upgrade screen after 10-second sneak peek for non-subscribers
  // BUT allow access to first 10 Applied AI Leadership modules
  if (!hasAccess && !sneakPeekActive) {
    // Check if there are any free modules available
    const hasFreeModules = allModules.some(isModuleFree);
    
    // If showing only free modules, don't block access
    if (hasFreeModules && selectedCategory === "Applied AI Leadership") {
      // Continue to render the app with only free modules visible
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center relative">
            <button
              onClick={() => navigate('/app')}
              className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-6">
              <BookOpen className="w-6 h-6 text-gray-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Premium Training Access
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              Training content is exclusively available
              <br />
              to{' '}
              <button
                onClick={() => navigate('/subscription?from=training')}
                className="font-semibold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 transition-colors"
              >
                Creator
              </button>
              {' '}and{' '}
              <button
                onClick={() => navigate('/subscription?from=training')}
                className="font-semibold text-purple-600 hover:text-purple-700 underline decoration-2 underline-offset-2 transition-colors"
              >
                Pro
              </button>
              {' '}subscribers.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-bold text-gray-900 mb-3">What's Inside:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Comprehensive AI product pitch training</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Step-by-step video tutorials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Best practices & examples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Exclusive content from industry experts</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/subscription')}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-semibold"
              >
                Upgrade to Access Training
              </Button>
              
              <Button
                onClick={() => navigate('/app')}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Quick Edit Modal */}
      {editingModule && (
        <EditCardModal
          isOpen={showQuickEditModal}
          onClose={() => {
            setShowQuickEditModal(false);
            setEditingModule(null);
          }}
          onSave={handleQuickEditSave}
          initialData={{
            title: editingModule.title,
            objective: editingModule.description,
            information: editingModule.content,
            videoUrl: editingModule.videoUrl || '',
            videoTime: editingModule.duration || '',
            thumbnailUrl: '',
            category: 'Training'
          }}
          isSaving={isSavingQuickEdit}
          isAdmin={isAdmin}
        />
      )}
    
      {/* Upgrade Modal - Appears after 5 seconds */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-6">
              <BookOpen className="w-6 h-6 text-gray-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Enjoying Learning & Development?
            </h2>
            
            <p className="text-gray-600 mb-6">
              Upgrade to Pro for even more features and advanced learning content!
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/subscription');
                }}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-semibold"
              >
                View Upgrade Options
              </Button>
              
              <Button
                onClick={() => setShowUpgradeModal(false)}
                variant="outline"
                className="w-full h-10 rounded-xl"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Header */}
      <GlobalHeader
        currentUserEmail={currentUserEmail}
        displayName={displayName}
        isGuestMode={isGuestMode}
        userPoints={userPoints}
        subscriptionTier={subscriptionTier}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Admin Add Button - Visible to admin */}
        {isAdmin && (
          <div className="mb-4">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl p-4 flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">{isCreating ? "Cancel" : "Add New Training Module"}</span>
            </button>
          </div>
        )}

        {/* Horizontal Scrolling Category Selector */}
        <div className="mb-4">
          <div className="bg-white rounded-xl border border-gray-200 p-1 flex items-center gap-2">
            <button
              onClick={() => {
                const categories: Array<"All Categories" | "Applied AI Leadership" | "Customer Service Training" | "nAnoCards Academy"> = [
                  "All Categories",
                  "Applied AI Leadership",
                  "Customer Service Training",
                  "nAnoCards Academy"
                ];
                const currentIndex = categories.indexOf(selectedCategory);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : categories.length - 1;
                setSelectedCategory(categories[prevIndex]);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous category"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1 text-center py-2 font-semibold text-gray-900">
              {selectedCategory}
            </div>
            
            <button
              onClick={() => {
                const categories: Array<"All Categories" | "Applied AI Leadership" | "Customer Service Training" | "nAnoCards Academy"> = [
                  "All Categories",
                  "Applied AI Leadership",
                  "Customer Service Training",
                  "nAnoCards Academy"
                ];
                const currentIndex = categories.indexOf(selectedCategory);
                const nextIndex = currentIndex < categories.length - 1 ? currentIndex + 1 : 0;
                setSelectedCategory(categories[nextIndex]);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next category"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <label htmlFor="training-search" className="sr-only">Search training modules</label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="training-search"
            type="text"
            placeholder="Search training modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white rounded-xl border-gray-300"
          />
        </div>

        {/* Create/Edit Form */}
        {isCreating && isAdmin && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Module" : "Create New Module"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Module Title * (40 characters max)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 40) })}
                  placeholder="e.g., Creating Compelling AI Product Pitches"
                  className="mt-1"
                  maxLength={40}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/40 characters
                </p>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied AI Leadership">Applied AI Leadership</SelectItem>
                    <SelectItem value="Customer Service Training">Customer Service Training</SelectItem>
                    <SelectItem value="nAnoCards Academy">nAnoCards Academy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of what this module covers"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Module Content *</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full module content (Markdown supported)"
                  className="mt-1 w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (Optional)</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 15 min"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => editingId ? handleUpdateModule(editingId) : handleCreateModule()}
                  className="flex-1 bg-[#1e3a8a] hover:bg-blue-800 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update Module" : "Create Module"}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Training Modules List - nAnoCard Style */}
        <div className="grid grid-cols-1 gap-6">
          {filteredAndSortedModules.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No Matching Modules" : "No Training Modules Yet"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search criteria."
                  : isAdmin 
                    ? "Create your first training module to get started."
                    : "Training content will appear here once it's published."}
              </p>
            </div>
          ) : (
            filteredAndSortedModules.map((module, index) => {
              const cardUrl = `${window.location.origin}/module/${module.id}`;
              // Use index + 1 for sequential numbering within filtered view
              const cardId = `${String(index + 1).padStart(3, '0')}`;

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-gray-100 w-full flex flex-col hover:shadow-md transition-shadow relative"
                  style={{ maxWidth: '340px', height: 'auto', margin: '0 auto' }}
                >
                  {/* Edit Pencil Icon - Top Right Corner (only for admin and non-placeholder) */}
                  {isAdmin && !module.isPlaceholder && (
                    <button
                      onClick={() => startEdit(module)}
                      className="absolute top-2 left-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors z-10"
                      title={`Edit Module #${cardId}`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  
                  {/* Title */}
                  <div className="px-4 py-3 relative">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-gray-900 leading-tight flex-1">
                        {module.title.slice(0, 40)}
                      </h3>
                      {isAdmin && !module.isPlaceholder && (
                        <button
                          onClick={() => startEdit(module)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                          title={`Edit Module #${cardId}`}
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Video Thumbnail Container with QR Code */}
                  <div className="relative w-full bg-gray-100" style={{ paddingBottom: '56.25%' }}>
                    {/* Video Thumbnail - Match NanoCard style with actual video element showing first frame */}
                    {module.videoUrl ? (
                      <>
                        {/* Actual video element showing first frame (like NanoCard) */}
                        <video
                          className="absolute inset-0 w-full h-full object-cover"
                          src={`${module.videoUrl}#t=0.1`}
                          preload="metadata"
                          playsInline
                          onError={() => {
                            console.error('Video load error for training card:', module.id, module.videoUrl);
                          }}
                          onLoadedData={() => {
                            console.log('Video loaded successfully for training card:', module.id);
                          }}
                        />
                        
                        {/* Play overlay button */}
                        <button
                          onClick={() => {
                            // Video play handler - can be implemented later
                            console.log('Play video:', module.videoUrl);
                          }}
                          className="absolute inset-0 flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
                          aria-label="Play video"
                        >
                          <svg width="39" height="31.2" viewBox="0 0 54 43.2" className="drop-shadow-md">
                            <defs>
                              <linearGradient id="playGradientTraining" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
                              </linearGradient>
                              {/* Mask for cut-out triangle effect */}
                              <mask id="playMaskTraining">
                                {/* White area = visible, Black area = transparent/cut-out */}
                                <rect width="54" height="43.2" fill="white" />
                                {/* Equilateral triangle cut-out - scaled down 10% */}
                                <path d="M 23.22 15.3 L 23.22 27.9 L 34.56 21.6 Z" fill="black" />
                              </mask>
                            </defs>
                            {/* Rounded rectangle with top and bottom indented at center - scaled down 10% */}
                            <path d="M 12.42 7.2 Q 9.18 7.2 9.18 10.8 L 9.18 32.4 Q 9.18 36 12.42 36 L 23.76 36 Q 27 32.4 30.24 36 L 41.58 36 Q 44.82 36 44.82 32.4 L 44.82 10.8 Q 44.82 7.2 41.58 7.2 L 30.24 7.2 Q 27 10.8 23.76 7.2 Z" fill="url(#playGradientTraining)" mask="url(#playMaskTraining)" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">Training Module</p>
                        </div>
                      </div>
                    )}

                    {/* Time Overlay (Bottom Right) */}
                    {module.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
                        {module.duration}
                      </div>
                    )}
                    
                    {/* Information Thought Bubble - Appears over time display when hovering info icon */}
                    {showInfoPopup === module.id && (module.information || module.content) && (
                      <div 
                        className="absolute bottom-2 left-2 z-10 pointer-events-none"
                        style={{
                          maxWidth: 'calc(100% - 100px)'
                        }}
                      >
                        <div className="relative px-4 py-3 bg-white text-gray-800 text-xs rounded-2xl shadow-2xl border-2 border-gray-200 max-w-xs"
                          style={{
                            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                          }}
                        >
                          <div className="text-gray-900 leading-relaxed break-words whitespace-pre-wrap">
                            {module.information || module.content.slice(0, 256) || 'This is the intent or mission and target audience and problem to solve.'}
                          </div>
                          {/* Thought bubble tail - bottom left */}
                          <div className="absolute top-full left-4">
                            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 10C10 10 3 3 0 0H20C17 3 10 10 10 10Z" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR Code (Top Right) */}
                    <div className="absolute top-2 right-2 bg-white p-1.5 rounded-lg shadow-md">
                      <QRCodeSVG
                        value={cardUrl}
                        size={60}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Download Icon (Below QR Code) */}
                    <button
                      className="absolute top-[75px] right-2 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Social Icons Row 1 */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    {/* Information Icon with Thought Bubble */}
                    {(module.information || module.content) && (
                      <div className="relative">
                        <button 
                          onMouseEnter={() => setShowInfoPopup(module.id)}
                          onMouseLeave={() => setShowInfoPopup(null)}
                          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Info className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                        </button>
                        
                        {/* Information Thought Bubble - Positioned relative to i icon */}
                        {showInfoPopup === module.id && (
                          <div 
                            className="absolute bottom-full left-0 mb-2 z-50 pointer-events-none"
                            style={{ minWidth: '280px', maxWidth: '340px' }}
                          >
                            <div className="relative px-5 py-4 bg-white text-gray-800 text-sm rounded-2xl shadow-2xl border-2 border-gray-200"
                              style={{
                                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
                              }}
                            >
                              <div className="text-gray-900 leading-relaxed break-words whitespace-pre-wrap">
                                {module.information || module.content.slice(0, 256)}
                              </div>
                              {/* Thought bubble tail pointing down to i icon */}
                              <div className="absolute top-full left-8">
                                <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 12C12 12 4 4 0 0H24C20 4 12 12 12 12Z" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Document">
                      <FileText className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Website">
                      <Globe className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="LinkedIn">
                      <Linkedin className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Discord">
                      <MessageCircle className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="YouTube">
                      <Youtube className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="GitHub">
                      <Github className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Facebook">
                      <svg className="w-6 h-6 text-gray-400" strokeWidth={1.5} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 2h-3a5 5 0 00-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                      </svg>
                    </button>
                  </div>

                  {/* Social Icons Row 2 with Like Counter */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Share">
                        <Share2 className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Camera">
                        <Camera className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Email">
                        <Mail className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="Link">
                        <LinkIcon className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Like Counter and ID */}
                    <div className="flex items-center gap-3 ml-auto">
                      <button className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                        <Heart className="w-5 h-5 text-red-500" fill="currentColor" strokeWidth={1.5} />
                        <span className="text-gray-600 font-medium text-sm">156</span>
                      </button>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-gray-600 font-semibold text-sm">#{cardId}</span>
                        <button
                          onClick={() => handleQuickEdit(module)}
                          className="hover:bg-gray-100 p-0.5 rounded transition-colors"
                          title={`Edit Module #${cardId}`}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gray-600" fill="currentColor" strokeWidth={0} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Admin Edit/Delete Buttons - Only for non-placeholder cards */}
                  {isAdmin && !module.isPlaceholder && (
                    <div className="px-4 pb-3 flex gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() => startEdit(module)}
                        className="flex-1 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="flex-1 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}