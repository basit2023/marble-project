import Link from "next/link";
import type { Route } from "next";
import { BLOG_CATEGORIES } from "@/types/enums";
import { getBlogPosts } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";
import { clusterKeywords } from "@/lib/seo/keywords";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { CardImage } from "@/components/public/card-image";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export function generateMetadata() {
  return metadataFromSeo(undefined, "Marble & Natural Stone Blog", "Buying guides, stone care, design trends and project stories about marble, granite and onyx from Pakistan.", "/blog", { keywords: clusterKeywords("blog") });
}

export default async function BlogPage() {
  const [posts, site] = await Promise.all([getBlogPosts(), getSeoSite()]);
  return (
    <>
      <PageHero title="Blog" body="Buying guides, design notes, care advice and project stories from the stone floor." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      <JsonLd data={[
        breadcrumbLd([{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }], site),
        itemListLd({ site, items: posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })) }),
      ]} />
      <section className="page-shell py-section">
        <div className="mb-10 flex flex-wrap gap-3">{BLOG_CATEGORIES.map((category) => <Link key={category} href={`/blog/category/${encodeURIComponent(category)}` as Route} className="border border-ivory/15 px-3 py-2 text-sm">{category}</Link>)}</div>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <CardImage key={post.id} href={`/blog/${post.slug}`} title={post.title} meta={[post.category, post.publishedAt ? formatDate(post.publishedAt) : undefined, `${post.readTimeMinutes} min read`].filter(Boolean).join(" / ")} image={post.coverImage} />)}</div>
      </section>
    </>
  );
}
