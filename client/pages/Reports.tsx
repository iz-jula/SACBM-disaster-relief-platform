import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  FileText,
  Download,
  AlertCircle,
  Loader,
} from "lucide-react";
import { getAchievements } from "@/services/achievementsService";
import { getRequests } from "@/services/supabaseService";
import { downloadReport, filterActions, generateSummaryNarrative, ReportFilters } from "@/services/reportService";
import type { Achievement } from "@/services/achievementsService";
import type { RelieRequest } from "@/services/supabaseService";

type ReportType = "actions" | "relief_requests";

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>("actions");
  const [allActions, setAllActions] = useState<Achievement[]>([]);
  const [allRequests, setAllRequests] = useState<RelieRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter states
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    startDate: undefined,
    endDate: undefined,
    category: undefined,
    submitter: undefined,
  });

  // Dropdown options
  const [submitterOptions, setSubmitterOptions] = useState<string[]>([]);

  // Load data when report type changes
  useEffect(() => {
    loadData();
  }, [reportType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (reportType === "actions") {
        const actions = await getAchievements();
        setAllActions(actions);

        // Extract unique submitter names
        const submitters = [...new Set(actions.map(a => a.company_name))].filter(Boolean).sort();
        setSubmitterOptions(submitters);
      } else if (reportType === "relief_requests") {
        const requests = await getRequests();
        setAllRequests(requests);

        // Extract unique originator names
        const originators = [...new Set(requests.map(r => r.originator))].filter(Boolean).sort();
        setSubmitterOptions(originators);
      }
    } catch (error) {
      console.error("Error loading data for report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateActionsReport = async () => {
    if (allActions.length === 0) {
      alert("No actions available to generate report");
      return;
    }

    setIsGenerating(true);
    try {
      await downloadReport(allActions, reportFilters, {
        title: "Actions Report",
        organizationName: "SABCM Disaster Relief",
        footer: `Generated on ${new Date().toLocaleDateString()}`,
        includeMetrics: true,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Error generating report: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReliefsReport = async () => {
    if (allRequests.length === 0) {
      alert("No relief requests available to generate report");
      return;
    }

    setIsGenerating(true);
    try {
      // Filter relief requests
      const filtered = allRequests.filter(req => {
        if (reportFilters.startDate) {
          const reqDate = new Date(req.created_at || '');
          if (reqDate < reportFilters.startDate) return false;
        }
        if (reportFilters.endDate) {
          const reqDate = new Date(req.created_at || '');
          const endDate = new Date(reportFilters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (reqDate > endDate) return false;
        }
        if (reportFilters.submitter) {
          if (!req.originator.toLowerCase().includes(reportFilters.submitter.toLowerCase())) {
            return false;
          }
        }
        return true;
      });

      if (filtered.length === 0) {
        alert("No relief requests match the selected filters");
        return;
      }

      // Generate simple CSV report for relief requests
      const csv = generateReliefsCSV(filtered);
      downloadCSV(csv, `relief-requests-report-${new Date().toISOString().split('T')[0]}.csv`);
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

  const getFilteredDataCount = () => {
    if (reportType === "actions") {
      return filterActions(allActions, reportFilters).length;
    } else {
      return allRequests.filter(req => {
        if (reportFilters.startDate) {
          const reqDate = new Date(req.created_at || '');
          if (reqDate < reportFilters.startDate) return false;
        }
        if (reportFilters.endDate) {
          const reqDate = new Date(req.created_at || '');
          const endDate = new Date(reportFilters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (reqDate > endDate) return false;
        }
        if (reportFilters.submitter) {
          if (!req.originator.toLowerCase().includes(reportFilters.submitter.toLowerCase())) {
            return false;
          }
        }
        return true;
      }).length;
    }
  };

  const getTotalCount = () => {
    return reportType === "actions" ? allActions.length : allRequests.length;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-2">
            Generate and download reports for actions, relief requests, and more
          </p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: "actions",
              title: "Actions Report",
              description: "Report all submitted actions with detailed information",
              icon: "📊",
            },
            {
              id: "relief_requests",
              title: "Relief Requests Report",
              description: "Report all relief requests with status and details",
              icon: "📋",
            },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setReportType(option.id as ReportType);
                setReportFilters({
                  startDate: undefined,
                  endDate: undefined,
                  category: undefined,
                  submitter: undefined,
                });
              }}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                reportType === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{option.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-900">{option.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Generate {reportType === "actions" ? "Actions" : "Relief Requests"} Report
              </h2>
              <p className="text-sm text-slate-600 mt-1">Customize your report with filters below</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* Submitter/Organization Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Member / Organization (Optional)
              </label>
              <select
                value={reportFilters.submitter || ""}
                onChange={(e) =>
                  setReportFilters({
                    ...reportFilters,
                    submitter: e.target.value || undefined,
                  })
                }
                disabled={isLoading || submitterOptions.length === 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">All {reportType === "actions" ? "Organizations" : "Originators"}</option>
                {submitterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter (Actions only) */}
            {reportType === "actions" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category (Optional)
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
                Start Date (Optional)
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
                End Date (Optional)
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

          {/* Data Summary */}
          {!isLoading && getTotalCount() > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700">
                <span className="font-bold">{getFilteredDataCount()} of {getTotalCount()}</span> {reportType === "actions" ? "actions" : "relief requests"} match your filter criteria
              </p>
              {reportType === "actions" && reportFilters.submitter && (
                <p className="text-xs text-slate-600 mt-2">
                  Filtered by: <span className="font-medium">{reportFilters.submitter}</span>
                  {reportFilters.category && `, ${reportFilters.category}`}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Loader size={18} className="animate-spin text-blue-600" />
              <p className="text-sm text-slate-600">Loading {reportType === "actions" ? "actions" : "relief requests"}...</p>
            </div>
          )}

          {/* No Data State */}
          {!isLoading && getTotalCount() === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No data available</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {reportType === "actions"
                    ? "No actions have been submitted yet."
                    : "No relief requests have been submitted yet."}
                </p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-3">
            <button
              onClick={
                reportType === "actions"
                  ? handleGenerateActionsReport
                  : handleGenerateReliefsReport
              }
              disabled={isGenerating || getTotalCount() === 0 || isLoading || getFilteredDataCount() === 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              {isGenerating ? "Generating..." : "Download Report"}
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">About Reports</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium">Actions Report:</span> Generates a detailed PDF report of all submitted actions with descriptions, impact metrics, and organizational information.
            </p>
            <p>
              <span className="font-medium">Relief Requests Report:</span> Exports a CSV file of all relief requests with status, location, and request details.
            </p>
            <p>
              <span className="font-medium">Filters:</span> Use optional filters to customize your report. Filter by organization/member, category, or date range.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
