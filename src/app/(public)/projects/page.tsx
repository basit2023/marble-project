import { getProjectsPage } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";
import { clusterKeywords } from "@/lib/seo/keywords";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { FilterableProjectGrid } from "@/components/public/filterable-project-grid";

export const revalidate = 60;

export function generateMetadata() {
  return metadataFromSeo(undefined, "Natural Stone Projects & Case Studies", "Residential, commercial, hospitality and export marble and natural stone projects delivered from Pakistan.", "/projects", { keywords: clusterKeywords("projects") });
}

export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([getProjectsPage(), getSeoSite()]);
  return (
    <>
      <PageHero title="Projects" body="A portfolio of residential, commercial, hospitality and export stone work." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]} />
      <FilterableProjectGrid projects={projects} />
      <JsonLd data={[
        breadcrumbLd([{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }], site),
        itemListLd({ site, items: projects.map((project) => ({ name: project.title, path: `/projects/${project.slug}` })) }),
      ]} />
    </>
  );
}
