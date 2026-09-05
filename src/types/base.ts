import type { Types } from "mongoose";

export interface IBaseContent {
  _id: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  sortOrder: number;
  // Null identifies bootstrap/system writes before an administrator exists.
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface ISeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  ogImage?: Types.ObjectId | null;
  canonicalUrl?: string;
  noIndex: boolean;
}

