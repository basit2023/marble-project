import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IFaq extends IBaseContent {
  question: string;
  answer: string;
  category: (typeof E.FAQ_CATEGORIES)[number];
}

