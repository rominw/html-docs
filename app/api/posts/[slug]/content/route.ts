import { and, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db";
import { posts } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await ensureSchema();
  const [post] = await getDb()
    .select({ html: posts.htmlContent })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  if (!post) return new Response("Not found", { status: 404 });

  return new Response(post.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "sandbox; default-src 'none'; img-src data: https:; style-src 'unsafe-inline' https:; font-src data: https:;",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=60",
    },
  });
}
