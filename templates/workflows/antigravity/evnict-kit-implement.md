---
description: Implement TDD per subtask từ plan đã approve. MANDATORY STOP-AND-ASK sau mỗi task — Agent KHÔNG được tự chạy task tiếp. Đọc task files → TDD cycle → commit → STOP → user approve → next task.
---

# Implement
**Command:** `/evnict-kit:implement`

## Khi nào dùng
- Sau khi plan đã được user approve (từ feature-large hoặc feature-small)
- Implement từng task theo thứ tự dependency
- **MỖI task phải có user approval trước khi chuyển sang task tiếp**

## Input
- Path đến plan: `.evnict/specs/{feature-slug}/plan.md`
- Hoặc: `/evnict-kit:implement` (tự detect plan từ current feature)

---

## ═══════════════════════════════════════════
## QUY TẮC BẮT BUỘC: STOP-AND-ASK
## ═══════════════════════════════════════════

### Sau MỖI subtask hoàn thành, Agent PHẢI DỪNG và hiển thị:

```
═══════════════════════════════════════════
✅ Task {N}/{Total}: {task_name} — HOÀN THÀNH
═══════════════════════════════════════════

📁 Files tạo/sửa:
  + src/.../FileA.java (NEW — {X} lines)
  ~ src/.../FileB.java (MODIFIED — {Y} lines changed)

🧪 Tests: {pass}/{total} passed
📏 Lint: ✅ passed | ❌ {N} issues
🔨 Build: ✅ passed | ❌ failed
📝 Commit: feat({module}): {description} [task-{NN}]

───────────────────────────────────────────
❓ Bạn muốn làm gì tiếp?

  A) ✅ Approve — chuyển sang Task {N+1}: {next_task_name}
  B) 👀 Review code — tôi sẽ hiển thị code và chờ feedback
  C) 🔄 Yêu cầu sửa — mô tả cần sửa gì
  D) ⏸️ Tạm dừng — lưu progress, tiếp tục sau
  E) ❌ Hủy task này — rollback commit
  F) 🚀 Auto-approve — chạy hết tasks còn lại KHÔNG hỏi nữa
     ⚠️ Chỉ dùng khi đã review 2-3 tasks đầu và tin tưởng pattern

Chọn (A/B/C/D/E/F):
═══════════════════════════════════════════
```

### TUYỆT ĐỐI KHÔNG được:
- ❌ Tự động chạy task tiếp mà không hỏi user
- ❌ Skip phần hiển thị kết quả (files, tests, lint, build, commit)
- ❌ Gộp nhiều tasks thành 1 lần chạy
- ❌ Bỏ qua test/lint/build results trong output

---

### Xử lý từng Option

#### Option A — Approve
Chuyển sang task tiếp theo. Nếu đây là task cuối → chuyển sang Bước 4: Final Verify.

#### Option B — Review Code
Agent PHẢI hiển thị code cho mỗi file đã tạo/sửa:
```
📄 {FileName.java} ({NEW|MODIFIED}):
─────────────────────────────
{Hiển thị toàn bộ code nếu NEW}
{Hiển thị diff nếu MODIFIED}
─────────────────────────────

📄 {FileName2.java} ({NEW|MODIFIED}):
─────────────────────────────
{Code/Diff}
─────────────────────────────

Bạn có feedback gì không? (Gõ feedback hoặc "OK" để approve)
```

Sau khi user gõ "OK" → xử lý như Option A.
Sau khi user gõ feedback → xử lý như Option C.

#### Option C — Yêu cầu sửa
1. Đọc feedback của user
2. Sửa code theo feedback
3. Chạy lại test → lint → build
4. Amend commit: `git commit --amend -m "..."`
5. Hiển thị lại STOP-AND-ASK với kết quả mới

#### Option D — Tạm dừng
Lưu progress vào `.evnict/specs/{feature}/progress.md`:
```markdown
# Progress: {feature}
## Status: PAUSED
## Completed: {N}/{Total}
## Last updated: {timestamp}

### Tasks
- [x] Task 01: {name} — commit: {hash}
- [x] Task 02: {name} — commit: {hash}
- [ ] Task 03: {name} ← NEXT
- [ ] Task 04: {name}
- [ ] ...

### Resume
Chạy: `/evnict-kit:implement`
Agent sẽ auto-detect progress file và tiếp tục từ Task 03.
```

Hiển thị:
```
⏸️ Progress đã lưu: .evnict/specs/{feature}/progress.md
   Hoàn thành: {N}/{Total} tasks
   Task tiếp: {N+1}: {name}
   Resume: chạy /evnict-kit:implement
```

#### Option E — Hủy + Rollback
1. `git revert HEAD` (revert commit cuối)
2. Xóa files đã tạo trong task này
3. Cập nhật plan.md — đánh dấu task chưa hoàn thành
4. Hỏi user: "Muốn thử lại task này hay chuyển sang task khác?"

#### Option F — Auto-approve
1. Hiển thị cảnh báo:
```
⚠️ AUTO-APPROVE MODE
Tất cả tasks còn lại sẽ chạy liên tục KHÔNG hỏi.
Agent vẫn DỪNG nếu: test fail, build fail, hoặc 3-strike rule.

Tiếp tục? (Y/N)
```
2. Nếu Y → chạy tất cả tasks còn lại, mỗi task vẫn hiển thị kết quả (nhưng không hỏi)
3. Nếu gặp lỗi (test fail, build fail) → TỰ ĐỘNG quay lại mode STOP-AND-ASK
4. Sau khi tất cả tasks xong → hiển thị Final Summary (Bước 5)

---

## Pre-conditions
1. Plan đã được user approve
2. Working tree clean: `git status`
3. Feature branch đã tạo

## Bước 1: Đọc Plan + Check Resume
```bash
cat .evnict/specs/{feature}/plan.md
ls .evnict/specs/{feature}/tasks/
```

### Resume Logic
Kiểm tra `.evnict/specs/{feature}/progress.md`:
- **Nếu tồn tại** → Đọc progress, hiển thị:
  ```
  📋 Phát hiện progress đã lưu:
     Hoàn thành: {N}/{Total} tasks
     Task tiếp: {N+1}: {name}
  
  Tiếp tục từ Task {N+1}? (Y/N)
  ```
  - Y → skip các tasks đã hoàn thành, bắt đầu từ task tiếp
  - N → bắt đầu lại từ đầu (xác nhận trước: "Sẽ reset progress. Chắc chắn?")
- **Nếu không tồn tại** → bắt đầu từ Task 01

Xác định thứ tự thực hiện và dependencies.

## Bước 2: Với MỖI task (theo thứ tự)

### 2a: Đọc task spec
```bash
cat .evnict/specs/{feature}/tasks/{NN}-{name}.md
```

### 2b: TDD Cycle
Gọi skill `evnict-kit-tdd`:
1. **[RED]** Viết test → FAIL
2. **[GREEN]** Code tối thiểu → PASS
3. **Verify** lint + build
4. **[REFACTOR]** Cải thiện (test vẫn PASS)

### 2c: Commit
```bash
git add .
git commit -m "feat({module}): {task description} [task-{NN}]"
```

### 2d: Update task status
Đánh dấu task hoàn thành trong plan.md.

### 2e: Update handoff (nếu BE→FE)
Gọi skill `evnict-kit-coordinate` → publish contract khi BE tasks done.

### ══ 2f: MANDATORY STOP — STOP-AND-ASK ══
**DỪNG ĐÂY.** Hiển thị kết quả và hỏi user (xem format ở đầu file).
**KHÔNG ĐƯỢC** tự động chuyển sang task tiếp.
Chỉ chuyển khi user chọn A, hoặc đang ở Auto-approve mode (F).

## Bước 3: 3-Strike Rule
Test fail > 3 lần cho cùng 1 task → **DỪNG NGAY**.
- Nếu đang ở Auto-approve mode → TỰ ĐỘNG thoát auto-approve, quay lại STOP-AND-ASK.

## Bước 4: Final Verify
```bash
./mvnw test && ./mvnw spotless:check && ./mvnw compile
```

## Bước 5: Final Summary
```markdown
═══════════════════════════════════════════
✅ IMPLEMENTATION COMPLETE
═══════════════════════════════════════════

📋 Feature: {feature_name}
📁 Tasks completed: {N}/{total}

📝 Commits:
  {hash1} feat({module}): {desc} [task-01]
  {hash2} feat({module}): {desc} [task-02]
  ...

🧪 Tests: {total_tests} pass
🔨 Build: ✅ OK
📏 Lint: ✅ OK

───────────────────────────────────────────
❓ Tiếp theo:
  A) /evnict-kit:review — code review
  B) /evnict-kit:handoff — chuyển sang FE/BE
  C) /evnict-kit:archive-wiki — lưu wiki + archive
═══════════════════════════════════════════
```

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
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/processed/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Checklist
- [ ] Plan confirmed
- [ ] Resume logic checked (progress.md)
- [ ] All tasks implemented (TDD)
- [ ] STOP-AND-ASK enforced sau MỖI task
- [ ] All tests pass
- [ ] Build OK
- [ ] Handoff updated (nếu BE→FE)
- [ ] No 3-strike violations
- [ ] Final Summary hiển thị
