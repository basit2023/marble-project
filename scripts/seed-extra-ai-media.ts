import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { z } from "zod";
import { Types } from "mongoose";
import { slugify } from "../src/lib/utils";

loadEnvConfig(process.cwd());

const uploadResultSchema = z.object({
  public_id: z.string(),
  secure_url: z.url(),
  format: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  version: z.number().int().positive().optional(),
});

const assets = [
  { key: "ai-travertine-showroom", file: "ai-travertine-showroom.png", title: "AI travertine showroom slab", folder: "products", usageContext: "product", category: "Travertine", altText: "Warm beige travertine slab with linear pores displayed in a dark luxury showroom" },
  { key: "ai-limestone-showroom", file: "ai-limestone-showroom.png", title: "AI cream limestone showroom slab", folder: "products", usageContext: "product", category: "Limestone", altText: "Cream limestone slab with subtle fossil texture on brass supports in a stone showroom" },
  { key: "ai-green-quartzite", file: "ai-green-quartzite.png", title: "AI green quartzite slab", folder: "products", usageContext: "product", category: "Quartzite", altText: "Polished green and grey quartzite slab with bold natural veining in a dark showroom" },
  { key: "ai-marble-kitchen", file: "ai-marble-kitchen.png", title: "AI marble kitchen island", folder: "projects", usageContext: "gallery", category: "Marble", altText: "Luxury kitchen with white marble waterfall island and marble backsplash" },
  { key: "ai-onyx-bathroom", file: "ai-onyx-bathroom.png", title: "AI onyx bathroom feature wall", folder: "projects", usageContext: "gallery", category: "Onyx", altText: "Luxury bathroom with backlit honey onyx feature wall and marble vanity" },
  { key: "ai-stone-facade", file: "ai-stone-facade.png", title: "AI stone facade villa", folder: "projects", usageContext: "project", category: "Limestone", altText: "Modern villa exterior with grey natural stone facade cladding and marble entry steps" },
  { key: "ai-marble-quarry", file: "ai-marble-quarry.png", title: "AI marble quarry blocks", folder: "brand", usageContext: "gallery", category: "Marble", altText: "Marble quarry with large cut stone blocks prepared for transport in mountainous terrain" },
  { key: "ai-sandstone-display", file: "ai-sandstone-display.png", title: "AI sandstone tile display", folder: "products", usageContext: "product", category: "Sandstone", altText: "Golden beige sandstone tiles and slabs arranged in a premium dark showroom" },
  { key: "ai-slate-display", file: "ai-slate-display.png", title: "AI slate and split face display", folder: "products", usageContext: "product", category: "Slate", altText: "Dark slate tiles and split face stone panels displayed on a charcoal showroom counter" },
] as const;

const seo = (title: string, description: string) => ({
  metaTitle: title.slice(0, 60),
  metaDescription: description.slice(0, 160),
  keywords: title.toLowerCase().split(/\s+/).filter(Boolean),
  noIndex: false,
});

async function cloudinaryTimestamp(cloudName: string) {
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "HEAD", cache: "no-store" }).catch(() => null);
  const header = response?.headers.get("date");
  const parsed = header ? Date.parse(header) : Number.NaN;
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : Math.floor(Date.now() / 1000);
}

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { env } = await import("../src/lib/env");
  const { cloudinary } = await import("../src/lib/cloudinary");
  const { generateBlurDataUrl } = await import("../src/lib/media/cloud");
  const { hashPassword } = await import("../src/lib/password");
  const { User, Media, Category, HomeSection } = await import("../src/models");
  const db = await connectDB();
  try {
    let user = await User.findOne({ role: "superadmin", isDeleted: false }) ?? await User.findOne({ isDeleted: false });
    if (!user) {
      user = await User.create({
        name: "Extra AI Media Seeder",
        email: "seed-extra-ai-media@example.invalid",
        passwordHash: await hashPassword(randomUUID() + randomUUID()),
        role: "editor",
        forcePasswordChange: true,
        isActive: true,
        isDeleted: false,
        sortOrder: 0,
        createdBy: null,
        updatedBy: null,
      });
    }

    const uploadTimestamp = await cloudinaryTimestamp(env.CLOUDINARY_CLOUD_NAME);
    const mediaByCategory = new Map<string, Types.ObjectId>();

    for (const [sortOrder, asset] of assets.entries()) {
      const cloudinaryPublicId = `marble-site/${asset.folder}/${asset.key}`;
      const existing = await Media.findOne({
        $or: [{ cloudinaryPublicId }, { title: asset.title }],
        isDeleted: false,
      });
      if (existing) {
        existing.set({
          title: asset.title,
          altText: asset.altText,
          caption: asset.title,
          folder: `marble-site/${asset.folder}`,
          tags: ["ai-generated", "demo", asset.category.toLowerCase()],
          usageContext: asset.usageContext,
          isActive: true,
          sortOrder: sortOrder + 20,
          updatedBy: user._id,
        });
        await existing.save();
        mediaByCategory.set(asset.category, existing._id);
        continue;
      }
      const assetPath = path.join(process.cwd(), "seed-assets", "generated", asset.file);
      if (!existsSync(assetPath)) throw new Error(`Missing generated asset: ${assetPath}`);
      const raw = await cloudinary.uploader.upload(assetPath, {
        folder: `marble-site/${asset.folder}`,
        public_id: asset.key,
        overwrite: true,
        resource_type: "image",
        timestamp: uploadTimestamp,
        transformation: [{ crop: "limit", width: 2560, flags: "strip_profile" }],
      });
      const upload = uploadResultSchema.parse(raw);
      const blurDataUrl = upload.version ? await generateBlurDataUrl(upload.public_id, upload.version) : undefined;
      const media = await Media.create({
        cloudinaryPublicId: upload.public_id,
        secureUrl: upload.secure_url,
        format: upload.format,
        width: upload.width,
        height: upload.height,
        bytes: upload.bytes,
        version: upload.version,
        blurDataUrl,
        altText: asset.altText,
        caption: asset.title,
        title: asset.title,
        folder: `marble-site/${asset.folder}`,
        tags: ["ai-generated", "demo", asset.category.toLowerCase()],
        usageContext: asset.usageContext,
        uploadedBy: user._id,
        createdBy: user._id,
        updatedBy: user._id,
        isActive: true,
        isDeleted: false,
        sortOrder: sortOrder + 20,
      });
      mediaByCategory.set(asset.category, media._id);
    }

    for (const [index, categoryName] of [...new Set(assets.map((asset) => asset.category))].entries()) {
      const slug = slugify(categoryName);
      const coverImage = mediaByCategory.get(categoryName);
      const category = await Category.findOne({ slug, isDeleted: false });
      const payload = {
        name: categoryName,
        slug,
        description: `Explore ${categoryName.toLowerCase()} slabs, tiles and project applications for local and export enquiries.`,
        shortDescription: `${categoryName} slabs, tiles and custom cuts`,
        coverImage,
        seo: seo(`${categoryName} stone`, `Browse ${categoryName.toLowerCase()} slabs, tiles and project applications.`),
        isFeatured: true,
        showInMenu: true,
        showOnHomepage: true,
        isActive: true,
        isDeleted: false,
        sortOrder: index + 10,
        createdBy: user._id,
        updatedBy: user._id,
      };
      if (category) {
        category.set({ ...payload, createdBy: category.createdBy ?? user._id });
        await category.save();
      } else {
        await Category.create(payload);
      }
    }

    const gallery = await HomeSection.findOne({ sectionKey: "gallery", isDeleted: false });
    if (gallery) {
      gallery.set({
        heading: gallery.heading ?? "Stone Gallery",
        subheading: gallery.subheading ?? "AI-generated showroom, project and quarry visuals stored in Cloudinary.",
        isActive: true,
        updatedBy: user._id,
      });
      await gallery.save();
    }

    await Promise.all([Media.createIndexes(), Category.createIndexes(), HomeSection.createIndexes()]);
    console.info(`Extra AI media seed complete: ${assets.length} images uploaded or reused in Cloudinary and MongoDB.`);
  } finally {
    await db.disconnect();
  }
}

main().catch((error: unknown) => {
  if (error instanceof z.ZodError) {
    console.error(error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
  } else if (error instanceof Error) {
    console.error(`${error.name}: ${error.message}`);
  } else {
    console.error("Extra AI media seed failed.");
  }
  process.exitCode = 1;
});
