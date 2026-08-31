'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useProviders } from 'app/components/providers';
import { WordCard } from 'app/components/word-card';
import { getBook } from 'app/lib/mock-data';

export default function LearningPage() {
  const params = useParams();
  const bookId = String(params.bookId);
  const router = useRouter();
  const {
    user,
    words,
    currentIndex,
    setCurrentIndex,
    saveProgress,
    getProgress,
    startLearning,
  } = useProviders();
  const [completed, setCompleted] = useState(false);

  const isLoggedIn = !!user;

  // 未登录：重定向到「我的」Tab 并弹出登录弹窗
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/me?login=1');
      return;
    }
    const p = getProgress(bookId);
    startLearning(bookId, p ? p.lastWordRank : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, isLoggedIn]);

  const book = getBook(bookId);
  const currentWord = words[currentIndex];

  const next = () => {
    if (!book) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= words.length) {
      // 已学完：以当前词为最后进度
      saveProgress(book.bookId, currentWord?.wordRank ?? 0, currentWord?.wordRank ?? 0);
      setCurrentIndex(nextIndex);
      setCompleted(true);
      return;
    }
    const nextWord = words[nextIndex];
    setCurrentIndex(nextIndex);
    saveProgress(book.bookId, nextWord.wordRank, nextWord.wordRank);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex min-h-screen flex-col pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {/* 顶部：返回 + 书名 + 进度 */}
      <header className="flex items-center gap-3 bg-gray-50 px-4 py-4">
        <Link
          href="/"
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full bg-white text-gray-600 shadow-sm"
        >
          ←
        </Link>
        <div className="flex-1">
          <p className="text-base font-semibold text-gray-900">
            {book?.title ?? '单词书'}
          </p>
        </div>
        <span className="text-sm text-gray-400">
          {currentWord ? `${currentWord.wordRank} / ${book?.wordCount ?? 0}` : '--'}
        </span>
      </header>

      <main className="flex flex-1 flex-col px-4 pt-2">
        {completed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-4xl">🎉</p>
            <p className="text-lg font-semibold text-gray-900">本书已学完</p>
            <p className="text-sm text-gray-400">
              已记住这本书的全部单词，太棒了！
            </p>
            <Link
              href="/"
              className="mt-2 h-11 rounded-full bg-indigo-600 px-6 text-sm font-medium text-white"
            >
              返回首页
            </Link>
          </div>
        ) : currentWord ? (
          <WordCard
            word={currentWord}
            onOpenDetail={() =>
              router.push(`/words/${bookId}/${currentWord.wordRank}`)
            }
            onNext={next}
            isLast={currentIndex >= words.length - 1}
          />
        ) : null}
      </main>
    </div>
  );
}