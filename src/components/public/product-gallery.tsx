"use client";

import { useState } from "react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { MediaDTO } from "@/lib/media/contracts";

export function ProductGallery({ images, title }: { images: MediaDTO[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  if (!current) return <div className="aspect-square bg-white/10" aria-label={`${title} image placeholder`} />;
  return (
    <div>
      <div className="group aspect-square overflow-hidden bg-white/10">
        <CloudinaryImage media={current} sizes="(min-width:1024px) 50vw, 100vw" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      </div>
      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button key={image.id} type="button" onClick={() => setActive(index)} className={`aspect-square overflow-hidden border ${index === active ? "border-accent" : "border-transparent"}`} aria-label={`Show image ${index + 1} for ${title}`}>
              <CloudinaryImage media={image} sizes="120px" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
