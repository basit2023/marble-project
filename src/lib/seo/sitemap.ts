import "server-only";
import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { publicFilter } from "@/models/content-fields";
import { Category, Product, Project, Exhibition, BlogPost, Page } from "@/models";
import { BLOG_CATEGORIES } from "@/types/enums";
import { env } from "@/lib/env";

export const SITEMAP_CHUNK_SIZE = 5000;

type Entry = MetadataRoute.Sitemap[number];

const base = () => env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
const url = (path: string) => `${base()}${path}`;
const notNoIndexed = { $ne: true } as const;

const STATIC_ROUTES: Array<{ path: string; changeFrequency: Entry["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/materials", changeFrequency: "weekly", priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
  { path: "/exhibitions", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/quote", changeFrequency: "yearly", priority: 0.6 },
];

/** Page-document kinds that expose a public URL, mapped to their route. */
const PAGE_ROUTES: Record<string, string> = {
  about: "/about",
  export: "/export",
  contact: "/contact",
  "privacy-policy": "/privacy-policy",
  terms: "/terms",
  "return-policy": "/return-policy",
};

/**
 * Every indexable public URL, newest content first. Only active, non-deleted
 * documents whose `seo.noIndex` is not set are included; `lastModified` is the
 * document's `updatedAt`.
 */
export async function collectSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const now = new Date();

  const [categories, products, projects, exhibitions, posts, pages] = await Promise.all([
    Category.find({ "seo.noIndex": notNoIndexed }).activeOnly().select("slug updatedAt").sort({ updatedAt: -1 }).lean(),
    Product.find({ "seo.noIndex": notNoIndexed }).activeOnly().select("slug updatedAt category")
      .populate({ path: "category", match: publicFilter, select: "slug" }).sort({ updatedAt: -1 }).lean(),
    Project.find({ "seo.noIndex": notNoIndexed }).activeOnly().select("slug updatedAt").sort({ updatedAt: -1 }).lean(),
    Exhibition.find({ "seo.noIndex": notNoIndexed }).activeOnly().select("slug updatedAt").sort({ updatedAt: -1 }).lean(),
    BlogPost.find({ "seo.noIndex": notNoIndexed, isPublished: true, publishedAt: { $lte: now } })
      .activeOnly().select("slug updatedAt").sort({ updatedAt: -1 }).lean(),
    Page.find({ "seo.noIndex": notNoIndexed }).activeOnly().select("slug kind updatedAt").lean(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map((route) => ({
      url: url(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...BLOG_CATEGORIES.map((category) => ({
      url: url(`/blog/category/${encodeURIComponent(category)}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...pages
      .filter((page) => PAGE_ROUTES[page.kind])
      .map((page) => ({
        url: url(PAGE_ROUTES[page.kind]),
        lastModified: page.updatedAt ?? now,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      })),
    ...categories.map((category) => ({
      url: url(`/materials/${category.slug}`),
      lastModified: category.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products
      .filter((product): product is typeof product & { category: { slug: string } } =>
        Boolean(product.category && typeof (product.category as { slug?: string }).slug === "string"))
      .map((product) => ({
        url: url(`/materials/${(product.category as unknown as { slug: string }).slug}/${product.slug}`),
        lastModified: product.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...projects.map((project) => ({
      url: url(`/projects/${project.slug}`),
      lastModified: project.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...exhibitions.map((exhibition) => ({
      url: url(`/exhibitions/${exhibition.slug}`),
      lastModified: exhibition.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...posts.map((post) => ({
      url: url(`/blog/${post.slug}`),
      lastModified: post.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return entries;
}
