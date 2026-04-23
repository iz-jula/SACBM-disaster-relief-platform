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
  const [currentView, setCurrentView] = useState<"dashboard" | "submit-action">("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("memberInfo");
    setMemberInfo(null);
  };

  const handleMemberAccess = (name: string, email: string) => {
    setMemberInfo({ name, email });
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

                <div className="bg-white rounded-lg border border-slate-200 p-6 text-left opacity-50 cursor-not-allowed">
                  <div className="text-2xl mb-3">📊</div>
                  <h3 className="text-sm font-semibold text-slate-900">View Reports</h3>
                  <p className="text-xs text-slate-500 mt-1">Coming soon</p>
                </div>
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
      </div>
    </div>
  );
};

export default MemberSection;
