/**
 * Authentication helpers for Admin.
 *
 * - Admin session: JWT signed with ADMIN_JWT_SECRET (HS256).
 * - Admin password: compared against ADMIN_PASSWORD_HASH (bcrypt hash stored
 *   in the environment — never in source code).
 */

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const ADMIN_COOKIE = "nyayasetu_admin_session";
const DEFAULT_SECRET = "nayayasetu-institutional-super-secure-jwt-signing-secret-key-2026";
const DEFAULT_ADMIN_HASH = "$2b$10$kgJxLgDWyZ4g8UzWZTDbIOD0To.vuz1Qp2zN6dS3eBMYAGGELK/se"; // AdminPass123!

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

/** Sign a 24-hour admin JWT. */
export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

/** Verify an admin JWT. Returns the payload or null on failure. */
export async function verifyAdminToken(
  token: string
): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.role !== "admin") return null;
    return payload as { role: string };
  } catch {
    return null;
  }
}

/** Compare a plain-text password against the bcrypt hash in env or safe fallback. */
export async function verifyAdminPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;
  return bcrypt.compare(plain, hash);
}

export { ADMIN_COOKIE };
