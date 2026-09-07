import { loadEnvConfig } from "@next/env";
import { z } from "zod";
loadEnvConfig(process.cwd());

const inputSchema = z.object({
  ADMIN_NAME: z.string().trim().min(2).max(100),
  ADMIN_EMAIL: z.email().trim().toLowerCase(),
  ADMIN_PASSWORD: z.string().min(12).max(128)
    .regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).regex(/[^A-Za-z0-9]/),
});
async function main() {
  const input = inputSchema.parse(process.env);
  const [{ connectDB }, { User, AuditLog }, { hashPassword }] = await Promise.all([
    import("../src/lib/db"), import("../src/models"), import("../src/lib/password"),
  ]);
  const db = await connectDB();
  try {
    if (await User.exists({ role: "superadmin" })) throw new Error("A superadmin already exists.");
    const passwordHash = await hashPassword(input.ADMIN_PASSWORD);
    await db.connection.transaction(async (session) => {
      if (await User.exists({ role: "superadmin" }).session(session)) throw new Error("A superadmin already exists.");
      const [user] = await User.create([{
        name: input.ADMIN_NAME, email: input.ADMIN_EMAIL, passwordHash,
        role: "superadmin", forcePasswordChange: true,
        createdBy: null, updatedBy: null,
      }], { session });
      await AuditLog.create([{ user: user._id, action: "create", collectionName: "users", documentId: user._id, changes: { seeded: true, forcePasswordChange: true } }], { session });
    });
    console.info("Initial superadmin created. Sign in and change the password immediately.");
  } finally { await db.disconnect(); }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error && error.message === "A superadmin already exists."
    ? error.message : "Admin seed failed. Check environment, password strength, Atlas access and transaction support.");
  process.exitCode = 1;
});
