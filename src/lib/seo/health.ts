import "server-only";
import type { Model } from "mongoose";
import { connectDB } from "@/lib/db";
import { Category, Product, Project, Exhibition, BlogPost, Page, Media } from "@/models";
import { publicFilter } from "@/models/content-fields";
import type { SeoHealthIssue, SeoHealthReport } from "@/types/seo";
import type { ResourceKey } from "@/lib/admin/resources";

interface LeanSeoDoc {
  _id: { toString(): string };
  slug?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
  [key: string]: unknown;
}
interface LeanMediaDoc {
  _id: { toString(): string };
  altText?: string;
  usageContext?: string;
}

interface ScanTarget {
  collection: string;
  resourceKey: ResourceKey | null;
  titleField: string;
  model: Model<LeanSeoDoc>;
}

const asLeanModel = (model: unknown) => model as Model<LeanSeoDoc>;

const TARGETS: ScanTarget[] = [
  { collection: "Categories", resourceKey: "categories", titleField: "name", model: asLeanModel(Category) },
  { collection: "Products", resourceKey: "products", titleField: "name", model: asLeanModel(Product) },
  { collection: "Projects", resourceKey: "projects", titleField: "title", model: asLeanModel(Project) },
  { collection: "Exhibitions", resourceKey: "exhibitions", titleField: "name", model: asLeanModel(Exhibition) },
  { collection: "Blog", resourceKey: "blog", titleField: "title", model: asLeanModel(BlogPost) },
  { collection: "Pages", resourceKey: null, titleField: "title", model: asLeanModel(Page) },
];

const blank = (value: unknown) => typeof value !== "string" || value.trim().length === 0;

/**
 * Scans indexable content for documents missing a metaTitle, metaDescription or
 * (for media) alt text. Read directly from an authenticated admin server
 * component; it performs no writes.
 */
export async function getSeoHealth(): Promise<SeoHealthReport> {
  await connectDB();

  const perTarget = await Promise.all(
    TARGETS.map(async (target) => {
      const docs = await target.model
        .find(publicFilter)
        .select(`${target.titleField} slug seo.metaTitle seo.metaDescription updatedAt`)
        .sort({ updatedAt: -1 })
        .lean<LeanSeoDoc[]>();
      const issues: SeoHealthIssue[] = [];
      for (const doc of docs) {
        const missing: string[] = [];
        if (blank(doc.seo?.metaTitle)) missing.push("metaTitle");
        if (blank(doc.seo?.metaDescription)) missing.push("metaDescription");
        if (!missing.length) continue;
        const id = doc._id.toString();
        issues.push({
          collection: target.collection,
          id,
          label: String(doc[target.titleField] ?? doc.slug ?? id),
          editUrl: target.resourceKey ? `/admin/${target.resourceKey}/${id}` : "",
          missing,
        });
      }
      return { scanned: docs.length, issues };
    }),
  );

  const media = await Media.find({ isDeleted: false, deletionStatus: { $ne: "pending" } })
    .select("altText usageContext updatedAt")
    .sort({ updatedAt: -1 })
    .lean<LeanMediaDoc[]>();
  const mediaIssues: SeoHealthIssue[] = media
    .filter((item) => blank(item.altText))
    .map((item) => ({
      collection: "Media",
      id: item._id.toString(),
      label: item.usageContext ? `${item.usageContext} image` : "Media asset",
      editUrl: "/admin/media",
      missing: ["altText"],
    }));

  const issues = [...perTarget.flatMap((entry) => entry.issues), ...mediaIssues];
  const scanned = perTarget.reduce((total, entry) => total + entry.scanned, 0) + media.length;

  return {
    generatedAt: new Date().toISOString(),
    totals: { scanned, withIssues: issues.length },
    issues,
  };
}
