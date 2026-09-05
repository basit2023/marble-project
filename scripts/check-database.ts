import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
async function main() {
  const { connectDB } = await import("../src/lib/db");
  const db = await connectDB();
  try {
    await db.connection.db?.admin().ping();
    console.info("Environment validation and database ping passed. No records changed.");
  } finally {
    await db.disconnect();
  }
}
main().catch((error: unknown) => {
  if (error instanceof Error && error.message.startsWith("Invalid or missing environment variables:")) {
    console.error(error.message); // env.ts emits field names only, never their values.
  } else {
    console.error("Database check failed. Verify Atlas network access and database permissions.");
  }
  process.exitCode = 1;
});
