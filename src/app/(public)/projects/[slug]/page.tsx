import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { getProjectPage, getStaticSlugs } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd, imageGalleryLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { RichText } from "@/components/public/rich-text";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getStaticSlugs("projects");
  return rows.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectPage(slug);
  return project
    ? metadataFromSeo(project.seo, `${project.title} — ${project.projectType} Stone Project`, project.description, `/projects/${slug}`, { image: project.coverImage })
    : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProjectPage(slug), getSeoSite()]);
  if (!project) notFound();
  const path = `/projects/${slug}`;
  const trail = [{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: project.title }];
  return (
    <>
      <PageHero eyebrow={`${project.projectType} / ${project.country}`} title={project.title} body={`${project.location}, ${project.year}`} image={project.coverImage} breadcrumbs={trail} />
      <section className="page-shell grid gap-12 py-section lg:grid-cols-[.8fr_1.2fr]">
        <aside className="grid content-start gap-4 text-sm uppercase tracking-[0.14em] text-muted">
          {project.client ? <p>Client: {project.client}</p> : null}<p>Location: {project.location}</p><p>Year: {project.year}</p>
        </aside>
        <div><RichText html={project.description} /><div className="mt-8 flex flex-wrap gap-2">{project.materialsUsed.map((item) => <Link key={item.id} href={`/materials/${item.categorySlug}/${item.slug}` as Route} className="border border-ivory/15 px-3 py-1 text-sm">{item.name}</Link>)}</div></div>
      </section>
      {project.gallery.length ? <section className="page-shell grid gap-4 pb-section md:grid-cols-2">{project.gallery.map((image) => <CloudinaryImage key={image.id} media={image} sizes="(min-width:768px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />)}</section> : null}
      <JsonLd data={[
        breadcrumbLd([{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: project.title, href: path }], site),
        ...(project.gallery.length ? [imageGalleryLd({ images: project.gallery, site, name: project.title })] : []),
      ]} />
    </>
  );
}
