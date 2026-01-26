import { useState } from "react";
import { Cloud, LogOut, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function GoogleConnector() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a production environment, this would use the Google OAuth flow
      // For now, simulating the OAuth connection
      
      // This is where you would implement actual Google OAuth:
      // 1. Load Google API library
      // 2. Initialize Google Sign-In
      // 3. Handle the sign-in callback
      // 4. Get access tokens for Drive/Docs
      
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful connection
      setIsConnected(true);
      setUserEmail("user@gmail.com");
    } catch (err) {
      setError("Failed to connect to Google. Please try again.");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUserEmail(null);
    setError(null);
  };

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

      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <div className="p-4 rounded-lg border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Connection Status</p>
              <p className="text-sm text-slate-600 mt-1">
                {isConnected ? `Connected as ${userEmail}` : "Not connected"}
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
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <Cloud size={18} />
                Connect with Google Account
              </>
            )}
          </button>
        ) : (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Google account connected</p>
                <p className="text-sm text-green-700 mt-1">You can now sync data with Google Drive and Docs</p>
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
            <h4 className="font-semibold text-slate-900">Available Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                <p className="font-medium text-slate-900 text-sm">Export to Google Sheets</p>
                <p className="text-xs text-slate-600 mt-1">Save relief requests as spreadsheets</p>
              </button>
              <button className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                <p className="font-medium text-slate-900 text-sm">Create from Google Sheets</p>
                <p className="text-xs text-slate-600 mt-1">Import data from your Drive</p>
              </button>
              <button className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                <p className="font-medium text-slate-900 text-sm">Share Google Docs</p>
                <p className="text-xs text-slate-600 mt-1">Collaborate on reports</p>
              </button>
              <button className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                <p className="font-medium text-slate-900 text-sm">Auto-Sync Data</p>
                <p className="text-xs text-slate-600 mt-1">Keep files updated automatically</p>
              </button>
            </div>
          </div>
        )}

        {/* Setup Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">1.</span>
              <span>Click "Connect with Google Account" above</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">2.</span>
              <span>Sign in with your Google account</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">3.</span>
              <span>Grant access to Google Drive and Docs</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold flex-shrink-0">4.</span>
              <span>Start syncing relief request data</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
