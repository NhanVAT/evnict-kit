# Init Context — Sinh AGENTS.md
**Command:** `/evnict-kit:init-context $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Mục đích
Đọc rules đã khởi tạo (RP01-RP07) + scan codebase → sinh file AGENTS.md đầy đủ ở root project.

## Pre-conditions
- `/evnict-kit:init-rules` đã chạy thành công
- File `05-evnict-kit-project-conventions.md` đã có nội dung (không còn placeholders)

---

## Workflow

### Bước 1: Thu thập context
1. Đọc `.evnict/config.yaml` → project info
2. Đọc `05-evnict-kit-project-conventions.md` → conventions
3. Đọc `.agent/context/init-summary-*.md` → scan results
4. Scan codebase: `tree -L 3`, pom.xml/package.json, config files

### Bước 2: Sinh AGENTS.md
Tạo file AGENTS.md ở root project (400-600 dòng) với sections:

1. **Project Overview** — tên, mô tả, tech stack
2. **Architecture Diagram** — ASCII art
3. **Tech Stack Table** — framework, library, version
4. **Project Structure** — tree view
5. **Development Commands** — build, test, run
6. **Coding Conventions Summary** — tóm tắt từ rules
7. **API Conventions** — endpoint patterns, response format
8. **Database Conventions** — naming, migration
9. **Security Rules Summary** — critical rules
10. **Agent Commands** — available workflows/skills
11. **Safety Rules** — no push, no secrets, no PII
12. **Integration Map** — external services

### Bước 3: Validate
- [ ] File 400-600 dòng
- [ ] Architecture diagram included
- [ ] Tech stack complete
- [ ] Commands accurate
- [ ] No secrets/IPs

### Bước 4: Confirm
```
✅ AGENTS.md created: {line count} lines
📋 Sections: 12
🔒 Security: verified (no secrets)
```

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
File `AGENTS.md` ở root project — context file duy nhất cho AI Agent.
