import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface INavigationItem extends IBaseContent {
  label: string;
  url: string;
  parentItem?: Types.ObjectId | null;
  openInNewTab: boolean;
  location: (typeof E.NAV_LOCATIONS)[number];
}

