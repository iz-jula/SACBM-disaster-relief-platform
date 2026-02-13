import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ActionImage {
  id: string;
  image: string;
  title: string;
  company: string;
}

interface ActionsCarouselProps {
  images: ActionImage[];
}

export default function ActionsCarousel({ images }: ActionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ActionImage | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[currentIndex];

  return (
    <>
      {/* Carousel */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Member Actions Gallery
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Visual highlights from recent community contributions
              </p>
            </div>
            {images.length > 0 && (
              <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        <div className="relative bg-slate-900 aspect-video overflow-hidden">
          {/* Main Image */}
          <img
            src={currentImage.image}
            alt={currentImage.title}
            className="w-full h-full object-cover"
            onClick={() => setSelectedImage(currentImage)}
            style={{ cursor: "pointer" }}
          />

          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
            <p className="text-white font-bold text-sm sm:text-base">{currentImage.title}</p>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">{currentImage.company}</p>
          </div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                title="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                title="Next image"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-white w-3 h-3"
                        : "bg-white/50 hover:bg-white/70 w-2 h-2"
                    }`}
                    title={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 overflow-x-auto">
            <div className="flex gap-3">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? "border-primary shadow-md"
                      : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-bold text-white text-lg">{selectedImage.title}</h3>
              <p className="text-slate-300 text-sm mt-1">{selectedImage.company}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
