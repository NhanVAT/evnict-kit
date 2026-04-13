---
trigger: always_on
---
# Security Rules (ATTT) — EVNICT Standard
**Activation Mode: Always On**
**Source: QĐ-TTPM Điều 8, OWASP Top 10:2021**

> **Vi phạm các quy tắc sau sẽ gây lỗ hổng bảo mật nghiêm trọng!**
> Lỗi ATTT Critical/High → Thông báo Tech Lead & Tổ trưởng ANTT ngay lập tức.

---

## 1. SQL INJECTION PREVENTION (ATTT01) — CRITICAL

### Java Spring Boot + JOOQ
```java
// ❌ SAI — String concatenation → SQL Injection
String sql = "SELECT * FROM CUSTOMER WHERE NAME = '" + name + "'";
jdbcTemplate.query(sql, mapper);

// ❌ SAI — JOOQ nhưng vẫn nối chuỗi
dsl.fetch("SELECT * FROM CUSTOMER WHERE NAME = '" + name + "'");
DSL.field("NAME = '" + name + "'");
DSL.condition("STATUS = " + status);

// ✅ ĐÚNG — JOOQ type-safe (mặc định đã an toàn)
dsl.selectFrom(CUSTOMER)
   .where(CUSTOMER.NAME.eq(name))
   .and(CUSTOMER.STATUS.eq(status))
   .fetch();

// ✅ ĐÚNG — JdbcTemplate parameterized
jdbcTemplate.query("SELECT * FROM CUSTOMER WHERE NAME = ?", 
    new Object[]{name}, mapper);

// ✅ ĐÚNG — JPA @Query
@Query("SELECT c FROM Customer c WHERE c.name = :name")
List<Customer> findByName(@Param("name") String name);
```

### ASP.NET Core
```csharp
// ❌ SAI
var sql = $"SELECT * FROM Users WHERE Name = '{name}'";
context.Database.ExecuteSqlRaw(sql);

// ✅ ĐÚNG
context.Users.Where(u => u.Name == name).ToList();
context.Database.ExecuteSqlRaw("SELECT * FROM Users WHERE Name = {0}", name);
```

### Scan command
```bash
# Tìm string concatenation trong SQL
grep -rn "query.*+.*\"" --include="*.java" src/
grep -rn "createNativeQuery.*+\s" --include="*.java" src/
grep -rn "DSL\.field(.*+\s" --include="*.java" src/
grep -rn "DSL\.condition(.*+\s" --include="*.java" src/
grep -rn "FromSqlRaw.*\$\"" --include="*.cs" src/
```

### Dynamic ORDER BY — Case đặc biệt
```java
// ❌ SAI — ORDER BY từ user input
dsl.selectFrom(TABLE).orderBy(DSL.field(userSortColumn));

// ✅ ĐÚNG — Whitelist allowed columns
private static final Map<String, Field<?>> SORT_FIELDS = Map.of(
    "name", CUSTOMER.NAME,
    "date", CUSTOMER.CREATED_DATE,
    "status", CUSTOMER.STATUS
);
Field<?> sortField = SORT_FIELDS.getOrDefault(userSortColumn, CUSTOMER.NAME);
dsl.selectFrom(TABLE).orderBy(sortField);
```

---

## 2. XSS PREVENTION (ATTT02) — CRITICAL

### Angular
```typescript
// ❌ SAI — Bypass sanitizer
<div [innerHTML]="userContent"></div>
this.sanitizer.bypassSecurityTrustHtml(userContent);

// ✅ ĐÚNG — Interpolation (auto-escaped)
<div>{{ userContent }}</div>

// ✅ Nếu BẮT BUỘC dùng innerHTML → DOMPurify
import DOMPurify from 'dompurify';
this.safeHtml = DOMPurify.sanitize(userContent);
```

### React
```tsx
// ❌ SAI
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ ĐÚNG
<div>{userContent}</div>
```

### Backend — Response Headers
```java
// ✅ Spring Security — đặt trong SecurityConfiguration
http.headers(headers -> headers
    .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
    .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
    .contentTypeOptions(Customizer.withDefaults())  // X-Content-Type-Options: nosniff
);
```

### Scan command
```bash
grep -rn "\[innerHTML\]" --include="*.html" src/
grep -rn "bypassSecurityTrust" --include="*.ts" src/
grep -rn "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx" src/
```

---

## 3. CSRF PROTECTION (ATTT03)

### Spring Boot
```java
// ✅ Spring Security — CSRF cho stateful sessions
http.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
);

// ✅ Nếu dùng JWT stateless → có thể disable CSRF
// (JWT token thay thế CSRF protection)
http.csrf(csrf -> csrf.disable());  // CHỈ KHI dùng JWT authentication
```

### Angular
```typescript
// ✅ Angular HttpClient tự handle XSRF-TOKEN cookie
// Đảm bảo HttpClientModule đã import
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
    })
  ]
})
```

---

## 4. SENSITIVE DATA HANDLING (R01 + ATTT07) — CRITICAL

### Nghiêm cấm hardcode (QĐ-TTPM Điều 8, Mục 8.2)
```java
// ❌ SAI — TUYỆT ĐỐI KHÔNG
String password = "admin123";
String apiKey = "sk-1234567890";
String dbUrl = "jdbc:oracle:thin:@10.0.1.5:1521:PROD";
String jwtSecret = "my-super-secret-key";

// ✅ ĐÚNG — Environment variables / Application config
// application.yml:
//   spring.datasource.password: ${DB_PASSWORD}
//   jwt.public-key-path: ${JWT_KEY_PATH}
String password = System.getenv("DB_PASSWORD");
@Value("${jwt.public-key-path}") String keyPath;
```

### .gitignore BẮT BUỘC chặn
```
.env
.env.local
.env.production
*.key
*.pem
*.p12
*.jks
application-prod.yml
```

### Khi phát hiện secret đã commit
1. **DỪNG NGAY** — không push thêm
2. **Rotate secret** — đổi password/key mới ngay lập tức
3. **Thông báo Tech Lead** + Tổ trưởng ANTT
4. `git filter-branch` hoặc `BFG Repo-Cleaner` để xóa khỏi history

---

## 5. ERROR HANDLING — KHÔNG EXPOSE STACK TRACE (RB03)

```java
// ❌ SAI — Stack trace lộ ra client
@ExceptionHandler(Exception.class)
public ResponseEntity<?> handle(Exception ex) {
    return ResponseEntity.status(500).body(ex.toString());      // WRONG!
    return ResponseEntity.status(500).body(ex.getStackTrace()); // WRONG!
    return ResponseEntity.status(500).body(ex.getMessage());    // RISKY!
}

// ✅ ĐÚNG — Log nội bộ, message chung cho client
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseData> handleBusiness(BusinessException ex) {
        log.warn("Business error: {}", ex.getMessage());
        return ResponseEntity.ok(ResponseData.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseData> handleGeneral(Exception ex) {
        log.error("Unexpected error", ex);  // Log ĐẦY ĐỦ stack trace nội bộ
        return ResponseEntity.status(500)
            .body(ResponseData.error("Có lỗi xảy ra trong hệ thống"));  // Message CHUNG
    }
}
```

---

## 6. AUTHENTICATION & AUTHORIZATION (RB05 + ATTT04)

### JWT Checklist
- ✅ Algorithm: RS256 hoặc RS512 (asymmetric) — **KHÔNG dùng HS256 shared secret**
- ✅ Key size ≥ 2048 bits (khuyến nghị 4096)
- ✅ Token expiration ≤ 24h
- ✅ Refresh token rotation
- ✅ Validate issuer (iss) + audience (aud)
- ❌ KHÔNG lưu sensitive data trong JWT payload (password, PII)

### Mọi API endpoint mới
1. Đã được bảo vệ bởi authentication filter?
2. Role/permission nào được truy cập?
3. Cần data-level authorization không? (VD: chỉ xem data đơn vị mình)
4. Đã khai báo trong hệ thống phân quyền (Q_FUNCTION)?

### Scan weak JWT
```bash
grep -rn "HS256\|alg.*none\|secret.*=\"" --include="*.java" src/
grep -rn "parse.*Unsafe\|without.*verification" --include="*.java" src/
```

---

## 7. LOGGING — KHÔNG LOG SENSITIVE DATA (R04)

```java
// ✅ ĐÚNG — Log ID, action, result
log.info("User {} created customer id={}", userId, customerId);
log.info("Import completed: {} records processed", count);
log.warn("Login failed for user: {}", username);

// ❌ SAI — Log sensitive data
log.info("Login: user={}, password={}", username, password);   // NEVER!
log.debug("Token: {}", jwtToken);                              // NEVER!
log.info("Customer phone: {}", customer.getPhone());           // PII!
log.info("Card number: {}", payment.getCardNumber());          // PCI!
```

### Danh sách NGHIÊM CẤM log
- Mật khẩu, tokens, JWT, session IDs
- Số CMND/CCCD, số điện thoại cá nhân
- Email cá nhân, địa chỉ nhà
- Thông tin thẻ/tài khoản ngân hàng
- Dữ liệu khách hàng EVN (mã KH, số công tơ, điện năng tiêu thụ)

---

## 8. FILE UPLOAD SECURITY (ATTT06)

```java
// ❌ SAI — Lưu trực tiếp với tên gốc
Files.copy(file.getInputStream(), Paths.get("/uploads/" + file.getOriginalFilename()));

// ✅ ĐÚNG — Validate + rename + lưu MinIO
public String uploadFile(MultipartFile file) {
    // 1. Validate extension (whitelist)
    String ext = getExtension(file.getOriginalFilename());
    if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
        throw new BusinessException("File type not allowed: " + ext);
    }
    
    // 2. Validate MIME type
    String mimeType = file.getContentType();
    if (!ALLOWED_MIMES.contains(mimeType)) {
        throw new BusinessException("Invalid MIME type");
    }
    
    // 3. Validate size
    if (file.getSize() > MAX_FILE_SIZE) {
        throw new BusinessException("File too large");
    }
    
    // 4. Rename với UUID
    String storageName = UUID.randomUUID() + "." + ext;
    
    // 5. Lưu ngoài web root (MinIO/S3)
    minioClient.putObject(PutObjectArgs.builder()
        .bucket(bucket).object(storageName)
        .stream(file.getInputStream(), file.getSize(), -1)
        .contentType(mimeType)
        .build());
    
    return storageName;
}
```

### Checklist upload
- [ ] Extension whitelist (pdf, docx, xlsx, png, jpg)
- [ ] MIME type check (không chỉ dựa vào extension)
- [ ] File size limit (config, không hardcode)
- [ ] UUID rename — KHÔNG dùng tên gốc cho storage path
- [ ] Lưu MinIO/S3, KHÔNG lưu trong static/
- [ ] KHÔNG execute uploaded files

---

## 9. DATA EXPOSURE PREVENTION (ATTT07)

```java
// ❌ SAI — Return Entity trực tiếp (chứa password hash, internal IDs)
@GetMapping("/users/{id}")
public ResponseEntity<?> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userRepository.findById(id));  // WRONG!
}

// ✅ ĐÚNG — Dùng DTO, chỉ expose fields cần thiết
@GetMapping("/users/{id}")
public ResponseEntity<ResponseData> getUser(@PathVariable Long id) {
    UserDTO dto = userService.getById(id);  // DTO không có password, internalId
    return ResponseEntity.ok(ResponseData.ok(dto));
}
```

### Scan command
```bash
grep -rn "ResponseEntity.ok(.*repository\|ResponseEntity.ok(.*entity" --include="*.java" src/
grep -rn "printStackTrace\|getStackTrace" --include="*.java" src/
```

---

## 10. DEPENDENCY CVE (ATTT05)

### Scan commands
```bash
# Java Maven
./mvnw org.owasp:dependency-check-maven:check
./mvnw versions:display-dependency-updates

# Node.js / Angular / React
npm audit
npm audit fix

# .NET
dotnet list package --vulnerable
```

### Severity response time
| Severity | Response | Action |
|----------|----------|--------|
| Critical | 24h | Hotfix branch, deploy ASAP |
| High | Sprint hiện tại | Fix trong sprint |
| Medium | Sprint tiếp theo | Lên kế hoạch |
| Low | Đánh giá | Theo dõi, fix khi có thể |

---

## 11. OWASP TOP 10:2021 — QUICK REFERENCE

| # | Category | Quy tắc | Scan |
|---|----------|---------|------|
| A01 | Broken Access Control | Auth mọi route, check ownership | Manual |
| A02 | Cryptographic Failures | RS256 JWT, key ≥ 2048 | grep HS256 |
| A03 | Injection | Parameterized queries | grep concat SQL |
| A04 | Insecure Design | Validate upload, rate limit | Manual |
| A05 | Security Misconfiguration | No hardcode secrets | grep password= |
| A06 | Vulnerable Components | Dependency scan | mvnw/npm audit |
| A07 | Auth Failures | JWT exp, refresh rotation | grep JWT config |
| A08 | Data Integrity | Migration only, signed JWTs | Manual |
| A09 | Logging Failures | No PII in logs | grep log.*password |
| A10 | SSRF | Validate URLs, whitelist | grep URL.*+ |

---

## 12. ANTI-VIBE-CODING (QĐ-TTPM Điều 8, Mục 8.7)

### Dấu hiệu nhận biết
- Agent sửa cùng đoạn code > **3 lần** mà lỗi chưa fix → **DỪNG NGAY**
- Code sinh ra chứa logic trùng lặp hoặc mâu thuẫn
- Module/function phình to bất thường so với yêu cầu
- Developer KHÔNG giải thích được logic code

### Quy tắc xử lý
1. **Dừng phiên AI** khi phát hiện dấu hiệu
2. **Chuyển sang phân tích thủ công**
3. **Chia nhỏ yêu cầu** — 1 prompt = 1 nhiệm vụ đơn lẻ
4. **Giải trình bắt buộc** — code không giải thích được = không merge

---

## 13. CHECKPOINT & ROLLBACK (QĐ-TTPM Điều 8, Mục 8.8)

### TRƯỚC KHI dùng AI Agent — BẮT BUỘC
```bash
# Option 1: Branch riêng
git checkout -b feature/ai-task-xxx

# Option 2: Commit checkpoint
git add . && git commit -m "checkpoint: before AI session"

# Option 3: Stash
git stash
```

### Yêu cầu
- Revert được trong ≤ **1 thao tác git** (`git revert` hoặc `git reset`)
- Thay đổi lớn (nhiều file/module) → Rollback plan bằng văn bản trước khi thực hiện
