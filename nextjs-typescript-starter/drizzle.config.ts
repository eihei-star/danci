import { defineConfig } from 'drizzle-kit';
import { config as loadEnv } from 'dotenv';

// Next.js 约定将环境变量存放于 .env.local，drizzle-kit 不会自动加载，需手动读取。
loadEnv({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL 环境变量未配置（请检查 .env.local）');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
});