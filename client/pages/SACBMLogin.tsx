import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <PublicNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <CardTitle>SACBM Portal</CardTitle>
                <CardDescription>Member Access</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Enter your credentials to access the SACBM member portal
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Don't have an account? Contact the chamber for membership details.
                </p>
              </TabsContent>

              {/* Demo Accounts Tab */}
              <TabsContent value="demo" className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50 mb-4">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    All demo accounts use password: <strong>demo123</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {MOCK_MEMBERS.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setEmail(member.email);
                        setPassword("demo123");
                        setSelectedTab("login");
                      }}
                      className="w-full p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition-colors"
                    >
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      <div className="text-sm text-slate-600">{member.email}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded">
                          {member.tier.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded">
                          {member.role.toUpperCase()}
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
