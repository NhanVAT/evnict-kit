---
name: evnict-kit-bug-fix
description: Bug fix workflow — reproduce → root cause → TDD fix → scan similar → postmortem. Quy trình sửa lỗi có hệ thống.
compatibility: All tech stacks
---

# evnict-kit-bug-fix — Sửa Lỗi

## Khi nào dùng
- Bug report từ tester/user
- Lỗi phát hiện trong quá trình phát triển
- Regression bug

## Input Parameters
- `description` (bắt buộc): Mô tả bug
- `severity` (optional): critical | high | medium | low
- `steps_to_reproduce` (optional): Các bước tái tạo

---

## Workflow Steps

### Bước 1: Query Wiki
Tìm trong wiki xem bug này đã được report/fix trước đó chưa:
```bash
grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"
```
Nếu đã có → đọc cách fix trước đó.

### Bước 2: Reproduce
1. Đọc steps to reproduce
2. Tìm file/module liên quan
3. Nếu có test → chạy test xem fail ở đâu
4. **Tạo test case reproduce lỗi** (RED phase — test PHẢI FAIL)

```java
@Test
@DisplayName("BUG: {description}")
void reproduce_bug_description() {
    // Arrange — setup data gây lỗi
    // Act — thực hiện action gây lỗi
    // Assert — verify kết quả sai (EXPECTED TO FAIL)
}
```

### Bước 3: Root Cause Analysis
1. Đọc code liên quan
2. Trace logic từ input → output
3. Xác định chính xác dòng code gây lỗi
4. Ghi lại root cause:

```markdown
## Root Cause
- File: {path}
- Line: {line}
- Issue: {description}
- Why: {explanation}
```

### Bước 4: TDD Fix
1. Test reproduce ĐÃ FAIL (RED) ✅
2. Fix code → test PASS (GREEN)
3. Refactor nếu cần (test vẫn PASS)
4. Chạy ALL tests → PASS

```bash
./mvnw test          # hoặc ng test --watch=false
./mvnw compile       # Build OK
```

### Bước 5: Scan Similar
Tìm pattern lỗi tương tự trong codebase:
```bash
grep -rn "{error pattern}" --include="*.java" src/
```
Nếu tìm thấy → fix luôn (prevent regression).

### Bước 6: Commit
```bash
git add .
git commit -m "fix({module}): {description} [BUG-{id}]"
```

### Bước 7: Push Wiki
Dùng skill `evnict-kit-wiki` push kiến thức:
- Bug description
- Root cause
- Fix approach
- Similar patterns to watch for

---

## 3-Strike Rule
Nếu fix FAIL > 3 lần cho cùng 1 bug:
1. **DỪNG** phiên AI
2. Báo user: "Bug cần phân tích thủ công"
3. Log lại 3 lần thử và kết quả

---

## Tiêu chí hoàn thành
- [ ] Bug reproduced bằng test case
- [ ] Root cause identified
- [ ] Fix implemented (TDD)
- [ ] All tests PASS
- [ ] Similar patterns scanned
- [ ] Commit message chuẩn
- [ ] Wiki updated
