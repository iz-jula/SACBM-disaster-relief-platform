import { Plus, Trash2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  getRequests,
  updateRequest,
  deleteRequest,
} from "@/services/requestsService";
import { RelieRequest } from "@/services/supabaseService";
import { Lock, AlertCircle } from "lucide-react";

function getStatusStyles(status: boolean) {
  return status
    ? "bg-green-100 text-green-700 border border-green-300"
    : "bg-blue-100 text-blue-700 border border-blue-300";
}

function getStatusLabel(status: boolean) {
  return status ? "✓ Met" : "⏳ Pending";
}

function RequestsTable({
  requests,
  onStatusChange,
  selectedRequests,
  onToggleSelect,
}: {
  requests: RelieRequest[];
  onStatusChange: (id: number, newStatus: boolean) => void;
  selectedRequests: Set<number>;
  onToggleSelect: (id: number) => void;
}) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                #Ref
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Originator
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Help Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Evacuation Type
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                People
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                Value (MZN)
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr
                key={request.id}
                className={`border-b border-slate-200 transition-colors hover:bg-blue-50 cursor-pointer ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                }`}
              >
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRequests.has(request.id || 0)}
                    onChange={() => onToggleSelect(request.id || 0)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                  #{request.id}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {request.full_name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {request.email}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {request.originator}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {request.location}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {request.help_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {request.evacuation_type}
                </td>
                <td className="px-6 py-4 text-sm text-center text-slate-900 font-medium">
                  {request.people}
                </td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-primary">
                  {parseInt(request.value || "0").toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(request.status)}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {requests.map((request) => (
          <div
            key={request.id}
            className="px-6 py-6 hover:bg-blue-50 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Full Name
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-1 break-words">
                    {request.full_name}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex-shrink-0 ${getStatusStyles(request.status)}`}
                >
                  {getStatusLabel(request.status)}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Email
                </p>
                <p className="text-sm text-slate-700 mt-1 break-words">
                  {request.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Originator
                </p>
                <p className="text-sm text-slate-700 mt-1 break-words">
                  {request.originator}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm text-slate-700 mt-1 break-words">
                  {request.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Help Type
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                    {request.help_type}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Evacuation Type
                </p>
                <p className="text-sm text-slate-700 mt-1 break-words">
                  {request.evacuation_type}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    People
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {request.people}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Value (MZN)
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {parseInt(request.value || "0").toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <input
                  type="checkbox"
                  checked={selectedRequests.has(request.id || 0)}
                  onChange={() => onToggleSelect(request.id || 0)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600">
                  Select for actions
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RelieRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(
    new Set(),
  );
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    type: "resolve" | "pending" | "delete";
  } | null>(null);

  // Load requests on mount
  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const data = await getRequests();
        setRequests(data);
      } catch (error) {
        console.error("Error loading requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  const toggleSelectRequest = (id: number) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  const handleResolveSelected = () => {
    setPendingAction({ type: "resolve" });
    setShowAuthModal(true);
    setAuthPassword("");
    setAuthError("");
  };

  const handleReturnToPending = () => {
    setPendingAction({ type: "pending" });
    setShowAuthModal(true);
    setAuthPassword("");
    setAuthError("");
  };

  const handleDeleteSelected = () => {
    if (
      !window.confirm(
        `Delete ${selectedRequests.size} request(s)? This cannot be undone.`,
      )
    ) {
      return;
    }
    setPendingAction({ type: "delete" });
    setShowAuthModal(true);
    setAuthPassword("");
    setAuthError("");
  };

  const verifyAuthAndExecute = async () => {
    const adminPassword = "vilankulos2025";
    const isAdmin = authPassword === adminPassword;

    // For non-admin, check if password matches any of the selected requests' originator names
    if (!isAdmin && selectedRequests.size > 0) {
      const firstRequest = requests.find(
        (r) => r.id === Array.from(selectedRequests)[0],
      );
      if (firstRequest && authPassword !== firstRequest.full_name) {
        setAuthError(
          "Invalid password. Use the originator's full name or admin password.",
        );
        return;
      }
    } else if (!isAdmin) {
      setAuthError("Invalid password");
      return;
    }

    // Execute pending action
    try {
      if (pendingAction?.type === "resolve") {
        for (const id of selectedRequests) {
          await updateRequest(id, { status: true });
        }
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            selectedRequests.has(req.id!) ? { ...req, status: true } : req,
          ),
        );
      } else if (pendingAction?.type === "pending") {
        for (const id of selectedRequests) {
          await updateRequest(id, { status: false });
        }
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            selectedRequests.has(req.id!) ? { ...req, status: false } : req,
          ),
        );
      } else if (pendingAction?.type === "delete") {
        for (const id of selectedRequests) {
          await deleteRequest(id);
        }
        setRequests((prevRequests) =>
          prevRequests.filter((req) => !selectedRequests.has(req.id!)),
        );
      }

      setSelectedRequests(new Set());
      setShowActionDropdown(false);
      setShowAuthModal(false);
      setAuthPassword("");
      setPendingAction(null);
    } catch (error) {
      setAuthError("Action failed. Please try again.");
      console.error("Error executing action:", error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: boolean) => {
    try {
      const updatedRequest = await updateRequest(id, { status: newStatus });
      if (updatedRequest) {
        // Update the requests list with the new status
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === id ? { ...req, status: newStatus } : req,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  // Group and sort requests
  const pendingRequests = requests.filter((r) => r.status === false);
  const metRequests = requests.filter((r) => r.status === true);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Relief Requests
            </h1>
            <p className="text-slate-600 mt-1">
              Manage all disaster relief requests
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>

            {/* Action Dropdown */}
            {selectedRequests.size > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowActionDropdown(!showActionDropdown)}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Actions ({selectedRequests.size})
                  <ChevronDown size={18} />
                </button>

                {showActionDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                    <button
                      onClick={handleResolveSelected}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 text-slate-900 font-medium transition-colors border-b border-slate-200"
                    >
                      ✓ Resolved
                    </button>
                    <button
                      onClick={handleReturnToPending}
                      className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-slate-900 font-medium transition-colors border-b border-slate-200"
                    >
                      ⏳ Return to Pending
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-700 font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate("/upload")}
              className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              New Request
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-600">Loading requests...</p>
          </div>
        )}

        {/* Pending Requests Section */}
        {!isLoading && pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-xl font-bold text-slate-900">
                ⏳ Pending Requests ({pendingRequests.length})
              </h2>
            </div>
            <RequestsTable
              requests={pendingRequests}
              onStatusChange={handleStatusChange}
              selectedRequests={selectedRequests}
              onToggleSelect={toggleSelectRequest}
            />
          </div>
        )}

        {/* Completed Requests Section */}
        {metRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-green-100">
              <h2 className="text-xl font-bold text-slate-900">
                ✓ Completed Requests ({metRequests.length})
              </h2>
            </div>
            <RequestsTable
              requests={metRequests}
              onStatusChange={handleStatusChange}
              selectedRequests={selectedRequests}
              onToggleSelect={toggleSelectRequest}
            />
          </div>
        )}

        {requests.length === 0 && !isLoading && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-6 py-12 text-center">
            <p className="text-slate-500 text-lg">No relief requests yet.</p>
            <p className="text-slate-400 mt-2">
              Click "New Request" to add your first relief request.
            </p>
          </div>
        )}

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock size={28} className="text-primary" />
                <h3 className="text-2xl font-bold text-slate-900">
                  Authorization Required
                </h3>
              </div>

              <p className="text-slate-600 mb-6 text-sm">
                {pendingAction?.type === "delete"
                  ? "Confirm deletion of selected requests"
                  : pendingAction?.type === "pending"
                    ? "Return selected requests to pending status"
                    : "Mark selected requests as resolved"}
              </p>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle
                    size={18}
                    className="text-red-600 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-800">{authError}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  {selectedRequests.size === 1 &&
                  requests.some((r) => r.id === Array.from(selectedRequests)[0])
                    ? `Originator's Full Name or Admin Password`
                    : "Admin Password"}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => {
                    setAuthPassword(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      verifyAuthAndExecute();
                    }
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Use the originator's full name or enter the admin password
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthPassword("");
                    setAuthError("");
                    setPendingAction(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyAuthAndExecute}
                  disabled={!authPassword}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
