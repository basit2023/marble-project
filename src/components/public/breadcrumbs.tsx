import Link from "next/link";
import type { Route } from "next";
import type { PublicCopy } from "@/lib/public/copy-schema";
import { serializeJsonLd } from "@/lib/seo";
export function Breadcrumbs({ items, copy, siteUrl }: { items: Array<{ label: string; href?: string }>; copy: PublicCopy; siteUrl: string }) {
  const json = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({
    "@type": "ListItem", position: index + 1, name: item.label, ...(item.href ? { item: new URL(item.href, siteUrl).toString() } : {}),
  })) };
  return <><nav aria-label={copy.labels.breadcrumb}><ol className="flex flex-wrap gap-2 text-sm">{items.map((item, index) => <li key={item.label}>{item.href ? <Link href={item.href as Route}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}{index < items.length - 1 && <span aria-hidden="true" className="ml-2">/</span>}</li>)}</ol></nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(json) }} /></>;
}
