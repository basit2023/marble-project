import { getExhibitionsPage } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { CardImage } from "@/components/public/card-image";
import { formatDate } from "@/lib/utils";
import type { ExhibitionDTO } from "@/types/public-pages";

export const revalidate = 60;

export function generateMetadata() {
  return metadataFromSeo(undefined, "Stone Exhibitions & Trade Shows", "Meet our team at upcoming marble and natural stone exhibitions and browse our recent trade-show history.", "/exhibitions");
}

export default async function ExhibitionsPage() {
  const [exhibitions, site] = await Promise.all([getExhibitionsPage(), getSeoSite()]);
  const upcoming = exhibitions.filter((item) => new Date(item.startDate).getTime() >= Date.now());
  const past = exhibitions.filter((item) => new Date(item.startDate).getTime() < Date.now()).reverse();
  return (
    <>
      <PageHero title="Exhibitions" body="Meet the team at upcoming shows and browse our recent exhibition history." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Exhibitions" }]} />
      <JsonLd data={breadcrumbLd([{ label: "Home", href: "/" }, { label: "Exhibitions", href: "/exhibitions" }], site)} />
      <section className="page-shell grid gap-12 py-section">
        {([["Upcoming", upcoming], ["Past", past]] satisfies Array<[string, ExhibitionDTO[]]>).map(([label, items]) => (
          <div key={label}>
            <h2 className="font-heading text-title">{label}</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => <CardImage key={item.id} href={`/exhibitions/${item.slug}`} title={item.name} meta={`${item.city}, ${item.country} / ${formatDate(item.startDate)}`} image={item.coverImage} />)}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
