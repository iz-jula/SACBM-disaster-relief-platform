import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PublicNavbar from "@/components/PublicNavbar";
import MemberGate from "@/components/MemberGate";
import { LogOut, User, Building2, Plus, FileText, Download, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, Circle, Loader, X } from "lucide-react";
import { createAchievement } from "@/services/achievementsService";

const MemberSection = () => {
  const navigate = useNavigate();
  const [memberInfo, setMemberInfo] = useState<{ name: string; email: string } | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "submit-action" | "reports">("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [memberActions, setMemberActions] = useState<any[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Report builder state
  const [includeReportData, setIncludeReportData] = useState({
    actions: true,
    media: false,
  });

  const [expandedReportFilters, setExpandedReportFilters] = useState({
    actions: true,
    media: false,
  });

  const [reportActionFilters, setReportActionFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });

  const [selectedReportMedia, setSelectedReportMedia] = useState<Set<number>>(new Set());
  const [previewImage, setPreviewImage] = useState<any>(null);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [actionType, setActionType] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [partnerOrganisation, setPartnerOrganisation] = useState("");
  const [peopleImpacted, setPeopleImpacted] = useState("");
  const [amount, setAmount] = useState("");
  const [hideAmount, setHideAmount] = useState(false);
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string[]>([]);

  // Load member info from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("memberInfo");
    if (stored) {
      setMemberInfo(JSON.parse(stored));
    }
  }, []);

  // Load member's actions when entering reports view
  useEffect(() => {
    if (currentView === "reports") {
      // Get all actions from localStorage (achievements stored by the app)
      const storedActions = localStorage.getItem("memberActions");
      if (storedActions) {
        const actions = JSON.parse(storedActions);
        // Filter by member's company (or could use email)
        setMemberActions(actions);
      }
    }
  }, [currentView]);

  const handleLogout = () => {
    localStorage.removeItem("memberInfo");
    setMemberInfo(null);
  };

  const handleMemberAccess = (name: string, email: string) => {
    setMemberInfo({ name, email });
  };

  const getFilteredReportActions = () => {
    let filtered = memberActions;

    if (reportActionFilters.category) {
      filtered = filtered.filter(a => a.category === reportActionFilters.category);
    }
    if (reportActionFilters.startDate) {
      filtered = filtered.filter(a => new Date(a.created_at || '') >= new Date(reportActionFilters.startDate));
    }
    if (reportActionFilters.endDate) {
      const endDate = new Date(reportActionFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => new Date(a.created_at || '') <= endDate);
    }

    return filtered;
  };

  const getActionCategories = () => {
    return [...new Set(memberActions.map(a => a.category))].filter(Boolean).sort();
  };

  const getMediaFiles = () => {
    const mediaItems: any[] = [];

    // Extract images from action.media field (base64 data stored as JSON array)
    const actionImages = memberActions
      .flatMap((action, actionIdx) => {
        try {
          const mediaArray = JSON.parse(action.media as string);
          if (Array.isArray(mediaArray) && mediaArray.length > 0) {
            return mediaArray.map((imageData: string, imgIdx: number) => ({
              id: `action-${actionIdx}-${imgIdx}`,
              file_name: `${action.type_action} - ${action.company_name}`,
              description: `Image from: ${action.type_action}`,
              file_type: 'image',
              data_url: imageData,
              source: 'action',
            }));
          }
        } catch (e) {
          // Fallback for single image stored as string
          if (action.media && typeof action.media === 'string' && action.media.startsWith('data:image')) {
            return [{
              id: `action-${actionIdx}-0`,
              file_name: `${action.type_action} - ${action.company_name}`,
              description: `Image from: ${action.type_action}`,
              file_type: 'image',
              data_url: action.media,
              source: 'action',
            }];
          }
        }
        return [];
      });

    return actionImages;
  };

  const getSelectedMediaList = () => {
    return Array.from(selectedReportMedia)
      .map(id => {
        const allMedia = getMediaFiles();
        return allMedia.find((m: any) => m.id === id);
      })
      .filter(Boolean);
  };

  const getTotalReportCount = () => {
    let count = 0;
    if (includeReportData.actions) count += getFilteredReportActions().length;
    if (includeReportData.media) count += selectedReportMedia.size;
    return count;
  };

  const handleGenerateReport = async () => {
    if (!includeReportData.actions && !includeReportData.media) {
      alert("Please select at least one data type to include in the report");
      return;
    }

    if (includeReportData.actions && getFilteredReportActions().length === 0) {
      alert("No actions match your filters. Please adjust your filters and try again.");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const filteredActions = getFilteredReportActions();
      const selectedMedia = getSelectedMediaList();

      // Create comprehensive report text
      const reportText = [
        "SOUTH AFRICAN CHAMBER OF BUSINESS IN MOZAMBIQUE",
        "MEMBER IMPACT REPORT",
        "═".repeat(70),
        "",
        `Member: ${memberInfo?.name}`,
        `Email: ${memberInfo?.email}`,
        `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        "",
        "═".repeat(70),
        "EXECUTIVE SUMMARY",
        "═".repeat(70),
        "",
        `Total Actions Submitted: ${filteredActions.length}`,
        `Total People Impacted: ${filteredActions.reduce((sum, a) => sum + (a.people_impacted || 0), 0).toLocaleString()}`,
        `Total Contribution: MZN ${filteredActions.reduce((sum, a) => sum + (a.amount || 0), 0).toLocaleString()}`,
        selectedMedia.length > 0 ? `Media Files Included: ${selectedMedia.length}` : "",
        "",
        "═".repeat(70),
        "SUBMITTED ACTIONS",
        "═".repeat(70),
        "",
        ...filteredActions.map((action, idx) => [
          `ACTION ${idx + 1}`,
          `─`.repeat(70),
          `Title: ${action.type_action}`,
          `Company: ${action.company_name}`,
          `Category: ${action.category}`,
          `Location: ${action.location}`,
          `Partner Organization: ${action.partner_organisation || "N/A"}`,
          `People Impacted: ${action.people_impacted || 0}`,
          `Contribution: ${action.hide_amount ? "Hidden from Public" : `MZN ${(action.amount || 0).toLocaleString()}`}`,
          `Description: ${action.description}`,
          `Date Submitted: ${action.created_at ? new Date(action.created_at).toLocaleDateString() : "N/A"}`,
          "",
        ].join("\n")),
        selectedMedia.length > 0 ? [
          "═".repeat(70),
          "MEDIA FILES INCLUDED",
          "═".repeat(70),
          "",
          ...selectedMedia.map((media: any, idx: number) => `${idx + 1}. ${media.file_name}`),
          "",
        ].join("\n") : "",
        "═".repeat(70),
        "END OF REPORT",
        "═".repeat(70),
      ].filter(line => line !== "").join("\n");

      // Create blob and download
      const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `SACBM-Member-Report-${memberInfo?.name?.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Report generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !actionType || !category || !description) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAchievement({
        type_action: actionType,
        description,
        category: category as any,
        people_impacted: peopleImpacted ? parseInt(peopleImpacted) : 0,
        location: `${district}${province ? `, ${province}` : ""}`,
        media: media.length > 0 ? JSON.stringify(media) : null,
        company_name: companyName,
        amount: amount ? parseInt(amount) : 0,
        partner_organisation: partnerOrganisation || undefined,
      });

      if (result) {
        setSubmitSuccess(true);

        // Store the action in localStorage for reports
        const existingActions = JSON.parse(localStorage.getItem("memberActions") || "[]");
        const newAction = {
          company_name: companyName,
          type_action: actionType,
          category,
          location: `${district}${province ? `, ${province}` : ""}`,
          partner_organisation: partnerOrganisation,
          people_impacted: peopleImpacted ? parseInt(peopleImpacted) : 0,
          amount: amount ? parseInt(amount) : 0,
          description,
          created_at: new Date().toISOString(),
          hide_amount: hideAmount,
        };
        existingActions.push(newAction);
        localStorage.setItem("memberActions", JSON.stringify(existingActions));

        // Reset form
        setCompanyName("");
        setActionType("");
        setCategory("");
        setProvince("");
        setDistrict("");
        setPartnerOrganisation("");
        setPeopleImpacted("");
        setAmount("");
        setHideAmount(false);
        setDescription("");
        setMedia([]);

        // Show success message for 3 seconds then clear
        setTimeout(() => {
          setSubmitSuccess(false);
          setCurrentView("dashboard");
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting action:", error);
      alert("Error submitting action. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show MemberGate if not authenticated
  if (!memberInfo) {
    return <MemberGate onAccess={handleMemberAccess} />;
  }

  // Show Member Section
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <PublicNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Member Header Card */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <User className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">{memberInfo.name}</h1>
                <p className="text-sm text-slate-600 mt-1">{memberInfo.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full sm:w-auto bg-red-100 hover:bg-red-200 text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <>
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Member Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentView("submit-action")}
                  className="bg-white rounded-lg border border-slate-200 p-6 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">📝</div>
                  <h3 className="text-sm font-semibold text-slate-900">Submit Action</h3>
                  <p className="text-xs text-slate-500 mt-1">Share your social impact</p>
                </button>

                <div className="bg-white rounded-lg border border-slate-200 p-6 text-left opacity-50 cursor-not-allowed">
                  <div className="text-2xl mb-3">📰</div>
                  <h3 className="text-sm font-semibold text-slate-900">Write Newsletter</h3>
                  <p className="text-xs text-slate-500 mt-1">Coming soon</p>
                </div>

                <button
                  onClick={() => setCurrentView("reports")}
                  className="bg-white rounded-lg border border-slate-200 p-6 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                  <h3 className="text-sm font-semibold text-slate-900">Generate Reports</h3>
                  <p className="text-xs text-slate-500 mt-1">Export your impact data</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <Card className="mb-8 border-0 border-l-4 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-800 font-medium">
                ✓ Action submitted successfully! Thank you for contributing to our platform.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submit Action Form */}
        {currentView === "submit-action" && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-emerald-700" />
                  Submit Social Responsibility Action
                </CardTitle>
                <CardDescription>
                  Share your achievements and initiatives with the chamber community
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitAction} className="space-y-6">
                  {/* Company Name */}
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Organization Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  {/* Type of Action and Category */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="actionType" className="text-sm font-medium">
                        Type of Action *
                      </Label>
                      <Input
                        id="actionType"
                        placeholder="e.g., Health Campaign, Relief Distribution"
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">
                        Category *
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="mt-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Shelter">Shelter</SelectItem>
                          <SelectItem value="Water">Water & Sanitation</SelectItem>
                          <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Province and District */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="province" className="text-sm font-medium">
                        Province
                      </Label>
                      <Select value={province} onValueChange={setProvince}>
                        <SelectTrigger id="province" className="mt-2">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maputo">Maputo</SelectItem>
                          <SelectItem value="Gaza">Gaza</SelectItem>
                          <SelectItem value="Sofala">Sofala</SelectItem>
                          <SelectItem value="Zambezia">Zambezia</SelectItem>
                          <SelectItem value="Inhambane">Inhambane</SelectItem>
                          <SelectItem value="Tete">Tete</SelectItem>
                          <SelectItem value="Manica">Manica</SelectItem>
                          <SelectItem value="Nampula">Nampula</SelectItem>
                          <SelectItem value="Niassa">Niassa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="district" className="text-sm font-medium">
                        District
                      </Label>
                      <Input
                        id="district"
                        placeholder="e.g., Chokwe, Xai-Xai"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Partner Organisation */}
                  <div>
                    <Label htmlFor="partnerOrganisation" className="text-sm font-medium">
                      Partner Organisation (if applicable)
                    </Label>
                    <Input
                      id="partnerOrganisation"
                      placeholder="Partner organization name"
                      value={partnerOrganisation}
                      onChange={(e) => setPartnerOrganisation(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* People Impacted and Amount */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="peopleImpacted" className="text-sm font-medium">
                        People Impacted
                      </Label>
                      <Input
                        id="peopleImpacted"
                        type="number"
                        placeholder="e.g., 120"
                        value={peopleImpacted}
                        onChange={(e) => setPeopleImpacted(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount" className="text-sm font-medium">
                        Amount (MZN)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 8500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Hide Amount Checkbox */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="hideAmount"
                      checked={hideAmount}
                      onChange={(e) => setHideAmount(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="hideAmount" className="text-sm text-slate-700">
                      Hide contribution value from public view
                    </label>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your action..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 min-h-[120px]"
                      required
                    />
                  </div>

                  {/* Upload Media */}
                  <div>
                    <Label className="text-sm font-medium">Upload Media</Label>
                    <div className="mt-2 p-4 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:border-slate-400 transition-colors">
                      <p className="text-sm text-slate-600">Click to upload images or videos</p>
                      <p className="text-xs text-slate-500 mt-1">Supported: PNG, JPG, MP4, MOV</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Action"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* Reports View */}
        {currentView === "reports" && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>

            {memberActions.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-12 pb-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4 text-lg font-medium">
                    You haven't submitted any actions yet.
                  </p>
                  <p className="text-slate-500 mb-6">Submit actions to generate reports</p>
                  <Button
                    onClick={() => setCurrentView("submit-action")}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Submit Your First Action
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <FileText size={24} className="text-emerald-600" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Build Your Report</h2>
                    <p className="text-sm text-slate-600 mt-1">Select data types and customize filters for each</p>
                  </div>
                </div>

                {/* Step 1: Data Selection */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Step 1: Select Data Types</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const newInclude = { ...includeReportData, actions: !includeReportData.actions };
                        setIncludeReportData(newInclude);
                        if (newInclude.actions) {
                          setExpandedReportFilters({ ...expandedReportFilters, actions: true });
                        }
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-white rounded-lg transition-colors text-left"
                    >
                      {includeReportData.actions ? (
                        <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-slate-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Actions</p>
                        <p className="text-xs text-slate-600">Include submitted actions</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const newInclude = { ...includeReportData, media: !includeReportData.media };
                        setIncludeReportData(newInclude);
                        if (newInclude.media) {
                          setExpandedReportFilters({ ...expandedReportFilters, media: true });
                        }
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-white rounded-lg transition-colors text-left"
                    >
                      {includeReportData.media ? (
                        <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-slate-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Media Files</p>
                        <p className="text-xs text-slate-600">Include specific media from actions</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Filter Each Data Type */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-bold text-slate-900 px-4">Step 2: Configure Filters</h3>

                  {/* Actions Filters */}
                  {includeReportData.actions && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedReportFilters({ ...expandedReportFilters, actions: !expandedReportFilters.actions })}
                        className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Actions</span>
                          <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded">
                            {getFilteredReportActions().length} of {memberActions.length}
                          </span>
                        </div>
                        {expandedReportFilters.actions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedReportFilters.actions && (
                        <div className="p-4 space-y-4 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                              <select
                                value={reportActionFilters.category}
                                onChange={(e) => setReportActionFilters({ ...reportActionFilters, category: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="">All Categories</option>
                                {getActionCategories().map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div></div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                              <input
                                type="date"
                                value={reportActionFilters.startDate}
                                onChange={(e) => setReportActionFilters({ ...reportActionFilters, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                              <input
                                type="date"
                                value={reportActionFilters.endDate}
                                onChange={(e) => setReportActionFilters({ ...reportActionFilters, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Media Selection */}
                  {includeReportData.media && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedReportFilters({ ...expandedReportFilters, media: !expandedReportFilters.media })}
                        className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Media Files</span>
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                            {selectedReportMedia.size} selected
                          </span>
                        </div>
                        {expandedReportFilters.media ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedReportFilters.media && (
                        <div className="p-4 bg-white">
                          {getMediaFiles().length === 0 ? (
                            <div className="py-4">
                              <p className="text-sm text-slate-600 mb-2">No media files available</p>
                              <p className="text-xs text-slate-500">Upload images with your actions to include them in reports</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Select All Button */}
                              <button
                                onClick={() => {
                                  const allFiles = getMediaFiles();
                                  const allSelected = allFiles.every((file: any) => selectedReportMedia.has(parseInt(file.id.split('-')[1])));

                                  if (allSelected) {
                                    setSelectedReportMedia(new Set());
                                  } else {
                                    const newSelected = new Set(allFiles.map((f: any, idx: number) => idx));
                                    setSelectedReportMedia(newSelected);
                                  }
                                }}
                                className="w-full px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-medium rounded-lg transition-colors text-sm"
                              >
                                {getMediaFiles().length > 0 && selectedReportMedia.size === getMediaFiles().length ? 'Deselect All' : 'Select All'}
                              </button>

                              {/* Files List */}
                              <div className="space-y-2 max-h-80 overflow-y-auto">
                                {getMediaFiles().map((doc: any, idx: number) => (
                                  <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors group">
                                    <input
                                      type="checkbox"
                                      checked={selectedReportMedia.has(idx)}
                                      onChange={(e) => {
                                        const newSelected = new Set(selectedReportMedia);
                                        if (e.target.checked) {
                                          newSelected.add(idx);
                                        } else {
                                          newSelected.delete(idx);
                                        }
                                        setSelectedReportMedia(newSelected);
                                      }}
                                      className="w-4 h-4 rounded cursor-pointer"
                                    />
                                    {/* Image Thumbnail Preview - Clickable */}
                                    {doc.data_url && (
                                      <button
                                        onClick={() => setPreviewImage(doc)}
                                        className="w-12 h-12 flex-shrink-0 rounded bg-slate-100 overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                                        title="Click to preview"
                                      >
                                        <img
                                          src={doc.data_url}
                                          alt={doc.file_name}
                                          className="w-full h-full object-cover cursor-pointer"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      </button>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                                      <p className="text-xs text-slate-600">{doc.description}</p>
                                      <p className="text-xs text-purple-600 font-medium">From Action</p>
                                    </div>
                                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                                      IMAGE
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {getTotalReportCount() > 0 && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900 font-medium">
                      ✓ {getTotalReportCount()} total items selected for report
                    </p>
                    <div className="text-xs text-green-800 mt-2 space-y-1">
                      {includeReportData.actions && (
                        <>
                          <p>• {getFilteredReportActions().length} Actions</p>
                          <p>• Total People Impacted: {getFilteredReportActions().reduce((sum, a) => sum + (a.people_impacted || 0), 0).toLocaleString()}</p>
                          <p>• Total Contribution: MZN {getFilteredReportActions().reduce((sum, a) => sum + (a.amount || 0), 0).toLocaleString()}</p>
                        </>
                      )}
                      {includeReportData.media && selectedReportMedia.size > 0 && (
                        <p>• {selectedReportMedia.size} Media Files</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Error State */}
                {getTotalReportCount() === 0 && (
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
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport || getTotalReportCount() === 0}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white"
                  >
                    <FileText size={18} className="mr-2" />
                    {isGeneratingReport ? "Generating..." : "Download Report"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 sticky top-0">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{previewImage.file_name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{previewImage.description}</p>
                </div>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                  title="Close preview"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Modal Body - Image */}
              <div className="p-6 flex items-center justify-center bg-slate-50">
                <img
                  src={previewImage.data_url}
                  alt={previewImage.file_name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex gap-2">
                  <span className="inline-block text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    From Action
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer p-3 hover:bg-white rounded-lg">
                  <input
                    type="checkbox"
                    checked={Array.from(selectedReportMedia).some((id) => {
                      const allMedia = getMediaFiles();
                      return allMedia[id as any]?.id === previewImage.id;
                    })}
                    onChange={(e) => {
                      const allMedia = getMediaFiles();
                      const idx = allMedia.findIndex((m: any) => m.id === previewImage.id);
                      if (idx !== -1) {
                        const newSelected = new Set(selectedReportMedia);
                        if (e.target.checked) {
                          newSelected.add(idx);
                        } else {
                          newSelected.delete(idx);
                        }
                        setSelectedReportMedia(newSelected);
                      }
                    }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {Array.from(selectedReportMedia).some((id) => {
                      const allMedia = getMediaFiles();
                      return allMedia[id as any]?.id === previewImage.id;
                    }) ? 'Included in Report' : 'Include in Report'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberSection;
