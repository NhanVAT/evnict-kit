# Init Wiki — Setup LLM Wiki
**Command:** `/evnict-kit:init-wiki $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

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
- `raw/` (notes, articles, media, assets)
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

## Workflow (--from-github)

### Bước 1: Clone
```bash
git clone https://github.com/mduongvandinh/llm-wiki.git {project}-wiki
```

### Bước 2: Configure + First ingest
Same as steps 3-6 above.

---

## ⚠️ NHẮC NHỞ: Tuân thủ Rules & Context

> **Agent dùng lâu có thể quên rules.** Trước khi bắt đầu code, tự kiểm tra:

### Quick Check (agent tự đánh giá)
1. ✅ Tôi đã đọc `.agent/rules/` trong phiên làm việc này chưa?
2. ✅ Tôi đã đọc AGENTS.md (hoặc context file) chưa?
3. ✅ Tôi nhớ rõ coding conventions của dự án này không?

**→ Nếu BẤT KỲ câu nào = "CHƯA" hoặc "KHÔNG CHẮC":**
- Đọc lại tất cả files trong `.agent/rules/` (hoặc thư mục rules tương ứng)
- Đọc lại AGENTS.md (hoặc context file tương ứng)
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Output
Wiki folder ready at `{project}-wiki/` as a standalone AI Agent knowledge base.
