import { eq } from "drizzle-orm";
import { isAdmin } from "@/app/chatgpt-auth";
import { ensureSchema, getDb } from "@/db";
import { posts } from "@/db/schema";
import { normalizePostInput } from "@/lib/post-input";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }
  await ensureSchema();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "无效文章编号" }, { status: 400 });
  }
  const parsed = normalizePostInput(await request.json());
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const [post] = await getDb()
      .update(posts)
      .set({ ...parsed.value, updatedAt: new Date().toISOString() })
      .where(eq(posts.id, id))
      .returning();
    if (!post) return Response.json({ error: "文章不存在" }, { status: 404 });
    return Response.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return Response.json(
      { error: message.includes("UNIQUE") ? "固定链接已被使用，请更换" : "保存失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }
  await ensureSchema();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "无效文章编号" }, { status: 400 });
  }
  await getDb().delete(posts).where(eq(posts.id, id));
  return Response.json({ ok: true });
}
