import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { getAllEvents, type Event } from "@/services/eventsService";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const allEvents = useMemo(() => getAllEvents(), []);

  const categories = useMemo(
    () => ["All", ...new Set(allEvents.map((e) => e.category))],
    [allEvents]
  );
  const filteredEvents = useMemo(
    () => selectedCategory === "All"
      ? allEvents
      : allEvents.filter((e) => e.category === selectedCategory),
    [selectedCategory, allEvents]
  );

  const featuredEvents = filteredEvents.filter((e) => e.featured);
  const upcomingEvents = filteredEvents.filter((e) => !e.featured);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Header Section */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900">
            Upcoming Events
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl">
            Join us for community initiatives, training programs, and social impact activities
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-300 text-slate-700 hover:border-emerald-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 sm:px-8 py-20">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
              Featured Events
            </h2>
            <p className="mt-2 text-base text-slate-600">Don't miss these upcoming highlights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-slate-200 bg-white p-8 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1">
                  <span className="text-sm font-medium text-emerald-700">{event.category}</span>
                </div>
                <h3 className="text-2xl font-light text-slate-900 mb-4">{event.title}</h3>
                <p className="text-slate-600 mb-6">{event.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="h-5 w-5 text-emerald-700" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock className="h-5 w-5 text-emerald-700" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="h-5 w-5 text-emerald-700" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                  {event.attendees && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Users className="h-5 w-5 text-emerald-700" />
                      <span className="text-sm">~{event.attendees} attendees</span>
                    </div>
                  )}
                </div>

                <Link to={`/event/${event.id}`} className="w-full">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 sm:px-8 py-20 border-t border-slate-200">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
              More Events
            </h2>
            <p className="mt-2 text-base text-slate-600">Additional activities and initiatives</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="mb-3 inline-block rounded-full bg-slate-100 px-3 py-1 w-fit group-hover:bg-emerald-100 transition-colors">
                  <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">{event.category}</span>
                </div>
                <h3 className="text-lg font-light text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">{event.title}</h3>
                <p className="text-sm text-slate-600 mb-4 flex-grow">{event.description}</p>

                <div className="space-y-2 mb-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-700" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <section className="mx-auto max-w-7xl px-6 sm:px-8 py-20 text-center">
          <h2 className="text-2xl font-light text-slate-900 mb-4">No events in this category</h2>
          <p className="text-slate-600 mb-8">Try selecting a different category or check back soon</p>
          <Button onClick={() => setSelectedCategory("All")} className="bg-emerald-700 hover:bg-emerald-800 text-white">
            View All Events
          </Button>
        </section>
      )}

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

// Clock icon component (not in lucide by default, using as placeholder)
const Clock = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default Events;
