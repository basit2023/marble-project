import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomepageData, getPublicLayoutData } from "@/lib/public/data";
import { buildWhatsAppLink } from "@/lib/utils";
import { resolvePageMetadata } from "@/lib/seo/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { organizationLd, localBusinessLd, websiteLd } from "@/lib/seo/jsonld";
import { clusterKeywords } from "@/lib/seo/keywords";
import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/components/public/hero-section";
import { StatsSection } from "@/components/public/stats-section";
import { MaterialsSection } from "@/components/public/materials-section";
import { AboutSection } from "@/components/public/about-section";
import { WhyUsSection } from "@/components/public/why-us-section";
import { ProcessSection } from "@/components/public/process-section";
import { FeaturedProductsSection } from "@/components/public/featured-products-section";
import { GallerySection } from "@/components/public/gallery-section";
import { ProjectsSection } from "@/components/public/projects-section";
import { ExportSection } from "@/components/public/export-section";
import { ExhibitionsSection } from "@/components/public/exhibitions-section";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { FaqSection } from "@/components/public/faq-section";
import { BlogSection } from "@/components/public/blog-section";
import { CtaSection } from "@/components/public/cta-section";
import { NewsletterSection } from "@/components/public/newsletter-section";
export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSeoSite();
  return resolvePageMetadata({
    seo: site.defaultSeo,
    title: site.defaultSeo.metaTitle ?? `${site.siteName} — Marble, Granite & Onyx Supplier and Exporter in Pakistan`,
    description: site.defaultSeo.metaDescription ?? "Pakistan-based natural stone manufacturer and exporter. Marble, granite, onyx and travertine for flooring, cladding and countertops — local projects in Lahore, Karachi and Islamabad and worldwide export.",
    path: "/",
    absoluteTitle: true,
    keywords: site.defaultSeo.keywords.length ? site.defaultSeo.keywords : clusterKeywords("home"),
  });
}
export default async function HomePage() {
  const [data, layout, site] = await Promise.all([getHomepageData(), getPublicLayoutData(), getSeoSite()]);
  if (!data || !layout) notFound();
  const whatsapp = data.settings.whatsappNumber ? buildWhatsAppLink(data.settings.whatsappDefaultMessage ?? "", data.settings.whatsappNumber) : undefined;
  const hasHero = data.sections.some((section) => section.sectionKey === "hero");
  return <>{!hasHero && <h1 className="sr-only">{data.settings.siteName}</h1>}
    {data.sections.map((section) => {
      switch (section.sectionKey) {
        case "hero": return <div key={section.id}><HeroSection section={section} copy={layout.copy} heroMedia={data.heroMedia} /><span id="content-start" className="sr-only" /></div>;
        case "stats": return <StatsSection key={section.id} section={section} />;
        case "materials": return <MaterialsSection key={section.id} section={section} categories={data.categories} copy={layout.copy} />;
        case "about": return <AboutSection key={section.id} section={section} />;
        case "whyUs": return <WhyUsSection key={section.id} section={section} />;
        case "process": return <ProcessSection key={section.id} section={section} />;
        case "featuredProducts": return <FeaturedProductsSection key={section.id} section={section} products={data.products} copy={layout.copy} />;
        case "gallery": return <GallerySection key={section.id} section={section} images={data.gallery} copy={layout.copy} />;
        case "projects": return <ProjectsSection key={section.id} section={section} projects={data.projects} />;
        case "export": return <ExportSection key={section.id} section={section} whatsappHref={whatsapp} />;
        case "exhibitions": return <ExhibitionsSection key={section.id} section={section} exhibitions={data.exhibitions} copy={layout.copy} />;
        case "testimonials": return <TestimonialsSection key={section.id} section={section} testimonials={data.testimonials} copy={layout.copy} />;
        case "faq": return <FaqSection key={section.id} section={section} faqs={data.faqs} />;
        case "blog": return <BlogSection key={section.id} section={section} posts={data.posts} copy={layout.copy} />;
        case "cta": return <CtaSection key={section.id} section={section} settings={data.settings} copy={layout.copy} whatsappHref={whatsapp} />;
        case "newsletter": return <NewsletterSection key={section.id} section={section} copy={layout.copy} />;
        default: return null;
      }
    })}
    <JsonLd data={[organizationLd(site), localBusinessLd(site), websiteLd(site)]} />
  </>;
}
