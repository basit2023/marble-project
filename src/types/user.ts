import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IUser extends IBaseContent {
  name: string;
  email: string;
  passwordHash: string;
  role: (typeof E.USER_ROLES)[number];
  lastLoginAt?: Date;
  forcePasswordChange: boolean;
}
