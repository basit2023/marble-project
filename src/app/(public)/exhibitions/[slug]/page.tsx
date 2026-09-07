import { notFound } from "next/navigation";
import { getExhibitionPage, getStaticSlugs } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd, eventLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { RichText } from "@/components/public/rich-text";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getStaticSlugs("exhibitions");
  return rows.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getExhibitionPage(slug);
  return item
    ? metadataFromSeo(item.seo, `${item.name} — ${item.city} Stone Exhibition`, item.description, `/exhibitions/${slug}`, { image: item.coverImage })
    : {};
}

export default async function ExhibitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, site] = await Promise.all([getExhibitionPage(slug), getSeoSite()]);
  if (!item) notFound();
  const path = `/exhibitions/${slug}`;
  const trail = [{ label: "Home", href: "/" }, { label: "Exhibitions", href: "/exhibitions" }, { label: item.name }];
  return (
    <>
      <PageHero eyebrow={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`} title={item.name} body={`${item.venue}, ${item.city}, ${item.country}`} image={item.coverImage} breadcrumbs={trail} />
      <section className="page-shell py-section"><RichText html={item.description} /></section>
      {item.gallery.length ? <section className="page-shell grid gap-4 pb-section md:grid-cols-2">{item.gallery.map((image) => <CloudinaryImage key={image.id} media={image} sizes="(min-width:768px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />)}</section> : null}
      <JsonLd data={[
        breadcrumbLd([{ label: "Home", href: "/" }, { label: "Exhibitions", href: "/exhibitions" }, { label: item.name, href: path }], site),
        eventLd({ event: item, site, path }),
      ]} />
    </>
  );
}
