---
description: Bug fix workflow — query wiki → classify → reproduce → TDD fix → scan similar → archive. Sửa lỗi có hệ thống.
---

# Bug Fix
**Command:** `/evnict-kit:bug-fix`

## Khi nào dùng
- Bug report từ tester/user/production
- Regression bug
- Lỗi phát hiện trong development

## Input
- Mô tả bug
- VD: `/evnict-kit:bug-fix API GET /api/customers trả về 500 khi keyword chứa ký tự đặc biệt '%'`

---

## Bước 1: Query wiki
Kiểm tra bug đã được report/fix trước đó:
```bash
grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"
```

## Bước 2: Classify severity
| Severity | Response |
|----------|----------|
| Critical (production down) | Hotfix branch ngay |
| High (feature broken) | Fix trong sprint hiện tại |
| Medium (workaround có) | Lên kế hoạch |
| Low (cosmetic) | Backlog |

## Bước 3: Checkpoint
```bash
git checkout -b fix/{bug-slug}
```

## Bước 4: Reproduce
1. Tìm file/module liên quan
2. Viết test case reproduce lỗi (RED — test PHẢI FAIL)
```java
@Test
@DisplayName("BUG: {description}")
void should_reproduce_bug() {
    // Arrange — setup data gây lỗi
    // Act — action gây lỗi
    // Assert — verify lỗi xảy ra
}
```

## Bước 5: Root Cause Analysis
1. Trace logic từ input → output
2. Xác định dòng code gây lỗi
3. Ghi lại root cause

## Bước 6: TDD Fix
1. ✅ Test reproduce FAIL (RED done)
2. Fix code → test PASS (GREEN)
3. Refactor nếu cần
4. Chạy ALL tests

```bash
./mvnw test          # All tests pass
./mvnw compile       # Build OK
```

3-Strike Rule: fail > 3 lần → DỪNG, báo user.

## Bước 7: Scan similar
Tìm pattern lỗi tương tự trong codebase:
```bash
grep -rn "{error pattern}" --include="*.java" src/
```
Fix luôn nếu tìm thấy.

## Bước 8: Commit
```bash
git commit -m "fix({module}): {description}"
```

## Bước cuối: Wiki
Gợi ý user:
```
💡 Bug fix hoàn thành. Thêm tri thức vào wiki?
A) Có — chạy `/evnict-kit:wiki-archive-feature` (nạp đầy đủ)
B) Nhanh — tôi tóm tắt bug + root cause + fix → push wiki → auto-ingest
C) Không — skip
```
- Nếu A → chạy `/evnict-kit:wiki-archive-feature`
- Nếu B → gọi skill `evnict-kit-wiki` action=push → auto-ingest
- Nếu C → skip

Tạo postmortem nếu thay đổi > 20 dòng.

---

> 🎨 **FE UI Quality:** Khi tạo/sửa UI component, tham khảo skill `evnict-kit-frontend-design`
> để đảm bảo chất lượng thiết kế cao. Áp dụng Design Thinking (Purpose → Tone → Constraints → Differentiation) trước khi code UI.

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

## Checklist hoàn thành
- [ ] Wiki queried
- [ ] Severity classified
- [ ] Checkpoint created
- [ ] Bug reproduced (test case)
- [ ] Root cause identified
- [ ] TDD fix applied
- [ ] Similar patterns scanned
- [ ] All tests pass
- [ ] Committed
- [ ] Wiki updated (bug knowledge pushed)
