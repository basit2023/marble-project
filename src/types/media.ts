import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IMedia extends IBaseContent {
  cloudinaryPublicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  version?: number;
  deletionStatus?: "none" | "pending";
  altText: string;
  caption?: string;
  title?: string;
  folder?: string;
  tags: string[];
  usageContext: (typeof E.MEDIA_CONTEXTS)[number];
  blurDataUrl?: string;
  uploadedBy: Types.ObjectId;
}
