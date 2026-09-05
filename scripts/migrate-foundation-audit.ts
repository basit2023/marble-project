import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { SystemContent } = await import("../src/models/system-content");
  const db = await connectDB();
  try {
    // The raw collection is intentional: the previous schema stored this exact string,
    // which the new ObjectId schema cannot cast. Never rewrite real User references.
    let modified = 0;
    for (const field of ["createdBy", "updatedBy"]) {
      const result = await SystemContent.collection.updateMany(
        { [field]: "system:foundation-seed" },
        { $set: { [field]: null } },
      );
      modified += result.modifiedCount;
    }
    console.info(`Foundation audit migration complete: ${modified} field updates.`);
  } finally {
    await db.disconnect();
  }
}
main().catch(() => {
  console.error("Foundation audit migration failed. Verify database access.");
  process.exitCode = 1;
});
