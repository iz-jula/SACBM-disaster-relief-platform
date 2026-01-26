import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, Upload, Download, Link2, CheckCircle, AlertCircle, Loader } from "lucide-react";
import Layout from "@/components/Layout";

export default function DataRepository() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

  const handleConnectGoogleDrive = async () => {
    setIsLoading(true);
    try {
      // Simulated Google Drive API connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsConnected(true);
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncStatus("syncing");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      setSyncStatus("error");
    }
  };

  const handleExportData = async () => {
    setSyncStatus("syncing");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Simulate data export
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      setSyncStatus("error");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Data Repository</h1>
            <p className="text-slate-600 mt-1">Connect and sync data with Google Drive, Google Docs, and other repositories</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Status Indicator */}
        {syncStatus !== "idle" && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              syncStatus === "success"
                ? "bg-green-50 border border-green-200"
                : syncStatus === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
            }`}
          >
            {syncStatus === "syncing" && <Loader className="animate-spin text-blue-600" size={20} />}
            {syncStatus === "success" && <CheckCircle className="text-green-600" size={20} />}
            {syncStatus === "error" && <AlertCircle className="text-red-600" size={20} />}
            <p
              className={`font-medium ${
                syncStatus === "success"
                  ? "text-green-800"
                  : syncStatus === "error"
                    ? "text-red-800"
                    : "text-blue-800"
              }`}
            >
              {syncStatus === "syncing"
                ? "Syncing data..."
                : syncStatus === "success"
                  ? "Operation completed successfully"
                  : "An error occurred"}
            </p>
          </div>
        )}

        {/* Google Drive Connection */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4">
              <Cloud size={32} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Google Drive & Docs</h2>
              <p className="text-slate-600">Two-way synchronization with Google Drive</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Connection Status */}
            <div className="p-4 rounded-lg border-2 border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Connection Status</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {isConnected ? "Connected to Google Drive" : "Not connected"}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-slate-300"}`}
                />
              </div>
            </div>

            {/* Connection Button */}
            {!isConnected ? (
              <button
                onClick={handleConnectGoogleDrive}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 size={18} />
                    Connect Google Account
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CheckCircle size={18} />
                  Successfully connected to your Google Drive
                </p>
              </div>
            )}

            {/* Features Grid */}
            {isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export to Google Drive */}
                <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Upload size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Export to Google Drive</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Save relief requests as spreadsheets in your Google Drive
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={!isConnected}
                    className="w-full mt-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Export Now
                  </button>
                </div>

                {/* Import from Google Drive */}
                <div className="p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Download size={20} className="text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Import from Google Drive</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Load request data from spreadsheets in your Google Drive
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={!isConnected}
                    className="w-full mt-4 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Import Data
                  </button>
                </div>

                {/* Auto-Sync */}
                <div className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Cloud size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Auto-Sync</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Automatically synchronize data changes with Google Drive
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={!isConnected}
                    className="w-full mt-4 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Enable Sync
                  </button>
                </div>

                {/* Collaborative Editing */}
                <div className="p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <Link2 size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Collaborative Editing</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Share Google Docs links for team collaboration
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={!isConnected}
                    className="w-full mt-4 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Share Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Setup Instructions</h3>
          <ol className="space-y-3 text-blue-800 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 font-bold text-blue-600">1.</span>
              <span>Click "Connect Google Account" to authorize the SABCM app with your Google Drive</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 font-bold text-blue-600">2.</span>
              <span>Grant necessary permissions to read and write files to your Google Drive</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 font-bold text-blue-600">3.</span>
              <span>Use the export/import features to synchronize your relief request data</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 font-bold text-blue-600">4.</span>
              <span>Enable auto-sync to keep your data updated across the platform</span>
            </li>
          </ol>
        </div>

        {/* Supported Formats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Supported Data Types</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Relief Requests (CSV, XLSX)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Request Details (Google Sheets)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Status Reports (Google Docs)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Attachments (PDF, Images)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>User Access Logs</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Data Privacy & Security</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>End-to-end encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>OAuth 2.0 authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Automatic backup</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Version control</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Activity auditing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
