import { useState, useEffect } from "react";
import {
  Settings,
  Users,
  BarChart3,
  Database,
  LogOut,
  Lock,
  AlertCircle,
  Download,
  Plus,
  Trash2,
  Edit2,
  X,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import DocumentUploadForm from "@/components/DocumentUploadForm";
import { useAuth } from "@/context/AuthContext";
import { getMetrics, getAllRequests, getIngdRequests, createIngdRequest, updateIngdRequest, deleteIngdRequest } from "@/services/requestsService";
import { getIngdDocuments, createIngdDocument, deleteIngdDocument, uploadDocumentToStorage, getIngdActiveSetting, setIngdActiveSetting } from "@/services/supabaseService";
import { getAchievements } from "@/services/achievementsService";
import { downloadReport, filterActions, generateSummaryNarrative, ReportFilters } from "@/services/reportService";
import type { RelieRequest, IngdRequest, IngdDocument, Action } from "@/services/supabaseService";

// Format numbers with . for thousands and , for decimals (European format)
const formatNumber = (value: number, decimals: number = 0): string => {
  const fixed = value.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');

  // Add thousands separator with dots
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Combine with comma as decimal separator
  return decimal ? `${withThousands},${decimal}` : withThousands;
};

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  lastLogin: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "requests" | "users" | "settings" | "ingd" | "documents" | "government-priorities" | "reports"
  >("dashboard");
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    totalPeopleAssisted: 0,
    totalValueDeployed: 0,
    averagePerRequest: 0,
    metRequests: 0,
    pendingRequests: 0,
    partiallyMet: 0,
  });
  const [ingdMetrics, setIngdMetrics] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalPeopleImpacted: 0,
    totalAmount: 0,
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [allRequests, setAllRequests] = useState<RelieRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [ingdRequests, setIngdRequests] = useState<IngdRequest[]>([]);
  const [isLoadingIngd, setIsLoadingIngd] = useState(false);
  const [showIngdForm, setShowIngdForm] = useState(false);
  const [editingIngdId, setEditingIngdId] = useState<number | null>(null);
  const [ingdFormData, setIngdFormData] = useState<Partial<IngdRequest>>({
    company_name: "",
    Item: "",
    category: "",
    partner_organisation: "",
    people_impacted: 0,
    amount: 0,
    description: "",
    Maputo: 0,
    Gaza: 0,
    Sofala: 0,
    Zambezia: 0,
    Total: 0,
  });
  const [allDocuments, setAllDocuments] = useState<IngdDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState<"ingd" | "government_priority" | "actions">("ingd");
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [ingdActive, setIngdActive] = useState(true);
  const [isUpdatingIngd, setIsUpdatingIngd] = useState(false);

  // Report state
  const [allActions, setAllActions] = useState<Action[]>([]);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    startDate: undefined,
    endDate: undefined,
    category: undefined,
    submitter: undefined,
    includeDocuments: true,
    includeMedia: true,
  });

  // Load INGD active state from database
  useEffect(() => {
    const loadIngdSetting = async () => {
      const isActive = await getIngdActiveSetting();
      setIngdActive(isActive);
    };

    loadIngdSetting();
  }, []);

  // Load metrics on mount
  useEffect(() => {
    const loadMetrics = async () => {
      // Load relief request metrics
      const data = await getMetrics();
      if (data) {
        setMetrics(data);
      }

      // Load INGD metrics
      const ingdReqs = await getIngdRequests();
      if (ingdReqs && ingdReqs.length > 0) {
        const totalItems = ingdReqs.length;
        const totalQuantity = ingdReqs.reduce((sum: number, item: IngdRequest) => sum + (item.Total || 0), 0);
        const totalPeopleImpacted = ingdReqs.reduce((sum: number, item: IngdRequest) => sum + (item.people_impacted || 0), 0);
        const totalAmount = ingdReqs.reduce((sum: number, item: IngdRequest) => sum + (item.amount || 0), 0);

        setIngdMetrics({
          totalItems,
          totalQuantity,
          totalPeopleImpacted,
          totalAmount,
        });
      }

      setIsLoadingMetrics(false);
    };
    loadMetrics();
  }, []);

  // Load all requests when requests tab is activated
  useEffect(() => {
    if (activeTab === "requests" && allRequests.length === 0) {
      loadAllRequests();
    }
  }, [activeTab]);

  // Load INGD requests when ingd tab is activated
  useEffect(() => {
    if (activeTab === "ingd") {
      loadIngdRequests();
    }
  }, [activeTab]);

  // Load documents when documents tab is activated
  useEffect(() => {
    if (activeTab === "documents") {
      loadAllDocuments();
    }
  }, [activeTab]);

  // Load actions when reports tab is activated
  useEffect(() => {
    if (activeTab === "reports") {
      loadAllActionsForReport();
    }
  }, [activeTab]);

  const loadAllRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const requests = await getAllRequests();
      setAllRequests(requests || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      setAllRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadIngdRequests = async () => {
    setIsLoadingIngd(true);
    try {
      const requests = await getIngdRequests();
      setIngdRequests(requests || []);
    } catch (error) {
      console.error("Error loading INGD requests:", error);
      setIngdRequests([]);
    } finally {
      setIsLoadingIngd(false);
    }
  };

  const handleSaveIngdRequest = async () => {
    if (!ingdFormData.originator || !ingdFormData.email) {
      alert("Please fill in required fields");
      return;
    }

    try {
      if (editingIngdId) {
        // Update existing request
        await updateIngdRequest(editingIngdId, ingdFormData);
      } else {
        // Create new request
        await createIngdRequest(ingdFormData as Omit<RelieRequest, "id" | "created_at" | "edited_at">);
      }
      await loadIngdRequests();
      setShowIngdForm(false);
      setEditingIngdId(null);
      setIngdFormData({
        originator: "",
        email: "",
        full_name: "",
        location: "",
        partner_organisation: "",
        help_type: "",
        evacuation_type: "",
        people: "",
        value: "",
        status: false,
      });
    } catch (error) {
      console.error("Error saving INGD request:", error);
      alert("Error saving request");
    }
  };

  const handleDeleteIngdRequest = async (id: number) => {
    if (confirm("Are you sure you want to delete this INGD request?")) {
      try {
        await deleteIngdRequest(id);
        await loadIngdRequests();
      } catch (error) {
        console.error("Error deleting INGD request:", error);
        alert("Error deleting request");
      }
    }
  };

  const loadAllDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const documents = await getIngdDocuments();
      setAllDocuments(documents || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      setAllDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentDescription.trim()) {
      alert("Please select a file and enter a description");
      return;
    }

    setIsUploadingDocument(true);
    try {
      // Upload file to Supabase Storage
      let storagePath = "ingd";
      if (documentType === "government_priority") storagePath = "government-priorities";
      if (documentType === "actions") storagePath = "actions";

      const fileUrl = await uploadDocumentToStorage(documentFile, storagePath);

      // Create document record in database
      const fileType = documentFile.name.split(".").pop() || "file";
      const documentData: any = {
        file_name: documentFile.name,
        file_url: fileUrl,
        file_type: fileType,
        description: documentDescription,
        uploaded_by: user?.email || "admin",
      };

      // Add type for non-INGD documents
      if (documentType === "government_priority") {
        documentData.type = "government_priority";
      } else if (documentType === "actions") {
        documentData.type = "actions";
      }

      await createIngdDocument(documentData);

      // Reload documents
      await loadAllDocuments();

      // Clear form
      setDocumentFile(null);
      setDocumentDescription("");
      const typeLabels: Record<string, string> = {
        ingd: "INGD",
        government_priority: "Government Priority",
        actions: "Actions",
      };
      alert(`${typeLabels[documentType]} document uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert(`Error uploading document: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteIngdDocument(id);
        await loadAllDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error deleting document");
      }
    }
  };


  const handleEditIngdRequest = (request: RelieRequest) => {
    setEditingIngdId(request.id || null);
    setIngdFormData(request);
    setShowIngdForm(true);
  };

  const exportToCSV = () => {
    if (allRequests.length === 0) {
      alert("No requests to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "ID",
      "Originator",
      "Full Name",
      "Email",
      "Location",
      "Help Type",
      "Evacuation Type",
      "People",
      "Value",
      "Status",
      "Date",
    ];

    // Convert requests to CSV rows
    const rows = allRequests.map((req) => [
      req.id || "",
      req.originator || "",
      req.full_name || "",
      req.email || "",
      req.location || "",
      req.help_type || "",
      req.evacuation_type || "",
      req.people || "",
      req.value || "",
      req.status ? "Met" : "Pending",
      req.created_at ? new Date(req.created_at).toLocaleDateString() : "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relief-requests-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const loadAllActionsForReport = async () => {
    setIsLoadingActions(true);
    try {
      const actions = await getAchievements();
      setAllActions(actions);
    } catch (error) {
      console.error("Error loading actions for report:", error);
      setAllActions([]);
    } finally {
      setIsLoadingActions(false);
    }
  };

  const handleGenerateReport = async () => {
    if (allActions.length === 0) {
      alert("No actions available to generate report");
      return;
    }

    setIsGeneratingReport(true);
    try {
      await downloadReport(allActions, reportFilters, {
        title: "Actions Report",
        organizationName: "SABCM Disaster Relief",
        footer: `Generated on ${new Date().toLocaleDateString()} by Admin Dashboard`,
        includeMetrics: true,
      });
      alert("Report generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Error generating report: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const [adminUsers] = useState<AdminUser[]>([
    {
      id: "1",
      name: user?.name || "Admin User",
      email: user?.email || "admin@sacbm.co.mz",
      role: "admin",
      lastLogin: new Date().toLocaleString(),
    },
  ]);

  // Admin Statistics from Supabase
  const stats = [
    {
      label: "Total Requests",
      value: metrics.totalRequests,
      icon: BarChart3,
      color: "blue",
    },
    {
      label: "Met Requests",
      value: metrics.metRequests,
      icon: Lock,
      color: "green",
    },
    {
      label: "Pending Requests",
      value: metrics.pendingRequests,
      icon: Settings,
      color: "yellow",
    },
    {
      label: "INGD Items",
      value: ingdMetrics.totalItems,
      icon: Database,
      color: "orange",
    },
    {
      label: "Total Quantity",
      value: formatNumber(ingdMetrics.totalQuantity),
      icon: BarChart3,
      color: "blue",
    },
    {
      label: "INGD People",
      value: formatNumber(ingdMetrics.totalPeopleImpacted),
      icon: Users,
      color: "green",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage SABCM disaster relief operations
            </p>
            {user && (
              <p className="text-xs text-slate-500 mt-2">
                Logged in as: {user.name}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              ← Back
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white overflow-x-auto">
          <div className="flex gap-1 sm:gap-2 min-w-min">
            {[
              { id: "dashboard", label: "Dashboard", shortLabel: "Dashboard", icon: BarChart3 },
              { id: "requests", label: "All Requests", shortLabel: "Requests", icon: Database },
              { id: "ingd", label: "INGD Management", shortLabel: "INGD", icon: Database },
              { id: "documents", label: "Documents", shortLabel: "Docs", icon: Download },
              { id: "reports", label: "Reports", shortLabel: "Reports", icon: FileText },
              { id: "users", label: "Users", shortLabel: "Users", icon: Users },
              { id: "settings", label: "Settings", shortLabel: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.label}
                className={`px-2 sm:px-4 py-4 font-medium flex items-center gap-1 sm:gap-2 border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                const colorClasses: Record<string, string> = {
                  blue: "bg-blue-100 text-blue-600",
                  green: "bg-green-100 text-green-600",
                  yellow: "bg-yellow-100 text-yellow-600",
                  orange: "bg-orange-100 text-orange-600",
                };
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-md p-6 border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">
                          {isLoadingMetrics ? "—" : stat.value}
                        </p>
                      </div>
                      <div
                        className={`rounded-lg p-3 ${colorClasses[stat.color]}`}
                      >
                        <Icon size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Request Status Breakdown
                </h3>
                <div className="space-y-4">
                  {isLoadingMetrics ? (
                    <p className="text-slate-500 text-sm">Loading...</p>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-slate-700">
                            Met
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {metrics.totalRequests > 0
                              ? Math.round(
                                  (metrics.metRequests /
                                    metrics.totalRequests) *
                                    100,
                                )
                              : 0}
                            %
                          </p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width:
                                metrics.totalRequests > 0
                                  ? `${Math.round((metrics.metRequests / metrics.totalRequests) * 100)}%`
                                  : "0%",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-slate-700">
                            Pending
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            {metrics.totalRequests > 0
                              ? Math.round(
                                  (metrics.pendingRequests /
                                    metrics.totalRequests) *
                                    100,
                                )
                              : 0}
                            %
                          </p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width:
                                metrics.totalRequests > 0
                                  ? `${Math.round((metrics.pendingRequests / metrics.totalRequests) * 100)}%`
                                  : "0%",
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Data Summary
                </h3>
                <div className="space-y-3">
                  {isLoadingMetrics ? (
                    <p className="text-slate-500 text-sm">Loading...</p>
                  ) : (
                    <>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <p className="text-slate-600">Total People Assisted</p>
                        <p className="font-bold text-slate-900">
                          {formatNumber(metrics.totalPeopleAssisted)}
                        </p>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <p className="text-slate-600">Total Funds Deployed</p>
                        <p className="font-bold text-slate-900">
                          {formatNumber((metrics.totalValueDeployed || 0) / 1000000, 2)}
                          M MZN
                        </p>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <p className="text-slate-600">Average per Request</p>
                        <p className="font-bold text-slate-900">
                          {formatNumber((metrics.averagePerRequest || 0) / 1000, 0)}
                          K MZN
                        </p>
                      </div>
                      <div className="flex justify-between py-2">
                        <p className="text-slate-600">Active Cities</p>
                        <p className="font-bold text-slate-900">
                          {allRequests && allRequests.length > 0
                            ? new Set(allRequests.map((r) => r.location)).size
                            : 0}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  INGD Data Summary
                </h3>
                <div className="space-y-3">
                  {isLoadingMetrics ? (
                    <p className="text-slate-500 text-sm">Loading...</p>
                  ) : (
                    <>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <p className="text-slate-600">Total Items</p>
                        <p className="font-bold text-slate-900">
                          {ingdMetrics.totalItems}
                        </p>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <p className="text-slate-600">Total Quantity</p>
                        <p className="font-bold text-slate-900">
                          {formatNumber(ingdMetrics.totalQuantity)}
                        </p>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <p className="text-slate-600">People Impacted</p>
                        <p className="font-bold text-slate-900">
                          {formatNumber(ingdMetrics.totalPeopleImpacted)}
                        </p>
                      </div>
                      <div className="flex justify-between py-2">
                        <p className="text-slate-600">Total Value</p>
                        <p className="font-bold text-slate-900">
                          {formatNumber((ingdMetrics.totalAmount || 0) / 1000, 0)}K MZN
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  All Relief Requests
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Manage all relief requests from the database
                </p>
              </div>
              <button
                onClick={loadAllRequests}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                {isLoadingRequests ? "Loading..." : "Refresh"}
              </button>
            </div>

            {isLoadingRequests ? (
              <div className="p-6 text-center text-slate-600">
                Loading requests...
              </div>
            ) : allRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-600">
                No requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        #Ref
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Originator
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Full Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Help Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        People
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Value
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b border-slate-200 hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          #{req.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.originator}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.full_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.help_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.people}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.value} MZN
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              req.status
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {req.status ? "Met" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.created_at
                            ? new Date(req.created_at).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <h3 className="text-lg font-bold text-slate-900">
                  Admin Users
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Manage user access and permissions
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Last Login
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-200 hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : user.role === "manager"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-primary hover:text-orange-600 font-medium transition-colors">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-lg font-semibold text-blue-900 mb-2">
                👥 User Management
              </p>
              <p className="text-blue-800">
                Backend connection will enable: user authentication, role-based
                access control (RBAC), activity logging, and permission
                management.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Supabase Connection Status */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-lg p-3">
                  <BarChart3 size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-1">
                    Supabase Connected
                  </h3>
                  <p className="text-green-800 mb-3">
                    Your app is connected to Supabase PostgreSQL database for
                    reliable data management.
                  </p>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>✓ Real-time data synchronization</li>
                    <li>✓ Relief requests management</li>
                    <li>✓ User authentication</li>
                    <li>✓ Automatic backups</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* System Configuration */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                System Configuration
              </h3>

              <div className="space-y-6">
                {/* Database Configuration */}
                <div className="p-6 border border-green-200 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Database size={20} />
                    Database Configuration
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <span className="font-semibold">
                          ✓ Connected to Supabase
                        </span>
                        <br />
                        Project: SACBM
                        <br />
                        Region: eu-west-1
                        <br />
                        Table: relief_requests
                      </p>
                    </div>
                    <p className="text-xs text-green-700">
                      Your database is configured and ready to use. All relief
                      requests are automatically synced to Supabase.
                    </p>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="p-6 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Lock size={20} />
                    API Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        API Base URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://api.yourdomain.com"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="Paste your API key here"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                      Verify API
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="p-6 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Data Management
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (allRequests.length === 0) {
                          loadAllRequests().then(() => {
                            setTimeout(exportToCSV, 500);
                          });
                        } else {
                          exportToCSV();
                        }
                      }}
                      className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Export All Data (CSV)
                    </button>
                    <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                      Backup Database
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="text-lg font-semibold text-green-900 mb-2">
                ✓ System Fully Configured
              </p>
              <p className="text-green-800 mb-4">
                Your disaster relief management system is connected to Supabase
                and ready for production use.
              </p>
              <ul className="space-y-1 text-sm text-green-800">
                <li>✓ Supabase PostgreSQL database</li>
                <li>✓ Real-time data synchronization</li>
                <li>✓ User authentication and authorization</li>
                <li>✓ Relief requests management</li>
                <li>✓ Automatic backups and recovery</li>
              </ul>
            </div>
          </div>
        )}

        {/* INGD Management Tab */}
        {activeTab === "ingd" && (
          <div className="space-y-6">
            {/* INGD Requests Table */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        INGD Relief Requests
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Manage INGD relief requests in the database
                      </p>
                    </div>
                    {/* Active/Inactive Toggle */}
                    <div className="ml-4 flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200">
                      <button
                        onClick={async () => {
                          setIsUpdatingIngd(true);
                          await setIngdActiveSetting(true);
                          setIngdActive(true);
                          setIsUpdatingIngd(false);
                        }}
                        disabled={isUpdatingIngd}
                        className={`px-3 py-1 rounded font-medium text-sm transition-colors ${
                          ingdActive
                            ? "bg-green-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:bg-slate-100"
                        }`}
                      >
                        ON
                      </button>
                      <button
                        onClick={async () => {
                          setIsUpdatingIngd(true);
                          await setIngdActiveSetting(false);
                          setIngdActive(false);
                          setIsUpdatingIngd(false);
                        }}
                        disabled={isUpdatingIngd}
                        className={`px-3 py-1 rounded font-medium text-sm transition-colors ${
                          !ingdActive
                            ? "bg-red-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:bg-slate-100"
                        }`}
                      >
                        OFF
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowIngdForm(true);
                    setEditingIngdId(null);
                    setIngdFormData({
                      company_name: "",
                      Item: "",
                      category: "",
                      partner_organisation: "",
                      people_impacted: 0,
                      amount: 0,
                      description: "",
                      Maputo: 0,
                      Gaza: 0,
                      Sofala: 0,
                      Zambezia: 0,
                      Total: 0,
                    });
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Request
                </button>
              </div>

              {/* Add/Edit Form */}
              {showIngdForm && (
                <div className="px-6 py-6 border-b border-slate-200 bg-blue-50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">
                        {editingIngdId ? "Edit INGD Request" : "Add New INGD Request"}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">* indicates required field</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowIngdForm(false);
                        setEditingIngdId(null);
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Item Information Section */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Item Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Company/Organization</label>
                        <input
                          type="text"
                          placeholder="e.g., INGD, Red Cross"
                          value={ingdFormData.company_name || ""}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              company_name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Item</label>
                        <input
                          type="text"
                          placeholder="e.g., Rice (25kg), Beans (5kg)"
                          value={ingdFormData.Item || ""}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              Item: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                        <input
                          type="text"
                          placeholder="e.g., Food, Hygiene, Shelter"
                          value={ingdFormData.category || ""}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity by Location Section */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Quantity Needed by Location</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Maputo</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={ingdFormData.Maputo || 0}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              Maputo: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Gaza</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={ingdFormData.Gaza || 0}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              Gaza: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Sofala</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={ingdFormData.Sofala || 0}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              Sofala: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Zambézia</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={ingdFormData.Zambezia || 0}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              Zambezia: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Total</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={ingdFormData.Total || 0}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              Total: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Additional Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">People Impacted</label>
                        <input
                          type="number"
                          placeholder="Number of people"
                          value={ingdFormData.people_impacted || 0}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              people_impacted: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Amount (MZN)</label>
                        <input
                          type="number"
                          placeholder="Amount in Meticais"
                          value={ingdFormData.amount || 0}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              amount: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Partner Organisation</label>
                        <input
                          type="text"
                          placeholder="Partner organization name"
                          value={ingdFormData.partner_organisation || ""}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              partner_organisation: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                          placeholder="Additional details about this item..."
                          value={ingdFormData.description || ""}
                          onChange={(e) =>
                            setIngdFormData({
                              ...ingdFormData,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveIngdRequest}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      Save Request
                    </button>
                    <button
                      onClick={() => {
                        setShowIngdForm(false);
                        setEditingIngdId(null);
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Requests Table */}
              {isLoadingIngd ? (
                <div className="p-6 text-center text-slate-600">
                  Loading INGD requests...
                </div>
              ) : ingdRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-600">
                  No INGD requests found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 whitespace-nowrap">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 min-w-[140px]">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 min-w-[140px]">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 min-w-[110px]">
                          Category
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Maputo
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Gaza
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Sofala
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Zambézia
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingdRequests.map((req) => (
                        <tr
                          key={req.id}
                          className="border-b border-slate-200 hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs font-medium text-slate-900 whitespace-nowrap">
                            #{req.id}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 truncate">
                            {req.company_name || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 truncate">
                            {req.Item || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 truncate">
                            {req.category || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-center text-slate-600 whitespace-nowrap">
                            {req.Maputo || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-center text-slate-600 whitespace-nowrap">
                            {req.Gaza || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-center text-slate-600 whitespace-nowrap">
                            {req.Sofala || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-center text-slate-600 whitespace-nowrap">
                            {req.Zambezia || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-semibold text-slate-900 whitespace-nowrap">
                            {formatNumber(req.Total || 0)}
                          </td>
                          <td className="px-4 py-3 text-xs space-x-1 flex whitespace-nowrap">
                            <button
                              onClick={() => handleEditIngdRequest(req)}
                              className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1 px-2 py-1"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteIngdRequest(req.id || 0)}
                              className="text-red-600 hover:text-red-800 font-medium transition-colors flex items-center gap-1 px-2 py-1"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                              Del
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-lg font-semibold text-blue-900 mb-2">
                📊 INGD Database Management
              </p>
              <p className="text-blue-800">
                This section allows you to manage all relief requests stored in the INGD_table. You can add new requests, update existing ones, or delete records as needed.
              </p>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <DocumentUploadForm
            documentType={documentType as any}
            documentFile={documentFile}
            documentDescription={documentDescription}
            isUploading={isUploadingDocument}
            allDocuments={allDocuments}
            isLoadingDocuments={isLoadingDocuments}
            onFileChange={setDocumentFile}
            onDescriptionChange={setDocumentDescription}
            onDocumentTypeChange={setDocumentType}
            onUpload={handleUploadDocument}
            onDelete={handleDeleteDocument}
          />
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={24} className="text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Generate Action Reports</h2>
                  <p className="text-sm text-slate-600 mt-1">Create customized PDF reports of all submitted actions with filters</p>
                </div>
              </div>

              {/* Report Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={reportFilters.startDate ? reportFilters.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setReportFilters({
                      ...reportFilters,
                      startDate: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    value={reportFilters.endDate ? reportFilters.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setReportFilters({
                      ...reportFilters,
                      endDate: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category (Optional)</label>
                  <select
                    value={reportFilters.category || ''}
                    onChange={(e) => setReportFilters({
                      ...reportFilters,
                      category: e.target.value || undefined
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Materials">Materials</option>
                    <option value="Medical">Medical</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Water">Water</option>
                    <option value="Evacuation">Evacuation</option>
                    <option value="Multiple">Multiple</option>
                  </select>
                </div>

                {/* Submitter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Submitter (Optional)</label>
                  <input
                    type="text"
                    placeholder="Filter by organization name..."
                    value={reportFilters.submitter || ''}
                    onChange={(e) => setReportFilters({
                      ...reportFilters,
                      submitter: e.target.value || undefined
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Include Options */}
                <div className="md:col-span-2">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportFilters.includeDocuments !== false}
                        onChange={(e) => setReportFilters({
                          ...reportFilters,
                          includeDocuments: e.target.checked
                        })}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Include Documents</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportFilters.includeMedia !== false}
                        onChange={(e) => setReportFilters({
                          ...reportFilters,
                          includeMedia: e.target.checked
                        })}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Include Media</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Report Preview Section */}
              {allActions.length > 0 && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-2">Report Preview</h3>
                  <p className="text-sm text-slate-700 mb-3">
                    {generateSummaryNarrative(filterActions(allActions, reportFilters), reportFilters)}
                  </p>
                  <p className="text-xs text-slate-600">
                    Total actions matching filter: {filterActions(allActions, reportFilters).length} / {allActions.length}
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport || allActions.length === 0 || isLoadingActions}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  {isGeneratingReport ? 'Generating Report...' : 'Generate PDF Report'}
                </button>
                <button
                  onClick={loadAllActionsForReport}
                  disabled={isLoadingActions}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  {isLoadingActions ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {isLoadingActions && (
                <div className="mt-4 text-center text-slate-600">
                  <p>Loading actions...</p>
                </div>
              )}

              {!isLoadingActions && allActions.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <AlertCircle size={18} className="text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800">No actions found. Check back when actions have been submitted.</p>
                </div>
              )}

              {!isLoadingActions && allActions.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ {allActions.length} action{allActions.length !== 1 ? 's' : ''} available for reporting
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
