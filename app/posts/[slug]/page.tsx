import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ensureSchema, getDb } from "@/db";
import { posts } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await ensureSchema();
  const [post] = await getDb()
    .select({
      title: posts.title,
      summary: posts.summary,
      slug: posts.slug,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  if (!post) notFound();

  return (
    <main className="post-shell">
      <nav className="post-nav">
        <Link href="/">← 返回全部文章</Link>
        <span>HTML DOCUMENT</span>
      </nav>
      <header className="post-heading">
        <p className="eyebrow">PUBLISHED NOTE</p>
        <h1>{post.title}</h1>
        {post.summary ? <p>{post.summary}</p> : null}
      </header>
      <iframe
        className="post-frame"
        sandbox=""
        src={`/api/posts/${encodeURIComponent(post.slug)}/content`}
        title={post.title}
      />
      <p className="frame-note">正文在隔离环境中显示，文章脚本不会运行。</p>
    </main>
  );
}
