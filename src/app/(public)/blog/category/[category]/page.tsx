import { notFound } from "next/navigation";
import { BLOG_CATEGORIES } from "@/types/enums";
import { getBlogPosts } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { PageHero } from "@/components/public/page-hero";
import { CardImage } from "@/components/public/card-image";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: encodeURIComponent(category) }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const category = decodeURIComponent((await params).category);
  return metadataFromSeo(undefined, `${category} — Marble & Natural Stone Articles`, `${category} guides and stories about marble, granite and onyx from Pakistan.`, `/blog/category/${encodeURIComponent(category)}`);
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = decodeURIComponent((await params).category);
  if (!BLOG_CATEGORIES.includes(category as (typeof BLOG_CATEGORIES)[number])) notFound();
  const posts = await getBlogPosts(category);
  return (
    <>
      <PageHero title={category} body="Articles filtered by category." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: category }]} />
      <section className="page-shell grid gap-8 py-section md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <CardImage key={post.id} href={`/blog/${post.slug}`} title={post.title} meta={[post.publishedAt ? formatDate(post.publishedAt) : undefined, `${post.readTimeMinutes} min read`].filter(Boolean).join(" / ")} image={post.coverImage} />)}</section>
    </>
  );
}
