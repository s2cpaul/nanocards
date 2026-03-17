import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error("[Route Error]:", error);

  let errorMessage = "An unexpected error occurred";
  let isNotFound = false;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || errorMessage;
    isNotFound = error.status === 404;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a8a] to-[#0a0e2a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-white/70" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-white/60 mb-2 text-sm">{errorMessage}</p>

        {isNotFound && (
          <p className="text-white/40 text-sm mb-6">
            The page you are looking for does not exist.
          </p>
        )}

        <div className="space-y-3 mt-6">
          <button
            onClick={() => {
              try { navigate('/'); }
              catch { window.location.href = '/'; }
            }}
            className="w-full h-12 bg-white text-[#1e3a8a] hover:bg-white/90 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-5 h-5" strokeWidth={1.5} />
            Go Home
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full h-12 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
