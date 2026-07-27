# HTML 笔记站

这是一个为 Cloudflare Pages 准备的纯静态 HTML 网站。`site/documents` 中的每个 HTML
文件都会原样发布，构建脚本只读取文档信息并生成首页索引，不会修改文章内容。

## 添加文档

1. 把完整的 `.html` 文件放进 `site/documents`。
2. 建议在文档 `<head>` 中写入 `<title>` 和 description：

   ```html
   <title>文档标题</title>
   <meta name="description" content="文档摘要" />
   ```

3. 日期可以写成：

   ```html
   <time datetime="2026-07-24">2026年7月24日</time>
   ```

4. 运行 `npm run build`，首页索引会写入 `site/documents.json`。

## Cloudflare Pages 设置

- Framework preset：None
- Build command：`npm run build`
- Build output directory：`site`
- Root directory：留空

部署完成后，文档地址类似：

```text
https://项目名.pages.dev/documents/文件名
```

