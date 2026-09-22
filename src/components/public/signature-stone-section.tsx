"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { PublicSection } from "@/types/public-data";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { MediaDTO } from "@/lib/media/contracts";

export function SignatureStoneSection({
  section,
  media,
}: {
  section?: PublicSection;
  media?: MediaDTO[];
}) {
  const primaryMedia = media?.[0] ?? section?.backgroundImage;

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] py-24 text-ivory stone-vein border-y border-white/10">
      <div className="page-shell">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column - Copy & Value Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="gold-rule" aria-hidden="true" />
              <p className="editorial-label text-accent">
                {section?.eyebrowLabel ?? "Master Craftsmanship"}
              </p>
            </div>

            <h2 className="font-heading text-title uppercase text-white leading-tight">
              {section?.heading ?? "Marble Countertops & Architectural Cladding"}
            </h2>

            <p className="text-base leading-relaxed text-ivory/70 max-w-xl">
              {section?.subheading ??
                "Elevate luxury residences and commercial projects with precision-cut Pakistani marble, granite, and translucent onyx slabs. Custom finished for kitchen countertops, vanity tops, and bookmatched wall panels."}
            </p>

            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              <li className="flex items-center gap-3 text-sm text-ivory/85">
                <CheckCircle2 className="size-5 shrink-0 text-accent" />
                <span>Custom Slab Edge Profiling</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-ivory/85">
                <CheckCircle2 className="size-5 shrink-0 text-accent" />
                <span>Bookmatched Vein Alignment</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-ivory/85">
                <CheckCircle2 className="size-5 shrink-0 text-accent" />
                <span>High-Polish Water Repellent Coating</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-ivory/85">
                <CheckCircle2 className="size-5 shrink-0 text-accent" />
                <span>Worldwide Container Crate Freight</span>
              </li>
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href={"/quote" as Route}
                className="inline-flex min-h-12 items-center gap-2 bg-accent px-7 text-xs font-bold uppercase tracking-[0.14em] text-charcoal transition-all hover:bg-gold-soft shadow-lg shadow-accent/20"
              >
                <span>Request Custom Cutting</span>
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href={"/materials" as Route}
                className="inline-flex min-h-12 items-center gap-2 border border-white/20 bg-white/5 px-7 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-accent hover:text-accent"
              >
                <span>View All Collections</span>
              </Link>
            </div>
          </div>

          {/* Right Column - Visual Showcase Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-sm border border-white/15 bg-panel p-3 shadow-2xl stone-panel">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                {primaryMedia ? (
                  <CloudinaryImage
                    media={primaryMedia}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-ivory/40">
                    Natural Marble Display
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="rounded bg-accent/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal font-semibold">
                      Premium Grade
                    </span>
                    <h3 className="mt-2 font-heading text-xl text-white">
                      Bookmatched Ziarat White
                    </h3>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                    18mm & 20mm Slabs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
