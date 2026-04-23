import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { getCarouselImages, CarouselImage } from "@/services/supabaseService";

const Home = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Load carousel images from Supabase
    const loadImages = async () => {
      try {
        const images = await getCarouselImages();
        setCarouselImages(images);
      } catch (error) {
        console.error("Error loading carousel images:", error);
      }
    };
    loadImages();
  }, []);

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F3a1a4e655da0467388df0f18259e3a68?format=webp&width=800&height=1200"
            alt="Community volunteers in action"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/45 to-slate-900/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-white">
            Making a Difference<br />
            <span className="text-yellow-300">
              Together
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed">
            This platform is dedicated to showcase how the South African Chamber of Business in Mozambique (SACBM), through its members, are creating meaningful social impact across Mozambique through disaster relief, humanitarian aid, and community support.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center sm:gap-6">
            <Link to="/gallery">
              <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 font-medium">
                Explore Our Impact
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-medium">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Image Carousel Section (Placeholder for admin-uploaded images) */}
      <section className="mx-auto max-w-7xl px-6 sm:px-8 py-20 sm:py-28">
        <div className="mb-16">
          <h2 className="text-5xl sm:text-6xl font-light tracking-tight text-slate-900">Moments of Impact</h2>
          <p className="mt-4 text-base text-slate-600 max-w-2xl">
            Visual stories from our community initiatives
          </p>
        </div>

        {/* Carousel */}
        {carouselImages.length > 0 ? (
          <div className="relative rounded-lg overflow-hidden h-96 sm:h-[28rem]">
            {/* Current Image */}
            <img
              src={carouselImages[currentImageIndex].url}
              alt={carouselImages[currentImageIndex].title}
              className="w-full h-full object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <h3 className="text-2xl sm:text-3xl font-light mb-2">
                {carouselImages[currentImageIndex].title}
              </h3>
              <p className="text-sm sm:text-base text-slate-100">
                {carouselImages[currentImageIndex].description}
              </p>
            </div>

            {/* Navigation Buttons */}
            {carouselImages.length > 1 && (
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
                  {carouselImages.map((_, idx) => (
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
      </section>

      {/* Contact CTA Section */}
      <section className="mx-auto max-w-4xl px-6 sm:px-8 py-20 sm:py-28">
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
