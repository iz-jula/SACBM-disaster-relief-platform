import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}

const SACBMEvents: React.FC<SACBMEventsProps> = ({ member }) => {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [memberRsvps, setMemberRsvps] = useState<Record<string, EventRSVP["status"]>>({});

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
                onClick={() => setSelectedEvent(event)}
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedEvent.title}</CardTitle>
                  <CardDescription className="mt-2">{selectedEvent.description}</CardDescription>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Date</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Time</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedEvent.time} {selectedEvent.endTime && `- ${selectedEvent.endTime}`}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 font-medium">Location</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedEvent.location}</p>
                </div>
                {selectedEvent.capacity && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Capacity</p>
                    <p className="font-semibold text-slate-900 mt-1">{selectedEvent.capacity} people</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600 font-medium">RSVP Deadline</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {new Date(selectedEvent.rsvpDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SACBMEvents;
