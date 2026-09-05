import type { IBaseContent } from "@/types/base";
import type { ScreenKey } from "@/types/content";
export interface ISystemContent extends IBaseContent {
  key: ScreenKey;
  heading: string;
  body: string;
  actionLabel: string;
  seoTitle: string;
  seoDescription: string;
}

