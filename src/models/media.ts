import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IMedia } from "@/types/media";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { mediaValidation } from "@/lib/validation/media";

const schema = createContentSchema<IMedia>();
schema.add({
  cloudinaryPublicId: { type: String, required: true, trim: true, unique: true },
  secureUrl: { type: String, required: true, trim: true },
  format: { type: String, required: true, trim: true },
  width: { type: Number, min: 1, required: true },
  height: { type: Number, min: 1, required: true },
  bytes: { type: Number, min: 1, required: true },
  version: { type: Number, min: 1 },
  deletionStatus: { type: String, enum: ["none", "pending"], default: "none" },
  altText: { type: String, required: true, trim: true },
  caption: { type: String, trim: true },
  title: { type: String, trim: true },
  folder: { type: String, trim: true },
  tags: { type: [String], default: [] },
  usageContext: { type: String, enum: E.MEDIA_CONTEXTS, required: true, default: "other" },
  blurDataUrl: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

addZodValidation(schema, mediaValidation);
schema.index({ folder: 1, isDeleted: 1, createdAt: -1 });
schema.index({ tags: 1 });
schema.index({ usageContext: 1, isDeleted: 1 });

export const Media = (models.Media as ContentModel<IMedia> | undefined)
  ?? model<IMedia, ContentModel<IMedia>>("Media", schema);
