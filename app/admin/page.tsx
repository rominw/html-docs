import Link from "next/link";
import { desc } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "../chatgpt-auth";
import { AdminStudio } from "./studio";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return (
      <main className="access-denied">
        <p className="eyebrow">ADMIN ACCESS</p>
        <h1>这个账号没有管理权限</h1>
        <p>
          当前登录账号为 <strong>{auth.user.email}</strong>。请为站点配置
          ADMIN_EMAIL 后再试。
        </p>
        <div>
          <Link href="/">返回首页</Link>
          <a href="/signout-with-chatgpt?return_to=/">退出登录</a>
        </div>
      </main>
    );
  }

  await ensureSchema();
  const allPosts = await getDb()
    .select()
    .from(posts)
    .orderBy(desc(posts.updatedAt), desc(posts.id));

  return (
    <AdminStudio
      initialPosts={allPosts}
      user={{ email: auth.user.email, displayName: auth.user.displayName }}
    />
  );
}
