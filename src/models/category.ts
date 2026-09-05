import "server-only";
import { Schema, model, models } from "mongoose";
import type { ICategory } from "@/types/category";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { categoryValidation } from "@/lib/validation/category";
import { seoSchema } from "@/models/seo";

const schema = createContentSchema<ICategory>();
schema.add({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  description: { type: String, required: true, trim: true },
  shortDescription: { type: String, trim: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  iconKey: { type: String, trim: true },
  seo: { type: seoSchema, default: () => ({}) },
  isFeatured: { type: Boolean, default: false, required: true },
  showInMenu: { type: Boolean, default: true, required: true },
  showOnHomepage: { type: Boolean, default: false, required: true },
});

addZodValidation(schema, categoryValidation);
schema.index({ parentCategory: 1 });
schema.pre("validate", function () {
  if (this.parentCategory?.equals(this._id)) this.invalidate("parentCategory", "A category cannot be its own parent.");
});
export const Category = (models.Category as ContentModel<ICategory> | undefined)
  ?? model<ICategory, ContentModel<ICategory>>("Category", schema);

