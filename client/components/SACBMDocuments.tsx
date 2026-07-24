import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Search, Upload, Plus, Trash2, MoreHorizontal, Check, Pencil, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Member, Document, MemberRole } from "@shared/api";
import { createSacbmDocumentCategory, deleteSacbmDocument, deleteSacbmDocumentCategory, getSacbmDocumentCategories, getSacbmDocuments, updateSacbmDocument, uploadSacbmDocument } from "@/services/sacbmService";

// Mock documents data
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Chamber By-Laws and Constitution",
    description: "Official governing documents of SACBM",
    category: "governance",
    uploadedBy: "admin",
    uploadedDate: "2024-01-15",
    fileUrl: "/docs/bylaws.pdf",
    fileSize: 2.4,
    isApproved: true,
    approvedBy: "admin",
    approvedDate: "2024-01-15",
    visibility: "all",
  },
  {
    id: "2",
    title: "Board Meeting Minutes - January 2024",
    description: "Minutes from the January board meeting",
    category: "meeting-minutes",
    uploadedBy: "board-secretary",
    uploadedDate: "2024-01-25",
    fileUrl: "/docs/board-minutes-jan.pdf",
    fileSize: 1.8,
    isApproved: true,
    approvedBy: "board-chair",
    approvedDate: "2024-01-26",
    visibility: "board",
  },
  {
    id: "3",
    title: "Member Code of Conduct",
    description: "Standards and expectations for chamber members",
    category: "policy",
    uploadedBy: "admin",
    uploadedDate: "2023-12-01",
    fileUrl: "/docs/code-of-conduct.pdf",
    fileSize: 1.2,
    isApproved: true,
    approvedBy: "admin",
    approvedDate: "2023-12-01",
    visibility: "all",
  },
  {
    id: "4",
    title: "Financial Policy & Budget Guidelines",
    description: "Chamber financial management policies",
    category: "policy",
    uploadedBy: "treasurer",
    uploadedDate: "2024-02-01",
    fileUrl: "/docs/financial-policy.pdf",
    fileSize: 3.1,
    isApproved: true,
    approvedBy: "finance-committee",
    approvedDate: "2024-02-05",
    visibility: "exco",
  },
  {
    id: "5",
    title: "2024 Strategic Plan (Draft)",
    description: "Proposed strategic initiatives for 2024",
    category: "governance",
    uploadedBy: "strategy-committee",
    uploadedDate: "2024-02-10",
    fileUrl: "/docs/strategic-plan-2024.pdf",
    fileSize: 4.5,
    isApproved: false,
    visibility: "board",
  },
];

interface SACBMDocumentsProps {
  member: Member;
}

const SACBMDocuments: React.FC<SACBMDocumentsProps> = ({ member }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
  const [isSelectingDocuments, setIsSelectingDocuments] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    visibility: "all" as "all" | "board" | "exco",
    file: null as File | null,
  });
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setDocumentsLoading(true);
    setDocumentsError("");

    Promise.all([getSacbmDocuments(), getSacbmDocumentCategories()])
      .then(([loadedDocuments, loadedCategories]) => {
        if (cancelled) return;
        setDocuments(loadedDocuments);
        setCustomCategories(loadedCategories);
      })
      .catch((error) => {
        if (!cancelled) setDocumentsError(error instanceof Error ? error.message : "We could not load chamber documents.");
      })
      .finally(() => {
        if (!cancelled) setDocumentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter documents based on member's access level and approval status
  const accessibleDocuments = useMemo(() => {
    const allDocs = documents;
    return allDocs.filter((doc) => {
      // Only show approved documents
      if (!doc.isApproved) return false;

      // Admin and EXCO see all documents
      if (member.role === MemberRole.ADMIN || member.role === MemberRole.EXCO) {
        return true;
      }
      // Board members see board+ visibility
      if (member.role === MemberRole.BOARD) {
        return ["board", "all"].includes(doc.visibility);
      }
      // Regular members see only "all" visibility
      return doc.visibility === "all";
    });
  }, [member.role, documents]);

  // Filter and search
  const filteredDocuments = useMemo(() => {
    let result = accessibleDocuments;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((doc) => doc.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.uploadedDate).getTime() - new Date(b.uploadedDate).getTime());
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [accessibleDocuments, searchTerm, categoryFilter, sortBy]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "governance": "text-purple-700",
      "policy": "text-blue-700",
      "meeting-minutes": "text-amber-700",
      "other": "text-slate-700",
    };
    return colors[category] || colors["other"];
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "governance": "Governance",
      "policy": "Policy",
      "meeting-minutes": "Meeting Minutes",
      "other": "Other",
    };
    return labels[category] || category;
  };

  const allCategories = customCategories;

  const handleAddCategory = async () => {
    const categoryName = newCategoryName.trim().toLowerCase();
    if (!categoryName || allCategories.includes(categoryName)) return;

    try {
      const createdCategory = await createSacbmDocumentCategory(member.id, categoryName);
      setCustomCategories((current) => [...current, createdCategory]);
      setNewCategoryName("");
      setShowNewCategoryForm(false);
    } catch (error) {
      setDocumentsError(error instanceof Error ? error.message : "We could not create the document category.");
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    setDeletingCategory(categoryName);
    setDocumentsError("");
    try {
      await deleteSacbmDocumentCategory(categoryName);
      setCustomCategories((current) => current.filter((category) => category !== categoryName));
      if (categoryFilter === categoryName) setCategoryFilter("all");
      if (uploadForm.category === categoryName) setUploadForm((current) => ({ ...current, category: "" }));
    } catch (error) {
      setDocumentsError(error instanceof Error ? error.message : "We could not remove the document category.");
    } finally {
      setDeletingCategory(null);
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocumentIds((current) => {
      const next = new Set(current);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  };

  const handleDownloadSelected = () => {
    filteredDocuments
      .filter((document) => selectedDocumentIds.has(document.id))
      .forEach((document) => {
        const link = window.document.createElement("a");
        link.href = document.fileUrl;
        link.download = document.title.replace(/[^a-zA-Z0-9._-]/g, "-");
        link.target = "_blank";
        link.rel = "noreferrer";
        link.click();
      });
  };

  const handleDeleteDocument = async (document: Document) => {
    if (!window.confirm(`Delete “${document.title}”? This cannot be undone.`)) return;

    setDeletingDocument(document.id);
    setDocumentsError("");
    try {
      await deleteSacbmDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setSelectedDocumentIds((current) => {
        const next = new Set(current);
        next.delete(document.id);
        return next;
      });
      if (selectedDocument?.id === document.id) setSelectedDocument(null);
    } catch (error) {
      setDocumentsError(error instanceof Error ? error.message : "We could not delete the document.");
    } finally {
      setDeletingDocument(null);
    }
  };

  const openEditDocument = (document: Document) => {
    setEditingDocument(document);
    setUploadForm({
      title: document.title,
      description: document.description || "",
      category: document.category,
      visibility: document.visibility as "all" | "board" | "exco",
      file: null,
    });
    setUploadError("");
    setShowUploadForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes("pdf") && !file.type.includes("document")) {
        setUploadError("Please upload a PDF or document file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB");
        return;
      }
      setUploadError("");
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title.trim()) {
      setUploadError("Please enter a document title");
      return;
    }
    if (!editingDocument && !uploadForm.file) {
      setUploadError("Please select a file");
      return;
    }
    if (!uploadForm.category) {
      setUploadError("Please select a category");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      if (editingDocument) {
        const updatedDocument = await updateSacbmDocument({
          id: editingDocument.id,
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          visibility: uploadForm.visibility,
        });
        setDocuments((current) => current.map((document) => document.id === updatedDocument.id ? updatedDocument : document));
      } else {
        const newDocument = await uploadSacbmDocument({
          memberId: member.id,
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          visibility: uploadForm.visibility,
          file: uploadForm.file as File,
        });
        setDocuments((current) => [newDocument, ...current]);
      }
      setEditingDocument(null);
      setUploadForm({ title: "", description: "", category: "", visibility: "all", file: null });
      setShowUploadForm(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "We could not upload the document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Header with Upload Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
          <p className="text-slate-600 text-sm mt-1">
            Access chamber documents, policies, and meeting minutes
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-600 hover:bg-slate-100" aria-label="Document options">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onSelect={() => {
                  setIsSelectingDocuments((current) => !current);
                  setSelectedDocumentIds(new Set());
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                {isSelectingDocuments ? "Exit document selection" : "Select document"}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={selectedDocumentIds.size === 0} onSelect={handleDownloadSelected}>
                <Download className="mr-2 h-4 w-4" />
                Download selected{selectedDocumentIds.size > 0 ? ` (${selectedDocumentIds.size})` : ""}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={selectedDocumentIds.size === 0} onSelect={() => setSelectedDocumentIds(new Set())}>
                <X className="mr-2 h-4 w-4" />
                Clear selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {member.role === MemberRole.ADMIN ? (
            <Button
              onClick={() => {
                setEditingDocument(null);
                setUploadForm({ title: "", description: "", category: "", visibility: "all", file: null });
                setUploadError("");
                setShowUploadForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Document</span>
            </Button>
          ) : null}
        </div>
      </div>

      {documentsError && <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{documentsError}</p>}

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 border-0 border-b border-slate-200 rounded-none bg-transparent focus:border-slate-900 focus:ring-0 focus:bg-transparent"
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-0 border-b border-slate-200 rounded-none bg-transparent focus:ring-0 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {customCategories.length === 0 ? (
                  <SelectItem value="__empty_categories" disabled>No categories yet</SelectItem>
                ) : customCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {member.role === MemberRole.ADMIN && (
            <button
              onClick={() => setShowNewCategoryForm(true)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors flex-shrink-0"
              title="Add new category"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-0 border-b border-slate-200 rounded-none bg-transparent focus:ring-0 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadForm && member.role === MemberRole.ADMIN && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <CardTitle className="text-xl font-light tracking-tight">{editingDocument ? "Edit Document" : "Upload Document"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Document Title</label>
                <Input
                  placeholder="e.g., Board Meeting Minutes"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Description (optional)</label>
                <textarea
                  placeholder="Add a brief description..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Category</label>
                <Select value={uploadForm.category} onValueChange={(value) => setUploadForm((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {customCategories.length === 0 ? (
                      <SelectItem value="__empty_categories" disabled>Create a category first</SelectItem>
                    ) : customCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Visibility</label>
                <Select value={uploadForm.visibility} onValueChange={(value) => setUploadForm((prev) => ({ ...prev, visibility: value as "all" | "board" | "exco" }))}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="board">Board Only</SelectItem>
                    <SelectItem value="exco">EXCO Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editingDocument && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Select File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {uploadForm.file && (
                    <p className="text-xs text-slate-600 mt-2">
                      Selected: {uploadForm.file.name}
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !uploadForm.title.trim() || !uploadForm.category || (!editingDocument && !uploadForm.file)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {uploading ? (editingDocument ? "Saving..." : "Uploading...") : (editingDocument ? "Save changes" : "Upload")}
                </Button>
                <Button
                  onClick={() => {
                    setShowUploadForm(false);
                    setEditingDocument(null);
                    setUploadForm({
                      title: "",
                      description: "",
                      category: "",
                      visibility: "all",
                      file: null,
                    });
                    setUploadError("");
                  }}
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Category Modal */}
      {showNewCategoryForm && member.role === MemberRole.ADMIN && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <CardTitle className="text-xl font-light tracking-tight">Create New Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Category Name</label>
                <Input
                  placeholder="e.g., Training Materials"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddCategory();
                    }
                  }}
                  autoFocus
                />
              </div>
              {customCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Existing categories</p>
                  <div className="max-h-40 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
                    {customCategories.map((category) => (
                      <div key={category} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50">
                        <span className="text-sm text-slate-700">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={deletingCategory === category}
                          className="h-8 gap-1.5 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingCategory === category ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Categories can only be removed when no documents use them.</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowNewCategoryForm(false);
                    setNewCategoryName("");
                  }}
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents List */}
      {documentsLoading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-slate-500">Loading chamber documents...</CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No documents found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className={`border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isSelectingDocuments && selectedDocumentIds.has(doc.id) ? "ring-2 ring-slate-300" : ""}`}
              onClick={() => setSelectedDocument(doc)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {isSelectingDocuments && (
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={selectedDocumentIds.has(doc.id)}
                      aria-label={`${selectedDocumentIds.has(doc.id) ? "Remove" : "Select"} ${doc.title} for download`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleDocumentSelection(doc.id);
                      }}
                      className={`mt-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${selectedDocumentIds.has(doc.id) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-transparent hover:border-slate-500"}`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {/* Icon */}
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                        {doc.description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{doc.description}</p>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className={`text-xs font-medium ${getCategoryColor(doc.category)}`}>
                            {getCategoryLabel(doc.category)}
                          </span>
                          {doc.visibility !== "all" && (
                            <span className="text-xs font-medium text-slate-600">
                              Only for {doc.visibility.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                          <span>Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                          <span>{doc.fileSize} MB</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            onClick={(event) => event.stopPropagation()}
                            aria-label={`Options for ${doc.title}`}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48" onClick={(event) => event.stopPropagation()}>
                          <DropdownMenuItem onSelect={() => window.open(doc.fileUrl, "_blank", "noopener,noreferrer")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {member.role === MemberRole.ADMIN && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => openEditDocument(doc)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-700 focus:text-red-800"
                                disabled={deletingDocument === doc.id}
                                onSelect={() => handleDeleteDocument(doc)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deletingDocument === doc.id ? "Deleting..." : "Delete document"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-light tracking-tight mb-2">{selectedDocument.title}</CardTitle>
                  {selectedDocument.description && (
                    <CardDescription className="text-slate-600">{selectedDocument.description}</CardDescription>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-6 space-y-6">
              {/* Document Visualization */}
              <div className="bg-slate-100 rounded-lg overflow-hidden">
                <iframe
                  src={`${selectedDocument.fileUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-96 border-0"
                  title={selectedDocument.title}
                />
              </div>

              {/* Download Button */}
              <Button
                onClick={() => window.open(selectedDocument.fileUrl, "_blank")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Download Document
              </Button>

              {/* Document Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Category</p>
                  <p className={`text-sm font-medium ${getCategoryColor(selectedDocument.category)}`}>
                    {getCategoryLabel(selectedDocument.category)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Uploaded</p>
                  <p className="text-sm text-slate-900">{new Date(selectedDocument.uploadedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Uploaded By</p>
                  <p className="text-sm text-slate-900">{selectedDocument.uploadedBy}</p>
                </div>
                {selectedDocument.visibility !== "all" && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Visibility</p>
                    <p className="text-sm text-slate-900">Only for {selectedDocument.visibility.toUpperCase()}</p>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Close Button */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex-shrink-0">
              <Button
                onClick={() => setSelectedDocument(null)}
                variant="outline"
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SACBMDocuments;
