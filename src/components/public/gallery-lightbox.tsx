"use client";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { MediaDTO } from "@/lib/media/contracts";
import type { PublicCopy } from "@/lib/public/copy-schema";

export default function GalleryLightbox({ images, index, setIndex, copy }: {
  images: MediaDTO[]; index: number; setIndex: (value: number | null) => void; copy: PublicCopy;
}) {
  const touch = useRef<number | null>(null);
  const move = useCallback((amount: number) => setIndex((index + amount + images.length) % images.length), [index, images.length, setIndex]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    addEventListener("keydown", key);
    document.documentElement.style.overflow = "hidden";
    return () => { removeEventListener("keydown", key); document.documentElement.style.overflow = ""; };
  }, [move, setIndex]);

  useEffect(() => {
    for (const offset of [-1, 1]) {
      const item = images[(index + offset + images.length) % images.length];
      if (item) { const preload = new Image(); preload.src = item.secureUrl; }
    }
  }, [index, images]);

  const current = images[index];
  if (!current) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={copy.labels.galleryImage} className="fixed inset-0 z-[70] grid place-items-center bg-black/95 p-4"
      onTouchStart={(event) => { touch.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX; if (touch.current !== null && end !== undefined && Math.abs(end - touch.current) > 50) move(end < touch.current ? 1 : -1); }}>
      <button autoFocus onClick={() => setIndex(null)} aria-label={copy.labels.closeLightbox} className="absolute right-4 top-4 grid size-12 place-items-center text-white"><X /></button>
      <button onClick={() => move(-1)} aria-label={copy.labels.previousImage} className="absolute left-2 grid size-12 place-items-center text-white md:left-8"><ChevronLeft /></button>
      <CloudinaryImage media={current} sizes="95vw" priority className="max-h-[88vh] w-auto max-w-[88vw] object-contain" />
      <button onClick={() => move(1)} aria-label={copy.labels.nextImage} className="absolute right-2 grid size-12 place-items-center text-white md:right-8"><ChevronRight /></button>
    </div>
  );
}
