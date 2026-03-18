import {
  Heart, Info, Globe, Linkedin,
  MessageCircle, Youtube, Github, Share2, Camera,
  Mail, Link as LinkIcon, Edit3, Facebook,
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface UniversalCardProps {
  id: string;
  title: string;
  videoUrl?: string;
  videoTime?: string;
  likes: number;
  isLiked: boolean;
  onLike: () => void;
  cardNumber: string;
  informationText?: string;
  onEdit?: () => void;
  thumbnail?: string;
  qrCodeUrl?: string;
}

/**
 * UniversalCard - The standard nAnoCard format
 *
 * Design rules:
 * - 40 character title limit
 * - Red heart is the ONLY colored icon (text-red-500)
 * - All social/resource icons are gray line icons (text-gray-400, strokeWidth 1.5)
 * - No emojis, no filled icons, no colorful variants
 * - Clean white card with minimal borders
 */
export function UniversalCard({
  id,
  title,
  videoUrl,
  videoTime,
  likes,
  isLiked,
  onLike,
  cardNumber,
  informationText = "This is a sample training module designed to help you master key concepts. Complete the quiz below to test your knowledge and earn 10 points for each correct answer.",
  onEdit,
  thumbnail,
  qrCodeUrl: storedQrCodeUrl,
}: UniversalCardProps) {
  // Use stored deep link from backend if available, otherwise generate from current origin
  const cardUrl = storedQrCodeUrl || `${window.location.origin}/card/${id}`;
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setLinkCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handlePlayVideo = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsVideoPlaying(true);
      } catch (error) {
        console.error('Failed to play video:', error);
        toast.error('Failed to play video');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 w-full max-w-[620px] mx-auto">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {title.slice(0, 40)}
            </h3>
          </div>
          <div className="flex items-center ml-4">
            <button
              onClick={onLike}
              className={`p-2 rounded-lg transition-colors ${isLiked ? 'bg-red-100' : 'hover:bg-gray-50'}`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Video Area with QR Code */}
      <div className="relative w-full bg-gray-900" style={{ paddingBottom: '56.25%' }}>
        {thumbnail ? (
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={thumbnail}
            alt={title}
          />
        ) : videoUrl ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={`${videoUrl}#t=0.1`}
            preload="metadata"
            playsInline
            controls
            onEnded={() => setIsVideoPlaying(false)}
            onPlay={() => setIsVideoPlaying(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        {/* Play Button */}
        {!isVideoPlaying && (
          <button
            className="absolute inset-0 flex items-center justify-center"
            onClick={handlePlayVideo}
            aria-label="Play video"
          >
            <div className="w-14 h-14 bg-[#1e3a8a]/90 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent ml-1" />
            </div>
          </button>
        )}

        {/* QR Code - Top Right */}
        {!isVideoPlaying && (
          <div className="absolute top-3 right-3 bg-transparent rounded-xl p-2 shadow-lg">
            <QRCodeSVG value={cardUrl} size={80} level="M" includeMargin={false} />
          </div>
        )}

        {/* Duration - Bottom Right */}
        {videoTime && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-base font-bold">
            {videoTime}
          </div>
        )}
      </div>

      {/* Row 1 - Resource Icons (all gray, line only) */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="relative">
          <button
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            title="Information"
            onMouseEnter={() => setShowInfoPopup(true)}
            onMouseLeave={() => setShowInfoPopup(false)}
          >
            <Info className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
          </button>

          {/* Info Popup */}
          {showInfoPopup && (
            <div
              className="absolute bottom-full left-0 mb-2 z-50 pointer-events-none"
              style={{ minWidth: '280px', maxWidth: '340px' }}
            >
              <div className="relative px-5 py-4 bg-white text-gray-800 text-sm rounded-2xl shadow-xl border border-gray-200">
                <div className="text-gray-900 leading-relaxed break-words whitespace-pre-wrap">
                  {informationText}
                </div>
                <div className="absolute top-full left-8">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                    <path d="M12 12C12 12 4 4 0 0H24C20 4 12 12 12 12Z" fill="white" />
                    <path d="M12 12C12 12 4 4 0 0H24C20 4 12 12 12 12Z" stroke="#F3F4F6" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Social/Resource Icons - Right Side */}
        <div className="flex items-center space-x-4">
          {/* Share Button */}
          <button
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            title="Share"
            onClick={() => {
              navigator.clipboard.writeText(cardUrl);
              toast.success('Card link copied to clipboard!');
            }}
          >
            <Share2 className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </button>

          {/* Message Button (for direct link sharing) */}
          <a
            href={`mailto:?subject=Check out this nAnoCard&body=I found this nAnoCard interesting: ${cardUrl}`}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            title="Share via Email"
          >
            <Mail className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </a>

          {/* Facebook Share */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            title="Share on Facebook"
          >
            <Facebook className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </a>

          {/* LinkedIn Share */}
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(cardUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </a>

          {/* Twitter Share (via SMS as fallback) */}
          <a
            href={`sms:?body=Check out this nAnoCard: ${cardUrl}`}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            title="Share via SMS"
          >
            <MessageCircle className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </a>

          {/* YouTube Link (if videoUrl is present) */}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
              title="Watch on YouTube"
            >
              <Youtube className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </a>
          )}

          {/* GitHub Link (for developer cards) */}
          {id.startsWith('dev-') && (
            <a
              href={`https://github.com/${id.replace('dev-', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
              title="View on GitHub"
            >
              <Github className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </a>
          )}
        </div>
      </div>

      {/* Row 2 - Action Buttons */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Action buttons can be added here if needed */}
        </div>
        <div className="flex items-center space-x-2">
          {/* Card Number and Edit Pencil - Other Corner */}
          <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
            #{cardNumber}
          </span>
          <button
            onClick={onEdit}
            className="text-gray-600 hover:text-gray-800 p-2 rounded hover:bg-gray-50 transition-colors"
            title="Edit Card"
          >
            <Edit3 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}