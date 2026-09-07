import "server-only";
import { Schema, model, models } from "mongoose";
import type { IPage } from "@/types/page";
import { PUBLIC_PAGE_KINDS } from "@/types/page";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { pageValidation } from "@/lib/validation/page";
import { seoSchema } from "@/models/seo";

const pageSectionSchema = new Schema<IPage["sections"][number]>({
  key: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
  body: { type: String, trim: true },
  items: { type: [String], default: [] },
  image: { type: Schema.Types.ObjectId, ref: "Media" },
  sortOrder: { type: Number, default: 0, required: true },
  isActive: { type: Boolean, default: true, required: true },
}, { _id: false });

const schema = createContentSchema<IPage>();
schema.add({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  kind: { type: String, enum: PUBLIC_PAGE_KINDS, required: true, default: "general" },
  excerpt: { type: String, trim: true },
  content: { type: String, required: true, trim: true },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  gallery: { type: [Schema.Types.ObjectId], ref: "Media", default: [] },
  sections: { type: [pageSectionSchema], default: [] },
  seo: { type: seoSchema, default: () => ({}) },
});

addZodValidation(schema, pageValidation);
schema.index({ kind: 1, isActive: 1, isDeleted: 1 });

export const Page = (models.Page as ContentModel<IPage> | undefined)
  ?? model<IPage, ContentModel<IPage>>("Page", schema);
