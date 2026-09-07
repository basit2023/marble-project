import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text } from "@/lib/validation/common";

export const userValidation = baseValidation.extend({
  name: text,
  email: z.email(),
  passwordHash: text,
  role: z.enum(E.USER_ROLES),
  lastLoginAt: z.date().optional(),
  forcePasswordChange: z.boolean(),
});
