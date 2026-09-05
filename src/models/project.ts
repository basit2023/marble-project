import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IProject } from "@/types/project";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { projectValidation } from "@/lib/validation/project";
import { seoSchema } from "@/models/seo";

const schema = createContentSchema<IProject>();
schema.add({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  client: { type: String, trim: true },
  location: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  projectType: { type: String, enum: E.PROJECT_TYPES, required: true },
  year: { type: Number, required: true, min: 1000, max: 9999 },
  description: { type: String, required: true, trim: true },
  materialsUsed: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  finishesUsed: { type: [String], default: [] },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  gallery: { type: [Schema.Types.ObjectId], ref: "Media", default: [] },
  isFeatured: { type: Boolean, default: false, required: true },
  seo: { type: seoSchema, default: () => ({}) },
});

addZodValidation(schema, projectValidation);

export const Project = (models.Project as ContentModel<IProject> | undefined)
  ?? model<IProject, ContentModel<IProject>>("Project", schema);

