import type { Types } from "mongoose";

export interface ITechnicalSpecs {
  density?: number;
  waterAbsorption?: number;
  compressiveStrength?: number;
  flexuralStrength?: number;
  abrasionResistance?: string;
}
export interface IPriceRange {
  min: number;
  max: number;
  currency: string;
  unit: string;
}
export interface IHomeItem {
  key: string;
  title?: string;
  body?: string;
  value?: string;
  iconKey?: string;
  image?: Types.ObjectId | null;
  ctaLabel?: string;
  ctaUrl?: string;
  data: Record<string, string | number | boolean | string[]>;
  isActive: boolean;
  sortOrder: number;
}
export interface IAddress {
  label: string;
  line1: string;
  city: string;
  country: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
}
export interface ISocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}
export interface IAnnouncementBar {
  text?: string;
  url?: string;
  isActive: boolean;
}
