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
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import DocumentUploadForm from "@/components/DocumentUploadForm";
import { useAuth } from "@/context/AuthContext";
import { getMetrics, getAllRequests, getIngdRequests, createIngdRequest, updateIngdRequest, deleteIngdRequest } from "@/services/requestsService";
import { getAchievements } from "@/services/achievementsService";
import { getIngdDocuments, createIngdDocument, deleteIngdDocument, updateIngdDocument, uploadDocumentToStorage, getIngdActiveSetting, setIngdActiveSetting } from "@/services/supabaseService";
import type { RelieRequest, IngdRequest, IngdDocument } from "@/services/supabaseService";

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
    "dashboard" | "requests" | "users" | "settings" | "ingd" | "documents" | "government-priorities" | "members" | "carousel" | "member-access"
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
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState<"ingd" | "government_priority" | "actions" | "relief_requests">("ingd");
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [ingdActive, setIngdActive] = useState(true);
  const [isUpdatingIngd, setIsUpdatingIngd] = useState(false);

  // Members management state
  interface MemberData {
    company: string;
    sector: string;
    description: string;
    image?: string;
  }
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [memberImageFile, setMemberImageFile] = useState<File | null>(null);
  const [isSavingMember, setIsSavingMember] = useState(false);

  // Carousel management state
  interface CarouselImage {
    id: string;
    url: string;
    title: string;
    description: string;
  }
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [isLoadingCarousel, setIsLoadingCarousel] = useState(false);
  const [newCarouselUrl, setNewCarouselUrl] = useState("");
  const [newCarouselTitle, setNewCarouselTitle] = useState("");
  const [newCarouselDescription, setNewCarouselDescription] = useState("");

  // Member access management state
  interface ApprovedMember {
    id: string;
    email: string;
    name: string;
    company: string;
  }
  const [approvedMembers, setApprovedMembers] = useState<ApprovedMember[]>([]);
  const [isLoadingApprovedMembers, setIsLoadingApprovedMembers] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberCompany, setNewMemberCompany] = useState("");

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

  // Load members when members tab is activated
  useEffect(() => {
    if (activeTab === "members") {
      loadMembers();
    }
  }, [activeTab]);

  // Load carousel images when carousel tab is activated
  useEffect(() => {
    if (activeTab === "carousel") {
      loadCarouselImages();
    }
  }, [activeTab]);

  // Load approved members when member-access tab is activated
  useEffect(() => {
    if (activeTab === "member-access") {
      loadApprovedMembers();
    }
  }, [activeTab]);

  const loadMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const achievements = await getAchievements();

      // Group by company and get unique members with their aggregated data
      const memberMap = new Map<string, MemberData>();

      achievements.forEach((achievement: any) => {
        const company = achievement.company_name || "Unknown Company";

        if (!memberMap.has(company)) {
          memberMap.set(company, {
            company,
            sector: "",
            description: "",
            image: achievement.media && achievement.media.length > 0 ? (Array.isArray(achievement.media) ? achievement.media[0] : achievement.media) : undefined,
          });
        }
      });

      const membersList = Array.from(memberMap.values());
      setMembers(membersList);
    } catch (error) {
      console.error("Error loading members:", error);
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleStartEditMember = (member: MemberData) => {
    setEditingMember({ ...member });
    setMemberImageFile(null);
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;

    setIsSavingMember(true);
    try {
      // Save member customization to localStorage for now
      // (In production, you'd save to a database)
      const memberCustomizations = JSON.parse(
        localStorage.getItem("memberCustomizations") || "{}"
      );

      memberCustomizations[editingMember.company] = {
        sector: editingMember.sector,
        description: editingMember.description,
        image: editingMember.image,
      };

      localStorage.setItem("memberCustomizations", JSON.stringify(memberCustomizations));

      // Update local state
      setMembers(members.map(m =>
        m.company === editingMember.company ? editingMember : m
      ));

      setEditingMember(null);
      setMemberImageFile(null);
      alert("Member updated successfully!");
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Error saving member");
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleCancelEditMember = () => {
    setEditingMember(null);
    setMemberImageFile(null);
  };

  const handleMemberImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMemberImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (editingMember && event.target?.result) {
          setEditingMember({
            ...editingMember,
            image: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadCarouselImages = async () => {
    setIsLoadingCarousel(true);
    try {
      const stored = localStorage.getItem("carouselImages");
      if (stored) {
        setCarouselImages(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading carousel images:", error);
    } finally {
      setIsLoadingCarousel(false);
    }
  };

  const handleAddCarouselImage = () => {
    if (!newCarouselUrl || !newCarouselTitle) {
      alert("Please fill in image URL and title");
      return;
    }

    const newImage: CarouselImage = {
      id: Date.now().toString(),
      url: newCarouselUrl,
      title: newCarouselTitle,
      description: newCarouselDescription,
    };

    const updatedImages = [...carouselImages, newImage];
    setCarouselImages(updatedImages);
    localStorage.setItem("carouselImages", JSON.stringify(updatedImages));

    setNewCarouselUrl("");
    setNewCarouselTitle("");
    setNewCarouselDescription("");
    alert("Image added successfully!");
  };

  const handleDeleteCarouselImage = (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      const updatedImages = carouselImages.filter(img => img.id !== id);
      setCarouselImages(updatedImages);
      localStorage.setItem("carouselImages", JSON.stringify(updatedImages));
    }
  };

  const loadApprovedMembers = async () => {
    setIsLoadingApprovedMembers(true);
    try {
      const stored = localStorage.getItem("approvedMembers");
      if (stored) {
        setApprovedMembers(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading approved members:", error);
    } finally {
      setIsLoadingApprovedMembers(false);
    }
  };

  const handleAddApprovedMember = () => {
    if (!newMemberEmail || !newMemberName || !newMemberCompany) {
      alert("Please fill in all fields");
      return;
    }

    const newMember: ApprovedMember = {
      id: Date.now().toString(),
      email: newMemberEmail,
      name: newMemberName,
      company: newMemberCompany,
    };

    const updatedMembers = [...approvedMembers, newMember];
    setApprovedMembers(updatedMembers);
    localStorage.setItem("approvedMembers", JSON.stringify(updatedMembers));

    setNewMemberEmail("");
    setNewMemberName("");
    setNewMemberCompany("");
    alert("Member approved successfully!");
  };

  const handleDeleteApprovedMember = (id: string) => {
    if (confirm("Are you sure you want to remove this member's access?")) {
      const updatedMembers = approvedMembers.filter(m => m.id !== id);
      setApprovedMembers(updatedMembers);
      localStorage.setItem("approvedMembers", JSON.stringify(updatedMembers));
    }
  };

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
      if (documentType === "relief_requests") storagePath = "relief-requests";

      const fileUrl = await uploadDocumentToStorage(documentFile, storagePath);

      // Create document record in database
      const fileType = documentFile.name.split(".").pop() || "file";
      const documentData: any = {
        file_name: documentName || documentFile.name,
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
      } else if (documentType === "relief_requests") {
        documentData.type = "relief_requests";
      }

      await createIngdDocument(documentData);

      // Reload documents
      await loadAllDocuments();

      // Clear form
      setDocumentFile(null);
      setDocumentName("");
      setDocumentDescription("");
      const typeLabels: Record<string, string> = {
        ingd: "INGD",
        government_priority: "Government Priority",
        actions: "Actions",
        relief_requests: "Relief Requests",
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

  const handleEditDocumentType = async (id: number, newType: string | null, newName?: string, newDescription?: string) => {
    try {
      console.log(`[handleEditDocumentType] Starting update for document ${id}`);
      console.log(`[handleEditDocumentType] newType: ${newType}, newName: ${newName}, newDescription: ${newDescription}`);

      const updates: { type?: string | null; file_name?: string; description?: string } = {};

      // Always update type if provided
      if (newType !== undefined) {
        updates.type = newType;
        console.log(`[handleEditDocumentType] Adding type to updates: ${newType}`);
      }

      if (newName !== undefined && newName.trim()) {
        updates.file_name = newName;
        console.log(`[handleEditDocumentType] Adding file_name to updates: ${newName}`);
      }

      if (newDescription !== undefined) {
        updates.description = newDescription;
        console.log(`[handleEditDocumentType] Adding description to updates: ${newDescription}`);
      }

      console.log(`[handleEditDocumentType] Final updates object:`, updates);

      const result = await updateIngdDocument(id, updates);
      if (!result) {
        throw new Error("Failed to update document in database");
      }
      console.log("[handleEditDocumentType] Document updated successfully, reloading documents...");
      await loadAllDocuments();
      console.log("[handleEditDocumentType] Documents reloaded");
      alert("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
      alert(`Error updating document: ${error instanceof Error ? error.message : "Unknown error"}`);
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
              { id: "members", label: "Members", shortLabel: "Members", icon: Users },
              { id: "carousel", label: "Home Carousel", shortLabel: "Carousel", icon: Download },
              { id: "member-access", label: "Member Access", shortLabel: "Access", icon: Users },
              { id: "documents", label: "Documents", shortLabel: "Docs", icon: Download },
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

        {/* Carousel Tab */}
        {activeTab === "carousel" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Home Page Carousel Management</h2>

              {/* Add New Image Section */}
              <div className="border border-slate-200 rounded-lg p-6 mb-8 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Image</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={newCarouselUrl}
                      onChange={(e) => setNewCarouselUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newCarouselTitle}
                      onChange={(e) => setNewCarouselTitle(e.target.value)}
                      placeholder="e.g., Community Relief Efforts"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={newCarouselDescription}
                      onChange={(e) => setNewCarouselDescription(e.target.value)}
                      placeholder="Describe the image..."
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddCarouselImage}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add Image
                  </button>
                </div>
              </div>

              {/* Current Images List */}
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Carousel Images</h3>
              {isLoadingCarousel ? (
                <p className="text-slate-600">Loading images...</p>
              ) : carouselImages.length === 0 ? (
                <p className="text-slate-600">No images yet. Add one above!</p>
              ) : (
                <div className="space-y-4">
                  {carouselImages.map((img) => (
                    <div key={img.id} className="border border-slate-200 rounded-lg p-4 flex gap-4">
                      <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-slate-100">
                        <img src={img.url} alt={img.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{img.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{img.description}</p>
                        <p className="text-xs text-slate-500 mt-2 truncate">{img.url}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCarouselImage(img.id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member Access Tab */}
        {activeTab === "member-access" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Member Access Management</h2>

              {/* Add New Member Section */}
              <div className="border border-slate-200 rounded-lg p-6 mb-8 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Approve New Member</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="member@company.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={newMemberCompany}
                      onChange={(e) => setNewMemberCompany(e.target.value)}
                      placeholder="Company Name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddApprovedMember}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Approve Member
                  </button>
                </div>
              </div>

              {/* Approved Members List */}
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Approved Members</h3>
              {isLoadingApprovedMembers ? (
                <p className="text-slate-600">Loading members...</p>
              ) : approvedMembers.length === 0 ? (
                <p className="text-slate-600">No approved members yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Company</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedMembers.map((member) => (
                        <tr key={member.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">{member.email}</td>
                          <td className="px-4 py-3 text-slate-600">{member.name}</td>
                          <td className="px-4 py-3 text-slate-600">{member.company}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteApprovedMember(member.id)}
                              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <DocumentUploadForm
            documentType={documentType as any}
            documentFile={documentFile}
            documentName={documentName}
            documentDescription={documentDescription}
            isUploading={isUploadingDocument}
            allDocuments={allDocuments}
            isLoadingDocuments={isLoadingDocuments}
            onFileChange={setDocumentFile}
            onDocumentNameChange={setDocumentName}
            onDescriptionChange={setDocumentDescription}
            onDocumentTypeChange={setDocumentType}
            onUpload={handleUploadDocument}
            onDelete={handleDeleteDocument}
            onEditType={handleEditDocumentType}
          />
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {isLoadingMembers ? (
              <div className="bg-white rounded-xl shadow p-6 text-center text-slate-600">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-center text-slate-600">
                <p>No members with submitted actions found.</p>
                <p className="text-sm mt-2">Members will appear here once they submit impact actions.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <div key={member.company} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                      {/* Member Image */}
                      {member.image ? (
                        <div className="relative h-48 bg-slate-100 overflow-hidden rounded-t-xl">
                          <img
                            src={member.image}
                            alt={member.company}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center">
                          <p className="text-slate-400 text-sm">No image</p>
                        </div>
                      )}

                      {/* Member Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{member.company}</h3>
                          <p className="text-xs text-slate-500 mt-1">{member.sector || "—"}</p>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{member.description || "No description"}</p>
                        <button
                          onClick={() => handleStartEditMember(member)}
                          className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Edit Member Modal */}
            {editingMember && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Edit {editingMember.company}</h2>
                    <button
                      onClick={handleCancelEditMember}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                    {/* Company Name (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={editingMember.company}
                        disabled
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Sector */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sector
                      </label>
                      <select
                        value={editingMember.sector}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            sector: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select a sector...</option>
                        <option value="Mining">Mining</option>
                        <option value="Oil & Gas">Oil & Gas</option>
                        <option value="Financial Services">Financial Services</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Telecommunications">Telecommunications</option>
                        <option value="Security">Security</option>
                        <option value="Retail">Retail</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Engineering & Consulting">Engineering & Consulting</option>
                        <option value="Investment">Investment</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingMember.description}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter company description..."
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cover Image
                      </label>
                      <div className="space-y-3">
                        {editingMember.image && (
                          <div className="relative h-40 rounded-lg overflow-hidden bg-slate-100">
                            <img
                              src={editingMember.image}
                              alt={editingMember.company}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMemberImageSelect}
                            className="hidden"
                            id={`image-input-${editingMember.company}`}
                          />
                          <label
                            htmlFor={`image-input-${editingMember.company}`}
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload size={24} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">
                              Click to upload new image
                            </span>
                            <span className="text-xs text-slate-500">PNG, JPG up to 10MB</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="border-t border-slate-200 p-6 flex gap-3">
                    <button
                      onClick={handleCancelEditMember}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMember}
                      disabled={isSavingMember}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSavingMember ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
