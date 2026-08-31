"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signup" | "signin";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const signup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (signup && password !== String(data.get("confirmPassword"))) return setError("两次输入的密码不一致");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: String(data.get("name") || "").trim(), email: String(data.get("email")).trim(), password }) });
      const result = await response.json();
      if (!response.ok) return setError(result.error || "操作失败，请稍后重试");
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/books");
      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="min-h-screen bg-[#f5f7ff] lg:grid lg:grid-cols-2">
    <section className="relative hidden overflow-hidden bg-indigo-700 p-16 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10" /><div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-violet-400/20" /><div className="relative flex items-center gap-3 text-2xl font-bold"><span className="grid size-11 place-items-center rounded-xl bg-white text-indigo-700"><BookOpen /></span>词舟</div><div className="relative max-w-lg"><p className="mb-5 text-sm font-semibold tracking-[.25em] text-indigo-200">VOCABULARY STUDIO</p><h1 className="text-5xl font-bold leading-tight">让每一本单词书<br />都值得被认真学习</h1><p className="mt-7 text-lg leading-8 text-indigo-100">高效管理词库与团队协作，让优质学习内容更快抵达用户。</p></div><p className="relative text-sm text-indigo-200">© 2026 词舟单词管理平台</p></section>
    <section className="flex min-h-screen items-center justify-center p-6"><Card className="w-full max-w-md gap-0 rounded-xl border border-slate-200 py-0 shadow-xl shadow-indigo-100/60 ring-0"><CardContent className="p-8 sm:p-10"><div className="mb-8 lg:hidden"><span className="inline-flex items-center gap-2 text-xl font-bold text-indigo-700"><BookOpen />词舟</span></div><h1 className="text-3xl font-bold text-slate-900">{signup ? "创建系统管理员" : "欢迎回来"}</h1><p className="mt-2 text-sm text-slate-500">{signup ? "仅首次部署可注册，首个账户将成为系统管理员" : "登录词舟单词管理后台"}</p><form onSubmit={submit} className="mt-8 space-y-5">{signup && <div className="space-y-2"><Label htmlFor="name">管理员姓名</Label><Input id="name" name="name" required maxLength={80} className="h-11" placeholder="请输入姓名" /></div>}<div className="space-y-2"><Label htmlFor="email">邮箱地址</Label><Input id="email" name="email" required type="email" maxLength={255} className="h-11" placeholder="admin@example.com" /></div><div className="space-y-2"><Label htmlFor="password">登录密码</Label><Input id="password" name="password" required type="password" minLength={8} maxLength={128} className="h-11" placeholder="8 至 128 位密码" /></div>{signup && <div className="space-y-2"><Label htmlFor="confirmPassword">确认密码</Label><Input id="confirmPassword" name="confirmPassword" required type="password" minLength={8} maxLength={128} className="h-11" placeholder="请再次输入密码" /></div>}{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}<Button disabled={submitting} className="h-11 w-full gap-2 bg-indigo-600 px-4 shadow-sm hover:bg-indigo-700" type="submit">{submitting ? "请稍候..." : signup ? "注册并进入后台" : "登录后台"}<ChevronRight data-icon="inline-end" size={17} /></Button></form></CardContent></Card></section>
  </main>;
}
