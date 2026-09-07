import "server-only";
import { Schema, model, models } from "mongoose";
import { z } from "zod";
import { createContentSchema, addZodValidation, type ContentModel } from "./shared";
import { baseValidation } from "@/lib/validation/common";
import { publicCopySchema } from "@/lib/public/copy-schema";
import type { IPublicUiContent } from "@/types/public-ui-content";
const schema = createContentSchema<IPublicUiContent>();
schema.add({ key: { type: String, enum: ["public-ui"], unique: true, required: true }, copy: { type: Schema.Types.Mixed, required: true } });
addZodValidation(schema, baseValidation.extend({ key: z.literal("public-ui"), copy: publicCopySchema }));
export const PublicUiContent = (models.PublicUiContent as ContentModel<IPublicUiContent> | undefined)
  ?? model<IPublicUiContent, ContentModel<IPublicUiContent>>("PublicUiContent", schema);
