"use client";

import { useMemo, useRef, useState } from "react";
import type { Post } from "@/db/schema";

type Draft = {
  id: number | null;
  title: string;
  slug: string;
  summary: string;
  htmlContent: string;
  status: "draft" | "published";
};

const emptyDraft: Draft = {
  id: null,
  title: "",
  slug: "",
  summary: "",
  htmlContent:
    '<!doctype html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>新文章</title>\n  <style>\n    body { max-width: 760px; margin: 0 auto; padding: 64px 24px; font: 18px/1.8 system-ui, sans-serif; }\n  </style>\n</head>\n<body>\n  <article>\n    <h1>新文章</h1>\n    <p>从这里开始书写。</p>\n  </article>\n</body>\n</html>',
  status: "draft",
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/\.html?$/i, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/[\u4e00-\u9fff]/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toDraft(post: Post): Draft {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    htmlContent: post.htmlContent,
    status: post.status as "draft" | "published",
  };
}

export function AdminStudio({
  initialPosts,
  user,
}: {
  initialPosts: Post[];
  user: { email: string; displayName: string };
}) {
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<Draft>(() =>
    initialPosts[0] ? toDraft(initialPosts[0]) : emptyDraft,
  );
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(
    () => (draft.id ? "编辑文章" : "新建文章"),
    [draft.id],
  );

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function importHtml(file?: File) {
    if (!file) return;
    if (!/\.html?$/i.test(file.name)) {
      setNotice("请选择 .html 或 .htm 文件");
      return;
    }
    if (file.size > 2_000_000) {
      setNotice("HTML 文件不能超过 2 MB");
      return;
    }

    const html = await file.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const title =
      parsed.querySelector("title")?.textContent?.trim() ||
      parsed.querySelector("h1")?.textContent?.trim() ||
      file.name.replace(/\.html?$/i, "");
    const summary =
      parsed
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
        ?.trim() || "";
    setDraft({
      id: null,
      title,
      slug: toSlug(file.name) || `post-${Date.now()}`,
      summary,
      htmlContent: html,
      status: "draft",
    });
    setNotice(`已读取 ${file.name}，确认预览后即可保存`);
  }

  async function save(status: "draft" | "published") {
    setSaving(true);
    setNotice("");
    const payload = { ...draft, status };
    const url = draft.id
      ? `/api/admin/posts/${draft.id}`
      : "/api/admin/posts";
    const response = await fetch(url, {
      method: draft.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { post?: Post; error?: string };
    setSaving(false);
    if (!response.ok || !result.post) {
      setNotice(result.error || "保存失败，请稍后重试");
      return;
    }

    const saved = result.post;
    setAllPosts((current) => {
      const rest = current.filter((post) => post.id !== saved.id);
      return [saved, ...rest];
    });
    setDraft(toDraft(saved));
    setNotice(status === "published" ? "文章已发布" : "草稿已保存");
  }

  async function remove() {
    if (!draft.id || !window.confirm(`确定删除《${draft.title}》吗？`)) return;
    const response = await fetch(`/api/admin/posts/${draft.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setNotice("删除失败，请稍后重试");
      return;
    }
    setAllPosts((current) => current.filter((post) => post.id !== draft.id));
    setDraft(emptyDraft);
    setNotice("文章已删除");
  }

  return (
    <div className="studio">
      <aside className="studio-sidebar">
        <div className="studio-brand">
          <a href="/">HTML 笔记</a>
          <span>管理后台</span>
        </div>
        <button
          className="new-post"
          onClick={() => {
            setDraft(emptyDraft);
            setNotice("");
          }}
          type="button"
        >
          ＋ 新建文章
        </button>
        <div className="post-list" aria-label="文章列表">
          {allPosts.map((post) => (
            <button
              className={post.id === draft.id ? "post-item active" : "post-item"}
              key={post.id}
              onClick={() => {
                setDraft(toDraft(post));
                setNotice("");
              }}
              type="button"
            >
              <strong>{post.title}</strong>
              <span>
                <i className={post.status} />
                {post.status === "published" ? "已发布" : "草稿"}
              </span>
            </button>
          ))}
          {!allPosts.length ? (
            <p className="no-posts">还没有文章，上传第一份 HTML 吧。</p>
          ) : null}
        </div>
        <div className="account">
          <span>{user.displayName}</span>
          <small>{user.email}</small>
          <a href="/signout-with-chatgpt?return_to=/">退出登录</a>
        </div>
      </aside>

      <main className="studio-main">
        <header className="editor-toolbar">
          <div>
            <span>{selectedLabel}</span>
            {notice ? <p role="status">{notice}</p> : null}
          </div>
          <div className="toolbar-actions">
            <button
              className="ghost-button"
              onClick={() => setPreviewOpen((value) => !value)}
              type="button"
            >
              {previewOpen ? "隐藏预览" : "显示预览"}
            </button>
            {draft.id ? (
              <button className="delete-button" onClick={remove} type="button">
                删除
              </button>
            ) : null}
            <button
              className="secondary-button"
              disabled={saving}
              onClick={() => save("draft")}
              type="button"
            >
              保存草稿
            </button>
            <button
              className="primary-button"
              disabled={saving}
              onClick={() => save("published")}
              type="button"
            >
              {saving ? "保存中…" : "发布"}
            </button>
          </div>
        </header>

        <section className={previewOpen ? "editor-grid" : "editor-grid solo"}>
          <div className="editor-pane">
            <div
              className="upload-zone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                importHtml(event.dataTransfer.files[0]);
              }}
            >
              <input
                accept=".html,.htm,text/html"
                hidden
                onChange={(event) => importHtml(event.target.files?.[0])}
                ref={fileInput}
                type="file"
              />
              <div>
                <strong>直接上传 HTML 文件</strong>
                <span>拖到这里，或选择文件 · 最大 2 MB</span>
              </div>
              <button
                className="upload-button"
                onClick={() => fileInput.current?.click()}
                type="button"
              >
                选择文件
              </button>
            </div>

            <div className="meta-grid">
              <label>
                <span>标题</span>
                <input
                  onChange={(event) => update("title", event.target.value)}
                  value={draft.title}
                />
              </label>
              <label>
                <span>固定链接</span>
                <input
                  onChange={(event) => update("slug", toSlug(event.target.value))}
                  placeholder="my-first-post"
                  value={draft.slug}
                />
              </label>
            </div>
            <label className="field">
              <span>摘要</span>
              <textarea
                className="summary-input"
                maxLength={300}
                onChange={(event) => update("summary", event.target.value)}
                rows={2}
                value={draft.summary}
              />
            </label>
            <label className="field html-field">
              <span>HTML 正文</span>
              <textarea
                onChange={(event) => update("htmlContent", event.target.value)}
                spellCheck={false}
                value={draft.htmlContent}
              />
            </label>
          </div>

          {previewOpen ? (
            <div className="preview-pane">
              <div className="preview-bar">
                <span />
                <span />
                <span />
                <strong>安全预览</strong>
              </div>
              <iframe
                sandbox=""
                srcDoc={draft.htmlContent}
                title="HTML 文章预览"
              />
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
