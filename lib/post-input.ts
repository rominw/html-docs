const MAX_HTML_BYTES = 2_000_000;

type Input = {
  title?: unknown;
  slug?: unknown;
  summary?: unknown;
  htmlContent?: unknown;
  status?: unknown;
};

export function normalizePostInput(payload: Input) {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const slug = typeof payload.slug === "string"
    ? payload.slug.trim().toLowerCase()
    : "";
  const summary =
    typeof payload.summary === "string" ? payload.summary.trim() : "";
  const htmlContent =
    typeof payload.htmlContent === "string" ? payload.htmlContent.trim() : "";
  const status = payload.status === "published" ? "published" : "draft";

  if (!title) return { error: "请填写文章标题" };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "固定链接只能使用小写字母、数字和连字符" };
  }
  if (!htmlContent) return { error: "请上传或填写 HTML 正文" };
  if (new TextEncoder().encode(htmlContent).byteLength > MAX_HTML_BYTES) {
    return { error: "HTML 文件不能超过 2 MB" };
  }

  return {
    value: {
      title,
      slug,
      summary: summary.slice(0, 300),
      htmlContent,
      status: status as "draft" | "published",
      publishedAt: status === "published" ? new Date().toISOString() : null,
    },
  };
}
