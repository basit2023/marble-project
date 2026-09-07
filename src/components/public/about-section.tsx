import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicSection } from "@/types/public-data";
export function AboutSection({ section }: { section: PublicSection }) {
  const images = [section.backgroundImage, ...section.items.map((item) => item.image)].filter((item) => item !== undefined);
  return <section className="bg-white py-section"><div className="page-shell grid items-center gap-12 lg:grid-cols-2">
    <Reveal className="grid grid-cols-2 gap-4">{images.slice(0, 3).map((image, index) => <div key={image.cloudinaryPublicId} className={index === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}><CloudinaryImage media={image} sizes="(max-width: 1024px) 90vw, 45vw" className="h-full w-full object-cover" /></div>)}</Reveal>
    <Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} />{section.bodyText && <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: section.bodyText }} />}{section.ctaLabel && section.ctaUrl && <a href={section.ctaUrl} className="mt-8 inline-flex min-h-11 items-center border-b border-accent">{section.ctaLabel}</a>}</Reveal>
  </div></section>;
}
