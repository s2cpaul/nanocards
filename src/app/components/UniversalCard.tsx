import {
  Heart, Download, Info, FileText, Globe, Linkedin,
  MessageCircle, Youtube, Github, Share2, Camera,
  Mail, Link as LinkIcon, Edit3, Facebook,
  Check, X,
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

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
  onSave?: (data: { title: string; informationText?: string }) => void;
  thumbnail?: string;
  qrCodeUrl?: string;
  isEditing?: boolean;
  onToggleEdit?: () => void;
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
  onSave,
  thumbnail,
  qrCodeUrl: storedQrCodeUrl,
  isEditing = false,
  onToggleEdit,
}: UniversalCardProps) {
  // Use stored deep link from backend if available, otherwise generate from current origin
  const cardUrl = storedQrCodeUrl || `${window.location.origin}/card/${id}`;
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editInformation, setEditInformation] = useState(informationText);
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
      {/* Title - 40 char limit enforced */}
      <div className="px-6 py-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label htmlFor={`edit-title-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id={`edit-title-${id}`}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={40}
                placeholder="Enter card title"
              />
            </div>
            <div>
              <label htmlFor={`edit-info-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Information
              </label>
              <textarea
                id={`edit-info-${id}`}
                value={editInformation}
                onChange={(e) => setEditInformation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Enter information text"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditTitle(title);
                  setEditInformation(informationText);
                  onToggleEdit?.();
                }}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onSave) {
                    onSave({ title: editTitle, informationText: editInformation });
                  }
                  onToggleEdit?.();
                }}
                className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {title.slice(0, 40)}
          </h3>
        )}
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
            muted
            playsInline
            onEnded={() => setIsVideoPlaying(false)}
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
        <button
          onClick={async () => {
            try {
              // Create PDF with QR code and title
              const pdf = new jsPDF();
              
              // Add title
              pdf.setFontSize(20);
              pdf.text(title.slice(0, 40), 20, 30);
              
              // Add QR code as image
              const qrCanvas = document.createElement('canvas');
              const qrSize = 150;
              qrCanvas.width = qrSize;
              qrCanvas.height = qrSize;
              const qrCtx = qrCanvas.getContext('2d');
              
              if (qrCtx) {
                // Fill white background
                qrCtx.fillStyle = 'white';
                qrCtx.fillRect(0, 0, qrSize, qrSize);
                
                // Create QR code SVG and convert to canvas
                const qrSvg = document.querySelector('.absolute.top-3.right-3 svg');
                if (qrSvg) {
                  const svgData = new XMLSerializer().serializeToString(qrSvg);
                  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                  const svgUrl = URL.createObjectURL(svgBlob);
                  
                  const img = new Image();
                  img.onload = () => {
                    qrCtx.drawImage(img, 0, 0, qrSize, qrSize);
                    const qrDataUrl = qrCanvas.toDataURL('image/png');
                    
                    // Add QR code to PDF
                    pdf.addImage(qrDataUrl, 'PNG', 20, 50, 80, 80);
                    
                    // Add card URL below QR code
                    pdf.setFontSize(10);
                    pdf.text(`Card URL: ${cardUrl}`, 20, 150);
                    
                    // Save PDF
                    pdf.save(`nAnoCard-${id}.pdf`);
                    URL.revokeObjectURL(svgUrl);
                    toast.success('PDF downloaded!');
                  };
                  img.src = svgUrl;
                }
              }
            } catch (error) {
              console.error('Error generating PDF:', error);
              toast.error('Failed to generate PDF');
            }
          }}
          className="absolute top-3 right-3 bg-white rounded-xl p-2 shadow-lg hover:bg-gray-50 transition-colors"
          title="Download PDF with QR Code"
        >
          <QRCodeSVG value={cardUrl} size={80} level="M" includeMargin={false} />
        </button>

        {/* Download Button */}
        <button
          onClick={async () => {
            try {
              // Create PDF with QR code and title
              const pdf = new jsPDF();
              
              // Add title
              pdf.setFontSize(20);
              pdf.text(title.slice(0, 40), 20, 30);
              
              // Add QR code as image
              const qrCanvas = document.createElement('canvas');
              const qrSize = 150;
              qrCanvas.width = qrSize;
              qrCanvas.height = qrSize;
              const qrCtx = qrCanvas.getContext('2d');
              
              if (qrCtx) {
                // Fill white background
                qrCtx.fillStyle = 'white';
                qrCtx.fillRect(0, 0, qrSize, qrSize);
                
                // Create QR code SVG and convert to canvas
                const qrSvg = document.querySelector('.absolute.top-3.right-3 svg');
                if (qrSvg) {
                  const svgData = new XMLSerializer().serializeToString(qrSvg);
                  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                  const svgUrl = URL.createObjectURL(svgBlob);
                  
                  const img = new Image();
                  img.onload = () => {
                    qrCtx.drawImage(img, 0, 0, qrSize, qrSize);
                    const qrDataUrl = qrCanvas.toDataURL('image/png');
                    
                    // Add QR code to PDF
                    pdf.addImage(qrDataUrl, 'PNG', 20, 50, 80, 80);
                    
                    // Add card URL below QR code
                    pdf.setFontSize(10);
                    pdf.text(`Card URL: ${cardUrl}`, 20, 150);
                    
                    // Save PDF
                    pdf.save(`nAnoCard-${id}.pdf`);
                    URL.revokeObjectURL(svgUrl);
                    toast.success('PDF downloaded!');
                  };
                  img.src = svgUrl;
                }
              }
            } catch (error) {
              console.error('Error generating PDF:', error);
              toast.error('Failed to generate PDF');
            }
          }}
          className="absolute top-[108px] right-3 bg-white rounded-xl p-2.5 shadow-lg hover:bg-gray-50 transition-colors"
          title="Download PDF with QR Code"
        >
          <Download className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
        </button>

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
                    <path d="M12 12C12 12 4 4 0 0H24C20 4 12 12 12 12Z" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="Document">
          <FileText className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="Website">
          <Globe className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="LinkedIn">
          <Linkedin className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="Discord">
          <MessageCircle className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="YouTube">
          <Youtube className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="GitHub">
          <Github className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="Facebook">
          <Facebook className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* Row 2 - Share, Camera, Email, Link, Heart (RED), Card# */}
      <div className="px-6 py-4 flex items-center justify-between">
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="Share">
          <Share2 className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="Camera">
          <Camera className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors" title="Email">
          <Mail className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>
        <button
          className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors relative"
          title={linkCopied ? "Copied" : "Copy Link"}
          onClick={handleCopyLink}
        >
          <LinkIcon className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </button>

        {/* Heart - THE ONLY COLORED ICON (red) */}
        <button
          onClick={onLike}
          className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
        >
          <Heart
            className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-red-500'}`}
            strokeWidth={1.5}
          />
          <span className="text-gray-900 font-bold text-lg">{likes}</span>
        </button>

        {/* Card number + edit pencil (ALWAYS VISIBLE) */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-gray-600 font-semibold text-base">#{cardNumber}</span>
          <button
            onClick={onToggleEdit || onEdit || (() => toast.error('You must be logged in to edit cards'))}
            className="p-0.5 rounded hover:bg-gray-100 transition-colors"
            title="Edit Card"
          >
            <Edit3 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}