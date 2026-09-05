import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IInquiry extends IBaseContent {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  inquiryType: (typeof E.INQUIRY_TYPES)[number];
  productInterest: Types.ObjectId[];
  quantity?: string;
  unit?: string;
  message: string;
  source: (typeof E.INQUIRY_SOURCES)[number];
  pageUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  status: (typeof E.INQUIRY_STATUSES)[number];
  adminNotes?: string;
  assignedTo?: Types.ObjectId | null;
  isRead: boolean;
}

