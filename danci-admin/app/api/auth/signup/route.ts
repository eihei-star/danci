import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { apiError, isValidEmail, normalizeEmail } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!name || name.length > 80) return apiError("请输入有效的管理员姓名", 400);
  if (!isValidEmail(email) || email.length > 255) return apiError("请输入有效的邮箱地址", 400);
  if (password.length < 8 || password.length > 128) return apiError("密码长度应为 8 至 128 位", 400);

  const [{ value }] = await db.select({ value: count() }).from(adminUsers);
  if (value > 0) return apiError("首次注册已完成，请联系系统管理员添加账号", 403);
  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing) return apiError("该邮箱已被使用", 409);

  const [user] = await db.insert(adminUsers).values({ name, email, passwordHash: await hashPassword(password), role: "system_admin" }).returning({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role, active: adminUsers.active });
  await createSession(user.id);
  return Response.json({ user }, { status: 201 });
}
