# HTML 笔记站

这是一个通过 Cloudflare Workers Static Assets 托管的纯静态 HTML 笔记站。
`site/documents`
中的每个 `.html` 文件都会原样发布；构建脚本只读取标题、摘要和日期并生成
首页索引，不修改文章正文。

## 发布文章

1. 将完整的 `.html` 文件上传到 `site/documents`。
2. 建议在文档 `<head>` 中写入标题和摘要：

   ```html
   <title>文档标题</title>
   <meta name="description" content="文档摘要" />
   ```

3. 日期可以放在 `<time>` 中：

   ```html
   <time datetime="2026-07-27">2026年7月27日</time>
   ```

4. 提交到 `master` 后，Cloudflare Workers Builds 会自动构建并发布网站。

不熟悉 Git 命令时，也可以直接在 GitHub 网页中打开 `site/documents`，点击
**Add file → Upload files** 上传 HTML，然后提交。

## Cloudflare 部署

Cloudflare 项目 `html-docs` 已连接此 GitHub 仓库。当前部署方式为
Workers Builds + Static Assets：

- Production branch：`master`
- Build command：`npm run build`
- Static assets directory：`site`

以后每次向 `master` 提交内容，Cloudflare 都会自动重新构建并发布。
生产地址和每次构建记录可在 Cloudflare 项目 `html-docs` 中查看。

## 本地预览

```bash
npm run build
npx serve site
```

首页提供纸张、极简和深色三套主题，并记住读者的选择。每篇文章仍保留自身的
HTML 与 CSS，不会被首页主题覆盖。

之前的 D1 管理后台版本保存在 `codex/d1-backend` 分支。
