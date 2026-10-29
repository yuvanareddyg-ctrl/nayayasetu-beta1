/**
 * Authentication helpers.
 *
 * - Admin session: JWT signed with ADMIN_JWT_SECRET (HS256).
 * - Admin password: compared against ADMIN_PASSWORD_HASH (bcrypt hash stored
 *   in the environment — never in source code).
 *
 * Use the setup script to generate a hash:
 *   node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(console.log)"
 */

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const ADMIN_COOKIE = "nyayasetu_admin_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET must be set and at least 32 characters long.",
    );
  }
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
  token: string,
): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.role !== "admin") return null;
    return payload as { role: string };
  } catch {
    return null;
  }
}

/** Compare a plain-text password against the bcrypt hash in env. */
export async function verifyAdminPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error("ADMIN_PASSWORD_HASH is not configured.");
  }
  return bcrypt.compare(plain, hash);
}

/** Name of the HttpOnly session cookie. */
export { ADMIN_COOKIE };
