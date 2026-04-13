# LLM Wiki — Knowledge Base
# Source: https://github.com/mduongvandinh/llm-wiki (MIT License)

Hệ thống quản lý kiến thức cho AI-assisted development.

## Cấu trúc
```
raw/notes/       ← Viết notes ở đây (markdown + frontmatter)
processed/       ← Auto-generated sau ingest
scripts/         ← Ingest, query scripts
```

## Sử dụng

### Push note
Tạo file `raw/notes/{domain}-{slug}.md` với frontmatter:
```markdown
---
title: "Tiêu đề"
domain: "module-name"
type: feature | bugfix | architecture
date: 2026-01-01
tags: [tag1, tag2]
---

Nội dung...
```

### Ingest
```bash
npm run ingest
```

### Query
Search trong `processed/index.json` hoặc grep files.
