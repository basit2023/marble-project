import { Schema } from "mongoose";

export const contentFields = {
  isActive: { type: Boolean, default: true, required: true, index: true },
  isDeleted: { type: Boolean, default: false, required: true, index: true },
  sortOrder: { type: Number, default: 0, required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
} as const;
// Include these fields and { timestamps: true } in every content schema.
// Actor IDs come from the authenticated session, never a submitted form.
export const publicFilter = { isActive: true, isDeleted: false } as const;
