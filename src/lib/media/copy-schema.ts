import { z } from "zod";
import { UPLOAD_FOLDERS, ERROR_CODES } from "./contracts";
import { MEDIA_CONTEXTS } from "@/types/enums";

export const MEDIA_LABELS = [
  "heading", "intro", "browse", "close", "libraryTab", "uploadTab", "search", "folder", "tag",
  "usageContext", "all", "state", "active", "deleted", "chooseFiles", "dropHint", "altText",
  "caption", "tags", "upload", "remove", "selected", "confirmSelection", "moveEarlier", "moveLater",
  "empty", "loading", "loadMore", "retry", "queued", "compressing", "uploading", "saving", "done",
  "edit", "save", "saved", "isActive", "sortOrder", "softDelete", "hardDelete", "confirmDelete",
  "confirmHardDelete", "cancel", "confirm", "deletionPending", "signOut", "signInHeading",
  "email", "password", "signIn", "signInFailed", "required", "invalid", "fileHint", "selectionHint",
  "selectedCount", "progress", "deleteSuccess", "filter", "total", "manageHint",
] as const;
export const mediaCopySchema = z.object({
  labels: z.record(z.enum(MEDIA_LABELS), z.string().trim().min(1)),
  errors: z.record(z.enum(ERROR_CODES), z.string().trim().min(1)),
  folders: z.record(z.enum(UPLOAD_FOLDERS), z.string().trim().min(1)),
  contexts: z.record(z.enum(MEDIA_CONTEXTS), z.string().trim().min(1)),
});
export type MediaCopy = z.infer<typeof mediaCopySchema>;

