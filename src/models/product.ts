import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IProduct } from "@/types/product";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { productValidation } from "@/lib/validation/product";
import { seoSchema } from "@/models/seo";
import { priceRangeSchema, technicalSpecsSchema } from "@/models/subdocuments";

const schema = createContentSchema<IProduct>();
schema.add({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String, required: true, trim: true },
  origin: { type: String, trim: true },
  colourFamily: { type: String, enum: E.COLOUR_FAMILIES, required: true },
  finishes: { type: [String], enum: E.FINISHES, default: [] },
  availableFormats: { type: [String], enum: E.PRODUCT_FORMATS, default: [] },
  thicknessOptions: { type: [String], default: [] },
  sizeOptions: { type: [String], default: [] },
  applications: { type: [String], enum: E.APPLICATIONS, default: [] },
  technicalSpecs: { type: technicalSpecsSchema },
  priceRange: { type: priceRangeSchema },
  isPriceVisible: { type: Boolean, default: false, required: true },
  images: { type: [Schema.Types.ObjectId], ref: "Media", default: [] },
  primaryImage: { type: Schema.Types.ObjectId, ref: "Media" },
  tags: { type: [String], default: [] },
  isFeatured: { type: Boolean, default: false, required: true },
  isExportAvailable: { type: Boolean, default: false, required: true },
  stockStatus: { type: String, enum: E.STOCK_STATUSES, required: true, default: "Made to Order" },
  seo: { type: seoSchema, default: () => ({}) },
});

addZodValidation(schema, productValidation);
schema.index({ category: 1, isActive: 1, isDeleted: 1, sortOrder: 1 });
schema.index({ name: "text", description: "text", tags: "text" }, { weights: { name: 10, tags: 5, description: 1 }, name: "product_search" });
export const Product = (models.Product as ContentModel<IProduct> | undefined)
  ?? model<IProduct, ContentModel<IProduct>>("Product", schema);

