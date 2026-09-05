import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text } from "@/lib/validation/common";

export const faqValidation = baseValidation.extend({
  question: text,
  answer: text,
  category: z.enum(E.FAQ_CATEGORIES),
});

