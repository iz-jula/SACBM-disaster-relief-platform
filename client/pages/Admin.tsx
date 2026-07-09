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
import { getIngdDocuments, createIngdDocument, deleteIngdDocument, updateIngdDocument, uploadDocumentToStorage, getIngdActiveSetting, setIngdActiveSetting, getCarouselImages, createCarouselImage, deleteCarouselImage, getApprovedMembers, createApprovedMember, deleteApprovedMember } from "@/services/supabaseService";
import type { RelieRequest, IngdRequest, IngdDocument, CarouselImage, ApprovedMember } from "@/services/supabaseService";
import { getAllEvents, createEvent, updateEvent, deleteEvent, getCategories, type Event, type HelpNeed } from "@/services/eventsService";

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
    "menu" | "ingd" | "carousel" | "documents" | "member-access" | "users" | "connectivity" | "requests" | "events"
  >("menu");
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
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [isLoadingCarousel, setIsLoadingCarousel] = useState(false);
  const [newCarouselUrl, setNewCarouselUrl] = useState("");
  const [newCarouselTitle, setNewCarouselTitle] = useState("");
  const [newCarouselDescription, setNewCarouselDescription] = useState("");

  // Member access management state
  const [approvedMembers, setApprovedMembers] = useState<ApprovedMember[]>([]);
  const [isLoadingApprovedMembers, setIsLoadingApprovedMembers] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberCompany, setNewMemberCompany] = useState("");

  // Events management state
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<Omit<Event, "id">>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    category: "Health & Wellness",
    attendees: 0,
    featured: false,
    helpNeeds: [],
    contactMessage: "",
    image: "",
    gallery: [],
  });
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newHelpNeed, setNewHelpNeed] = useState<HelpNeed>({
    name: "",
    quantity: 0,
    unit: "",
  });
  const [deleteConfirmEventId, setDeleteConfirmEventId] = useState<string | null>(null);

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

  // Load events when events tab is activated
  useEffect(() => {
    if (activeTab === "events") {
      loadEvents();
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
      const images = await getCarouselImages();
      setCarouselImages(images);
    } catch (error) {
      console.error("Error loading carousel images:", error);
    } finally {
      setIsLoadingCarousel(false);
    }
  };

  const handleAddCarouselImage = async () => {
    if (!newCarouselUrl || !newCarouselTitle) {
      alert("Please fill in image URL and title");
      return;
    }

    try {
      const newImage = await createCarouselImage({
        url: newCarouselUrl,
        title: newCarouselTitle,
        description: newCarouselDescription,
        display_order: carouselImages.length,
      });

      if (newImage) {
        setCarouselImages([...carouselImages, newImage]);
        setNewCarouselUrl("");
        setNewCarouselTitle("");
        setNewCarouselDescription("");
        alert("Image added successfully!");
      } else {
        alert("Failed to add image");
      }
    } catch (error) {
      console.error("Error adding carousel image:", error);
      alert("Error adding image");
    }
  };

  const handleDeleteCarouselImage = async (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        const success = await deleteCarouselImage(id);
        if (success) {
          const updatedImages = carouselImages.filter(img => img.id !== id);
          setCarouselImages(updatedImages);
          alert("Image deleted successfully!");
        } else {
          alert("Failed to delete image");
        }
      } catch (error) {
        console.error("Error deleting carousel image:", error);
        alert("Error deleting image");
      }
    }
  };

  const loadApprovedMembers = async () => {
    setIsLoadingApprovedMembers(true);
    try {
      const members = await getApprovedMembers();
      setApprovedMembers(members);
    } catch (error) {
      console.error("Error loading approved members:", error);
    } finally {
      setIsLoadingApprovedMembers(false);
    }
  };

  const handleAddApprovedMember = async () => {
    if (!newMemberEmail || !newMemberName || !newMemberCompany) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const newMember = await createApprovedMember({
        email: newMemberEmail,
        full_name: newMemberName,
        company: newMemberCompany,
      });

      if (newMember) {
        setApprovedMembers([...approvedMembers, newMember]);
        setNewMemberEmail("");
        setNewMemberName("");
        setNewMemberCompany("");
        alert("Member approved successfully!");
      } else {
        alert("Failed to add member");
      }
    } catch (error) {
      console.error("Error adding approved member:", error);
      alert("Error adding member");
    }
  };

  const handleDeleteApprovedMember = async (id: string) => {
    if (confirm("Are you sure you want to remove this member's access?")) {
      try {
        const success = await deleteApprovedMember(id);
        if (success) {
          const updatedMembers = approvedMembers.filter(m => m.id !== id);
          setApprovedMembers(updatedMembers);
          alert("Member access removed successfully!");
        } else {
          alert("Failed to remove member");
        }
      } catch (error) {
        console.error("Error removing approved member:", error);
        alert("Error removing member");
      }
    }
  };

  // ===== EVENTS MANAGEMENT FUNCTIONS =====
  const loadEvents = () => {
    setIsLoadingEvents(true);
    try {
      const allEvents = getAllEvents();
      const categories = getCategories();
      setEvents(allEvents);
      setEventCategories(categories);
      setIsLoadingEvents(false);
    } catch (error) {
      console.error("Error loading events:", error);
      setErrorMessage("Failed to load events");
      setIsLoadingEvents(false);
    }
  };

  const resetEventForm = () => {
    setEventFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      category: "Health & Wellness",
      attendees: 0,
      featured: false,
      helpNeeds: [],
      contactMessage: "",
      image: "",
      gallery: [],
    });
    setNewHelpNeed({ name: "", quantity: 0, unit: "" });
    setEditingEventId(null);
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
    resetEventForm();
  };

  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setEventFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      category: event.category,
      attendees: event.attendees || 0,
      featured: event.featured || false,
      helpNeeds: event.helpNeeds || [],
      contactMessage: event.contactMessage || "",
      image: event.image || "",
      gallery: event.gallery || [],
    });
    setShowEventForm(true);
  };

  const handleSaveEvent = () => {
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!eventFormData.title || !eventFormData.date || !eventFormData.time || !eventFormData.location) {
      setErrorMessage("Please fill in all required fields (Title, Date, Time, Location)");
      return;
    }

    try {
      if (editingEventId) {
        // Update existing event
        const updatedEvent = updateEvent(editingEventId, eventFormData);
        if (updatedEvent) {
          setEvents(events.map((e) => (e.id === editingEventId ? updatedEvent : e)));
          setSuccessMessage("Event updated successfully!");
          setShowEventForm(false);
          resetEventForm();
        } else {
          setErrorMessage("Failed to update event");
        }
      } else {
        // Create new event
        const newEvent = createEvent(eventFormData);
        setEvents([...events, newEvent]);
        setSuccessMessage("Event created successfully!");
        setShowEventForm(false);
        resetEventForm();
      }

      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving event:", error);
      setErrorMessage("Failed to save event");
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const success = deleteEvent(eventId);
        if (success) {
          setEvents(events.filter((e) => e.id !== eventId));
          setSuccessMessage("Event deleted successfully!");
          setDeleteConfirmEventId(null);
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setErrorMessage("Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        setErrorMessage("Failed to delete event");
      }
    }
  };

  const handleAddHelpNeed = () => {
    if (!newHelpNeed.name) {
      setErrorMessage("Please enter a help need name");
      return;
    }

    const updatedHelpNeeds = [...(eventFormData.helpNeeds || []), newHelpNeed];
    setEventFormData({
      ...eventFormData,
      helpNeeds: updatedHelpNeeds,
    });
    setNewHelpNeed({ name: "", quantity: 0, unit: "" });
    setErrorMessage("");
  };

  const handleRemoveHelpNeed = (index: number) => {
    const updatedHelpNeeds = eventFormData.helpNeeds?.filter((_, i) => i !== index) || [];
    setEventFormData({
      ...eventFormData,
      helpNeeds: updatedHelpNeeds,
    });
  };

  const handleAddGalleryImage = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      const updatedGallery = [...(eventFormData.gallery || []), url.trim()];
      setEventFormData({
        ...eventFormData,
        gallery: updatedGallery,
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updatedGallery = eventFormData.gallery?.filter((_, i) => i !== index) || [];
    setEventFormData({
      ...eventFormData,
      gallery: updatedGallery,
    });
  };

  const handleCancelEventForm = () => {
    setShowEventForm(false);
    resetEventForm();
    setErrorMessage("");
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
            {activeTab !== "menu" && (
              <button
                onClick={() => setActiveTab("menu")}
                className="text-sm text-slate-600 hover:text-slate-900 mb-3 flex items-center gap-1 transition-colors"
              >
                ← Back to Dashboard
              </button>
            )}
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === "menu" ? "Admin Dashboard" : "Manage Settings"}
            </h1>
            {activeTab === "menu" && (
              <p className="text-slate-600 mt-1">
                Organize and manage your website
              </p>
            )}
            {user && activeTab === "menu" && (
              <p className="text-xs text-slate-500 mt-2">
                Logged in as: {user.name}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Navigation removed for minimalist design - use sidebar buttons to navigate */}

        {/* Menu/Home Tab */}
        {activeTab === "menu" && (
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900 mb-3">Admin Dashboard</h1>
              <p className="text-base text-slate-600 max-w-2xl">Organize and manage your website, members, and content</p>
            </div>

            {/* Edit Website Section */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Edit Website</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab("members")}
                  className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
                  <h3 className="text-sm font-semibold text-slate-900">Members</h3>
                  <p className="text-xs text-slate-500 mt-1">Company info</p>
                </button>

                <button
                  onClick={() => setActiveTab("carousel")}
                  className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📸</div>
                  <h3 className="text-sm font-semibold text-slate-900">Uploaded Media</h3>
                  <p className="text-xs text-slate-500 mt-1">Home images</p>
                </button>

                <button
                  onClick={() => setActiveTab("ingd")}
                  className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                  <h3 className="text-sm font-semibold text-slate-900">Relief Data</h3>
                  <p className="text-xs text-slate-500 mt-1">INGD requests</p>
                </button>

                <button
                  onClick={() => setActiveTab("documents")}
                  className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                  <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
                  <p className="text-xs text-slate-500 mt-1">Files & docs</p>
                </button>

                <button
                  onClick={() => setActiveTab("events")}
                  className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📅</div>
                  <h3 className="text-sm font-semibold text-slate-900">Events</h3>
                  <p className="text-xs text-slate-500 mt-1">Create & manage</p>
                </button>
              </div>
            </div>

            {/* User Access Section */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">User Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("member-access")}
                  className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎟️</div>
                  <h3 className="text-sm font-semibold text-slate-900">Member Access</h3>
                  <p className="text-xs text-slate-500 mt-1">Approve members</p>
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔐</div>
                  <h3 className="text-sm font-semibold text-slate-900">Admin Users</h3>
                  <p className="text-xs text-slate-500 mt-1">Manage team</p>
                </button>
              </div>
            </div>

            {/* Connectivity Section */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Connectivity</h2>
              <button
                onClick={() => setActiveTab("connectivity")}
                className="bg-white rounded-lg border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group max-w-xs"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
                <h3 className="text-sm font-semibold text-slate-900">Settings</h3>
                <p className="text-xs text-slate-500 mt-1">System config</p>
              </button>
            </div>

            {/* Placeholder to delete old metrics code below */}
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

        {/* Connectivity Tab */}
        {activeTab === "connectivity" && (
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
                          <td className="px-4 py-3 text-slate-600">{member.full_name}</td>
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

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* Messages */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex items-center gap-3">
                <span className="font-bold">✓</span>
                <span>{successMessage}</span>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-center gap-3">
                <span className="font-bold">!</span>
                <span>{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage("")}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Events Management</h2>
                  <p className="text-slate-600">Create, edit, and manage social events with help needs and contact information</p>
                </div>
                {!showEventForm && (
                  <button
                    onClick={handleAddEvent}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    New Event
                  </button>
                )}
              </div>
            </div>

            {/* Event Form or List */}
            {showEventForm ? (
              // EVENT FORM
              <div className="bg-white rounded-xl shadow p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingEventId ? "Edit Event" : "Create New Event"}
                  </h3>
                  <button
                    onClick={handleCancelEventForm}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="border-t border-slate-200 pt-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                      placeholder="e.g., Community Health Drive"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Date and Time Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="text"
                        value={eventFormData.date}
                        onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                        placeholder="e.g., March 15, 2024"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Time *
                      </label>
                      <input
                        type="text"
                        value={eventFormData.time}
                        onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                        placeholder="e.g., 8:00 AM - 2:00 PM"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={eventFormData.location}
                      onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                      placeholder="e.g., Central Health Center, Maputo"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={eventFormData.description}
                      onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                      placeholder="Describe the event in detail..."
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category and Attendees Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category
                      </label>
                      <select
                        value={eventFormData.category}
                        onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Training">Training</option>
                        <option value="Environment">Environment</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Education">Education</option>
                        <option value="Empowerment">Empowerment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Expected Attendees
                      </label>
                      <input
                        type="number"
                        value={eventFormData.attendees || 0}
                        onChange={(e) => setEventFormData({ ...eventFormData, attendees: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={eventFormData.featured}
                      onChange={(e) => setEventFormData({ ...eventFormData, featured: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                      Featured Event (highlight on dashboard)
                    </label>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Main Image URL
                    </label>
                    <input
                      type="text"
                      value={eventFormData.image || ""}
                      onChange={(e) => setEventFormData({ ...eventFormData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {eventFormData.image && (
                      <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border border-slate-200">
                        <img src={eventFormData.image} alt="Preview" className="w-full h-full object-cover" onError={() => {}} />
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-700">Gallery Images</label>
                      <button
                        onClick={handleAddGalleryImage}
                        className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        <Plus size={14} className="inline mr-1" />
                        Add Image
                      </button>
                    </div>
                    {eventFormData.gallery && eventFormData.gallery.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {eventFormData.gallery.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                              onError={() => {}}
                            />
                            <button
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Message
                    </label>
                    <textarea
                      value={eventFormData.contactMessage || ""}
                      onChange={(e) => setEventFormData({ ...eventFormData, contactMessage: e.target.value })}
                      placeholder="e.g., To contribute, please contact Dr. Maria Silva at maria.silva@example.com or call +258 84 123 4567"
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Help Needs Section */}
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Help Needs</h4>

                    {/* Existing Help Needs */}
                    {eventFormData.helpNeeds && eventFormData.helpNeeds.length > 0 && (
                      <div className="mb-6 space-y-2">
                        {eventFormData.helpNeeds.map((need, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{need.name}</p>
                              {need.quantity && (
                                <p className="text-sm text-slate-600">Needed: {need.quantity} {need.unit || "items"}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveHelpNeed(idx)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Help Need */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={newHelpNeed.name}
                          onChange={(e) => setNewHelpNeed({ ...newHelpNeed, name: e.target.value })}
                          placeholder="Help need name (e.g., Hospital beds)"
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={newHelpNeed.quantity || 0}
                          onChange={(e) => setNewHelpNeed({ ...newHelpNeed, quantity: parseInt(e.target.value) || 0 })}
                          placeholder="Quantity"
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={newHelpNeed.unit || ""}
                          onChange={(e) => setNewHelpNeed({ ...newHelpNeed, unit: e.target.value })}
                          placeholder="Unit (e.g., units, sets, boxes)"
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleAddHelpNeed}
                        className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
                      >
                        <Plus size={16} className="inline mr-2" />
                        Add Help Need
                      </button>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="border-t border-slate-200 pt-6 flex gap-3 justify-end">
                    <button
                      onClick={handleCancelEventForm}
                      className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {editingEventId ? "Update Event" : "Create Event"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // EVENTS LIST
              <div className="space-y-4">
                {isLoadingEvents ? (
                  <div className="bg-white rounded-xl shadow p-6 text-center text-slate-600">
                    Loading events...
                  </div>
                ) : events.length === 0 ? (
                  <div className="bg-white rounded-xl shadow p-6 text-center text-slate-600">
                    <p className="text-lg">No events yet. Create your first event to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4 items-start">
                          {/* Event Image */}
                          {event.image && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={() => {}}
                              />
                            </div>
                          )}

                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                                  {event.featured && (
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Featured</span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{event.description}</p>

                                {/* Event Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600">
                                  <div>
                                    <p className="font-medium text-slate-700">Date</p>
                                    <p>{event.date}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-700">Time</p>
                                    <p>{event.time}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-700">Location</p>
                                    <p className="truncate">{event.location}</p>
                                  </div>
                                  {event.attendees && (
                                    <div>
                                      <p className="font-medium text-slate-700">Expected</p>
                                      <p>~{event.attendees} attendees</p>
                                    </div>
                                  )}
                                </div>

                                {/* Help Needs Count */}
                                {event.helpNeeds && event.helpNeeds.length > 0 && (
                                  <p className="text-xs text-emerald-600 font-medium mt-2">
                                    {event.helpNeeds.length} help need{event.helpNeeds.length !== 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEditEvent(event)}
                                  className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                  title="Edit event"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="Delete event"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
