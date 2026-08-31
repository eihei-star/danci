import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { apiError, isValidEmail, normalizeEmail } from "@/lib/api";
import { requireSystemAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function GET() {
  if (!(await requireSystemAdmin())) return apiError("仅系统管理员可访问", 403);
  const users = await db.select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role, active: adminUsers.active, createdAt: adminUsers.createdAt }).from(adminUsers).orderBy(asc(adminUsers.createdAt));
  return Response.json({ users });
}

export async function POST(request: Request) {
  if (!(await requireSystemAdmin())) return apiError("仅系统管理员可操作", 403);
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role === "system_admin" ? "system_admin" : "admin";
  if (!name || name.length > 80) return apiError("请输入有效姓名", 400);
  if (!isValidEmail(email) || email.length > 255) return apiError("请输入有效邮箱", 400);
  if (password.length < 8 || password.length > 128) return apiError("密码长度应为 8 至 128 位", 400);
  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing) return apiError("该邮箱已被使用", 409);
  const [user] = await db.insert(adminUsers).values({ name, email, passwordHash: await hashPassword(password), role }).returning({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role, active: adminUsers.active, createdAt: adminUsers.createdAt });
  return Response.json({ user }, { status: 201 });
}
