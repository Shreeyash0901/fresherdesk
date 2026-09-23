import { createHash, randomBytes, pbkdf2Sync } from "node:crypto";

/**
 * Hash a password using PBKDF2 with SHA-256 and a random salt.
 * Format: iterations$salt$hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const iterations = 10000;
  const hash = pbkdf2Sync(password, salt, iterations, 64, "sha256").toString("hex");
  return `${iterations}$${salt}$${hash}`;
}

/**
 * Verify a plain password against the stored hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 3) return false;
    const iterations = parseInt(parts[0], 10);
    const salt = parts[1];
    const originalHash = parts[2];
    const hash = pbkdf2Sync(password, salt, iterations, 64, "sha256").toString("hex");
    return hash === originalHash;
  } catch {
    return false;
  }
}
