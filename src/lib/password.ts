import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
const derive = (password: string, salt: Buffer) => new Promise<Buffer>((resolve, reject) => {
  scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => error ? reject(error) : resolve(key));
});
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${(await derive(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const match = /^scrypt\$([a-f\d]{32})\$([a-f\d]{128})$/.exec(stored);
  // Perform the same expensive operation even if the account/hash is absent.
  const salt = Buffer.from(match?.[1] ?? "0".repeat(32), "hex");
  const derived = await derive(password, salt);
  const expected = Buffer.from(match?.[2] ?? "0".repeat(128), "hex");
  return Boolean(match) && timingSafeEqual(derived, expected);
}

