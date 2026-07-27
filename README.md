# HTML 笔记站

这是一个纯静态 HTML 博客。`site/documents` 中的每个 `.html` 文件都会原样发布，
构建脚本只读取标题、摘要和日期并生成首页索引，不修改文章正文。

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

4. 提交到 `master` 后，GitHub Actions 会自动更新文章索引并发布网站。

不熟悉 Git 命令时，也可以直接在 GitHub 网页中打开 `site/documents`，点击
**Add file → Upload files** 上传 HTML，然后提交。

## 本地预览

```bash
npm run build
npx serve site
```

首页提供纸张、极简和深色三套主题，并记住读者的选择。每篇文章仍保留自身的
HTML 与 CSS，不会被首页主题覆盖。

## GitHub Pages

自动部署工作流位于 `.github/workflows/deploy-pages.yml`。仓库需要在
**Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。

项目页面通常位于：

```text
https://rominw.github.io/html-docs/
```

之前的 D1 管理后台版本保存在 `codex/d1-backend` 分支。
