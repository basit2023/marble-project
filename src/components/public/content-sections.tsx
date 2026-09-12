import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { RichText } from "@/components/public/rich-text";
import type { PageSectionDTO } from "@/types/public-pages";

export function ContentSections({ sections }: { sections: PageSectionDTO[] }) {
  if (!sections.length) return null;
  return (
    <div className="page-shell grid gap-12 py-section">
      {sections.map((section, index) => (
        <section key={`${section.key}-${index}`} className="grid gap-8 border-t border-ivory/10 pt-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="editorial-label text-accent">{section.key}</p>
            {section.title ? <h2 className="mt-4 font-heading text-title">{section.title}</h2> : null}
            {section.image ? <CloudinaryImage media={section.image} sizes="(min-width:1024px) 32vw, 100vw" className="mt-8 aspect-[4/3] w-full object-cover" /> : null}
          </div>
          <div className="self-end">
            {section.body ? <RichText html={section.body} /> : null}
            {section.items.length ? (
              <ul className="mt-8 grid gap-3 text-muted sm:grid-cols-2">
                {section.items.map((item) => <li key={item} className="border-l border-accent pl-4">{item}</li>)}
              </ul>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
