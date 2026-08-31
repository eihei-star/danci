import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";

export const SESSION_COOKIE = "cizhou_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await db.insert(adminSessions).values({ tokenHash: hashToken(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [result] = await db.select({
    id: adminUsers.id,
    name: adminUsers.name,
    email: adminUsers.email,
    role: adminUsers.role,
    active: adminUsers.active,
  }).from(adminSessions).innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id)).where(and(
    eq(adminSessions.tokenHash, hashToken(token)),
    gt(adminSessions.expiresAt, new Date()),
    eq(adminUsers.active, true),
  )).limit(1);
  return result ?? null;
}

export async function requireSystemAdmin() {
  const user = await getCurrentAdmin();
  return user?.role === "system_admin" ? user : null;
}
