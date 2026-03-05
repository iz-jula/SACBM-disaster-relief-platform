import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  CheckCircle,
  Clock,
  MapPin,
  ImagePlus,
  X,
  Plus,
  Edit2,
  Trash2,
  Lock,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  getAchievements,
  getAchievementsMetrics,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  Achievement,
  AchievementsMetrics,
} from "@/services/achievementsService";
import { getIngdDocuments } from "@/services/supabaseService";
import type { IngdDocument } from "@/services/supabaseService";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-blue-100 text-blue-800",
  Clothing: "bg-green-100 text-green-800",
  Materials: "bg-orange-100 text-orange-800",
  Medical: "bg-red-100 text-red-800",
  Shelter: "bg-purple-100 text-purple-800",
  Water: "bg-cyan-100 text-cyan-800",
  Evacuation: "bg-yellow-100 text-yellow-800",
  Multiple: "bg-pink-100 text-pink-800",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-50 border-green-200 text-green-900",
  in_progress: "bg-blue-50 border-blue-200 text-blue-900",
  pending: "bg-yellow-50 border-yellow-200 text-yellow-900",
};

// Format numbers with . for thousands and , for decimals (European format)
const formatNumber = (value: number, decimals: number = 0): string => {
  const fixed = value.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');

  // Add thousands separator with dots
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Combine with comma as decimal separator
  return decimal ? `${withThousands},${decimal}` : withThousands;
};

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle size={16} className="text-green-600" />;
    case "in_progress":
      return <Clock size={16} className="text-blue-600" />;
    case "pending":
      return <Clock size={16} className="text-yellow-600" />;
    default:
      return null;
  }
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [metrics, setMetrics] = useState<AchievementsMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Mozambique locations/districts
  const mozambiqueLocations = [
    "Maputo",
    "Gaza",
    "Inhambane",
    "Sofala",
    "Manica",
    "Tete",
    "Zambezia",
    "Nampula",
    "Cabo Delgado",
    "Niassa",
  ];
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [editingAchievementId, setEditingAchievementId] = useState<string>("");
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "delete" | "edit";
    achievementId: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageArray, setSelectedImageArray] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [displayedAchievementsCount, setDisplayedAchievementsCount] = useState(15);
  const [hiddenContributions, setHiddenContributions] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    company_name: "",
    type_action: "",
    description: "",
    category: "Food" as const,
    province: "",
    district: "",
    partner_organisation: "",
    people_impacted: "",
    amount: "",
    hide_amount: false,
    media: null as string | null,
    documents: null as string | null,
  });

  const [customTypeAction, setCustomTypeAction] = useState("");
  const [customPartnerOrg, setCustomPartnerOrg] = useState("");
  const [actionDocuments, setActionDocuments] = useState<IngdDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  useEffect(() => {
    loadData();
    loadActionDocuments();
  }, [selectedCategory]);

  const loadActionDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const documents = await getIngdDocuments();
      // Filter for action documents
      const actionDocs = documents?.filter(doc => doc.type === "actions") || [];
      setActionDocuments(actionDocs);
    } catch (error) {
      console.error("Error loading action documents:", error);
      setActionDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [achievementsData, metricsData] = await Promise.all([
        getAchievements(undefined, selectedCategory || undefined),
        getAchievementsMetrics(),
      ]);
      setAchievements(achievementsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedMedia([...uploadedMedia, ...Array.from(files)]);
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(uploadedMedia.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Filter for document types only (PDF, DOC, XLS, etc.)
      const documentFiles = Array.from(files).filter(file => {
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'application/vnd.oasis.opendocument.text'
        ];
        return validTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|xls|xlsx|txt|odt)$/i);
      });
      setUploadedDocuments([...uploadedDocuments, ...documentFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted, editingAchievementId:", editingAchievementId);

    if (editingAchievementId) {
      // For editing, check permissions
      setPendingAction({ type: "edit", achievementId: editingAchievementId });
      setShowAuthModal(true);
      setAuthPassword("");
      setAuthError("");
    } else {
      // For creating new achievements, directly submit
      try {
        console.log("Creating new achievement with data:", formData);

        // Validate required fields
        if (
          !formData.company_name ||
          !formData.type_action ||
          !formData.description ||
          !formData.province
        ) {
          alert(
            "Please fill in all required fields: Company Name, Type of Action, Province, and Description",
          );
          return;
        }

        // Validate custom type of action if OTHER is selected
        if (formData.type_action === "Other - please specify" && !customTypeAction.trim()) {
          alert("Please specify the type of action");
          return;
        }

        // Validate custom partner organisation if OTHER is selected
        if (formData.partner_organisation === "OTHER - Please specify" && !customPartnerOrg.trim()) {
          alert("Please specify the organisation name");
          return;
        }

        // Convert all uploaded media to base64 array
        let imageData: string | null = null;
        if (uploadedMedia.length > 0) {
          console.log("Processing", uploadedMedia.length, "images...");
          const mediaArray: string[] = [];

          for (const file of uploadedMedia) {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.onerror = () => {
                console.error("FileReader error:", reader.error);
                reject(reader.error);
              };
              reader.readAsDataURL(file);
            });
            mediaArray.push(base64);
          }

          // Store as JSON array
          imageData = JSON.stringify(mediaArray);
          console.log("Images converted to base64 array");
        }

        // Convert all uploaded documents to base64 array
        let documentData: string | null = null;
        if (uploadedDocuments.length > 0) {
          console.log("Processing", uploadedDocuments.length, "documents...");
          const documentArray: string[] = [];

          for (const file of uploadedDocuments) {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.onerror = () => {
                console.error("FileReader error:", reader.error);
                reject(reader.error);
              };
              reader.readAsDataURL(file);
            });
            documentArray.push(base64);
          }

          // Store as JSON array with file metadata
          documentData = JSON.stringify(documentArray.map((doc, idx) => ({
            data: doc,
            name: uploadedDocuments[idx].name,
            type: uploadedDocuments[idx].type,
          })));
          console.log("Documents converted to base64 array");
        }

        // Combine custom values with "Other -" prefix
        const typeActionValue =
          formData.type_action === "Other - please specify"
            ? `OTHER - ${customTypeAction}`
            : formData.type_action;

        const partnerOrgValue =
          formData.partner_organisation === "OTHER - Please specify"
            ? `OTHER - ${customPartnerOrg}`
            : formData.partner_organisation || null;

        const newAchievementData = {
          company_name: formData.company_name,
          type_action: typeActionValue,
          description: formData.description,
          category: formData.category as
            | "Food"
            | "Clothing"
            | "Materials"
            | "Medical"
            | "Shelter"
            | "Water"
            | "Evacuation"
            | "Multiple",
          location: formData.district ? `${formData.province}, ${formData.district}` : formData.province,
          partner_organisation: partnerOrgValue,
          people_impacted: parseInt(formData.people_impacted) || 0,
          amount: parseInt(formData.amount) || 0,
          media: imageData || null,
          documents: documentData || null,
        };

        console.log("Sending achievement data:", newAchievementData);
        const result = await createAchievement(newAchievementData);
        console.log("Achievement creation result:", result);

        if (result) {
          setFormData({
            company_name: "",
            type_action: "",
            description: "",
            category: "Food",
            province: "",
            district: "",
            partner_organisation: "",
            people_impacted: "",
            amount: "",
            hide_amount: false,
    media: null as string | null,
            documents: null as string | null,
          });
          setCustomTypeAction("");
          setCustomPartnerOrg("");
          setUploadedMedia([]);
          setUploadedDocuments([]);
          setShowForm(false);
          await loadData();
          alert("Action submitted successfully!");
        } else {
          alert("Failed to submit action. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting achievement:", error);
        alert(
          "Error: " +
            (error instanceof Error
              ? error.message
              : "Failed to submit action"),
        );
      }
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setEditingAchievementId(achievement.id?.toString() || "");

    // Parse location into province and district
    const [province, district] = achievement.location.includes(", ")
      ? achievement.location.split(", ")
      : [achievement.location, ""];

    setFormData({
      company_name: achievement.company_name,
      type_action: achievement.type_action,
      description: achievement.description,
      category: achievement.category,
      province: province,
      district: district,
      partner_organisation: achievement.partner_organisation || "",
      people_impacted: achievement.people_impacted.toString(),
      amount: achievement.amount.toString(),
      hide_amount: false,
      media: achievement.media || null,
      documents: (achievement as any).documents || null,
    });
    setShowEditModal(true);
  };

  const handleDeleteAchievement = (
    achievementId: number | string | undefined,
  ) => {
    if (!window.confirm("Delete this action? This cannot be undone.")) {
      return;
    }
    setPendingAction({
      type: "delete",
      achievementId: achievementId?.toString() || "",
    });
    setShowAuthModal(true);
    setAuthPassword("");
    setAuthError("");
  };

  const verifyAuthAndExecute = async () => {
    const adminPassword = "vilankulos2025";
    const isAdmin = authPassword === adminPassword;

    if (!pendingAction) {
      setAuthError("No action to execute");
      return;
    }

    const achievement = achievements.find(
      (a) => a.id?.toString() === pendingAction.achievementId,
    );

    // For non-admin, check if password matches the company name
    if (!isAdmin && achievement) {
      if (authPassword !== achievement.company_name) {
        setAuthError(
          "Invalid password. Use the company name or admin password.",
        );
        return;
      }
    } else if (!isAdmin) {
      setAuthError("Invalid password");
      return;
    }

    // Execute action
    try {
      if (pendingAction.type === "delete") {
        const success = await deleteAchievement(pendingAction.achievementId);
        if (success) {
          setAchievements((prevAchievements) =>
            prevAchievements.filter(
              (a) => a.id?.toString() !== pendingAction.achievementId,
            ),
          );
          setShowAuthModal(false);
          setAuthPassword("");
          setPendingAction(null);
          await loadData();
        } else {
          setAuthError("Failed to delete achievement");
        }
      } else if (pendingAction.type === "edit") {
        // Update the achievement
        let mediaData: string | null | undefined = undefined;

        // Handle newly uploaded media - convert all files to base64
        if (uploadedMedia.length > 0) {
          const mediaArray: string[] = [];

          for (const file of uploadedMedia) {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.onerror = () => {
                reject(reader.error);
              };
              reader.readAsDataURL(file);
            });
            mediaArray.push(base64);
          }

          // Store as JSON array of base64 strings
          mediaData = JSON.stringify(mediaArray);
          console.log("Converted", uploadedMedia.length, "files to base64 array");
        }

        // Handle newly uploaded documents - convert all files to base64
        let documentData: string | null | undefined = undefined;
        if (uploadedDocuments.length > 0) {
          const documentArray: string[] = [];

          for (const file of uploadedDocuments) {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.onerror = () => {
                reject(reader.error);
              };
              reader.readAsDataURL(file);
            });
            documentArray.push(base64);
          }

          // Store as JSON array with metadata
          documentData = JSON.stringify(documentArray.map((doc, idx) => ({
            data: doc,
            name: uploadedDocuments[idx].name,
            type: uploadedDocuments[idx].type,
          })));
          console.log("Converted", uploadedDocuments.length, "documents to base64 array");
        }

        // Validate custom fields
        if (formData.type_action === "Other - please specify" && !customTypeAction.trim()) {
          setAuthError("Please specify the type of action");
          return;
        }

        if (formData.partner_organisation === "OTHER - Please specify" && !customPartnerOrg.trim()) {
          setAuthError("Please specify the organisation name");
          return;
        }

        // Combine custom values with "Other -" prefix
        const typeActionValue =
          formData.type_action === "Other - please specify"
            ? `OTHER - ${customTypeAction}`
            : formData.type_action;

        const partnerOrgValue =
          formData.partner_organisation === "OTHER - Please specify"
            ? `OTHER - ${customPartnerOrg}`
            : formData.partner_organisation || null;

        const updateData: any = {
          company_name: formData.company_name,
          type_action: typeActionValue,
          description: formData.description,
          category: formData.category as
            | "Food"
            | "Clothing"
            | "Materials"
            | "Medical"
            | "Shelter"
            | "Water"
            | "Evacuation"
            | "Multiple",
          location: formData.district ? `${formData.province}, ${formData.district}` : formData.province,
          partner_organisation: partnerOrgValue,
          people_impacted: parseInt(formData.people_impacted) || 0,
          amount: parseInt(formData.amount) || 0,
        };

        // Handle media updates
        if (mediaData !== undefined) {
          // User uploaded new media
          updateData.media = mediaData;
          console.log("Updating with new media");
        } else if (formData.media !== null && uploadedMedia.length === 0) {
          // Keep existing media - only include if they didn't upload new files
          updateData.media = formData.media;
          console.log("Keeping existing media");
        } else if (formData.media === null && uploadedMedia.length === 0) {
          // Media was removed
          updateData.media = null;
          console.log("Removing media");
        }

        // Handle document updates
        if (documentData !== undefined) {
          // User uploaded new documents
          updateData.documents = documentData;
          console.log("Updating with new documents");
        } else if (formData.documents !== null && uploadedDocuments.length === 0) {
          // Keep existing documents - only include if they didn't upload new files
          updateData.documents = formData.documents;
          console.log("Keeping existing documents");
        } else if (formData.documents === null && uploadedDocuments.length === 0) {
          // Documents were removed
          updateData.documents = null;
          console.log("Removing documents");
        }

        console.log("Updating achievement with id:", pendingAction.achievementId, "Data:", updateData);

        try {
          await updateAchievement(
            pendingAction.achievementId,
            updateData,
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
          setAuthError("Failed to save: " + errorMsg);
          console.error("Update failed:", error);
          return;
        }

        // If we get here, update was successful
        setEditingAchievementId("");
        setUploadedMedia([]);
        setFormData({
          company_name: "",
          type_action: "",
          description: "",
          category: "Food",
          province: "",
          district: "",
          partner_organisation: "",
          people_impacted: "",
          amount: "",
          hide_amount: false,
    media: null as string | null,
            documents: null as string | null,
        });
        setCustomTypeAction("");
        setCustomPartnerOrg("");
        setUploadedMedia([]);
        setUploadedDocuments([]);
        setShowForm(false);
        setShowEditModal(false);
        setEditingAchievement(null);
        setShowAuthModal(false);
        setAuthPassword("");
        setPendingAction(null);
        await loadData();
        alert("Action updated successfully!");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Action failed. Please try again.";
      setAuthError(errorMessage);
      console.error("Error executing action:", errorMessage);
    }
  };

  const toggleSelectAchievement = (id: string) => {
    const newSelected = new Set(selectedAchievements);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAchievements(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedAchievements.size === achievements.length) {
      setSelectedAchievements(new Set());
    } else {
      const allIds = new Set(achievements.map(a => a.id?.toString() || ""));
      setSelectedAchievements(allIds);
    }
  };

  const categories = [
    "Food",
    "Clothing",
    "Materials",
    "Medical",
    "Shelter",
    "Water",
    "Evacuation",
    "Multiple",
  ];

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Member Actions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Track community work and contributions beyond relief requests
          </p>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  Total Actions
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  {metrics.totalAchievements}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Member contributions
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  People Impacted
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  {formatNumber(metrics.totalPeopleImpacted || 0)}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Direct impact
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  Total Contribution
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary mt-1 sm:mt-2">
                  {formatNumber((metrics.totalContributed || 0) / 1000, 1)}K MZN
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Funds invested
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  Completed
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  {metrics.completedAchievements}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Successfully done
              </p>
            </div>
          </div>
        )}

        {/* Submit Achievement Form */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <button
            onClick={() => {
              if (editingAchievementId) {
                setEditingAchievementId("");
                setFormData({
                  company_name: "",
                  type_action: "",
                  description: "",
                  category: "Food",
                  province: "",
            district: "",
                  partner_organisation: "",
                  people_impacted: "",
                  amount: "",
                  hide_amount: false,
    media: null as string | null,
                  documents: null as string | null,
                });
                setUploadedMedia([]);
                setUploadedDocuments([]);
              }
              setShowForm(!showForm);
            }}
            className="w-full flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-blue-50 to-primary/5 hover:from-blue-100 hover:to-primary/10 transition-all border-b border-slate-200"
          >
            <div className="flex items-center gap-3">
              <Plus size={20} className="text-primary" />
              <h3 className="font-semibold text-slate-900">
                {editingAchievementId ? "Edit Action" : "Submit Your Action"}
              </h3>
            </div>
            <span className="text-slate-600">{showForm ? "−" : "+"}</span>
          </button>

          {showForm && (
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Organization Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type of Action *
                  </label>
                  <select
                    required
                    value={formData.type_action}
                    onChange={(e) => {
                      setFormData({ ...formData, type_action: e.target.value });
                      if (e.target.value !== "Other - please specify") {
                        setCustomTypeAction("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select type of action</option>
                    <option>Evacuation</option>
                    <option>Cash donation</option>
                    <option>Goods donation</option>
                    <option>Other - please specify</option>
                  </select>
                </div>

                {/* Custom Type of Action - Show when OTHER is selected */}
                {formData.type_action === "Other - please specify" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Please specify action type *
                    </label>
                    <input
                      type="text"
                      value={customTypeAction}
                      onChange={(e) => setCustomTypeAction(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Training, Advocacy, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Food</option>
                    <option>Clothing</option>
                    <option>Materials</option>
                    <option>Medical</option>
                    <option>Shelter</option>
                    <option>Water</option>
                    <option>Evacuation</option>
                    <option>Multiple</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Province *
                  </label>
                  <select
                    required
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a province</option>
                    {mozambiqueLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Chokwe, Xai-Xai (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Partner Organisation (if applicable)
                  </label>
                  <select
                    value={formData.partner_organisation}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        partner_organisation: e.target.value,
                      });
                      if (e.target.value !== "OTHER - Please specify") {
                        setCustomPartnerOrg("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select organisation</option>
                    <option>FDC</option>
                    <option>UNICEF</option>
                    <option>CARE MOZAMBIQUE</option>
                    <option>REPENSAR</option>
                    <option>RESILIÊNCIA</option>
                    <option>OTHER - Please specify</option>
                  </select>
                </div>

                {/* Custom Partner Organisation - Show when OTHER is selected */}
                {formData.partner_organisation === "OTHER - Please specify" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Please specify organisation *
                    </label>
                    <input
                      type="text"
                      value={customPartnerOrg}
                      onChange={(e) => setCustomPartnerOrg(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Red Cross, WHO, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    People Impacted
                  </label>
                  <input
                    type="number"
                    value={formData.people_impacted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        people_impacted: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount (MZN)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="8500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="hide-amount"
                  checked={formData.hide_amount}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      hide_amount: e.target.checked,
                    });
                    // Toggle the visibility for this achievement in the list
                    if (editingAchievementId) {
                      const newHidden = new Set(hiddenContributions);
                      if (e.target.checked) {
                        newHidden.add(editingAchievementId);
                      } else {
                        newHidden.delete(editingAchievementId);
                      }
                      setHiddenContributions(newHidden);
                    }
                  }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="hide-amount" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Hide contribution value from public view
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your action..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Media
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                    accept="image/*,.pdf"
                  />
                  <label
                    htmlFor="media-upload"
                    className="flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImagePlus size={20} className="text-slate-600" />
                    <span className="text-sm text-slate-600">
                      Click to upload
                    </span>
                  </label>
                </div>

                {uploadedMedia.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedMedia.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded"
                      >
                        <span className="text-sm text-slate-700">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Attach Documents (Optional)
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Upload supporting documents like receipts, invoices, or reports (PDF, DOC, XLS)
                </p>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.odt"
                  />
                  <label
                    htmlFor="document-upload"
                    className="flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={20} className="text-slate-600" />
                    <span className="text-sm text-slate-600">
                      Click to upload documents
                    </span>
                  </label>
                </div>

                {uploadedDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-slate-600">
                      Uploaded Files ({uploadedDocuments.length})
                    </p>
                    {uploadedDocuments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded"
                      >
                        <span className="text-sm text-slate-700">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90"
                >
                  {editingAchievementId ? "Save Changes" : "Submit Action"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setUploadedMedia([]);
                    setUploadedDocuments([]);
                    setEditingAchievementId("");
                    setFormData({
                      company_name: "",
                      type_action: "",
                      description: "",
                      category: "Food",
                      province: "",
            district: "",
                      partner_organisation: "",
                      people_impacted: "",
                      amount: "",
                      hide_amount: false,
    media: null as string | null,
                      documents: null as string | null,
                    });
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 text-sm rounded-full ${selectedCategory === null ? "bg-primary text-white" : "bg-slate-100"}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-sm rounded-full ${selectedCategory === cat ? "bg-primary text-white" : "bg-slate-100"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Member / Organization
              </p>
              <select
                value={selectedCompany || ""}
                onChange={(e) => setSelectedCompany(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All Members</option>
                {Array.from(new Set(achievements.map((a) => a.company_name)))
                  .sort()
                  .map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Member Work List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3 flex-1">
                {achievements.length > 0 && (
                  <input
                    type="checkbox"
                    checked={selectedAchievements.size === achievements.length && achievements.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                    title="Select all actions"
                  />
                )}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    MEMBER ACTIONS
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {(() => {
                      const filtered = selectedCompany
                        ? achievements.filter((a) => a.company_name === selectedCompany)
                        : achievements;
                      return `${filtered.length} action${filtered.length !== 1 ? "s" : ""}`;
                    })()}
                  </p>
                </div>
              </div>
              {selectedAchievements.size > 0 && (
                <span className="text-sm font-medium text-slate-600">
                  {selectedAchievements.size} selected
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {isLoading ? (
              <div className="p-6 text-center text-slate-600">Loading...</div>
            ) : achievements.length > 0 ? (
              achievements
                .filter((a) => (selectedCompany ? a.company_name === selectedCompany : true))
                .slice(0, displayedAchievementsCount)
                .map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white hover:shadow-lg transition-shadow border-b border-slate-200 last:border-b-0"
                >
                  {/* Card Header */}
                  <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedAchievements.has(achievement.id?.toString() || "")}
                        onChange={() => toggleSelectAchievement(achievement.id?.toString() || "")}
                        className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                        <CheckCircle size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">
                          {achievement.type_action}
                        </h3>
                        <p className="text-sm sm:text-base font-bold text-slate-700">
                          {achievement.company_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${CATEGORY_COLORS[achievement.category]}`}
                      >
                        {achievement.category}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditAchievement(achievement)}
                          className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          title="Edit action"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAchievement(
                              achievement.id?.toString() || "",
                            )
                          }
                          className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete action"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 space-y-4">
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {achievement.description}
                    </p>

                    {/* Image and Metrics Row */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {achievement.media && (
                        <div className="sm:w-32 flex-shrink-0">
                          {(() => {
                            try {
                              const mediaArray = JSON.parse(achievement.media);
                              if (Array.isArray(mediaArray) && mediaArray.length > 0) {
                                return (
                                  <div className="flex flex-col gap-2">
                                    <img
                                      src={mediaArray[0]}
                                      alt={achievement.type_action}
                                      className="h-24 w-full sm:w-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => {
                                        setSelectedImageArray(mediaArray);
                                        setCurrentImageIndex(0);
                                        setSelectedImage(mediaArray[0]);
                                      }}
                                      title={mediaArray.length > 1 ? `Click to view (${mediaArray.length} images)` : "Click to view"}
                                    />
                                    {mediaArray.length > 1 && (
                                      <div className="text-xs text-center text-slate-500 font-medium">
                                        +{mediaArray.length - 1} more
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            } catch (e) {
                              // Fallback for single image stored as string
                              return (
                                <img
                                  src={achievement.media}
                                  alt={achievement.type_action}
                                  className="h-24 w-full sm:w-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    setSelectedImageArray([achievement.media!]);
                                    setCurrentImageIndex(0);
                                    setSelectedImage(achievement.media || null);
                                  }}
                                />
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}

                      {/* Metrics */}
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            Location
                          </p>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                            <MapPin size={16} className="text-slate-400" />
                            <span className="line-clamp-2">
                              {achievement.location}
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            People Impacted
                          </p>
                          <div className="text-sm font-semibold text-slate-900">
                            {formatNumber(achievement.people_impacted)}
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                          <p className="text-xs text-orange-600 font-medium mb-1">
                            Contribution
                          </p>
                          <p className={`text-lg font-bold text-primary ${hiddenContributions.has(achievement.id?.toString() || "") ? 'blur-sm' : ''}`}>
                            {formatNumber((achievement.amount / 1000), 1)}K
                            <span className="text-xs ml-0.5">MZN</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Partner Organisation */}
                    {achievement.partner_organisation && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Partner</p>
                        <p className="text-sm font-medium text-slate-700">
                          {achievement.partner_organisation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-600">
                No actions found
              </div>
            )}
          </div>

          {/* Load More Button */}
          {achievements.length > displayedAchievementsCount && (
            <div className="p-4 sm:p-6 border-t border-slate-200 text-center">
              <button
                onClick={() => setDisplayedAchievementsCount(prev => prev + 15)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Load More ({displayedAchievementsCount} of {achievements.length})
              </button>
            </div>
          )}
        </div>

        {/* Action Documents Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              📄 Action Resources & Guidelines
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Download documentation and guidelines for action submissions
            </p>
          </div>

          {isLoadingDocuments ? (
            <div className="p-6 text-center text-slate-600">
              Loading documents...
            </div>
          ) : actionDocuments.length === 0 ? (
            <div className="p-6 text-center text-slate-600">
              <p className="font-medium">No resources available yet</p>
              <p className="text-sm mt-2">Check back soon for action guidelines and documentation</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {actionDocuments.map((doc) => (
                <div key={doc.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Download size={18} className="text-amber-600 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-900 break-words">
                          {doc.file_name}
                        </h3>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded whitespace-nowrap">
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
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Authentication Modal for Edit/Delete */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Verify Permission
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                {pendingAction?.type === "edit"
                  ? "To save changes, confirm your identity"
                  : "To delete this action, confirm your identity"}
              </p>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {pendingAction?.achievementId
                      ? `Company Name or Admin Password`
                      : "Admin Password"}
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        verifyAuthAndExecute();
                      }
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Use the company name or the admin password
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      setAuthPassword("");
                      setAuthError("");
                      setPendingAction(null);
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyAuthAndExecute}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Action Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-primary/5 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Edit Action</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
        setEditingAchievement(null);
                    setEditingAchievementId("");
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({ ...formData, company_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Organization Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type of Action *
                    </label>
                    <select
                      required
                      value={formData.type_action}
                      onChange={(e) => {
                        setFormData({ ...formData, type_action: e.target.value });
                        if (e.target.value !== "Other - please specify") {
                          setCustomTypeAction("");
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select type of action</option>
                      <option>Evacuation</option>
                      <option>Cash donation</option>
                      <option>Goods donation</option>
                      <option>Other - please specify</option>
                    </select>
                  </div>

                  {/* Custom Type of Action - Show when OTHER is selected */}
                  {formData.type_action === "Other - please specify" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Please specify action type *
                      </label>
                      <input
                        type="text"
                        value={customTypeAction}
                        onChange={(e) => setCustomTypeAction(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Training, Advocacy, etc."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Food</option>
                      <option>Clothing</option>
                      <option>Materials</option>
                      <option>Medical</option>
                      <option>Shelter</option>
                      <option>Water</option>
                      <option>Evacuation</option>
                      <option>Multiple</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Province *
                    </label>
                    <select
                      required
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select a province</option>
                      {mozambiqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Chokwe, Xai-Xai (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Partner Organisation (if applicable)
                    </label>
                    <select
                      value={formData.partner_organisation}
                      onChange={(e) => {
                      setFormData({
                        ...formData,
                        partner_organisation: e.target.value,
                      });
                      if (e.target.value !== "OTHER - Please specify") {
                        setCustomPartnerOrg("");
                      }
                    }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select organisation</option>
                      <option>FDC</option>
                      <option>UNICEF</option>
                      <option>CARE MOZAMBIQUE</option>
                      <option>REPENSAR</option>
                      <option>RESILIÊNCIA</option>
                      <option>OTHER - Please specify</option>
                    </select>
                  </div>

                {/* Custom Partner Organisation - Show when OTHER is selected */}
                {formData.partner_organisation === "OTHER - Please specify" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Please specify organisation *
                    </label>
                    <input
                      type="text"
                      value={customPartnerOrg}
                      onChange={(e) => setCustomPartnerOrg(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Red Cross, WHO, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    People Impacted
                  </label>
                  <input
                    type="number"
                    value={formData.people_impacted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        people_impacted: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount (MZN)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="8500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="hide-amount-modal"
                    checked={formData.hide_amount}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        hide_amount: e.target.checked,
                      });
                      // Toggle the visibility for this achievement in the list
                      if (editingAchievementId) {
                        const newHidden = new Set(hiddenContributions);
                        if (e.target.checked) {
                          newHidden.add(editingAchievementId);
                        } else {
                          newHidden.delete(editingAchievementId);
                        }
                        setHiddenContributions(newHidden);
                      }
                    }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="hide-amount-modal" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Hide contribution value from public view
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe your action..."
                    rows={3}
                  />
                </div>

                {/* Media Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Media (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleMediaUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="media-upload-edit"
                    />
                    <label
                      htmlFor="media-upload-edit"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <ImagePlus size={20} className="text-slate-600" />
                      <span className="text-sm text-slate-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-slate-500">
                        PNG, JPG, GIF or PDF (max 10MB)
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Media Preview */}
                  {uploadedMedia.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        Uploaded Files ({uploadedMedia.length})
                      </p>
                      {uploadedMedia.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <span className="text-sm text-slate-700 truncate">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove file"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setUploadedMedia([])}
                        className="text-sm text-slate-500 hover:text-slate-700 mt-2"
                      >
                        Clear all files
                      </button>
                    </div>
                  )}

                  {/* Existing Media Display */}
                  {editingAchievementId && editingAchievement?.media && uploadedMedia.length === 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">Current Media</p>
                      {(() => {
                        try {
                          const mediaArray = JSON.parse(editingAchievement.media);
                          if (Array.isArray(mediaArray) && mediaArray.length > 0) {
                            return (
                              <div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  {mediaArray.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`Current media ${idx + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{mediaArray.length} image{mediaArray.length !== 1 ? 's' : ''}</p>
                              </div>
                            );
                          }
                        } catch (e) {
                          // Single image fallback
                          return (
                            <img
                              src={editingAchievement.media}
                              alt="Current action media"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          );
                        }
                        return null;
                      })()}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, media: null });
                        }}
                        className="mt-2 w-full text-sm text-red-600 hover:text-red-700 font-medium py-1"
                      >
                        Remove Current Media
                      </button>
                    </div>
                  )}
                </div>

                {/* Document Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Attach Documents (Optional)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Upload supporting documents like receipts, invoices, or reports
                  </p>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.odt"
                      className="hidden"
                      id="document-upload-edit"
                    />
                    <label
                      htmlFor="document-upload-edit"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Download size={20} className="text-slate-600" />
                      <span className="text-sm text-slate-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-slate-500">
                        PDF, DOC, XLS and other documents
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Documents Preview */}
                  {uploadedDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        Uploaded Files ({uploadedDocuments.length})
                      </p>
                      {uploadedDocuments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                        >
                          <span className="text-sm text-slate-700 truncate">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove file"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setUploadedDocuments([])}
                        className="text-sm text-slate-500 hover:text-slate-700 mt-2"
                      >
                        Clear all files
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
        setEditingAchievement(null);
                      setEditingAchievementId("");
                      setFormData({
                        company_name: "",
                        type_action: "",
                        description: "",
                        category: "Food",
                        province: "",
            district: "",
                        partner_organisation: "",
                        people_impacted: "",
                        amount: "",
                        hide_amount: false,
    media: null as string | null,
                      });
                    }}
                    className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="max-w-4xl max-h-[90vh] relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors bg-black/50 rounded-full p-2 z-10"
              >
                <X size={24} />
              </button>

              {/* Image Container */}
              <div className="relative flex-1 flex items-center justify-center">
                <img
                  src={selectedImageArray[currentImageIndex] || selectedImage}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain rounded-lg"
                />

                {/* Navigation Arrows */}
                {selectedImageArray.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : selectedImageArray.length - 1))}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      title="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev < selectedImageArray.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      title="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Image Counter */}
              {selectedImageArray.length > 1 && (
                <div className="text-center text-white mt-4 text-sm font-medium bg-black/50 rounded-lg py-2">
                  {currentImageIndex + 1} of {selectedImageArray.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
