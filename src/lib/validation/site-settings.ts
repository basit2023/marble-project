import { z } from "zod";
import { baseValidation, text, optionalText, objectId, seoValidation } from "@/lib/validation/common";
import { addressValidation, socialLinkValidation, announcementValidation } from "@/lib/validation/subdocuments";

export const siteSettingsValidation = baseValidation.extend({
  singletonKey: z.literal("site"),
  siteName: text,
  tagline: optionalText,
  logo: objectId.nullable().optional(),
  logoLight: objectId.nullable().optional(),
  favicon: objectId.nullable().optional(),
  phone: z.array(text),
  whatsappNumber: z.string().regex(/^[1-9]\d{7,14}$/).optional(),
  email: z.array(z.email()),
  addresses: z.array(addressValidation),
  businessHours: optionalText,
  priceRange: optionalText,
  socialLinks: z.array(socialLinkValidation),
  defaultSeo: seoValidation,
  googleAnalyticsId: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
  googleTagManagerId: z.string().regex(/^GTM-[A-Z0-9]+$/).optional(),
  facebookPixelId: z.string().regex(/^\d+$/).optional(),
  whatsappDefaultMessage: optionalText,
  maintenanceMode: z.boolean(),
  announcementBar: announcementValidation,
});

