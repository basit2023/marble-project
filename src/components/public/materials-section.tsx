import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicCategory, PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
export function MaterialsSection({ section, categories, copy }: { section: PublicSection; categories: PublicCategory[]; copy: PublicCopy }) {
  return <section className="py-section"><div className="page-shell"><Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /></Reveal>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Reveal key={category.id}><Link href={`/materials/${category.slug}` as Route} className="group relative block aspect-[4/5] overflow-hidden bg-charcoal">
      {category.coverImage && <CloudinaryImage media={category.coverImage} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-ivory"><div><h3 className="font-heading text-3xl">{category.name}</h3>{category.shortDescription && <p className="mt-2 text-sm text-ivory/65">{category.shortDescription}</p>}</div><ArrowUpRight className="size-6 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" /></div>
    </Link></Reveal>)}</div>
    {section.ctaLabel && section.ctaUrl && <Link href={section.ctaUrl as Route} className="mt-8 inline-flex min-h-11 items-center border-b border-accent">{section.ctaLabel || copy.labels.viewAllMaterials}</Link>}
  </div></section>;
}
