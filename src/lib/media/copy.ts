import "server-only";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import { AdminContent } from "@/models/admin-content";
import { mediaCopySchema } from "./copy-schema";

export const getMediaCopy = cache(async () => {
  await connectDB();
  const record = await AdminContent.findOne({ key: "media" }).activeOnly().lean();
  return record ? mediaCopySchema.parse(record.copy) : null;
});

