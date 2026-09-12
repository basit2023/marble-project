import Link from "next/link";
import type { Route } from "next";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { SectionHeading } from "./section-heading";
import type { PublicExhibition, PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
import { formatDate } from "@/lib/utils";
export function ExhibitionsSection({ section, exhibitions, copy }: { section: PublicSection; exhibitions: PublicExhibition[]; copy: PublicCopy }) {
  const now = Date.now();
  return <section className="py-section"><div className="page-shell"><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} />
    <div className="flex snap-x gap-5 overflow-x-auto pb-4">{exhibitions.map((event) => { const upcoming = new Date(event.startDate).getTime() > now; return <Link key={event.id} href={`/exhibitions/${event.slug}` as Route} className="w-[78vw] max-w-sm shrink-0 snap-start border border-white/10 bg-white/5">
      <div className="aspect-[16/10] overflow-hidden bg-charcoal">{event.coverImage && <CloudinaryImage media={event.coverImage} sizes="380px" className="h-full w-full object-cover" />}</div>
      <div className="p-5"><p className="editorial-label text-accent">{upcoming ? copy.labels.upcoming : copy.labels.past}</p><h3 className="mt-2 font-heading text-2xl">{event.name}</h3><p className="mt-3 text-sm text-muted">{event.venue} · {event.city}, {event.country}</p><p className="mt-2 text-sm">{formatDate(event.startDate)}</p></div>
    </Link>; })}</div>
  </div></section>;
}
