import type { IBaseContent } from "./base";
import type { PublicCopy } from "@/lib/public/copy-schema";
export interface IPublicUiContent extends IBaseContent { key: "public-ui"; copy: PublicCopy }
