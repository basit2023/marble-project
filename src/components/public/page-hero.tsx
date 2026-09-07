import Link from "next/link";
import type { Route } from "next";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import type { MediaDTO } from "@/lib/media/contracts";
import type { BreadcrumbItem } from "@/types/seo";

export function PageHero({ eyebrow, title, body, image, ctaLabel, ctaHref, breadcrumbs }: {
  eyebrow?: string; title: string; body?: string; image?: MediaDTO; ctaLabel?: string; ctaHref?: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <section className="relative min-h-[58vh] overflow-hidden bg-charcoal text-ivory">
      {image ? (
        <CloudinaryImage media={image} priority sizes="100vw" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      ) : <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(128,99,58,.35),transparent_34%),linear-gradient(135deg,#20201e,#111)]" />}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/20" />
      <div className="page-shell relative flex min-h-[58vh] flex-col justify-end pb-16 pt-32">
        {breadcrumbs && breadcrumbs.length > 1 ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-ivory/60">
              {breadcrumbs.map((item, index) => (
                <li key={item.label} className="flex items-center gap-2">
                  {item.href && index < breadcrumbs.length - 1 ? (
                    <Link href={item.href as Route} className="hover:text-ivory">{item.label}</Link>
                  ) : (
                    <span aria-current="page" className="text-ivory/85">{item.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 ? <span aria-hidden="true">/</span> : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {eyebrow ? <p className="editorial-label mb-5 text-ivory/75">{eyebrow}</p> : null}
        <h1 className="max-w-5xl font-heading text-display">{title}</h1>
        {body ? <p className="mt-6 max-w-2xl text-body leading-8 text-ivory/80">{body}</p> : null}
        {ctaLabel && ctaHref ? (
          <Link href={ctaHref as Route} className="mt-8 inline-flex w-fit items-center border border-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-accent">
            {ctaLabel}
          </Link>
        ) : null}
      </div>
      {breadcrumbs ? <BreadcrumbJsonLd items={breadcrumbs} /> : null}
    </section>
  );
}
