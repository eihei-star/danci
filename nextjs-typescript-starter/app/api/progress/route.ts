import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'app/auth';
import { getBookProgressList, recordWordProgress, upsertBookProgress } from 'app/db';

// GET /api/progress —— 当前登录用户的书级学习进度（按最近学习时间倒序）
// userId 从 NextAuth 会话读取，不信任客户端传参，防越权。
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  try {
    const progress = await getBookProgressList(userId);
    return NextResponse.json({
      progress: progress.map((p) => ({
        id: p.id,
        userId: p.userId,
        bookId: p.bookId,
        learnedCount: p.learnedCount,
        lastWordRank: p.lastWordRank,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: '获取进度失败' }, { status: 500 });
  }
}

// POST /api/progress —— 记录/更新学习进度 { bookId, lastWordRank }
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const bookId = String(body?.bookId ?? '');
  const lastWordRank = Number(body?.lastWordRank);
  if (!bookId || !Number.isInteger(lastWordRank) || lastWordRank < 0) {
    return NextResponse.json({ error: '参数不合法' }, { status: 400 });
  }
  try {
    await upsertBookProgress(userId, bookId, lastWordRank, lastWordRank);
    if (lastWordRank > 0) {
      await recordWordProgress(userId, bookId, lastWordRank);
    }
    return NextResponse.json({
      progress: { userId, bookId, lastWordRank, learnedCount: lastWordRank },
    });
  } catch (err) {
    return NextResponse.json({ error: '保存进度失败' }, { status: 500 });
  }
}