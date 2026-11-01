import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { UserRole, UserSession } from "@/lib/types";

export const USER_COOKIE = "nyayasetu_user_session";
const DEFAULT_USER_SECRET = "nayayasetu-portal-user-authentication-jwt-secret-key-32chars";

function getUserJwtSecret(): Uint8Array {
  const secret = process.env.USER_JWT_SECRET || process.env.ADMIN_JWT_SECRET || DEFAULT_USER_SECRET;
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signUserToken(user: UserSession): Promise<string> {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    organization: user.organization,
    barCouncilNumber: user.barCouncilNumber,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getUserJwtSecret());
}

export async function verifyUserToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getUserJwtSecret());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      id: String(payload.sub),
      name: String(payload.name ?? ""),
      email: String(payload.email),
      role: payload.role as UserRole,
      phone: payload.phone ? String(payload.phone) : undefined,
      organization: payload.organization ? String(payload.organization) : undefined,
      barCouncilNumber: payload.barCouncilNumber ? String(payload.barCouncilNumber) : undefined,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    if (!token) return null;
    return verifyUserToken(token);
  } catch {
    return null;
  }
}

