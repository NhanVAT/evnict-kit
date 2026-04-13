# Init Rules — Khởi tạo Project Conventions
**Command:** `/evnict-kit:init-rules $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Mục đích
Đọc toàn bộ codebase → phân tích → tự động điền nội dung cho file `05-evnict-kit-project-conventions.md` (RP01-RP07).

## Pre-conditions
- Project đã init bằng `evnict-kit init`
- File `.agent/rules/05-evnict-kit-project-conventions.md` tồn tại (có placeholders)
- Codebase có source code để phân tích

---

## Workflow

### Task 1: Scan Project Structure
```bash
tree -L 3 --dirsfirst
```
Ghi nhận: package structure, module organization, config files.

### Task 2: RP01 — Naming Convention
Đọc 5-10 file Java/TypeScript → extract:
- Package naming pattern
- Class naming (Controller, Service, Repository, DTO)
- Method naming (CRUD verbs, prefixes)
- Variable naming
- File naming
- Table/Column naming (từ migration scripts hoặc JOOQ generated)

### Task 3: RP02 — Architecture Pattern
Phân tích:
- Folder structure → xác định architecture (MVC, Clean, Hexagonal)
- Layer dependencies (Controller→Service→Repository)
- Module organization (by feature, by layer)

### Task 4: RP03 — Coding Convention
Đọc code → extract:
- Indentation (tabs/spaces, size)
- Import ordering
- Method ordering
- Comment style
- Null handling
- Logging framework

### Task 5: RP04 — API Convention
Đọc Controller classes → extract:
- Base URL pattern
- HTTP method usage
- Request/Response format
- Pagination pattern
- Error format

### Task 6: RP05 — Database Convention
Đọc migration scripts, JOOQ config, application.yml → extract:
- Database type & version
- Schema structure
- Table/column naming
- PK pattern (sequence, UUID, identity)
- Audit columns

### Task 7: RP06 — Component Convention (Frontend only)
Đọc Angular files → extract:
- Component structure
- Selector prefix
- State management
- UI library usage
- Form handling

### Task 8: RP07 — Integration Map
Đọc config, dependencies, service files → extract:
- External services (SSO, MinIO, CMIS)
- Internal dependencies
- Cache, messaging, storage

### Task 9: Update File
Cập nhật `05-evnict-kit-project-conventions.md`:
1. Thay "⚠️ CHƯA ĐƯỢC KHỞI TẠO" bằng nội dung thực tế
2. Thêm code examples LẤY TỪ CODE THỰC TẾ (không mẫu generic)
3. Đổi header thành `✅ ĐÃ KHỞI TẠO — {date}`

### Task 10: Summary
Tạo `.agent/context/init-summary-backend.md` hoặc `init-summary-frontend.md`:
```markdown
# Init Summary — {date}
## Conventions found: {count}/7
## Files scanned: {count}
## Key findings:
- {finding 1}
- {finding 2}
```

---

## Bảo mật
- KHÔNG ghi secrets, IP nội bộ, URLs production vào rules
- KHÔNG ghi passwords, connection strings
- Chỉ ghi PATTERNS không ghi VALUES

## Output
```
✅ RP01 Naming: ACTIVE
✅ RP02 Architecture: ACTIVE
✅ RP03 Coding: ACTIVE
✅ RP04 API: ACTIVE
✅ RP05 Database: ACTIVE
✅ RP06 Component: ACTIVE (hoặc SKIPPED nếu BE only)
✅ RP07 Integration: ACTIVE
📄 Summary: .agent/context/init-summary-{type}.md
```
