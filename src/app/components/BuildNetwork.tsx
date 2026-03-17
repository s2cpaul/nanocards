import { useState } from "react";
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
  FileText,
  Globe,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileStack,
  HardDrive,
  DollarSign,
  Heart,
  Coffee
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface SocialLink {
  id: string;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  category?: string;
}

export function BuildNetwork() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  
  // Load existing network data if any
  const savedNetwork = localStorage.getItem('userNetwork');
  const initialLinks = savedNetwork ? JSON.parse(savedNetwork) : {};

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      id: "calendly",
      name: "Calendly",
      icon: <Calendar className="w-6 h-6" />,
      placeholder: "https://calendly.com/yourname",
      value: initialLinks.calendly || "",
      category: "productivity",
    },
    {
      id: "googleDrive",
      name: "Google Drive",
      icon: <HardDrive className="w-6 h-6" />,
      placeholder: "https://drive.google.com/...",
      value: initialLinks.googleDrive || "",
      category: "productivity",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="w-6 h-6" />,
      placeholder: "https://linkedin.com/in/yourprofile",
      value: initialLinks.linkedin || "",
      category: "social",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="w-6 h-6" />,
      placeholder: "https://instagram.com/yourhandle",
      value: initialLinks.instagram || "",
      category: "social",
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: <Twitter className="w-6 h-6" />,
      placeholder: "https://x.com/yourhandle",
      value: initialLinks.twitter || "",
      category: "social",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="w-6 h-6" />,
      placeholder: "https://facebook.com/yourprofile",
      value: initialLinks.facebook || "",
      category: "social",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <Youtube className="w-6 h-6" />,
      placeholder: "https://youtube.com/@yourchannel",
      value: initialLinks.youtube || "",
      category: "social",
    },
    {
      id: "github",
      name: "GitHub",
      icon: <Github className="w-6 h-6" />,
      placeholder: "https://github.com/yourusername",
      value: initialLinks.github || "",
      category: "social",
    },
    {
      id: "discord",
      name: "Discord",
      icon: <MessageCircle className="w-6 h-6" />,
      placeholder: "https://discord.gg/yourserver",
      value: initialLinks.discord || "",
      category: "social",
    },
    {
      id: "notion",
      name: "Notion",
      icon: <FileStack className="w-6 h-6" />,
      placeholder: "https://notion.so/yourpage",
      value: initialLinks.notion || "",
      category: "social",
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="w-6 h-6" />,
      placeholder: "your.email@example.com",
      value: initialLinks.email || "",
      category: "contact",
    },
    {
      id: "officialSite",
      name: "Official Website",
      icon: <Globe className="w-6 h-6" />,
      placeholder: "https://yourwebsite.com",
      value: initialLinks.officialSite || "",
      category: "general",
    },
    {
      id: "whitePaper",
      name: "White Paper",
      icon: <FileText className="w-6 h-6" />,
      placeholder: "https://link-to-whitepaper.pdf",
      value: initialLinks.whitePaper || "",
      category: "general",
    },
    {
      id: "information",
      name: "Information",
      icon: <FileText className="w-6 h-6" />,
      placeholder: "https://additional-info-link.com",
      value: initialLinks.information || "",
      category: "general",
    },
    {
      id: "link",
      name: "Custom Link",
      icon: <LinkIcon className="w-6 h-6" />,
      placeholder: "https://any-other-link.com",
      value: initialLinks.link || "",
      category: "general",
    },
    {
      id: "venmo",
      name: "Venmo",
      icon: <DollarSign className="w-6 h-6" />,
      placeholder: "https://venmo.com/u/yourusername",
      value: initialLinks.venmo || "",
      category: "payment",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <DollarSign className="w-6 h-6" />,
      placeholder: "https://paypal.me/yourusername",
      value: initialLinks.paypal || "",
      category: "payment",
    },
    {
      id: "cashapp",
      name: "Cash App",
      icon: <DollarSign className="w-6 h-6" />,
      placeholder: "https://cash.app/$yourusername",
      value: initialLinks.cashapp || "",
      category: "payment",
    },
    {
      id: "gofundme",
      name: "GoFundMe",
      icon: <Heart className="w-6 h-6" />,
      placeholder: "https://gofundme.com/f/yourcampaign",
      value: initialLinks.gofundme || "",
      category: "payment",
    },
    {
      id: "patreon",
      name: "Patreon",
      icon: <Heart className="w-6 h-6" />,
      placeholder: "https://patreon.com/yourusername",
      value: initialLinks.patreon || "",
      category: "payment",
    },
    {
      id: "kofi",
      name: "Ko-fi",
      icon: <Coffee className="w-6 h-6" />,
      placeholder: "https://ko-fi.com/yourusername",
      value: initialLinks.kofi || "",
      category: "payment",
    },
    {
      id: "buymeacoffee",
      name: "Buy Me a Coffee",
      icon: <Coffee className="w-6 h-6" />,
      placeholder: "https://buymeacoffee.com/yourusername",
      value: initialLinks.buymeacoffee || "",
      category: "payment",
    },
    {
      id: "donate",
      name: "Donate (Custom)",
      icon: <DollarSign className="w-6 h-6" />,
      placeholder: "https://your-custom-donation-link.com",
      value: initialLinks.donate || "",
      category: "payment",
    },
  ]);

  const handleUpdateLink = (id: string, value: string) => {
    setSocialLinks(prev =>
      prev.map(link =>
        link.id === id ? { ...link, value } : link
      )
    );
  };

  const handleSave = () => {
    // Create network object from links
    const networkData: Record<string, string> = {};
    socialLinks.forEach(link => {
      if (link.value.trim()) {
        networkData[link.id] = link.value.trim();
      }
    });

    // Save to localStorage
    localStorage.setItem('userNetwork', JSON.stringify(networkData));
    localStorage.setItem('networkComplete', 'true');
    
    const addedCount = Object.keys(networkData).length;
    
    if (addedCount > 0) {
      toast.success(`Network built! ${addedCount} link${addedCount > 1 ? 's' : ''} added`, {
        description: 'You can now create your first nAnoCard',
      });
    } else {
      toast.info('Network setup complete', {
        description: 'You can add links later from your profile',
      });
    }
    
    navigate('/create');
  };

  const handleSkip = () => {
    localStorage.setItem('networkComplete', 'true');
    navigate('/create');
  };

  // Filter links based on search
  const filteredLinks = socialLinks.filter(link =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split into main (first 3) and more (rest)
  const mainLinks = filteredLinks.slice(0, 3);
  const moreLinks = filteredLinks.slice(3);

  const addedCount = socialLinks.filter(link => link.value.trim()).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Configurations</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-1">Insights & Resources</h2>
          <p className="text-sm text-blue-800">
            Add your social media, payment links (Venmo, PayPal, etc.), and important resources. These will appear on your nAnoCards and make it easy for people to connect with you and support your work.
          </p>
          {addedCount > 0 && (
            <p className="text-sm text-blue-900 font-semibold mt-2">
              ✓ {addedCount} link{addedCount > 1 ? 's' : ''} added
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <label htmlFor="network-search" className="sr-only">Search content types</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="network-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content types"
            className="pl-10 h-12 bg-white"
          />
        </div>

        {/* Main Links (Always Visible) */}
        <div className="space-y-3 mb-4">
          {mainLinks.map(link => (
            <div
              key={link.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-gray-700">
                    {link.icon}
                  </div>
                  <span className="font-semibold text-gray-900">{link.name}</span>
                </div>
                {link.value.trim() && (
                  <span className="text-sm text-green-600 font-medium">Added ✓</span>
                )}
              </div>
              <Input
                id={`link-${link.id}`}
                value={link.value}
                onChange={(e) => handleUpdateLink(link.id, e.target.value)}
                placeholder={link.placeholder}
                aria-label={`${link.name} URL`}
                className="h-11"
              />
            </div>
          ))}
        </div>

        {/* Show More Toggle */}
        {moreLinks.length > 0 && (
          <>
            <button
              onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-700 font-semibold hover:text-gray-900 transition-colors"
            >
              Show {showMore ? 'less' : 'more'}
              {showMore ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {/* More Links (Expandable) */}
            {showMore && (
              <div className="space-y-3 mt-4">
                {moreLinks.map(link => (
                  <div
                    key={link.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-700">
                          {link.icon}
                        </div>
                        <span className="font-semibold text-gray-900">{link.name}</span>
                      </div>
                      {link.value.trim() && (
                        <span className="text-sm text-green-600 font-medium">Added ✓</span>
                      )}
                    </div>
                    <Input
                      value={link.value}
                      onChange={(e) => handleUpdateLink(link.id, e.target.value)}
                      placeholder={link.placeholder}
                      className="h-11"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={handleSave}
            className="w-full h-14 bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-950 hover:to-indigo-800 text-white rounded-xl text-lg font-semibold shadow-lg"
          >
            {addedCount > 0 ? `Continue with ${addedCount} Link${addedCount > 1 ? 's' : ''}` : 'Continue'}
          </Button>

          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}