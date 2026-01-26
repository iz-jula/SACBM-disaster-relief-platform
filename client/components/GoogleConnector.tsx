import { useState, useEffect } from "react";
import { Cloud, LogOut, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { signInWithGoogle, signOutGoogle, getStoredGoogleUser, saveGoogleUser, clearStoredGoogleUser, GoogleUser } from "@/services/googleService";

export default function GoogleConnector() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already stored
    const storedUser = getStoredGoogleUser();
    if (storedUser) {
      setUser(storedUser);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    if (isConnected || isLoading) return;

    // Initialize Google Sign-In button when component mounts and user is not connected
    const initializeGoogle = async () => {
      try {
        await signInWithGoogle();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Google initialization error:', errorMsg);

        // Only set error if it's not a normal auth flow error
        if (!errorMsg.includes('Google button container not found')) {
          setError(errorMsg);
        }
      }
    };

    initializeGoogle();
  }, [isConnected, isLoading]);

  const handleDisconnect = () => {
    signOutGoogle();
    setIsConnected(false);
    setUser(null);
    setError(null);
    clearStoredGoogleUser();
  };

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <Cloud size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Google Drive & Docs</h3>
              <p className="text-sm text-slate-600">Connect to sync relief request data</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Setup Required:</strong> To enable Google OAuth, add your Google Client ID to your .env file:
              <code className="block mt-2 p-2 bg-white rounded text-xs font-mono border border-yellow-200">
                VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-3">
            <Cloud size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Google Drive & Docs</h3>
            <p className="text-sm text-slate-600">Connect to sync relief request data and calendar alerts</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <div className="p-4 rounded-lg border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Connection Status</p>
              <p className="text-sm text-slate-600 mt-1">
                {isConnected ? `Connected as ${user?.email}` : "Not connected"}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-slate-300"}`} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Connection Button */}
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 text-center">Click the Google button below to sign in:</p>
            {/* Google Sign-In button container - rendered by GSI library */}
            <div id="google-signin-button" className="flex justify-center"></div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader size={18} className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-600">Authenticating...</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Google account connected</p>
                <p className="text-sm text-green-700 mt-1">
                  {user?.name} ({user?.email})
                </p>
                <p className="text-xs text-green-600 mt-2">
                  ✓ Drive access enabled
                  <br />✓ Calendar alerts enabled
                  <br />✓ Sheets synchronization enabled
                </p>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Disconnect Google Account
            </button>
          </>
        )}

        {/* Features Available When Connected */}
        {isConnected && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900">Connected Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                <p className="font-medium text-slate-900 text-sm">✓ Google Drive</p>
                <p className="text-xs text-slate-600 mt-1">Export and import data</p>
              </div>
              <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                <p className="font-medium text-slate-900 text-sm">✓ Google Sheets</p>
                <p className="text-xs text-slate-600 mt-1">Sync spreadsheet data</p>
              </div>
              <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                <p className="font-medium text-slate-900 text-sm">✓ Google Docs</p>
                <p className="text-xs text-slate-600 mt-1">Collaborate on reports</p>
              </div>
              <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                <p className="font-medium text-slate-900 text-sm">✓ Google Calendar</p>
                <p className="text-xs text-slate-600 mt-1">Sync alerts and events</p>
              </div>
            </div>
          </div>
        )}

        {/* Setup Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">1.</span>
              <span>Click "Sign In with Google Account" to authenticate</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">2.</span>
              <span>Grant access to Google Drive, Sheets, Docs, and Calendar</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">3.</span>
              <span>Alerts from your Google Calendar will sync automatically</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">4.</span>
              <span>Export relief requests to your Google Drive</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
