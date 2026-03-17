import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4">
      <div className="bg-[#1e3a8a] rounded-2xl shadow-xl p-4 max-w-md mx-auto border border-blue-700">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-white/10 rounded-xl p-2 flex-shrink-0">
            <Download className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-white font-bold text-base mb-1">Install nAnoCards</h3>
            <p className="text-blue-200 text-xs mb-3">
              Get faster access and a native experience on your device.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-[#1e3a8a] hover:bg-white/90 font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white text-sm px-3 py-1.5 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
