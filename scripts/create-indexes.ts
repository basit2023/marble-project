import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
async function main() {
  const { connectDB } = await import("../src/lib/db");
  const registry = await import("../src/models");
  const db = await connectDB();
  try {
    // createIndexes adds declared indexes; unlike syncIndexes it never drops existing ones.
    for (const model of Object.values(registry)) {
      await model.createIndexes();
      console.info(`Indexes ready: ${model.modelName}`);
    }
  } finally {
    await db.disconnect();
  }
}
main().catch(() => {
  console.error("Index creation failed. Check duplicate keys and database index permissions.");
  process.exitCode = 1;
});

