import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUser } from 'app/db';

// POST /api/register —— 真实注册：写入 User 表（bcrypt 哈希），邮箱不可重复
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');

  if (!email || !password) {
    return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少需要 6 位' }, { status: 400 });
  }
  if (email.length > 60) {
    return NextResponse.json({ error: '邮箱过长' }, { status: 400 });
  }

  const existing = await getUser(email);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: '邮箱已存在，请直接登录' },
      { status: 409 },
    );
  }

  await createUser(email, password);
  return NextResponse.json({ ok: true });
}