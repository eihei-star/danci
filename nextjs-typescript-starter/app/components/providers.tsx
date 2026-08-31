'use client';

// 真实认证：直接调用 NextAuth 的 REST 端点（CSRF → credentials 回调 → 读取会话）。
// 不使用 next-auth/react 的 signIn（其在 5.0.0-beta.4 下会抛
// "Failed to construct 'URL': Invalid base URL"，服务端实际正常，故在此手动封装）。
// 登录态基于 httpOnly 会话 cookie，刷新页面可通过 /api/auth/session 恢复。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface MockUser {
  id: number;
  email: string;
}

interface ProvidersValue {
  user: MockUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const Ctx = createContext<ProvidersValue | null>(null);

async function getCsrfToken(): Promise<string> {
  const r = await fetch('/api/auth/csrf');
  const d = await r.json();
  return d.csrfToken;
}

// 发起 credentials 登录回调（浏览器会自动带上 csrf cookie，成功后种下会话 cookie）
async function postCredentials(email: string, password: string) {
  const csrfToken = await getCsrfToken();
  await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      csrfToken,
      email,
      password,
      redirect: false,
      json: true,
    }),
  });
}

// 读取当前会话用户
async function fetchSessionUser(): Promise<MockUser | null> {
  const r = await fetch('/api/auth/session');
  const d = await r.json();
  if (d?.user?.id) {
    return { id: Number(d.user.id), email: String(d.user.email ?? '') };
  }
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading');

  // 初始化：从会话恢复登录态（刷新页面后仍保持登录）
  useEffect(() => {
    let cancelled = false;
    fetchSessionUser()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus(u ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (!cancelled) setStatus('unauthenticated');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        await postCredentials(email, password);
        const u = await fetchSessionUser();
        if (!u) return '邮箱或密码错误';
        setUser(u);
        setStatus('authenticated');
        return null;
      } catch {
        return '邮箱或密码错误';
      }
    },
    [],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const r = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) return data?.error || '注册失败';
        // 注册成功则自动登录
        await postCredentials(email, password);
        const u = await fetchSessionUser();
        if (!u) return '注册成功，但自动登录失败，请手动登录';
        setUser(u);
        setStatus('authenticated');
        return null;
      } catch {
        return '网络错误，请稍后重试';
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csrfToken, json: true }),
      });
    } catch {
      /* 忽略退出接口异常 */
    }
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <Ctx.Provider value={{ user, status, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProviders(): ProvidersValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProviders 必须在 <Providers> 内使用');
  return ctx;
}