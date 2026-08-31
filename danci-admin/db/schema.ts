import { relations } from "drizzle-orm";
import { bigint, boolean, index, integer, json, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", ["system_admin", "admin"]);

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: adminRole("role").notNull().default("admin"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("admin_users_email_unique").on(table.email)]);

export const adminSessions = pgTable("admin_sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("admin_sessions_user_id_idx").on(table.userId), index("admin_sessions_expires_at_idx").on(table.expiresAt)]);

export const words = pgTable("words", {
  id: bigint("id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
  wordRank: integer("wordRank"),
  headWord: text("headWord"),
  content: json("content"),
  bookId: text("bookId"),
});

export const books = pgTable("books", {
  id: bigint("id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
  title: text("title").notNull(),
  wordCount: integer("wordCount").notNull().default(0),
  coverUrl: text("coverUrl"),
  bookId: text("bookId").notNull().unique(),
  tags: text("tags"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

export const wordsRelations = relations(words, ({ one }) => ({
  book: one(books, { fields: [words.bookId], references: [books.bookId] }),
}));

export const booksRelations = relations(books, ({ many }) => ({
  words: many(words),
}));

export type AdminRole = typeof adminRole.enumValues[number];
