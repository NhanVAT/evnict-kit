# Wiki Archive Feature
**Command:** `/evnict-kit:wiki-archive-feature $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Khi nào dùng
- Sau khi hoàn thành feature-large hoặc feature-small
- Sau khi `/evnict-kit:archive-wiki` chạy xong (hoặc thay thế archive-wiki)
- Khi muốn nạp tri thức thủ công cho 1 feature cụ thể

## Input
- Feature slug (auto-detect từ `.evnict/specs/` gần nhất hoặc chỉ định)

---

## Pre-checks

### Check 1: Wiki accessible
```bash
ls -la {project_name}-wiki/
```
Nếu không tồn tại → DỪNG: *"Wiki chưa được liên kết. Chạy `evnict-kit init` hoặc tạo symlink thủ công."*

### Check 2: Wiki đã setup
```bash
ls {project_name}-wiki/package.json
```
Nếu không tồn tại → DỪNG: *"Wiki chưa khởi tạo. Chạy `/evnict-kit:init-wiki` trước."*

---

## Bước 1: Thu thập đầu vào
Đọc TẤT CẢ files liên quan đến feature:

| Nguồn | Path | Nội dung trích xuất |
|-------|------|---------------------|
| Spec | `.evnict/specs/{feature}/spec.md` | WHAT, WHY, Business Rules, Acceptance Criteria |
| Plan | `.evnict/specs/{feature}/plan.md` | DB Schema, API Design, FE Design, Task breakdown |
| Task files | `.evnict/specs/{feature}/tasks/*.md` | Implementation details, test cases |
| API Contract | `.evnict/handoff/contracts/{feature}-api.yaml` | Endpoints, request/response |
| Git log | `git log --oneline main..HEAD` | Commits, files changed |
| Handoff | `.evnict/handoff/handoff.md` | Cross-project context (entries liên quan feature) |

> **Nếu file nào không tồn tại → bỏ qua nguồn đó, KHÔNG dừng.**

## Bước 2: Sinh wiki note
Tạo file markdown HOÀN CHỈNH (không phải tóm tắt sơ sài):

```markdown
---
title: "Chức năng {feature_name}"
discovered: {YYYY-MM-DD}
topic: "{module}"
tags: [{feature, module, api, database}]
source: "evnict-kit-auto"
type: feature
---

# ═══ PHẦN NGHIỆP VỤ ═══

## Tổng quan
{Trích từ spec: WHAT + WHY — 5-10 câu}

## Mục đích chức năng
{Chức năng này giải quyết vấn đề gì cho user? — 3-5 câu}
{Suy ra từ spec WHAT/WHY + code implementation}

## Đối tượng sử dụng
{Ai dùng? Role nào? Quyền gì?}
{Suy ra từ: spec, auth annotations, role checks}

## Nghiệp vụ chính
### Luồng chính
{Trích từ spec: Main Flow}

### Luồng ngoại lệ
{Trích từ spec: Exception Flow}

### Nhập/Thêm mới
- {Mô tả hành vi, fields cần nhập, ràng buộc}

### Danh sách/Tìm kiếm
- {Mô tả filters, phân trang, sort}

### Sửa/Cập nhật
- {Mô tả}

### Xóa
- {Mô tả, confirm logic}

## Quy tắc nghiệp vụ
| Mã | Quy tắc |
|----|---------|
| BR01 | {Trích từ spec + suy ra từ validation logic} |
| BR02 | {Suy ra từ unique constraints, foreign keys} |
| BR03 | {Suy ra từ authorization checks} |

## Liên kết chức năng
{Module này liên quan đến module nào khác?}
{Suy ra từ: foreign keys, service dependencies, shared DTOs}
- **{Module A}**: {mô tả liên kết}
- **{Module B}**: {mô tả liên kết}

# ═══ PHẦN KỸ THUẬT ═══

## Database
{Trích từ plan: tables, columns, relationships}

## API Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
{Trích từ plan hoặc API contract}

## Backend
- Controller: {file, endpoints}
- Service: {file, business logic}
- Repository: {file, JOOQ queries}
- DTO: {file, fields}

## Frontend
- Component: {file, mô tả}
- Service: {file, API calls}
- Page: {route, mô tả}

## Files liên quan
{List files created/modified — từ git diff}

## Tham chiếu
- Spec: `.evnict/specs/{feature}/spec.md`
- Plan: `.evnict/specs/{feature}/plan.md`
- API Contract: `.evnict/handoff/contracts/{feature}-api.yaml`
```

## Bước 3: Push + Auto-ingest
```bash
cp {generated_file} {wiki_path}/raw/notes/{module}-{feature-slug}.md
cd {wiki_path} && node scripts/ingest.js
```
Nếu `scripts/ingest.js` không tồn tại → thử `npm run ingest`.
Nếu vẫn fail → báo: *"Chạy `/evnict-kit:init-wiki`"*

## Bước 4: Confirm
```
✅ Wiki note created: {wiki_path}/raw/notes/{file}
   Nội dung: {N} sections, {M} API endpoints, {K} business rules
✅ Ingest completed
```

---

## Lưu ý
- Workflow này thay thế phần wiki trong `/evnict-kit:archive-wiki`
- Wiki note PHẢI hoàn chỉnh — không chỉ tóm tắt 3-5 câu
- Nếu feature có cả BE+FE → ghi đủ cả 2 phần (Backend + Frontend)
- Nếu thiếu thông tin FE/BE → ghi phần có, note phần thiếu

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

## Checklist hoàn thành
- [ ] Đọc đủ nguồn (spec, plan, tasks, contract, git log)
- [ ] Wiki note sinh đúng format frontmatter
- [ ] Đủ sections: Tổng quan, Nghiệp vụ, Kỹ thuật, Files, Tham chiếu
- [ ] File copied vào `raw/notes/`
- [ ] Ingest triggered thành công
