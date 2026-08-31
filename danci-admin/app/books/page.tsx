"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminShell } from "../components/admin-shell";

type Book = { id: number; title: string; wordCount: number; coverUrl: string | null; bookId: string; tags: string | null; createdAt: string; updatedAt: string };

function BooksContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/books", { cache: "no-store" });
    if (response.ok) setBooks((await response.json()).books);
    else setError((await response.json()).error || "加载失败");
    setLoading(false);
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/api/books", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!active) return;
      if (response.ok) setBooks(result.books);
      else setError(result.error || "加载失败");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const body = {
      title: data.get("title"),
      wordCount: Number(data.get("wordCount")) || 0,
      coverUrl: data.get("coverUrl"),
      bookId: data.get("bookId"),
      tags: data.get("tags"),
    };
    const response = await fetch(editing ? `/api/books/${editing.id}` : "/api/books", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "保存失败");
    setOpen(false); setEditing(null); await load();
  }

  async function remove(book: Book) {
    if (!confirm(`确认删除单词书“${book.title}”吗？该操作将同时删除该单词书（bookId: ${book.bookId}）下的所有单词。`)) return;
    const response = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "删除失败");
    await load();
  }

  return <Card className="gap-0 rounded-lg border border-slate-200 py-0 shadow-sm ring-0">
    <CardHeader className="flex flex-col gap-4 rounded-none border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-semibold">全部单词书</h2><p className="mt-1 text-xs text-slate-500">共 {books.length} 本单词书</p></div>
      <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) { setEditing(null); setError(""); } }}>
        <DialogTrigger render={<Button onClick={() => setEditing(null)} className="h-10 gap-2 bg-indigo-600 px-4 shadow-sm hover:bg-indigo-700" />}><Plus size={17} />新增单词书</DialogTrigger>
        <DialogContent className="max-w-md gap-0 rounded-lg p-6">
          <DialogHeader><DialogTitle className="text-lg font-semibold">{editing ? "编辑单词书" : "新增单词书"}</DialogTitle><DialogDescription className="sr-only">填写单词书标题、单词数量、封面、bookId 与标签</DialogDescription></DialogHeader>
          <form key={editing?.id ?? "new"} onSubmit={save} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label htmlFor="book-title" className="text-sm font-medium text-slate-700">标题</Label><Input id="book-title" name="title" required maxLength={200} defaultValue={editing?.title} className="h-10 border-slate-200 bg-white px-3 focus-visible:border-indigo-500 focus-visible:ring-indigo-100" placeholder="如：人教版小学英语三年级上册" /></div>
            <div className="space-y-1.5"><Label htmlFor="book-word-count" className="text-sm font-medium text-slate-700">单词数量</Label><Input id="book-word-count" name="wordCount" required type="number" min={0} defaultValue={editing?.wordCount ?? 0} className="h-10 border-slate-200 bg-white px-3 focus-visible:border-indigo-500 focus-visible:ring-indigo-100" placeholder="0" /></div>
            <div className="space-y-1.5"><Label htmlFor="book-cover" className="text-sm font-medium text-slate-700">封面 URL</Label><Input id="book-cover" name="coverUrl" type="url" maxLength={500} defaultValue={editing?.coverUrl ?? ""} className="h-10 border-slate-200 bg-white px-3 focus-visible:border-indigo-500 focus-visible:ring-indigo-100" placeholder="https://..." /></div>
            <div className="space-y-1.5"><Label htmlFor="book-book-id" className="text-sm font-medium text-slate-700">bookId</Label><Input id="book-book-id" name="bookId" required maxLength={100} defaultValue={editing?.bookId} className="h-10 border-slate-200 bg-white px-3 focus-visible:border-indigo-500 focus-visible:ring-indigo-100" placeholder="如：PEPXiaoXue3_1" /></div>
            <div className="space-y-1.5"><Label htmlFor="book-tags" className="text-sm font-medium text-slate-700">标签</Label><Input id="book-tags" name="tags" maxLength={200} defaultValue={editing?.tags ?? ""} className="h-10 border-slate-200 bg-white px-3 focus-visible:border-indigo-500 focus-visible:ring-indigo-100" placeholder="多个标签用逗号分隔，如：小学,人教版,三年级" /></div>
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            <DialogFooter className="mx-0 -mb-0 border-0 bg-transparent p-0 pt-2"><DialogClose render={<Button type="button" variant="outline" className="h-10 px-4" />}>取消</DialogClose><Button type="submit" className="h-10 bg-indigo-600 px-4 shadow-sm hover:bg-indigo-700">确认保存</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CardHeader>
    <CardContent className="p-0">{error && !open && <p className="m-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}<Table className="min-w-[760px] text-left"><TableHeader className="bg-slate-50 text-xs text-slate-500"><TableRow>{["封面", "标题", "单词数量", "bookId", "标签", "操作"].map((label) => <TableHead key={label} className="h-auto px-5 py-3 font-medium text-slate-500">{label}</TableHead>)}</TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">加载中...</TableCell></TableRow> : books.map((book) => <TableRow key={book.id} className="border-slate-100 hover:bg-slate-50"><TableCell className="px-5 py-4">{book.coverUrl ? <img src={book.coverUrl} alt={book.title} className="max-h-16 max-w-36 rounded object-contain" /> : <span className="grid h-14 w-20 place-items-center rounded bg-slate-100 text-slate-300"><BookOpen size={20} /></span>}</TableCell><TableCell className="px-5 py-4 font-medium text-slate-900">{book.title}</TableCell><TableCell className="px-5 py-4 text-slate-600">{book.wordCount}</TableCell><TableCell className="px-5 py-4"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{book.bookId}</code></TableCell><TableCell className="px-5 py-4">{book.tags ? <div className="flex max-w-56 flex-wrap gap-1">{book.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => <Badge key={tag} className="bg-indigo-50 text-indigo-600">{tag}</Badge>)}</div> : <span className="text-slate-400">—</span>}</TableCell><TableCell className="px-5 py-4"><div className="flex items-center gap-1"><Button variant="ghost" size="icon-sm" aria-label={`编辑${book.title}`} onClick={() => { setEditing(book); setOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={16} /></Button><Button variant="ghost" size="icon-sm" aria-label={`删除${book.title}`} onClick={() => remove(book)} className="text-slate-400 hover:text-red-500"><Trash2 size={17} /></Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent>
  </Card>;
}

export default function BooksPage() {
  return <AdminShell title="单词书管理" description="创建、编辑与维护平台中的单词书。"><BooksContent /></AdminShell>;
}
