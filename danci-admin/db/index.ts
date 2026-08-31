import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 环境变量未配置");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
