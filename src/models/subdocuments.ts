import { Schema } from "mongoose";
import type { ITechnicalSpecs, IPriceRange, IHomeItem, IAddress, ISocialLink, IAnnouncementBar } from "@/types/subdocuments";

const options = { _id: false, strict: "throw" } as const;
export const technicalSpecsSchema = new Schema<ITechnicalSpecs>({
  density: { type: Number, min: 0 },
  waterAbsorption: { type: Number, min: 0, max: 100 },
  compressiveStrength: { type: Number, min: 0 },
  flexuralStrength: { type: Number, min: 0 },
  abrasionResistance: { type: String, trim: true },
}, options);
export const priceRangeSchema = new Schema<IPriceRange>({
  min: { type: Number, min: 0, required: true },
  max: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, trim: true, match: /^[A-Z]{3}$/, required: true },
  unit: { type: String, trim: true, required: true },
}, options);
export const homeItemSchema = new Schema<IHomeItem>({
  key: { type: String, trim: true, required: true },
  title: { type: String, trim: true }, body: { type: String }, value: { type: String },
  iconKey: { type: String }, image: { type: Schema.Types.ObjectId, ref: "Media" },
  ctaLabel: { type: String, trim: true }, ctaUrl: { type: String, trim: true },
  data: { type: Schema.Types.Mixed, default: () => ({}) },
  isActive: { type: Boolean, default: true, required: true },
  sortOrder: { type: Number, default: 0, required: true },
}, options);
export const addressSchema = new Schema<IAddress>({
  label: { type: String, trim: true, required: true },
  line1: { type: String, trim: true, required: true },
  city: { type: String, trim: true, required: true },
  country: { type: String, trim: true, required: true },
  mapUrl: { type: String, trim: true },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
}, options);
export const socialLinkSchema = new Schema<ISocialLink>({
  platform: { type: String, trim: true, required: true },
  url: { type: String, trim: true, required: true },
  isActive: { type: Boolean, default: true, required: true },
}, options);
export const announcementSchema = new Schema<IAnnouncementBar>({
  text: { type: String, trim: true }, url: { type: String, trim: true },
  isActive: { type: Boolean, default: false, required: true },
}, options);
