import type { IBaseContent } from "./base";
import type { AdminCopy } from "@/lib/admin/copy-schema";
export interface IAdminUiContent extends IBaseContent { key: "admin-ui"; copy: AdminCopy }
