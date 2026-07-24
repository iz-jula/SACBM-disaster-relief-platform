import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, AlertCircle, ArrowLeft } from "lucide-react";
import { requestSacbmPasswordReset, signInSacbmMember } from "@/services/sacbmService";

const SACBMLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInSacbmMember(email, password);
      navigate("/sacbm-portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess(false);
    setResetLoading(true);

    try {
      await requestSacbmPasswordReset(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "We could not send the credentials reset email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Fb6df1f14bb5a44b792b09b4e7cb119ad?format=webp&width=200"
            alt="SACBM Logo"
            className="h-8 w-auto"
          />
          <div className="w-16"></div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200 pb-6">
            <CardTitle className="text-2xl font-light tracking-tight">Member Portal</CardTitle>
            <CardDescription className="text-base mt-1">Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="forgot" className="text-sm">Forgot credentials</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <p className="text-sm text-slate-600 mb-6">
                  Enter your email and password to access your account.
                </p>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    Don't have an account? <br />
                    <span className="text-slate-600">Contact the chamber for membership.</span>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="forgot" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter your SACBM email address and we will send you a link to reset your password.
                </p>

                {resetError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{resetError}</AlertDescription>
                  </Alert>
                )}

                {resetSuccess && (
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <AlertDescription className="text-emerald-800">
                      If an active SACBM account exists for that email, a reset link has been sent.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleResetCredentials} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    {resetLoading ? "Sending link..." : "Send reset link"}
                  </Button>
                </form>

                <p className="text-xs text-slate-500 text-center">
                  If your account is not active or linked to a member profile, contact the chamber administrator.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SACBMLogin;
