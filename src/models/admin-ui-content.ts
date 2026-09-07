import "server-only";
import { Schema, model, models } from "mongoose";
import { z } from "zod";
import { createContentSchema, addZodValidation, type ContentModel } from "./shared";
import { baseValidation } from "@/lib/validation/common";
import { adminCopySchema } from "@/lib/admin/copy-schema";
import type { IAdminUiContent } from "@/types/admin-ui-content";
const schema = createContentSchema<IAdminUiContent>();
schema.add({
  key: { type: String, enum: ["admin-ui"], unique: true, required: true },
  copy: { type: Schema.Types.Mixed, required: true },
});
addZodValidation(schema, baseValidation.extend({ key: z.literal("admin-ui"), copy: adminCopySchema }));
export const AdminUiContent = (models.AdminUiContent as ContentModel<IAdminUiContent> | undefined)
  ?? model<IAdminUiContent, ContentModel<IAdminUiContent>>("AdminUiContent", schema);
