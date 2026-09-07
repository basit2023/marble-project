import Link from "next/link";
import type { Route } from "next";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicProject, PublicSection } from "@/types/public-data";
export function ProjectsSection({ section, projects }: { section: PublicSection; projects: PublicProject[] }) {
  return <section className="py-section"><div className="page-shell"><Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /></Reveal>
    <div className="grid gap-5 md:grid-cols-2">{projects.map((project, index) => <Reveal key={project.id} className={index === 0 ? "md:col-span-2" : ""}><Link href={`/projects/${project.slug}` as Route} className="group relative block aspect-[16/10] overflow-hidden bg-charcoal">
      {project.coverImage && <CloudinaryImage media={project.coverImage} sizes={index === 0 ? "90vw" : "(max-width: 768px) 90vw, 45vw"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-ivory"><p className="editorial-label text-accent">{project.location}, {project.country}</p><h3 className="mt-2 font-heading text-3xl">{project.title}</h3>{project.materials.length > 0 && <p className="mt-2 text-sm text-ivory/60">{project.materials.join(" · ")}</p>}</div>
    </Link></Reveal>)}</div>
  </div></section>;
}
