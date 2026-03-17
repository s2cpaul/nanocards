import { Home, Plus, BookOpen, Star, User, Play, Heart, Share2, Camera, Mail, Link as LinkIcon, Globe, Linkedin, MessageCircle, FileText, Youtube, Github } from "lucide-react";
import { useNavigate } from "react-router";
const cardImage = "";

interface DemoMainAppScreenProps {
  onTap?: () => void;
}

export function DemoMainAppScreen({ onTap }: DemoMainAppScreenProps) {
  const navigate = useNavigate();

  const handleSecondCardTap = () => {
    navigate("/app?autoplay=true");
  };

  return (
    <div 
      onClick={() => navigate("/top-cards")}
      className="w-full h-full bg-white relative overflow-hidden cursor-pointer"
    >
      {/* Main App Content */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white text-gray-900 px-4 py-3 pt-14 border-b border-gray-200">
          {/* Top Icons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Home className="w-5 h-5 text-gray-600" />
              <BookOpen className="w-5 h-5 text-gray-600" />
              <Star className="w-5 h-5 text-gray-600" />
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 text-xs font-bold">0</span>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search by keyword, topic, user, or ID..."
              className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 placeholder-gray-500"
              readOnly
              onClick={(e) => e.stopPropagation()}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Top nAnoCards Badge */}
          <div className="inline-block bg-black text-white px-3 py-1 rounded-md text-sm font-semibold">
            Top nAnoCards
          </div>
        </div>

        {/* Empty Feed Area */}
        <div className="flex-1 overflow-y-auto bg-white px-4 pt-4 -mt-2.5">
          <img 
            src={cardImage} 
            alt="Applied AI Leadership 01" 
            className="w-full scale-[1.12] origin-top cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              handleSecondCardTap();
            }}
          />
        </div>
      </div>
    </div>
  );
}