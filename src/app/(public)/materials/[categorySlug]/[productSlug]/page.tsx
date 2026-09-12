import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { getProductPage, getStaticSlugs } from "@/lib/public/pages-data";
import { getPublicLayoutData } from "@/lib/public/data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { productLd, breadcrumbLd, imageGalleryLd } from "@/lib/seo/jsonld";
import { clusterKeywords } from "@/lib/seo/keywords";
import { JsonLd } from "@/components/seo/json-ld";
import { buildWhatsAppLink } from "@/lib/utils";
import { PageHero } from "@/components/public/page-hero";
import { ProductGallery } from "@/components/public/product-gallery";
import { PublicInquiryForm } from "@/components/public/public-inquiry-form";
import { CardImage } from "@/components/public/card-image";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getStaticSlugs("products");
  const products = rows as Array<{ slug: string; category?: { slug: string } | null }>;
  return products.filter((item) => item.category).map((item) => ({ categorySlug: String(item.category?.slug), productSlug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string; productSlug: string }> }) {
  const { categorySlug, productSlug } = await params;
  const data = await getProductPage(categorySlug, productSlug);
  if (!data) return {};
  return metadataFromSeo(
    data.product.seo,
    `${data.product.name} — ${data.product.categoryName} from Pakistan`,
    data.product.description,
    `/materials/${categorySlug}/${productSlug}`,
    { image: data.product.primaryImage ?? data.product.images[0], keywords: clusterKeywords("products") },
  );
}

export default async function ProductPage({ params }: { params: Promise<{ categorySlug: string; productSlug: string }> }) {
  const { categorySlug, productSlug } = await params;
  const [data, layout, site] = await Promise.all([getProductPage(categorySlug, productSlug), getPublicLayoutData(), getSeoSite()]);
  if (!data) notFound();
  const path = `/materials/${categorySlug}/${productSlug}`;
  const trail = [
    { label: "Home", href: "/" },
    { label: "Materials", href: "/materials" },
    { label: data.product.categoryName, href: `/materials/${categorySlug}` },
    { label: data.product.name },
  ];
  const images = data.product.images.length ? data.product.images : data.product.primaryImage ? [data.product.primaryImage] : [];
  const whatsapp = layout?.settings.whatsappNumber ? buildWhatsAppLink(`I would like a quote for ${data.product.name}.`, layout.settings.whatsappNumber) : undefined;
  const specs = Object.entries(data.product.technicalSpecs ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== "");
  return (
    <>
      <PageHero eyebrow={data.product.categoryName} title={data.product.name} body={data.product.origin ? `Origin: ${data.product.origin}` : data.product.description} image={data.product.primaryImage} breadcrumbs={trail} />
      <section className="page-shell grid gap-12 py-section lg:grid-cols-2">
        <ProductGallery images={images} title={data.product.name} />
        <div>
          <p className="editorial-label text-accent">{data.product.colourFamily} / {data.product.stockStatus}</p>
          <div className="prose mt-6 max-w-none"><p>{data.product.description}</p></div>
          {data.product.isPriceVisible && data.product.priceRange ? <p className="mt-6 text-xl">{data.product.priceRange.currency} {data.product.priceRange.min}-{data.product.priceRange.max} / {data.product.priceRange.unit}</p> : null}
          <div className="mt-8 grid gap-5">
            {[["Finishes", data.product.finishes], ["Formats", data.product.availableFormats], ["Applications", data.product.applications], ["Thickness", data.product.thicknessOptions], ["Sizes", data.product.sizeOptions]].map(([label, values]) => (
              <div key={String(label)}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">{label}</h2>
                <div className="mt-3 flex flex-wrap gap-2">{(values as string[]).map((value) => <span key={value} className="border border-ivory/15 px-3 py-1 text-sm">{value}</span>)}</div>
              </div>
            ))}
          </div>
          {specs.length ? (
            <table className="mt-8 w-full border-collapse text-left text-sm">
              <tbody>{specs.map(([key, value]) => <tr key={key} className="border-t border-ivory/10"><th className="py-3 font-semibold capitalize">{key.replace(/[A-Z]/g, " $&")}</th><td className="py-3 text-muted">{String(value)}</td></tr>)}</tbody>
            </table>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={"#request-quote" as Route} className="bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-charcoal">Request a quote</Link>
            {whatsapp ? <a href={whatsapp} className="border border-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">WhatsApp</a> : null}
          </div>
        </div>
      </section>
      <section id="request-quote" className="page-shell pb-section"><div className="max-w-3xl border-t border-ivory/10 pt-10"><h2 className="font-heading text-title">Request a Quote</h2><PublicInquiryForm source="Product Page" inquiryType="Quote" product={data.product} extraFields /></div></section>
      {data.related.length ? <section className="page-shell grid gap-8 pb-section md:grid-cols-2 xl:grid-cols-4"><h2 className="font-heading text-title md:col-span-2 xl:col-span-4">Related stones</h2>{data.related.map((item) => <CardImage key={item.id} href={`/materials/${item.categorySlug}/${item.slug}`} title={item.name} meta={item.colourFamily} image={item.primaryImage} />)}</section> : null}
      <JsonLd data={[
        breadcrumbLd(trail.map((crumb, index) => index === trail.length - 1 ? { label: crumb.label, href: path } : crumb), site),
        productLd({ product: data.product, site, path }),
        ...(images.length ? [imageGalleryLd({ images, site, name: data.product.name })] : []),
      ]} />
    </>
  );
}
