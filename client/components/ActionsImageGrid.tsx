import { useState } from "react";
import { X } from "lucide-react";

interface ActionImage {
  id: string;
  image: string;
  title: string;
  company: string;
}

interface ActionsImageGridProps {
  images: ActionImage[];
}

export default function ActionsImageGrid({ images }: ActionsImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ActionImage | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Image Grid */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Member Actions Gallery
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Visual highlights from recent community contributions
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {images.map((action) => (
              <button
                key={action.id}
                onClick={() => setSelectedImage(action)}
                className="group relative aspect-video rounded-lg overflow-hidden bg-slate-100 hover:shadow-lg transition-all"
              >
                <img
                  src={action.image}
                  alt={action.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm font-medium">View</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Click an image to view details
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video overflow-hidden bg-slate-900">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="font-bold text-slate-900 text-lg">
                {selectedImage.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                {selectedImage.company}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
