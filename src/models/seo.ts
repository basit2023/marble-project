import { Schema } from "mongoose";
import type { ISeo } from "@/types/base";
export const seoSchema = new Schema<ISeo>({
  metaTitle: { type: String, trim: true, maxlength: 60 },
  metaDescription: { type: String, trim: true, maxlength: 160 },
  keywords: { type: [String], default: [] },
  ogImage: { type: Schema.Types.ObjectId, ref: "Media" },
  canonicalUrl: { type: String, trim: true },
  noIndex: { type: Boolean, default: false, required: true },
}, { _id: false, strict: "throw" });

