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
import { FileText, Download, Search, Upload } from "lucide-react";
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
      "governance": "bg-slate-100 text-slate-700",
      "policy": "bg-slate-100 text-slate-700",
      "meeting-minutes": "bg-slate-100 text-slate-700",
      "other": "bg-slate-100 text-slate-700",
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
        {member.role === MemberRole.ADMIN || member.role === MemberRole.BOARD ? (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full md:w-auto">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        ) : null}
      </div>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="meeting-minutes">Meeting Minutes</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

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
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(doc.category)}`}>
                            {getCategoryLabel(doc.category)}
                          </span>
                          {doc.visibility !== "all" && (
                            <span className="text-xs font-medium text-slate-600 px-2 py-1">
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
