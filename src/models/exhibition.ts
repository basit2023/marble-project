import "server-only";
import { Schema, model, models } from "mongoose";
import type { IExhibition } from "@/types/exhibition";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { exhibitionValidation } from "@/lib/validation/exhibition";
import { seoSchema } from "@/models/seo";

const schema = createContentSchema<IExhibition>();
schema.add({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  venue: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true, trim: true },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  gallery: { type: [Schema.Types.ObjectId], ref: "Media", default: [] },
  seo: { type: seoSchema, default: () => ({}) },
});

addZodValidation(schema, exhibitionValidation);
schema.index({ startDate: 1, endDate: 1 });
schema.virtual("isUpcoming").get(function () {
  return this.startDate instanceof Date && this.startDate.getTime() > Date.now();
});
export const Exhibition = (models.Exhibition as ContentModel<IExhibition> | undefined)
  ?? model<IExhibition, ContentModel<IExhibition>>("Exhibition", schema);

