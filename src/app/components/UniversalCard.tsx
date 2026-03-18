import {
  Heart, Download, Info, FileText, Globe, Linkedin,
  MessageCircle, Youtube, Github, Share2, Camera,
  Mail, Link as LinkIcon, Edit3, Facebook,
  Check, X,
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef, useEffect } from 'react';
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
  // onSave now accepts a full card payload
  onSave?: (data: any) => void;
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
  const [editObjective, setEditObjective] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState(videoUrl || '');
  const [editVideoTime, setEditVideoTime] = useState(videoTime || '');
  const [editThumbnail, setEditThumbnail] = useState(thumbnail || '');
  const [editStage, setEditStage] = useState('');
  const [editCategory, setEditCategory] = useState('Business');
  const [editInsights, setEditInsights] = useState<any>({
    linkedin: '',
    discord: '',
    notion: '',
    youtube: '',
    github: '',
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleFontSizePx, setTitleFontSizePx] = useState<number>(20); // starting px size

  // map sizes to Tailwind arbitrary text-size classes (explicit literals so purge picks them up)
  const FONT_CLASS_BY_SIZE: Record<number, string> = {
    20: 'text-[20px]',
    19: 'text-[19px]',
    18: 'text-[18px]',
    17: 'text-[17px]',
    16: 'text-[16px]',
    15: 'text-[15px]',
    14: 'text-[14px]',
    13: 'text-[13px]',
    12: 'text-[12px]',
  };
  const clampedTitleSize = Math.max(12, Math.min(20, Math.round(titleFontSizePx)));
  const titleSizeClass = FONT_CLASS_BY_SIZE[clampedTitleSize] || 'text-[16px]';

  // NEW: parsed total seconds and remaining countdown state
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const parseVideoTime = (t?: string): number | null => {
    if (!t) return null;
    const parts = t.split(':').map((p) => parseInt(p.trim(), 10));
    if (parts.some(isNaN)) return null;
    let secs = 0;
    if (parts.length === 2) {
      secs = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      return null;
    }
    return secs;
  };

  const formatSeconds = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(1, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Keep totalSeconds in sync with prop
  useEffect(() => {
    const tot = parseVideoTime(videoTime);
    setTotalSeconds(tot);
    setRemainingSeconds(null);
  }, [videoTime]);

  // Countdown effect: poll video currentTime while playing and update remainingSeconds
  useEffect(() => {
    let timer: number | undefined;
    if (isVideoPlaying && totalSeconds != null) {
      const tick = () => {
        const cur = videoRef.current?.currentTime || 0;
        const rem = Math.max(totalSeconds - Math.floor(cur), 0);
        setRemainingSeconds(rem);
        if (rem <= 0) {
          // ensure UI resets when video completes
          setIsVideoPlaying(false);
        }
      };
      tick();
      timer = window.setInterval(tick, 500);
    } else {
      // Not playing: clear shown countdown so we display the original videoTime
      setRemainingSeconds(null);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isVideoPlaying, totalSeconds]);

  // Ensure title fits on a single line by reducing font-size until it fits (within limits)
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const fit = () => {
      // Detect mobile breakpoint (Tailwind 'sm'/'md' boundaries) and adjust sizes
      const isMobile = window.matchMedia('(max-width: 640px)').matches;

      // start from a sensible base and shrink until fits or min reached
      let size = isMobile ? 18 : 20; // start slightly smaller on mobile
      const minSize = isMobile ? 11 : 12; // allow smaller minimum on mobile

      // Force single-line rendering when fitting
      el.style.whiteSpace = 'nowrap';
      el.style.overflow = 'hidden';
      el.style.textOverflow = 'ellipsis';
      el.style.display = 'block';
      el.style.fontWeight = '700';

      // Apply initial size and measure against available width (parent width)
      el.style.fontSize = `${size}px`;
      const parent = el.parentElement || el;
      const availableWidth = parent.clientWidth;

      // Reduce font size until the title fits within available width or we hit minSize
      while (el.scrollWidth > availableWidth && size > minSize) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }

      setTitleFontSizePx(size);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement || el);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [title, isEditing]);

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
          // Scrollable quick-edit form contained inside the card
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter card title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value.slice(0, 40))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={40}
                placeholder="Enter card title"
              />
              <p className="text-xs text-gray-500 mt-1">{editTitle.length}/40 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter card objective</label>
              <textarea
                value={editObjective}
                onChange={(e) => setEditObjective(e.target.value.slice(0, 256))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Enter objective"
              />
              <p className="text-xs text-gray-500 mt-1">{editObjective.length}/256 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
              <input
                type="url"
                value={editVideoUrl}
                onChange={(e) => setEditVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Time</label>
              <input
                type="text"
                value={editVideoTime}
                onChange={(e) => setEditVideoTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="1:59 or 2:00 (mm:ss)"
              />
              <p className="text-xs text-gray-500 mt-1">Videos must be 2 minutes (120 seconds) or less</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={editThumbnail}
                onChange={(e) => setEditThumbnail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select stage</label>
              <select value={editStage} onChange={(e) => setEditStage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" title="Select stage">
                <option value="">Select stage</option>
                <option value="early">Early</option>
                <option value="mid">Mid</option>
                <option value="late">Late</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (choose one)</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" title="Select category">
                <option value="Business">Business (Required)</option>
                <option value="Training">Training (Pro/Enterprise only)</option>
                <option value="Personal">Personal</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">1 selected</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Information (hover info text)</label>
              <textarea
                value={editInformation}
                onChange={(e) => setEditInformation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                rows={3}
                placeholder="Text that appears when users hover the info icon..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Links</label>
              <input type="url" value={editInsights.linkedin} onChange={(e) => setEditInsights({...editInsights, linkedin: e.target.value})} placeholder="https://linkedin.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="url" value={editInsights.discord} onChange={(e) => setEditInsights({...editInsights, discord: e.target.value})} placeholder="https://discord.gg/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="url" value={editInsights.notion} onChange={(e) => setEditInsights({...editInsights, notion: e.target.value})} placeholder="https://notion.so/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="url" value={editInsights.youtube} onChange={(e) => setEditInsights({...editInsights, youtube: e.target.value})} placeholder="https://youtube.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="url" value={editInsights.github} onChange={(e) => setEditInsights({...editInsights, github: e.target.value})} placeholder="https://github.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  // Revert edits
                  setEditTitle(title);
                  setEditInformation(informationText);
                  setEditObjective('');
                  setEditVideoUrl(videoUrl || '');
                  setEditVideoTime(videoTime || '');
                  setEditThumbnail(thumbnail || '');
                  setEditStage('');
                  setEditCategory('Business');
                  setEditInsights({ linkedin: '', discord: '', notion: '', youtube: '', github: '' });
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
                    onSave({
                      title: editTitle,
                      objective: editObjective,
                      information: editInformation,
                      videoUrl: editVideoUrl,
                      videoTime: editVideoTime,
                      thumbnailUrl: editThumbnail,
                      stage: editStage,
                      category: editCategory,
                      insights: editInsights,
                    });
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
          <h3
            ref={titleRef}
            className={`text-gray-900 ${titleSizeClass} leading-none font-bold truncate whitespace-nowrap`}
            // font size controlled via state to ensure single-line fit (mapped to Tailwind classes to avoid inline styles)
            title={title}
          >
            {title}
          </h3>
        )}
      </div>

      {/* Video Area with QR Code */}
      <div className="relative w-full bg-gray-900 pb-[56.25%]">
        {thumbnail ? (
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={thumbnail}
            alt={title}
          />
        ) : videoUrl ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-0"
            src={`${videoUrl}#t=0.1`}
            preload="metadata"
            playsInline
            onEnded={() => setIsVideoPlaying(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        {/* Play Button */}
        {!isVideoPlaying && (
          <button
            className="absolute inset-0 flex items-center justify-center z-20"
            onClick={handlePlayVideo}
            aria-label="Play video"
          >
            <div className="w-14 h-14 bg-[#1e3a8a]/90 rounded-full flex items-center justify-center shadow-lg z-20">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent ml-1" />
            </div>
          </button>
        )}

        {/* QR Code - Top Right */}
        <button
          id={`qr-svg-${id}`}
          onClick={async () => {
            try {
              // Create PDF with QR code and title - 8x10 format
              const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: [8, 10]
              });

              const pageWidth = 8;
              const marginTop = 0.5; // inches
              const baseFontSize = 12; // uniform size for all text

              // nAnoCard label (bold)
              pdf.setFontSize(baseFontSize);
              pdf.setFont('helvetica', 'bold');
              const label = 'nAnoCard';
              const labelWidth = pdf.getTextWidth(label);
              const labelX = (pageWidth - labelWidth / 72) / 2; // center
              pdf.text(label, labelX * 72, marginTop * 72);

              // Title (normal, same size)
              pdf.setFont('helvetica', 'normal');
              const cardTitle = title.slice(0, 40);
              const titleWidth = pdf.getTextWidth(cardTitle);
              const titleX = (pageWidth - titleWidth / 72) / 2;
              pdf.text(cardTitle, titleX * 72, (marginTop + 0.25) * 72);

              // Information text (same font size)
              const infoText = informationText || '';
              const infoY = (marginTop + 0.55) * 72;
              // Wrap information text to page width with a small inset
              const infoMaxWidthPts = (pageWidth - 1) * 72; // 0.5in margin on each side
              const infoLines = pdf.splitTextToSize(infoText, infoMaxWidthPts);
              pdf.text(infoLines, 0.5 * 72, infoY);

              // Contact email (same font size)
              const contactLine = 'Contact: contact@nanocards.now';
              const contactWidth = pdf.getTextWidth(contactLine);
              const contactX = (pageWidth - contactWidth / 72) / 2;
              pdf.text(contactLine, contactX * 72, (marginTop + 1.15) * 72);

              // Add QR code as image - 15% smaller than previous (use inches)
              const qrCanvas = document.createElement('canvas');
              const qrSizePx = Math.round(150 * 0.85); // smaller pixel size
              qrCanvas.width = qrSizePx;
              qrCanvas.height = qrSizePx;
              const qrCtx = qrCanvas.getContext('2d');

              if (qrCtx) {
                // Fill white background
                qrCtx.fillStyle = 'white';
                qrCtx.fillRect(0, 0, qrSizePx, qrSizePx);

                // Create QR code SVG and convert to canvas
                const qrButton = document.getElementById(`qr-svg-${id}`);
                const qrSvg = qrButton ? qrButton.querySelector('svg') : null;
                if (qrSvg) {
                  const svgData = new XMLSerializer().serializeToString(qrSvg);
                  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                  const svgUrl = URL.createObjectURL(svgBlob);

                  const img = new Image();
                  img.onload = () => {
                    qrCtx.drawImage(img, 0, 0, qrSizePx, qrSizePx);
                    const qrDataUrl = qrCanvas.toDataURL('image/png');

                    // Add QR code to PDF - centered below the text
                    const qrWidthIn = 2.5 * 0.85; // 15% smaller than 2.5in
                    const qrHeightIn = qrWidthIn;
                    const qrX = (pageWidth - qrWidthIn) / 2;
                    const qrY = 2; // start ~2 inches from top to allow text above
                    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrWidthIn, qrHeightIn);

                    // Add card URL below QR code - centered
                    pdf.setFontSize(baseFontSize);
                    pdf.setFont('helvetica', 'normal');
                    const urlText = `Card URL: ${cardUrl}`;
                    const urlWidth = pdf.getTextWidth(urlText);
                    const urlX = (pageWidth - urlWidth / 72) / 2; // Center horizontally
                    pdf.text(urlText, urlX * 72, (qrY + qrHeightIn + 0.3) * 72); // 0.3 inches below QR code

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
          className="absolute -top-[14px] right-3 bg-white rounded-xl p-2 shadow-lg hover:bg-gray-50 transition-colors z-0"
          title="Download PDF with QR Code"
        >
          <QRCodeSVG value={cardUrl} size={80} level="M" includeMargin={false} />
        </button>

        {/* Download Button */}
        <button
          onClick={async () => {
            try {
              // Create PDF with QR code and title in inches
              const pdf = new jsPDF({ unit: 'in', format: [8, 10] });
              const pageWidth = 8;
              const marginTop = 0.5;
              const baseFontSize = 12;

              // nAnoCard label (bold)
              pdf.setFontSize(baseFontSize);
              pdf.setFont('helvetica', 'bold');
              const label = 'nAnoCard';
              const labelWidth = pdf.getTextWidth(label);
              const labelX = (pageWidth - labelWidth / 72) / 2;
              pdf.text(label, labelX * 72, marginTop * 72);

              // Title (normal)
              pdf.setFont('helvetica', 'normal');
              const cardTitle = title.slice(0, 40);
              const titleWidth = pdf.getTextWidth(cardTitle);
              const titleX = (pageWidth - titleWidth / 72) / 2;
              pdf.text(cardTitle, titleX * 72, (marginTop + 0.25) * 72);

              // Information text
              const infoText = informationText || '';
              const infoY = (marginTop + 0.55) * 72;
              const infoMaxWidthPts = (pageWidth - 1) * 72;
              const infoLines = pdf.splitTextToSize(infoText, infoMaxWidthPts);
              pdf.text(infoLines, 0.5 * 72, infoY);

              // Contact email
              const contactLine = 'Contact: contact@nanocards.now';
              const contactWidth = pdf.getTextWidth(contactLine);
              const contactX = (pageWidth - contactWidth / 72) / 2;
              pdf.text(contactLine, contactX * 72, (marginTop + 1.15) * 72);

              // Add QR code image (smaller)
              const qrCanvas = document.createElement('canvas');
              const qrSizePx = Math.round(150 * 0.85);
              qrCanvas.width = qrSizePx;
              qrCanvas.height = qrSizePx;
              const qrCtx = qrCanvas.getContext('2d');

              if (qrCtx) {
                qrCtx.fillStyle = 'white';
                qrCtx.fillRect(0, 0, qrSizePx, qrSizePx);

                const qrButton = document.getElementById(`qr-svg-${id}`);
                const qrSvg = qrButton ? qrButton.querySelector('svg') : null;
                if (qrSvg) {
                  const svgData = new XMLSerializer().serializeToString(qrSvg);
                  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                  const svgUrl = URL.createObjectURL(svgBlob);

                  const img = new Image();
                  img.onload = () => {
                    qrCtx.drawImage(img, 0, 0, qrSizePx, qrSizePx);
                    const qrDataUrl = qrCanvas.toDataURL('image/png');

                    const qrWidthIn = 2.5 * 0.85;
                    const qrHeightIn = qrWidthIn;
                    const qrX = (pageWidth - qrWidthIn) / 2;
                    const qrY = 2;
                    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrWidthIn, qrHeightIn);

                    // Card URL below QR code
                    pdf.setFontSize(baseFontSize);
                    pdf.setFont('helvetica', 'normal');
                    const urlText = `Card URL: ${cardUrl}`;
                    const urlWidth = pdf.getTextWidth(urlText);
                    const urlX = (pageWidth - urlWidth / 72) / 2;
                    pdf.text(urlText, urlX * 72, (qrY + qrHeightIn + 0.3) * 72);

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
          className="absolute top-[70px] right-3 -translate-y-1 bg-white rounded-xl p-2.5 shadow-lg hover:bg-gray-50 transition-colors z-0"
          title="Download PDF with QR Code"
        >
          <Download className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
        </button>

        {/* Duration - Bottom Right: show countdown while playing, otherwise show provided video time */}
        {(videoTime || remainingSeconds !== null) && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold z-30">
            {remainingSeconds !== null && isVideoPlaying ? formatSeconds(remainingSeconds) : videoTime}
          </div>
        )}

        {/* Countdown - Bottom Right (overlapping duration) */}
        {isVideoPlaying && remainingSeconds !== null && (
          <div className="absolute bottom-2 right-2 -mr-1 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold z-30">
            {formatSeconds(remainingSeconds)}
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
              className="absolute bottom-full left-0 mb-2 z-50 pointer-events-none min-w-[280px] max-w-[340px]"
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
          onClick={handleCopyLink}
          className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none"
          title={linkCopied ? "Copied to clipboard" : "Copy link"}
          aria-label={linkCopied ? "Link copied" : "Copy link"}
          aria-pressed={linkCopied ? 'true' : 'false'}
        >
          <LinkIcon
            className={`w-6 h-6 transition-colors ${linkCopied ? 'text-blue-400' : 'text-gray-400'} hover:text-blue-400`}
            strokeWidth={1.5}
          />
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