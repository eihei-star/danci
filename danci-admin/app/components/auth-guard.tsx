"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type CurrentAdmin = { id: number; name: string; email: string; role: "system_admin" | "admin"; active: boolean };
const AuthContext = createContext<CurrentAdmin | null>(null);

export function useCurrentAdmin() {
  return useContext(AuthContext);
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (active) setUser(data.user);
    }).catch(() => {
      if (active) router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [pathname, router]);

  if (loading || !user) return <div className="min-h-screen bg-slate-50" />;
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
