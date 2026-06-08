import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight,
} from "lucide-react";
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
      navigate("/sacbm-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentMember");
    setCurrentMember(null);
    navigate("/sacbm-login");
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
    { id: "members", label: "Directory", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed md:relative h-screen z-40 ${
          isMobile && !sidebarOpen ? "-translate-x-full" : ""
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-200">
          {sidebarOpen ? (
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Fb6df1f14bb5a44b792b09b4e7cb119ad?format=webp&width=200"
              alt="SACBM Logo"
              className="h-7 w-auto"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="px-3 py-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {currentMember.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{currentMember.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentMember.company}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                {currentMember.name.split(" ").map(n => n[0]).join("")}
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-700 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          {sidebarOpen && (
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
              sidebarOpen ? "text-sm font-medium" : ""
            }`}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
              <div>
                <h1 className="text-2xl font-light tracking-tight text-slate-900">
                  {currentSection === "dashboard" && "Dashboard"}
                  {currentSection === "documents" && "Documents"}
                  {currentSection === "events" && "Events"}
                  {currentSection === "members" && "Directory"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getTierColor(currentMember.tier)}`}>
                  {currentMember.tier.toUpperCase()}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
              {!isMobile && (
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {currentSection === "dashboard" && <DashboardSection member={currentMember} />}
          {currentSection === "documents" && <DocumentsSection member={currentMember} />}
          {currentSection === "events" && <EventsSection member={currentMember} />}
          {currentSection === "members" && <MembersSection member={currentMember} />}
        </div>
      </main>
    </div>
  );
};

// Dashboard Section Component
const DashboardSection = ({ member }: { member: Member }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-light tracking-tight text-slate-900 mb-2">
          Welcome back, {member.name.split(" ")[0]}
        </h2>
        <p className="text-slate-600">Manage your chamber activities and stay connected</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Upcoming Events", value: "12" },
          { label: "Active Members", value: "245" },
          { label: "New Documents", value: "18" },
          { label: "Announcements", value: "3" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
              <p className="text-3xl font-light text-slate-900 mt-2">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-emerald-600 mb-3" />
              <h4 className="font-medium text-slate-900">Events</h4>
              <p className="text-sm text-slate-600 mt-1">RSVP and manage your event attendance</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-medium text-slate-900">Documents</h4>
              <p className="text-sm text-slate-600 mt-1">Access chamber documents and policies</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-purple-600 mb-3" />
              <h4 className="font-medium text-slate-900">Members</h4>
              <p className="text-sm text-slate-600 mt-1">Connect with other chamber members</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Activity</h3>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-semibold text-sm">→</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Event Reminder: Annual Gala</p>
                    <p className="text-sm text-slate-600 mt-1">{3 + i} days away • Hosted by SACBM</p>
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
