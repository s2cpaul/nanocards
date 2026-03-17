import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Search,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Github,
  MessageCircle,
  Mail,
  Globe,
  Calendar,
  FileStack,
  HardDrive,
  DollarSign,
  Heart,
  Coffee,
  Plus,
  ChevronDown,
  ChevronUp,
  Presentation,
  ClipboardList,
  BarChart3,
  GripVertical
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { HamburgerMenu } from "./HamburgerMenu";
import { supabase } from "../../lib/supabase";

interface ContentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  isAdded?: boolean;
}

export function Settings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        setIsGuestMode(false);
        // Get user points from localStorage
        const points = parseInt(localStorage.getItem('userPoints') || '0');
        setUserPoints(points);
      } else {
        setIsGuestMode(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  // Get saved links from localStorage
  const savedLinks = JSON.parse(localStorage.getItem('userSocialLinks') || '{}');
  const featuredLink = localStorage.getItem('featuredLink');

  const contentOptions: ContentOption[] = [
    {
      id: "calendly",
      name: "Calendly",
      icon: <Calendar className="w-6 h-6 text-gray-700" />,
      category: "productivity",
      isAdded: !!savedLinks.calendly,
    },
    {
      id: "googleDrive",
      name: "Google Drive",
      icon: <HardDrive className="w-6 h-6 text-gray-700" />,
      category: "productivity",
      isAdded: !!savedLinks.googleDrive,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.linkedin,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.instagram,
    },
    {
      id: "twitter",
      name: "X",
      icon: <Twitter className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.twitter,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.facebook,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <Youtube className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.youtube,
    },
    {
      id: "github",
      name: "GitHub",
      icon: <Github className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.github,
    },
    {
      id: "discord",
      name: "Discord",
      icon: <MessageCircle className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.discord,
    },
    {
      id: "notion",
      name: "Notion",
      icon: <FileStack className="w-6 h-6 text-gray-700" />,
      category: "social",
      isAdded: !!savedLinks.notion,
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="w-6 h-6 text-gray-700" />,
      category: "contact",
      isAdded: !!savedLinks.email,
    },
    {
      id: "officialSite",
      name: "Official URL",
      icon: <Globe className="w-6 h-6 text-gray-700" />,
      category: "general",
      isAdded: !!savedLinks.officialSite,
    },
    {
      id: "venmo",
      name: "Venmo",
      icon: <DollarSign className="w-6 h-6 text-gray-700" />,
      category: "payment",
      isAdded: !!savedLinks.venmo,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <DollarSign className="w-6 h-6 text-gray-700" />,
      category: "payment",
      isAdded: !!savedLinks.paypal,
    },
    {
      id: "cashapp",
      name: "Cash App",
      icon: <DollarSign className="w-6 h-6 text-gray-700" />,
      category: "payment",
      isAdded: !!savedLinks.cashapp,
    },
    {
      id: "gofundme",
      name: "GoFundMe",
      icon: <Heart className="w-6 h-6 text-gray-700" />,
      category: "payment",
      isAdded: !!savedLinks.gofundme,
    },
    {
      id: "patreon",
      name: "Patreon",
      icon: <Heart className="w-6 h-6 text-gray-700" />,
      category: "payment",
      isAdded: !!savedLinks.patreon,
    },
    {
      id: "kofi",
      name: "Ko-fi",
      icon: <Coffee className="w-6 h-6 text-gray-700" />,
      category: "payment",
      isAdded: !!savedLinks.kofi,
    },
    {
      id: "buymeacoffee",
      name: "Buy Me a Coffee",
      icon: <Coffee className="w-6 h-6 text-gray-700" />,
      category: "payment",
      isAdded: !!savedLinks.buymeacoffee,
    },
    {
      id: "quiz",
      name: "Quiz",
      icon: <ClipboardList className="w-6 h-6 text-gray-700" />,
      category: "interactive",
      isAdded: !!savedLinks.quiz,
    },
    {
      id: "survey",
      name: "Survey",
      icon: <BarChart3 className="w-6 h-6 text-gray-700" />,
      category: "interactive",
      isAdded: !!savedLinks.survey,
    },
    {
      id: "draganddrop",
      name: "Drag and Drop",
      icon: <GripVertical className="w-6 h-6 text-gray-700" />,
      category: "interactive",
      isAdded: !!savedLinks.draganddrop,
    },
  ];

  // Filter options based on search
  const filteredOptions = contentOptions.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate by category
  const productivityOptions = filteredOptions.filter(o => o.category === "productivity");
  const socialOptions = filteredOptions.filter(o => o.category === "social");
  const paymentOptions = filteredOptions.filter(o => o.category === "payment");
  const interactiveOptions = filteredOptions.filter(o => o.category === "interactive");
  const otherOptions = filteredOptions.filter(o => !["productivity", "social", "payment", "interactive"].includes(o.category));

  // Show first 3, rest under "show more"
  const visibleProductivity = showMore ? productivityOptions : productivityOptions.slice(0, 3);
  const hiddenCount = productivityOptions.length - 3;

  const handleAddContent = (optionId: string) => {
    if (optionId === 'quiz') {
      navigate('/quiz-setup');
    } else if (optionId === 'survey') {
      navigate('/survey-setup');
    } else {
      navigate('/build-network', { state: { focusField: optionId } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
            <h1 className="text-xl font-semibold text-gray-900">Add Content</h1>
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
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <label htmlFor="settings-search" className="sr-only">Search content types</label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="settings-search"
              type="text"
              placeholder="Search content types"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-gray-100 border-gray-200"
            />
          </div>
        </div>

        {/* Featured Presentation Link - Always First */}
        {!searchQuery && (
          <div className="mb-6">
            <div
              className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <span className="font-bold text-gray-700 flex items-center" style={{ letterSpacing: '-0.5px', fontSize: '0.8625rem' }}>
                    <span>n</span>
                    <span className="font-black">A</span>
                    <span>no</span>
                  </span>
                </div>
                <span className="font-medium text-gray-900">Featured Presentation</span>
              </div>
              <button
                onClick={() => navigate('/featured-link')}
                className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>{featuredLink ? 'Edit' : 'Add'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Tools */}
        {interactiveOptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Interactive Tools
            </h2>
            <div className="space-y-3">
              {interactiveOptions.map((option) => (
                <div
                  key={option.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">{option.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddContent(option.id)}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{option.isAdded ? 'Edit' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Section */}
        {socialOptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Social Media
            </h2>
            <div className="space-y-3">
              {socialOptions.map((option) => (
                <div
                  key={option.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">{option.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddContent(option.id)}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{option.isAdded ? 'Edit' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Links Section */}
        {paymentOptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Payment Links
            </h2>
            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <div
                  key={option.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">{option.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddContent(option.id)}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{option.isAdded ? 'Edit' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productivity Tools */}
        {visibleProductivity.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Productivity Tools
            </h2>
            <div className="space-y-3">
              {visibleProductivity.map((option) => (
                <div
                  key={option.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">{option.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddContent(option.id)}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{option.isAdded ? 'Edit' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show More Button */}
        {!searchQuery && productivityOptions.length > 3 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-6 text-sm"
          >
            <span>Show more</span>
            {showMore ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Other Options */}
        {otherOptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Other
            </h2>
            <div className="space-y-3">
              {otherOptions.map((option) => (
                <div
                  key={option.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">{option.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddContent(option.id)}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{option.isAdded ? 'Edit' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredOptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No content types found</p>
          </div>
        )}
      </div>
    </div>
  );
}