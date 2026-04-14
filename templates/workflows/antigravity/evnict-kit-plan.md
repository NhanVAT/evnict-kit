---
name: evnict-kit-plan
description: Chuyển từ spec đã confirm sang plan + task breakdown CHI TIẾT. Sinh plan.md (6 sections) + task files (120+ dòng/file) + API contract. Dùng sau khi user trả lời các câu hỏi clarify.
---

# Plan
**Command:** `/evnict-kit:plan [path_to_spec]`

## Khi nào dùng
Dùng để tự động sinh cấu trúc công việc CHI TIẾT, Breakdown các thành phần và tạo API Contract từ một bản Specification (Spec) đã chốt.

## Input
- Spec file path (Agent sẽ auto-detect từ `.evnict/specs/` gần nhất nếu không cung cấp)
- Hoặc người dùng chỉ định trực tiếp: `/evnict-kit:plan .evnict/specs/feature-xyz/spec.md`

---

## Workflow chi tiết

### Bước 1: Parse Specification
1. Đọc file `spec.md` đã confirm.
2. Kiểm tra xem có câu hỏi clarify nào chưa được user trả lời hay không.
   - Nếu có: Yêu cầu người dùng trả lời trước khi tiếp tục. Dừng lệnh.
   - Nếu đã trả lời: Tự động update `spec.md` với các quyết định/câu trả lời nếu cần thiết.
3. Đọc `.agent/rules/` → nắm conventions dự án (naming, architecture, coding patterns).
4. Đọc AGENTS.md → hiểu project overview, tech stack.

### Bước 2: Đọc file mẫu trong project
**BẮT BUỘC** đọc các file mẫu thật trong project để trích xuất code patterns:
1. Tìm file mẫu tương tự với feature cần implement:
   - Repository mẫu (VD: `LrsDepartmentRepository.java`)
   - Service mẫu (VD: `LrsDepartmentService.java`)
   - Controller mẫu (VD: `NCPTController.java`)
   - DTO mẫu (VD: `LrsDepartmentDTO.java`)
   - FE Service mẫu, Component mẫu (nếu FE project)
2. Trích skeleton pattern: class structure, imports, method signatures, annotations.
3. Lưu lại để paste vào task files ở bước sau.

### Bước 3: Sinh Plan.md — PHẢI có 6 SECTIONS

Tạo file `.evnict/specs/{feature-slug}/plan.md` theo template sau:

```markdown
# Plan: {Feature Name}

## 1. Tổng quan
- Feature: {tên chức năng}
- Spec: .evnict/specs/{slug}/spec.md
- Estimated: {X} tasks, phân bổ BE:{N} / FE:{M} / DB:{K}
- Priority: {High/Medium/Low}
- Branch: feature/{slug}

## 2. Database Schema
### Tables cần tạo/sửa
| Table | Column | Type | Nullable | FK | Mô tả |
|-------|--------|------|----------|-----|-------|
| {TABLE_NAME} | ID | NUMBER | NO | PK | Primary key |
| {TABLE_NAME} | {COL} | {TYPE} | {YES/NO} | {FK→TABLE} | {mô tả} |
| ... | ... | ... | ... | ... | ... |

### Indexes (nếu cần)
| Index | Columns | Type | Mô tả |
|-------|---------|------|-------|
| {IDX_NAME} | {cols} | {UNIQUE/NORMAL} | {mô tả} |

### Migration script naming
- `V{YYYYMMDD}_{SEQ}__{description}.sql`

## 3. API Design
### Endpoints
| # | Method | Path | Auth | Mô tả |
|---|--------|------|------|-------|
| 1 | POST | /api/{module}/{action} | JWT | {mô tả} |
| ... | ... | ... | ... | ... |

### Request/Response chi tiết cho MỖI endpoint

**{METHOD} {PATH}**
```json
// Request
{
  "field1": "type — description",
  "field2": "type — description",
  "page": 0,
  "size": 20
}
// Response (ResponseData wrapper)
{
  "success": true,
  "message": "OK",
  "data": {
    "content": [{ ... }],
    "totalElements": 100,
    "totalPages": 5
  }
}
// Error Response
{
  "success": false,
  "message": "Lỗi cụ thể",
  "data": null
}
```

## 4. Frontend Design
### Pages/Components
| # | Component | Type | Route | Mô tả |
|---|-----------|------|-------|-------|
| 1 | {Name}ListComponent | Page | /{route} | Danh sách + filter + CRUD |
| 2 | {Name}FormComponent | Dialog | — | Form thêm/sửa |

### UI Elements
- Filter bar: {dropdowns, date pickers, text inputs}
- Table: columns mapped từ DTO
- Actions: Thêm, Sửa, Xóa (confirm dialog)
- Toolbar: Export Excel (nếu cần)

### Dropdowns cần load
| Dropdown | API | Value field | Display field |
|----------|-----|-------------|---------------|
| {Dropdown name} | {API path} | {value} | {display} |

## 5. Business Rules áp dụng
| Mã | Rule | Áp dụng cho |
|----|------|-------------|
| BR01 | {rule description} | BE: {endpoint} |
| BR02 | {rule description} | BE + FE: validation |
| ... | ... | ... |

## 6. Task Breakdown
### Thứ tự thực hiện
```
DB Migration → BE Repository → BE Service → BE Controller → FE Service → FE Component → FE Page
```

### Dependencies
- FE tasks chờ BE xong → đọc API contract
- BE tasks chờ DB migration xong

### Task List
| # | File | Mô tả | Depends on | Est. |
|---|------|-------|------------|------|
| 01 | db-migration | {desc} | — | 3 min |
| 02 | be-repository | {desc} | 01 | 5 min |
| ... | ... | ... | ... | ... |
```

---

### Bước 4: Sinh Task Files — MỖI FILE PHẢI ≥ 100 DÒNG

Tạo thư mục `.evnict/specs/{feature-slug}/tasks/` và sinh task files theo template:

```markdown
# Task {NN}: {be|fe|db}-{description}

## 1. Mục tiêu
{Mô tả cụ thể task này làm gì — 3-5 câu.
Nêu rõ input/output, layer nào trong architecture,
và kết quả mong đợi khi task hoàn thành.}

## 2. Business Context
Business rules liên quan đến task này (trích từ spec):
- BR{XX}: {rule description} — cách áp dụng trong task này
- BR{YY}: {rule description} — cách áp dụng trong task này

Luồng nghiệp vụ liên quan:
{Trích phần flow liên quan từ spec, giúp Agent hiểu WHY}

## 3. Files cần tạo/sửa
| File | Action | Mô tả |
|------|--------|-------|
| `src/.../XxxRepository.java` | CREATE | Repository JOOQ cho bảng {TABLE} |
| `src/.../XxxDTO.java` | CREATE | DTO với @JsonProperty UPPER_SNAKE |
| ... | ... | ... |

## 4. Implementation Guide
### Conventions phải tuân thủ (tham chiếu rules)
- Rule 03: Backend Conventions → {specific convention}
- Rule 05: Project Conventions → {specific convention}
- {Liệt kê CỤ THỂ rule nào, section nào áp dụng}

### Code Pattern tham khảo
Tham khảo file mẫu trong project: `{ReferenceFile.java}`

```java
// Pattern trích từ {ReferenceFile.java}
// Agent ĐÃ ĐỌC file thật và paste skeleton ở đây
@Repository
public class {EntityName}Repository extends BaseRepositoryImpl<...> {
    @Qualifier(DefineProperties.DSLContextNCPT)
    DSLContext dslContext;

    @Override
    public List<{EntityName}DTO> getAll(InputCondition input) {
        // JOOQ type-safe query
        // Pattern: select().from().where().fetch()
    }

    public int insert({EntityName}DTO dto) {
        // Pattern: dslContext.insertInto(TABLE).set(...).execute()
    }

    public int update({EntityName}DTO dto) {
        // Pattern: dslContext.update(TABLE).set(...).where(...).execute()
    }

    public int delete(Object id) {
        // Pattern: dslContext.deleteFrom(TABLE).where(...).execute()
    }
}
```

### Validation/Error handling
- {Mô tả cách xử lý lỗi theo convention dự án}
- {VD: throw BusinessException("message") cho business rule violations}

## 5. Test Cases (TDD — viết TRƯỚC)
| # | Test | Input | Expected | Type |
|---|------|-------|----------|------|
| 1 | {test_name} | {input description} | {expected result} | Unit |
| 2 | {test_name} | {input description} | {expected result} | Unit |
| 3 | {test_name} | {input description} | {expected result} | Unit |
| 4 | {test_name} | {input description} | {expected result} | Unit |
| 5 | {test_name} | {input description} | {expected result} | Unit |

### Test code skeleton
```java
@ExtendWith(MockitoExtension.class)
class {EntityName}{Layer}Test {
    // Arrange — mocks, test data
    // Act — call method under test
    // Assert — verify result + interactions
}
```

## 6. Acceptance Criteria
- [ ] {Criterion 1 — cụ thể, đo được}
- [ ] {Criterion 2}
- [ ] {Criterion 3}
- [ ] Code theo đúng conventions (rule {XX}, {YY})
- [ ] Unit tests pass (≥ {N} test cases)

## 7. Dependencies
- **Requires:** Task {XX} ({description}) hoàn thành
- **Blocks:** Task {YY} ({description}) — cần output của task này
- **Related:** {API Contract, handoff, other tasks}

## 8. Estimated: {N} phút
```

---

### Bước 5: Sinh API Contract
Từ API Design trong plan.md, tạo file `.evnict/specs/{feature-slug}/contracts/api-contract.yaml`:

```yaml
# contracts/api-contract.yaml
feature: {feature-name}
generated: {date}
endpoints:
  - method: POST
    path: /api/{module}/{action}
    description: {mô tả}
    request:
      body:
        fieldName: { type: string, required: true, maxLength: 100 }
    response:
      200:
        schema: ResponseData
        data:
          id: { type: number }
      400:
        schema: ResponseData
        error: { message: string }
```

### Bước 6: Quality Gate — KIỂM TRA TRƯỚC KHI HIỂN THỊ

Agent PHẢI tự kiểm tra trước khi hiển thị plan cho user:

| Check | Yêu cầu | Nếu fail |
|-------|---------|----------|
| Plan.md sections | Đủ 6 sections | Bổ sung section thiếu |
| Task file length | Mỗi file ≥ 100 dòng | Bổ sung chi tiết |
| Test cases | Mỗi task ≥ 3 test cases | Thêm test cases |
| Code patterns | Mỗi task có skeleton code từ file mẫu THẬT | Đọc lại file mẫu |
| Dependencies | Mỗi task ghi rõ Requires/Blocks | Bổ sung |
| Business rules | Task liên quan có trích BR từ spec | Trích bổ sung |
| API contract | File yaml tồn tại và đầy đủ endpoints | Bổ sung |

### Bước 7: Chờ Confirm
Hiển thị Plan đã Breakdown ra log cho User duyệt:
```
📋 Plan đã sinh:
  📄 plan.md — {N} dòng, {X} tasks
  📁 tasks/ — {X} files ({be_count} BE, {fe_count} FE, {db_count} DB)
  📜 contracts/api-contract.yaml

Quality Gate: ✅ PASSED (tất cả checks OK)

Bạn duyệt plan này không?
A) ✅ Approve — chạy /evnict-kit:implement
B) 📝 Sửa — feedback cụ thể
C) ❌ Hủy — xóa plan, quay lại spec
```

Sau khi người dùng Approve, hãy nhắc họ chạy lệnh: `/evnict-kit:implement`.

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

