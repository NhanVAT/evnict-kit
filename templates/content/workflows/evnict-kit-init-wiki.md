---
description: Setup llm-wiki — copy template hoặc open agent session.
---

# Init Wiki — Setup LLM Wiki
**Command:** `/evnict-kit:init-wiki`

## Mục đích
Setup llm-wiki knowledge base cho dự án.

## Workflow (Default — Copy Template)

### Bước 1: Xác định wiki path
```bash
cat .evnict/config.yaml | grep wiki
# → wiki.folder: "{project}-wiki"
```

### Bước 2: Khởi tạo
Run CLI command:
```bash
evnict-kit init-wiki
```
Hoặc tạo Agent session trong thư mục wiki và chạy:
```bash
/llm-wiki init "{project}"
```

### Bước 3: Generate base files
Agent tự động copy templates (hoặc setup từ real github llm-wiki) và tạo config.

### Bước 4: Tạo folder structure
Agent tạo:
- `wiki/` (entities, concepts, sources, syntheses)
- `raw/` (notes, articles, medi, assets)
- `.discoveries/`

### Bước 5: First ingest (nếu có notes sẵn)
Agent sẽ scan và cập nhật INDEX.

### Bước 6: Verify
```
✅ Wiki setup: {project}-wiki/
✅ Config created
✅ Folders ready
```

---

## Output
Wiki folder ready at `{project}-wiki/` as a standalone AI Agent knowledge base.
