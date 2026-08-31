'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProviders } from 'app/components/providers';
import { fetchProgress } from 'app/lib/api';
import type { ProgressRow } from 'app/lib/mock-data';

// 首页所需的最小单词书结构（与 books 表物理列对应）
export interface BookCard {
  id: number | string;
  title: string;
  wordCount: number;
  coverUrl: string;
  bookId: string;
  tags?: string;
}

export function HomeContent({ books }: { books: BookCard[] }) {
  const router = useRouter();
  const { user } = useProviders();
  const [recent, setRecent] = useState<ProgressRow | null>(null);

  const isLoggedIn = !!user;

  // 已登录：通过 API 拉取真实学习进度，取最近学习的一本
  useEffect(() => {
    if (!user) {
      setRecent(null);
      return;
    }
    let cancelled = false;
    fetchProgress()
      .then((list) => {
        if (!cancelled) setRecent(list.length > 0 ? list[0] : null);
      })
      .catch(() => {
        if (!cancelled) setRecent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const openBook = (book: BookCard) => {
    if (!isLoggedIn) {
      // 未登录：切换到「我的」Tab 并弹出登录弹窗
      router.push('/me?login=1');
      return;
    }
    // 学习页通过 bookId 拉取真实单词并计算续学位置
    router.push(`/books/${book.bookId}`);
  };

  return (
    <div>
      <header className="sticky top-0 z-10 bg-gray-50 px-4 pb-2 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">单词书</h1>
      </header>

      <main className="px-4">
        {/* 最近学习：仅已登录且有数据时展示 */}
        {recent && (
          <section className="mt-2">
            <h2 className="mb-2 text-sm font-medium text-gray-500">
              ★ 最近学习
            </h2>
            <RecentLearning
              recent={recent}
              books={books}
              onContinue={openBook}
            />
          </section>
        )}

        <section className="mt-4">
          <h2 className="mb-2 text-sm font-medium text-gray-500">
            全部单词书
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {books.map((book) => (
              <button
                key={book.bookId}
                onClick={() => openBook(book)}
                className="overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-gray-100 active:scale-[0.98]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-base font-semibold text-gray-900">
                    {book.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {book.wordCount} 词
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function RecentLearning({
  recent,
  books,
  onContinue,
}: {
  recent: ProgressRow;
  books: BookCard[];
  onContinue: (book: BookCard) => void;
}) {
  const book = books.find((b) => b.bookId === recent.bookId);
  if (!book) return null;
  return (
    <button
      onClick={() => onContinue(book)}
      className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-gray-100 active:scale-[0.99]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={book.coverUrl}
        alt={book.title}
        className="h-full max-h-14 w-20 shrink-0 rounded-lg bg-gray-100 object-contain"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-gray-900">
          📖 {book.title}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          已学习 {recent.learnedCount} / {book.wordCount} 词
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">
        继续学习 →
      </span>
    </button>
  );
}