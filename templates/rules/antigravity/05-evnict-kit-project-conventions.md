---
trigger: always_on
---
# Project Conventions — EVNICT Standard
**Activation Mode: Always On**
**Source: QĐ-TTPM Phụ lục IV — Hướng dẫn thiết lập ngữ cảnh**

> **⚠️ FILE NÀY CẦN ĐƯỢC KHỞI TẠO BỞI AI AGENT**
> Chạy `/evnict-kit:init-rules` → Agent đọc codebase → tự động điền nội dung.
> Các section bên dưới chứa placeholder — Agent sẽ thay thế bằng conventions thực tế của dự án.

---

## RP01 — NAMING CONVENTION

> ⚠️ **CHƯA ĐƯỢC KHỞI TẠO** — Agent cần scan codebase để xác định naming conventions.

### Khi khởi tạo, Agent sẽ điền:
- Package/namespace naming pattern
- Class naming pattern (Controller, Service, Repository, DTO, Entity)
- Method naming pattern (CRUD, search, business operations)
- Variable naming pattern (fields, locals, constants)
- File naming pattern
- Database table/column naming pattern
- API path naming pattern

### Format mẫu (Agent sẽ điền theo dự án thực tế):
```
Package:    com.evn.{project}.{module}
Class:      {Module}{Type}.java (VD: CustomerService.java)
Method:     camelCase, prefix: find/get/create/update/delete
Variable:   camelCase, descriptive
Constant:   UPPER_SNAKE_CASE
Table:      UPPER_SNAKE_CASE (VD: CUSTOMER, DON_VI)
Column:     UPPER_SNAKE_CASE (VD: CREATED_DATE, DON_VI_ID)
API:        /api/{module}/{action} (VD: /api/customers/search)
```

---

## RP02 — ARCHITECTURE PATTERN

> ⚠️ **CHƯA ĐƯỢC KHỞI TẠO** — Agent cần scan codebase để xác định kiến trúc.

### Khi khởi tạo, Agent sẽ điền:
- Overall architecture (MVC, Clean Architecture, Hexagonal...)
- Layer structure (Controller → Service → Repository)
- Module organization (by feature, by layer, hybrid)
- Dependency direction rules
- Cross-cutting concerns (logging, auth, exception handling)

### Format mẫu:
```
Architecture: Layered MVC
Layers:
  1. Controller — HTTP handling, input validation
  2. Service — Business logic, transaction management
  3. Repository — Data access (JOOQ/JPA)
  4. DTO/Entity — Data transfer / persistence

Module Structure:
  src/main/java/com/evn/{project}/
  ├── config/          ← Application configuration
  ├── common/          ← Shared utilities, base classes
  ├── security/        ← Auth, JWT, filters
  └── {module}/        ← Feature modules
      ├── controller/
      ├── service/
      ├── repository/
      └── dto/
```

---

## RP03 — CODING CONVENTION

> ⚠️ **CHƯA ĐƯỢC KHỞI TẠO** — Agent cần scan codebase để xác định coding style.

### Khi khởi tạo, Agent sẽ điền:
- Indentation (tabs vs spaces, size)
- Import ordering
- Method ordering within class
- Comment style
- Exception handling pattern
- Logging convention
- Null handling (Optional, null checks, annotations)

### Format mẫu:
```
Indentation: 4 spaces (Java), 2 spaces (TypeScript/HTML/SCSS)
Max line length: 120 characters
Import order: java.*, javax.*, org.*, com.*, static
Method order: public → protected → private
Logging: SLF4J with Lombok @Slf4j
Null: @Nullable/@NonNull annotations, Optional for return types
```

---

## RP04 — API CONVENTION

> ⚠️ **CHƯA ĐƯỢC KHỞI TẠO** — Agent cần scan codebase để xác định API patterns.

### Khi khởi tạo, Agent sẽ điền:
- Base URL pattern
- HTTP method usage (GET/POST/PUT/DELETE)
- Request/Response format (ResponseData wrapper)
- Pagination pattern
- Error response format
- Authentication header format
- API versioning (if any)

### Format mẫu:
```
Base URL:     /api/{module}
Response:     ResponseData { status, message, data }
Pagination:   ?page=0&size=20&sort=name
Auth Header:  Authorization: Bearer {token}
Error:        ResponseData { status: 1, message: "...", data: null }

Endpoints:
  GET    /api/{module}          → List (paginated)
  GET    /api/{module}/{id}     → Get by ID
  POST   /api/{module}          → Create
  PUT    /api/{module}/{id}     → Update
  DELETE /api/{module}/{id}     → Delete
  POST   /api/{module}/search   → Complex search
```

---

## RP05 — DATABASE CONVENTION

> ⚠️ **CHƯA ĐƯỢC KHỞI TẠO** — Agent cần scan codebase để xác định DB patterns.

### Khi khởi tạo, Agent sẽ điền:
- Database type & version
- Schema structure (single/multi schema)
- Table naming convention
- Column naming convention
- Primary key pattern (sequence, UUID, identity)
- Foreign key naming
- Index naming
- Audit columns (created_by, created_date, etc.)
- Soft delete pattern (if used)

### Format mẫu:
```
Database:     Oracle 19c
Schemas:      EVNTMS (system), {PROJECT} (business)
Table:        UPPER_SNAKE (VD: CUSTOMER, HD_DIEN)
Column:       UPPER_SNAKE (VD: TEN_KH, MA_DON_VI)
PK:           ID (NUMBER, sequence {TABLE}_SEQ)
FK:           {TABLE}_{REF_TABLE}_FK
Index:        IX_{TABLE}_{COLUMNS}
Audit:        CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE
Soft delete:  IS_DELETED (NUMBER(1)) hoặc STATUS = 'DELETED'
```

---

## RP06 — COMPONENT CONVENTION (Frontend)

> ⚠️ **CHƯA ĐƯỢC KHỞI TẠO** — Agent cần scan codebase để xác định component patterns.

### Khi khởi tạo, Agent sẽ điền:
- Component file structure
- Shared vs feature-specific components
- Naming convention (selector prefix, file names)
- State management pattern
- UI library usage (PrimeNG components)
- Form handling pattern (Reactive Forms vs Template-driven)
- Routing pattern

### Format mẫu:
```
Selector prefix: app-
File structure:  {name}.component.ts/html/scss
Shared path:     src/app/shared/components/
Feature path:    src/app/features/{module}/components/
State:           Service + BehaviorSubject (no NgRx)
UI Library:      PrimeNG 16+
Forms:           Reactive Forms (FormBuilder)
Routing:         Lazy-loaded feature modules
```

---

## RP07 — INTEGRATION MAP

> ⚠️ **CHƯA ĐƯỢC KHỞI TẠO** — Agent cần scan codebase để xác định integrations.

### Khi khởi tạo, Agent sẽ điền:
- External services integrated (SSO, MinIO, CMIS, etc.)
- Internal service dependencies
- Message queues / event systems
- Caching strategy
- File storage
- Email/notification services

### Format mẫu:
```
Authentication:  EVN SSO → JWT (RS256)
File Storage:    MinIO (S3-compatible)
Document:        CMIS (Content Management)
Cache:           Redis (session) / Caffeine (local)
Email:           SMTP server
Notification:    WebSocket (SockJS + STOMP)
CI/CD:           Azure DevOps Pipelines
Container:       Docker + Kubernetes
```

---

## HƯỚNG DẪN KHỞI TẠO

Khi Agent nhận `/evnict-kit:init-rules`:

1. **Scan codebase** — `tree -L 3`, đọc các file cốt lõi (pom.xml, package.json, config files)
2. **Phân tích patterns** — Tìm patterns từ code hiện có
3. **Điền từng section** — Thay thế "⚠️ CHƯA ĐƯỢC KHỞI TẠO" bằng nội dung thực tế
4. **Thêm code examples** — Lấy từ code thực tế của dự án (KHÔNG code mẫu generic)
5. **Validate** — Đảm bảo conventions phù hợp với code hiện có

**SAU KHI khởi tạo:**
- Xóa tất cả placeholder "⚠️ CHƯA ĐƯỢC KHỞI TẠO"
- Đổi mỗi section header thành `✅ ĐÃ KHỞI TẠO — {date}`
- Commit: `chore: initialize project conventions RP01-RP07`
