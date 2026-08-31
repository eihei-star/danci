'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useProviders } from 'app/components/providers';
import { WordCard } from 'app/components/word-card';
import { fetchProgress, fetchWords, saveProgress } from 'app/lib/api';
import type { WordRow } from 'app/lib/mock-data';

export default function LearningPage() {
  const params = useParams();
  const bookId = String(params.bookId);
  const router = useRouter();
  const { user } = useProviders();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookWordCount, setBookWordCount] = useState(0);
  const [words, setWords] = useState<WordRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const isLoggedIn = !!user;

  // 未登录：重定向到「我的」Tab 并弹出登录弹窗
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/me?login=1');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [data, progress] = await Promise.all([
          fetchWords(bookId),
          fetchProgress(),
        ]);
        if (cancelled) return;
        setWords(data.words);
        setBookTitle(data.book?.title ?? '单词书');
        setBookWordCount(data.book?.wordCount ?? data.words.length);
        const mine = progress.find((p) => p.bookId === bookId);
        // 上次学到 lastWordRank，下一次从该词的下一张开始（index = lastWordRank）
        setCurrentIndex(mine ? mine.lastWordRank : 0);
      } catch (e) {
        if (!cancelled) setError('加载单词失败，请稍后重试');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, isLoggedIn]);

  const currentWord = words[currentIndex];

  const persist = (word: WordRow) => {
    saveProgress(bookId, word.wordRank).catch(() => {
      /* 进度保存失败不阻断切词，下次会重试 */
    });
  };

  const next = () => {
    if (!currentWord) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= words.length) {
      // 已学完：以当前词为最后进度
      persist(currentWord);
      setCompleted(true);
      return;
    }
    const nextWord = words[nextIndex];
    setCurrentIndex(nextIndex);
    persist(nextWord);
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
            {loading ? '加载中…' : bookTitle}
          </p>
        </div>
        <span className="text-sm text-gray-400">
          {currentWord
            ? `${currentWord.wordRank} / ${bookWordCount}`
            : loading
              ? '--'
              : '0 / 0'}
        </span>
      </header>

      <main className="flex flex-1 flex-col px-4 pt-2">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            加载单词…
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg font-semibold text-gray-900">{error}</p>
            <Link
              href="/"
              className="mt-2 h-11 rounded-full bg-indigo-600 px-6 text-sm font-medium text-white"
            >
              返回首页
            </Link>
          </div>
        ) : completed ? (
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
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            本书暂无单词
          </div>
        )}
      </main>
    </div>
  );
}