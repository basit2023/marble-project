import "server-only";
import { Schema, model, models } from "mongoose";
import { z } from "zod";
import { createContentSchema, addZodValidation, type ContentModel } from "./shared";
import { baseValidation } from "@/lib/validation/common";
import { mediaCopySchema } from "@/lib/media/copy-schema";
import type { IAdminContent } from "@/types/admin-content";

const schema = createContentSchema<IAdminContent>();
schema.add({
  key: { type: String, enum: ["media"], unique: true, required: true },
  copy: { type: Schema.Types.Mixed, required: true },
});
addZodValidation(schema, baseValidation.extend({ key: z.literal("media"), copy: mediaCopySchema }));
export const AdminContent = (models.AdminContent as ContentModel<IAdminContent> | undefined)
  ?? model<IAdminContent, ContentModel<IAdminContent>>("AdminContent", schema);

