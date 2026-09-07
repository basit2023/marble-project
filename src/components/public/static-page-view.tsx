import { PageHero } from "@/components/public/page-hero";
import { RichText } from "@/components/public/rich-text";
import { ContentSections } from "@/components/public/content-sections";
import type { PageDTO } from "@/types/public-pages";
import type { BreadcrumbItem } from "@/types/seo";

export function StaticPageView({ page, breadcrumbs, children }: { page: PageDTO; breadcrumbs?: BreadcrumbItem[]; children?: React.ReactNode }) {
  return (
    <>
      <PageHero title={page.title} body={page.excerpt} image={page.coverImage} breadcrumbs={breadcrumbs} />
      <section className="page-shell py-section"><RichText html={page.content} /></section>
      <ContentSections sections={page.sections} />
      {children}
    </>
  );
}
