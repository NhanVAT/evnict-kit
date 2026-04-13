# EVNICT-KIT v0.1.6 — Upgrade Prompt

---

## TÓM TẮT 3 THAY ĐỔI

| # | Vấn đề | Giải pháp |
|---|--------|-----------|
| 1 | Wiki chỉ có skill, thiếu workflow riêng cho các case nạp tri thức | Thêm 3 workflows wiki mới |
| 2 | Handoff format sơ sài, thiếu template chuẩn | Cập nhật theo template có status emoji + structured entries |
| 3 | Không có hướng dẫn sử dụng cho người dùng | Tạo file GETTING-STARTED.md |

---

## THAY ĐỔI 1: Wiki Workflows

### Vấn đề
Skill `evnict-kit-wiki` có sub-commands (push/query/ingest/scan-code) nhưng **thiếu workflows** hướng dẫn Agent CÁCH SỬ DỤNG sub-commands đó cho từng tình huống cụ thể:

1. Sau feature xong → có spec.md, plan.md, task files, code → nạp hết vào wiki
2. Dự án có sẵn code (mới init) → cần scan code FE+BE → nạp vào wiki
3. Truy vấn tri thức → cần workflow rõ ràng

### Giải pháp: 3 workflows mới

#### [NEW] `templates/workflows/antigravity/evnict-kit-wiki-archive-feature.md`
**Trigger:** Sau khi hoàn thành feature (large hoặc small)
**80+ dòng**

```markdown
---
description: Nạp tri thức từ feature đã hoàn thành vào wiki — đọc spec, plan, task files, code changes → sinh wiki notes → auto-ingest
---

# Wiki Archive Feature
**Command:** `/evnict-kit:wiki-archive-feature`

## Khi nào dùng
- Sau khi hoàn thành feature-large hoặc feature-small
- Sau khi /evnict-kit:archive-wiki chạy xong (hoặc thay thế archive-wiki)
- Khi muốn nạp tri thức thủ công cho 1 feature cụ thể

## Input
- Feature slug (auto-detect từ `.evnict/specs/` gần nhất hoặc chỉ định)

## Workflow

### Bước 1: Thu thập đầu vào
Đọc TẤT CẢ files liên quan đến feature:

| Nguồn | Path | Nội dung trích xuất |
|-------|------|---------------------|
| Spec | `.evnict/specs/{feature}/spec.md` | WHAT, WHY, Business Rules, Acceptance Criteria |
| Plan | `.evnict/specs/{feature}/plan.md` | DB Schema, API Design, FE Design, Task breakdown |
| Task files | `.evnict/specs/{feature}/tasks/*.md` | Implementation details, test cases |
| API Contract | `.evnict/handoff/contracts/{feature}-api.yaml` | Endpoints, request/response |
| Git log | `git log --oneline main..HEAD` | Commits, files changed |
| Handoff | `.evnict/handoff/{feature}-handoff-*.md` | Cross-project context |

### Bước 2: Sinh wiki note
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

## Tổng quan
{Trích từ spec: WHAT + WHY — 5-10 câu}

## Nghiệp vụ
### Business Rules
{Trích từ spec: BR01, BR02...}

### Luồng chính
{Trích từ spec: Main Flow}

### Luồng ngoại lệ
{Trích từ spec: Exception Flow}

## Kỹ thuật
### Database
{Trích từ plan: tables, columns, relationships}

### API Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
{Trích từ plan hoặc API contract}

### Backend
- Controller: {file, endpoints}
- Service: {file, business logic}
- Repository: {file, JOOQ queries}
- DTO: {file, fields}

### Frontend
- Component: {file, mô tả}
- Service: {file, API calls}
- Page: {route, mô tả}

## Files liên quan
{List files created/modified}

## Tham chiếu
- Spec: `.evnict/specs/{feature}/spec.md`
- Plan: `.evnict/specs/{feature}/plan.md`
- API Contract: `.evnict/handoff/contracts/{feature}-api.yaml`
```

### Bước 3: Push + Auto-ingest
```bash
cp {generated_file} {wiki_path}/raw/notes/{module}-{feature-slug}.md
cd {wiki_path} && node scripts/ingest.js
```

### Bước 4: Confirm
```
✅ Wiki note created: {wiki_path}/raw/notes/{file}
   Nội dung: {N} sections, {M} API endpoints, {K} business rules
✅ Ingest completed
```
```

---

#### [NEW] `templates/workflows/antigravity/evnict-kit-wiki-scan-project.md`
**Trigger:** Khi dự án có sẵn code, mới init, cần nạp tri thức toàn bộ
**120+ dòng**

```markdown
---
description: Scan toàn bộ code BE+FE → sinh wiki notes cho mỗi module/chức năng. Dùng handoff để kết hợp tri thức từ cả 2 project.
---

# Wiki Scan Project
**Command:** `/evnict-kit:wiki-scan-project`

## Khi nào dùng
- Mới init evnict-kit cho dự án có sẵn code
- Dự án chưa có wiki hoặc wiki trống
- Muốn populate wiki ban đầu từ codebase

## Workflow

### Bước 1: Detect project type
Đang ở BE hay FE? (pom.xml → BE, angular.json → FE)

### Bước 2: Scan code theo project type

**Nếu BACKEND:**
1. Đọc Controllers → liệt kê tất cả API endpoints theo module
2. Đọc Services → liệt kê business logic, validations
3. Đọc Repositories/DAOs → liệt kê database queries, tables sử dụng
4. Đọc DTOs/Entities → liệt kê data models, fields
5. Đọc Configurations → liệt kê external integrations

**Nếu FRONTEND:**
1. Đọc Modules → liệt kê feature modules
2. Đọc Components → liệt kê pages, shared components
3. Đọc Services → liệt kê API calls, state management
4. Đọc Routing → liệt kê routes, menu structure
5. Đọc Models/Interfaces → liệt kê TypeScript types

### Bước 3: Sinh wiki notes — MỖI MODULE 1 FILE
Ví dụ project NCPT BE:
```
raw/notes/ncpt-danhmuc-module.md        ← Module Danh mục (Department, Profile, Calendar)
raw/notes/ncpt-nhapsolieu-module.md     ← Module Nhập số liệu (CSV import, file management)
raw/notes/ncpt-phutaidien-module.md     ← Module Phụ tải điện (Oracle procedures)
raw/notes/ncpt-baocao-module.md         ← Module Báo cáo (JXLS + Aspose)
raw/notes/ncpt-quanly-module.md         ← Module Quản trị hệ thống (Users, Permissions)
raw/notes/ncpt-architecture.md          ← Kiến trúc tổng thể (dual schema, security...)
raw/notes/ncpt-api-catalog.md           ← Catalog toàn bộ API endpoints
```

### Bước 4: Handoff cho project còn lại
Nếu feature cần cả BE+FE:

**Sinh handoff request:**
```
┌─────────────────────────────────────────────────┐
│  📋 Wiki Scan — Cần bổ sung từ {FE/BE}         │
│                                                  │
│  Tôi đã scan project {BE/FE} và sinh {N} notes. │
│  Để wiki đầy đủ, cần scan thêm project {FE/BE}.│
│                                                  │
│  👉 Mở AI Agent trong project {FE/BE}, chạy:    │
│     /evnict-kit:wiki-scan-project                │
│                                                  │
│  Agent sẽ đọc handoff và kết hợp tri thức.      │
└─────────────────────────────────────────────────┘
```

Ghi vào `.evnict/handoff/wiki-scan-request.md`:
```markdown
# Wiki Scan Request
## From: {BE/FE} Agent → To: {FE/BE} Agent
## Date: {timestamp}
## Status: 🔴 Chờ xử lý

### Đã scan
- {N} modules, {M} API endpoints, {K} components
- Files: {list wiki notes đã tạo}

### Cần bổ sung
- Scan {FE/BE} project để bổ sung UI components, routes, services
- Kết hợp với notes BE để tạo bức tranh toàn diện

### Kết quả xử lý
(Agent bên kia điền sau khi scan xong)
```

### Bước 5: Auto-ingest
```bash
cd {wiki_path} && node scripts/ingest.js
```

### Bước 6: Status report
```
📚 Wiki Scan Report
═══════════════════════
  Scanned: {type} project ({N} files đọc)
  Generated: {M} wiki notes
  Modules: {list}
  API Endpoints: {count}
  Ingest: ✅ completed
  
  ⚠️ Cần scan thêm {FE/BE} project — xem handoff request
```
```

---

#### [NEW] `templates/workflows/antigravity/evnict-kit-wiki-query.md`
**Trigger:** Khi cần truy vấn tri thức
**50+ dòng**

```markdown
---
description: Truy vấn tri thức từ wiki — tìm kiếm theo keyword, domain, tags. Trả context cho Agent sử dụng.
---

# Wiki Query
**Command:** `/evnict-kit:wiki-query "từ khóa"`

## Khi nào dùng
- Trước khi bắt đầu feature mới → tìm context liên quan
- Khi fix bug → tìm thông tin chức năng bị bug
- Khi cần hiểu business rule → tìm trong wiki
- Khi onboard → tìm hiểu module

## Workflow

### Bước 1: Xác định wiki path (symlink)
Check `{project_name}-wiki/` → fallback `.evnict/config.yaml`

### Bước 2: Search
1. Đọc `{wiki_path}/wiki/INDEX.md` → map keywords
2. Tìm wiki pages chứa keyword/domain/tags
3. Đọc các pages liên quan (đọc đủ, không chỉ 1-2 trang)

### Bước 3: Trả kết quả
```
📚 Wiki Query: "{keyword}"
═══════════════════════════
Tìm thấy {N} trang liên quan:

1. {page_name} — {1 dòng mô tả}
   Tags: {tags}
   
2. {page_name} — {1 dòng mô tả}

───────────────────────────
## Context trích xuất:
{Tổng hợp nội dung liên quan từ các trang}

## Nguồn:
- [[{page_1}]]
- [[{page_2}]]
```

### Bước 4: Lưu synthesis (nếu phân tích sâu)
Nếu query dẫn đến so sánh/phân tích → lưu vào `{wiki_path}/wiki/syntheses/`
```
```

---

### Cập nhật workflows hiện có

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-archive-wiki.md`
Thêm reference đến workflow mới:
```markdown
## Lưu ý
Workflow này là shortcut. Để nạp tri thức chi tiết hơn, dùng:
- `/evnict-kit:wiki-archive-feature` — nạp đầy đủ từ spec+plan+code
- `/evnict-kit:wiki-scan-project` — scan toàn bộ codebase
- `/evnict-kit:wiki-query` — truy vấn tri thức
```

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-feature-large.md`
Phase 4 Archive → thay reference:
```markdown
## Phase 4: Archive + Wiki
**Trigger:** `/evnict-kit:wiki-archive-feature` (thay vì archive-wiki)
```

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-bug-fix.md`
#### [MODIFY] `templates/workflows/antigravity/evnict-kit-attt.md`
#### [MODIFY] `templates/workflows/antigravity/evnict-kit-feature-small.md`
Cuối mỗi workflow, sửa gợi ý wiki cụ thể hơn:
```markdown
## Bước cuối: Wiki
💡 Thêm tri thức vào wiki?
A) Có — chạy `/evnict-kit:wiki-archive-feature` (nạp đầy đủ)
B) Nhanh — tôi tóm tắt ngắn gọn → push wiki
C) Không — skip
```

---

## THAY ĐỔI 2: Handoff Format Chuẩn

### Vấn đề
Handoff hiện tại dùng format riêng. User muốn dùng format chuẩn **Handoff Log** — structured entries với status emoji, mỗi entry là 1 issue/request.

### Giải pháp

#### Template handoff chuẩn
File `.evnict/handoff/handoff.md` — dùng chung cho TẤT CẢ trao đổi, không tạo file riêng mỗi feature:

```markdown
# Agent Handoff Log
> File này dùng để trao đổi giữa BE Agent và FE Agent.
> Mỗi issue ghi theo format bên dưới.

---

## Template
### [YYYY-MM-DD] {FE→BE | BE→FE}: Tiêu đề ngắn
- **Trạng thái:** 🔴 Chờ xử lý | 🟡 Đang xử lý | 🟢 Đã xử lý
- **Mô tả:** ...
- **API liên quan:** METHOD /endpoint
- **Request/Response mẫu:** ...
- **Mong muốn:** ...
- **File liên quan:** ...
- **Kết quả xử lý:** (bên nhận điền sau khi fix)

---

## Entries

### [2025-06-15] BE→FE: Feature "Quản lý công suất giờ" — Handoff
- **Trạng thái:** 🔴 Chờ xử lý
- **Mô tả:** BE đã hoàn thành API CRUD cho bảng LRS_CSUAT_GIO. Cần FE implement UI.
- **API liên quan:**
  - POST /api/ncpt/csuat-gio/list — Danh sách (phân trang)
  - POST /api/ncpt/csuat-gio/save — Thêm/sửa
  - POST /api/ncpt/csuat-gio/delete — Xóa
- **Request/Response mẫu:**
  ```json
  // POST /api/ncpt/csuat-gio/list
  Request: { "DEPARTMENTID": "D001", "page": 0, "size": 20 }
  Response: { "success": true, "data": { "content": [...], "totalElements": 100 } }
  ```
- **Mong muốn:** FE tạo page danh sách + form CRUD theo PrimeNG conventions
- **File liên quan:**
  - DTO: `src/.../CsuatGioDTO.java`
  - Controller: `src/.../NCPTController.java` (3 endpoints mới)
  - API Contract: `.evnict/handoff/contracts/csuat-gio-api.yaml`
  - Spec: `.evnict/specs/csuat-gio/spec.md`
- **Kết quả xử lý:** _(FE Agent điền sau khi implement xong)_

---
```

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-handoff.md`
Sửa Bước 3 (sinh handoff file):
- Thay vì tạo file riêng `{feature}-handoff-be.md` → **APPEND entry** vào `handoff.md`
- Giữ format 5 sections chi tiết (API contract, DTO TypeScript, validation...) nhưng gói gọn trong 1 entry
- Status mặc định: 🔴 Chờ xử lý
- Khi Agent bên kia xử lý xong → update status thành 🟢 Đã xử lý

#### [MODIFY] Init workflow
Khi init workspace, tạo sẵn file `handoff.md` với template:
```javascript
// Trong src/commands/init.js, phần tạo handoff/
writeFile(join(evnictDir, 'handoff/handoff.md'), HANDOFF_TEMPLATE, {cwd, silent:true});
```

#### [MODIFY] Skill `evnict-kit-coordinate`
Cập nhật action HANDOFF:
- Đọc + append vào `handoff.md` (không tạo file mới)
- Update status entry khi xử lý xong
- Format entry theo template chuẩn

---

## THAY ĐỔI 3: User Guide — GETTING-STARTED.md

### Vấn đề
Người dùng không biết các workflow, quên lệnh, không biết case nào dùng workflow nào.

### Giải pháp

#### [NEW] `templates/GETTING-STARTED.md`
File này deploy vào **mỗi project** khi init (ngang hàng với AGENTS.md).
**200+ dòng**, nội dung:

```markdown
# EVNICT-KIT — Hướng Dẫn Sử Dụng
> File này được tạo bởi evnict-kit v0.1.6
> Đọc file này để biết dùng workflow nào cho công việc nào

---

## 📋 Danh sách Workflows theo Case Công Việc

### 🚀 Lần đầu setup dự án
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `evnict-kit init` | Chạy ở terminal workspace, tạo cấu trúc |
| 2 | `/evnict-kit:init-rules` | Mở Agent trong project, Agent đọc code → điền rules |
| 3 | `/evnict-kit:init-context` | Agent sinh file AGENTS.md từ rules |
| 4 | `/evnict-kit:init-check` | Agent sinh demo code để verify conventions |
| 5 | `/evnict-kit:init-wiki` | Setup wiki repo (nếu chưa có) |
| 6 | `/evnict-kit:wiki-scan-project` | Scan code hiện có → nạp wiki |

### 🔧 Phát triển Feature LỚN (cần cả BE + FE + DB)
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:feature-large "mô tả"` | Brainstorm → Spec → Clarify |
| 2 | `/evnict-kit:plan` | Sinh plan + task files chi tiết |
| 3 | `/evnict-kit:implement` | TDD per subtask (STOP-AND-ASK) |
| 4 | `/evnict-kit:handoff` | Chuyển giao cho FE/BE Agent |
| 5 | `/evnict-kit:review` | Auto review trước merge |
| 6 | `/evnict-kit:wiki-archive-feature` | Nạp tri thức vào wiki |

### 🔨 Phát triển Feature NHỎ (sửa UI, thêm field)
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:feature-small "mô tả"` | Query wiki → plan nhanh |
| 2 | `/evnict-kit:implement` | TDD implement |
| 3 | `/evnict-kit:wiki-archive-feature` | Nạp wiki (nếu > 20 dòng) |

### 🐛 Sửa Bug
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:bug-fix "mô tả bug"` | Query wiki → classify → TDD fix |
| 2 | `/evnict-kit:wiki-archive-feature` | Nạp wiki (tùy chọn) |

### 🔒 Kiểm tra / Fix ATTT
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:attt --scan` | Quét toàn bộ project |
| 2 | `/evnict-kit:attt "module"` | Check module cụ thể |
| 3 | Wiki tự động push | ATTT fix luôn nạp wiki |

### 📚 Wiki — Quản lý Tri thức
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:wiki-query "từ khóa"` | Tìm thông tin trước khi làm task |
| `/evnict-kit:wiki-archive-feature` | Nạp tri thức sau khi xong feature |
| `/evnict-kit:wiki-scan-project` | Scan code → nạp wiki (lần đầu) |
| `/evnict-kit:init-wiki` | Setup wiki repo |

### 🤝 Handoff — Trao đổi giữa BE↔FE
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:handoff` | BE xong API → chuyển cho FE |
| Đọc `handoff.md` | FE mở project → đọc yêu cầu từ BE |

### 👀 Review + Merge
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:review` | Trước khi merge PR |
| `/evnict-kit:finish-branch` | Merge/PR/cleanup branch (tham khảo skill) |

### 👋 Onboard Member Mới
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:wiki-query "overview"` | Tìm hiểu project |
| Đọc `AGENTS.md` | Context file tổng quan |
| Đọc `GETTING-STARTED.md` | File này! |

---

## 📂 Cấu trúc thư mục Agent
```
.agent/
├── rules/          ← 5 files: quy tắc chung, security, BE, FE, project
├── skills/         ← 22 folders: kỹ năng cho Agent  
├── workflows/      ← 17 files: quy trình cho từng loại công việc
└── context/        ← Context bổ sung
AGENTS.md           ← Context file chính (Agent đọc đầu tiên)
Instruct-Agent-AI.md ← Hướng dẫn init rules/context
GETTING-STARTED.md  ← File này — hướng dẫn sử dụng
```

## ⚡ Quick Tips
- Mọi lệnh `/evnict-kit:xxx` gõ trong Agent chat, không phải terminal
- Agent tự biết đọc workflow file khi nhận lệnh
- Tri thức wiki dùng chung giữa BE+FE (qua symlink)
- Handoff dùng file `.evnict/handoff/handoff.md` — mở để xem yêu cầu từ Agent khác
- Sau mỗi feature → nhớ nạp wiki (Agent sẽ gợi ý)

## 🆘 Khi gặp vấn đề
- Agent không hiểu lệnh → kiểm tra file workflow trong `.agent/workflows/`
- Wiki treo → check symlink: `ls -la {project_name}-wiki/`
- Handoff không thấy → check `.evnict/handoff/handoff.md`
- Muốn thêm project → chạy `evnict-kit add <folder>` ở terminal workspace
```

#### [MODIFY] `src/commands/init.js`
Deploy `GETTING-STARTED.md` vào mỗi project:
```javascript
// Trong deployToProject(), sau phần Instruct:
const guideTemplate = join(TEMPLATES_DIR, 'GETTING-STARTED.md');
if (existsSync(guideTemplate)) {
  let content = readFileSync(guideTemplate, 'utf8');
  content = content.replaceAll('{project_name}', name);
  writeFile(join(projectPath, 'GETTING-STARTED.md'), content, {cwd});
}
```

---

## CHECKLIST THỰC HIỆN

### Thay đổi 1: Wiki Workflows (3 files mới)
- [ ] `templates/workflows/antigravity/evnict-kit-wiki-archive-feature.md` — 80+ dòng
- [ ] `templates/workflows/antigravity/evnict-kit-wiki-scan-project.md` — 120+ dòng
- [ ] `templates/workflows/antigravity/evnict-kit-wiki-query.md` — 50+ dòng
- [ ] Sửa `evnict-kit-archive-wiki.md` — reference workflows mới
- [ ] Sửa `evnict-kit-feature-large.md` — Phase 4 reference wiki-archive-feature
- [ ] Sửa `evnict-kit-bug-fix.md` — cuối workflow gợi ý 3 options (A/B/C)
- [ ] Sửa `evnict-kit-attt.md` — cuối workflow gợi ý wiki
- [ ] Sửa `evnict-kit-feature-small.md` — cuối workflow gợi ý 3 options

### Thay đổi 2: Handoff Format
- [ ] Sửa `templates/workflows/antigravity/evnict-kit-handoff.md` — dùng append entry format
- [ ] Sửa `templates/skills/evnict-kit-coordinate/SKILL.md` — HANDOFF action append
- [ ] Sửa `src/commands/init.js` — tạo handoff.md template khi init
- [ ] Handoff entry format: date, direction, status emoji, API, request/response, files

### Thay đổi 3: User Guide
- [ ] `templates/GETTING-STARTED.md` — 200+ dòng
- [ ] Sửa `src/commands/init.js` — deploy GETTING-STARTED.md vào mỗi project
- [ ] Nội dung: workflows theo case, cấu trúc folder, quick tips, troubleshooting

### Metadata
- [ ] `package.json` version → 0.1.6
- [ ] `bin/cli.js` version string → v0.1.6

---

## THỨ TỰ THỰC HIỆN

1. **GETTING-STARTED.md** — nhanh nhất, impact lớn nhất cho user experience
2. **Handoff format** — sửa template + coordinate skill + init.js
3. **3 Wiki workflows** — mới hoàn toàn, cần viết kỹ
4. **Sửa workflows hiện có** — reference wiki mới, gợi ý cuối workflow
5. **Version bump + test**

---

## LƯU Ý

### Wiki workflows vs Wiki skill
- **Skill** `evnict-kit-wiki` chứa logic CỤ THỂ (cách push, format frontmatter, ingest command)
- **Workflows** mới chứa QUY TRÌNH cho từng case (đầu vào nào, đọc gì, sinh gì, gọi skill nào)
- Workflows GỌI skill, không duplicate logic

### Handoff — 1 file thay vì nhiều file
- TRƯỚC: mỗi feature tạo `{feature}-handoff-be.md` riêng → nhiều file, khó theo dõi
- SAU: 1 file `handoff.md` duy nhất → append entries → dễ đọc, dễ track status
- Giữ lại `contracts/{feature}-api.yaml` riêng cho API contract (file YAML không gộp)

### GETTING-STARTED.md vs AGENTS.md
- `AGENTS.md` = context KỸ THUẬT cho Agent đọc (tech stack, conventions, commands)
- `GETTING-STARTED.md` = hướng dẫn cho NGƯỜI DÙNG đọc (case nào dùng workflow nào)
- 2 file khác mục đích, đều cần thiết