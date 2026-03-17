import { useNavigate } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a8a] to-[#0a0e2a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-8xl font-bold text-white/10 mb-2">404</h1>

        <h2 className="text-2xl font-bold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-white/50 text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/app')}
            className="w-full h-12 bg-white text-[#1e3a8a] hover:bg-white/90 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-5 h-5" strokeWidth={1.5} />
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full h-12 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
