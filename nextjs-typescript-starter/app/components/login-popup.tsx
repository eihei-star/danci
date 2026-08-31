'use client';

import { useEffect, useState } from 'react';
import { useProviders } from 'app/components/providers';

export function LoginPopup({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { login, register } = useProviders();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      // 弹出时让 Tab 栏共享表单，清空遗留输入便于切换演示
      setPassword('');
    }
  }, [tab, open]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  };

  const submit = () => {
    const err = tab === 'login' ? login(email, password) : register(email, password);
    if (err) {
      setError(err);
      return;
    }
    reset();
    onSuccess?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">登录 / 注册</h3>
          <button
            onClick={reset}
            aria-label="关闭"
            className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* 登录/注册 Tab */}
        <div className="mt-4 flex">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-2 text-base font-medium transition-colors ${
                tab === t
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'border-b border-gray-200 text-gray-400'
              }`}
            >
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="block text-xs text-gray-500 uppercase">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-md bg-indigo-600 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {tab === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          演示账号：demo@example.com / 123456
        </p>
      </div>
    </div>
  );
}