import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd());
async function main() {
const { connectDB } = await import("../src/lib/db");
const { SystemContent } = await import("../src/models/system-content");
const copySchema = z.object({
  key: z.enum(["foundation", "error", "notFound", "loading"]),
  heading: z.string().min(1), body: z.string().min(1), actionLabel: z.string().min(1),
  seoTitle: z.string().min(1), seoDescription: z.string().min(1),
});
// Initial database content, never imported by the UI. Existing copy is never overwritten.
const records = [
  { key: "foundation", heading: "A foundation for natural stone.", body: "Our catalogue is being prepared.", actionLabel: "Continue", seoTitle: "Natural stone catalogue", seoDescription: "A catalogue of natural stone, being prepared for launch." },
  { key: "error", heading: "Something went wrong.", body: "Please try loading this page again.", actionLabel: "Try again", seoTitle: "Page unavailable", seoDescription: "This page is temporarily unavailable." },
  { key: "notFound", heading: "Page not found.", body: "The page you requested is unavailable.", actionLabel: "Return home", seoTitle: "Page not found", seoDescription: "The requested page could not be found." },
  { key: "loading", heading: "Loading.", body: "Please wait while this page is prepared.", actionLabel: "Continue", seoTitle: "Loading", seoDescription: "This page is loading." },
];
const db = await connectDB();
try {
  for (const [sortOrder, record] of records.entries()) {
    const copy = copySchema.parse(record);
    if (await SystemContent.exists({ key: copy.key })) continue;
    await SystemContent.create({
      ...copy, sortOrder, isActive: true, isDeleted: false,
      createdBy: null, updatedBy: null,
    });
  }
  await SystemContent.createIndexes();
  console.info("Foundation content seeded.");
} finally {
  await db.disconnect();
}
}
main().catch(() => {
  console.error("Foundation seed failed. Verify environment and database connectivity.");
  process.exitCode = 1;
});
