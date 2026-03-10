import { Plus, Download, Trash2, Edit2, X } from "lucide-react";
import { useState } from "react";

export interface UploadFormProps {
  documentType: "ingd" | "government_priority" | "actions" | "relief_requests";
  documentFile: File | null;
  documentName: string;
  documentDescription: string;
  isUploading: boolean;
  allDocuments: any[];
  isLoadingDocuments: boolean;
  onFileChange: (file: File | null) => void;
  onDocumentNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onDocumentTypeChange: (type: "ingd" | "government_priority" | "actions" | "relief_requests") => void;
  onUpload: () => void;
  onDelete: (id: number) => void;
  onEditType?: (id: number, newType: string | null, newName?: string) => void;
}

export default function DocumentUploadForm({
  documentType,
  documentFile,
  documentName,
  documentDescription,
  isUploading,
  allDocuments,
  isLoadingDocuments,
  onFileChange,
  onDocumentNameChange,
  onDescriptionChange,
  onDocumentTypeChange,
  onUpload,
  onDelete,
  onEditType,
}: UploadFormProps) {
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editingDocType, setEditingDocType] = useState("");
  const [editingDocName, setEditingDocName] = useState("");
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "government_priority":
        return "Government Priority";
      case "actions":
        return "Actions";
      case "relief_requests":
        return "Relief Requests";
      default:
        return "INGD";
    }
  };

  const getDocumentTypeColor = (type?: string) => {
    switch (type) {
      case "government_priority":
        return { badge: "bg-purple-100 text-purple-700", button: "bg-purple-100 hover:bg-purple-200 text-purple-700", icon: "text-purple-600" };
      case "actions":
        return { badge: "bg-amber-100 text-amber-700", button: "bg-amber-100 hover:bg-amber-200 text-amber-700", icon: "text-amber-600" };
      case "relief_requests":
        return { badge: "bg-green-100 text-green-700", button: "bg-green-100 hover:bg-green-200 text-green-700", icon: "text-green-600" };
      default:
        return { badge: "bg-blue-100 text-blue-700", button: "bg-blue-100 hover:bg-blue-200 text-blue-700", icon: "text-blue-600" };
    }
  };

  const filteredDocuments = allDocuments.filter(
    (doc) => (doc.type === documentType || (documentType === "ingd" && !doc.type))
  );

  const colors = getDocumentTypeColor(documentType);
  const placeholders: Record<string, string> = {
    ingd: "E.g., INGD Protocol v2.0, Master List - Jan 2024",
    government_priority: "E.g., Government Priorities - January 2026",
    actions: "E.g., Action Guidelines, Partner Documentation",
    relief_requests: "E.g., Relief Request Guidelines, Standard Forms",
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <h2 className="text-xl font-bold text-slate-900">
            Upload Document
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Select document type, choose a file, and add a description
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="document-type" className="block text-sm font-medium text-slate-700 mb-2">
              Destination Page
            </label>
            <select
              id="document-type"
              value={documentType}
              onChange={(e) => onDocumentTypeChange(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ingd">INGD Documents (protocols, Master List)</option>
              <option value="government_priority">Government Priorities</option>
              <option value="actions">Actions Documentation</option>
              <option value="relief_requests">Relief Requests</option>
            </select>
          </div>

          <div>
            <label htmlFor="document-name" className="block text-sm font-medium text-slate-700 mb-2">
              Document Name
            </label>
            <input
              id="document-name"
              type="text"
              value={documentName}
              onChange={(e) => onDocumentNameChange(e.target.value)}
              placeholder="E.g., Relief Form Template, Guidelines v2.0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="document-file" className="block text-sm font-medium text-slate-700 mb-2">
              Select File (PDF, XLSX, XLS)
            </label>
            <input
              id="document-file"
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {documentFile && (
              <p className="text-sm text-slate-600 mt-2">
                Selected: {documentFile.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="document-description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              id="document-description"
              value={documentDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder={placeholders[documentType]}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={onUpload}
            disabled={isUploading || !documentFile}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isUploading ? "Uploading..." : (
              <>
                <Plus size={18} />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <h2 className="text-xl font-bold text-slate-900">
            {getDocumentTypeLabel(documentType)} Documents ({filteredDocuments.length})
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Manage {getDocumentTypeLabel(documentType).toLowerCase()} documents
          </p>
        </div>

        {isLoadingDocuments ? (
          <div className="p-6 text-center text-slate-600">
            Loading documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-6 text-center text-slate-600">
            No documents uploaded yet. Upload your first document to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Download size={18} className={colors.icon} />
                      <h3 className="font-semibold text-slate-900 break-words">
                        {doc.file_name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${colors.badge}`}>
                        {getDocumentTypeLabel(doc.type)}
                      </span>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
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
                      {doc.uploaded_by && ` by ${doc.uploaded_by}`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={doc.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${colors.button}`}
                    >
                      <Download size={16} />
                      Download
                    </a>
                    {onEditType && (
                      <button
                        onClick={() => {
                          setEditingDocId(doc.id || null);
                          setEditingDocType(doc.type || "ingd");
                          setEditingDocName(doc.file_name || "");
                        }}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(doc.id || 0)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Document Modal */}
      {editingDocId !== null && onEditType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Document</h3>
              <button
                onClick={() => setEditingDocId(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={editingDocName}
                  onChange={(e) => setEditingDocName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destination Page
                </label>
                <select
                  value={editingDocType}
                  onChange={(e) => setEditingDocType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="ingd">INGD Documents</option>
                  <option value="government_priority">Government Priorities</option>
                  <option value="actions">Actions Documentation</option>
                  <option value="relief_requests">Relief Requests</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingDocId(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const typeValue = editingDocType === "ingd" ? null : editingDocType;
                    console.log(`[DocumentUploadForm] Updating document ${editingDocId}: name="${editingDocName}", type="${typeValue}"`);
                    if (onEditType) {
                      onEditType(editingDocId || 0, typeValue, editingDocName);
                    }
                    setEditingDocId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <p className="text-lg font-semibold text-blue-900 mb-2">
          📄 Document Management
        </p>
        <p className="text-blue-800">
          Upload and manage documents from one central location. Select the destination page when uploading, and documents will be organized and displayed in their respective sections. You can edit the destination page of uploaded documents without re-uploading.
        </p>
      </div>
    </div>
  );
}
