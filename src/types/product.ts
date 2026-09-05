import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent, ISeo } from "@/types/base";
import type { IPriceRange, ITechnicalSpecs } from "@/types/subdocuments";

export interface IProduct extends IBaseContent {
  name: string;
  slug: string;
  category: Types.ObjectId;
  description: string;
  origin?: string;
  colourFamily: (typeof E.COLOUR_FAMILIES)[number];
  finishes: Array<(typeof E.FINISHES)[number]>;
  availableFormats: Array<(typeof E.PRODUCT_FORMATS)[number]>;
  thicknessOptions: string[];
  sizeOptions: string[];
  applications: Array<(typeof E.APPLICATIONS)[number]>;
  technicalSpecs?: ITechnicalSpecs;
  priceRange?: IPriceRange;
  isPriceVisible: boolean;
  images: Types.ObjectId[];
  primaryImage?: Types.ObjectId | null;
  tags: string[];
  isFeatured: boolean;
  isExportAvailable: boolean;
  stockStatus: (typeof E.STOCK_STATUSES)[number];
  seo: ISeo;
}

