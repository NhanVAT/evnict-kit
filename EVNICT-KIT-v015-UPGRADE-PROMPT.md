# EVNICT-KIT v0.1.5 — Upgrade Prompt
# Dùng trong Antigravity IDE + Opus 4.6
# Copy vào project evnict-kit → cho Agent đọc

---

## TÓM TẮT 4 THAY ĐỔI

| # | Vấn đề | Giải pháp |
|---|--------|-----------|
| 1 | Plan files sơ sài, thiếu nghiệp vụ | Rewrite plan command + task template chi tiết theo OpenSpec |
| 2 | Implement chạy hết tasks không tương tác user | Enforce STOP-AND-ASK sau mỗi subtask |
| 3 | Wiki skill yếu, bắt user chạy npm thủ công | Rewrite toàn bộ wiki skill theo llm-wiki pattern + auto workflow |
| 4 | Handoff sơ sài | Rewrite handoff với full context BE↔FE |

---

## THAY ĐỔI 1: Plan Command + Task Files Chi Tiết

### Vấn đề
`/evnict-kit:plan` sinh task files chỉ có tiêu đề + vài dòng acceptance criteria. Thiếu:
- Nghiệp vụ cụ thể (business rules liên quan)
- Database schema chi tiết (columns, types, constraints)
- API request/response format chi tiết
- UI mockup description (cho FE tasks)
- Code patterns cần follow (tham chiếu rules)

### Giải pháp

#### [MODIFY] `templates/commands/antigravity/evnict-kit-plan.md`
Rewrite từ 38 dòng → **120+ dòng**. Thêm:

**Plan.md phải chứa:**
```markdown
# Plan: {Feature Name}

## 1. Tổng quan
- Feature: {tên}
- Spec: .evnict/specs/{slug}/spec.md
- Estimated: {X} tasks, phân bổ BE:{N} / FE:{M} / DB:{K}
- Priority: {High/Medium/Low}

## 2. Database Schema
### Tables cần tạo/sửa
| Table | Column | Type | Nullable | FK | Mô tả |
|-------|--------|------|----------|-----|-------|
| LRS_CSUAT_GIO | ID | NUMBER | NO | PK | Primary key |
| LRS_CSUAT_GIO | DEPARTMENTID | VARCHAR2(50) | NO | FK→LRS_DEPARTMENT | Mã đơn vị |
| ... | ... | ... | ... | ... | ... |

### Migration script naming
- `V{YYYYMMDD}_{SEQ}__{description}.sql`

## 3. API Design
### Endpoints
| # | Method | Path | Auth | Mô tả |
|---|--------|------|------|-------|
| 1 | POST | /api/ncpt/csuat-gio/list | JWT | Danh sách (phân trang) |
| 2 | POST | /api/ncpt/csuat-gio/save | JWT | Thêm/sửa |
| 3 | POST | /api/ncpt/csuat-gio/delete | JWT | Xóa |

### Request/Response chi tiết cho mỗi endpoint
**POST /api/ncpt/csuat-gio/list**
```json
// Request
{
  "DEPARTMENTID": "string",
  "PROFILEID": "string", 
  "FROM_DATE": "yyyy-MM-dd",
  "TO_DATE": "yyyy-MM-dd",
  "page": 0,
  "size": 20
}
// Response (ResponseData wrapper)
{
  "success": true,
  "data": {
    "content": [{ "ID": 1, "DEPARTMENTID": "...", ... }],
    "totalElements": 100,
    "totalPages": 5
  }
}
```

## 4. Frontend Design
### Pages/Components
| # | Component | Type | Route | Mô tả |
|---|-----------|------|-------|-------|
| 1 | CsuatGioListComponent | Page | /csuat-gio | Danh sách + filter + CRUD |
| 2 | CsuatGioFormComponent | Dialog | — | Form thêm/sửa |

### UI Elements
- Filter bar: Department dropdown, Profile dropdown, Date range
- Table: columns mapped từ DTO
- Actions: Thêm, Sửa, Xóa (confirm dialog)
- Toolbar: Export Excel (nếu cần)

## 5. Business Rules áp dụng
| Mã | Rule | Áp dụng cho |
|----|------|-------------|
| BR01 | Không nhập trùng (DEPARTMENTID + PROFILEID + NGAY + GIO) | BE: save endpoint |
| BR02 | NGAY phải <= ngày hiện tại | BE + FE: validation |
| BR03 | Chỉ thao tác đơn vị của mình | BE: DataAuthorization |

## 6. Task Breakdown
### Thứ tự thực hiện
```
DB Migration → BE Repository → BE Service → BE Controller → FE Service → FE Component → FE Page
```
### Dependencies
- FE tasks chờ BE xong → đọc API contract
- BE tasks chờ DB migration xong
```

**Mỗi task file phải chứa (120+ dòng thay vì 20):**
```markdown
# Task {N}: {be|fe|db}-{description}

## 1. Mục tiêu
{Mô tả cụ thể task này làm gì — 3-5 câu}

## 2. Business Context
{Business rules liên quan đến task này, trích từ spec}
- BR01: {rule}
- BR03: {rule}

## 3. Files cần tạo/sửa
| File | Action | Mô tả |
|------|--------|-------|
| `src/.../CsuatGioRepository.java` | CREATE | Repository JOOQ cho bảng LRS_CSUAT_GIO |
| `src/.../CsuatGioDTO.java` | CREATE | DTO với @JsonProperty UPPER_SNAKE |

## 4. Implementation Guide
### Conventions phải tuân thủ (tham chiếu rules)
- Rule 03: Backend Conventions → Repository pattern
- Rule 05: Project Conventions → Naming, DTO pattern

### Code Pattern tham khảo
Tham khảo file mẫu trong project: `LrsDepartmentRepository.java`
```java
// Pattern cần follow
@Repository
public class CsuatGioRepository extends BaseRepositoryImpl<...> {
    @Override
    public List<CsuatGioDTO> getAll(InputCondition input) {
        // JOOQ type-safe query
    }
}
```

## 5. Test Cases (TDD — viết TRƯỚC)
| # | Test | Input | Expected | Type |
|---|------|-------|----------|------|
| 1 | getAll trả danh sách | valid filter | List<DTO>, success=true | Unit |
| 2 | getAll filter by department | departmentId="D001" | Chỉ data D001 | Unit |
| 3 | save thành công | valid DTO | saved entity, success=true | Unit |
| 4 | save trùng key | duplicate BR01 | error message | Unit |
| 5 | delete thành công | valid ID | success=true | Unit |

## 6. Acceptance Criteria
- [ ] Repository CRUD operations hoạt động
- [ ] Business rules BR01, BR03 enforced
- [ ] Unit tests pass (≥ 5 test cases)
- [ ] Code theo đúng conventions (rule 03, 05)

## 7. Dependencies
- Requires: Task 01 (DB Migration) hoàn thành
- Blocks: Task 03 (BE Service) — cần Repository
- Related: API Contract → FE sẽ cần

## 8. Estimated: 5 phút
```

---

## THAY ĐỔI 2: Implement PHẢI Tương Tác User

### Vấn đề
Agent chạy hết tất cả tasks liên tục mà không dừng hỏi user. User không có cơ hội review code từng task.

### Giải pháp

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-implement.md`
#### [MODIFY] `templates/skills/evnict-kit-tdd/SKILL.md`

Thêm **MANDATORY STOP** sau mỗi subtask. Agent KHÔNG ĐƯỢC tự động chuyển sang task tiếp:

```markdown
## QUY TẮC BẮT BUỘC: STOP-AND-ASK

### Sau MỖI subtask hoàn thành, Agent PHẢI DỪNG và hiển thị:

```
═══════════════════════════════════════════
✅ Task {N}/{Total}: {task_name} — HOÀN THÀNH
═══════════════════════════════════════════

📁 Files tạo/sửa:
  + src/.../CsuatGioRepository.java (NEW — 120 lines)
  + src/.../CsuatGioDTO.java (NEW — 45 lines)

🧪 Tests: 5/5 passed
📏 Lint: ✅ passed
🔨 Build: ✅ passed
📝 Commit: feat(ncpt): add CsuatGio repository [task-02]

───────────────────────────────────────────
❓ Bạn muốn làm gì tiếp?

  A) ✅ Approve — chuyển sang Task {N+1}: {next_task_name}
  B) 👀 Review code — tôi sẽ chờ feedback của bạn
  C) 🔄 Yêu cầu sửa — mô tả cần sửa gì
  D) ⏸️ Tạm dừng — lưu progress, tiếp tục sau
  E) ❌ Hủy task này — rollback commit

Chọn (A/B/C/D/E):
═══════════════════════════════════════════
```

### TUYỆT ĐỐI KHÔNG được:
- Tự động chạy task tiếp mà không hỏi
- Skip phần hiển thị kết quả
- Gộp nhiều tasks thành 1 lần chạy
- Bỏ qua test/lint results

### Khi user chọn B (Review):
Agent PHẢI hiển thị code diff cho mỗi file đã tạo/sửa:
```
📄 CsuatGioRepository.java (NEW):
[Hiển thị code với syntax highlighting]

📄 CsuatGioDTO.java (NEW):
[Hiển thị code]

Bạn có feedback gì không? (Gõ feedback hoặc "OK" để approve)
```

### Khi user chọn D (Tạm dừng):
Lưu progress vào `.evnict/specs/{feature}/progress.md`:
```markdown
# Progress: {feature}
## Completed: {N}/{Total}
- [x] Task 01: DB Migration
- [x] Task 02: BE Repository
- [ ] Task 03: BE Service ← NEXT
## Resume: /evnict-kit:implement (auto-detect progress)
```
```

---

## THAY ĐỔI 3: Wiki Skill Overhaul

### Vấn đề
- Wiki skill hiện chỉ có push/query cơ bản
- Bắt user chạy `npm run ingest` thủ công
- Không tích hợp vào cuối các workflow khác
- Không tận dụng llm-wiki sub-commands

### Giải pháp

#### [REWRITE] `templates/skills/evnict-kit-wiki/SKILL.md`
Rewrite toàn bộ từ 181 dòng → **300+ dòng**, tham khảo llm-wiki SKILL.md:

```markdown
---
name: evnict-kit-wiki
description: Quản lý knowledge base dự án bằng LLM Wiki. Push tri thức, query, ingest, lint, tự động archive. Tích hợp sẵn vào cuối mọi workflow.
---

# evnict-kit-wiki — Project Knowledge Base

## Sub-commands

| Command | Mô tả | Ví dụ |
|---------|-------|-------|
| push | Thêm tri thức mới vào wiki | Agent gọi sau feature/bugfix |
| query | Tìm kiếm tri thức | Agent gọi trước khi bắt đầu task |
| ingest | Xử lý raw notes thành wiki pages | Tự động sau push |
| status | Xem trạng thái wiki | Kiểm tra health |
| scan-code | Đọc code BE/FE → sinh wiki notes | Dùng cho dự án có sẵn code |

## Xác định Wiki Path (qua symlink)
1. Check symlink `{project_name}-wiki/` trong project root
2. Nếu không có → đọc `.evnict/config.yaml` → `wiki.folder`
3. Verify: tồn tại `config.yaml` + `raw/` + `wiki/` trong wiki path
4. Nếu chưa setup → báo: "Chạy /evnict-kit:init-wiki"

## Sub-command: PUSH
### Khi nào
- Sau khi hoàn thành feature (gọi bởi workflow archive-wiki)
- Sau khi fix bug (gọi bởi workflow bug-fix)  
- Sau khi fix ATTT (gọi bởi workflow attt)
- Khi user yêu cầu thêm tri thức thủ công

### Quy trình
1. Sinh markdown file với frontmatter chuẩn llm-wiki:
```yaml
---
title: "{title}"
url: ""
discovered: {YYYY-MM-DD}
topic: "{module/domain}"
tags: [{tags}]
source: "evnict-kit-auto"
type: feature|bugfix|attt|architecture|convention
---
```
2. Copy vào `{wiki_path}/raw/notes/{domain}-{slug}.md`
3. **TỰ ĐỘNG chạy ingest** (KHÔNG bắt user chạy npm thủ công):
```bash
cd {wiki_path} && node scripts/ingest.js
```
4. Nếu ingest fail → retry 1 lần → nếu vẫn fail → báo lỗi cụ thể
5. Confirm:
```
✅ Wiki pushed: {wiki_path}/raw/notes/{file}
✅ Ingest completed: {N} pages created/updated
```

### Nội dung push phải bao gồm
- Mô tả feature/bugfix (3-5 câu)
- API endpoints đã tạo/sửa (table format)
- Database changes (columns, migrations)
- Business rules áp dụng
- Key code patterns sử dụng
- Files thay đổi chính
- Lessons learned (nếu có)

## Sub-command: QUERY
### Khi nào  
- Trước khi bắt đầu feature mới → tìm context liên quan
- Khi fix bug → tìm chức năng bị bug đã được document chưa
- Khi brainstorm → explore cái đã có

### Quy trình
1. Đọc `{wiki_path}/wiki/INDEX.md` → map keywords
2. Đọc các wiki pages liên quan
3. Trả về context + source citations
4. Nếu wiki thiếu thông tin → gợi ý cần scan-code hoặc push thêm

## Sub-command: INGEST
### Quy trình
1. Scan `{wiki_path}/raw/` → tìm file chưa xử lý
2. Với mỗi file:
   - Tạo source summary → `wiki/sources/`
   - Trích xuất entities → `wiki/entities/`
   - Trích xuất concepts → `wiki/concepts/`
   - Thêm cross-references
3. Cập nhật `wiki/INDEX.md`
4. Ghi `wiki/LOG.md`

### QUAN TRỌNG
- KHÔNG BAO GIỜ sửa file trong `raw/`
- Trích dẫn nguồn: `[Nguồn: filename](../raw/path)`
- Nếu mâu thuẫn → giữ cả hai, ghi rõ

## Sub-command: SCAN-CODE
### Mục đích
Đọc code hiện có của dự án → sinh wiki notes cho tri thức chưa được document.

### Khi nào
- Dự án đã có sẵn code nhưng chưa có wiki
- Sau khi init-rules xong → scan-code để populate wiki

### Quy trình
1. Đọc AGENTS.md (context file) → hiểu project overview
2. Đọc `.agent/rules/05-*-project-conventions.md` → conventions đã detect
3. Scan source code:
   - Controllers → sinh wiki notes cho mỗi API module
   - Services → sinh wiki notes cho business logic
   - Entities/DTOs → sinh wiki notes cho data model
4. Đọc handoff files (nếu có) → kết hợp context từ BE/FE
5. Push tất cả vào wiki raw/notes/
6. Chạy ingest

### Output
```
Scanned: {N} controllers, {M} services, {K} entities
Generated: {X} wiki notes
Topics: {list of domains/modules}
```

## Sub-command: STATUS
Hiển thị:
```
📚 Wiki Status: {project_name}-wiki
══════════════════════════════════
  Raw sources: {N} files
  Wiki pages:  {M} pages
  Last push:   {date}
  Last ingest: {date}
  Health:      Good | Warning | Needs Attention
  Gaps:        {list}
```

## Tích hợp vào các Workflow khác
Mỗi workflow khi hoàn thành PHẢI gợi ý wiki:

### feature-large / feature-small
Sau archive → tự động push wiki → ingest

### bug-fix
Sau fix xong → gợi ý:
```
💡 Bug fix hoàn thành. Bạn muốn thêm tri thức vào wiki không?
A) Có — tôi sẽ tóm tắt bug + fix → push wiki
B) Không — skip
```

### attt
Sau fix ATTT → tự động push wiki (bắt buộc — ATTT fix luôn cần document)

### init (lần đầu)
Sau init-rules + init-context xong → gợi ý:
```
💡 Project đã có code sẵn. Chạy scan-code để tạo wiki từ codebase?
```
```

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-archive-wiki.md`
Sửa từ "nhắc user chạy npm" → "tự động chạy ingest":

```markdown
## Bước 3: Auto-ingest (THAY CHO npm run ingest thủ công)
Agent TRỰC TIẾP chạy:
```bash
cd {project_name}-wiki && node scripts/ingest.js
```
KHÔNG bắt user switch terminal hay chạy npm thủ công.
Nếu scripts/ingest.js không tồn tại → báo: "Chạy /evnict-kit:init-wiki"
```

#### [MODIFY] Tất cả workflows khác
Thêm vào cuối mỗi workflow (feature-small, bug-fix, attt):
```markdown
## Bước cuối: Wiki Integration
Gợi ý user thêm tri thức vào wiki (xem skill evnict-kit-wiki).
```

---

## THAY ĐỔI 4: Handoff Chi Tiết

### Vấn đề
Handoff hiện chỉ ghi status + list tasks. Thiếu:
- Code context (file nào đã tạo, pattern gì)
- DTO/Model mapping cho FE
- Validation rules cần sync
- Hướng dẫn cụ thể cho FE agent step-by-step

### Giải pháp

#### [REWRITE] `templates/commands/antigravity/evnict-kit-handoff.md`
Từ 58 dòng → **120+ dòng**

#### [MODIFY] `templates/skills/evnict-kit-coordinate/SKILL.md`

Handoff summary phải chứa **5 sections**:

```markdown
# Handoff: {Feature Name}
## From: Backend Agent → To: Frontend Agent
## Date: {timestamp}
## Spec: .evnict/specs/{feature}/spec.md

─────────────────────────────────────────

## 1. TỔNG QUAN ĐÃ LÀM (Backend)
### Mô tả
{3-5 câu tóm tắt những gì BE đã implement}

### Tasks đã hoàn thành
| # | Task | Files | Tests |
|---|------|-------|-------|
| 01 | DB Migration | V20250413_001__create_csuat_gio.sql | ✅ |
| 02 | Repository | CsuatGioRepository.java | ✅ 5/5 |
| 03 | Service | CsuatGioService.java (CsuatGioDTO.java) | ✅ 8/8 |
| 04 | Controller | NCPTController.java (3 endpoints) | ✅ 3/3 |

### Commits
```
abc1234 feat(ncpt): add LRS_CSUAT_GIO migration [task-01]
def5678 feat(ncpt): add CsuatGio repository+DTO [task-02]
...
```

─────────────────────────────────────────

## 2. API CONTRACT (Chi tiết cho Frontend)
**File đầy đủ:** `.evnict/handoff/contracts/{feature}-api.yaml`

### Quick Reference
| Method | Path | Mô tả | Auth |
|--------|------|-------|------|
| POST | /api/ncpt/csuat-gio/list | Danh sách (phân trang) | JWT |
| POST | /api/ncpt/csuat-gio/save | Thêm/sửa | JWT |
| POST | /api/ncpt/csuat-gio/delete | Xóa | JWT |

### DTO Structure (cho TypeScript interface)
```typescript
// Generate từ CsuatGioDTO.java
export interface CsuatGio {
  ID: number;
  DEPARTMENTID: string;
  DEPARTMENT_NAME?: string;
  PROFILEID: string;
  NGAY: string;        // yyyy-MM-dd
  GIO: number;
  GIATRI: number;
  STATUS: number;
  USER_CR_ID: string;
  USER_CR_DTIME: string;
  USER_MDF_ID: string;
  USER_MDF_DTIME: string;
}
```

### Validation Rules (PHẢI sync giữa BE↔FE)
| Field | Rule | Error Message |
|-------|------|---------------|
| DEPARTMENTID | Required | "Vui lòng chọn đơn vị" |
| PROFILEID | Required | "Vui lòng chọn Profile" |
| NGAY | Required, <= today | "Ngày phải <= ngày hiện tại" |
| GIO | Required, 0-23 | "Giờ phải từ 0-23" |
| GIATRI | Required, >= 0 | "Giá trị phải >= 0" |

### Response Format
```json
// Success
{ "success": true, "message": "OK", "data": { ... } }
// Error  
{ "success": false, "message": "Lỗi cụ thể", "data": null }
```

─────────────────────────────────────────

## 3. YÊU CẦU CHO FRONTEND
### Tasks cần làm
| # | Task | Mô tả | Priority |
|---|------|-------|----------|
| fe-01 | CsuatGioService | HTTP service gọi 3 API endpoints | High |
| fe-02 | CsuatGioListComponent | Trang danh sách + filter + pagination | High |
| fe-03 | CsuatGioFormComponent | Dialog form thêm/sửa | High |
| fe-04 | Routing + Menu | Thêm route + menu item | Medium |

### UI Requirements (từ spec)
- Filter: Department dropdown, Profile dropdown, Date range picker
- Table: PrimeNG p-table, sortable, paginator
- Form: PrimeNG dialog, reactive forms, validation sync với BE
- Actions: Thêm (toolbar), Sửa (row button), Xóa (confirm dialog)

### Dropdowns cần load
| Dropdown | API | Value field | Display field |
|----------|-----|-------------|---------------|
| Department | /api/danhmuc/department/list | DEPARTMENTID | DEPARTMENT_NAME |
| Profile | /api/danhmuc/profile/list | PROFILEID | DESC |

─────────────────────────────────────────

## 4. LƯU Ý ĐẶC BIỆT
- ResponseData wrapper: luôn check `response.success` trước khi dùng `response.data`
- Auth: JWT token tự động gắn bởi HTTP interceptor
- Date format: server nhận `yyyy-MM-dd`, display `dd/MM/yyyy`
- Audit fields (USER_CR_*, USER_MDF_*): server tự set, FE không cần gửi

─────────────────────────────────────────

## 5. HƯỚNG DẪN CHẠY
FE Agent mở project frontend:
1. Đọc file này: `.evnict/handoff/{feature}-handoff-be.md`
2. Đọc API contract: `.evnict/handoff/contracts/{feature}-api.yaml`
3. Chạy: `/evnict-kit:implement`
4. Agent sẽ tự detect FE tasks từ handoff và implement
```

---

## THAY ĐỔI BỔ SUNG

### Wiki init tự detect có sẵn
#### [MODIFY] `src/commands/init.js`
Trong phần wiki setup, thêm logic:
```javascript
// Check nếu workspace đã có wiki repo (clone trước đó hoặc có sẵn)
const existingWiki = readdirSync(cwd)
  .filter(f => f.endsWith('-wiki') || f === 'llm-wiki')
  .filter(f => existsSync(join(cwd, f, 'config.yaml')) || existsSync(join(cwd, f, 'config.example.yaml')));

if (existingWiki.length > 0) {
  // Hỏi user muốn dùng wiki nào
  console.log(`   📚 Phát hiện wiki repo có sẵn: ${existingWiki.join(', ')}`);
  // Interactive: chọn wiki repo hoặc tạo mới
}
```

### Version bump
#### [MODIFY] `package.json` + `bin/cli.js`
version: "0.1.4" → "0.1.5"

---

## CHECKLIST THỰC HIỆN

### Thay đổi 1: Plan chi tiết
- [ ] Rewrite `templates/commands/antigravity/evnict-kit-plan.md` → 120+ dòng
- [ ] Plan.md template có: DB schema, API design, FE design, Business rules, Task breakdown
- [ ] Task file template có: Business context, Implementation guide, Code patterns, Test cases chi tiết, Dependencies

### Thay đổi 2: Implement tương tác
- [ ] Sửa `templates/workflows/antigravity/evnict-kit-implement.md` — MANDATORY STOP rule
- [ ] Sửa `templates/skills/evnict-kit-tdd/SKILL.md` — STOP-AND-ASK format
- [ ] 5 options (A/B/C/D/E) sau mỗi subtask
- [ ] Progress file lưu khi tạm dừng

### Thay đổi 3: Wiki overhaul
- [ ] Rewrite `templates/skills/evnict-kit-wiki/SKILL.md` → 300+ dòng
- [ ] Sub-commands: push, query, ingest, status, scan-code
- [ ] Auto-ingest (node scripts/ingest.js thay vì npm run)
- [ ] Sửa `templates/workflows/antigravity/evnict-kit-archive-wiki.md` — auto-ingest
- [ ] Thêm wiki gợi ý vào cuối feature-small, bug-fix, attt workflows
- [ ] scan-code sub-command cho dự án có code sẵn

### Thay đổi 4: Handoff chi tiết
- [ ] Rewrite `templates/commands/antigravity/evnict-kit-handoff.md` → 120+ dòng
- [ ] Sửa `templates/skills/evnict-kit-coordinate/SKILL.md` — 5 sections handoff
- [ ] DTO TypeScript interface generation
- [ ] Validation rules sync table
- [ ] FE tasks + UI requirements

### Bổ sung
- [ ] `src/commands/init.js` — detect wiki repo có sẵn
- [ ] Version bump 0.1.5

---

## THỨ TỰ THỰC HIỆN

1. **Plan command + task templates** (thay đổi 1) — ảnh hưởng nhiều file nhất
2. **Implement STOP-AND-ASK** (thay đổi 2) — workflow + tdd skill
3. **Wiki overhaul** (thay đổi 3) — wiki skill + archive workflow + các workflow khác
4. **Handoff chi tiết** (thay đổi 4) — handoff command + coordinate skill
5. **Version + wiki detect** — init.js + metadata
6. **Test**: chạy feature-large → verify plan chi tiết, implement dừng hỏi, wiki auto-ingest, handoff đầy đủ
