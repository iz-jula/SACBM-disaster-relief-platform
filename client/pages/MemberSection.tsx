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
import { LogOut, User, Building2, Plus } from "lucide-react";
import { createAchievement } from "@/services/achievementsService";

const MemberSection = () => {
  const navigate = useNavigate();
  const [memberInfo, setMemberInfo] = useState<{ name: string; email: string } | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "submit-action" | "reports">("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [memberActions, setMemberActions] = useState<any[]>([]);
  const [reportFormat, setReportFormat] = useState<"csv" | "pdf">("csv");

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

  const generateCSVReport = () => {
    if (memberActions.length === 0) {
      alert("No actions to report");
      return;
    }

    // Create CSV header
    const headers = [
      "Company Name",
      "Type of Action",
      "Category",
      "Location",
      "Partner Organisation",
      "People Impacted",
      "Amount (MZN)",
      "Description",
      "Date Submitted",
    ];

    // Create CSV rows
    const rows = memberActions.map((action) => [
      action.company_name || "",
      action.type_action || "",
      action.category || "",
      action.location || "",
      action.partner_organisation || "",
      action.people_impacted || "0",
      action.amount || "0",
      `"${(action.description || "").replace(/"/g, '""')}"`, // Escape quotes
      action.created_at || new Date().toISOString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SACBM-Report-${memberInfo?.name?.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFReport = () => {
    if (memberActions.length === 0) {
      alert("No actions to report");
      return;
    }

    // Create a simple text-based PDF content (note: for production, use a library like jsPDF)
    const reportText = [
      "SOUTH AFRICAN CHAMBER OF BUSINESS IN MOZAMBIQUE",
      "MEMBER IMPACT REPORT",
      "=".repeat(60),
      "",
      `Member: ${memberInfo?.name}`,
      `Email: ${memberInfo?.email}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      "",
      "=".repeat(60),
      "SUBMITTED ACTIONS",
      "=".repeat(60),
      "",
      ...memberActions.map(
        (action, idx) => `
Action ${idx + 1}: ${action.type_action}
Company: ${action.company_name}
Category: ${action.category}
Location: ${action.location}
Partner: ${action.partner_organisation || "N/A"}
People Impacted: ${action.people_impacted || 0}
Amount (MZN): ${action.amount || 0}
Description: ${action.description}
Date: ${action.created_at ? new Date(action.created_at).toLocaleDateString() : ""}
${"-".repeat(60)}
`
      ),
      "",
      "=".repeat(60),
      `Total Actions: ${memberActions.length}`,
      `Total People Impacted: ${memberActions.reduce((sum, a) => sum + (a.people_impacted || 0), 0)}`,
      `Total Contribution: MZN ${memberActions.reduce((sum, a) => sum + (a.amount || 0), 0).toLocaleString()}`,
      "=".repeat(60),
    ].join("\n");

    // Create blob and download as text file (can be printed to PDF)
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SACBM-Report-${memberInfo?.name?.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  📊 Generate Reports
                </CardTitle>
                <CardDescription>
                  Export your submitted actions and impact data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {memberActions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 mb-4">
                      You haven't submitted any actions yet.
                    </p>
                    <Button
                      onClick={() => setCurrentView("submit-action")}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      Submit Your First Action
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Actions Summary */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{memberActions.length}</div>
                        <p className="text-sm text-blue-600 mt-1">Total Actions Submitted</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-700">
                          {memberActions.reduce((sum, a) => sum + (a.people_impacted || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-green-600 mt-1">Total People Impacted</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <div className="text-2xl font-bold text-emerald-700">
                          MZN {memberActions.reduce((sum, a) => sum + (a.amount || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-emerald-600 mt-1">Total Contribution</p>
                      </div>
                    </div>

                    {/* Report Format Selection */}
                    <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-sm font-medium mb-4 block">Export Format</Label>
                      <div className="flex gap-4 flex-wrap">
                        <button
                          onClick={() => setReportFormat("csv")}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            reportFormat === "csv"
                              ? "border-emerald-700 bg-emerald-50 text-emerald-700"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          📄 CSV (Spreadsheet)
                        </button>
                        <button
                          onClick={() => setReportFormat("pdf")}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            reportFormat === "pdf"
                              ? "border-emerald-700 bg-emerald-50 text-emerald-700"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          📋 PDF (Printable)
                        </button>
                      </div>
                    </div>

                    {/* Recent Actions */}
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Actions</h3>
                      <div className="space-y-3">
                        {memberActions.slice(0, 5).map((action, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900">{action.type_action}</h4>
                                <p className="text-xs text-slate-600 mt-1">{action.company_name}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    {action.category}
                                  </span>
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                    {action.people_impacted || 0} people
                                  </span>
                                  <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">
                                    MZN {action.amount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-4">
                      <Button
                        onClick={generateCSVReport}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        📥 Download as CSV
                      </Button>
                      <Button
                        onClick={generatePDFReport}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        📥 Download as PDF
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberSection;
