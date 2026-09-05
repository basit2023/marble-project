import type { Types } from "mongoose";
import type { IBaseContent, ISeo } from "@/types/base";

export interface IExhibition extends IBaseContent {
  name: string;
  slug: string;
  venue: string;
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  description: string;
  coverImage?: Types.ObjectId | null;
  gallery: Types.ObjectId[];
  seo: ISeo;
  readonly isUpcoming: boolean;
}

