import { NextResponse } from 'next/server';
import { getBookByBookId, getWordsByBook } from 'app/db';

// GET /api/books/[bookId]/words —— 获取某本单词书的全部单词（按 wordRank 升序）
export async function GET(
  _req: Request,
  { params }: { params: { bookId: string } },
) {
  const bookId = params.bookId;
  try {
    const [book, words] = await Promise.all([
      getBookByBookId(bookId),
      getWordsByBook(bookId),
    ]);
    return NextResponse.json({
      bookId,
      book: book ? { title: book.title, wordCount: book.wordCount } : null,
      words: words.map((w) => ({
        id: w.id,
        wordRank: w.wordRank,
        headWord: w.headWord,
        content: w.content,
        bookId: w.bookId,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: '获取单词失败' }, { status: 500 });
  }
}