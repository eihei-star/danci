"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminShell } from "../components/admin-shell";
import { useCurrentAdmin } from "../components/auth-guard";

type Admin = { id: number; name: string; email: string; role: "system_admin" | "admin"; active: boolean; createdAt: string };

const roleLabels = { system_admin: "系统管理员", admin: "普通管理员" } as const;
const statusLabels = { true: "启用", false: "停用" } as const;

function AdminUsersContent() {
  const current = useCurrentAdmin()!;
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin-users", { cache: "no-store" });
    if (response.ok) setAdmins((await response.json()).users);
    else setError((await response.json()).error || "加载失败");
    setLoading(false);
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/api/admin-users", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!active) return;
      if (response.ok) setAdmins(result.users);
      else setError(result.error || "加载失败");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const body = editing && editing.id === current.id
      ? { name: data.get("name"), email: data.get("email"), password: data.get("password") }
      : { name: data.get("name"), email: data.get("email"), password: data.get("password"), role: data.get("role"), active: data.get("active") !== "false" };
    const response = await fetch(editing ? `/api/admin-users/${editing.id}` : "/api/admin-users", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "保存失败");
    setOpen(false); setEditing(null); await load();
  }

  async function remove(admin: Admin) {
    if (!confirm(`确认删除管理员“${admin.name}”吗？`)) return;
    const response = await fetch(`/api/admin-users/${admin.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "删除失败");
    await load();
  }

  if (!current || current.role !== "system_admin") return <Card className="p-6 text-sm text-red-600">仅系统管理员可访问此页面。</Card>;
  return <Card className="gap-0 rounded-lg border border-slate-200 py-0 shadow-sm ring-0">
    <CardHeader className="flex flex-row items-center justify-between gap-4 rounded-none border-b border-slate-200 p-5"><div><h2 className="font-semibold">团队成员</h2><p className="mt-1 text-xs text-slate-500">共 {admins.length} 位管理员</p></div><Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) { setEditing(null); setError(""); } }}><DialogTrigger render={<Button onClick={() => setEditing(null)} className="h-10 gap-2 bg-indigo-600 px-4 hover:bg-indigo-700" />}><Plus size={17} />添加管理员</DialogTrigger><DialogContent className="max-w-md gap-0 rounded-lg p-6"><DialogHeader><DialogTitle>{editing ? "编辑管理员" : "添加管理员"}</DialogTitle><DialogDescription className="sr-only">填写管理员账号资料与权限</DialogDescription></DialogHeader><form key={editing?.id ?? "new"} onSubmit={save} className="mt-6 space-y-4"><div><Label htmlFor="admin-name" className="sr-only">姓名</Label><Input id="admin-name" name="name" required maxLength={80} defaultValue={editing?.name} placeholder="管理员姓名" /></div><div><Label htmlFor="admin-email" className="sr-only">邮箱</Label><Input id="admin-email" name="email" required type="email" maxLength={255} defaultValue={editing?.email} placeholder="邮箱地址" /></div><div><Label htmlFor="admin-password" className="sr-only">密码</Label><Input id="admin-password" name="password" required={!editing} type="password" minLength={8} maxLength={128} placeholder={editing ? "留空则不修改密码" : "初始密码（至少 8 位）"} /></div>{editing?.id === current.id ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">当前账号的角色和状态不可修改</p> : <><div><Label htmlFor="admin-role" className="sr-only">角色</Label><Select name="role" defaultValue={editing?.role ?? "admin"}><SelectTrigger id="admin-role" className="w-full"><SelectValue placeholder="选择角色" /></SelectTrigger><SelectContent><SelectItem value="admin">{roleLabels.admin}</SelectItem><SelectItem value="system_admin">{roleLabels.system_admin}</SelectItem></SelectContent></Select></div>{editing && <div><Label htmlFor="admin-active" className="sr-only">状态</Label><Select name="active" defaultValue={String(editing.active)}><SelectTrigger id="admin-active" className="w-full"><SelectValue placeholder="选择状态" /></SelectTrigger><SelectContent><SelectItem value="true">{statusLabels.true}</SelectItem><SelectItem value="false">{statusLabels.false}</SelectItem></SelectContent></Select></div>}</>}{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}<DialogFooter><DialogClose render={<Button type="button" variant="outline" />}>取消</DialogClose><Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">确认保存</Button></DialogFooter></form></DialogContent></Dialog></CardHeader>
    <CardContent className="divide-y divide-slate-100 p-0">{error && !open && <p className="m-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}{loading ? <p className="p-5 text-sm text-slate-500">加载中...</p> : admins.map((admin) => <div key={admin.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><Avatar className="size-11 border-0 after:border-0"><AvatarFallback className="bg-indigo-100 font-semibold text-indigo-700">{admin.name[0]}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="font-medium">{admin.name}</p><p className="truncate text-xs text-slate-400">{admin.email} · 加入于 {new Date(admin.createdAt).toLocaleDateString("zh-CN")}</p></div><span className="text-sm text-slate-500">{roleLabels[admin.role]}</span><Badge className={admin.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}>{admin.active ? statusLabels.true : statusLabels.false}</Badge><Button variant="ghost" size="icon-sm" aria-label={`编辑${admin.name}`} onClick={() => { setEditing(admin); setOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={16} /></Button>{admin.id !== current.id && <Button variant="ghost" size="icon-sm" aria-label={`删除${admin.name}`} onClick={() => remove(admin)} className="text-slate-400 hover:text-red-500"><Trash2 size={17} /></Button>}</div>)}</CardContent>
  </Card>;
}

export default function AdminUsersPage() {
  return <AdminShell title="管理员管理" description="管理后台成员及其访问权限。"><AdminUsersContent /></AdminShell>;
}
