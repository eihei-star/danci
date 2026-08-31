import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { apiError, normalizeEmail } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) return apiError("邮箱或密码不正确", 401);
  await createSession(user.id);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active } });
}
