import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type AppEnv = {
  DB?: D1Database;
  ADMIN_EMAIL?: string;
};

export function getBindingEnv(): AppEnv {
  return env as unknown as AppEnv;
}

export function getDb() {
  const binding = getBindingEnv().DB;
  if (!binding) throw new Error("D1 数据库尚未绑定");
  return drizzle(binding, { schema });
}

export async function ensureSchema() {
  const binding = getBindingEnv().DB;
  if (!binding) throw new Error("D1 数据库尚未绑定");
  await binding
    .prepare(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      html_content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    .run();
  await binding
    .prepare("CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts (slug)")
    .run();
}
