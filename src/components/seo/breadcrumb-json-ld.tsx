import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { serializeJsonLd } from "@/lib/seo";
import type { BreadcrumbItem } from "@/types/seo";

/** BreadcrumbList structured data for deep pages. Render alongside a visual trail. */
export async function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (items.length < 2) return null;
  const site = await getSeoSite();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd(items, site)) }}
    />
  );
}
