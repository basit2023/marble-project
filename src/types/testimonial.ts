import type { Types } from "mongoose";
import type { IBaseContent } from "@/types/base";

export interface ITestimonial extends IBaseContent {
  clientName: string;
  clientTitle?: string;
  company?: string;
  city?: string;
  country?: string;
  rating: number;
  message: string;
  clientPhoto?: Types.ObjectId | null;
  projectRef?: Types.ObjectId | null;
  isFeatured: boolean;
}

