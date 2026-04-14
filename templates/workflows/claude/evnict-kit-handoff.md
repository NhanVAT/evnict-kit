# Handoff
**Command:** `/evnict-kit:handoff $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Ý nghĩa và Mục đích
Trong mô hình nhiều AI Agents làm việc song song trên nhiều Repositories (BE + FE). Khi Backend hoàn thành API, lệnh `handoff` sẽ sinh file bàn giao **ĐẦY ĐỦ** để FE Agent có thể implement mà KHÔNG cần hỏi thêm.

## Khi nào dùng
- Khi phát triển xong API Endpoints ở Backend → FE cần implement UI
- Khi hoàn thành DB Migration ở dự án Database riêng → báo Backend
- Sau khi BE implement xong tất cả tasks của feature

---

## Workflow chi tiết

### Bước 1: Rà soát Công việc
1. Đọc `.evnict/specs/{feature}/plan.md` → lấy task list
2. Kiểm tra tất cả BE tasks đã `[x]` hoàn thành chưa
   - Nếu chưa xong hết → CẢNH BÁO: "Còn {N} BE tasks chưa hoàn thành. Handoff ngay?"
3. Kiểm tra API Contract `.evnict/handoff/contracts/{feature}-api.yaml`
   - Nếu chưa có → sinh mới từ code đã implement
   - Nếu đã có → verify lại với code hiện tại

### Bước 2: Đọc code đã implement → trích xuất context
Agent PHẢI đọc các files đã tạo trong BE tasks:

1. **Đọc DTOs** → trích fields, types, annotations, JsonProperty
2. **Đọc Controllers** → trích endpoints, request params, response format
3. **Đọc Services** → trích business rules, validation logic
4. **Đọc commit log** → `git log --oneline main..HEAD`

### Bước 3: Append entry vào Handoff Log — PHẢI có 5 SECTIONS

> **QUAN TRỌNG:** KHÔNG tạo file riêng cho mỗi feature. Thay vào đó, APPEND entry mới vào file `.evnict/handoff/handoff.md`.
> Nếu file chưa tồn tại → tạo mới với header template.

Append entry sau vào `.evnict/handoff/handoff.md`:

```markdown
---

### [{YYYY-MM-DD}] BE→FE: {Feature Name} — Handoff
- **Trạng thái:** 🔴 Chờ xử lý
- **Spec:** `.evnict/specs/{feature}/spec.md`

#### 1. TỔNG QUAN ĐÃ LÀM (Backend)
**Mô tả:** {3-5 câu tóm tắt những gì BE đã implement}

**Tasks đã hoàn thành:**
| # | Task | Files | Tests |
|---|------|-------|-------|
| 01 | DB Migration | {migration_file} | ✅ |
| 02 | Repository | {repo_file} ({dto_file}) | ✅ {N}/{N} |
| 03 | Service | {service_file} | ✅ {N}/{N} |
| 04 | Controller | {controller_file} ({M} endpoints) | ✅ {N}/{N} |

**Commits:**
```
{hash} feat({module}): {description} [task-01]
{hash} feat({module}): {description} [task-02]
...
```

#### 2. API CONTRACT (Chi tiết cho Frontend)
**File đầy đủ:** `.evnict/handoff/contracts/{feature}-api.yaml`

**Quick Reference:**
| Method | Path | Mô tả | Auth |
|--------|------|-------|------|
| POST | /api/{module}/{action} | {mô tả} | JWT |
| ... | ... | ... | ... |

**DTO Structure (cho TypeScript interface):**
```typescript
// Auto-generated từ {DTOFile.java}
export interface {EntityName} {
  ID: number;
  FIELD_NAME: string;        // @JsonProperty("FIELD_NAME")
  NULLABLE_FIELD?: string;   // nullable → optional
  NUMERIC_FIELD: number;
  DATE_FIELD: string;        // format: yyyy-MM-dd
  STATUS: number;
  USER_CR_ID: string;        // audit - server tự set
  USER_CR_DTIME: string;     // audit - server tự set
  USER_MDF_ID: string;       // audit - server tự set
  USER_MDF_DTIME: string;    // audit - server tự set
}
```

**Validation Rules (PHẢI sync BE↔FE):**
| Field | Rule | Error Message (tiếng Việt) |
|-------|------|---------------------------|
| {FIELD} | Required | "Vui lòng nhập {field_label}" |
| {FIELD} | MaxLength({N}) | "{field_label} không quá {N} ký tự" |
| {FIELD} | <= today | "{field_label} phải <= ngày hiện tại" |
| {FIELD} | Range(0-23) | "{field_label} phải từ 0-23" |
| {FIELD} | >= 0 | "{field_label} phải >= 0" |

**Response Format:**
```json
// Success
{ "success": true, "message": "OK", "data": { ... } }
// Error
{ "success": false, "message": "Lỗi cụ thể", "data": null }
// Paginated
{
  "success": true,
  "data": {
    "content": [{ ... }],
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Request Format chi tiết cho mỗi endpoint:**
**POST /api/{module}/list**
```json
{
  "FILTER_FIELD": "string",
  "FROM_DATE": "yyyy-MM-dd",
  "TO_DATE": "yyyy-MM-dd",
  "page": 0,
  "size": 20
}
```

**POST /api/{module}/save**
```json
{
  "ID": null,              // null = create, number = update
  "FIELD_NAME": "value",
  // ... all required fields
}
```

**POST /api/{module}/delete**
```json
{
  "ID": 123
}
```

#### 3. YÊU CẦU CHO FRONTEND
**Tasks cần làm:**
| # | Task | Mô tả | Priority |
|---|------|-------|----------|
| fe-01 | {Module}Service | HTTP service gọi {N} API endpoints | High |
| fe-02 | {Module}ListComponent | Trang danh sách + filter + pagination | High |
| fe-03 | {Module}FormComponent | Dialog form thêm/sửa | High |
| fe-04 | Routing + Menu | Thêm route + menu item | Medium |

**UI Requirements (từ spec):**
- **Filter bar:** {dropdown1}, {dropdown2}, {date range}
- **Table:** PrimeNG p-table, sortable, paginator
- **Form:** PrimeNG dialog, reactive forms, validation sync với BE
- **Actions:** Thêm (toolbar), Sửa (row button), Xóa (confirm dialog)
- **Export:** Excel export (nếu có trong spec)

**Dropdowns cần load:**
| Dropdown | API | Value field | Display field |
|----------|-----|-------------|---------------|
| {Dropdown name} | /api/{path} | {VALUE_ID} | {DISPLAY_NAME} |

#### 4. LƯU Ý ĐẶC BIỆT
- **ResponseData wrapper:** Luôn check `response.success` trước khi dùng `response.data`
- **Auth:** JWT token tự động gắn bởi HTTP interceptor — FE KHÔNG cần handle
- **Date format:** Server nhận `yyyy-MM-dd`, display trên FE `dd/MM/yyyy`
- **Audit fields:** (USER_CR_*, USER_MDF_*) → server tự set, FE KHÔNG cần gửi
- **Error handling:** Dùng `response.message` để hiển thị toast notification
- **Pagination:** PrimeNG LazyLoadEvent → map sang {page, size}

#### 5. HƯỚNG DẪN CHẠY
FE Agent mở project frontend:
1. Đọc file: `.evnict/handoff/handoff.md` → tìm entry 🔴 Chờ xử lý
2. Đọc API contract: `.evnict/handoff/contracts/{feature}-api.yaml`
3. Chạy: `/evnict-kit:implement`
4. Agent sẽ tự detect FE tasks từ handoff entry và implement
5. Sau khi xong → update trạng thái entry thành 🟢 Đã xử lý

- **Kết quả xử lý:** _(FE Agent điền sau khi implement xong)_
```

### Bước 4: Sinh/Update API Contract YAML
Tạo hoặc cập nhật `.evnict/handoff/contracts/{feature}-api.yaml`:
- Dựa vào Controllers đã implement
- Format theo skill `evnict-kit-coordinate`

### Bước 5: Update BE Status
Cập nhật `.evnict/handoff/be-status.md`:
```markdown
# BE Status
status: done
feature: {feature-name}
completed_tasks: ["task-01", "task-02", ...]
api_contract: handoff/contracts/{feature}-api.yaml
handoff_entry: handoff/handoff.md (entry [{date}] BE→FE: {feature})
last_updated: {timestamp}
```

### Bước 6: Thông báo User
```
═══════════════════════════════════════════
✅ Handoff: {Feature Name} — THÀNH CÔNG
═══════════════════════════════════════════

📄 Handoff entry: .evnict/handoff/handoff.md (🔴 Chờ xử lý)
📜 API Contract: .evnict/handoff/contracts/{feature}-api.yaml
📊 BE Status: .evnict/handoff/be-status.md → DONE

───────────────────────────────────────────
📋 Nội dung handoff entry:
  Section 1: Tổng quan — {N} tasks hoàn thành
  Section 2: API Contract — {M} endpoints
  Section 3: FE Tasks — {K} tasks cần làm
  Section 4: Lưu ý đặc biệt
  Section 5: Hướng dẫn chạy

───────────────────────────────────────────
🔄 Thao tác tiếp:
  1. Chuyển sang IDE/workspace của project Frontend
  2. Mở Agent và paste:
     "Backend đã Handoff xong feature {feature-name}.
      Đọc .evnict/handoff/handoff.md
      để implement FE tasks."
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
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Tiêu chí thành công (Definition of Done)
1. Handoff entry có ĐỦ 5 sections (tổng quan, API contract, FE tasks, lưu ý, hướng dẫn)
2. Entry được APPEND vào `handoff.md` (không tạo file riêng)
3. DTO → TypeScript interface mapping chính xác
4. Validation rules sync table đầy đủ
5. API Contract YAML file tồn tại và đầy đủ endpoints
6. BE Status file updated → `status: done`
7. User nhận được thông báo rõ ràng để chuyển workspace
