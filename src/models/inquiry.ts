import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IInquiry } from "@/types/inquiry";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { inquiryValidation } from "@/lib/validation/inquiry";

const schema = createContentSchema<IInquiry>();
schema.add({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  country: { type: String, trim: true },
  company: { type: String, trim: true },
  inquiryType: { type: String, enum: E.INQUIRY_TYPES, required: true },
  productInterest: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  quantity: { type: String, trim: true },
  unit: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  source: { type: String, enum: E.INQUIRY_SOURCES, required: true },
  pageUrl: { type: String, trim: true },
  ipAddress: { type: String, select: false },
  userAgent: { type: String, select: false },
  status: { type: String, enum: E.INQUIRY_STATUSES, required: true, default: "New" },
  adminNotes: { type: String, select: false },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  isRead: { type: Boolean, default: false, required: true },
});

addZodValidation(schema, inquiryValidation);
schema.index({ status: 1, createdAt: -1 });
schema.index({ assignedTo: 1, isRead: 1 });
export const Inquiry = (models.Inquiry as ContentModel<IInquiry> | undefined)
  ?? model<IInquiry, ContentModel<IInquiry>>("Inquiry", schema);

