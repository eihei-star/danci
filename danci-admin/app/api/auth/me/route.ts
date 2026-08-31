import { getCurrentAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api";

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return apiError("未登录或会话已过期", 401);
  return Response.json({ user });
}
