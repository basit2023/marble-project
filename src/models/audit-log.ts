import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import type { IAuditLog } from "@/types/audit-log";
import { AUDIT_ACTIONS } from "@/types/enums";
import { auditLogValidation } from "@/lib/validation/audit-log";

const schema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
  action: { type: String, enum: AUDIT_ACTIONS, required: true, immutable: true },
  collectionName: { type: String, trim: true, required: true, immutable: true },
  documentId: { type: Schema.Types.ObjectId, immutable: true },
  changes: { type: Schema.Types.Mixed, default: () => ({}), immutable: true },
  ipAddress: { type: String, immutable: true, select: false },
}, { timestamps: { createdAt: true, updatedAt: false }, strict: "throw" });
schema.index({ createdAt: -1 });
schema.index({ collectionName: 1, documentId: 1, createdAt: -1 });
schema.index({ user: 1, createdAt: -1 });
schema.pre("validate", function () {
  const result = auditLogValidation.safeParse(this.toObject({ depopulate: true }));
  if (!result.success) for (const issue of result.error.issues) this.invalidate(issue.path.join("."), issue.message);
});
schema.pre("save", function () {
  if (!this.isNew) throw new Error("Audit logs are append-only.");
});
schema.pre(["updateOne", "updateMany", "findOneAndUpdate", "replaceOne", "findOneAndReplace", "deleteOne", "deleteMany", "findOneAndDelete"], function () {
  throw new Error("Audit logs are append-only.");
});
schema.pre("deleteOne", { document: true, query: false }, function () {
  throw new Error("Audit logs are append-only.");
});
schema.pre("bulkWrite", function () {
  throw new Error("Use create() to append audit events.");
});
export const AuditLog = (models.AuditLog as Model<IAuditLog> | undefined) ?? model<IAuditLog>("AuditLog", schema);
