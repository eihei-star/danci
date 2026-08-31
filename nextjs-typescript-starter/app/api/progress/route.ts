import { NextRequest, NextResponse } from 'next/server';
import {
  ensureUserExists,
  getBookProgressList,
  recordWordProgress,
  upsertBookProgress,
} from 'app/db';

// GET /api/progress?userId= —— 当前用户的书级学习进度（按最近学习时间倒序）
// 说明：当前登录为 mock（userId 恒为 1），故由 query 传入；接入真实
// NextAuth 后应改为从会话(session)读取 userId，防止越权。
export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get('userId'));
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
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

// POST /api/progress —— 记录/更新学习进度 { userId, bookId, lastWordRank }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = Number(body?.userId);
  const bookId = String(body?.bookId ?? '');
  const lastWordRank = Number(body?.lastWordRank);
  if (
    !Number.isInteger(userId) ||
    !bookId ||
    !Number.isInteger(lastWordRank) ||
    lastWordRank < 0
  ) {
    return NextResponse.json({ error: '参数不合法' }, { status: 400 });
  }
  try {
    // 保证用户行存在（进度外键引用 "User"），再写入书级 + 词级进度
    await ensureUserExists(userId);
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