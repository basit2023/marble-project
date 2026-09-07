import { notFound } from "next/navigation";
import { getCategoryPage, getStaticSlugs } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";
import { clusterKeywords } from "@/lib/seo/keywords";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { FilterableProductGrid } from "@/components/public/filterable-product-grid";
import { PublicInquiryForm } from "@/components/public/public-inquiry-form";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getStaticSlugs("categories");
  return rows.map((item) => ({ categorySlug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const data = await getCategoryPage(categorySlug);
  if (!data) return {};
  return metadataFromSeo(
    data.category.seo,
    `${data.category.name} in Pakistan — Price, Finishes & Applications`,
    data.category.shortDescription ?? data.category.description,
    `/materials/${categorySlug}`,
    { image: data.category.coverImage, keywords: clusterKeywords("materials") },
  );
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const [data, site] = await Promise.all([getCategoryPage(categorySlug), getSeoSite()]);
  if (!data) notFound();
  const trail = [{ label: "Home", href: "/" }, { label: "Materials", href: "/materials" }, { label: data.category.name }];
  return (
    <>
      <PageHero eyebrow="Material" title={data.category.name} body={data.category.description} image={data.category.coverImage} ctaLabel="Enquire about this material" ctaHref="#material-enquiry" breadcrumbs={trail} />
      <FilterableProductGrid products={data.products} />
      <section id="material-enquiry" className="page-shell pb-section">
        <div className="max-w-3xl border-t border-charcoal/10 pt-10">
          <h2 className="font-heading text-title">Ask for availability</h2>
          <PublicInquiryForm source="Contact Form" inquiryType="Quote" products={data.products} extraFields />
        </div>
      </section>
      <JsonLd data={[
        breadcrumbLd([{ label: "Home", href: "/" }, { label: "Materials", href: "/materials" }, { label: data.category.name, href: `/materials/${categorySlug}` }], site),
        itemListLd({ site, items: data.products.map((product) => ({ name: product.name, path: `/materials/${product.categorySlug}/${product.slug}` })) }),
      ]} />
    </>
  );
}
