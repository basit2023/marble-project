import "server-only";
import { model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IUser } from "@/types/user";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { userValidation } from "@/lib/validation/user";

const schema = createContentSchema<IUser>();
schema.add({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: E.USER_ROLES, required: true, default: "editor" },
  lastLoginAt: { type: Date },
  forcePasswordChange: { type: Boolean, default: false, required: true },
});

addZodValidation(schema, userValidation);
schema.set("toJSON", { transform: (_doc, ret) => { Reflect.deleteProperty(ret, "passwordHash"); return ret; } });
export const User = (models.User as ContentModel<IUser> | undefined)
  ?? model<IUser, ContentModel<IUser>>("User", schema);
