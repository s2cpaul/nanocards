import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Upload, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
const profilePlaceholder = "";

export function ProfileSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSetup = searchParams.get('setup') === 'true';
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  // Auto-populate email from logged-in user
  useEffect(() => {
    const getEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getEmail();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }

    // Save profile to localStorage
    const profileData = {
      fullName,
      headline,
      company,
      location,
      bio,
      profileImage,
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    localStorage.setItem('userProfileComplete', 'true');
    
    toast.success('Profile completed!', {
      description: 'Now add your featured link',
    });
    
    navigate('/featured-link');
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
            <h1 className="text-xl font-semibold text-gray-900">
              {isSetup ? 'Complete Your Profile' : 'Profile'}
            </h1>
          </div>
        </div>
      </div>

      {/* Setup Notice */}
      {isSetup && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-1">Welcome to nAnoCards!</h2>
            <p className="text-sm text-blue-800">
              Please complete your profile to start creating nAnoCards. This helps personalize your experience.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Picture Section */}
          <div className="relative h-32 bg-gradient-to-r from-gray-200 to-gray-300">
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
                  <img
                    src={profileImage || profilePlaceholder}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gray-700" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            <button
              type="button"
              className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>

          {/* BIO Section */}
          <div className="pt-20 px-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                BIO
              </Label>
              <button type="button" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </div>
            <Textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= 256) {
                  setBio(e.target.value);
                }
              }}
              placeholder="Write a brief bio about yourself..."
              className="w-full min-h-[80px] text-sm resize-none"
              maxLength={256}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${bio.length >= 256 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                {bio.length}/256
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-base font-bold text-gray-900 mb-2 block">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Cara Johnson"
                required
                className="text-base"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-bold text-gray-900 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cara.johnson@example.com"
                className="text-base"
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="headline" className="text-base font-bold text-gray-900 mb-2 block">
                Headline
              </Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="AI Product Designer | Innovator"
                className="text-base"
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-base font-bold text-gray-900 mb-2 block">
                Organization
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Tech Innovations Inc."
                className="text-base"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-base font-bold text-gray-900 mb-2 block">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="text-base"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 pb-6">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-950 hover:to-indigo-800 text-white rounded-xl text-base font-semibold shadow-lg"
            >
              {isSetup ? 'Complete Profile & Create Card' : 'Save Profile'}
            </Button>
          </div>
        </div>

        {/* Skip Option (only during setup) */}
        {isSetup && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('userProfileComplete', 'true');
                navigate('/create');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Skip for now
            </button>
          </div>
        )}
      </form>
    </div>
  );
}