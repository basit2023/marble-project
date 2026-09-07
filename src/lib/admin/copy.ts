import "server-only";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import { AdminUiContent } from "@/models/admin-ui-content";
import { adminCopySchema } from "./copy-schema";
export const getAdminCopy = cache(async () => {
  await connectDB();
  const record = await AdminUiContent.findOne({ key: "admin-ui" }).activeOnly().lean();
  return record ? adminCopySchema.parse(record.copy) : null;
});
