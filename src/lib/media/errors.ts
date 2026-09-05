import type { MediaErrorCode, MediaUsage } from "./contracts";
export class MediaApiError extends Error {
  constructor(public status: number, public code: MediaErrorCode, public usages?: MediaUsage[]) { super(code); }
}
