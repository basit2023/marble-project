import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, objectId, linkUrl } from "@/lib/validation/common";

export const navigationItemValidation = baseValidation.extend({
  label: text,
  url: linkUrl,
  parentItem: objectId.nullable().optional(),
  openInNewTab: z.boolean(),
  location: z.enum(E.NAV_LOCATIONS),
});

