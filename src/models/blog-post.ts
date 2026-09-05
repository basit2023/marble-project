import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IBlogPost } from "@/types/blog-post";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { blogPostValidation } from "@/lib/validation/blog-post";
import { seoSchema } from "@/models/seo";
import { calculateReadTime } from "@/lib/read-time";

const schema = createContentSchema<IBlogPost>();
schema.add({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  excerpt: { type: String, trim: true },
  content: { type: String, required: true, trim: true },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: E.BLOG_CATEGORIES, required: true },
  tags: { type: [String], default: [] },
  readTimeMinutes: { type: Number, min: 1, default: 1, required: true },
  publishedAt: { type: Date },
  isPublished: { type: Boolean, default: false, required: true },
  viewCount: { type: Number, default: 0, min: 0, required: true },
  seo: { type: seoSchema, default: () => ({}) },
});
// Compute before validation as well as save, including insertMany validation.
schema.pre("validate", function () {
  if (this.isNew || this.isSelected("content")) this.readTimeMinutes = calculateReadTime(this.content ?? "");
});
schema.pre("save", function () {
  if (this.isNew || this.isSelected("content")) this.readTimeMinutes = calculateReadTime(this.content ?? "");
});
addZodValidation(schema, blogPostValidation);
schema.index({ category: 1 });
schema.index({ publishedAt: -1 });
schema.index({ isActive: 1, isDeleted: 1, isPublished: 1, publishedAt: -1 });
export const BlogPost = (models.BlogPost as ContentModel<IBlogPost> | undefined)
  ?? model<IBlogPost, ContentModel<IBlogPost>>("BlogPost", schema);
