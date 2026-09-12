"use client";
import Link from "next/link";
import type { Route } from "next";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { SectionHeading } from "./section-heading";
import type { PublicProduct, PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
export function FeaturedProductsSection({ section, products, copy }: { section: PublicSection; products: PublicProduct[]; copy: PublicCopy }) {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * Math.min(track.current.clientWidth * .85, 620), behavior: "smooth" });
  return <section className="overflow-hidden py-section"><div className="page-shell"><div className="flex items-end justify-between gap-6"><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /><div className="mb-10 hidden gap-2 sm:flex"><button onClick={() => move(-1)} aria-label={copy.labels.previousProducts} className="grid size-11 place-items-center border border-ivory"><ChevronLeft /></button><button onClick={() => move(1)} aria-label={copy.labels.nextProducts} className="grid size-11 place-items-center border border-ivory"><ChevronRight /></button></div></div>
    <div ref={track} tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 focus-visible:outline-offset-[-2px]">
      {products.map((product) => <Link key={product.id} href={(product.categorySlug ? `/materials/${product.categorySlug}/${product.slug}` : `/materials`) as Route} className="group w-[82vw] max-w-md shrink-0 snap-start">
        <div className="aspect-[4/5] overflow-hidden bg-charcoal">{product.primaryImage && <CloudinaryImage media={product.primaryImage} sizes="(max-width: 640px) 82vw, 430px" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}</div>
        <p className="editorial-label mt-4 text-accent">{product.colourFamily}</p><h3 className="mt-1 font-heading text-3xl">{product.name}</h3>{product.origin && <p className="text-sm text-muted">{product.origin}</p>}
      </Link>)}
    </div>
  </div></section>;
}
