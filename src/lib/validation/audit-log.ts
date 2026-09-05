import { z } from "zod";
import { AUDIT_ACTIONS } from "@/types/enums";
import { objectId, text } from "@/lib/validation/common";
export const auditLogValidation = z.object({
  user: objectId, action: z.enum(AUDIT_ACTIONS), collectionName: text,
  documentId: objectId.nullable().optional(),
  changes: z.record(z.string(), z.unknown()),
  ipAddress: z.union([z.ipv4(), z.ipv6()]).optional(),
  createdAt: z.date().optional(),
});
