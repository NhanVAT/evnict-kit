---
description: Agent sinh demo code để verify setup — tạo sample API + component để test rules, conventions, workflows.
---

# Init Check — Verify Setup
**Command:** `/evnict-kit:init-check`

## Mục đích
Sinh demo code nhỏ để verify rằng rules, conventions, workflows hoạt động đúng.

## Pre-conditions
- `/evnict-kit:init-rules` đã chạy
- `/evnict-kit:init-context` đã chạy
- AGENTS.md tồn tại

---

## Workflow

### Bước 1: Tạo demo branch
```bash
git checkout -b demo/init-check
```

### Bước 2: Backend — Sinh sample API
Gọi skill `evnict-kit-create-api` tạo API đơn giản:
- GET /api/demo/health → return status
- POST /api/demo/echo → echo request body

Verify:
- [ ] DTO có validation annotations
- [ ] Service có @Transactional
- [ ] Controller return ResponseData
- [ ] Tests viết và pass

### Bước 3: Frontend — Sinh sample component
Gọi skill `evnict-kit-create-component`:
- DemoComponent: hiển thị data từ /api/demo/health

Verify:
- [ ] Component trong shared/
- [ ] i18n keys
- [ ] Loading/error states
- [ ] takeUntil pattern

### Bước 4: Security Check
Gọi skill `evnict-kit-security-audit` scope=module(demo):
- Verify no security violations

### Bước 5: Report
```markdown
## ✅ Init Check Report
| Check | Status |
|-------|--------|
| Rules loaded | ✅ |
| Conventions applied | ✅ |
| Backend demo API | ✅ |
| Frontend demo component | ✅ |
| Security scan | ✅ |
| Tests pass | ✅ |
| Build OK | ✅ |

## Setup is READY! 🎉
Next: Xóa demo branch hoặc giữ làm reference.
```

### Bước 6: Cleanup option
```bash
git checkout main
git branch -D demo/init-check
```

---

## Output
Demo code + verification report. User quyết định giữ hoặc xóa demo.
