import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { and, desc, eq } from 'drizzle-orm';
import postgres from 'postgres';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import {
  books,
  words,
  userBookProgress,
  userWordProgress,
} from '../db/schema';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

// 单词书：读取真实 books 表（物理列为 camelCase：wordCount/coverUrl/bookId 等）
export async function getBooks() {
  const rows = await db
    .select({
      id: books.id,
      title: books.title,
      wordCount: books.wordCount,
      coverUrl: books.coverUrl,
      bookId: books.bookId,
      tags: books.tags,
    })
    .from(books);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    wordCount: r.wordCount ?? 0,
    coverUrl: r.coverUrl ?? '',
    bookId: r.bookId,
    tags: r.tags ?? '',
  }));
}

// 单词书：按 bookId 取单本（书名/词数，学习页头部用）
export async function getBookByBookId(bookId: string) {
  const rows = await db
    .select({
      title: books.title,
      wordCount: books.wordCount,
      coverUrl: books.coverUrl,
    })
    .from(books)
    .where(eq(books.bookId, bookId))
    .limit(1);
  return rows[0];
}

// 确保「当前用户」在 User 表中存在。当前阶段登录为 mock（userId 恒为 1），
// learning 进度外键引用 "User"(id)，插入前先保证该行存在。
// 接入真实 NextAuth 后应改用会话中的 userId，无需再调用此函数。
export async function ensureUserExists(userId: number, email?: string) {
  await client`
    INSERT INTO "User" (id, email) VALUES (${userId}, ${email ?? `user${userId}`})
    ON CONFLICT (id) DO NOTHING
  `;
}

// 单词：按 bookId 获取该书全部单词（按 wordRank 升序）
export async function getWordsByBook(bookId: string) {
  const rows = await db
    .select({
      id: words.id,
      wordRank: words.wordRank,
      headWord: words.headWord,
      content: words.content,
      bookId: words.bookId,
    })
    .from(words)
    .where(eq(words.bookId, bookId))
    .orderBy(words.wordRank);

  return rows;
}

// 书级学习进度列表（按最近学习时间倒序，用于首页「最近学习」）
export async function getBookProgressList(userId: number) {
  return db
    .select()
    .from(userBookProgress)
    .where(eq(userBookProgress.userId, userId))
    .orderBy(desc(userBookProgress.updatedAt));
}

// 某一本书的学习进度
export async function getBookProgress(userId: number, bookId: string) {
  const rows = await db
    .select()
    .from(userBookProgress)
    .where(
      and(
        eq(userBookProgress.userId, userId),
        eq(userBookProgress.bookId, bookId),
      ),
    )
    .limit(1);
  return rows[0];
}

// 更新书级学习进度（一人一书，存在则更新）
export async function upsertBookProgress(
  userId: number,
  bookId: string,
  lastWordRank: number,
  learnedCount: number,
) {
  return db
    .insert(userBookProgress)
    .values({ userId, bookId, learnedCount, lastWordRank })
    .onConflictDoUpdate({
      target: [userBookProgress.userId, userBookProgress.bookId],
      set: {
        learnedCount,
        lastWordRank,
        updatedAt: new Date(),
      },
    });
}

// 记录词级学习进度（去过背过的词，幂等：重学不重复计数时间）
export async function recordWordProgress(
  userId: number,
  bookId: string,
  wordRank: number,
) {
  return db
    .insert(userWordProgress)
    .values({ userId, bookId, wordRank })
    .onConflictDoNothing({
      target: [
        userWordProgress.userId,
        userWordProgress.bookId,
        userWordProgress.wordRank,
      ],
    });
}

export async function getUser(email: string) {
  const users = await ensureTableExists();
  return await db.select().from(users).where(eq(users.email, email));
}

export async function createUser(email: string, password: string) {
  const users = await ensureTableExists();
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  return await db.insert(users).values({ email, password: hash });
}

async function ensureTableExists() {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
    );`;

  if (!result[0].exists) {
    await client`
      CREATE TABLE "User" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(64),
        password VARCHAR(64)
      );`;
  }

  const table = pgTable('User', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 64 }),
    password: varchar('password', { length: 64 }),
  });

  return table;
}
