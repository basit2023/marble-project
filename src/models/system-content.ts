import "server-only";
import { model, models } from "mongoose";
import type { ISystemContent } from "@/types/system-content";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { systemContentValidation } from "@/lib/validation/system-content";
const schema = createContentSchema<ISystemContent>();
schema.add({
  key: { type: String, enum: ["foundation", "error", "notFound", "loading"], required: true, unique: true },
  heading: { type: String, required: true },
  body: { type: String, required: true },
  actionLabel: { type: String, required: true },
  seoTitle: { type: String, required: true },
  seoDescription: { type: String, required: true },
});
addZodValidation(schema, systemContentValidation);
export const SystemContent = (models.SystemContent as ContentModel<ISystemContent> | undefined)
  ?? model<ISystemContent, ContentModel<ISystemContent>>("SystemContent", schema);
