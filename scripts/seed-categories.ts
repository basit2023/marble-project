import { loadEnvConfig } from "@next/env";
import { slugify } from "../src/lib/utils";

loadEnvConfig(process.cwd());
const names = ["Marble", "Granite", "Onyx", "Travertine", "Limestone", "Quartz", "Quartzite", "Sandstone", "Slate", "Porcelain"];

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { Category } = await import("../src/models");
  const db = await connectDB();
  try {
    // Build uniqueness before seeding so simultaneous runs cannot create duplicate slugs.
    await Category.createIndexes();
    let inserted = 0;
    for (const [sortOrder, name] of names.entries()) {
      const slug = slugify(name);
      if (await Category.exists({ slug })) continue; // Preserve inactive/deleted records too.
      try {
        await Category.create({
          name, slug, description: `Explore our ${name.toLowerCase()} collection.`,
          sortOrder, createdBy: null, updatedBy: null,
          seo: { metaTitle: name, metaDescription: `Explore our ${name.toLowerCase()} collection.` },
        });
        inserted++;
      } catch (error: unknown) {
        if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) throw error;
      }
    }
    console.info(`Category seed complete: ${inserted} inserted. Existing records preserved.`);
  } finally {
    await db.disconnect();
  }
}
main().catch(() => {
  console.error("Category seed failed. Verify database connectivity and index permissions.");
  process.exitCode = 1;
});

