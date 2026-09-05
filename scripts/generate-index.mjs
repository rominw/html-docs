import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const documentsDir = path.join(root, "site", "documents");

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function match(html, pattern) {
  const result = html.match(pattern);
  return result ? decodeEntities(result[1].trim()) : "";
}

function parseFrontMatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!block) return {};
  const data = {};
  for (const line of block[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (kv) data[kv[1].toLowerCase()] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return data;
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownMeta(text) {
  const data = parseFrontMatter(text);
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  let title = data.title || "";
  if (!title) {
    const heading = body.match(/^#\s+(.+)$/m);
    if (heading) title = heading[1].trim();
  }

  let description = data.description || "";
  if (!description) {
    const plain = stripMarkdown(body.replace(/^#\s+.+$/m, ""));
    const paragraph = plain.split(/\n\s*\n/)[0] || plain;
    description = paragraph.slice(0, 110).trim();
    if (paragraph.length > 110) description += "……";
  }

  return {
    title,
    description,
    date: data.date || "",
  };
}

const files = (await readdir(documentsDir))
  .filter((file) => /\.(html|md)$/i.test(file))
  .sort((a, b) => b.localeCompare(a, "zh-CN"));

const documents = await Promise.all(
  files.map(async (file) => {
    const encoded = encodeURIComponent(file);
    const text = await readFile(path.join(documentsDir, file), "utf8");

    if (/\.md$/i.test(file)) {
      const meta = markdownMeta(text);
      return {
        title: meta.title || path.parse(file).name,
        description: meta.description,
        date: meta.date,
        url: `viewer.html?src=documents/${encoded}`,
      };
    }

    const title =
      match(text, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
      match(text, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      path.parse(file).name;
    const description =
      match(
        text,
        /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      ) ||
      match(
        text,
        /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
      );
    const date =
      match(text, /<time[^>]*datetime=["']([^"']+)["'][^>]*>/i) ||
      match(text, /<meta\s+[^>]*name=["']date["'][^>]*content=["']([^"']+)["'][^>]*>/i);

    return {
      title,
      description,
      date,
      url: `documents/${encoded}`,
    };
  }),
);

documents.sort((a, b) => {
  const aTime = Date.parse(a.date);
  const bTime = Date.parse(b.date);
  const aHasDate = !Number.isNaN(aTime);
  const bHasDate = !Number.isNaN(bTime);

  if (aHasDate && bHasDate && aTime !== bTime) return bTime - aTime;
  if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
  return a.title.localeCompare(b.title, "zh-CN");
});

await writeFile(
  path.join(root, "site", "documents.json"),
  `${JSON.stringify(documents, null, 2)}\n`,
  "utf8",
);

console.log(`Indexed ${documents.length} document(s) (html + md).`);
