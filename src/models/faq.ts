import "server-only";
import { model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IFaq } from "@/types/faq";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { faqValidation } from "@/lib/validation/faq";

const schema = createContentSchema<IFaq>();
schema.add({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: { type: String, enum: E.FAQ_CATEGORIES, required: true, default: "General" },
});

addZodValidation(schema, faqValidation);
schema.index({ category: 1 });
export const Faq = (models.Faq as ContentModel<IFaq> | undefined)
  ?? model<IFaq, ContentModel<IFaq>>("Faq", schema);

