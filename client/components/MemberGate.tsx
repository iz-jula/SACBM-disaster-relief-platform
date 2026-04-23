import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, ArrowRight } from "lucide-react";
import PublicNavbar from "./PublicNavbar";

interface MemberGateProps {
  onAccess: (name: string, company: string) => void;
}

const MemberGate = ({ onAccess }: MemberGateProps) => {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<{ name?: string; company?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; company?: string } = {};

    if (!fullName.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Store member info in localStorage and call onAccess
    localStorage.setItem(
      "memberInfo",
      JSON.stringify({
        name: fullName.trim(),
        company: company.trim(),
      })
    );
    onAccess(fullName.trim(), company.trim());
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <div className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/6647008/pexels-photo-6647008.jpeg"
            alt="Volunteers organizing aid"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-800/80 to-slate-900/85" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6" />
                Member Access
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Enter your details to access the member portal and submit your actions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company / Organization
                  </label>
                  <Input
                    type="text"
                    placeholder="Your Company Ltd."
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      if (errors.company) setErrors({ ...errors, company: undefined });
                    }}
                    className={errors.company ? "border-red-500" : ""}
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-500">{errors.company}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white mt-6"
                >
                  Access Member Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {/* Info text */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This is a simple access form. Your information will be stored locally to identify you in the member section.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional info */}
          <div className="mt-8 rounded-lg bg-white/10 backdrop-blur p-6 text-white">
            <h3 className="font-semibold mb-2">What can you do?</h3>
            <ul className="space-y-2 text-sm text-slate-100">
              <li className="flex items-start gap-3">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-400" />
                <span>Submit your social responsibility actions</span>
              </li>
              <li className="flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-400" />
                <span>Share your company's impact and initiatives</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-400" />
                <span>Contribute photos and stories of your work</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberGate;
