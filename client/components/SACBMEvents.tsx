import { useEffect, useState } from "react";
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
  Download,
} from "lucide-react";
import { Member, Event, EventAttachment, EventGallery, EventRSVP, MemberRole } from "@shared/api";
import { createSacbmEvent, getSacbmEventGalleries, getSacbmEventRsvps, getSacbmEvents, saveSacbmRsvp, uploadSacbmEventGallery } from "@/services/sacbmService";

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
    registrationInfo: "Click the RSVP button to confirm your attendance. You will receive a confirmation email with all event details.",
    directionsInfo: "The venue is easily accessible by car or public transportation. Parking will be available on-site.",
  },
  {
    id: "2",
    title: "Business Breakfast: Digital Transformation",
    description: "Learn from industry experts about digital trends affecting African businesses",
    date: "2024-02-28",
    time: "07:30",
    endTime: "09:30",
    location: "Zoom",
    capacity: 100,
    zoomLink: "https://zoom.us/j/123456789",
    createdBy: "exco",
    createdDate: "2024-02-01",
    status: "upcoming",
    rsvpDeadline: "2024-02-24",
    registrationInfo: "RSVP below to receive the Zoom link. Join 5 minutes early to test your audio and video.",
    directionsInfo: "This is an online event. You can join from anywhere with an internet connection.",
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

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

// Mock RSVPs
const MOCK_RSVPS: EventRSVP[] = [
  { id: "1", eventId: "1", memberId: "1", status: "accepted", rsvpDate: "2024-02-10" },
  { id: "2", eventId: "2", memberId: "1", status: "accepted", rsvpDate: "2024-02-15" },
  { id: "3", eventId: "3", memberId: "1", status: "maybe", rsvpDate: "2024-02-08" },
];

const MOCK_GALLERIES: Record<string, EventGallery[]> = {
  "5": [
    { id: "gallery-5-1", eventId: "5", imageUrl: "https://images.unsplash.com/photo-1519671482677-504be0271101?w=900&h=650&fit=crop", caption: "Members connecting over lunch", uploadedBy: "admin", uploadedDate: "2024-01-21" },
    { id: "gallery-5-2", eventId: "5", imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&h=650&fit=crop", caption: "A room full of new connections", uploadedBy: "admin", uploadedDate: "2024-01-21" },
    { id: "gallery-5-3", eventId: "5", imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=900&h=650&fit=crop", caption: "Chamber conversations", uploadedBy: "admin", uploadedDate: "2024-01-21" },
  ],
};

interface SACBMEventsProps {
  member: Member;
  onNavigate?: (section: "dashboard" | "documents" | "events" | "members") => void;
  initialEventId?: string | null;
}

const SACBMEvents: React.FC<SACBMEventsProps> = ({ member, onNavigate, initialEventId }) => {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">("upcoming");
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [galleryEvent, setGalleryEvent] = useState<Event | null>(null);
  const [galleryImages, setGalleryImages] = useState<Record<string, EventGallery[]>>({});
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailedEvent, setDetailedEvent] = useState<Event | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [memberRsvps, setMemberRsvps] = useState<Record<string, EventRSVP["status"]>>({});
  const [rsvpResponse, setRsvpResponse] = useState<Record<string, { status: string; reason?: string; date?: string }>>({});
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [showMaybeForm, setShowMaybeForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [maybeDate, setMaybeDate] = useState("");
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    capacity: "",
    rsvpDeadline: "",
    zoomLink: "",
    registrationInfo: "",
    directionsInfo: "",
    imageUrl: "",
    imageFile: null as File | null,
    attachments: [] as EventAttachment[],
    attachmentFiles: [] as File[],
  });


  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    setEventsError("");

    Promise.all([getSacbmEvents(), getSacbmEventRsvps(member.id)])
      .then(([loadedEvents, loadedRsvps]) => {
        if (cancelled) return;
        setEventsData(loadedEvents);
        setMemberRsvps(loadedRsvps);
      })
      .catch((error) => {
        if (!cancelled) setEventsError(error instanceof Error ? error.message : "We could not load chamber events.");
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [member.id]);

  useEffect(() => {
    if (!initialEventId) return;
    const event = eventsData.find((item) => item.id === initialEventId);
    if (event) setDetailedEvent(event);
  }, [initialEventId, eventsData]);

  useEffect(() => {
    if (!galleryEvent) return;
    let cancelled = false;
    setGalleryLoading(true);
    getSacbmEventGalleries(galleryEvent.id)
      .then((images) => {
        if (!cancelled) setGalleryImages((current) => ({ ...current, [galleryEvent.id]: images }));
      })
      .catch((error) => {
        if (!cancelled) setEventsError(error instanceof Error ? error.message : "We could not load the event gallery.");
      })
      .finally(() => {
        if (!cancelled) setGalleryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [galleryEvent]);

  const upcomingEvents = eventsData.filter((e) => e.status === "upcoming").sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const pastEvents = eventsData.filter((e) => e.status === "completed").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const events = selectedTab === "upcoming" ? upcomingEvents : pastEvents;

  const handleRsvp = async (eventId: string, status: EventRSVP["status"]) => {
    try {
      await saveSacbmRsvp(member.id, eventId, status);
      setMemberRsvps((prev) => ({
        ...prev,
        [eventId]: status,
      }));
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : "We could not update your RSVP.");
    }
  };

  const addGalleryPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!galleryEvent) return;
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setEventsError("");
    try {
      const uploads = await uploadSacbmEventGallery({ eventId: galleryEvent.id, memberId: member.id, files });
      setGalleryImages((current) => ({ ...current, [galleryEvent.id]: [...(current[galleryEvent.id] || []), ...uploads] }));
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : "We could not upload the event photos.");
    } finally {
      event.target.value = "";
    }
  };

  const downloadPhoto = (image: EventGallery) => {
    const link = document.createElement("a");
    link.href = image.imageUrl;
    link.download = image.caption || "sacbm-event-photo";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const downloadAllPhotos = (images: EventGallery[]) => {
    images.forEach((image, index) => {
      window.setTimeout(() => downloadPhoto(image), index * 150);
    });
  };

  const isRsvpDeadlinePass = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      date: "",
      time: "",
      endTime: "",
      location: "",
      capacity: "",
      rsvpDeadline: "",
      zoomLink: "",
      registrationInfo: "",
      directionsInfo: "",
      imageUrl: "",
      imageFile: null,
      attachments: [],
      attachmentFiles: [],
    });
  };

  const saveEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.date || !eventForm.time || !eventForm.location.trim() || !eventForm.rsvpDeadline) return;
    setEventsError("");
    try {
      const newEvent = await createSacbmEvent({
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time,
        endTime: eventForm.endTime,
        location: eventForm.location,
        capacity: eventForm.capacity ? Number(eventForm.capacity) : undefined,
        rsvpDeadline: eventForm.rsvpDeadline,
        zoomLink: eventForm.zoomLink,
        registrationInfo: eventForm.registrationInfo,
        directionsInfo: eventForm.directionsInfo,
        createdBy: member.id,
        imageFile: eventForm.imageFile || undefined,
        attachmentFiles: eventForm.attachmentFiles,
      });
      setEventsData((current) => [...current, newEvent]);
      resetEventForm();
      setShowCreateEvent(false);
      setSelectedTab("upcoming");
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : "We could not create the event.");
    }
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
        {member.role === MemberRole.ADMIN ? (
          <Button onClick={() => setShowCreateEvent(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        ) : null}
      </div>

      {eventsError && <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{eventsError}</p>}

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
      {eventsLoading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-slate-500">Loading chamber events...</CardContent>
        </Card>
      ) : events.length === 0 ? (
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
                                      ? "bg-orange-600 hover:bg-orange-700"
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
                              setGalleryEvent(event);
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

      {galleryEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setGalleryEvent(null)}>
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border-0 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-light tracking-tight text-slate-900">{galleryEvent.title}</CardTitle>
                  <CardDescription className="mt-1">Post-event gallery · {galleryEvent.location}</CardDescription>
                </div>
                <button onClick={() => setGalleryEvent(null)} className="rounded-md px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {galleryLoading ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">Loading gallery...</div>
              ) : galleryImages[galleryEvent.id]?.length ? (
                <>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">{galleryImages[galleryEvent.id].length} photo{galleryImages[galleryEvent.id].length === 1 ? "" : "s"}</p>
                    <Button variant="outline" size="sm" onClick={() => downloadAllPhotos(galleryImages[galleryEvent.id])} className="border-slate-300 text-slate-700 hover:bg-slate-50">
                      <Download className="h-4 w-4" />
                      Download all photos
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryImages[galleryEvent.id].map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <a href={image.imageUrl} target="_blank" rel="noopener noreferrer" className="group block">
                        <img src={image.imageUrl} alt={image.caption || galleryEvent.title} className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </a>
                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <p className="truncate text-xs text-slate-600">{image.caption || "Event photo"}</p>
                        <button onClick={() => downloadPhoto(image)} title="Download photo" className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-emerald-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                  <ImageIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-700">No photos have been added yet</p>
                  <p className="mt-1 text-sm text-slate-500">The gallery will appear here after the event.</p>
                </div>
              )}
              {member.role === MemberRole.ADMIN && (
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Add event photos</p>
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG, or JPEG files</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                    Upload photos
                    <input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple onChange={addGalleryPhotos} className="hidden" />
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showCreateEvent && member.role === MemberRole.ADMIN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-0 shadow-2xl">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-light tracking-tight text-slate-900">Create event</CardTitle>
                  <CardDescription className="mt-1">Add the event details members will see in the portal.</CardDescription>
                </div>
                <button type="button" onClick={() => setShowCreateEvent(false)} className="rounded-md px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={(event) => { event.preventDefault(); saveEvent(); }} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Event title</label>
                    <input required value={eventForm.title} onChange={(event) => setEventForm((form) => ({ ...form, title: event.target.value }))} placeholder="e.g. SACBM Members Breakfast" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                    <Textarea required value={eventForm.description} onChange={(event) => setEventForm((form) => ({ ...form, description: event.target.value }))} placeholder="Describe the purpose and impact of the event" rows={4} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                    <input required type="date" value={eventForm.date} onChange={(event) => setEventForm((form) => ({ ...form, date: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">RSVP by</label>
                    <input required type="date" value={eventForm.rsvpDeadline} onChange={(event) => setEventForm((form) => ({ ...form, rsvpDeadline: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Start time</label>
                    <select required value={eventForm.time} onChange={(event) => setEventForm((form) => ({ ...form, time: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
                      <option value="">Select time</option>
                      {TIME_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">End time <span className="font-normal text-slate-400">(optional)</span></label>
                    <select value={eventForm.endTime} onChange={(event) => setEventForm((form) => ({ ...form, endTime: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
                      <option value="">Select time</option>
                      {TIME_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                    <input required value={eventForm.location} onChange={(event) => setEventForm((form) => ({ ...form, location: event.target.value }))} placeholder="Venue or Online" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Capacity <span className="font-normal text-slate-400">(optional)</span></label>
                    <input type="number" min="1" value={eventForm.capacity} onChange={(event) => setEventForm((form) => ({ ...form, capacity: event.target.value }))} placeholder="e.g. 100" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Online meeting link <span className="font-normal text-slate-400">(optional)</span></label>
                    <input type="url" value={eventForm.zoomLink} onChange={(event) => setEventForm((form) => ({ ...form, zoomLink: event.target.value }))} placeholder="Paste Zoom, Teams, or Meet link" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">How to register <span className="font-normal text-slate-400">(optional)</span></label>
                    <Textarea value={eventForm.registrationInfo} onChange={(event) => setEventForm((form) => ({ ...form, registrationInfo: event.target.value }))} placeholder="Explain how members should register or confirm attendance" rows={3} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">How to get there <span className="font-normal text-slate-400">(optional)</span></label>
                    <Textarea value={eventForm.directionsInfo} onChange={(event) => setEventForm((form) => ({ ...form, directionsInfo: event.target.value }))} placeholder="Add venue directions or online access instructions" rows={3} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Cover image <span className="font-normal text-slate-400">(PNG or JPG)</span></label>
                    <input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setEventForm((form) => ({ ...form, imageFile: file, imageUrl: URL.createObjectURL(file) }));
                    }} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700" />
                    <p className="mt-1 text-xs text-slate-500">Accepted formats: .png, .jpg, .jpeg</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Event attachments <span className="font-normal text-slate-400">(PDF or Excel)</span></label>
                    <input type="file" multiple accept="application/pdf,.pdf,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,text/csv,.csv" onChange={(event) => {
                      const files = Array.from(event.target.files || []);
                      const attachments = files.map((file) => ({ name: file.name, fileUrl: URL.createObjectURL(file), fileType: file.type }));
                      setEventForm((form) => ({ ...form, attachments, attachmentFiles: files }));
                    }} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700" />
                    <p className="mt-1 text-xs text-slate-500">Attach agendas, registration sheets, budgets, or supporting documents.</p>
                    {eventForm.attachmentFiles.length > 0 && <p className="mt-2 text-xs font-medium text-emerald-700">{eventForm.attachmentFiles.length} attachment{eventForm.attachmentFiles.length === 1 ? "" : "s"} selected</p>}
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCreateEvent(false)} className="border-slate-300">Cancel</Button>
                  <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700">Publish event</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Detail Page */}
      {detailedEvent && (
        <div className="fixed inset-0 bg-white z-50 flex">
          {/* Left Sidebar - Collapsible */}
          <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 flex flex-col p-4 overflow-y-auto transition-all duration-300`}>
            <div className="mb-6 border-b border-slate-200 pb-4">
              {sidebarOpen ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Fb6df1f14bb5a44b792b09b4e7cb119ad?format=webp&width=200"
                  alt="SACBM Logo"
                  className="h-7 w-auto"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700">
                  <span className="text-sm font-bold text-white">S</span>
                </div>
              )}
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
                <button
                  onClick={() => setDetailedEvent(null)}
                  className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to events
                </button>

                {detailedEvent.imageUrl && (
                  <img src={detailedEvent.imageUrl} alt={detailedEvent.title} className="mb-8 h-56 w-full rounded-2xl object-cover md:hidden" />
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-6">
                  {detailedEvent.title}
                </h1>

                {/* Online Meeting Link */}
                {detailedEvent.zoomLink && (
                  <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50/70 p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">Online meeting link</p>
                    <a href={detailedEvent.zoomLink} target="_blank" rel="noopener noreferrer" className="break-all text-sm font-semibold text-blue-700 hover:text-blue-900">
                      {detailedEvent.zoomLink}
                    </a>
                  </div>
                )}

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
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {detailedEvent.registrationInfo || "Click the RSVP button to confirm your attendance. You will receive a confirmation email with all event details."}
                    </p>
                  </div>
                </div>

                {detailedEvent.attachments && detailedEvent.attachments.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-4">Event documents</h2>
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      {detailedEvent.attachments.map((attachment) => (
                        <a key={attachment.fileUrl} href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{attachment.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Directions */}
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">How to get there</h2>
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <p className="text-slate-600 mb-4">
                      <strong className="text-slate-900">{detailedEvent.location}</strong>
                    </p>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {detailedEvent.directionsInfo || "The venue is easily accessible by car or public transportation. Parking will be available on-site."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right 1/3 with Image and RSVP */}
            <div className="hidden md:flex md:w-1/3 flex-col bg-white border-l border-slate-200 h-[calc(100vh-80px)] overflow-hidden">
              {/* Cover image */}
              <div className="h-2/3 min-h-[450px] overflow-hidden bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                {detailedEvent.imageUrl ? (
                  <img src={detailedEvent.imageUrl} alt={detailedEvent.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Calendar className="h-24 w-24 text-slate-300" />
                  </div>
                )}
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
                        onClick={async () => {
                          await handleRsvp(detailedEvent.id, "accepted");
                          setRsvpResponse(prev => ({ ...prev, [detailedEvent.id]: { status: "accepted" } }));
                        }}
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
                      onClick={async () => {
                        await handleRsvp(detailedEvent.id, "declined");
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
                        onClick={async () => {
                          if (isDateValid) {
                            await handleRsvp(detailedEvent.id, "maybe");
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
