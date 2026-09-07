import { notFound } from "next/navigation";
import { getBlogPost, getStaticSlugs } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { articleLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { BlogArticleClient } from "@/components/public/blog-article-client";
import { CardImage } from "@/components/public/card-image";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getStaticSlugs("posts");
  return rows.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getBlogPost((await params).slug);
  if (!data) return {};
  return metadataFromSeo(
    data.post.seo,
    data.post.title,
    data.post.excerpt ?? data.post.title,
    `/blog/${data.post.slug}`,
    {
      type: "article",
      image: data.post.coverImage,
      keywords: data.post.tags,
      publishedTime: data.post.publishedAt,
    },
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getBlogPost((await params).slug);
  if (!data) notFound();
  const site = await getSeoSite();
  const path = `/blog/${data.post.slug}`;
  const trail = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: data.post.category, href: `/blog/category/${encodeURIComponent(data.post.category)}` },
    { label: data.post.title },
  ];
  return (
    <>
      <PageHero eyebrow={[data.post.category, data.post.publishedAt ? formatDate(data.post.publishedAt) : undefined, `${data.post.readTimeMinutes} min read`].filter(Boolean).join(" / ")} title={data.post.title} body={data.post.excerpt} image={data.post.coverImage} breadcrumbs={trail} />
      <BlogArticleClient html={data.post.content} title={data.post.title} />
      <section className="page-shell pb-section">
        <div className="border-t border-charcoal/10 pt-8"><h2 className="font-heading text-4xl">Author</h2><p className="mt-3 text-muted">{data.post.author?.name ?? "Editorial team"}{data.post.author?.role ? ` / ${data.post.author.role}` : ""}</p></div>
      </section>
      {data.related.length ? <section className="page-shell grid gap-8 pb-section md:grid-cols-3"><h2 className="font-heading text-title md:col-span-3">Related posts</h2>{data.related.map((post) => <CardImage key={post.id} href={`/blog/${post.slug}`} title={post.title} meta={post.category} image={post.coverImage} />)}</section> : null}
      <JsonLd data={[
        breadcrumbLd(trail.map((crumb, index) => index === trail.length - 1 ? { label: crumb.label, href: path } : crumb), site),
        articleLd({ post: data.post, site, path }),
      ]} />
    </>
  );
}
