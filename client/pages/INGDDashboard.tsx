import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { getIngdRequests, createIngdCommitment, resolveIngdRequest, revertIngdToPending, getIngdDocuments, getIngdActiveSetting } from "@/services/supabaseService";
import type { IngdRequest, IngdDocument } from "@/services/supabaseService";
import { ChevronDown } from "lucide-react";
import { AlertCircle } from "lucide-react";

// Format numbers with . for thousands and , for decimals (European format)
const formatNumber = (value: number, decimals: number = 0): string => {
  const fixed = value.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');

  // Add thousands separator with dots
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Combine with comma as decimal separator
  return decimal ? `${withThousands},${decimal}` : withThousands;
};

// Extract item name and quantity from format like "Arroz (25Kg)"
const parseItem = (item: string): { name: string; quantity: string } => {
  const match = item?.match(/^(.*?)\s*\((.+?)\)$/);
  if (match) {
    return { name: match[1].trim(), quantity: match[2] };
  }
  return { name: item || "", quantity: "" };
};

function getStatusStyles(status: boolean) {
  return status
    ? "bg-green-100 text-green-700 border border-green-300"
    : "bg-blue-100 text-blue-700 border border-blue-300";
}

function getStatusLabel(status: boolean) {
  return status ? "✓ Met" : "⏳ Pending";
}

export default function INGDDashboard() {
  const navigate = useNavigate();
  const [ingdActive, setIngdActive] = useState(true);

  const [activeTab, setActiveTab] = useState<"dashboard" | "requests">("dashboard");
  const [ingdRequests, setIngdRequests] = useState<IngdRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<IngdRequest[]>([]);
  const [ingdDocuments, setIngdDocuments] = useState<IngdDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [displayedIngdRequests, setDisplayedIngdRequests] = useState(15);
  const [displayedIngdDocuments, setDisplayedIngdDocuments] = useState(15);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [commitmentData, setCommitmentData] = useState({
    fullName: "",
    companyName: "",
    email: "",
  });
  const [commitmentError, setCommitmentError] = useState("");
  const [isSubmittingCommitment, setIsSubmittingCommitment] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<"commitment" | "resolved" | null>(null);

  // Load INGD active state from database
  useEffect(() => {
    const loadIngdSetting = async () => {
      const isActive = await getIngdActiveSetting();
      setIngdActive(isActive);
    };

    loadIngdSetting();

    // Poll for changes every 2 seconds
    const interval = setInterval(loadIngdSetting, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!ingdActive) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">INGD Dashboard Inactive</h2>
            <p className="text-slate-600 mb-6">
              The INGD Management feature has been disabled. Please contact your administrator if you need access.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    // Load INGD requests and documents when requests tab is selected
    const loadIngdData = async () => {
      if (activeTab === "requests") {
        setIsLoading(true);
        setIsLoadingDocuments(true);
        try {
          const [requests, documents] = await Promise.all([
            getIngdRequests(),
            getIngdDocuments(),
          ]);
          setIngdRequests(requests);
          setIngdDocuments(documents);
          // Apply filter
          if (selectedCategory === "all") {
            setFilteredRequests(requests);
          } else {
            setFilteredRequests(requests.filter(r => r.category === selectedCategory));
          }
        } catch (error) {
          console.error("Error loading INGD data:", error);
        } finally {
          setIsLoading(false);
          setIsLoadingDocuments(false);
        }
      }
    };

    loadIngdData();
  }, [activeTab]);

  // Handle category filter change
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredRequests(ingdRequests);
    } else {
      setFilteredRequests(ingdRequests.filter(r => r.category === selectedCategory));
    }
  }, [selectedCategory, ingdRequests]);

  const toggleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleCommitmentSubmit = async () => {
    if (!commitmentData.fullName || !commitmentData.companyName || !commitmentData.email) {
      setCommitmentError("All fields are required");
      return;
    }

    setIsSubmittingCommitment(true);
    try {
      const itemIds = Array.from(selectedItems);

      // If marking as resolved, verify email matches original commitment
      if (pendingActionType === "resolved") {
        for (const itemId of itemIds) {
          const item = ingdRequests.find(r => r.id === itemId);
          if (item && item.status === "commitment" && item.email_resolution) {
            if (commitmentData.email !== item.email_resolution) {
              setCommitmentError("Email does not match the original commitment. Verification failed.");
              setIsSubmittingCommitment(false);
              return;
            }
          }
        }

        await resolveIngdRequest(
          itemIds,
          commitmentData.fullName,
          commitmentData.companyName,
          commitmentData.email,
        );
      } else if (pendingActionType === "commitment") {
        await createIngdCommitment(
          itemIds,
          commitmentData.fullName,
          commitmentData.companyName,
          commitmentData.email,
        );
      }

      // Reset form and close modal
      setSelectedItems(new Set());
      setCommitmentData({ fullName: "", companyName: "", email: "" });
      setShowCommitmentModal(false);
      setShowActionDropdown(false);
      setCommitmentError("");
      setPendingActionType(null);

      // Reload items to show updated status
      const requests = await getIngdRequests();
      setIngdRequests(requests);
    } catch (error) {
      setCommitmentError("Failed to submit. Please try again.");
      console.error("Error submitting:", error);
    } finally {
      setIsSubmittingCommitment(false);
    }
  };

  useEffect(() => {
    // Set up Tableau visualization with responsive dimensions
    const resizeDashboard = () => {
      const divElement = document.getElementById("viz1769532767397");
      if (divElement) {
        const vizElement = divElement.getElementsByTagName("object")[0];
        if (vizElement) {
          // Original dimensions: 1400x937
          // Calculate responsive width (use available width, max 1400px)
          const container =
            divElement.closest(".overflow-x-auto") || divElement.parentElement;
          let width = 1400;
          let height = 937;

          if (container) {
            const availableWidth = container.clientWidth - 20; // Account for padding
            if (availableWidth < 1400) {
              // Scale proportionally if less space available
              const scale = availableWidth / 1400;
              width = availableWidth;
              height = Math.round(937 * scale);
            }
          }

          vizElement.style.width = width + "px";
          vizElement.style.height = height + "px";
        }
      }
    };

    // Initial sizing
    resizeDashboard();

    // Resize on window resize
    window.addEventListener("resize", resizeDashboard);

    // Load Tableau API script
    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    script.async = true;
    script.type = "text/javascript";

    const divElement = document.getElementById("viz1769532767397");
    if (divElement) {
      const vizElement = divElement.getElementsByTagName("object")[0];
      if (vizElement && vizElement.parentNode) {
        vizElement.parentNode.insertBefore(script, vizElement);
      }
    }

    return () => {
      // Cleanup
      window.removeEventListener("resize", resizeDashboard);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              INGD Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Real-time data from INGD's official disaster impact dashboard
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            ← Back
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "dashboard"
                ? "text-primary border-primary"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "requests"
                ? "text-primary border-primary"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            INGD Relief Requests
          </button>
        </div>

        {/* Embedded Tableau Dashboard - Only show when dashboard tab is active */}
        {activeTab === "dashboard" && (
        <>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <p className="text-sm text-slate-600">
              Last updated: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div
            className="w-full bg-white overflow-x-auto"
            style={{ minHeight: "1000px" }}
          >
            <div
              className="tableauPlaceholder"
              id="viz1769532767397"
              style={{ position: "relative" }}
            >
              <noscript>
                <a href="#">
                  <img
                    alt="Dashboard"
                    src="https://public.tableau.com/static/images/DA/DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard/1_rss.png"
                    style={{ border: "none" }}
                  />
                </a>
              </noscript>
              <object className="tableauViz" style={{ display: "none" }}>
                <param
                  name="host_url"
                  value="https%3A%2F%2Fpublic.tableau.com%2F"
                />
                <param name="embed_code_version" value="3" />
                <param name="site_root" value="" />
                <param
                  name="name"
                  value="DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard"
                />
                <param name="tabs" value="no" />
                <param name="toolbar" value="yes" />
                <param
                  name="static_image"
                  value="https://public.tableau.com/static/images/DA/DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard/1.png"
                />
                <param name="animate_transition" value="yes" />
                <param name="display_static_image" value="yes" />
                <param name="display_spinner" value="yes" />
                <param name="display_overlay" value="yes" />
                <param name="display_count" value="yes" />
                <param name="language" value="en-US" />
              </object>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">About INGD</h3>
            <p className="text-sm text-blue-800">
              The National Institute for Disaster Management (INGD) provides
              official disaster impact statistics and coordination for disaster
              relief efforts in Mozambique.
            </p>
          </div>

          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <h3 className="font-bold text-orange-900 mb-2">
              Data Synchronization
            </h3>
            <p className="text-sm text-orange-800">
              This dashboard displays live data from INGD's official systems.
              Refresh the page to see the latest updates.
            </p>
          </div>
        </div>
        </>
        )}

        {/* INGD Relief Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">INGD Relief Requests</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {filteredRequests.length} of {ingdRequests.length} request{ingdRequests.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Action Dropdown */}
                {selectedItems.size > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActionDropdown(!showActionDropdown)}
                      className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                    >
                      Actions ({selectedItems.size})
                      <ChevronDown size={18} />
                    </button>

                    {showActionDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                        <button
                          onClick={() => {
                            setPendingActionType("commitment");
                            setShowCommitmentModal(true);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 text-slate-900 font-medium transition-colors border-b border-slate-200"
                        >
                          Commitment
                        </button>
                        <button
                          onClick={() => {
                            setPendingActionType("resolved");
                            setShowCommitmentModal(true);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-green-50 text-slate-900 font-medium transition-colors border-b border-slate-200"
                        >
                          Resolved
                        </button>
                        <button
                          onClick={async () => {
                            const itemIds = Array.from(selectedItems);
                            await revertIngdToPending(itemIds);
                            setSelectedItems(new Set());
                            setShowActionDropdown(false);
                            const requests = await getIngdRequests();
                            setIngdRequests(requests);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-slate-900 font-medium transition-colors"
                        >
                          Revert to Pending
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Category:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All Categories
                </button>
                {Array.from(new Set(ingdRequests.map(r => r.category).filter(Boolean))).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-slate-600">Loading INGD requests...</div>
              ) : filteredRequests.length > 0 ? (
                <table className="w-full min-w-max border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap">
                        <input type="checkbox" className="w-4 h-4 rounded" disabled />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap min-w-[60px]">ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap min-w-[150px]">Company</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap min-w-[120px]">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap min-w-[150px]">Item</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap min-w-[80px]">Qty</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">Maputo</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">Gaza</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">Sofala</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700 whitespace-nowrap min-w-[110px]">Zambézia</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">Total</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap min-w-[110px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.slice(0, displayedIngdRequests).map((request, index) => {
                      const { name, quantity } = parseItem(request.Item || "");
                      return (
                        <tr
                          key={request.id}
                          className={`border-b border-slate-200 transition-colors hover:bg-blue-50 cursor-pointer ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50"
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(request.id || 0)}
                              onChange={() => toggleSelectItem(request.id || 0)}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">#{request.id}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-medium break-words max-w-[150px]">{request.company_name}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                              {request.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 break-words max-w-[150px]" title={name}>{name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-center whitespace-nowrap">{quantity}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-600 whitespace-nowrap">{formatNumber(request.Maputo || 0)}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-600 whitespace-nowrap">{formatNumber(request.Gaza || 0)}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-600 whitespace-nowrap">{formatNumber(request.Sofala || 0)}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-600 whitespace-nowrap">{formatNumber(request.Zambezia || 0)}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-primary whitespace-nowrap">{formatNumber(request.Total || 0)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300 whitespace-nowrap">
                              ⏳ Pending
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-600">
                  {ingdRequests.length === 0 ? "No INGD relief requests found" : "No requests match the selected category"}
                </div>
              )}
            </div>
            {filteredRequests.length > displayedIngdRequests && (
              <div className="p-4 border-t border-slate-200 text-center">
                <button
                  onClick={() => setDisplayedIngdRequests(prev => prev + 15)}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                >
                  Load More ({displayedIngdRequests} of {filteredRequests.length})
                </button>
              </div>
            )}

            {/* Documents Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50">
                <h2 className="text-lg font-bold text-slate-900">
                  📄 INGD Documents
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Download INGD protocols, Excel spreadsheets, and reference materials
                </p>
              </div>

              {isLoadingDocuments ? (
                <div className="p-6 text-center text-slate-600">
                  Loading documents...
                </div>
              ) : ingdDocuments.length === 0 ? (
                <div className="p-6 text-center text-slate-600">
                  No documents available yet. Check back soon for INGD protocols and spreadsheets.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {ingdDocuments.slice(0, displayedIngdDocuments).map((doc) => (
                    <div key={doc.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <span className="text-lg">📄</span>
                              <h3 className="font-semibold text-slate-900 break-words">
                                {doc.file_name}
                              </h3>
                            </span>
                            <span className="ml-auto sm:ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                              {doc.file_type.toUpperCase()}
                            </span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-slate-600 mb-2">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Unknown"}
                          </p>
                        </div>
                        <a
                          href={doc.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <ChevronDown size={16} className="rotate-180" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                  {ingdDocuments.length > displayedIngdDocuments && (
                    <div className="p-4 border-t border-slate-200 text-center">
                      <button
                        onClick={() => setDisplayedIngdDocuments(prev => prev + 15)}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                      >
                        Load More ({displayedIngdDocuments} of {ingdDocuments.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commitment Modal */}
        {showCommitmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {pendingActionType === "resolved" ? "Verify Identity & Mark as Resolved" : "Make a Commitment"}
              </h3>
              <p className="text-slate-600 mb-6 text-sm">
                {pendingActionType === "resolved"
                  ? `Please verify your identity with the email you used when committing to mark ${selectedItems.size} relief item${selectedItems.size !== 1 ? "s" : ""} as resolved`
                  : `Commit to ${selectedItems.size} relief item${selectedItems.size !== 1 ? "s" : ""}`}
              </p>

              {commitmentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle
                    size={18}
                    className="text-red-600 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-800">{commitmentError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={commitmentData.fullName}
                    onChange={(e) => setCommitmentData({ ...commitmentData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Company Name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={commitmentData.companyName}
                    onChange={(e) => setCommitmentData({ ...commitmentData, companyName: e.target.value })}
                    placeholder="Enter your company name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={commitmentData.email}
                    onChange={(e) => setCommitmentData({ ...commitmentData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                Your information will not be displayed publicly
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCommitmentModal(false);
                    setCommitmentData({ fullName: "", companyName: "", email: "" });
                    setCommitmentError("");
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitmentSubmit}
                  disabled={isSubmittingCommitment || !commitmentData.fullName || !commitmentData.companyName || !commitmentData.email}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
                >
                  {isSubmittingCommitment
                    ? "Submitting..."
                    : pendingActionType === "resolved"
                      ? "Mark as Resolved"
                      : "Submit Commitment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
