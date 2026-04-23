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
  const [memberInfo, setMemberInfo] = useState<{ name: string; company: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [peopleImpacted, setPeopleImpacted] = useState("");
  const [location, setLocation] = useState("");
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

  const handleMemberAccess = (name: string, company: string) => {
    setMemberInfo({ name, company });
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAchievement({
        type_action: title,
        description,
        category: category as any,
        people_impacted: peopleImpacted ? parseInt(peopleImpacted) : 0,
        location: location || "",
        media: media.length > 0 ? JSON.stringify(media) : null,
        company_name: memberInfo?.company || "Unknown",
        amount: 0,
      });

      if (result) {
        setSubmitSuccess(true);
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("");
        setPeopleImpacted("");
        setLocation("");
        setMedia([]);

        // Show success message for 3 seconds then clear
        setTimeout(() => setSubmitSuccess(false), 3000);
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
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-yellow-400/20 p-3">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{memberInfo.name}</h2>
                  <p className="flex items-center gap-2 text-emerald-100 mt-1">
                    <Building2 className="h-4 w-4" />
                    {memberInfo.company}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

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
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-700" />
              Submit Your Social Responsibility Action
            </CardTitle>
            <CardDescription>
              Share your achievements and initiatives with the chamber community
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitAction} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Action Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Community Health Campaign, Disaster Relief Distribution"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your action. What did you do? Who did you help? What was the impact?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 min-h-[150px]"
                  required
                />
              </div>

              {/* Two Column Layout */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="mt-2">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food Aid</SelectItem>
                      <SelectItem value="Clothing">Clothing & Textiles</SelectItem>
                      <SelectItem value="Medical">Medical & Health</SelectItem>
                      <SelectItem value="Shelter">Shelter & Housing</SelectItem>
                      <SelectItem value="Water">Water & Sanitation</SelectItem>
                      <SelectItem value="Evacuation">Evacuation & Safety</SelectItem>
                      <SelectItem value="Materials">Construction Materials</SelectItem>
                      <SelectItem value="Multiple">Multiple Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* People Impacted */}
                <div>
                  <Label htmlFor="peopleImpacted" className="text-sm font-medium">
                    People Impacted
                  </Label>
                  <Input
                    id="peopleImpacted"
                    type="number"
                    placeholder="e.g., 150"
                    value={peopleImpacted}
                    onChange={(e) => setPeopleImpacted(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium">
                  Location / Region
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Maputo, Gaza Province"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Fill in all required fields marked with * to submit your action.
                  Include as many details as possible to help showcase the impact of your work.
                </p>
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

        {/* Help Section */}
        <Card className="mt-8 border-0 shadow-sm bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Use clear, descriptive titles for your actions</li>
              <li>• Provide detailed descriptions of the impact</li>
              <li>• Specify the location and number of people impacted</li>
              <li>• Include relevant details that demonstrate the value of your initiative</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberSection;
