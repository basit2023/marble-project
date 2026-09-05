import type { Types } from "mongoose";
import type { IBaseContent, ISeo } from "@/types/base";
import type { IAddress, ISocialLink, IAnnouncementBar } from "@/types/subdocuments";

export interface ISiteSettings extends IBaseContent {
  singletonKey: "site";
  siteName: string;
  tagline?: string;
  logo?: Types.ObjectId | null;
  logoLight?: Types.ObjectId | null;
  favicon?: Types.ObjectId | null;
  phone: string[];
  whatsappNumber?: string;
  email: string[];
  addresses: IAddress[];
  businessHours?: string;
  socialLinks: ISocialLink[];
  defaultSeo: ISeo;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  whatsappDefaultMessage?: string;
  maintenanceMode: boolean;
  announcementBar: IAnnouncementBar;
}

