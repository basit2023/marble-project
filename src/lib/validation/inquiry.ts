import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, httpUrl } from "@/lib/validation/common";

export const inquiryValidation = baseValidation.extend({
  name: text,
  email: z.email(),
  phone: optionalText,
  country: optionalText,
  company: optionalText,
  inquiryType: z.enum(E.INQUIRY_TYPES),
  productInterest: z.array(objectId),
  quantity: optionalText,
  unit: optionalText,
  message: text,
  source: z.enum(E.INQUIRY_SOURCES),
  pageUrl: httpUrl.optional(),
  ipAddress: z.union([z.ipv4(), z.ipv6()]).optional(),
  userAgent: z.string().max(2048).optional(),
  status: z.enum(E.INQUIRY_STATUSES),
  adminNotes: optionalText,
  assignedTo: objectId.nullable().optional(),
  isRead: z.boolean(),
});

