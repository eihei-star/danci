"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CircleUserRound, LogOut, Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AuthGuard, CurrentAdmin, useCurrentAdmin } from "./auth-guard";

const navigation = [
  { href: "/books", label: "单词书管理", icon: BookOpen },
  { href: "/admin-user", label: "管理员管理", icon: Users, systemOnly: true },
];

function SidebarContent({ pathname, user, onNavigate, onLogout }: { pathname: string; user: CurrentAdmin; onNavigate?: () => void; onLogout: () => void }) {
  const items = navigation.filter((item) => !item.systemOnly || user.role === "system_admin");
  return <>
    <div className="flex h-18 items-center border-b border-white/10 px-6"><span className="flex items-center gap-3 text-xl font-bold text-white"><span className="grid size-9 place-items-center rounded-lg bg-indigo-600"><BookOpen size={20} /></span>词舟</span></div>
    <nav className="flex-1 space-y-1 p-4">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={onNavigate} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${pathname === href ? "bg-indigo-600 text-white" : "hover:bg-white/5 hover:text-white"}`}><Icon size={19} />{label}</Link>)}</nav>
    <div className="border-t border-white/10 p-4"><div className="mb-3 flex items-center gap-3 px-2"><CircleUserRound size={34} /><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{user.name}</p><p className="truncate text-xs text-slate-500" title={user.email}>{user.email}</p></div></div><Button onClick={onLogout} variant="ghost" className="h-9 w-full justify-start gap-2 px-3 text-slate-300 hover:bg-white/5 hover:text-white"><LogOut size={17} />退出登录</Button></div>
  </>;
}

function Shell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentAdmin()!;
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/signin");
    router.refresh();
  }

  return <div className="min-h-screen bg-slate-50 text-slate-800">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#171b2e] text-slate-300 lg:flex"><SidebarContent pathname={pathname} user={user} onLogout={logout} /></aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-18 items-center border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8"><div className="lg:hidden"><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger render={<Button variant="ghost" size="icon" aria-label="打开菜单" className="mr-3" />}><Menu /></SheetTrigger><SheetContent side="left" className="w-64 gap-0 border-0 bg-[#171b2e] p-0 text-slate-300 sm:max-w-64"><SheetTitle className="sr-only">管理菜单</SheetTitle><SheetDescription className="sr-only">词舟管理后台导航</SheetDescription><SidebarContent pathname={pathname} user={user} onNavigate={() => setMobileOpen(false)} onLogout={logout} /></SheetContent></Sheet></div><div><h1 className="font-semibold text-slate-900">{title}</h1><p className="hidden text-xs text-slate-500 sm:block">{description}</p></div></header><main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main></div>
  </div>;
}

export function AdminShell(props: { children: React.ReactNode; title: string; description: string }) {
  return <AuthGuard><Shell {...props} /></AuthGuard>;
}
