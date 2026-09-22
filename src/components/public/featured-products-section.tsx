"use client";
import Link from "next/link";
import type { Route } from "next";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, Tag } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { PublicProduct, PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";

export function FeaturedProductsSection({ section, products, copy }: { section: PublicSection; products: PublicProduct[]; copy: PublicCopy }) {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * Math.min(track.current.clientWidth * 0.85, 620), behavior: "smooth" });

  return (
    <section className="relative bg-[#090909] py-24 text-ivory stone-vein border-b border-white/10 overflow-hidden">
      <div className="page-shell">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="gold-rule" aria-hidden="true" />
              <p className="editorial-label text-accent">{section.eyebrowLabel ?? "Featured Collection"}</p>
            </div>
            <h2 className="mt-3 font-heading text-title uppercase text-white">
              {section.heading ?? "Marbella Stone Products"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => move(-1)} aria-label={copy.labels.previousProducts} className="grid size-11 place-items-center border border-white/20 bg-black/40 text-white transition hover:border-accent hover:text-accent"><ChevronLeft className="size-5" /></button>
            <button onClick={() => move(1)} aria-label={copy.labels.nextProducts} className="grid size-11 place-items-center border border-white/20 bg-black/40 text-white transition hover:border-accent hover:text-accent"><ChevronRight className="size-5" /></button>
          </div>
        </div>

        <div
          ref={track}
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 scrollbar-none focus-visible:outline-none"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={(product.categorySlug ? `/materials/${product.categorySlug}/${product.slug}` : `/materials`) as Route}
              className="group relative w-[82vw] max-w-sm shrink-0 snap-start rounded-sm border border-white/15 bg-panel p-2.5 shadow-2xl stone-panel-hover"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900 rounded-xs">
                {product.primaryImage ? (
                  <CloudinaryImage
                    media={product.primaryImage}
                    sizes="(max-width: 640px) 82vw, 360px"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-ivory/30">
                    {product.name}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {product.colourFamily && (
                  <span className="absolute left-4 top-4 rounded bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent border border-white/10 backdrop-blur">
                    {product.colourFamily}
                  </span>
                )}

                {product.priceFormatted && (
                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal shadow-md">
                    <Tag className="size-3" />
                    {product.priceFormatted}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <ArrowUpRight className="size-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {product.origin && (
                  <p className="text-xs text-ivory/60">
                    Origin: <span className="text-ivory/90 font-medium">{product.origin}</span>
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

