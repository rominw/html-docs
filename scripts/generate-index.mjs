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

const files = (await readdir(documentsDir))
  .filter((file) => file.toLowerCase().endsWith(".html"))
  .sort((a, b) => b.localeCompare(a, "zh-CN"));

const documents = await Promise.all(
  files.map(async (file) => {
    const html = await readFile(path.join(documentsDir, file), "utf8");
    const title =
      match(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
      match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      path.parse(file).name;
    const description =
      match(
        html,
        /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      ) ||
      match(
        html,
        /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
      );
    const date =
      match(html, /<time[^>]*datetime=["']([^"']+)["'][^>]*>/i) ||
      match(html, /<meta\s+[^>]*name=["']date["'][^>]*content=["']([^"']+)["'][^>]*>/i);

    return {
      title,
      description,
      date,
      url: `documents/${encodeURIComponent(file)}`,
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

console.log(`Indexed ${documents.length} HTML document(s).`);
