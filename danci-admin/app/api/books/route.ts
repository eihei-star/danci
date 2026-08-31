import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import { apiError } from "@/lib/api";
import { getCurrentAdmin } from "@/lib/auth";

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

export async function GET() {
  if (!(await getCurrentAdmin())) return apiError("请先登录", 401);
  const result = await db.select(bookFields).from(books).orderBy(asc(books.id));
  return Response.json({ books: result });
}

export async function POST(request: Request) {
  if (!(await getCurrentAdmin())) return apiError("请先登录", 401);
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const bookId = typeof body?.bookId === "string" ? body.bookId.trim() : "";
  const wordCount = Number.isInteger(body?.wordCount) ? body.wordCount : 0;
  const coverUrl = typeof body?.coverUrl === "string" ? body.coverUrl.trim() || null : null;
  const tags = typeof body?.tags === "string" ? body.tags.trim() || null : null;
  if (!title || title.length > 200) return apiError("请输入有效标题", 400);
  if (!bookId || bookId.length > 100) return apiError("请输入有效 bookId", 400);
  if (wordCount < 0) return apiError("单词数量不能为负数", 400);
  const [duplicate] = await db.select({ id: books.id }).from(books).where(eq(books.bookId, bookId)).limit(1);
  if (duplicate) return apiError("该 bookId 已存在", 409);
  const [book] = await db.insert(books).values({ title, bookId, wordCount, coverUrl, tags }).returning(bookFields);
  return Response.json({ book }, { status: 201 });
}
