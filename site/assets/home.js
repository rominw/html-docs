const container = document.querySelector("#documents");
const search = document.querySelector("#search");
const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");
let documents = [];

const themes = [
  { value: "paper", label: "纸张" },
  { value: "minimal", label: "极简" },
  { value: "dark", label: "深色" },
];

function setTheme(value) {
  const theme = themes.find((item) => item.value === value) || themes[0];
  document.documentElement.dataset.theme = theme.value;
  themeLabel.textContent = theme.label;
  themeToggle.title = `当前：${theme.label}主题。点击切换`;
  try {
    localStorage.setItem("html-notes-theme", theme.value);
  } catch (_) {
    // 浏览器禁止存储时，主题仍可在当前页面使用。
  }
}

setTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener("click", () => {
  const current = themes.findIndex(
    (item) => item.value === document.documentElement.dataset.theme,
  );
  setTheme(themes[(current + 1) % themes.length].value);
});

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value;
  return node.innerHTML;
}

function formatDate(value) {
  if (!value) return "未标注日期";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function render(items) {
  if (!items.length) {
    container.innerHTML = '<p class="empty">没有找到匹配的文档。</p>';
    return;
  }

  container.innerHTML = items
    .map(
      (document, index) => `
        <a class="document-card" href="${document.url}">
          <span class="document-number">${String(index + 1).padStart(2, "0")}</span>
          <span class="document-copy">
            <strong>${escapeHtml(document.title)}</strong>
            ${
              document.description
                ? `<span>${escapeHtml(document.description)}</span>`
                : ""
            }
          </span>
          <time>${escapeHtml(formatDate(document.date))}</time>
          <span class="arrow" aria-hidden="true">↗</span>
        </a>
      `,
    )
    .join("");
}

fetch("documents.json")
  .then((response) => {
    if (!response.ok) throw new Error("文档索引读取失败");
    return response.json();
  })
  .then((data) => {
    documents = data;
    render(documents);
  })
  .catch(() => {
    container.innerHTML =
      '<p class="empty">暂时无法读取文档列表，请稍后刷新页面。</p>';
  });

search.addEventListener("input", () => {
  const query = search.value.trim().toLocaleLowerCase("zh-CN");
  const filtered = documents.filter((document) =>
    `${document.title} ${document.description}`
      .toLocaleLowerCase("zh-CN")
      .includes(query),
  );
  render(filtered);
});
