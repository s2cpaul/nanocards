import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Search,
  Presentation,
  ClipboardCheck,
  BarChart3,
  GripVertical,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Github,
  MessageSquare,
  FileText,
  DollarSign,
  CreditCard,
  Wallet,
  Heart,
  Coffee,
  Gift,
  CalendarDays,
  HardDrive,
  Mail,
  Globe
} from "lucide-react";
import { Input } from "./ui/input";
import { HamburgerMenu } from "./HamburgerMenu";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";

interface ContentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
}

export function AddContentScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userTier, setUserTier] = useState("Free");

  // Fetch user info on mount
  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode') === 'true';
    setIsGuestMode(guestMode);

    if (!guestMode) {
      const getUserInfo = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserEmail(session.user.email || '');
          
          // Get user subscription info
          try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/subscription/status`, { headers });
            if (response.ok) {
              const data = await response.json();
              setUserPoints(data.points || 0);
              setUserTier(data.tier || 'Free');
            }
          } catch (error) {
            console.error('Error fetching user subscription:', error);
          }
        }
      };
      getUserInfo();
    }
  }, []);

  const contentTypes: ContentType[] = [
    // Featured
    { id: "featured-presentation", name: "Featured Presentation", icon: <Presentation className="w-5 h-5 text-gray-700" />, category: "Featured" },
    
    // Interactive Tools
    { id: "quiz", name: "Quiz", icon: <ClipboardCheck className="w-5 h-5 text-gray-700" />, category: "Interactive Tools" },
    { id: "survey", name: "Survey", icon: <BarChart3 className="w-5 h-5 text-gray-700" />, category: "Interactive Tools" },
    { id: "drag-drop", name: "Drag and Drop", icon: <GripVertical className="w-5 h-5 text-gray-700" />, category: "Interactive Tools" },
    
    // Social Media
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "instagram", name: "Instagram", icon: <Instagram className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "x", name: "X", icon: <Twitter className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "facebook", name: "Facebook", icon: <Facebook className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "youtube", name: "YouTube", icon: <Youtube className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "github", name: "GitHub", icon: <Github className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "discord", name: "Discord", icon: <MessageSquare className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "notion", name: "Notion", icon: <FileText className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    
    // Payment Links
    { id: "venmo", name: "Venmo", icon: <DollarSign className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "paypal", name: "PayPal", icon: <CreditCard className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "cashapp", name: "Cash App", icon: <Wallet className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "gofundme", name: "GoFundMe", icon: <Heart className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "patreon", name: "Patreon", icon: <Heart className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "kofi", name: "Ko-fi", icon: <Coffee className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "buymeacoffee", name: "Buy Me a Coffee", icon: <Gift className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    
    // Productivity Tools
    { id: "calendly", name: "Calendly", icon: <CalendarDays className="w-5 h-5 text-gray-700" />, category: "Productivity Tools" },
    { id: "googledrive", name: "Google Drive", icon: <HardDrive className="w-5 h-5 text-gray-700" />, category: "Productivity Tools" },
    
    // Other
    { id: "email", name: "Email", icon: <Mail className="w-5 h-5 text-gray-700" />, category: "Other" },
    { id: "official-url", name: "Official URL", icon: <Globe className="w-5 h-5 text-gray-700" />, category: "Other" },
  ];

  // Filter content types based on search query
  const filteredContent = contentTypes.filter(content =>
    content.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group content by category
  const groupedContent: { [key: string]: ContentType[] } = {};
  filteredContent.forEach(content => {
    if (!groupedContent[content.category]) {
      groupedContent[content.category] = [];
    }
    groupedContent[content.category].push(content);
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  const handleAddContent = (contentId: string) => {
    // Navigate to create card page
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Add Content</h1>
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

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search content types"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 border-gray-200 h-12"
          />
        </div>

        {/* Content Types */}
        <div className="space-y-6">
          {Object.entries(groupedContent).map(([category, items]) => (
            <div key={category}>
              {/* Category Header */}
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                {category}
              </h2>
              
              {/* Category Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                      index !== items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <button
                      onClick={() => handleAddContent(item.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No content types found</p>
            <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}