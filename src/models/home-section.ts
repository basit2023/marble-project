import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IHomeSection } from "@/types/home-section";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { homeSectionValidation } from "@/lib/validation/home-section";
import { homeItemSchema } from "@/models/subdocuments";

const schema = createContentSchema<IHomeSection>();
schema.add({
  sectionKey: { type: String, enum: E.HOME_SECTION_KEYS, unique: true, required: true },
  heading: { type: String, trim: true },
  subheading: { type: String, trim: true },
  eyebrowLabel: { type: String, trim: true },
  bodyText: { type: String, trim: true },
  ctaLabel: { type: String, trim: true },
  ctaUrl: { type: String, trim: true },
  backgroundImage: { type: Schema.Types.ObjectId, ref: "Media" },
  items: { type: [homeItemSchema], default: [] },
});

addZodValidation(schema, homeSectionValidation);

export const HomeSection = (models.HomeSection as ContentModel<IHomeSection> | undefined)
  ?? model<IHomeSection, ContentModel<IHomeSection>>("HomeSection", schema);

