import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Member, MemberTier, MemberRole } from "@shared/api";

// Mock member database for demo
const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    company: "Silva Industries",
    tier: MemberTier.PLATINUM,
    role: MemberRole.ADMIN,
    phone: "+258 84 123 4567",
    joinDate: "2020-01-15",
    isActive: true,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@example.com",
    company: "Santos Commerce",
    tier: MemberTier.GOLD,
    role: MemberRole.BOARD,
    phone: "+258 84 234 5678",
    joinDate: "2021-03-20",
    isActive: true,
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@example.com",
    company: "Costa Trading",
    tier: MemberTier.GOLD,
    role: MemberRole.EXCO,
    phone: "+258 84 345 6789",
    joinDate: "2022-05-10",
    isActive: true,
  },
  {
    id: "4",
    name: "Ana Ferreira",
    email: "ana@example.com",
    company: "Ferreira Logistics",
    tier: MemberTier.BRONZE,
    role: MemberRole.MEMBER,
    phone: "+258 84 456 7890",
    joinDate: "2023-01-01",
    isActive: true,
  },
];

const SACBMLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock authentication
      const member = MOCK_MEMBERS.find(
        (m) => m.email === email && password === "demo123"
      );

      if (!member) {
        setError("Invalid email or password. Try: joao@example.com / demo123");
        setLoading(false);
        return;
      }

      // Store member in localStorage
      localStorage.setItem("currentMember", JSON.stringify(member));
      navigate("/sacbm-portal");
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      setLoading(false);
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
                <TabsTrigger value="demo" className="text-sm">Demo Accounts</TabsTrigger>
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

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <a href="#" className="text-emerald-600 hover:text-emerald-700">
                      Forgot password?
                    </a>
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

              {/* Demo Accounts Tab */}
              <TabsContent value="demo" className="space-y-4">
                <Alert className="border-emerald-200 bg-emerald-50 mb-4">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800 text-sm">
                    All demo accounts: password is <strong>demo123</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {MOCK_MEMBERS.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setEmail(member.email);
                        setPassword("demo123");
                        setSelectedTab("login");
                      }}
                      className="w-full p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition-colors text-sm"
                    >
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{member.email}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {member.tier.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SACBMLogin;
