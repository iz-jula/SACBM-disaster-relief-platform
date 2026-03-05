import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  FileText,
  Download,
  AlertCircle,
  Loader,
  CheckCircle2,
  Circle,
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

  // Filter states
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    startDate: undefined,
    endDate: undefined,
    category: undefined,
    submitter: undefined,
  });

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

  const handleGenerateReport = async () => {
    if (!includeData.actions && !includeData.reliefRequests && !includeData.governmentPriorities) {
      alert("Please select at least one data type to include in the report");
      return;
    }

    setIsGenerating(true);
    try {
      if (includeData.actions && allActions.length > 0) {
        await downloadReport(allActions, reportFilters, {
          title: "Comprehensive Report",
          organizationName: "SABCM Disaster Relief",
          footer: `Generated on ${new Date().toLocaleDateString()}`,
          includeMetrics: true,
        });
      } else if (includeData.reliefRequests && allRequests.length > 0) {
        const csv = generateReliefsCSV(allRequests);
        downloadCSV(csv, `relief-requests-report-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        alert("No data available for the selected report type");
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
    if (includeData.actions) count += allActions.length;
    if (includeData.reliefRequests) count += allRequests.length;
    if (includeData.governmentPriorities) count += allDocuments.filter(d => d.type === "government_priority").length;
    return count;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-2">
            Customize and generate comprehensive reports by selecting what to include
          </p>
        </div>

        {/* Customizable Report Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Customize Your Report</h2>
              <p className="text-sm text-slate-600 mt-1">Select what data to include and apply filters</p>
            </div>
          </div>

          {/* Data Selection - What to Include */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Select Data to Include</h3>
            <div className="space-y-3">
              {[
                { key: "actions", label: "Actions", description: "Include submitted actions" },
                { key: "reliefRequests", label: "Relief Requests", description: "Include relief requests" },
                { key: "governmentPriorities", label: "Government Priorities", description: "Include government priorities documents" },
                { key: "media", label: "Media", description: "Include media from actions (images, documents)" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    setIncludeData({ ...includeData, [item.key]: !includeData[item.key as keyof typeof includeData] })
                  }
                  className="flex items-center gap-3 w-full p-3 hover:bg-white rounded-lg transition-colors text-left"
                >
                  {includeData[item.key as keyof typeof includeData] ? (
                    <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters - Dynamically shown based on selection */}
          {(includeData.actions || includeData.reliefRequests) && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-slate-900 mb-4">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Filter for Actions */}
                {includeData.actions && actionSubmitterOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Organization (Actions)
                    </label>
                    <select
                      value={reportFilters.submitter || ""}
                      onChange={(e) =>
                        setReportFilters({
                          ...reportFilters,
                          submitter: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Organizations</option>
                      {actionSubmitterOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category Filter */}
                {includeData.actions && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <select
                      value={reportFilters.category || ""}
                      onChange={(e) =>
                        setReportFilters({
                          ...reportFilters,
                          category: e.target.value || undefined,
                        })
                      }
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
                )}

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      reportFilters.startDate
                        ? reportFilters.startDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setReportFilters({
                        ...reportFilters,
                        startDate: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      reportFilters.endDate
                        ? reportFilters.endDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setReportFilters({
                        ...reportFilters,
                        endDate: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Data Summary */}
          {!isLoading && getTotalCount() > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900 font-medium">
                ✓ {getTotalCount()} total items selected for report
              </p>
              <p className="text-xs text-green-800 mt-2">
                {includeData.actions && `${allActions.length} actions`}
                {includeData.actions && includeData.reliefRequests && " • "}
                {includeData.reliefRequests && `${allRequests.length} relief requests`}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Loader size={18} className="animate-spin text-blue-600" />
              <p className="text-sm text-slate-600">Loading data...</p>
            </div>
          )}

          {/* Error State - No data selected */}
          {!isLoading && !includeData.actions && !includeData.reliefRequests && !includeData.governmentPriorities && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No data selected</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Select at least one data type above to generate a report
                </p>
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
          <h3 className="font-bold text-slate-900 mb-4">About Custom Reports</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium">Flexible Reporting:</span> Create comprehensive reports by selecting exactly what data you want to include - mix and match Actions, Relief Requests, Government Priorities, and Media in a single report.
            </p>
            <p>
              <span className="font-medium">Smart Filters:</span> When you select Actions or Relief Requests, filter options appear for you to refine by organization, category, and date range.
            </p>
            <p>
              <span className="font-medium">Media Selection:</span> When including Media, you can select specific media files from submitted actions to include in your report.
            </p>
            <p>
              <span className="font-medium">Export Formats:</span> Actions export as PDF with detailed narratives and metrics. Relief Requests export as CSV for easy spreadsheet analysis.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
