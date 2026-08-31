import { HomeContent, type BookCard } from '@/app/components/home-content';
import { getBooks } from 'app/db';
import { mockBooks } from 'app/lib/mock-data';

// 首页需实时反映数据库中的单词书，关掉静态预渲染
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let books: BookCard[];
  try {
    books = await getBooks();
  } catch (err) {
    // 数据库不可用时的兜底：回退到 mock 数据，保证首页可渲染
    books = mockBooks.map((b) => ({
      id: b.id,
      title: b.title,
      wordCount: b.wordCount,
      coverUrl: b.coverUrl,
      bookId: b.bookId,
      tags: b.tags ?? '',
    }));
  }

  return <HomeContent books={books} />;
}