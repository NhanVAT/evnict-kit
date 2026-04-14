# Init Check — Verify Setup
**Command:** `/evnict-kit:init-check $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

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

## Output
Demo code + verification report. User quyết định giữ hoặc xóa demo.
