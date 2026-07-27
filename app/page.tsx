import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db";
import { posts } from "@/db/schema";

export const dynamic = "force-dynamic";

async function getPublishedPosts() {
  await ensureSchema();
  return getDb()
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      summary: posts.summary,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt), desc(posts.id));
}

function formatDate(value: string | null) {
  if (!value) return "刚刚发布";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function Home() {
  const publishedPosts = await getPublishedPosts();
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            &lt;/&gt;
          </span>
          <span>HTML 笔记</span>
        </Link>
        <span className="status">
          <i aria-hidden="true" />
          公开阅读
        </span>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">PUBLIC HTML NOTES</p>
          <h1>
            原样保存，
            <br />
            自由表达。
          </h1>
          <p className="intro">
            每篇内容都是一份独立的 HTML 文档。保留原来的排版、样式与结构，
            直接在浏览器中安静阅读。
          </p>
        </section>

        <section className="library" aria-labelledby="library-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LIBRARY</p>
              <h2 id="library-title">全部文章</h2>
            </div>
            <span className="article-count">
              {publishedPosts.length.toString().padStart(2, "0")} 篇
            </span>
          </div>

          <div className="document-list">
            {publishedPosts.length ? (
              publishedPosts.map((post, index) => (
                <Link
                  className="document-card"
                  href={`/posts/${post.slug}`}
                  key={post.id}
                >
                  <span className="document-number">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="document-copy">
                    <strong>{post.title}</strong>
                    {post.summary ? <span>{post.summary}</span> : null}
                  </span>
                  <time>{formatDate(post.publishedAt)}</time>
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-symbol">&lt;html&gt;</span>
                <h3>第一篇文章正在路上</h3>
                <p>发布后的 HTML 文档会出现在这里。</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <span>HTML Notes</span>
        <Link href="/admin">管理后台</Link>
      </footer>
    </>
  );
}
