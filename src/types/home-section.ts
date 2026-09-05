import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";
import type { IHomeItem } from "@/types/subdocuments";

export interface IHomeSection extends IBaseContent {
  sectionKey: (typeof E.HOME_SECTION_KEYS)[number];
  heading?: string;
  subheading?: string;
  eyebrowLabel?: string;
  bodyText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: Types.ObjectId | null;
  items: IHomeItem[];
}

