---
trigger: always_on
---
# Backend Conventions — EVNICT Standard
**Activation Mode: Always On**
**Source: QĐ-TTPM Điều 8, Mục 8.6 — Ràng buộc kỹ thuật**
**Tech: Java Spring Boot + JOOQ + Oracle**

> Áp dụng cho TẤT CẢ code backend. Mọi code mới hoặc sửa đổi PHẢI tuân thủ.

---

## 1. INPUT VALIDATION (RB01)

### Quy tắc
- MỌI input từ client PHẢI được validate ở Controller layer
- Dùng Bean Validation annotations (@NotNull, @NotBlank, @Size, @Pattern)
- LUÔN dùng @Valid hoặc @Validated trên request body
- Custom validator cho business rules phức tạp

### Code examples
```java
// ❌ SAI — Không validate input
@PostMapping("/customers")
public ResponseEntity<?> create(@RequestBody CustomerDTO dto) {
    return ResponseEntity.ok(service.create(dto));
}

// ✅ ĐÚNG — Validation annotations + @Valid
public class CustomerDTO {
    @NotBlank(message = "Tên không được trống")
    @Size(max = 200, message = "Tên không quá 200 ký tự")
    private String name;

    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotNull(message = "Mã đơn vị bắt buộc")
    private Long donViId;
}

@PostMapping("/customers")
public ResponseEntity<ResponseData> create(@Valid @RequestBody CustomerDTO dto) {
    return ResponseEntity.ok(ResponseData.ok(service.create(dto)));
}
```

### Validation cho search/list parameters
```java
// ✅ ĐÚNG — Validate sort column bằng whitelist
private static final Set<String> ALLOWED_SORT = Set.of("name", "createdDate", "status");

@GetMapping("/customers")
public ResponseEntity<ResponseData> search(
        @RequestParam(defaultValue = "") String keyword,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
        @RequestParam(defaultValue = "name") String sortBy) {
    if (!ALLOWED_SORT.contains(sortBy)) sortBy = "name";
    return ResponseEntity.ok(ResponseData.ok(service.search(keyword, page, size, sortBy)));
}
```

---

## 2. SERVICE LAYER PATTERN (RB02)

### Cấu trúc bắt buộc
```
Controller → Service → Repository → Database
     ↓           ↓          ↓
  Validate    Business    Data Access
  + Auth      Logic       (JOOQ/JPA)
```

### Quy tắc
- Controller: validate input, call service, return ResponseData
- Service: business logic, transaction management, orchestration
- Repository: data access ONLY — KHÔNG chứa business logic
- DTO: data transfer giữa layers — KHÔNG dùng Entity trực tiếp

### Code examples
```java
// ❌ SAI — Business logic trong Controller
@PostMapping("/orders")
public ResponseEntity<?> createOrder(@RequestBody OrderDTO dto) {
    // Business logic KHÔNG nên ở đây
    if (dto.getTotal() > 1000000) {
        dto.setNeedApproval(true);
    }
    Order order = orderRepository.save(mapToEntity(dto));
    return ResponseEntity.ok(order);
}

// ✅ ĐÚNG — Controller gọi Service
@PostMapping("/orders")
public ResponseEntity<ResponseData> createOrder(@Valid @RequestBody OrderDTO dto) {
    OrderDTO result = orderService.create(dto);
    return ResponseEntity.ok(ResponseData.ok(result));
}

// ✅ Service xử lý business logic
@Service
@Transactional
public class OrderService {
    public OrderDTO create(OrderDTO dto) {
        // Business rule: đơn hàng > 1tr cần duyệt
        if (dto.getTotal() > 1000000) {
            dto.setNeedApproval(true);
        }
        // Repository chỉ lưu data
        return orderRepository.create(dto);
    }
}
```

### ResponseData pattern (EVNICT standard)
```java
// ✅ Mọi API response PHẢI dùng ResponseData wrapper
public class ResponseData {
    private int status;        // 0 = success, 1 = error
    private String message;
    private Object data;

    public static ResponseData ok(Object data) {
        return new ResponseData(0, "Thành công", data);
    }
    
    public static ResponseData error(String message) {
        return new ResponseData(1, message, null);
    }
}
```

---

## 3. ERROR HANDLING (RB03)

### Cấu trúc GlobalExceptionHandler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Business exceptions — return message cho user
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseData> handleBusiness(BusinessException ex) {
        log.warn("Business error: {}", ex.getMessage());
        return ResponseEntity.ok(ResponseData.error(ex.getMessage()));
    }

    // Validation errors — return danh sách lỗi
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseData> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        log.warn("Validation errors: {}", errors);
        return ResponseEntity.badRequest()
            .body(ResponseData.error(String.join(", ", errors)));
    }

    // Unexpected errors — log full, return generic message
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseData> handleGeneral(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(500)
            .body(ResponseData.error("Có lỗi xảy ra trong hệ thống"));
    }
}
```

### ZERO TOLERANCE — KHÔNG expose stack trace
```java
// ❌ SAI
return ResponseEntity.status(500).body(ex.toString());
return ResponseEntity.status(500).body(ex.getStackTrace());
return ResponseEntity.status(500).body(ex.getMessage());  // Risky cho unexpected
```

---

## 4. DATABASE MIGRATION (RB04)

### Quy tắc
- Schema changes PHẢI qua migration scripts — KHÔNG sửa DB trực tiếp
- Naming: `V{YYYYMMDD}_{seq}__{description}.sql`
- Mỗi migration PHẢI có rollback script
- Test cả UP và DOWN trước khi commit

### Oracle-specific patterns
```sql
-- UP: V20260401_001__add_customer_status.sql
ALTER TABLE CUSTOMER ADD (STATUS VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL);
CREATE INDEX IX_CUSTOMER_STATUS ON CUSTOMER(STATUS);
COMMENT ON COLUMN CUSTOMER.STATUS IS 'Trạng thái: ACTIVE, INACTIVE, SUSPENDED';

-- DOWN: V20260401_001__add_customer_status_ROLLBACK.sql
DROP INDEX IX_CUSTOMER_STATUS;
ALTER TABLE CUSTOMER DROP COLUMN STATUS;
```

### SQL Server patterns
```sql
-- UP
ALTER TABLE Customer ADD Status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
CREATE INDEX IX_Customer_Status ON Customer(Status);

-- DOWN
DROP INDEX IX_Customer_Status ON Customer;
ALTER TABLE Customer DROP COLUMN Status;
```

### Scan commands
```bash
# Tìm raw DDL trong Java code (KHÔNG nên có)
grep -rn "CREATE TABLE\|ALTER TABLE\|DROP TABLE" --include="*.java" src/
```

---

## 5. AUTHENTICATION ON EVERY ROUTE (RB05)

### Quy tắc
- MỌI endpoint mới PHẢI được bảo vệ (default deny)
- Public endpoints PHẢI được whitelist rõ ràng
- Data-level authorization khi cần (chỉ xem data đơn vị mình)

### Spring Security configuration
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            // Public endpoints — whitelist RÕ RÀNG
            .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
            .requestMatchers("/api/public/**").permitAll()
            .requestMatchers("/actuator/health").permitAll()
            // Mọi route khác — PHẢI authenticated
            .anyRequest().authenticated()
        );
        return http.build();
    }
}
```

### Method-level security
```java
// ✅ ĐÚNG — Role-based access
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/users/{id}")
public ResponseEntity<ResponseData> deleteUser(@PathVariable Long id) { ... }

// ✅ ĐÚNG — Data-level authorization
@GetMapping("/don-vi/{id}/customers")
public ResponseEntity<ResponseData> getCustomers(@PathVariable Long donViId) {
    // Kiểm tra user có quyền xem data đơn vị này
    Long userDonViId = SecurityUtils.getCurrentUserDonViId();
    if (!donViId.equals(userDonViId) && !SecurityUtils.isAdmin()) {
        throw new BusinessException("Không có quyền truy cập dữ liệu đơn vị này");
    }
    return ResponseEntity.ok(ResponseData.ok(service.getByDonVi(donViId)));
}
```

---

## 6. RATE LIMITING (RB06)

### Quy tắc
- API public (login, register) → rate limit BẮT BUỘC
- API nội bộ → rate limit khuyến nghị
- File upload → rate limit + size limit

### Spring Boot implementation
```java
// ✅ Sử dụng Bucket4j hoặc Resilience4j
@RateLimiter(name = "loginApi", fallbackMethod = "rateLimitFallback")
@PostMapping("/api/auth/login")
public ResponseEntity<ResponseData> login(@Valid @RequestBody LoginDTO dto) {
    return ResponseEntity.ok(authService.login(dto));
}

public ResponseEntity<ResponseData> rateLimitFallback(LoginDTO dto, Exception ex) {
    return ResponseEntity.status(429)
        .body(ResponseData.error("Quá nhiều request, vui lòng thử lại sau"));
}
```

---

## 7. JOOQ CONVENTIONS (EVNICT-specific)

### Record mapping
```java
// ❌ SAI — Manual mapping tất cả fields
CustomerDTO dto = new CustomerDTO();
dto.setId(record.get(CUSTOMER.ID));
dto.setName(record.get(CUSTOMER.NAME));
// ... 20 dòng mapping

// ✅ ĐÚNG — Dùng into() hoặc fetchInto()
List<CustomerDTO> results = dsl.selectFrom(CUSTOMER)
    .where(CUSTOMER.STATUS.eq("ACTIVE"))
    .fetchInto(CustomerDTO.class);

// ✅ ĐÚNG — Custom mapping khi cần join
List<CustomerDetailDTO> results = dsl
    .select(CUSTOMER.fields())
    .select(DON_VI.TEN_DON_VI)
    .from(CUSTOMER)
    .join(DON_VI).on(CUSTOMER.DON_VI_ID.eq(DON_VI.ID))
    .fetchInto(CustomerDetailDTO.class);
```

### Pagination pattern
```java
// ✅ Oracle + JOOQ pagination
public Page<CustomerDTO> search(String keyword, int page, int size) {
    Condition condition = DSL.trueCondition();
    if (StringUtils.isNotBlank(keyword)) {
        condition = condition.and(CUSTOMER.NAME.containsIgnoreCase(keyword));
    }
    
    int total = dsl.fetchCount(CUSTOMER, condition);
    List<CustomerDTO> data = dsl.selectFrom(CUSTOMER)
        .where(condition)
        .orderBy(CUSTOMER.CREATED_DATE.desc())
        .offset(page * size)
        .limit(size)
        .fetchInto(CustomerDTO.class);
    
    return new Page<>(data, total, page, size);
}
```

### Transaction management
```java
// ✅ ĐÚNG — @Transactional ở Service layer
@Service
public class OrderService {
    @Transactional  // Tại method level
    public OrderDTO create(OrderDTO dto) {
        // Nhiều repository calls trong 1 transaction
        Order order = orderRepo.create(dto);
        orderDetailRepo.createBatch(dto.getDetails(), order.getId());
        inventoryRepo.deduct(dto.getDetails());
        return mapToDTO(order);
    }
}
```

---

## 8. NAMING CONVENTIONS

### Java
| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Class | PascalCase | `CustomerService`, `OrderDTO` |
| Method | camelCase | `findByStatus()`, `createOrder()` |
| Variable | camelCase | `customerId`, `orderTotal` |
| Constant | UPPER_SNAKE | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |
| Package | lowercase | `com.evn.cmis.customer` |
| Table | UPPER_SNAKE | `CUSTOMER`, `DON_VI` |
| Column | UPPER_SNAKE | `CREATED_DATE`, `DON_VI_ID` |

### File naming
| Loại | Pattern | Ví dụ |
|------|---------|-------|
| Controller | `{Module}Controller.java` | `CustomerController.java` |
| Service | `{Module}Service.java` | `CustomerService.java` |
| Repository | `{Module}Repository.java` | `CustomerRepository.java` |
| DTO | `{Module}DTO.java` | `CustomerDTO.java` |
| Migration | `V{date}_{seq}__{desc}.sql` | `V20260401_001__add_status.sql` |

### Scan commands
```bash
# Tìm class names không đúng convention
grep -rn "class [a-z]" --include="*.java" src/
# Tìm constants không UPPER_SNAKE
grep -rn "static final .* [a-z].*=" --include="*.java" src/
```
