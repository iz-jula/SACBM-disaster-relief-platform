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
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed md:relative h-screen z-40 ${
          isMobile && !sidebarOpen ? "-translate-x-full md:translate-x-0" : ""
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
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {sidebarOpen && <span>Collapse</span>}
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
            <div className="flex items-center gap-4">
              {!isMobile && (
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5 text-slate-600" />
                </button>
              )}
              {/* Profile Section */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{currentMember.name}</p>
                  <p className="text-xs text-slate-600">{currentMember.company}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {currentMember.name.split(" ").map(n => n[0]).join("")}
                </div>
              </div>
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
  const upcomingEvents = [
    { title: "Annual SACBM Gala", date: "15 Mar", icon: "🎉" },
    { title: "Business Breakfast", date: "28 Feb", icon: "☕" },
    { title: "Board Meeting", date: "15 Feb", icon: "📋" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-xl h-64 md:h-72 bg-gradient-to-r from-slate-900 to-slate-800">
        {/* Background Image */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F3a1a4e655da0467388df0f18259e3a68?format=webp&width=1200&height=600"
          alt="Chamber Activities"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-800/50 to-slate-900/60" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-3">
              Welcome back, {member.name.split(" ")[0]}
            </h1>
            <p className="text-lg text-slate-100 max-w-2xl">
              Manage your chamber activities and stay connected
            </p>
          </div>

          {/* Role & Tier Badges */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-4 py-2 rounded-full border backdrop-blur-sm ${getTierColor(member.tier)}`}>
              {member.tier.toUpperCase()}
            </span>
            <span className={`text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm ${getRoleBadge(member.role).color}`}>
              {getRoleBadge(member.role).label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Upcoming Events</p>
                <p className="text-3xl font-light text-slate-900 mt-2">12</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Members</p>
                <p className="text-3xl font-light text-slate-900 mt-2">245</p>
              </div>
              <Users className="h-8 w-8 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Notifications</p>
                <p className="text-3xl font-light text-slate-900 mt-2">7</p>
              </div>
              <Bell className="h-8 w-8 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Calendar + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Calendar</h3>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Simple Calendar View */}
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">February 2024</h4>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} className="text-xs font-semibold text-slate-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 29 }).map((_, i) => (
                      <button
                        key={i}
                        className={`py-2 text-xs rounded-lg transition-colors ${
                          i === 14
                            ? "bg-emerald-600 text-white font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900">{event.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        📅 {event.date} • Hosted by SACBM
                      </p>
                    </div>
                    <button className="px-3 py-1 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex-shrink-0">
                      RSVP
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Notifications</h3>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[
                { title: "Event Reminder: Annual Gala", desc: "Happening in 3 days", icon: "🔔", color: "bg-blue-50" },
                { title: "New Member Joined", desc: "Welcome TechCore Solutions", icon: "👥", color: "bg-emerald-50" },
                { title: "Document Updated", desc: "2024 Strategic Plan approved", icon: "📄", color: "bg-amber-50" },
              ].map((notif, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-lg ${notif.color} flex items-center justify-center flex-shrink-0 text-lg`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{notif.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function getTierColor(tier: MemberTier) {
    switch (tier) {
      case MemberTier.BRONZE:
        return "text-amber-700 bg-amber-500/20 border-amber-700/30";
      case MemberTier.GOLD:
        return "text-yellow-700 bg-yellow-500/20 border-yellow-700/30";
      case MemberTier.PLATINUM:
        return "text-cyan-300 bg-cyan-500/20 border-cyan-400/30";
    }
  }

  function getRoleBadge(role: MemberRole) {
    const roleConfig = {
      [MemberRole.ADMIN]: { label: "Admin", color: "bg-red-500/20 text-red-200 border border-red-400/30" },
      [MemberRole.EXCO]: { label: "EXCO", color: "bg-purple-500/20 text-purple-200 border border-purple-400/30" },
      [MemberRole.BOARD]: { label: "Board", color: "bg-blue-500/20 text-blue-200 border border-blue-400/30" },
      [MemberRole.MEMBER]: { label: "Member", color: "bg-gray-500/20 text-gray-200 border border-gray-400/30" },
    };
    return roleConfig[role];
  }
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
