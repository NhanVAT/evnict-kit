---
description: Auto review workflow — check rules + ATTT + conventions trước merge. Gọi skill evnict-kit-code-review + evnict-kit-merge-checklist.
---

# Auto Review
**Command:** `/evnict-kit:review`

## Khi nào dùng
- Trước khi merge code
- Review code do AI Agent sinh ra
- Kiểm tra chất lượng trước pull request

## Input
- Branch (auto-detect current)
- `/evnict-kit:review` hoặc `/evnict-kit:review --scope=security`

---

## Bước 1: Code Review
Gọi skill `evnict-kit-code-review`:
- 9 hạng mục review (Security, Logic, Quality, Tests, Build, Vibe Coding, Database, Documentation, Performance)
- Tạo review report

## Bước 2: Merge Checklist
Gọi skill `evnict-kit-merge-checklist`:
- 9 hạng mục pre-merge check
- Build, tests, lint, security, secrets, commits, files, docs, migration

## Bước 3: Verdict
```markdown
## 📋 Review Summary

### Code Review: {APPROVE | REQUEST CHANGES | BLOCK}
{Summary of issues}

### Merge Checklist: {PASS | FAIL}
{Summary of checks}

### Final Verdict: {✅ READY TO MERGE | ❌ NEEDS FIXES}
{Actions required before merge}
```

## Bước 4: Nếu BLOCK/FAIL
1. Liệt kê issues cần fix
2. Fix issues
3. Chạy lại `/evnict-kit:review`

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
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/processed/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Checklist
- [ ] Code review completed (9 items)
- [ ] Merge checklist completed (9 items)
- [ ] Verdict: APPROVE + PASS → Ready to merge
