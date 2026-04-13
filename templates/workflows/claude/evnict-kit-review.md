# Auto Review
**Command:** `/evnict-kit:review $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

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

## Checklist
- [ ] Code review completed (9 items)
- [ ] Merge checklist completed (9 items)
- [ ] Verdict: APPROVE + PASS → Ready to merge
