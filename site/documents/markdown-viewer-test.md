---
title: Markdown 渲染测试文档
description: 验证站点 viewer 对 front-matter、代码高亮、表格、引用、任务列表与目录生成的完整支持。
date: 2026-09-04
tags: 测试
---

# Markdown 渲染测试文档

这是一篇用于验证 `viewer.html` 客户端渲染能力的样例文档。涵盖标题层级、代码高亮、表格、引用块、任务列表与脚注式链接。

## 排版基础

普通段落，包含**加粗**、*斜体*、`行内代码`、[外部链接](https://example.com)以及删除线~~已废弃~~。

> 引用块：简单胜于复杂。
> 第二行引用，验证多行渲染。

### 三级标题（目录应包含）

无序列表：

- 列表项一
- 列表项二
  - 嵌套项

任务列表：

- [x] 已完成事项
- [ ] 待办事项

## 代码高亮

JavaScript 示例：

```javascript
async function loadDoc(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
```

Python 示例：

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

未标注语言的代码块：

```
plain text block
```

## 表格

| 特性 | viewer 渲染 | 纯 md 直链 |
|---|---|---|
| front-matter | 自动剥离 | 显示为正文 |
| 代码高亮 | ✅ | ❌ |
| 目录导航 | 自动生成 | 无 |

## 分隔线与结语

---

文档结束。返回[首页](./)可查看索引效果。
