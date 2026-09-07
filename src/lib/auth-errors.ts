export class AuthError extends Error {
  constructor(public status: 401 | 403, public code: "UNAUTHORIZED" | "FORBIDDEN" | "PASSWORD_CHANGE_REQUIRED") {
    super(code);
  }
}
