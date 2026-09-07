"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { SectionHeading } from "./section-heading";
import type { MediaDTO } from "@/lib/media/contracts";
import type { PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";

const GalleryLightbox = dynamic(() => import("./gallery-lightbox"), { ssr: false });

export function GallerySection({ section, images, copy }: { section: PublicSection; images: MediaDTO[]; copy: PublicCopy }) {
  const [index, setIndex] = useState<number | null>(null);
  return <section className="bg-charcoal py-section text-ivory"><div className="page-shell"><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} />
    <ul className="columns-2 gap-3 md:columns-3 lg:columns-4">{images.map((image, imageIndex) => <li key={image.id} className="mb-3">
      <button type="button" onClick={() => setIndex(imageIndex)} aria-label={`${copy.labels.galleryImage} ${imageIndex + 1}`} aria-haspopup="dialog" className="block w-full overflow-hidden">
        <CloudinaryImage media={image} sizes="(max-width: 768px) 50vw, 25vw" className="h-auto w-full transition duration-700 hover:scale-105" />
      </button></li>)}</ul>
  </div>
  {index !== null && <GalleryLightbox images={images} index={index} setIndex={setIndex} copy={copy} />}
  </section>;
}
