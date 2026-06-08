import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Users,
  LogOut,
  Home,
  Menu,
  X,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import SACBMDocuments from "@/components/SACBMDocuments";
import SACBMEvents from "@/components/SACBMEvents";
import SACBMMembers from "@/components/SACBMMembers";
import { Member, MemberTier, MemberRole } from "@shared/api";

const SACBMPortal = () => {
  const navigate = useNavigate();
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSection, setCurrentSection] = useState<"dashboard" | "documents" | "events" | "members">("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("currentMember");
    if (stored) {
      setCurrentMember(JSON.parse(stored));
    } else {
      navigate("/members");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentMember");
    setCurrentMember(null);
    navigate("/members");
  };

  const getTierColor = (tier: MemberTier) => {
    switch (tier) {
      case MemberTier.BRONZE:
        return "text-amber-700 bg-amber-50 border-amber-200";
      case MemberTier.GOLD:
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case MemberTier.PLATINUM:
        return "text-cyan-700 bg-cyan-50 border-cyan-200";
    }
  };

  const getRoleBadge = (role: MemberRole) => {
    const roleConfig = {
      [MemberRole.ADMIN]: { label: "Admin", color: "bg-red-100 text-red-800" },
      [MemberRole.EXCO]: { label: "EXCO", color: "bg-purple-100 text-purple-800" },
      [MemberRole.BOARD]: { label: "Board", color: "bg-blue-100 text-blue-800" },
      [MemberRole.MEMBER]: { label: "Member", color: "bg-gray-100 text-gray-800" },
    };
    return roleConfig[role];
  };

  if (!currentMember) {
    return null;
  }

  const roleBadge = getRoleBadge(currentMember.role);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "events", label: "Events", icon: Calendar },
    { id: "members", label: "Members Directory", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r border-slate-200 transition-all duration-300 ${
            isMobile && !sidebarOpen ? "hidden" : ""
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Portal Header */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                {sidebarOpen && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">SACBM</h2>
                    <p className="text-xs text-slate-500">Portal</p>
                  </div>
                )}
                {!isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {sidebarOpen && (
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    {currentMember.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{currentMember.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentMember.company}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSection(item.id as any);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    {sidebarOpen && isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 space-y-2">
              {sidebarOpen && (
                <>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                    <Settings className="h-5 w-5" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">
                    Welcome, {currentMember.name}
                  </h1>
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="p-2 hover:bg-slate-100 rounded"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getTierColor(currentMember.tier)}`}>
                    {currentMember.tier.toUpperCase()} Member
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>
              <button className="p-3 hover:bg-slate-100 rounded-lg">
                <Bell className="h-6 w-6 text-slate-600" />
              </button>
            </div>

            {/* Content Section */}
            {currentSection === "dashboard" && <DashboardSection member={currentMember} />}
            {currentSection === "documents" && <DocumentsSection member={currentMember} />}
            {currentSection === "events" && <EventsSection member={currentMember} />}
            {currentSection === "members" && <MembersSection member={currentMember} />}
          </div>
        </main>
      </div>
    </div>
  );
};

// Dashboard Section Component
const DashboardSection = ({ member }: { member: Member }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-sm text-slate-600 mt-1">Upcoming Events</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">245</div>
            <p className="text-sm text-slate-600 mt-1">Members Online</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">18</div>
            <p className="text-sm text-slate-600 mt-1">New Documents</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">3</div>
            <p className="text-sm text-slate-600 mt-1">Announcements</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-emerald-600 mb-3" />
              <h4 className="font-semibold text-slate-900">RSVP to Events</h4>
              <p className="text-sm text-slate-600 mt-1">Manage your event responses</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-slate-900">Browse Documents</h4>
              <p className="text-sm text-slate-600 mt-1">Access chamber materials</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-purple-600 mb-3" />
              <h4 className="font-semibold text-slate-900">Connect with Members</h4>
              <p className="text-sm text-slate-600 mt-1">View directory & network</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-700 font-semibold">→</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Event Reminder: Annual Gala 2024</p>
                    <p className="text-sm text-slate-600 mt-1">3 days away • Hosted by SACBM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Documents Section Component
const DocumentsSection = ({ member }: { member: Member }) => {
  return <SACBMDocuments member={member} />;
};

// Events Section Component
const EventsSection = ({ member }: { member: Member }) => {
  return <SACBMEvents member={member} />;
};

// Members Section Component
const MembersSection = ({ member }: { member: Member }) => {
  return <SACBMMembers currentMember={member} />;
};

export default SACBMPortal;
