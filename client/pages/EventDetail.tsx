import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users, Clock, Download, FileText } from "lucide-react";
import { getAllEvents, type Event } from "@/services/eventsService";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    const loadEvents = async () => {
      const events = await getAllEvents();
      setAllEvents(events);
      const foundEvent = events.find((e) => e.id === eventId);
      setEvent(foundEvent);
    };
    loadEvents();
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNavbar />
        <div className="mx-auto max-w-4xl px-6 sm:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-light text-slate-900 mb-4">Event Not Found</h1>
            <p className="text-slate-600 mb-8">The event you're looking for doesn't exist.</p>
            <Button
              onClick={() => navigate("/events")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <PublicNavbar />

      {/* Header with Back Button */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 py-8">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-8 sm:py-12">
        <div className={`grid grid-cols-1 gap-8 ${event?.image_url ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          {/* Left Column - Event Details Card */}
          <div className={event.image ? 'lg:col-span-2' : 'lg:col-span-1'}>
            <div className="rounded-lg border border-slate-200 bg-white p-10 sm:p-14 shadow-sm">
              {/* Category Badge */}
              <div className="mb-6 inline-block rounded-full bg-emerald-100 px-4 py-2">
                <span className="text-sm font-medium text-emerald-700">{event.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-slate-900 mb-6">
                {event.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-2xl">
                {event.description}
              </p>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-t border-b border-slate-200">
                {/* Date */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-6 w-6 text-emerald-700" />
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Date</span>
                  </div>
                  <p className="text-xl text-slate-900 font-light">{event.date}</p>
                </div>

                {/* Time */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-6 w-6 text-emerald-700" />
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Time</span>
                  </div>
                  <p className="text-xl text-slate-900 font-light">{event.time}</p>
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-6 w-6 text-emerald-700" />
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Location</span>
                  </div>
                  <p className="text-xl text-slate-900 font-light">{event.location}</p>
                </div>

                {/* Expected Attendees */}
                {event.attendees && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-6 w-6 text-emerald-700" />
                      <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Expected Attendees</span>
                    </div>
                    <p className="text-xl text-slate-900 font-light">~{event.attendees}</p>
                  </div>
                )}
              </div>

              {/* CTA Section */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium">
                  Register for Event
                </Button>
                <Button size="lg" variant="outline" className="font-medium">
                  Share Event
                </Button>
              </div>

              {/* About This Event */}
              <div className="mt-12 pt-12 border-t border-slate-200">
                <h2 className="text-2xl font-light text-slate-900 mb-4">About This Event</h2>
                <p className="text-slate-600 leading-relaxed">
                  This is part of SACBM's ongoing commitment to social responsibility and community impact.
                  All members are encouraged to participate and contribute to our collective mission of making
                  a positive difference across Mozambique.
                </p>
              </div>

              {/* Ways Members Can Help */}
              {event.helpNeeds && event.helpNeeds.length > 0 && (
                <div className="mt-12 pt-12 border-t border-slate-200">
                  <h2 className="text-2xl font-light text-slate-900 mb-8">Ways Members Can Help</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.helpNeeds.map((need, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-6 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-6 w-6 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">✓</span>
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium">{need.name}</p>
                            {need.quantity && (
                              <p className="text-sm text-emerald-700 font-semibold mt-1">
                                Needed: {need.quantity} {need.unit || "items"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-6 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-slate-700">
                      {event.contactMessage || "If you'd like to contribute to this event, please contact the SACBM office to coordinate your support."}
                    </p>
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {event.attachments && event.attachments.length > 0 && (
                <div className="mt-12 pt-12 border-t border-slate-200">
                  <h2 className="text-2xl font-light text-slate-900 mb-6">Event Documents</h2>
                  <div className="space-y-2">
                    {event.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        download={attachment.name}
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-300 transition-all group"
                      >
                        <FileText className="h-5 w-5 text-slate-500 group-hover:text-emerald-700 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {attachment.name}
                          </p>
                        </div>
                        <Download className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 flex-shrink-0 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Picture Gallery (only show if image exists) */}
          {event?.image_url && (
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                {/* Main Image */}
                <div className="mb-6">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-64 md:h-80 object-cover rounded-lg"
                  />
                </div>

                {/* Gallery Heading */}
                <h3 className="text-lg font-light text-slate-900 mb-4">Event Gallery</h3>

                {/* Thumbnails Grid */}
                {event.gallery && event.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {event.gallery.map((galleryImage, idx) => (
                      <button
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-300 transition-colors group"
                      >
                        <img
                          src={galleryImage}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="w-full p-8 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <p className="text-slate-400 text-sm">No additional gallery images</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Events Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-light text-slate-900 mb-8">Other Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allEvents
              .filter((e) => e.id !== event.id)
              .slice(0, 2)
              .map((relatedEvent) => (
                <button
                  key={relatedEvent.id}
                  onClick={() => navigate(`/event/${relatedEvent.id}`)}
                  className="text-left rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="mb-3 inline-block rounded-full bg-slate-100 px-3 py-1 group-hover:bg-emerald-100 transition-colors">
                    <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
                      {relatedEvent.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {relatedEvent.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{relatedEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span>{relatedEvent.location}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default EventDetail;
