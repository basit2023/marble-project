import type { Types } from "mongoose";
import type { AUDIT_ACTIONS } from "@/types/enums";

// An append-only security event, not an editable public content document.
export interface IAuditLog {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: (typeof AUDIT_ACTIONS)[number];
  collectionName: string;
  documentId?: Types.ObjectId | null;
  changes: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}
