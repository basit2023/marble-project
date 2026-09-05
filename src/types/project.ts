import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent, ISeo } from "@/types/base";

export interface IProject extends IBaseContent {
  title: string;
  slug: string;
  client?: string;
  location: string;
  country: string;
  projectType: (typeof E.PROJECT_TYPES)[number];
  year: number;
  description: string;
  materialsUsed: Types.ObjectId[];
  finishesUsed: string[];
  coverImage?: Types.ObjectId | null;
  gallery: Types.ObjectId[];
  isFeatured: boolean;
  seo: ISeo;
}

