import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { getCarouselImages, CarouselImage, getActionsMetrics } from "@/services/supabaseService";
import { getAllEvents, type Event } from "@/services/eventsService";
import { getCarouselImagesByLocation } from "@/services/carouselService";

interface Stats {
  totalActions: number;
  peopleImpacted: number;
  totalContribution: number;
}

const Home = () => {
  const [allCarouselImages, setAllCarouselImages] = useState<CarouselImage[]>([]);
  const [momentOfImpactImages, setMomentOfImpactImages] = useState<CarouselImage[]>([]);
  const [heroBackgroundImages, setHeroBackgroundImages] = useState<CarouselImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalActions: 0,
    peopleImpacted: 0,
    totalContribution: 0,
  });

  useEffect(() => {
    // Load carousel images by location from Supabase
    const loadImages = async () => {
      try {
        const momentImages = await getCarouselImagesByLocation("moments_of_impact");
        const heroImages = await getCarouselImagesByLocation("hero_background");

        setAllCarouselImages([...momentImages, ...heroImages]);
        setMomentOfImpactImages(momentImages);
        setHeroBackgroundImages(heroImages);
      } catch (error) {
        console.error("Error loading carousel images:", error);
      }
    };
    loadImages();

    // Load stats from Supabase
    const loadStats = async () => {
      try {
        const metrics = await getActionsMetrics();
        setStats({
          totalActions: metrics.totalAchievements,
          peopleImpacted: metrics.totalPeopleImpacted,
          totalContribution: metrics.totalContributed,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };
    loadStats();
  }, []);

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? momentOfImpactImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === momentOfImpactImages.length - 1 ? 0 : prev + 1
    );
  };

  const [allEvents, setAllEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const events = await getAllEvents();
      setAllEvents(events);
    };
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Dashboard Stats Section - Main Overview with Background */}
      <section className="relative overflow-hidden px-6 sm:px-8 py-16 sm:py-28">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {heroBackgroundImages.length > 0 ? (
            <>
              <img
                src={heroBackgroundImages[0].url}
                alt={heroBackgroundImages[0].title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/85" />
            </>
          ) : (
            <>
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F3a1a4e655da0467388df0f18259e3a68?format=webp&width=1200&height=600"
                alt="Community impact background"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/85" />
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900">SACBM's CSR Dashboard</h1>
            <p className="mt-4 text-base text-slate-600">Overview of SACBM's social impact and community initiatives</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-8 sm:p-10 text-center hover:shadow-md transition-shadow">
            <div className="text-5xl sm:text-6xl font-light text-emerald-700 mb-4">
              {stats.totalActions.toLocaleString()}
            </div>
            <p className="text-base text-slate-600 font-medium">Total Actions</p>
            <p className="text-xs text-slate-500 mt-2">Community initiatives and interventions</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-8 sm:p-10 text-center hover:shadow-md transition-shadow">
            <div className="text-5xl sm:text-6xl font-light text-emerald-700 mb-4">
              {stats.peopleImpacted.toLocaleString()}
            </div>
            <p className="text-base text-slate-600 font-medium">People Impact</p>
            <p className="text-xs text-slate-500 mt-2">Lives positively affected</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-8 sm:p-10 text-center hover:shadow-md transition-shadow">
            <div className="text-5xl sm:text-6xl font-light text-emerald-700 mb-4">
              {Math.round(stats.totalContribution / 1000000).toLocaleString()}M
            </div>
            <p className="text-base text-slate-600 font-medium">Total Contribution</p>
            <p className="text-xs text-slate-500 mt-2">MZN committed and deployed</p>
          </div>
          </div>
        </div>
      </section>

      {/* Requirements Requested Section */}
      {/* Upcoming Social Events Section */}
      <section className="max-w-full px-6 sm:px-8 py-12 sm:py-16 border-t border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">Upcoming Social Events</h2>
            <p className="mt-3 text-base text-slate-600">
              Join us for upcoming community and corporate social responsibility initiatives
            </p>
          </div>

        {allEvents.length > 0 ? (
          <>
            {/* Featured Events */}
            {allEvents.filter(e => e.featured).length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-light text-slate-900 mb-4">Featured Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {allEvents.filter(e => e.featured).map((event) => (
                    <div key={event.id} className="rounded-lg border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                      <div className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1">
                        <span className="text-xs font-medium text-emerald-700">{event.category}</span>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{event.title}</h3>
                      <p className="text-slate-600 text-sm mb-3">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <Calendar className="h-3 w-3 text-emerald-700" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <MapPin className="h-3 w-3 text-emerald-700" />
                        <span>{event.location}</span>
                      </div>
                      <Link to={`/event/${event.id}`} className="w-full">
                        <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm py-2">
                          Learn More
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Upcoming Events */}
            {allEvents.filter(e => !e.featured).length > 0 && (
              <div>
                <h3 className="text-2xl font-light text-slate-900 mb-6">Other Upcoming Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allEvents.filter(e => !e.featured).map((event) => (
                    <div key={event.id} className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
                      <div className="mb-4 inline-block rounded-full bg-slate-100 px-3 py-1">
                        <span className="text-xs font-medium text-slate-700">{event.category}</span>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{event.title}</h3>
                      <p className="text-slate-600 text-sm mb-4">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                        <Calendar className="h-4 w-4 text-emerald-700" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <MapPin className="h-4 w-4 text-emerald-700" />
                        <span>{event.location}</span>
                      </div>
                      <Link to={`/event/${event.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-lg text-slate-700 mb-4">Dear Members,</p>
            <p className="text-slate-600 mb-6">there are no upcoming events for the time being. We'll be announcing new initiatives soon.</p>
            <Link to="/events">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
        </div>
      </section>

      {/* Image Carousel Section (Placeholder for admin-uploaded images) */}
      <section className="max-w-full px-6 sm:px-8 py-20 sm:py-28 border-t border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900">Moments of Impact</h2>
            <p className="mt-4 text-base text-slate-600 max-w-2xl">
              Visual stories from our community initiatives
            </p>
          </div>

        {/* Carousel */}
        {momentOfImpactImages.length > 0 ? (
          <div className="relative rounded-lg overflow-hidden h-96 sm:h-[28rem]">
            {/* Current Image */}
            <img
              src={momentOfImpactImages[currentImageIndex].url}
              alt={momentOfImpactImages[currentImageIndex].title}
              className="w-full h-full object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <h3 className="text-2xl sm:text-3xl font-light mb-2">
                {momentOfImpactImages[currentImageIndex].title}
              </h3>
              <p className="text-sm sm:text-base text-slate-100">
                {momentOfImpactImages[currentImageIndex].description}
              </p>
            </div>

            {/* Navigation Buttons */}
            {momentOfImpactImages.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {momentOfImpactImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? "bg-white w-8" : "bg-white/50 w-2"
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 h-96 sm:h-[28rem] flex items-center justify-center border border-slate-300">
            <div className="text-center">
              <p className="text-slate-600 text-sm font-medium">Photo carousel - Admin uploads here</p>
              <p className="text-xs text-slate-500 mt-2">Featured community impact photos and initiatives</p>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="mx-auto max-w-4xl px-6 sm:px-8 py-20 sm:py-28 border-t border-slate-200">
        <div className="border border-slate-300 rounded-lg p-12 sm:p-16 bg-white">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900">Want to Partner with the Chamber?</h2>
          <p className="mt-6 text-base text-slate-600 max-w-2xl">
            Interested in becoming a member or partnering with us on social responsibility initiatives? We&apos;d love to hear from you.
          </p>
          <div className="mt-10">
            <a href="mailto:info@southafricanchamber.co.mz">
              <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default Home;
