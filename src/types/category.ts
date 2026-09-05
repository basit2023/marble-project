import type { Types } from "mongoose";
import type { IBaseContent, ISeo } from "@/types/base";

export interface ICategory extends IBaseContent {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  parentCategory?: Types.ObjectId | null;
  coverImage?: Types.ObjectId | null;
  iconKey?: string;
  seo: ISeo;
  isFeatured: boolean;
  showInMenu: boolean;
  showOnHomepage: boolean;
}

