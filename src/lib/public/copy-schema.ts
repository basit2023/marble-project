import { z } from "zod";
export const publicCopySchema = z.object({
  labels: z.record(z.string(), z.string().trim().min(1)),
  footerBlurb: z.string().trim().min(1),
  copyright: z.string().trim().min(1),
});
export type PublicCopy = z.infer<typeof publicCopySchema>;
