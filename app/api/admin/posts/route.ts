import { desc } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db";
import { posts } from "@/db/schema";
import { isAdmin } from "@/app/chatgpt-auth";
import { normalizePostInput } from "@/lib/post-input";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }
  await ensureSchema();
  const result = await getDb()
    .select()
    .from(posts)
    .orderBy(desc(posts.updatedAt), desc(posts.id));
  return Response.json({ posts: result });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }
  await ensureSchema();
  const payload = await request.json();
  const parsed = normalizePostInput(payload);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const [post] = await getDb()
      .insert(posts)
      .values(parsed.value)
      .returning();
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const friendly = message.includes("UNIQUE")
      ? "固定链接已被使用，请更换"
      : "保存失败，请稍后重试";
    return Response.json({ error: friendly }, { status: 400 });
  }
}
