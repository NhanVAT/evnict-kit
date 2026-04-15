---
description: Scan toàn bộ code BE+FE → sinh wiki notes cho mỗi module/chức năng. Dùng handoff để kết hợp tri thức từ cả 2 project.
---

# Wiki Scan Project
**Command:** `/evnict-kit:wiki-scan-project`

## Khi nào dùng
- Mới init evnict-kit cho dự án có sẵn code
- Dự án chưa có wiki hoặc wiki trống
- Muốn populate wiki ban đầu từ codebase

## Input
- Không cần input — tự detect project type

---

## Pre-checks

### Check 1: Wiki accessible
```bash
ls -la {project_name}-wiki/
```
Nếu không tồn tại → DỪNG: *"Wiki chưa được liên kết. Chạy `evnict-kit init` hoặc tạo symlink thủ công."*

### Check 2: Wiki đã setup
```bash
ls {project_name}-wiki/CLAUDE.md
```
Nếu không tồn tại → DỪNG: *"Wiki chưa khởi tạo. Chạy `/evnict-kit:init-wiki` trước."*

---

## Bước 1: Detect project type
Đang ở BE hay FE?
- Có `pom.xml` hoặc `build.gradle` → **Backend**
- Có `angular.json` → **Frontend (Angular)**
- Có `CLAUDE.md` + react dependency → **Frontend (React)**

---

## Bước 2: Scan code theo project type

### Nếu BACKEND:
1. **Đọc Controllers** → liệt kê tất cả API endpoints theo module
   ```bash
   find src/ -name "*Controller.java" -type f
   ```
   Với mỗi Controller: đọc file, trích `@RequestMapping`, `@GetMapping`, `@PostMapping`...

2. **Đọc Services** → liệt kê business logic, validations
   ```bash
   find src/ -name "*Service.java" -o -name "*ServiceImpl.java" -type f
   ```

3. **Đọc Repositories/DAOs** → liệt kê database queries, tables sử dụng
   ```bash
   find src/ -name "*Repository.java" -o -name "*Dao.java" -o -name "*DAO.java" -type f
   ```

4. **Đọc DTOs/Entities** → liệt kê data models, fields
   ```bash
   find src/ -name "*DTO.java" -o -name "*Entity.java" -type f
   ```

5. **Đọc Configurations** → liệt kê external integrations
   ```bash
   find src/ -name "*Config.java" -o -name "application*.yml" -o -name "application*.properties" -type f
   ```

### Nếu FRONTEND (Angular):
1. **Đọc Modules** → liệt kê feature modules
   ```bash
   find src/ -name "*.module.ts" -type f
   ```

2. **Đọc Components** → liệt kê pages, shared components
   ```bash
   find src/ -name "*.component.ts" -type f
   ```

3. **Đọc Services** → liệt kê API calls, state management
   ```bash
   find src/ -name "*.service.ts" -type f
   ```

4. **Đọc Routing** → liệt kê routes, menu structure
   ```bash
   find src/ -name "*routing*.ts" -o -name "*routes*.ts" -type f
   ```

5. **Đọc Models/Interfaces** → liệt kê TypeScript types
   ```bash
   find src/ -name "*.model.ts" -o -name "*.interface.ts" -type f
   ```

---

## Bước 3: Nhóm theo module
Phân tích kết quả scan → nhóm files theo module/chức năng.
Mỗi module CÓ THỂ bao gồm: Controller + Service + Repository + DTO + Component + Page.

---

## Bước 4: Sinh wiki notes — MỖI MODULE 1 FILE

Với mỗi module, LUÔN LUÔN tạo file vào thư mục `{wiki_path}/raw/notes/` với quy tắc tên `{domain}-{type}-{slug}.md`:
```markdown
---
title: "Module {module_name}"
discovered: {YYYY-MM-DD}
topic: "{project_name}"
tags: [{module, project_type, tech_stack}]
source: "evnict-kit-scan"
type: module
---

# ═══ PHẦN NGHIỆP VỤ ═══

## Mục đích chức năng
{Chức năng này giải quyết vấn đề gì cho user? — 3-5 câu}
{Agent ĐỌC code (controller methods, service logic) rồi SUY RA mục đích}

## Đối tượng sử dụng
{Ai dùng? Role nào? Quyền gì?}
{Suy ra từ: auth annotations, data authorization logic, role checks}

## Nghiệp vụ chính
{Mô tả TỪNG thao tác user có thể làm — nhập, sửa, xóa, tìm, xuất...}
{Suy ra từ: controller endpoints + service methods}

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
| BR01 | {Suy ra từ validation logic trong service/controller} |
| BR02 | {Suy ra từ unique constraints, foreign keys} |
| BR03 | {Suy ra từ authorization checks} |

## Liên kết chức năng
{Module này liên quan đến module nào khác?}
{Suy ra từ: foreign keys, service dependencies, shared DTOs}
- **{Module A}**: {mô tả liên kết — VD: dropdown lấy từ danh mục đơn vị}
- **{Module B}**: {mô tả liên kết}

# ═══ PHẦN KỸ THUẬT ═══

## API Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| {method} | {path} | {description từ annotation/comment} |

## Database Tables
{Tables sử dụng trong Repository/DAO}

## Services
{List services + public methods}

## Components (nếu FE)
| Component | Route | Mô tả |
|-----------|-------|-------|
| {name} | {route} | {description} |

## Files
{List all files thuộc module}
```

### Hướng dẫn viết phần Nghiệp vụ

Agent PHẢI đọc code rồi SUY RA nghiệp vụ, KHÔNG chỉ liệt kê code:

| Đọc code | Suy ra nghiệp vụ |
|----------|-------------------|
| Controller có POST /save + validation | → "Nhập mới: cần điền fields X, Y, Z. Validate: X bắt buộc, Y <= today" |
| Service check duplicate(dept+profile+date) | → "BR01: Không nhập trùng bộ key (Đơn vị + Profile + Ngày)" |
| Repository query filter by departmentId | → "Danh sách: lọc theo đơn vị" |
| Auth annotation @PreAuthorize | → "Phân quyền: chỉ role ADMIN được xóa" |
| FK đến bảng LRS_DEPARTMENT | → "Liên kết: dropdown chọn đơn vị từ danh mục" |
| Service gọi ExternalAPI (CMIS) | → "Tích hợp: upload file qua hệ thống CMIS" |

Mục tiêu: người đọc wiki note HIỂU ĐƯỢC chức năng làm gì MÀ KHÔNG CẦN đọc code.
Phần kỹ thuật bên dưới để Agent AI tra cứu khi cần implement.

Thêm 2 file đặc biệt:
- `{project_name}-architecture.md` — Kiến trúc tổng thể (tech stack, security, dual schema nếu có)
- `{project_name}-api-catalog.md` — Catalog toàn bộ API endpoints (nếu BE)

---

## Bước 5: Handoff cho project còn lại
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

Append vào `.evnict/handoff/handoff.md`:
```markdown
### [{YYYY-MM-DD}] {BE/FE}→{FE/BE}: Wiki Scan — Cần bổ sung
- **Trạng thái:** 🔴 Chờ xử lý
- **Mô tả:** Đã scan project {BE/FE} và sinh {N} wiki notes. Cần scan thêm project {FE/BE} để wiki đầy đủ.
- **Đã scan:** {N} modules, {M} API endpoints, {K} components
- **Wiki notes đã tạo:** {list files}
- **Mong muốn:** Scan {FE/BE} project, kết hợp với notes {BE/FE} để tạo bức tranh toàn diện
- **Kết quả xử lý:** _(Agent bên kia điền sau khi scan xong)_
```

---

## Bước 6: Auto-ingest
**Agent TỰ ĐỘNG thực hiện INGEST:**
Đọc tài liệu `SKILL.md` của `evnict-kit-wiki` và làm theo các bước trong **Sub-command: INGEST** để nạp tri thức từ `raw/notes/` vào cấu trúc `wiki/` (history.json, INDEX, entities...).
*(Lưu ý: Agent tự đọc và xử lý bằng các công cụ nội bộ, tuyệt đối KHÔNG in ra màn hình lệnh `cd ... && Agent follow ...` cho user)*
Nếu vẫn fail → báo: *"Chạy `/evnict-kit:init-wiki`"*

---

## Bước 7: Status report
```
📚 Wiki Scan Report
═══════════════════════
  Scanned: {type} project ({N} files đọc)
  Generated: {M} wiki notes
  Modules: {list}
  API Endpoints: {count} (nếu BE)
  Components: {count} (nếu FE)
  Ingest: ✅ completed
  
  ⚠️ Cần scan thêm {FE/BE} project — xem handoff request
```

---

## Lưu ý
- Scan KHÔNG xóa wiki notes cũ — chỉ thêm mới hoặc overwrite cùng tên
- Nếu đã scan trước đó → agent hỏi: "Wiki đã có notes. Overwrite hay skip?"
- Workflow này GỌI skill `evnict-kit-wiki` cho phần push + ingest
- Mỗi module 1 file — KHÔNG gộp tất cả vào 1 file khổng lồ

## Checklist hoàn thành
- [ ] Project type detected
- [ ] Code scanned theo type
- [ ] Modules identified và grouped
- [ ] Wiki notes sinh cho mỗi module
- [ ] Architecture note sinh
- [ ] API catalog sinh (nếu BE)
- [ ] Handoff request ghi (nếu cần scan project còn lại)
- [ ] Auto-ingest completed
- [ ] Status report hiển thị
