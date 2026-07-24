import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Event, EventRSVP, Member, MemberRole, MemberTier } from "@shared/api";
import { getSacbmDashboardData, saveSacbmRsvp, SacbmDashboardNotification } from "@/services/sacbmService";

interface SACBMDashboardProps {
  member: Member;
  onOpenEvent: (eventId: string) => void;
}

const formatEventDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`));

const getTierColor = (tier: MemberTier) => {
  const colors = {
    [MemberTier.BRONZE]: "text-amber-800 bg-amber-50 border-amber-200",
    [MemberTier.GOLD]: "text-yellow-800 bg-yellow-50 border-yellow-200",
    [MemberTier.PLATINUM]: "text-cyan-800 bg-cyan-50 border-cyan-200",
  };
  return colors[tier];
};

const getRoleBadge = (role: MemberRole) => {
  const badges = {
    [MemberRole.ADMIN]: { label: "Admin", color: "bg-red-100 text-red-800" },
    [MemberRole.EXCO]: { label: "EXCO", color: "bg-purple-100 text-purple-800" },
    [MemberRole.BOARD]: { label: "Board", color: "bg-blue-100 text-blue-800" },
    [MemberRole.MEMBER]: { label: "Member", color: "bg-slate-100 text-slate-800" },
  };
  return badges[role];
};

const getNotificationColor = (notification: SacbmDashboardNotification) => {
  if (notification.type === "event") return "border-indigo-600";
  if (notification.type === "approval" || notification.type === "finance") return "border-amber-600";
  if (notification.type === "rejection") return "border-rose-700";
  return "border-emerald-600";
};

const SACBMDashboard = ({ member, onOpenEvent }: SACBMDashboardProps) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const [notifications, setNotifications] = useState<SacbmDashboardNotification[]>([]);
  const [memberRsvps, setMemberRsvps] = useState<Record<string, EventRSVP["status"]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingRsvp, setSavingRsvp] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    getSacbmDashboardData(member.id)
      .then((data) => {
        if (cancelled) return;
        setEvents(data.events);
        setActiveMemberCount(data.activeMemberCount);
        setNotifications(data.notifications);
        setMemberRsvps(data.rsvps);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "We could not load the chamber dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [member.id]);

  const upcomingEvents = useMemo(
    () => events.filter((event) => event.status === "upcoming" && (!selectedDate || event.date === selectedDate)).slice(0, 5),
    [events, selectedDate],
  );

  const calendarDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  }, [today]);

  const eventDates = useMemo(() => new Set(events.filter((event) => event.status === "upcoming").map((event) => event.date)), [events]);

  const cycleRsvp = async (eventId: string) => {
    const current = memberRsvps[eventId];
    const next = current === "accepted" ? "maybe" : current === "maybe" ? "declined" : "accepted";
    setSavingRsvp(eventId);
    try {
      await saveSacbmRsvp(member.id, eventId, next);
      setMemberRsvps((previous) => ({ ...previous, [eventId]: next }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "We could not update your RSVP.");
    } finally {
      setSavingRsvp(null);
    }
  };

  const roleBadge = getRoleBadge(member.role);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 h-48 md:h-72">
        <div className="absolute inset-0 bg-[url('https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F3a1a4e655da0467388df0f18259e3a68?format=webp&width=1200&height=600')] bg-cover bg-center opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70" />
        <div className="relative flex h-full flex-col justify-between p-4 md:p-8">
          <div>
            <h1 className="mb-2 text-2xl font-light tracking-tight text-white md:text-5xl">Welcome back, {member.nickname || member.firstName || member.name.split(" ")[0]}</h1>
            <p className="max-w-2xl text-sm text-slate-100 md:text-lg">Manage your chamber activities and stay connected</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getTierColor(member.tier)}`}>{member.tier.toUpperCase()}</span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${roleBadge.color}`}>{roleBadge.label}</span>
          </div>
        </div>
      </div>

      {loadError && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm"><CardContent className="pb-4 pt-4"><p className="text-xs font-medium text-slate-600 md:text-sm">Upcoming events</p><p className="mt-1 text-2xl font-light text-slate-900 md:text-3xl">{loading ? "—" : events.filter((event) => event.status === "upcoming").length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="pb-4 pt-4"><p className="text-xs font-medium text-slate-600 md:text-sm">Active members</p><p className="mt-1 text-2xl font-light text-slate-900 md:text-3xl">{loading ? "—" : activeMemberCount}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="pb-4 pt-4"><p className="text-xs font-medium text-slate-600 md:text-sm">Notifications</p><p className="mt-1 text-2xl font-light text-slate-900 md:text-3xl">{loading ? "—" : notifications.length}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="order-last lg:order-first">
          <h3 className="mb-4 text-lg font-medium text-slate-900">Calendar</h3>
          <Card className="border-0 shadow-sm"><CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-900"><CalendarDays className="h-4 w-4 text-emerald-600" />{today.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
            <div className="mb-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="grid grid-cols-7 gap-1">{calendarDays.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDate === date;
              const hasEvents = eventDates.has(date);
              return <button key={date} onClick={() => setSelectedDate(isSelected ? null : date)} className={`rounded-lg py-2 text-xs font-medium transition-colors ${isSelected ? "bg-emerald-600 text-white" : hasEvents ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "text-slate-700 hover:bg-slate-50"}`}>{day}</button>;
            })}</div>
          </CardContent></Card>
        </div>

        <div className="order-first lg:order-last lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-medium text-slate-900">Upcoming Events</h3>{selectedDate && <button onClick={() => setSelectedDate(null)} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Clear date</button>}</div>
          {loading ? <Card className="border-0 shadow-sm"><CardContent className="py-10 text-center text-sm text-slate-500">Loading live chamber events...</CardContent></Card> : upcomingEvents.length === 0 ? <Card className="border-0 bg-slate-50 shadow-sm"><CardContent className="py-10 text-center"><p className="font-medium text-slate-700">No upcoming events found</p><p className="mt-1 text-sm text-slate-500">New chamber events will appear here when published.</p></CardContent></Card> : <div className="space-y-3">{upcomingEvents.map((event) => <Card key={event.id} onClick={() => onOpenEvent(event.id)} className="cursor-pointer overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-4 p-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-700">{new Date(`${event.date}T00:00:00`).getDate()}<span className="ml-1 text-xs">{new Date(`${event.date}T00:00:00`).toLocaleDateString("en-GB", { month: "short" })}</span></div><div className="min-w-0 flex-1"><h4 className="font-medium text-slate-900">{event.title}</h4><p className="mt-1 text-sm text-slate-600">{formatEventDate(event.date)} · {event.location}</p></div><button disabled={savingRsvp === event.id} onClick={(click) => { click.stopPropagation(); cycleRsvp(event.id); }} className={`shrink-0 rounded-lg px-3 py-1 text-sm font-medium ${memberRsvps[event.id] === "maybe" ? "bg-orange-50 text-orange-700" : memberRsvps[event.id] === "declined" ? "bg-red-50 text-red-700" : memberRsvps[event.id] === "accepted" ? "bg-emerald-50 text-emerald-700" : "text-emerald-600 hover:bg-emerald-50"}`}>{savingRsvp === event.id ? "Saving..." : memberRsvps[event.id] ? `${memberRsvps[event.id]} · Change` : "RSVP"}</button><ChevronRight className="h-4 w-4 text-slate-400" /></CardContent></Card>)}</div>}
        </div>
      </div>

      <div><h3 className="mb-4 text-lg font-medium text-slate-900">Recent Notifications</h3><Card className="border-0 shadow-sm"><CardContent className="pt-6">{loading ? <p className="text-sm text-slate-500">Loading notifications...</p> : notifications.length === 0 ? <p className="text-sm text-slate-500">You have no recent notifications.</p> : <div className="space-y-3">{notifications.map((notification) => <div key={notification.id} className={`rounded-lg border-l-4 bg-slate-50 p-4 ${getNotificationColor(notification)}`}><p className="font-medium text-slate-900">{notification.title}</p><p className="mt-1 text-sm text-slate-600">{notification.body}</p></div>)}</div>}</CardContent></Card></div>
    </div>
  );
};

export default SACBMDashboard;
