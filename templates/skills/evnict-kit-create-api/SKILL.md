---
name: evnict-kit-create-api
description: Tạo API endpoint chuẩn EVNICT — DTO→Controller→Service→Repository→Test. Code examples Spring Boot + JOOQ + Oracle.
compatibility: Java Spring Boot, JOOQ, Oracle
---

# evnict-kit-create-api — Tạo API Endpoint

## Khi nào dùng
- Tạo API endpoint mới (CRUD hoặc custom)
- Thêm endpoint vào module có sẵn
- Tạo module mới với đầy đủ layers

## Input Parameters
- `module` (bắt buộc): Tên module (VD: customer, order, don-vi)
- `action` (bắt buộc): Loại endpoint (list, get, create, update, delete, search, custom)
- `description` (bắt buộc): Mô tả API
- `fields` (optional): Danh sách fields cho DTO

---

## Workflow Steps

### Bước 1: Xác định cấu trúc
Đọc conventions từ `.agent/rules/03-evnict-kit-backend-conventions.md` và `05-evnict-kit-project-conventions.md`.

Xác định:
- Package path: `com.evn.{project}.{module}`
- Existing module? → Thêm vào module có sẵn
- New module? → Tạo đầy đủ package structure

### Bước 2: Tạo DTO
```java
// File: src/main/java/com/evn/{project}/{module}/dto/{Module}DTO.java
public class CustomerDTO {
    private Long id;

    @NotBlank(message = "Tên không được trống")
    @Size(max = 200, message = "Tên không quá 200 ký tự")
    private String name;

    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotNull(message = "Mã đơn vị bắt buộc")
    private Long donViId;

    // Getters, Setters (hoặc @Data nếu dùng Lombok)
}
```

**Quy tắc DTO:**
- KHÔNG expose internal IDs, password hashes, audit fields (trừ khi cần hiển thị)
- Mỗi endpoint CÓ THỂ có DTO riêng (CreateDTO, UpdateDTO, ResponseDTO)
- Validation annotations trên DTO, KHÔNG trên Entity

### Bước 3: Tạo Repository
```java
// File: src/main/java/com/evn/{project}/{module}/repository/{Module}Repository.java
@Repository
@RequiredArgsConstructor
public class CustomerRepository {
    private final DSLContext dsl;

    // LIST — paginated
    public Page<CustomerDTO> search(String keyword, int page, int size, String sortBy) {
        Condition condition = DSL.trueCondition();
        if (StringUtils.isNotBlank(keyword)) {
            condition = condition.and(
                CUSTOMER.NAME.containsIgnoreCase(keyword)
                .or(CUSTOMER.PHONE.containsIgnoreCase(keyword))
            );
        }

        int total = dsl.fetchCount(CUSTOMER, condition);
        List<CustomerDTO> data = dsl.selectFrom(CUSTOMER)
            .where(condition)
            .orderBy(getSortField(sortBy))
            .offset(page * size)
            .limit(size)
            .fetchInto(CustomerDTO.class);

        return new Page<>(data, total, page, size);
    }

    // GET by ID
    public CustomerDTO findById(Long id) {
        return dsl.selectFrom(CUSTOMER)
            .where(CUSTOMER.ID.eq(id))
            .fetchOneInto(CustomerDTO.class);
    }

    // CREATE
    public CustomerDTO create(CustomerDTO dto) {
        CustomerRecord record = dsl.newRecord(CUSTOMER);
        record.setName(dto.getName());
        record.setPhone(dto.getPhone());
        record.setDonViId(dto.getDonViId());
        record.setCreatedDate(LocalDateTime.now());
        record.store();
        return record.into(CustomerDTO.class);
    }

    // UPDATE
    public int update(Long id, CustomerDTO dto) {
        return dsl.update(CUSTOMER)
            .set(CUSTOMER.NAME, dto.getName())
            .set(CUSTOMER.PHONE, dto.getPhone())
            .set(CUSTOMER.UPDATED_DATE, LocalDateTime.now())
            .where(CUSTOMER.ID.eq(id))
            .execute();
    }

    // DELETE (soft delete)
    public int delete(Long id) {
        return dsl.update(CUSTOMER)
            .set(CUSTOMER.IS_DELETED, 1)
            .where(CUSTOMER.ID.eq(id))
            .execute();
    }

    // Sort field whitelist
    private SortField<?> getSortField(String sortBy) {
        return switch (sortBy) {
            case "name" -> CUSTOMER.NAME.asc();
            case "createdDate" -> CUSTOMER.CREATED_DATE.desc();
            default -> CUSTOMER.ID.desc();
        };
    }
}
```

### Bước 4: Tạo Service
```java
// File: src/main/java/com/evn/{project}/{module}/service/{Module}Service.java
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {
    private final CustomerRepository customerRepository;

    public Page<CustomerDTO> search(String keyword, int page, int size, String sortBy) {
        return customerRepository.search(keyword, page, size, sortBy);
    }

    public CustomerDTO getById(Long id) {
        CustomerDTO dto = customerRepository.findById(id);
        if (dto == null) {
            throw new BusinessException("Không tìm thấy khách hàng với ID: " + id);
        }
        return dto;
    }

    @Transactional
    public CustomerDTO create(CustomerDTO dto) {
        // Business validation
        validateBusinessRules(dto);
        return customerRepository.create(dto);
    }

    @Transactional
    public void update(Long id, CustomerDTO dto) {
        // Check exists
        getById(id);
        // Business validation
        validateBusinessRules(dto);
        customerRepository.update(id, dto);
    }

    @Transactional
    public void delete(Long id) {
        // Check exists
        getById(id);
        customerRepository.delete(id);
    }

    private void validateBusinessRules(CustomerDTO dto) {
        // Add business-specific validations here
    }
}
```

### Bước 5: Tạo Controller
```java
// File: src/main/java/com/evn/{project}/{module}/controller/{Module}Controller.java
@RestController
@RequestMapping("/api/{module}")
@RequiredArgsConstructor
@Slf4j
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ResponseData> search(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        return ResponseEntity.ok(ResponseData.ok(
            customerService.search(keyword, page, size, sortBy)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ResponseData.ok(customerService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ResponseData> create(@Valid @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(ResponseData.ok(customerService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDTO dto) {
        customerService.update(id, dto);
        return ResponseEntity.ok(ResponseData.ok("Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ResponseData.ok("Xóa thành công"));
    }
}
```

### Bước 6: Viết Tests (TDD)
Dùng skill `evnict-kit-tdd` → viết test cho:
1. Service layer: business logic, edge cases, validation
2. Controller layer: request/response, validation errors
3. Repository layer: query correctness (nếu có DB test)

### Bước 7: Verify
```bash
./mvnw test                    # All tests pass
./mvnw spotless:check          # Lint
./mvnw compile                 # Build
```

### Bước 8: Security check
- [ ] Endpoint có authentication filter?
- [ ] Roles/permissions đã khai báo?
- [ ] Input validation đầy đủ?
- [ ] Không expose sensitive fields trong DTO?
- [ ] SQL injection safe? (JOOQ type-safe)

---

## File Checklist (cho CRUD endpoint mới)
- [ ] `{Module}DTO.java` — với validation annotations
- [ ] `{Module}Repository.java` — JOOQ queries
- [ ] `{Module}Service.java` — business logic + @Transactional
- [ ] `{Module}Controller.java` — REST endpoints + @Valid
- [ ] `{Module}ServiceTest.java` — unit tests
- [ ] `{Module}ControllerTest.java` — MockMvc tests
- [ ] Security config updated (nếu cần whitelist)
- [ ] Migration script (nếu table mới)

---

## Error Handling

### DỪNG khi:
- Table chưa tồn tại trong DB → Tạo migration trước (dùng skill `evnict-kit-database-migration`)
- Module structure không rõ → Đọc conventions hoặc hỏi user
- Conflict với endpoint hiện có → Báo user

---

## Tiêu chí hoàn thành
- [ ] DTO tạo đúng với validation
- [ ] Repository dùng JOOQ type-safe
- [ ] Service có business logic + @Transactional
- [ ] Controller return ResponseData
- [ ] Tests viết và PASS
- [ ] Security check PASS
- [ ] Build + lint PASS
