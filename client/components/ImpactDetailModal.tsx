import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpactDetailModalProps {
  impact: any;
  onClose: () => void;
}

const ImpactDetailModal = ({ impact, onClose }: ImpactDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Parse media - could be string or array
  let images: string[] = [];
  if (Array.isArray(impact.media)) {
    images = impact.media;
  } else if (typeof impact.media === "string") {
    try {
      images = JSON.parse(impact.media);
    } catch {
      images = impact.media ? [impact.media] : [];
    }
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 sm:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-900">
              {impact.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{impact.company_name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Image Gallery - Takes up more space */}
          <div className="lg:col-span-3">
            {images.length > 0 ? (
              <div className="space-y-6">
                {/* Main Image */}
                <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${impact.title} - Image ${currentImageIndex + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                {images.length > 1 && (
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={goToPrevious}
                      className="rounded-full border border-slate-300 p-2.5 hover:bg-slate-100 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>

                    {/* Thumbnail Strip */}
                    <div className="flex flex-1 gap-2 overflow-x-auto pb-2">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-slate-900 opacity-100"
                              : "border-slate-200 opacity-50 hover:opacity-75"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={goToNext}
                      className="rounded-full border border-slate-300 p-2.5 hover:bg-slate-100 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <p className="text-slate-500 text-sm">No images available</p>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Category */}
            {impact.category && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Category
                </p>
                <p className="text-sm font-medium text-slate-900 bg-slate-100 w-fit px-3 py-1.5 rounded">
                  {impact.category}
                </p>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-8">
              {impact.people_impacted && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    People Impacted
                  </p>
                  <p className="text-3xl font-light text-slate-900">
                    {impact.people_impacted.toLocaleString()}
                  </p>
                </div>
              )}

              {impact.amount && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Contribution
                  </p>
                  <p className="text-3xl font-light text-slate-900">
                    {(impact.amount / 1000).toFixed(0)}K MZN
                  </p>
                </div>
              )}
            </div>

            {/* Location & Date */}
            <div className="space-y-4">
              {impact.location && (
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Location
                    </p>
                    <p className="text-sm text-slate-700">{impact.location}</p>
                  </div>
                </div>
              )}

              {impact.created_at && (
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Date
                    </p>
                    <p className="text-sm text-slate-700">
                      {new Date(impact.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Partner */}
            {impact.partner_organisation && (
              <div className="border-t border-slate-200 pt-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Partner Organization
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {impact.partner_organisation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-16 border-t border-slate-200 pt-12 max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Description
          </h2>
          <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
            {impact.description}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 flex justify-between items-center">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            Back to Impact
          </Button>
          <p className="text-xs text-slate-500">Close or scroll</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactDetailModal;
