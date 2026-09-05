import "server-only";
import { Types, type ClientSession } from "mongoose";
import { Product, Project, Exhibition, BlogPost, HomeSection, Category, Testimonial, SiteSettings } from "@/models";
import type { MediaUsage } from "./contracts";

export const MEDIA_REFERENCE_PATHS = {
  Product: ["images", "primaryImage", "seo.ogImage"],
  Project: ["coverImage", "gallery", "seo.ogImage"],
  Exhibition: ["coverImage", "gallery", "seo.ogImage"],
  BlogPost: ["coverImage", "seo.ogImage"],
  HomeSection: ["backgroundImage", "items.image"],
  Category: ["coverImage", "seo.ogImage"],
  Testimonial: ["clientPhoto"],
  SiteSettings: ["logo", "logoLight", "favicon", "defaultSeo.ogImage"],
} as const;
const registry = { Product, Project, Exhibition, BlogPost, HomeSection, Category, Testimonial, SiteSettings };
interface ReferenceRow { _id: Types.ObjectId; name?: string; title?: string; sectionKey?: string; clientName?: string; siteName?: string }
export async function findMediaUsages(id: Types.ObjectId, session: ClientSession): Promise<MediaUsage[]> {
  const usages: MediaUsage[] = [];
  // Sequential queries are required within a MongoDB transaction.
  for (const name of Object.keys(registry) as Array<keyof typeof registry>) {
    const collection = registry[name].collection;
    // Include inactive and soft-deleted owners: restoring them must not break images.
    const records = await collection.find<ReferenceRow>({
      $or: MEDIA_REFERENCE_PATHS[name].map((path) => ({ [path]: id })),
    }, { session, projection: { _id: 1, name: 1, title: 1, sectionKey: 1, clientName: 1, siteName: 1 } }).toArray();
    for (const record of records) usages.push({
      collection: name, documentId: record._id.toString(),
      label: record.name ?? record.title ?? record.sectionKey ?? record.clientName ?? record.siteName ?? record._id.toString(),
    });
  }
  return usages;
}
