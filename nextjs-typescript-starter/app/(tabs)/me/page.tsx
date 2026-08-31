'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProviders } from 'app/components/providers';
import { LoginPopup } from 'app/components/login-popup';
import { fetchProgress } from 'app/lib/api';
import { getBooks } from 'app/lib/mock-data';
import type { ProgressRow } from 'app/lib/mock-data';

export default function MePage() {
  const router = useRouter();
  const { user, logout } = useProviders();
  const [popupOpen, setPopupOpen] = useState(false);
  const [progressList, setProgressList] = useState<ProgressRow[]>([]);

  // 支持 /me?login=1 打开登录弹窗
  useEffect(() => {
    if (window.location.search.includes('login=1')) {
      setPopupOpen(true);
      // 清理 query，避免刷新后重复弹窗
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // 已登录：通过 API 拉取真实学习进度
  useEffect(() => {
    if (!user) {
      setProgressList([]);
      return;
    }
    let cancelled = false;
    fetchProgress(user.id)
      .then((list) => {
        if (!cancelled) setProgressList(list);
      })
      .catch(() => {
        if (!cancelled) setProgressList([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isLoggedIn = !!user;
  const books = getBooks();
  const cumulative = progressList.reduce((sum, p) => sum + p.learnedCount, 0);

  return (
    <div>
      <header className="sticky top-0 z-10 bg-gray-50 px-4 pb-2 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">我的</h1>
      </header>

      {/* 用户信息 */}
      <section className="flex items-center gap-3 bg-white px-4 py-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-100 text-2xl">
          👤
        </div>
        {isLoggedIn ? (
          <div>
            <p className="font-medium text-gray-900">{user!.email}</p>
            <p className="text-xs text-gray-400">已登录</p>
          </div>
        ) : (
          <div>
            <p className="font-medium text-gray-900">尚未登录</p>
            <p className="text-xs text-gray-400">登录后可同步学习进度</p>
          </div>
        )}
      </section>

      {/* 学习进度 */}
      {isLoggedIn && (
        <section className="mt-3 bg-white px-4 py-4">
          <h2 className="text-sm font-medium text-gray-500">学习进度</h2>
          <p className="mt-1 text-lg font-bold text-gray-900">
            累计学习单词：{cumulative}
          </p>

          {progressList.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              还没有学习记录，去首页选择一本单词书开始吧
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {progressList.map((p) => {
                const book = books.find((b) => b.bookId === p.bookId);
                if (!book) return null;
                const pct = Math.round(
                  (p.learnedCount / Math.max(1, book.wordCount)) * 100,
                );
                return (
                  <li key={p.bookId}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-gray-700">
                        📖 {book.title}
                      </span>
                      <span className="ml-2 shrink-0 text-gray-500">
                        {p.learnedCount}/{book.wordCount}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* 主操作按钮 */}
      <section className="mt-3 px-4 pb-24">
        {isLoggedIn ? (
          <button
            onClick={() => {
              logout();
              router.refresh();
            }}
            className="h-11 w-full rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            退出登录
          </button>
        ) : (
          <button
            onClick={() => setPopupOpen(true)}
            className="h-11 w-full rounded-md bg-indigo-600 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            点击登录 / 注册
          </button>
        )}
      </section>

      <LoginPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}