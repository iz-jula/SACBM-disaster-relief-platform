import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOutSacbmMember, updateSacbmPassword } from "@/services/sacbmService";

const SACBMResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updateSacbmPassword(password);
      await signOutSacbmMember();
      setSuccess(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "We could not update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/sacbm-login" className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to sign in</span>
          </Link>
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Fb6df1f14bb5a44b792b09b4e7cb119ad?format=webp&width=200"
            alt="SACBM Logo"
            className="h-8 w-auto"
          />
          <div className="w-24" />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200 pb-6">
            <CardTitle className="text-2xl font-light tracking-tight">Reset password</CardTitle>
            <CardDescription className="mt-1 text-base">Choose a new password for your SACBM account.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6 pt-6">
            {error && (
              <Alert className="mb-5 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            {success ? (
              <div className="space-y-4">
                <Alert className="border-emerald-200 bg-emerald-50">
                  <AlertDescription className="text-emerald-800">Your password has been updated. You can now sign in with your new password.</AlertDescription>
                </Alert>
                <Button onClick={() => navigate("/sacbm-login")} className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-700">
                  Return to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <Input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2" autoComplete="new-password" required />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2" autoComplete="new-password" required />
                </div>
                <p className="text-xs text-slate-500">Use at least 8 characters.</p>
                <Button type="submit" disabled={loading} className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:bg-slate-300">
                  {loading ? "Updating password…" : "Update password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SACBMResetPassword;
