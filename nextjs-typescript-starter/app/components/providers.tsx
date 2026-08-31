'use client';

// 轻量 mock 鉴权 + 学习进度状态，使用 localStorage 持久化，
// 用于在未接入真实 NextAuth/后端前驱动 UI 流程。
// 后续接入真实接口时，仅需在本文件替换数据来源，组件无需改动。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getBook,
  getWordsByBook,
  mockProgress,
  type Book,
  type ProgressRow,
  type WordRow,
} from 'app/lib/mock-data';

export interface MockUser {
  id: number;
  email: string;
}

interface ProvidersValue {
  user: MockUser | null;
  login: (email: string, password: string) => string | null;
  register: (email: string, password: string) => string | null;
  logout: () => void;
  // 学习进度
  getProgress: (bookId: string) => ProgressRow | undefined;
  getProgressList: () => ProgressRow[];
  saveProgress: (bookId: string, lastWordRank: number, learnedCount: number) => void;
  // 学习页状态
  book: Book | undefined;
  words: WordRow[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  startLearning: (bookId: string, startIndex: number) => void;
}

const USER_KEY = 'danci.mock.user';
const PROG_KEY = 'danci.mock.progress';
const USERS_KEY = 'danci.mock.users';

// 已注册用户（用于演示「邮箱已存在」）
const REGISTERED_EMAILS = new Set(['demo@example.com']);

const Ctx = createContext<ProvidersValue | null>(null);

function readUsers(): string[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>(mockProgress);
  // 学习页状态
  const [book, setBook] = useState<Book | undefined>();
  const [words, setWords] = useState<WordRow[]>([]);
  const [currentIndex, setCurrentIndexState] = useState(0);

  // 初始化：从 localStorage 恢复
  useEffect(() => {
    const u = localStorage.getItem(USER_KEY);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        /* ignore */
      }
    }
    const p = localStorage.getItem(PROG_KEY);
    if (p) {
      try {
        setProgress(JSON.parse(p));
      } catch {
        /* ignore */
      }
    }
    setUsers(readUsers());
  }, []);

  const persistUser = useCallback((u: MockUser | null) => {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
    setUser(u);
  }, []);

  const persistProgress = useCallback((next: ProgressRow[]) => {
    localStorage.setItem(PROG_KEY, JSON.stringify(next));
    setProgress(next);
  }, []);

  const login = useCallback(
    (email: string, password: string): string | null => {
      if (!email.trim() || !password) return '请输入邮箱和密码';
      if (email === 'demo@example.com' && password !== '123456') {
        return '邮箱或密码错误';
      }
      persistUser({ id: 1, email: email.trim() });
      return null;
    },
    [persistUser],
  );

  const register = useCallback(
    (email: string, password: string): string | null => {
      if (!email.trim() || !password) return '请输入邮箱和密码';
      if (password.length < 6) return '密码至少需要 6 位';
      if (REGISTERED_EMAILS.has(email.trim()) || users.includes(email.trim())) {
        return '邮箱已存在，请直接登录';
      }
      persistUser({ id: 1, email: email.trim() });
      return null;
    },
    [users, persistUser],
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const getProgress = useCallback(
    (bookId: string) => progress.find((p) => p.bookId === bookId),
    [progress],
  );

  const getProgressList = useCallback(
    () =>
      [...progress].sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      ),
    [progress],
  );

  const saveProgress = useCallback(
    (bookId: string, lastWordRank: number, learnedCount: number) => {
      const existing = progress.find((p) => p.bookId === bookId);
      const next: ProgressRow = {
        id: existing?.id ?? Date.now(),
        userId: 1,
        bookId,
        learnedCount,
        lastWordRank,
        updatedAt: new Date().toISOString(),
      };
      persistProgress(
        existing
          ? progress.map((p) => (p.bookId === bookId ? next : p))
          : [...progress, next],
      );
    },
    [progress, persistProgress],
  );

  const setCurrentIndex = useCallback(
    (i: number) => setCurrentIndexState(i),
    [],
  );

  const startLearning = useCallback((bookId: string, startIndex: number) => {
    setBook(getBook(bookId));
    setWords(getWordsByBook(bookId));
    setCurrentIndexState(startIndex);
  }, []);

  const value: ProvidersValue = {
    user,
    login,
    register,
    logout,
    getProgress,
    getProgressList,
    saveProgress,
    book,
    words,
    currentIndex,
    setCurrentIndex,
    startLearning,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProviders(): ProvidersValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProviders 必须在 <Providers> 内使用');
  return ctx;
}