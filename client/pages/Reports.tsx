import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  FileText,
  Download,
  AlertCircle,
  Loader,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { getAchievements } from "@/services/achievementsService";
import { getRequests } from "@/services/supabaseService";
import { getIngdDocuments } from "@/services/supabaseService";
import { downloadReport, filterActions, generateSummaryNarrative, ReportFilters } from "@/services/reportService";
import type { Achievement } from "@/services/achievementsService";
import type { RelieRequest, IngdDocument } from "@/services/supabaseService";

export default function Reports() {
  const [allActions, setAllActions] = useState<Achievement[]>([]);
  const [allRequests, setAllRequests] = useState<RelieRequest[]>([]);
  const [allDocuments, setAllDocuments] = useState<IngdDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // What to include in report
  const [includeData, setIncludeData] = useState({
    actions: true,
    reliefRequests: false,
    governmentPriorities: false,
    media: false,
  });

  // Expanded filter sections
  const [expandedFilters, setExpandedFilters] = useState({
    actions: true,
    reliefRequests: false,
    governmentPriorities: false,
    media: false,
  });

  // Actions filters
  const [actionFilters, setActionFilters] = useState({
    submitter: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  // Relief Requests filters
  const [reliefFilters, setReliefFilters] = useState({
    submitter: "",
    originator: "",
    startDate: "",
    endDate: "",
    includeINGD: false,
  });

  // Government Priorities filters
  const [govPriorityFilters, setGovPriorityFilters] = useState({
    submitter: "",
  });

  // Media selection
  const [selectedMedia, setSelectedMedia] = useState<Set<number>>(new Set());

  // Dropdown options
  const [actionSubmitterOptions, setActionSubmitterOptions] = useState<string[]>([]);
  const [reliefSubmitterOptions, setReliefSubmitterOptions] = useState<string[]>([]);

  // Load data on mount and when includeData changes
  useEffect(() => {
    loadAllData();
  }, [includeData]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      if (includeData.actions) {
        const actions = await getAchievements();
        setAllActions(actions);
        const submitters = [...new Set(actions.map(a => a.company_name))].filter(Boolean).sort();
        setActionSubmitterOptions(submitters);
      }

      if (includeData.reliefRequests) {
        const requests = await getRequests();
        setAllRequests(requests);
        const originators = [...new Set(requests.map(r => r.originator))].filter(Boolean).sort();
        setReliefSubmitterOptions(originators);
      }

      if (includeData.governmentPriorities || includeData.media) {
        const docs = await getIngdDocuments();
        setAllDocuments(docs);
      }
    } catch (error) {
      console.error("Error loading data for report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredActions = () => {
    let filtered = allActions;

    if (actionFilters.submitter) {
      filtered = filtered.filter(a => a.company_name === actionFilters.submitter);
    }
    if (actionFilters.category) {
      filtered = filtered.filter(a => a.category === actionFilters.category);
    }
    if (actionFilters.startDate) {
      filtered = filtered.filter(a => new Date(a.created_at || '') >= new Date(actionFilters.startDate));
    }
    if (actionFilters.endDate) {
      const endDate = new Date(actionFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => new Date(a.created_at || '') <= endDate);
    }

    return filtered;
  };

  const getFilteredReliefs = () => {
    let filtered = allRequests;

    if (!reliefFilters.includeINGD) {
      filtered = filtered.filter(r => r.originator !== "INGD");
    }
    if (reliefFilters.submitter) {
      filtered = filtered.filter(r => r.originator === reliefFilters.submitter);
    }
    if (reliefFilters.startDate) {
      filtered = filtered.filter(r => new Date(r.created_at || '') >= new Date(reliefFilters.startDate));
    }
    if (reliefFilters.endDate) {
      const endDate = new Date(reliefFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.created_at || '') <= endDate);
    }

    return filtered;
  };

  const getFilteredGovPriorities = () => {
    let filtered = allDocuments.filter(d => d.type === "government_priority");

    if (govPriorityFilters.submitter) {
      filtered = filtered.filter(d => d.uploaded_by === govPriorityFilters.submitter);
    }

    return filtered;
  };

  const getSelectedMediaList = () => {
    const mediaItems = allDocuments.filter(d => d.type === "actions" || !d.type);
    return Array.from(selectedMedia).map(id => mediaItems.find(m => m.id === id)).filter(Boolean) as IngdDocument[];
  };

  const handleGenerateReport = async () => {
    if (!includeData.actions && !includeData.reliefRequests && !includeData.governmentPriorities) {
      alert("Please select at least one data type to include in the report");
      return;
    }

    setIsGenerating(true);
    try {
      const filteredActions = includeData.actions ? getFilteredActions() : [];

      if (filteredActions.length > 0) {
        await downloadReport(filteredActions, {}, {
          title: "Comprehensive Report",
          organizationName: "SABCM Disaster Relief",
          footer: `Generated on ${new Date().toLocaleDateString()}`,
          includeMetrics: true,
        });
      } else if (includeData.reliefRequests) {
        const csv = generateReliefsCSV(getFilteredReliefs());
        downloadCSV(csv, `relief-requests-report-${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Error generating report: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReliefsCSV = (requests: RelieRequest[]): string => {
    const headers = ["Originator", "Full Name", "Email", "Location", "Help Type", "People", "Value", "Status", "Date"];
    const rows = requests.map(req => [
      req.originator,
      req.full_name,
      req.email,
      req.location,
      req.help_type,
      req.people,
      req.value,
      req.status ? "Met" : "Pending",
      new Date(req.created_at || '').toLocaleDateString(),
    ]);

    const content = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    return content;
  };

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTotalCount = () => {
    let count = 0;
    if (includeData.actions) count += getFilteredActions().length;
    if (includeData.reliefRequests) count += getFilteredReliefs().length;
    if (includeData.governmentPriorities) count += getFilteredGovPriorities().length;
    if (includeData.media) count += selectedMedia.size;
    return count;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-2">
            Create custom reports by selecting data types and filtering each one independently
          </p>
        </div>

        {/* Customizable Report Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Build Your Report</h2>
              <p className="text-sm text-slate-600 mt-1">Select data types and customize filters for each</p>
            </div>
          </div>

          {/* Step 1: Data Selection */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Step 1: Select Data Types</h3>
            <div className="space-y-3">
              {[
                { key: "actions", label: "Actions", description: "Include submitted actions" },
                { key: "reliefRequests", label: "Relief Requests", description: "Include relief requests" },
                { key: "governmentPriorities", label: "Government Priorities", description: "Include government priorities documents" },
                { key: "media", label: "Media", description: "Include specific media files from actions" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    const newInclude = { ...includeData, [item.key]: !includeData[item.key as keyof typeof includeData] };
                    setIncludeData(newInclude);
                    if (newInclude[item.key as keyof typeof includeData]) {
                      setExpandedFilters({ ...expandedFilters, [item.key]: true });
                    }
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-white rounded-lg transition-colors text-left"
                >
                  {includeData[item.key as keyof typeof includeData] ? (
                    <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Filter Each Data Type */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-slate-900 px-4">Step 2: Configure Filters</h3>

            {/* Actions Filters */}
            {includeData.actions && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFilters({ ...expandedFilters, actions: !expandedFilters.actions })}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Actions</span>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      {getFilteredActions().length} of {allActions.length}
                    </span>
                  </div>
                  {expandedFilters.actions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.actions && (
                  <div className="p-4 space-y-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
                        <select
                          value={actionFilters.submitter}
                          onChange={(e) => setActionFilters({ ...actionFilters, submitter: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Organizations</option>
                          {actionSubmitterOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                        <select
                          value={actionFilters.category}
                          onChange={(e) => setActionFilters({ ...actionFilters, category: e.target.value })}
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
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={actionFilters.startDate}
                          onChange={(e) => setActionFilters({ ...actionFilters, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={actionFilters.endDate}
                          onChange={(e) => setActionFilters({ ...actionFilters, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Relief Requests Filters */}
            {includeData.reliefRequests && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFilters({ ...expandedFilters, reliefRequests: !expandedFilters.reliefRequests })}
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Relief Requests</span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      {getFilteredReliefs().length} of {allRequests.length}
                    </span>
                  </div>
                  {expandedFilters.reliefRequests ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.reliefRequests && (
                  <div className="p-4 space-y-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Originator</label>
                        <select
                          value={reliefFilters.submitter}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, submitter: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">All Originators</option>
                          {reliefSubmitterOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={reliefFilters.startDate}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={reliefFilters.endDate}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer p-3 hover:bg-slate-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={reliefFilters.includeINGD}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, includeINGD: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-slate-700">Include INGD relief requests</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Media Selection */}
            {includeData.media && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFilters({ ...expandedFilters, media: !expandedFilters.media })}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Media Files</span>
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                      {selectedMedia.size} selected
                    </span>
                  </div>
                  {expandedFilters.media ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.media && (
                  <div className="p-4 bg-white max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {allDocuments.filter(d => d.type === "actions" || !d.type).length === 0 ? (
                        <p className="text-sm text-slate-600">No media files available</p>
                      ) : (
                        allDocuments
                          .filter(d => d.type === "actions" || !d.type)
                          .map((doc) => (
                            <label key={doc.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedMedia.has(doc.id || 0)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedMedia);
                                  if (e.target.checked) {
                                    newSelected.add(doc.id || 0);
                                  } else {
                                    newSelected.delete(doc.id || 0);
                                  }
                                  setSelectedMedia(newSelected);
                                }}
                                className="w-4 h-4 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                                <p className="text-xs text-slate-600">{doc.description}</p>
                              </div>
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded whitespace-nowrap">
                                {doc.file_type}
                              </span>
                            </label>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          {!isLoading && getTotalCount() > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900 font-medium">
                ✓ {getTotalCount()} total items selected for report
              </p>
              <div className="text-xs text-green-800 mt-2 space-y-1">
                {includeData.actions && <p>• {getFilteredActions().length} Actions</p>}
                {includeData.reliefRequests && <p>• {getFilteredReliefs().length} Relief Requests</p>}
                {includeData.governmentPriorities && <p>• {getFilteredGovPriorities().length} Government Priorities</p>}
                {includeData.media && <p>• {selectedMedia.size} Media Files</p>}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Loader size={18} className="animate-spin text-blue-600" />
              <p className="text-sm text-slate-600">Loading data...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && !includeData.actions && !includeData.reliefRequests && !includeData.governmentPriorities && !includeData.media && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No data selected</p>
                <p className="text-xs text-yellow-700 mt-1">Select at least one data type above to generate a report</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || getTotalCount() === 0 || isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              {isGenerating ? "Generating..." : "Download Report"}
            </button>
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">How to Use</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium">Step 1:</span> Check the data types you want to include (Actions, Relief Requests, Government Priorities, Media)
            </p>
            <p>
              <span className="font-medium">Step 2:</span> Each selected data type shows its own filters - customize organization, category, date range, etc.
            </p>
            <p>
              <span className="font-medium">Step 3:</span> For Relief Requests, you can exclude INGD requests and include only member requests
            </p>
            <p>
              <span className="font-medium">Step 4:</span> For Media, individually select which files to include in the report
            </p>
            <p>
              <span className="font-medium">Step 5:</span> Click "Download Report" to generate your custom report with exactly the data you selected
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
