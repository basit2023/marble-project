import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { Reveal } from "./reveal";
import type { PublicCategory, PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";

export function MaterialsSection({ section, categories, copy }: { section: PublicSection; categories: PublicCategory[]; copy: PublicCopy }) {
  return (
    <section className="border-y border-white/10 bg-[#0b0b0b] py-24 text-ivory stone-vein">
      <div className="page-shell">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12">
            <div>
              <div className="flex items-center gap-3">
                <span className="gold-rule" aria-hidden="true" />
                <p className="editorial-label text-accent">{section.eyebrowLabel ?? "Curated Stone Collection"}</p>
              </div>
              <h2 className="mt-3 font-heading text-title uppercase text-white">
                {section.heading ?? "Browse By Material"}
              </h2>
            </div>
            {section.ctaLabel && section.ctaUrl && (
              <Link
                href={section.ctaUrl as Route}
                className="inline-flex min-h-11 items-center gap-2 border border-accent/60 bg-accent/5 px-6 text-xs font-bold uppercase tracking-[0.14em] text-accent transition-all hover:bg-accent hover:text-charcoal hover:shadow-lg shadow-accent/20"
              >
                <span>{section.ctaLabel || copy.labels.viewAllMaterials}</span>
                <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.id}>
              <Link
                href={`/materials/${category.slug}` as Route}
                className="group relative block aspect-[4/5] overflow-hidden rounded-sm border border-white/15 bg-panel p-2 shadow-2xl stone-panel-hover"
              >
                <div className="relative h-full w-full overflow-hidden">
                  {category.coverImage ? (
                    <CloudinaryImage
                      media={category.coverImage}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-ivory/30">
                      {category.name}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10 transition-opacity duration-300 group-hover:opacity-90" />

                  <div className="absolute left-6 top-6 flex items-center gap-2">
                    <span className="rounded bg-black/60 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-accent border border-white/15 backdrop-blur-md">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                    <div>
                      <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-white group-hover:text-accent transition-colors">
                        {category.name}
                      </h3>
                      {category.shortDescription && (
                        <p className="mt-2 text-xs leading-relaxed text-ivory/70 line-clamp-2">
                          {category.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-black/40 text-accent transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-charcoal group-hover:scale-110">
                      <ArrowUpRight className="size-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

