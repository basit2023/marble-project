import "server-only";
import bcrypt from "bcryptjs";
export const BCRYPT_ROUNDS = 12;
export function hashPassword(password: string): Promise<string> { return bcrypt.hash(password, BCRYPT_ROUNDS); }
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const validHash = /^\$2[aby]\$12\$[./A-Za-z0-9]{53}$/.test(stored);
  const candidate = validHash ? stored : "$2b$12$KbQi3fMT4ji5bVvWQnO1lO3WhQYfD5zDc8Y4aKh9s7x0hQhsUJJmC";
  const result = await bcrypt.compare(password, candidate);
  return validHash && result;
}
