import { getAllMaterials } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { itemListLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { clusterKeywords } from "@/lib/seo/keywords";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { CardImage } from "@/components/public/card-image";

export const revalidate = 60;

export function generateMetadata() {
  return metadataFromSeo(undefined, "Marble & Natural Stone Materials in Pakistan", "Explore marble, granite, onyx, travertine and quartzite categories with prices, finishes and applications for projects and export from Pakistan.", "/materials", { keywords: clusterKeywords("materials") });
}

export default async function MaterialsPage() {
  const [categories, site] = await Promise.all([getAllMaterials(), getSeoSite()]);
  return (
    <>
      <PageHero title="Materials" body="Browse active natural stone categories, from Pakistani marble and onyx to granite, travertine, limestone and quartzite." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Materials" }]} />
      <section className="page-shell grid gap-8 py-section md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => <CardImage key={category.id} href={`/materials/${category.slug}`} title={category.name} meta={category.shortDescription} image={category.coverImage} />)}
      </section>
      <JsonLd data={[
        breadcrumbLd([{ label: "Home", href: "/" }, { label: "Materials", href: "/materials" }], site),
        itemListLd({ site, items: categories.map((category) => ({ name: category.name, path: `/materials/${category.slug}` })) }),
      ]} />
    </>
  );
}
