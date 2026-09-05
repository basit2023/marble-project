import "server-only";
import { createHash } from "node:crypto";
import { SecurityLimit } from "@/models/security-limit";
import { connectDB } from "./db";
export async function withinRateLimit(subject: string, maximum: number, windowMs: number): Promise<boolean> {
  await connectDB();
  const bucket = Math.floor(Date.now() / windowMs);
  const key = createHash("sha256").update(subject + ":" + bucket).digest("hex");
  const result = await SecurityLimit.findOneAndUpdate({ _id: key }, {
    $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * windowMs) },
  }, { upsert: true, new: true });
  return result.count <= maximum;
}

