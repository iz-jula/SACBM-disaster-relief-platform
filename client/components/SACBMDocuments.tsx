import { useState, useMemo } from "react";
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
import { FileText, Download, Search, Upload, Plus } from "lucide-react";
import { Member, Document, MemberRole } from "@shared/api";

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

  // Filter documents based on member's access level and approval status
  const accessibleDocuments = useMemo(() => {
    return MOCK_DOCUMENTS.filter((doc) => {
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
  }, [member.role]);

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

  const allCategories = ["governance", "policy", "meeting-minutes", "other", ...customCategories];

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !allCategories.includes(newCategoryName.toLowerCase())) {
      setCustomCategories([...customCategories, newCategoryName.toLowerCase()]);
      setNewCategoryName("");
      setShowNewCategoryForm(false);
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
        {member.role === MemberRole.ADMIN ? (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full md:w-auto">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        ) : null}
      </div>

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
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="meeting-minutes">Meeting Minutes</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                {customCategories.map((cat) => (
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
      {filteredDocuments.length === 0 ? (
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
            <Card key={doc.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
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

                      {/* Download Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 gap-2 mt-2 md:mt-0"
                        onClick={() => window.open(doc.fileUrl, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SACBMDocuments;
