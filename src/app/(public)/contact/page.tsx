import { notFound } from "next/navigation";
import { getContentPage, getContactSettings } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { clusterKeywords } from "@/lib/seo/keywords";
import { StaticPageView } from "@/components/public/static-page-view";
import { PublicInquiryForm } from "@/components/public/public-inquiry-form";
import { MapEmbed } from "@/components/public/map-embed";

export const revalidate = 60;

export async function generateMetadata() {
  const page = await getContentPage("contact");
  return page
    ? metadataFromSeo(page.seo, `${page.title} — Marble Supplier in Pakistan`, page.excerpt ?? page.title, "/contact", { keywords: clusterKeywords("contact") })
    : {};
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getContentPage("contact"), getContactSettings()]);
  if (!page || !settings) notFound();
  return (
    <StaticPageView page={page} breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}>
      <section className="page-shell grid gap-12 pb-section lg:grid-cols-[.8fr_1.2fr]">
        <aside className="grid content-start gap-8">
          <div><h2 className="font-heading text-4xl">Phone</h2>{settings.phone.map((phone) => <p key={phone} className="mt-2 text-muted">{phone}</p>)}</div>
          <div><h2 className="font-heading text-4xl">Email</h2>{settings.email.map((email) => <p key={email} className="mt-2 text-muted">{email}</p>)}</div>
          {settings.businessHours ? <div><h2 className="font-heading text-4xl">Hours</h2><p className="mt-2 text-muted">{settings.businessHours}</p></div> : null}
          {settings.addresses.map((address) => (
            <div key={`${address.label}-${address.line1}`}><h2 className="font-heading text-4xl">{address.label}</h2><p className="mt-2 text-muted">{address.line1}, {address.city}, {address.country}</p>{address.mapUrl ? <MapEmbed src={address.mapUrl} title={`${address.label} map`} /> : null}</div>
          ))}
        </aside>
        <div><h2 className="font-heading text-title">Contact form</h2><PublicInquiryForm source="Contact Form" inquiryType="General" /></div>
      </section>
    </StaticPageView>
  );
}
