# HTML 笔记

这是一个以完整 HTML 文档作为文章正文的个人博客。公开访客可以阅读已发布文章，管理员通过 `/admin` 上传、预览、编辑和发布 `.html` 文件。

## 功能

- HTML 文件拖放或选择上传，最大 2 MB
- 自动读取 `<title>` 和 `<meta name="description">`
- HTML 源码编辑与隔离实时预览
- 草稿、发布、修改和删除
- Cloudflare D1 保存文章元数据和完整 HTML 正文
- 公开文章使用隔离 `iframe` 展示，文章脚本默认不运行
- ChatGPT 登录与管理员邮箱白名单

## 本地运行

```bash
npm install
npm run dev
```

在 `.env` 中配置后台管理员：

```text
ADMIN_EMAIL=你的 ChatGPT 登录邮箱
```

## 数据库

数据库结构在 `db/schema.ts`，迁移文件保存在 `drizzle/`。修改结构后运行：

```bash
npm run db:generate
```

早期的纯静态版本仍保留在 `site/`，但不再作为当前站点的构建入口。
