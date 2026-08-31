import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { apiError, isValidEmail, normalizeEmail } from "@/lib/api";
import { requireSystemAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

type Context = { params: Promise<{ id: string }> };

async function getId(context: Context) {
  const id = Number((await context.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: Context) {
  const actor = await requireSystemAdmin();
  if (!actor) return apiError("仅系统管理员可操作", 403);
  const id = await getId(context);
  if (!id) return apiError("无效的管理员 ID", 400);
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body?.email);
  const requestedRole = body?.role === "system_admin" ? "system_admin" : body?.role === "admin" ? "admin" : null;
  const requestedActive = typeof body?.active === "boolean" ? body.active : null;
  const password = typeof body?.password === "string" ? body.password : "";
  const isSelf = id === actor.id;
  if (!name || name.length > 80 || !isValidEmail(email) || email.length > 255 || (!isSelf && (!requestedRole || requestedActive === null))) return apiError("管理员信息不完整", 400);
  if (password && (password.length < 8 || password.length > 128)) return apiError("密码长度应为 8 至 128 位", 400);
  if (isSelf && (requestedRole !== null || requestedActive !== null)) return apiError("不能修改自己的角色或状态", 400);
  const [current] = await db.select({ role: adminUsers.role, active: adminUsers.active }).from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!current) return apiError("管理员不存在", 404);
  const role = isSelf ? current.role : requestedRole!;
  const active = isSelf ? current.active : requestedActive!;
  if (current.role === "system_admin" && current.active && (role !== "system_admin" || !active)) {
    const [{ value }] = await db.select({ value: count() }).from(adminUsers).where(and(eq(adminUsers.role, "system_admin"), eq(adminUsers.active, true)));
    if (value <= 1) return apiError("必须保留至少一位启用的系统管理员", 400);
  }
  const [duplicate] = await db.select({ id: adminUsers.id }).from(adminUsers).where(and(eq(adminUsers.email, email), ne(adminUsers.id, id))).limit(1);
  if (duplicate) return apiError("该邮箱已被使用", 409);
  const values: { name: string; email: string; role: "system_admin" | "admin"; active: boolean; updatedAt: Date; passwordHash?: string } = { name, email, role, active, updatedAt: new Date() };
  if (password) values.passwordHash = await hashPassword(password);
  const [user] = await db.update(adminUsers).set(values).where(eq(adminUsers.id, id)).returning({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role, active: adminUsers.active, createdAt: adminUsers.createdAt });
  if (!user) return apiError("管理员不存在", 404);
  if (!active) await db.delete(adminSessions).where(eq(adminSessions.userId, id));
  return Response.json({ user });
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireSystemAdmin();
  if (!actor) return apiError("仅系统管理员可操作", 403);
  const id = await getId(context);
  if (!id) return apiError("无效的管理员 ID", 400);
  if (id === actor.id) return apiError("不能删除当前登录账号", 400);
  const [target] = await db.select({ role: adminUsers.role }).from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!target) return apiError("管理员不存在", 404);
  if (target.role === "system_admin") {
    const [{ value }] = await db.select({ value: count() }).from(adminUsers).where(and(eq(adminUsers.role, "system_admin"), eq(adminUsers.active, true)));
    if (value <= 1) return apiError("必须保留至少一位启用的系统管理员", 400);
  }
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return Response.json({ success: true });
}
