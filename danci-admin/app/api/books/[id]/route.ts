import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { books, words } from "@/db/schema";
import { apiError } from "@/lib/api";
import { getCurrentAdmin } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

const bookFields = {
  id: books.id,
  title: books.title,
  wordCount: books.wordCount,
  coverUrl: books.coverUrl,
  bookId: books.bookId,
  tags: books.tags,
  createdAt: books.createdAt,
  updatedAt: books.updatedAt,
};

async function getId(context: Context) {
  const id = Number((await context.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: Context) {
  if (!(await getCurrentAdmin())) return apiError("请先登录", 401);
  const id = await getId(context);
  if (!id) return apiError("无效的单词书 ID", 400);
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : null;
  const bookId = typeof body?.bookId === "string" ? body.bookId.trim() : null;
  const wordCount = Number.isInteger(body?.wordCount) ? body.wordCount : null;
  const coverUrl = typeof body?.coverUrl === "string" ? body.coverUrl.trim() || null : null;
  const tags = typeof body?.tags === "string" ? body.tags.trim() || null : null;
  if (title !== null && (!title || title.length > 200)) return apiError("请输入有效标题", 400);
  if (bookId !== null && (!bookId || bookId.length > 100)) return apiError("请输入有效 bookId", 400);
  if (wordCount !== null && wordCount < 0) return apiError("单词数量不能为负数", 400);
  const [existing] = await db.select({ id: books.id }).from(books).where(eq(books.id, id)).limit(1);
  if (!existing) return apiError("单词书不存在", 404);
  if (bookId !== null) {
    const [duplicate] = await db.select({ id: books.id }).from(books).where(and(eq(books.bookId, bookId), ne(books.id, id))).limit(1);
    if (duplicate) return apiError("该 bookId 已存在", 409);
  }
  const values: { title?: string; bookId?: string; wordCount?: number; coverUrl?: string | null; tags?: string | null; updatedAt: Date } = { updatedAt: new Date() };
  if (title !== null) values.title = title;
  if (bookId !== null) values.bookId = bookId;
  if (wordCount !== null) values.wordCount = wordCount;
  if (coverUrl !== null) values.coverUrl = coverUrl;
  if (tags !== null) values.tags = tags;
  const [book] = await db.update(books).set(values).where(eq(books.id, id)).returning(bookFields);
  if (!book) return apiError("单词书不存在", 404);
  return Response.json({ book });
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await getCurrentAdmin())) return apiError("请先登录", 401);
  const id = await getId(context);
  if (!id) return apiError("无效的单词书 ID", 400);
  const [existing] = await db.select({ id: books.id, bookId: books.bookId }).from(books).where(eq(books.id, id)).limit(1);
  if (!existing) return apiError("单词书不存在", 404);
  const deleted = await db.transaction(async (tx) => {
    const deletedRows = await tx.delete(words).where(eq(words.bookId, existing.bookId)).returning({ id: words.id });
    await tx.delete(books).where(eq(books.id, id));
    return { deletedWords: deletedRows.length };
  });
  return Response.json({ success: true, deletedWords: deleted.deletedWords });
}
