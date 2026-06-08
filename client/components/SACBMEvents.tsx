import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Image as ImageIcon,
  ChevronRight,
  ArrowLeft,
  Share2,
  Heart,
  Home,
  FileText,
} from "lucide-react";
import { Member, Event, EventRSVP, MemberRole } from "@shared/api";

// Mock events data
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Annual SACBM Gala 2024",
    description: "Celebrate our members' achievements and network with fellow business leaders",
    date: "2024-03-15",
    time: "18:00",
    endTime: "22:00",
    location: "Polana Serena Hotel, Maputo",
    capacity: 200,
    createdBy: "admin",
    createdDate: "2024-01-20",
    status: "upcoming",
    rsvpDeadline: "2024-03-08",
  },
  {
    id: "2",
    title: "Business Breakfast: Digital Transformation",
    description: "Learn from industry experts about digital trends affecting African businesses",
    date: "2024-02-28",
    time: "07:30",
    endTime: "09:30",
    location: "Hotel Avenida, Maputo",
    capacity: 100,
    createdBy: "exco",
    createdDate: "2024-02-01",
    status: "upcoming",
    rsvpDeadline: "2024-02-24",
  },
  {
    id: "3",
    title: "Board Meeting - Q1 2024",
    description: "Quarterly board meeting for governance and strategic planning",
    date: "2024-02-15",
    time: "14:00",
    endTime: "17:00",
    location: "SACBM Office, Maputo",
    createdBy: "admin",
    createdDate: "2024-01-25",
    status: "upcoming",
    rsvpDeadline: "2024-02-12",
  },
  {
    id: "4",
    title: "SACBM Annual General Meeting",
    description: "Members meeting to discuss annual reports and elect leadership",
    date: "2024-05-10",
    time: "10:00",
    endTime: "13:00",
    location: "Sofitel Hotel, Maputo",
    capacity: 250,
    createdBy: "admin",
    createdDate: "2024-02-05",
    status: "upcoming",
    rsvpDeadline: "2024-05-03",
  },
  {
    id: "5",
    title: "Member Networking Lunch",
    description: "Casual lunch to foster connections among members",
    date: "2024-01-20",
    time: "12:00",
    endTime: "14:00",
    location: "Restaurante Tana Bula, Maputo",
    capacity: 80,
    createdBy: "board",
    createdDate: "2023-12-15",
    status: "completed",
    rsvpDeadline: "2024-01-15",
  },
];

// Mock RSVPs
const MOCK_RSVPS: EventRSVP[] = [
  { id: "1", eventId: "1", memberId: "1", status: "accepted", rsvpDate: "2024-02-10" },
  { id: "2", eventId: "2", memberId: "1", status: "accepted", rsvpDate: "2024-02-15" },
  { id: "3", eventId: "3", memberId: "1", status: "maybe", rsvpDate: "2024-02-08" },
];

interface SACBMEventsProps {
  member: Member;
  onNavigate?: (section: "dashboard" | "documents" | "events" | "members") => void;
}

const SACBMEvents: React.FC<SACBMEventsProps> = ({ member, onNavigate }) => {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailedEvent, setDetailedEvent] = useState<Event | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [memberRsvps, setMemberRsvps] = useState<Record<string, EventRSVP["status"]>>({});
  const [rsvpResponse, setRsvpResponse] = useState<Record<string, { status: string; reason?: string; date?: string }>>({});
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [showMaybeForm, setShowMaybeForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [maybeDate, setMaybeDate] = useState("");

  // Initialize RSVPs for current member
  useMemo(() => {
    const rsvps: Record<string, EventRSVP["status"]> = {};
    MOCK_RSVPS.forEach((rsvp) => {
      rsvps[rsvp.eventId] = rsvp.status;
    });
    setMemberRsvps(rsvps);
  }, []);

  const upcomingEvents = MOCK_EVENTS.filter((e) => e.status === "upcoming").sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const pastEvents = MOCK_EVENTS.filter((e) => e.status === "completed").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const events = selectedTab === "upcoming" ? upcomingEvents : pastEvents;

  const handleRsvp = (eventId: string, status: EventRSVP["status"]) => {
    setMemberRsvps((prev) => ({
      ...prev,
      [eventId]: status,
    }));
  };

  const isRsvpDeadlinePass = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Events</h2>
          <p className="text-slate-600 text-sm mt-1">
            Discover chamber events, RSVP, and view event galleries
          </p>
        </div>
        {member.role === MemberRole.ADMIN || member.role === MemberRole.BOARD ? (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setSelectedTab("upcoming")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            selectedTab === "upcoming"
              ? "text-emerald-600 border-emerald-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
          }`}
        >
          Upcoming Events ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setSelectedTab("past")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            selectedTab === "past"
              ? "text-emerald-600 border-emerald-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
          }`}
        >
          Past Events ({pastEvents.length})
        </button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">
              No {selectedTab} events
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {selectedTab === "upcoming"
                ? "Check back soon for upcoming events"
                : "No past events to display"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const rsvpStatus = memberRsvps[event.id];
            const isDeadlinePassed = isRsvpDeadlinePass(event.rsvpDeadline);

            return (
              <Card
                key={event.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => setDetailedEvent(event)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image/Placeholder */}
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full md:w-48 h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full md:w-48 h-48 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-slate-400" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-2 mt-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            {event.time} {event.endTime && `- ${event.endTime}`}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            {event.location}
                          </div>
                          {event.capacity && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              Capacity: {event.capacity} people
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RSVP Section */}
                      {selectedTab === "upcoming" && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          {isDeadlinePassed ? (
                            <p className="text-sm text-slate-600">RSVP deadline has passed</p>
                          ) : (
                            <div>
                              {rsvpStatus ? (
                                <div className="flex items-center gap-2 mb-3">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">
                                    You've responded: <strong>{rsvpStatus}</strong>
                                  </span>
                                </div>
                              ) : null}
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRsvp(event.id, "accepted");
                                  }}
                                  className={`gap-2 ${
                                    rsvpStatus === "accepted"
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                  }`}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRsvp(event.id, "maybe");
                                  }}
                                  className={`gap-2 ${
                                    rsvpStatus === "maybe"
                                      ? "bg-amber-600 hover:bg-amber-700"
                                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                  }`}
                                >
                                  <HelpCircle className="h-4 w-4" />
                                  Maybe
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRsvp(event.id, "declined");
                                  }}
                                  className={`gap-2 ${
                                    rsvpStatus === "declined"
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                  }`}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Past Event Gallery Link */}
                      {selectedTab === "past" && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to event gallery
                            }}
                          >
                            <ImageIcon className="h-4 w-4" />
                            View Gallery
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Event Detail Page */}
      {detailedEvent && (
        <div className="fixed inset-0 bg-white z-50 flex">
          {/* Left Sidebar - Collapsible */}
          <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 flex flex-col p-4 overflow-y-auto transition-all duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setDetailedEvent(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium flex-1"
              >
                <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>Back</span>}
              </button>
            </div>
            {sidebarOpen && (
              <div className="flex-1 space-y-2">
                <button
                  onClick={() => {
                    setDetailedEvent(null);
                    onNavigate?.("dashboard");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-sm">Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setDetailedEvent(null);
                    onNavigate?.("documents");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Documents</span>
                </button>
                <button
                  onClick={() => setDetailedEvent(null)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Events</span>
                </button>
                <button
                  onClick={() => {
                    setDetailedEvent(null);
                    onNavigate?.("members");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Directory</span>
                </button>
              </div>
            )}
            <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                title={sidebarOpen ? "Collapse" : "Expand"}
              >
                <ChevronRight className={`h-5 w-5 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
                {sidebarOpen && <span>Collapse</span>}
              </button>
            </div>
          </div>

          {/* Content with Sidebar Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main Content - Left 2/3 */}
            <div className="flex-1 overflow-auto">
              <div className="max-w-3xl mx-auto px-8 py-12">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-6">
                  {detailedEvent.title}
                </h1>

                {/* Event Meta - Better Spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-8 border-b border-slate-200">
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Date</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date(detailedEvent.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Time</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {detailedEvent.time}
                      {detailedEvent.endTime && ` - ${detailedEvent.endTime}`}
                    </p>
                  </div>
                  <div className={detailedEvent.capacity ? "lg:col-span-1" : "sm:col-span-2"}>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Location</p>
                    <p className="text-lg font-semibold text-slate-900">{detailedEvent.location}</p>
                  </div>
                  {detailedEvent.capacity && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Capacity</p>
                      <p className="text-lg font-semibold text-slate-900">{detailedEvent.capacity} people</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">About this event</h2>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    {detailedEvent.description}
                  </p>
                </div>

                {/* How to Sign Up */}
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">How to register</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 text-white">
                          1
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Confirm your attendance</p>
                        <p className="text-slate-600 mt-1">Click the RSVP button to let us know you're coming</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 text-white">
                          2
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">You'll receive a confirmation</p>
                        <p className="text-slate-600 mt-1">A confirmation email with all event details will be sent to you</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 text-white">
                          3
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Join us at the event</p>
                        <p className="text-slate-600 mt-1">Arrive 15 minutes early for check-in</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Directions */}
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">How to get there</h2>
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <p className="text-slate-600 mb-4">
                      <strong className="text-slate-900">{detailedEvent.location}</strong>
                    </p>
                    <p className="text-slate-600 mb-4">
                      The venue is easily accessible by car or public transportation. Parking will be available on-site.
                    </p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Get Directions
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right 1/3 with Image and RSVP */}
            <div className="hidden md:flex md:w-1/3 flex-col bg-white border-l border-slate-200 h-[calc(100vh-80px)] overflow-hidden">
              {/* Image - Longer to cover top */}
              <div className="h-2/3 min-h-[450px] bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <Calendar className="h-24 w-24 text-slate-300" />
              </div>

              {/* RSVP Section - Sticky Bottom */}
              <div className="flex-1 overflow-auto p-6 bg-white space-y-4 border-t border-slate-200">
                {/* RSVP Deadline - Visible at top */}
                <div className="pb-3 border-b border-slate-200">
                  <p className="text-xs text-slate-600 font-medium">
                    RSVP by <span className="font-semibold text-slate-900">{new Date(detailedEvent.rsvpDeadline).toLocaleDateString()}</span>
                  </p>
                </div>

                {rsvpResponse[detailedEvent.id]?.status === "accepted" ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-2xl font-light tracking-tight text-emerald-900 mb-0.5">
                        {member.name.split(" ")[0]},
                      </p>
                      <p className="text-base font-light text-emerald-800 mb-5">you're attending!</p>
                      <div className="space-y-3">
                        <button className="w-full text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2 rounded transition-colors text-center">
                          Add to Calendar
                        </button>
                        <button
                          onClick={() => {
                            setRsvpResponse(prev => ({ ...prev, [detailedEvent.id]: undefined }));
                          }}
                          className="w-full text-xs text-emerald-700 hover:text-emerald-800 font-medium py-1 transition-colors"
                        >
                          Change response
                        </button>
                      </div>
                    </div>
                  </div>
                ) : rsvpResponse[detailedEvent.id]?.status === "declined" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm font-semibold text-slate-700 mb-2">You declined</p>
                      <p className="text-xs text-slate-600 mb-3">{rsvpResponse[detailedEvent.id].reason}</p>
                      <button
                        onClick={() => {
                          setRsvpResponse(prev => ({ ...prev, [detailedEvent.id]: undefined }));
                          setShowDeclineForm(false);
                        }}
                        className="w-full text-xs text-slate-700 hover:text-slate-900 font-medium py-1 transition-colors"
                      >
                        Change response
                      </button>
                    </div>
                  </div>
                ) : rsvpResponse[detailedEvent.id]?.status === "maybe" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-semibold text-amber-800 mb-2">You'll decide by</p>
                      <p className="text-sm font-medium text-amber-900 mb-4">{rsvpResponse[detailedEvent.id].date}</p>

                      {/* Reminder timestamps */}
                      <div className="space-y-2 mb-4 pb-4 border-b border-amber-200">
                        <p className="text-xs font-medium text-amber-800 mb-2">You'll get reminders:</p>
                        {(() => {
                          const eventDate = new Date(detailedEvent.date);
                          const reminder4Days = new Date(eventDate);
                          reminder4Days.setDate(reminder4Days.getDate() - 4);
                          const reminder2Days = new Date(eventDate);
                          reminder2Days.setDate(reminder2Days.getDate() - 2);
                          const reminder12Hours = new Date(eventDate);
                          reminder12Hours.setHours(reminder12Hours.getHours() - 12);

                          return (
                            <>
                              <p className="text-xs text-amber-700">• {reminder4Days.toLocaleDateString()} (4 days before)</p>
                              <p className="text-xs text-amber-700">• {reminder2Days.toLocaleDateString()} (2 days before)</p>
                              <p className="text-xs text-amber-700">• {reminder12Hours.toLocaleDateString()} at {reminder12Hours.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (12 hours before)</p>
                            </>
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => {
                          setRsvpResponse(prev => ({ ...prev, [detailedEvent.id]: undefined }));
                          setShowMaybeForm(false);
                        }}
                        className="w-full text-xs text-amber-700 hover:text-amber-800 font-medium py-1 transition-colors"
                      >
                        Change response
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-4">Will you attend?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setRsvpResponse(prev => ({ ...prev, [detailedEvent.id]: { status: "accepted" } }))}
                        className="flex-1 text-sm font-medium text-emerald-700 hover:text-emerald-900 py-2 text-center transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setShowMaybeForm(true)}
                        className="flex-1 text-sm font-medium text-amber-700 hover:text-amber-900 py-2 text-center transition-colors"
                      >
                        Maybe
                      </button>
                      <button
                        onClick={() => setShowDeclineForm(true)}
                        className="flex-1 text-sm font-medium text-red-700 hover:text-red-900 py-2 text-center transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Decline Reason Modal */}
          {showDeclineForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <CardTitle className="text-xl font-light tracking-tight">Why can't you attend?</CardTitle>
                  <CardDescription className="text-slate-600">Your feedback helps us improve future events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <Textarea
                    placeholder="Tell us why you can't make it (optional)"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="min-h-[100px] border-slate-200 focus:border-slate-400 focus:ring-slate-300"
                  />
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => {
                        setRsvpResponse(prev => ({
                          ...prev,
                          [detailedEvent.id]: { status: "declined", reason: declineReason || "Can't attend" }
                        }));
                        setShowDeclineForm(false);
                        setDeclineReason("");
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeclineForm(false);
                        setDeclineReason("");
                      }}
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Maybe Decision Date Modal */}
          {showMaybeForm && detailedEvent && (() => {
            const eventDate = new Date(detailedEvent.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Max date is 24 hours before event
            const maxDate = new Date(eventDate);
            maxDate.setDate(maxDate.getDate() - 1);

            // Format dates for input
            const formatDateForInput = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            };

            const todayStr = formatDateForInput(today);
            const maxDateStr = formatDateForInput(maxDate);
            const isDateValid = !!maybeDate;

            return (
              <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md border-0 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                    <CardTitle className="text-xl font-light tracking-tight">When will you know?</CardTitle>
                    <CardDescription className="text-slate-600">Decide by {new Date(maxDate).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Decision date</label>
                      <input
                        type="date"
                        value={maybeDate}
                        onChange={(e) => setMaybeDate(e.target.value)}
                        min={todayStr}
                        max={maxDateStr}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-2">Must decide by 24 hours before the event</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => {
                          if (isDateValid) {
                            setRsvpResponse(prev => ({
                              ...prev,
                              [detailedEvent.id]: { status: "maybe", date: new Date(maybeDate).toLocaleDateString() }
                            }));
                            setShowMaybeForm(false);
                            setMaybeDate("");
                          }
                        }}
                        disabled={!isDateValid}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={() => {
                          setShowMaybeForm(false);
                          setMaybeDate("");
                        }}
                        variant="outline"
                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SACBMEvents;
