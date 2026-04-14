# Spec Archive
**Command:** `/evnict-kit:spec-archive $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Khi nào dùng
- Tìm spec đã tạo trước đó
- Archive spec từ .evnict/ vào docs/
- Liệt kê tất cả specs

## Input
- Action: list | find | archive | show
- `/evnict-kit:spec-archive list` → Liệt kê tất cả specs
- `/evnict-kit:spec-archive find {keyword}` → Tìm spec theo keyword
- `/evnict-kit:spec-archive archive {slug}` → Archive spec vào docs/
- `/evnict-kit:spec-archive show {slug}` → Hiển thị spec

---

## Action: LIST
```bash
ls .evnict/specs/
```
Output:
```markdown
## 📋 Specs
| # | Slug | Status | Date | Tasks |
|---|------|--------|------|-------|
| 1 | {slug} | {draft|confirmed|archived} | {date} | {count} |
```

## Action: FIND
```bash
grep -rl "{keyword}" .evnict/specs/ --include="*.md"
```

## Action: ARCHIVE
```bash
cp -r .evnict/specs/{slug}/ docs/specs/{slug}/
```

## Action: SHOW
```bash
cat .evnict/specs/{slug}/spec.md
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

## Checklist
- [ ] Action executed successfully
- [ ] Output formatted clearly
