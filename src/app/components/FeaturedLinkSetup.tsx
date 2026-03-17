import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, LinkIcon, Copy, Clipboard, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase, API_BASE_URL, getAuthHeaders } from "../../lib/supabase";
import { STAGES } from "../constants/stages";
import { HamburgerMenu } from "./HamburgerMenu";

interface AdditionalLink {
  url: string;
  title: string;
  duration?: string;
}

export function FeaturedLinkSetup() {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [stage, setStage] = useState("");
  const [additionalLinks, setAdditionalLinks] = useState<AdditionalLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkDuration, setNewLinkDuration] = useState("");
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [searchParams] = useSearchParams();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWebsiteUrl(text);
      toast.success('Link pasted!');
    } catch (error) {
      console.error('Failed to paste:', error);
      toast.error('Failed to paste from clipboard');
    }
  };

  const handleTest = () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    try {
      const url = new URL(websiteUrl);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
      toast.success('Opening link in new tab...');
    } catch (error) {
      toast.error('Invalid URL format', {
        description: 'Please enter a valid website URL',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch (error) {
      toast.error('Invalid URL format', {
        description: 'Please enter a valid website URL (e.g., https://example.com)',
      });
      return;
    }

    // Save featured link to localStorage
    const featuredLink = {
      url: websiteUrl,
      title: customTitle || websiteUrl,
      duration: duration || "N/A",
      stage: stage || undefined,
    };
    
    localStorage.setItem('userFeaturedLink', JSON.stringify(featuredLink));
    localStorage.setItem('featuredLinkComplete', 'true');
    
    // Save additional links to localStorage
    if (additionalLinks.length > 0) {
      localStorage.setItem('userAdditionalLinks', JSON.stringify(additionalLinks));
    }
    
    toast.success('Featured link added!', {
      description: 'Now build your network',
    });
    
    navigate('/build-network');
  };

  const handleSkip = () => {
    localStorage.setItem('featuredLinkComplete', 'true');
    navigate('/build-network');
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !newLinkTitle.trim()) {
      toast.error('Please enter both URL and title for the additional link');
      return;
    }

    try {
      new URL(newLinkUrl);
    } catch (error) {
      toast.error('Invalid URL format', {
        description: 'Please enter a valid website URL (e.g., https://example.com)',
      });
      return;
    }

    const newLink: AdditionalLink = {
      url: newLinkUrl,
      title: newLinkTitle,
      duration: newLinkDuration || "N/A",
    };

    setAdditionalLinks([...additionalLinks, newLink]);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setNewLinkDuration("");
    setShowAddLinkForm(false);
    toast.success('Additional link added!');
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = additionalLinks.filter((_, i) => i !== index);
    setAdditionalLinks(updatedLinks);
    toast.success('Additional link removed!');
  };

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
          <h1 className="text-xl font-bold text-gray-900">Add Website</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6">
        {/* Main Featured Presentation Card - All fields in one */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          {/* Card Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Presentation</h2>
          
          {/* URL Section */}
          <label htmlFor="websiteUrl" className="block text-lg font-bold text-gray-900 mb-3">
            URL
          </label>
          <Input
            id="websiteUrl"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            type="text"
            className="mb-6 h-12 text-base"
          />

          {/* Title Section */}
          <label htmlFor="customTitle" className="block text-lg font-bold text-gray-900 mb-3">
            Title
          </label>
          <Input
            id="customTitle"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Enter a title for this link"
            className="h-12 text-base mb-6"
          />

          {/* Duration Section */}
          <label htmlFor="duration" className="block text-lg font-bold text-gray-900 mb-3">
            Duration
          </label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 1:30"
            className="h-12 text-base mb-6"
          />

          {/* Stage Dropdown */}
          <label htmlFor="stage" className="block text-lg font-bold text-gray-900 mb-3">
            Stage
          </label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full h-12 px-3 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select stage (optional)</option>
            {STAGES.map((stageOption) => (
              <option key={stageOption.value} value={stageOption.value}>
                {stageOption.label}
              </option>
            ))}
          </select>
        </div>

        {/* Add Additional Link Section */}
        {!showAddLinkForm ? (
          <button
            type="button"
            onClick={() => setShowAddLinkForm(true)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm mb-6 flex items-center justify-center gap-2 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Additional Link
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Media</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddLinkForm(false);
                  setNewLinkUrl("");
                  setNewLinkTitle("");
                  setNewLinkDuration("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <label htmlFor="newLinkUrl" className="block font-semibold text-gray-900 mb-2">
              URL
            </label>
            <Input
              id="newLinkUrl"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-12 text-base mb-4"
            />
            <label htmlFor="newLinkTitle" className="block font-semibold text-gray-900 mb-2">
              Title
            </label>
            <Input
              id="newLinkTitle"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              placeholder="Enter a title for this link"
              className="h-12 text-base mb-4"
            />
            <label htmlFor="newLinkDuration" className="block font-semibold text-gray-900 mb-2">
              Duration
            </label>
            <Input
              id="newLinkDuration"
              value={newLinkDuration}
              onChange={(e) => setNewLinkDuration(e.target.value)}
              placeholder="e.g., 1:30"
              className="h-12 text-base mb-4"
            />
            <Button
              type="button"
              onClick={handleAddLink}
              className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
            >
              Add Link
            </Button>
          </div>
        )}

        {/* Display Additional Links */}
        {additionalLinks.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Additional Links</h3>
            <ul className="space-y-2">
              {additionalLinks.map((link, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">{link.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-14 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-2xl text-lg font-semibold shadow-sm transition-colors"
        >
          Add
        </Button>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Skip for now
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            What is a Featured Link?
          </h3>
          <p className="text-sm text-blue-800">
            Your featured link is the primary media file you want people to see. This could be your self promotion, your pitch, your portfolio, company website, product landing page, or any other important link. It will be prominently displayed on your nAnoCard!
          </p>
        </div>
      </form>
    </div>
  );
}