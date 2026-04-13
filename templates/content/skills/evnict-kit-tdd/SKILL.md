---
name: evnict-kit-tdd
description: TDD per subtask — Red→Green→Refactor→Verify→Commit. 3-strike rule. Hướng dẫn viết test cho Spring Boot + Angular.
compatibility: Java Spring Boot (JUnit5 + Mockito), Angular (Jasmine + Karma)
---

# evnict-kit-tdd — Test-Driven Development

## Khi nào dùng
- Implement subtask từ plan đã approve
- Viết test cho code mới hoặc code sửa đổi
- Fix bug bằng TDD (reproduce → test fail → fix → test pass)

## Input Parameters
- `task_file` (bắt buộc): Path đến task file (VD: `.evnict/specs/feature/tasks/01-db-migration.md`)
- `scope`: be | fe (xác định test framework)

---

## Workflow Steps

### Bước 1: Pre-conditions
1. Đọc task file → xác định files cần tạo/sửa và test cases
2. Kiểm tra `git status` → working tree PHẢI clean
3. Nếu dirty → `git stash` hoặc `git commit` trước

### Bước 2: TDD Cycle cho MỖI task

```
┌─────────────────────────────────────────────┐
│  [RED] Viết test TRƯỚC → chạy → test FAIL   │
│       ↓                                      │
│  [GREEN] Code TỐI THIỂU để test PASS        │
│       ↓                                      │
│  Verify: lint pass + build OK                │
│       ↓                                      │
│  [REFACTOR] Cải thiện code (test vẫn PASS)   │
│       ↓                                      │
│  Commit: feat({module}): {task} [task-{N}]   │
└─────────────────────────────────────────────┘
```

### RED Phase — Viết Test Trước

#### Java Spring Boot (JUnit5 + Mockito)
```java
// ✅ Service test
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;
    
    @InjectMocks
    private CustomerService customerService;

    @Test
    @DisplayName("Tạo customer thành công với data hợp lệ")
    void create_validData_shouldReturnDTO() {
        // Arrange
        CustomerDTO input = new CustomerDTO();
        input.setName("Nguyễn Văn A");
        input.setPhone("0901234567");
        
        when(customerRepository.create(any())).thenReturn(
            new CustomerDTO(1L, "Nguyễn Văn A", "0901234567")
        );

        // Act
        CustomerDTO result = customerService.create(input);

        // Assert
        assertNotNull(result);
        assertEquals("Nguyễn Văn A", result.getName());
        verify(customerRepository).create(any());
    }

    @Test
    @DisplayName("Tạo customer với tên trống → BusinessException")
    void create_emptyName_shouldThrowException() {
        CustomerDTO input = new CustomerDTO();
        input.setName("");

        assertThrows(BusinessException.class, () -> 
            customerService.create(input)
        );
    }
}
```

```java
// ✅ Controller test (MockMvc)
@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private CustomerService customerService;

    @Test
    void create_validRequest_shouldReturn200() throws Exception {
        String json = """
            {"name": "Nguyễn Văn A", "phone": "0901234567"}
            """;
        
        when(customerService.create(any())).thenReturn(
            new CustomerDTO(1L, "Nguyễn Văn A", "0901234567")
        );

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(0))
            .andExpect(jsonPath("$.data.name").value("Nguyễn Văn A"));
    }

    @Test
    void create_missingName_shouldReturn400() throws Exception {
        String json = """
            {"name": "", "phone": "0901234567"}
            """;

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }
}
```

```java
// ✅ Repository test (cần DB test container hoặc H2)
@JooqTest
class CustomerRepositoryTest {
    
    @Autowired
    private DSLContext dsl;
    
    private CustomerRepository repository;

    @BeforeEach
    void setUp() {
        repository = new CustomerRepository(dsl);
    }

    @Test
    void search_byKeyword_shouldReturnMatching() {
        // Arrange — insert test data
        dsl.insertInto(CUSTOMER)
            .set(CUSTOMER.NAME, "Nguyễn Văn A")
            .set(CUSTOMER.STATUS, "ACTIVE")
            .execute();

        // Act
        List<CustomerDTO> results = repository.search("Nguyễn", 0, 20);

        // Assert
        assertFalse(results.isEmpty());
        assertTrue(results.get(0).getName().contains("Nguyễn"));
    }
}
```

#### Angular (Jasmine + Karma)
```typescript
// ✅ Service test
describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService]
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should search customers', () => {
    const mockResponse = { status: 0, data: [{ id: 1, name: 'Test' }] };

    service.search('test', 0, 20).subscribe(res => {
      expect(res.status).toBe(0);
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url.includes('/api/customers'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
```

```typescript
// ✅ Component test
describe('CustomerListComponent', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;
  let mockService: jasmine.SpyObj<CustomerService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CustomerService', ['search']);
    mockService.search.and.returnValue(of({ status: 0, data: [], message: '' }));

    await TestBed.configureTestingModule({
      declarations: [CustomerListComponent],
      providers: [{ provide: CustomerService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load data on init', () => {
    expect(mockService.search).toHaveBeenCalled();
  });

  it('should display error message when search fails', () => {
    mockService.search.and.returnValue(of({ status: 1, data: null, message: 'Error' }));
    component.loadData();
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Error');
  });
});
```

### GREEN Phase — Code Tối Thiểu
1. Viết code TỐI THIỂU để test PASS — không thêm logic chưa cần
2. Chạy test: `./mvnw test -pl {module}` hoặc `ng test --watch=false`
3. Nếu PASS → chuyển sang Verify
4. Nếu FAIL → sửa code (KHÔNG sửa test)

### Verify Phase
```bash
# Backend
./mvnw test                      # All tests pass
./mvnw spotless:check            # Lint/format
./mvnw compile                   # Build OK

# Frontend
ng test --watch=false            # All tests pass
ng lint                          # Lint OK
ng build                         # Build OK
```

### REFACTOR Phase (Optional)
1. Cải thiện code quality (naming, extract method, reduce duplication)
2. Chạy lại test → PHẢI vẫn PASS
3. KHÔNG thêm chức năng mới trong refactor

### Commit
```bash
git add .
git commit -m "feat({module}): {task description} [task-{N}]"
```

---

## 3-Strike Rule (QĐ-TTPM Mục 8.7)

Nếu test FAIL > **3 lần** cho cùng 1 đoạn code:
1. **DỪNG** phiên AI ngay lập tức
2. Thông báo user: "Task {N} gặp vấn đề sau 3 lần thử, cần phân tích thủ công"
3. Log lại:
   - Đoạn code gây lỗi
   - 3 lần thử và kết quả
   - Giả thuyết root cause
4. **KHÔNG tiếp tục** implement các task tiếp theo

---

## Test Coverage Guidelines

### Backend
| Layer | Coverage Target | Focus |
|-------|----------------|-------|
| Service | ≥ 80% | Business logic, edge cases |
| Controller | ≥ 70% | Request/response, validation |
| Repository | ≥ 60% | Query correctness |

### Frontend
| Type | Coverage Target | Focus |
|------|----------------|-------|
| Service | ≥ 80% | HTTP calls, data transform |
| Component | ≥ 60% | User interactions, display logic |
| Pipe | ≥ 90% | Data formatting |

---

## Error Handling

### DỪNG khi:
- Test framework không available → Nhắc user cài đặt
- Project không build → Fix build trước
- Dependency conflict → Resolve trước khi viết test

### Skip test khi:
- Task là DB migration → Test bằng chạy migration UP/DOWN
- Task là config change → Test bằng verify config loaded

---

## ═══════════════════════════════════════════
## STOP-AND-ASK — BẮT BUỘC SAU MỖI SUBTASK
## ═══════════════════════════════════════════

> **Cross-reference:** Xem workflow `evnict-kit-implement.md` để biết đầy đủ quy tắc STOP-AND-ASK và xử lý mỗi option.

### Sau MỖI subtask hoàn thành
Agent PHẢI DỪNG, hiển thị kết quả, và hỏi user:

```
═══════════════════════════════════════════
✅ Task {N}/{Total}: {task_name} — HOÀN THÀNH
═══════════════════════════════════════════

📁 Files tạo/sửa:
  + src/.../FileA.java (NEW — {X} lines)
  ~ src/.../FileB.java (MODIFIED — {Y} lines changed)

🧪 Tests: {pass}/{total} passed
📏 Lint: ✅ passed | ❌ {N} issues
🔨 Build: ✅ passed | ❌ failed
📝 Commit: feat({module}): {description} [task-{NN}]

───────────────────────────────────────────
❓ Bạn muốn làm gì tiếp?

  A) ✅ Approve — chuyển sang Task {N+1}: {next_task_name}
  B) 👀 Review code — tôi sẽ hiển thị code và chờ feedback
  C) 🔄 Yêu cầu sửa — mô tả cần sửa gì
  D) ⏸️ Tạm dừng — lưu progress, tiếp tục sau
  E) ❌ Hủy task này — rollback commit
  F) 🚀 Auto-approve — chạy hết tasks còn lại KHÔNG hỏi nữa
     ⚠️ Chỉ dùng khi đã review 2-3 tasks đầu và tin tưởng pattern

Chọn (A/B/C/D/E/F):
═══════════════════════════════════════════
```

### TUYỆT ĐỐI KHÔNG được:
- ❌ Tự động chạy task tiếp mà không hỏi user
- ❌ Skip phần hiển thị kết quả (files, tests, lint, build, commit)
- ❌ Gộp nhiều tasks thành 1 lần chạy
- ❌ Bỏ qua test/lint/build results trong output

### Khi user chọn B (Review code)
Hiển thị code cho MỖI file đã tạo/sửa:
```
📄 {FileName.java} ({NEW|MODIFIED}):
─────────────────────────────
{Hiển thị toàn bộ code nếu NEW}
{Hiển thị diff nếu MODIFIED}
─────────────────────────────

Bạn có feedback gì không? (Gõ feedback hoặc "OK" để approve)
```

### Khi user chọn D (Tạm dừng)
Lưu progress vào `.evnict/specs/{feature}/progress.md`:
```markdown
# Progress: {feature}
## Status: PAUSED
## Completed: {N}/{Total}
## Last updated: {timestamp}

### Tasks
- [x] Task 01: {name} — commit: {hash}
- [x] Task 02: {name} — commit: {hash}
- [ ] Task 03: {name} ← NEXT
## Resume: /evnict-kit:implement (auto-detect progress)
```

### Khi user chọn E (Hủy + Rollback)
1. `git revert HEAD` — revert commit cuối
2. Xóa files đã tạo trong task
3. Hỏi: "Muốn thử lại task này hay skip?"

### Khi user chọn F (Auto-approve)
1. Cảnh báo: "Tất cả tasks còn lại chạy KHÔNG hỏi. DỪNG nếu test/build fail."
2. Nếu gặp lỗi → TỰ ĐỘNG quay lại mode STOP-AND-ASK
3. Cuối cùng hiển thị Final Summary

### Khi gặp vấn đề (Bug phức tạp, cấu trúc không dự tính)
Agent PHẢI hỏi trước khi tự quyết định:
```
⚠️ Task {N} gặp vấn đề:
{mô tả nguyên nhân và phân tích vấn đề}

Đề xuất:
A) {approach 1} — pros/cons
B) {approach 2} — pros/cons
C) Bạn quyết định thay tôi bằng cách gõ lệnh.

Chọn approach nào?
```

---

## Tiêu chí hoàn thành
- [ ] Test viết TRƯỚC code (RED phase completed)
- [ ] Code tối thiểu để test PASS (GREEN phase completed)
- [ ] Lint + build OK (Verify phase completed)
- [ ] Code đã refactor nếu cần (REFACTOR phase completed)
- [ ] Commit với message chuẩn
- [ ] Không vi phạm 3-strike rule
