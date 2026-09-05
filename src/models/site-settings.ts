import "server-only";
import { Schema, model, models } from "mongoose";
import type { ISiteSettings } from "@/types/site-settings";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { siteSettingsValidation } from "@/lib/validation/site-settings";
import { seoSchema } from "@/models/seo";
import { addressSchema, socialLinkSchema, announcementSchema } from "@/models/subdocuments";

const schema = createContentSchema<ISiteSettings>();
schema.add({
  singletonKey: { type: String, enum: ["site"], default: "site", required: true, unique: true, immutable: true },
  siteName: { type: String, required: true, trim: true },
  tagline: { type: String, trim: true },
  logo: { type: Schema.Types.ObjectId, ref: "Media" },
  logoLight: { type: Schema.Types.ObjectId, ref: "Media" },
  favicon: { type: Schema.Types.ObjectId, ref: "Media" },
  phone: { type: [String], default: [] },
  whatsappNumber: { type: String, trim: true },
  email: { type: [String], default: [] },
  addresses: { type: [addressSchema], default: [] },
  businessHours: { type: String, trim: true },
  socialLinks: { type: [socialLinkSchema], default: [] },
  defaultSeo: { type: seoSchema, default: () => ({}) },
  googleAnalyticsId: { type: String, trim: true },
  googleTagManagerId: { type: String, trim: true },
  facebookPixelId: { type: String, trim: true },
  whatsappDefaultMessage: { type: String, trim: true },
  maintenanceMode: { type: Boolean, default: false, required: true },
  announcementBar: { type: announcementSchema, default: () => ({}) },
});

addZodValidation(schema, siteSettingsValidation);

export const SiteSettings = (models.SiteSettings as ContentModel<ISiteSettings> | undefined)
  ?? model<ISiteSettings, ContentModel<ISiteSettings>>("SiteSettings", schema);

