---
trigger: always_on
---
# General Rules — EVNICT Standard
**Activation Mode: Always On**
**Source: QĐ-TTPM Điều 8**

> **Các quy tắc này LUÔN được kiểm tra trong MỌI phiên làm việc với AI Agent.**
> Vi phạm → Agent PHải DỪNG và thông báo ngay.

---

## 1. NO HARDCODED SECRETS (R01) — CRITICAL

### Nghiêm cấm tuyệt đối (QĐ-TTPM Điều 8, Mục 8.2)
KHÔNG BAO GIỜ viết trực tiếp vào source code:
- Mật khẩu, API keys, tokens, JWT secrets
- Connection strings chứa credentials
- IP/URLs nội bộ production
- Private keys, certificates

### Code examples
```java
// ❌ SAI — TUYỆT ĐỐI KHÔNG
String password = "admin123";
String apiKey = "sk-1234567890abcdef";
String dbUrl = "jdbc:oracle:thin:@10.0.1.5:1521:PROD";
private static final String JWT_SECRET = "my-super-secret-key";

// ✅ ĐÚNG — Environment variables / Application config
@Value("${spring.datasource.password}") String dbPassword;
@Value("${jwt.public-key-path}") String keyPath;
String apiKey = System.getenv("API_KEY");
```

```typescript
// ❌ SAI
const API_URL = 'http://10.0.1.100:8080/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIs...';

// ✅ ĐÚNG
const API_URL = environment.apiUrl;
const TOKEN = this.authService.getToken();
```

### Scan commands
```bash
grep -rn "password\s*=\s*\"" --include="*.java" --include="*.ts" src/
grep -rn "apiKey\s*=\s*\"" --include="*.java" --include="*.ts" src/
grep -rn "secret\s*=\s*\"" --include="*.java" --include="*.ts" src/
grep -rn "jdbc:oracle" --include="*.java" src/
grep -rn "10\.\|192\.168\.\|172\." --include="*.java" --include="*.ts" --include="*.yml" src/
```

### Khi phát hiện secret đã commit
1. **DỪNG NGAY** — không push thêm
2. **Rotate secret** — đổi password/key mới ngay lập tức
3. **Thông báo Tech Lead** + Tổ trưởng ANTT
4. `git filter-branch` hoặc `BFG Repo-Cleaner` để xóa khỏi history

---

## 2. NO AUTO GIT PUSH (R02)

### Quy tắc
- KHÔNG BAO GIỜ tự động chạy `git push`
- KHÔNG BAO GIỜ tự động chạy `git push --force`
- `git commit` được phép khi user yêu cầu rõ ràng
- `git add` + `git commit` → OK. `git push` → PHẢI HỎI USER

### Lý do
- Push sai branch → ảnh hưởng team
- Push code chưa review → vi phạm quy trình
- Force push → mất code của người khác

### Được phép
```bash
git add .
git commit -m "feat(module): description"  # OK - local only
git status                                   # OK - readonly
git log                                      # OK - readonly
git diff                                     # OK - readonly
git stash                                    # OK - local only
```

### KHÔNG được phép
```bash
git push                    # ❌ KHÔNG BAO GIỜ
git push --force            # ❌ TUYỆT ĐỐI KHÔNG
git push origin main        # ❌ KHÔNG
```

---

## 3. NO DESTRUCTIVE OPERATIONS (R03)

### Nghiêm cấm
- `rm -rf` trên thư mục quan trọng (src/, database/, docs/)
- `DROP TABLE`, `TRUNCATE TABLE` trong production
- `git reset --hard` trên shared branch
- Xóa file mà không có backup/git tracking
- Format/overwrite toàn bộ file mà không cần thiết

### Quy tắc
- Trước khi xóa → kiểm tra git status
- Trước khi DROP/TRUNCATE → hỏi user confirm
- Prefer `git stash` over xóa thủ công
- Luôn có rollback plan cho thay đổi database

### Scan commands
```bash
grep -rn "DROP\s\+TABLE\|TRUNCATE\s\+TABLE" --include="*.sql" --include="*.java" src/ database/
grep -rn "rm\s\+-rf\|rmdir" --include="*.sh" --include="*.bat" scripts/
```

---

## 4. NO PII IN LOGS (R04)

### Danh sách NGHIÊM CẤM log (QĐ-TTPM Điều 8, Mục 8.2)
- Mật khẩu, tokens, JWT, session IDs
- Số CMND/CCCD, số điện thoại cá nhân
- Email cá nhân, địa chỉ nhà
- Thông tin thẻ/tài khoản ngân hàng
- Dữ liệu khách hàng EVN (mã KH, số công tơ, điện năng tiêu thụ)

### Code examples
```java
// ❌ SAI — Log sensitive data
log.info("Login: user={}, password={}", username, password);     // NEVER!
log.debug("Token: {}", jwtToken);                                // NEVER!
log.info("Customer phone: {}", customer.getPhone());             // PII!
log.info("CMND: {}", user.getCmnd());                            // PII!

// ✅ ĐÚNG — Log IDs, actions, results
log.info("User {} logged in successfully", userId);
log.info("Customer id={} updated by user={}", customerId, userId);
log.warn("Login failed for user: {}", username);
log.info("Import completed: {} records processed", count);
```

### Scan commands
```bash
grep -rn "log\.\(info\|debug\|warn\|error\).*password\|log\.\(info\|debug\|warn\|error\).*token\|log\.\(info\|debug\|warn\|error\).*secret" --include="*.java" src/
grep -rn "console\.log.*password\|console\.log.*token" --include="*.ts" --include="*.tsx" src/
```

---

## 5. TEST BEFORE COMMIT (R05)

### Quy tắc (QĐ-TTPM Điều 8, Mục 8.4)
- **BẮT BUỘC** chạy test TRƯỚC khi commit
- Test ALL pass → commit
- Test FAIL → fix trước, không commit code lỗi
- Build FAIL → fix trước

### Quy trình
```bash
# Backend (Java Spring Boot)
./mvnw test                    # Unit tests
./mvnw spotless:check          # Lint/format check
./mvnw compile                 # Build check

# Frontend (Angular)
ng test --watch=false          # Unit tests
ng lint                        # Lint check
ng build                       # Build check

# .NET
dotnet test
dotnet build
```

### SAU KHI test pass
```bash
git add .
git commit -m "feat(module): description [task-N]"
```

---

## 6. MINIMAL DIFF (R06)

### Quy tắc (QĐ-TTPM Điều 8, Mục 8.7 — Chống Vibe Coding)
- Chỉ sửa code **LIÊN QUAN TRỰC TIẾP** đến yêu cầu
- KHÔNG refactor code không liên quan
- KHÔNG thay đổi formatting của code không sửa
- KHÔNG thêm imports không cần thiết
- KHÔNG đổi tên biến/hàm nếu không được yêu cầu

### Dấu hiệu Vibe Coding (DỪNG NGAY)
- Sửa cùng đoạn code > **3 lần** mà lỗi chưa fix
- Code sinh ra chứa logic trùng lặp hoặc mâu thuẫn
- Module/function phình to bất thường so với yêu cầu
- Thay đổi nhiều file không liên quan

### Khi phát hiện Vibe Coding
1. **DỪNG phiên AI** ngay lập tức
2. Thông báo user: "Phát hiện dấu hiệu vibe coding, cần phân tích thủ công"
3. **Chia nhỏ yêu cầu** — 1 prompt = 1 nhiệm vụ đơn lẻ
4. Code không giải thích được = không merge

---

## 7. NO PLACEHOLDER CODE (R07)

### Quy tắc
- KHÔNG viết `// TODO: implement later`
- KHÔNG viết method rỗng hoặc return null/empty
- KHÔNG viết `throw new UnsupportedOperationException()`
- Mỗi function PHẢI có logic thực tế hoặc KHÔNG viết

### Code examples
```java
// ❌ SAI — Placeholder
public List<CustomerDTO> search(String keyword) {
    // TODO: implement search
    return Collections.emptyList();
}

// ❌ SAI — Stub
public void processPayment(PaymentRequest request) {
    throw new UnsupportedOperationException("Not implemented");
}

// ✅ ĐÚNG — Code thực tế
public List<CustomerDTO> search(String keyword) {
    return dsl.selectFrom(CUSTOMER)
        .where(CUSTOMER.NAME.containsIgnoreCase(keyword))
        .fetchInto(CustomerDTO.class);
}
```

### Ngoại lệ
- `// TODO` chỉ được phép khi user YÊU CẦU RÀNH MẠCH viết skeleton
- Phải kèm ticket/task reference: `// TODO [TASK-123]: implement payment gateway integration`

---

## 8. RESPECT GITIGNORE (R08)

### Quy tắc
KHÔNG tạo, sửa, commit files thuộc .gitignore:
- `node_modules/`
- `target/`, `build/`, `dist/`
- `.env`, `.env.local`, `.env.production`
- `*.key`, `*.pem`, `*.p12`, `*.jks`
- `application-prod.yml`
- `.idea/`, `.vscode/` (nếu trong .gitignore)
- `*.log`, `*.tmp`

### .gitignore BẮT BUỘC chặn
```gitignore
# Secrets
.env
.env.local
.env.production
*.key
*.pem
*.p12
*.jks
application-prod.yml

# Build
target/
build/
dist/
node_modules/

# IDE
.idea/
*.iml

# Logs
*.log
```

### Trước khi tạo file mới
1. Kiểm tra `.gitignore` → file có bị ignore không?
2. Nếu bị ignore → KHÔNG tạo (hoặc hỏi user)
3. Nếu cần file config → dùng `.example` suffix: `application-prod.yml.example`

---

## CHECKPOINT & ROLLBACK (QĐ-TTPM Điều 8, Mục 8.8)

### TRƯỚC KHI bắt đầu phiên AI — BẮT BUỘC
```bash
# Option 1: Branch riêng (KHUYẾN NGHỊ)
git checkout -b feature/ai-task-xxx

# Option 2: Commit checkpoint
git add . && git commit -m "checkpoint: before AI session"

# Option 3: Stash
git stash
```

### Yêu cầu
- Revert được trong ≤ **1 thao tác git** (`git revert` hoặc `git reset`)
- Thay đổi lớn (nhiều file/module) → Rollback plan bằng văn bản trước khi thực hiện
- KHÔNG bắt đầu implement mà không có checkpoint
