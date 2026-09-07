import type { MetadataRoute } from "next";
import { collectSitemapEntries, SITEMAP_CHUNK_SIZE } from "@/lib/seo/sitemap";

export const revalidate = 3600;

/**
 * Split the sitemap into a sitemap index once it exceeds 5,000 URLs.
 * Next.js serves `/sitemap.xml` as the index and `/sitemap/<id>.xml` per chunk.
 */
export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  const entries = await collectSitemapEntries();
  const chunks = Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE));
  return Array.from({ length: chunks }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const entries = await collectSitemapEntries();
  const start = id * SITEMAP_CHUNK_SIZE;
  return entries.slice(start, start + SITEMAP_CHUNK_SIZE);
}
