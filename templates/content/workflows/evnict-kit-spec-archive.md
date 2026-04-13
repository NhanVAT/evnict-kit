---
description: Spec CRUD — save, find, update, list specs. Quản lý specs trong .evnict/specs/.
---

# Spec Archive
**Command:** `/evnict-kit:spec-archive`

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

## Checklist
- [ ] Action executed successfully
- [ ] Output formatted clearly
