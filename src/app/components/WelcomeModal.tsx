import { X, Check } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

/**
 * WelcomeModal - Clean design, line icons only, no emojis
 */
export function WelcomeModal({ isOpen, onClose, onGetStarted }: WelcomeModalProps) {
  if (!isOpen) return null;

  const features = [
    "2-minute video pitches with auto-generated QR codes",
    "Interactive quizzes and surveys for engagement",
    "Track likes and gather audience feedback",
    "Connect with social links and direct calls-to-action",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 mt-2">
          Welcome to nAnoCards
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Create mini pitch cards for your AI products in just a few steps. Share them anywhere with auto-generated QR codes.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-gray-700 text-sm">{feature}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onGetStarted}
          className="w-full h-12 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-xl text-base font-semibold transition-colors"
        >
          Show me how
        </button>
      </div>
    </div>
  );
}
