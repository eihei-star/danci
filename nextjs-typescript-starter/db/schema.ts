import {
  pgTable,
  bigint,
  index,
  integer,
  json,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// ------------------------------------------------------------
// 认证用户（现有）
// 表名带引号为 "User"（规避保留字冲突），由 h5 应用运行时自动创建。
// 物理列名与 db.ts 的 ensureTableExists 保持一致。
// ------------------------------------------------------------
export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 64 }),
  password: varchar('password', { length: 64 }),
});

// ------------------------------------------------------------
// 单词（现有，只读）
// 物理列名为带引号的驼峰（"wordRank" / "headWord" / "bookId"），
// 由 danci-admin 写入，代码侧与物理列一一对应。
// ------------------------------------------------------------
export const words = pgTable(
  'words',
  {
    id: bigint('id', { mode: 'number' })
      .generatedByDefaultAsIdentity()
      .primaryKey(),
    wordRank: integer('wordRank'),
    headWord: text('headWord'),
    content: json('content'),
    bookId: text('bookId'),
  },
  (t) => [index('idx_words_book_rank').on(t.bookId, t.wordRank)],
);

// ------------------------------------------------------------
// 单词书（现有，只读）
// 物理列名为驼峰（wordCount / coverUrl / bookId 等），与 danci-admin 一致。
// ------------------------------------------------------------
export const books = pgTable('books', {
  id: bigint('id', { mode: 'number' })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  title: text('title').notNull(),
  wordCount: integer('wordCount').notNull().default(0),
  coverUrl: text('coverUrl'),
  bookId: text('bookId').notNull().unique(),
  tags: text('tags'),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ------------------------------------------------------------
// 学习进度（新增）
// 用途：首页「最近学习」、我的页进度条、学习页起始位置（lastWordRank + 1）。
// 约定：一人一书一条记录，(user_id, book_id) 唯一，写库用「存在则更新」(upsert)。
// ------------------------------------------------------------
export const learningProgress = pgTable(
  'learning_progress',
  {
    id: bigint('id', { mode: 'number' })
      .generatedByDefaultAsIdentity()
      .primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.bookId, { onDelete: 'cascade' }),
    learnedCount: integer('learned_count').notNull().default(0),
    lastWordRank: integer('last_word_rank').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('learning_progress_user_book_unique').on(t.userId, t.bookId),
    index('idx_progress_user').on(t.userId, t.updatedAt),
  ],
);

// ------------------------------------------------------------
// 用户·单词书学习进度（书级）
// 一人一书一条：(user_id, book_id) 唯一，写库用「存在则更新」。
// 用途：首页「最近学习」（按 updated_at 取最新）、学习页起始位置（last_word_rank + 1）。
// ------------------------------------------------------------
export const userBookProgress = pgTable(
  'user_book_progress',
  {
    id: bigint('id', { mode: 'number' })
      .generatedByDefaultAsIdentity()
      .primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.bookId, { onDelete: 'cascade' }),
    learnedCount: integer('learned_count').notNull().default(0),
    lastWordRank: integer('last_word_rank').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('user_book_progress_user_book_unique').on(t.userId, t.bookId),
    index('idx_user_book_progress_user_updated').on(t.userId, t.updatedAt),
  ],
);

// ------------------------------------------------------------
// 用户·词级学习进度（词级）
// 记录每个已学单词，一人一词一条：(user_id, book_id, word_rank) 唯一。
// 用途：后续可精确回溯某词是否学过（支持乱序/复习场景）。
// ------------------------------------------------------------
export const userWordProgress = pgTable(
  'user_word_progress',
  {
    id: bigint('id', { mode: 'number' })
      .generatedByDefaultAsIdentity()
      .primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.bookId, { onDelete: 'cascade' }),
    wordRank: integer('word_rank').notNull(),
    learnedAt: timestamp('learned_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('user_word_progress_user_book_rank_unique').on(
      t.userId,
      t.bookId,
      t.wordRank,
    ),
    index('idx_user_word_progress_user').on(t.userId),
  ],
);