import { z } from "zod";

const stringMap = z.record(z.string(), z.string().trim().min(1));
export const adminCopySchema = z.object({
  brand: z.string().trim().min(1),
  labels: stringMap,
  navigation: stringMap,
  modules: z.record(z.string(), z.object({
    singular: z.string().trim().min(1),
    plural: z.string().trim().min(1),
    description: z.string().trim().min(1),
  })),
  fields: stringMap,
  options: stringMap,
  errors: stringMap,
});
export type AdminCopy = z.infer<typeof adminCopySchema>;
