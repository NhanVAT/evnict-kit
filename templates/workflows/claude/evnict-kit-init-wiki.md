# Init Wiki — Setup LLM Wiki
**Command:** `/evnict-kit:init-wiki $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Mục đích
Setup llm-wiki knowledge base cho dự án. Copy từ template có sẵn hoặc clone từ GitHub.

## Options
- `/evnict-kit:init-wiki` → Copy từ templates/wiki/ (mặc định)
- `/evnict-kit:init-wiki --from-github` → Clone fresh từ GitHub

---

## Workflow (Default — Copy Template)

### Bước 1: Xác định wiki path
```bash
cat .evnict/config.yaml | grep wiki
# → wiki.folder: "{project}-wiki"
```

### Bước 2: Copy template
Wiki template đã có sẵn trong evnict-kit package:
```bash
cp -r {evnict-kit}/templates/wiki/ ./{project}-wiki/
```

### Bước 3: Install dependencies
```bash
cd {project}-wiki
```

### Bước 4: Configure
Tạo `config.yaml` từ `config.example.yaml`:
```yaml
project: "{project-name}"
raw_path: "raw/notes"
processed_path: "wiki"
index_path: "wiki/index.json"
```

### Bước 5: Tạo folder structure
```bash
mkdir -p raw/notes
mkdir -p wiki
```

### Bước 6: First ingest (nếu có notes sẵn)
```bash
Agent follow SKILL.md to ingest
```

### Bước 7: Verify
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

### Bước 2: Install + Configure
Same as steps 3-7 above.

---

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
Wiki folder ready at `{project}-wiki/` ready for Agent to populate.
