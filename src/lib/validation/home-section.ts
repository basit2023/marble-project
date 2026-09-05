import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, optionalText, objectId, linkUrl } from "@/lib/validation/common";
import { homeItemValidation } from "@/lib/validation/subdocuments";

export const homeSectionValidation = baseValidation.extend({
  sectionKey: z.enum(E.HOME_SECTION_KEYS),
  heading: optionalText,
  subheading: optionalText,
  eyebrowLabel: optionalText,
  bodyText: optionalText,
  ctaLabel: optionalText,
  ctaUrl: linkUrl.optional(),
  backgroundImage: objectId.nullable().optional(),
  items: z.array(homeItemValidation).refine((items) => new Set(items.map((item) => item.key)).size === items.length, {
    message: "Homepage item keys must be unique within the section.",
  }),
});
