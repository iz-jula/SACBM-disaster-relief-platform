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
  BarChart3,
} from "lucide-react";
import SACBMDocuments from "@/components/SACBMDocuments";
import SACBMEvents from "@/components/SACBMEvents";
import SACBMMembers from "@/components/SACBMMembers";
import SACBMBoardExco from "@/components/SACBMBoardExco";
import { Member, MemberTier, MemberRole } from "@shared/api";

const SACBMPortal = () => {
  const navigate = useNavigate();
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSection, setCurrentSection] = useState<"dashboard" | "documents" | "events" | "members" | "board-exco">("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
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
    ...(currentMember && [MemberRole.ADMIN, MemberRole.EXCO, MemberRole.BOARD].includes(currentMember.role)
      ? [{ id: "board-exco", label: "Board & EXCO", icon: BarChart3 }]
      : []),
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
                  if (item.id === "events") setSelectedEventId(null);
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
                  {currentSection === "board-exco" && "Board & EXCO"}
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
          {currentSection === "dashboard" && <DashboardSection member={currentMember} onOpenEvent={(eventId) => { setSelectedEventId(eventId); setCurrentSection("events"); }} />}
          {currentSection === "documents" && <DocumentsSection member={currentMember} />}
          {currentSection === "events" && <EventsSection member={currentMember} onNavigate={(section) => { setSelectedEventId(null); setCurrentSection(section); }} initialEventId={selectedEventId} />}
          {currentSection === "members" && <MembersSection member={currentMember} />}
          {currentSection === "board-exco" && <BoardExcoSection member={currentMember} />}
        </div>
      </main>
    </div>
  );
};

// Dashboard Section Component
const DashboardSection = ({ member, onOpenEvent }: { member: Member; onOpenEvent: (eventId: string) => void }) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(15);
  const [memberRsvps, setMemberRsvps] = useState<Record<string, "accepted" | "declined" | "maybe">>({});

  const allEvents = [
    {
      id: "1",
      title: "Annual SACBM Gala",
      date: 15,
      dateStr: "15 Mar",
      image: "https://images.unsplash.com/photo-1519671482677-504be0271101?w=400&h=300&fit=crop",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "2",
      title: "Business Breakfast",
      date: 28,
      dateStr: "28 Feb",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "3",
      title: "Board Meeting",
      date: 15,
      dateStr: "15 Feb",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const upcomingEvents = selectedDate
    ? allEvents.filter(event => event.date === selectedDate)
    : allEvents;

  const today = 15;

  const getNextEvents = () => {
    if (selectedDate && selectedDate !== today) {
      const sortedEvents = [...allEvents].sort((a, b) => a.date - b.date);
      return sortedEvents.filter(e => e.date >= today);
    }
    return [];
  };

  const nextEvents = getNextEvents();

  const handleRsvp = (eventTitle: string, status: "accepted" | "declined" | "maybe") => {
    setMemberRsvps((prev) => ({
      ...prev,
      [eventTitle]: status,
    }));
  };

  const cycleRsvp = (eventTitle: string) => {
    const current = memberRsvps[eventTitle];
    const next = current === "accepted" ? "maybe" : current === "maybe" ? "declined" : "accepted";
    handleRsvp(eventTitle, next);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-xl h-48 md:h-72 bg-gradient-to-r from-slate-900 to-slate-800">
        {/* Background Image */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F3a1a4e655da0467388df0f18259e3a68?format=webp&width=1200&height=600"
          alt="Chamber Activities"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-800/50 to-slate-900/60" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-4 md:p-8">
          <div>
            <h1 className="text-2xl md:text-5xl font-light tracking-tight text-white mb-2 md:mb-3">
              Welcome back, {member.name.split(" ")[0]}
            </h1>
            <p className="text-sm md:text-lg text-slate-100 max-w-2xl">
              Manage your chamber activities and stay connected
            </p>
          </div>

          {/* Role & Tier Badges */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm ${getTierColor(member.tier)}`}>
              {member.tier.toUpperCase()}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${getRoleBadge(member.role).color}`}>
              {getRoleBadge(member.role).label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-start">
              <p className="text-xs md:text-sm text-slate-600 font-medium">Events</p>
              <p className="text-2xl md:text-3xl font-light text-slate-900 mt-1">12</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-start">
              <p className="text-xs md:text-sm text-slate-600 font-medium">Members</p>
              <p className="text-2xl md:text-3xl font-light text-slate-900 mt-1">245</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-start">
              <p className="text-xs md:text-sm text-slate-600 font-medium">Alerts</p>
              <p className="text-2xl md:text-3xl font-light text-slate-900 mt-1">7</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Calendar + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 order-last lg:order-first">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Calendar</h3>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Interactive Calendar View */}
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
                    {Array.from({ length: 29 }).map((_, i) => {
                      const dayNum = i + 1;
                      const isSelected = dayNum === selectedDate;
                      const hasEvents = allEvents.some(e => e.date === dayNum);

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(isSelected ? null : dayNum)}
                          className={`py-2 text-xs rounded-lg transition-all font-medium ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-md scale-105"
                              : hasEvents
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-2 order-first lg:order-last">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">Upcoming Events</h3>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
              >
                Feb {selectedDate} ✕
              </button>
            )}
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <Card key={event.id} onClick={() => onOpenEvent(event.id)} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 hover:opacity-10 transition-opacity`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900">{event.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {event.dateStr} • Hosted by SACBM
                        </p>
                      </div>
                      <button
                        onClick={(eventClick) => {
                          eventClick.stopPropagation();
                          cycleRsvp(event.title);
                        }}
                        title="Click to change your response"
                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${
                          memberRsvps[event.title] === "maybe"
                            ? "text-orange-700 bg-orange-50 hover:bg-orange-100"
                            : memberRsvps[event.title] === "declined"
                            ? "text-red-700 bg-red-50 hover:bg-red-100"
                            : memberRsvps[event.title] === "accepted"
                            ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {memberRsvps[event.title] ? `${memberRsvps[event.title]} · Change` : "RSVP"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Empty State Banner */}
              <Card className="border-0 shadow-sm bg-slate-50">
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-slate-600 font-medium">No events on this date</p>
                  <button
                    onClick={() => setSelectedDate(today)}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Go back to today
                  </button>
                </CardContent>
              </Card>

              {/* Next Events Banner */}
              {nextEvents.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-6">
                  <p className="text-sm font-semibold text-slate-700 mb-4">Coming up</p>
                  <div className="space-y-3">
                    {nextEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={event.id}
                        onClick={() => onOpenEvent(event.id)}
                        className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{event.title}</p>
                          <p className="text-xs text-slate-600 mt-1">Feb {event.date}</p>
                        </div>
                        <button
                          onClick={(eventClick) => {
                            eventClick.stopPropagation();
                            cycleRsvp(event.title);
                          }}
                          title="Click to change your response"
                          className={`px-2 py-1 text-xs font-medium rounded transition-colors flex-shrink-0 ${
                            memberRsvps[event.title] === "maybe"
                              ? "text-orange-700 bg-orange-50 hover:bg-orange-100"
                              : memberRsvps[event.title] === "declined"
                              ? "text-red-700 bg-red-50 hover:bg-red-100"
                              : memberRsvps[event.title] === "accepted"
                              ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {memberRsvps[event.title] ? `${memberRsvps[event.title]} · Change` : "RSVP"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Notifications */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Notifications</h3>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[
                { title: "Event Reminder: Annual Gala", desc: "Happening in 3 days", color: "bg-slate-50 border-l-4 border-indigo-600" },
                { title: "New Member Joined", desc: "Welcome TechCore Solutions", color: "bg-slate-50 border-l-4 border-emerald-600" },
                { title: "Document Updated", desc: "2024 Strategic Plan approved", color: "bg-slate-50 border-l-4 border-slate-400" },
              ].map((notif, i) => (
                <div key={i} className={`p-4 rounded-lg ${notif.color} transition-all hover:shadow-md`}>
                  <p className="font-medium text-slate-900">{notif.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{notif.desc}</p>
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
const EventsSection = ({ member, onNavigate, initialEventId }: { member: Member; onNavigate: (section: "dashboard" | "documents" | "events" | "members") => void; initialEventId: string | null }) => {
  return <SACBMEvents member={member} onNavigate={onNavigate} initialEventId={initialEventId} />;
};

// Members Section Component
const MembersSection = ({ member }: { member: Member }) => {
  return <SACBMMembers currentMember={member} />;
};

// Board & EXCO Section Component
const BoardExcoSection = ({ member }: { member: Member }) => {
  return <SACBMBoardExco member={member} />;
};

export default SACBMPortal;
