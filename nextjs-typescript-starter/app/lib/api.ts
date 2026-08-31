'use client';

// 前端调后端真实数据的封装。返回结构尽量与 mock-data 的类型保持一致，
// 便于学习/详情页复用现有渲染逻辑。
import type { ProgressRow, WordRow } from 'app/lib/mock-data';

export interface WordsResponse {
  bookId: string;
  book: { title: string; wordCount: number } | null;
  words: WordRow[];
}

export interface ProgressResponse {
  progress: ProgressRow[];
}

async function toJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

// 获取某本单词书的全部单词
export async function fetchWords(bookId: string): Promise<WordsResponse> {
  return toJson(
    await fetch(`/api/books/${encodeURIComponent(bookId)}/words`),
  );
}

// 获取当前登录用户的书级学习进度列表（按最近学习时间倒序）
// 用户身份由会话 cookie 提供，无需传参。
export async function fetchProgress(): Promise<ProgressRow[]> {
  const data = await toJson<ProgressResponse>(await fetch('/api/progress'));
  return data.progress;
}

// 保存学习进度（更新书级进度 + 记录词级进度）
export async function saveProgress(
  bookId: string,
  lastWordRank: number,
): Promise<void> {
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, lastWordRank }),
  });
}