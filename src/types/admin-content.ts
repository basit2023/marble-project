import type { IBaseContent } from "./base";
import type { MediaCopy } from "@/lib/media/copy-schema";
export interface IAdminContent extends IBaseContent { key: "media"; copy: MediaCopy }

