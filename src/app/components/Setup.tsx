import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Edit, Plus, Copy, Link as LinkIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { HamburgerMenu } from "./HamburgerMenu";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
const profilePlaceholder = "";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export function Setup() {
  const navigate = useNavigate();
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  
  // Link fields
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        setEmail(session.user.email); // Auto-populate email
        setIsGuestMode(false);
        const points = parseInt(localStorage.getItem('userPoints') || '0');
        setUserPoints(points);
        
        // Load existing profile data
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setFullName(profile.fullName || "");
          setHeadline(profile.headline || "");
          setCompany(profile.company || "");
          setLocation(profile.location || "");
          setBio(profile.bio || "");
          setProfileImage(profile.profileImage || "");
        }
        
        // Load existing links
        const savedLinks = localStorage.getItem('userLinks');
        if (savedLinks) {
          setLinks(JSON.parse(savedLinks));
        }
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

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBio = () => {
    const profileData = {
      fullName,
      email,
      headline,
      company,
      location,
      bio,
      profileImage,
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    localStorage.setItem('userProfileComplete', 'true');
    setIsEditingBio(false);
    toast.success('Profile updated successfully!');
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: newLinkTitle.trim() || 'Website',
      url: newLinkUrl.trim(),
    };
    
    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    localStorage.setItem('userLinks', JSON.stringify(updatedLinks));
    
    setNewLinkUrl("");
    setNewLinkTitle("");
    toast.success('Link added successfully!');
  };

  const handleRemoveLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id);
    setLinks(updatedLinks);
    localStorage.setItem('userLinks', JSON.stringify(updatedLinks));
    toast.success('Link removed');
  };

  const handleTestLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handlePasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setNewLinkUrl(text);
      toast.success('Link pasted!');
    } catch (err) {
      toast.error('Failed to paste from clipboard');
    }
  };

  const characterCount = bio.length;
  const characterLimit = 256;
  const isAtLimit = characterCount >= characterLimit;

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
            <h1 className="text-xl font-semibold text-gray-900">Account Setup</h1>
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
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Image Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="relative">
            <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
                  <img 
                    src={profileImage || profilePlaceholder} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <label className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Upload</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">BIO</h2>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="font-semibold text-gray-900">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Cara Johnson"
                disabled={!isEditingBio}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="font-semibold text-gray-900">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={!isEditingBio}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="headline" className="font-semibold text-gray-900">Headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Enter your headline"
                disabled={!isEditingBio}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="company" className="font-semibold text-gray-900">Organization</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter your organization"
                disabled={!isEditingBio}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location" className="font-semibold text-gray-900">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                disabled={!isEditingBio}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="font-semibold text-gray-900">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, characterLimit))}
                placeholder="Tell us about yourself..."
                disabled={!isEditingBio}
                className="mt-1 resize-none"
                rows={4}
                maxLength={characterLimit}
              />
              <p className={`text-xs mt-1 ${isAtLimit ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                {characterCount}/{characterLimit} characters
              </p>
            </div>

            {isEditingBio && (
              <Button
                onClick={handleSaveBio}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Bio
              </Button>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">LINKS</h2>
          
          {/* Existing Links */}
          {links.map((link) => (
            <div key={link.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{link.title}</span>
                </div>
                <button
                  onClick={() => handleRemoveLink(link.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <p className="text-sm text-gray-600 truncate">{link.url}</p>
              <button
                onClick={() => handleTestLink(link.url)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Test Link →
              </button>
            </div>
          ))}

          {/* Add New Link */}
          <div className="space-y-3 mt-4">
            <div>
              <Label htmlFor="linkTitle" className="font-semibold text-gray-900">Link Title</Label>
              <Input
                id="linkTitle"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Website"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="linkUrl" className="font-semibold text-gray-900">URL</Label>
              <Input
                id="linkUrl"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePasteLink}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">Paste</span>
              </button>
              <button
                onClick={() => handleTestLink(newLinkUrl)}
                disabled={!newLinkUrl}
                className="flex items-center gap-2 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium">Test</span>
              </button>
            </div>

            <button
              onClick={handleAddLink}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-gray-700"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Link</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={() => {
            handleSaveBio();
            navigate('/app');
          }}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}