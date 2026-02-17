import { X, Download } from "lucide-react";

interface PdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName: string;
  description?: string;
}

export default function PdfViewer({
  isOpen,
  onClose,
  pdfUrl,
  fileName,
  description,
}: PdfViewerProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {fileName}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">DL</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Viewer - Full height */}
        <div className="flex-1 overflow-hidden bg-slate-50 relative">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title={fileName}
          />
        </div>
      </div>
    </div>
  );
}
