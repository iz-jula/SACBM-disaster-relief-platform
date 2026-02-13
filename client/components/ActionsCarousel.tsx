import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselImage {
  id: string;
  image: string;
  title: string;
  company: string;
}

interface ActionsCarouselProps {
  images: CarouselImage[];
}

export default function ActionsCarousel({ images }: ActionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Member Actions Gallery
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Recent contributions and initiatives from community members
        </p>
      </div>

      <div className="relative bg-slate-100">
        {/* Main Image */}
        <div className="aspect-video overflow-hidden bg-slate-900">
          <img
            src={currentImage.image}
            alt={currentImage.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 transition-all shadow-lg z-10"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 transition-all shadow-lg z-10"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Image Info */}
      <div className="p-4 sm:p-6">
        <h3 className="font-bold text-slate-900 text-lg">{currentImage.title}</h3>
        <p className="text-sm text-slate-600 mt-1">
          {currentImage.company}
        </p>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex
                    ? "ring-2 ring-primary shadow-lg"
                    : "opacity-60 hover:opacity-100"
                }`}
                aria-label={`Go to image ${index + 1}`}
              >
                <img
                  src={image.image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
