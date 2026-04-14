---
name: evnict-kit-create-component
description: Tạo UI component chuẩn — check reuse → generate → style → test → a11y. Angular + PrimeNG.
compatibility: Angular 16+, PrimeNG
---

# evnict-kit-create-component — Tạo UI Component

## Khi nào dùng
- Tạo component mới cho feature
- Tạo shared/reusable component
- Tạo form component complex

## Input Parameters
- `name` (bắt buộc): Tên component (VD: customer-form, order-table)
- `type` (optional): page | shared | feature (default: feature)
- `module` (optional): Module chứa component

---

## Workflow Steps

### Bước 1: Check Reuse — TRƯỚC KHI tạo mới
1. Tìm trong `shared/components/` → có component tương tự?
2. Tìm trong PrimeNG → đã có component sẵn?
3. Tìm trong module hiện tại → có thể extend?

```bash
# Scan existing components
find src/app -name "*.component.ts" | grep -i "{keyword}"
# Check PrimeNG docs nếu cần
```

Nếu tìm thấy → REUSE hoặc EXTEND, KHÔNG tạo mới.

### Bước 2: Generate Component

#### Xác định vị trí
| Type | Path |
|------|------|
| shared | `src/app/shared/components/{name}/` |
| feature | `src/app/features/{module}/components/{name}/` |
| page | `src/app/features/{module}/pages/{name}/` |

#### Tạo files
```
{name}/
├── {name}.component.ts
├── {name}.component.html
├── {name}.component.scss
└── {name}.component.spec.ts
```

### Bước 3: Component Code

```typescript
// ✅ Component tiêu chuẩn
@Component({
  selector: 'app-{name}',
  templateUrl: './{name}.component.html',
  styleUrls: ['./{name}.component.scss']
})
export class {Name}Component implements OnInit, OnDestroy {
  // Input/Output
  @Input() data: {Type}[];
  @Output() onAction = new EventEmitter<{Type}>();

  // State
  loading = false;
  errorMessage = '';

  // Lifecycle
  private destroy$ = new Subject<void>();

  constructor(
    private service: {Module}Service,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Methods
  loadData(): void {
    this.loading = true;
    this.service.getData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res) => {
          if (res.status === 0) {
            this.data = res.data;
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải dữ liệu'
          });
        }
      });
  }
}
```

### Bước 4: Template (HTML)

```html
<!-- ✅ Template chuẩn với PrimeNG -->
<div class="component-container">
  <!-- Loading state -->
  <div *ngIf="loading" class="loading-container">
    <p-progressSpinner></p-progressSpinner>
  </div>

  <!-- Error state -->
  <p-message *ngIf="errorMessage" severity="error" [text]="errorMessage"></p-message>

  <!-- Content -->
  <ng-container *ngIf="!loading && !errorMessage">
    <!-- Component content here -->
  </ng-container>
</div>
```

### Bước 5: Styles (SCSS)

```scss
// ✅ Styles chuẩn
:host {
  display: block;
}

.component-container {
  padding: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

// Responsive
@media (max-width: 768px) {
  .component-container {
    padding: 0.5rem;
  }
}
```

### Bước 6: Form Component Pattern (nếu là form)

```typescript
// ✅ Reactive Form component
export class CustomerFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private service: CustomerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      phone: ['', [Validators.pattern(/^0[0-9]{9}$/)]],
      donViId: [null, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto = this.form.value;
    const action$ = this.isEdit
      ? this.service.update(dto.id, dto)
      : this.service.create(dto);

    action$.subscribe({
      next: (res) => {
        if (res.status === 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: this.isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công'
          });
        }
      }
    });
  }
}
```

### Bước 7: Test

```typescript
describe('{Name}Component', () => {
  let component: {Name}Component;
  let fixture: ComponentFixture<{Name}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [{Name}Component],
      imports: [/* required modules */],
      providers: [/* mock services */]
    }).compileComponents();

    fixture = TestBed.createComponent({Name}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => { /* ... */ });
  it('should show loading spinner', () => { /* ... */ });
  it('should handle error', () => { /* ... */ });
});
```

### Bước 8: A11y Check
- [ ] Tất cả `<img>` có `alt`
- [ ] Form fields có `<label>` hoặc `aria-label`
- [ ] Interactive elements có `tabindex`
- [ ] Color contrast ≥ 4.5:1

### Bước 9: Register Component
Thêm vào module declarations hoặc shared module exports.

---

> 🎨 **FE UI Quality:** Khi tạo/sửa UI component, tham khảo skill `evnict-kit-frontend-design`
> để đảm bảo chất lượng thiết kế cao. Áp dụng Design Thinking (Purpose → Tone → Constraints → Differentiation) trước khi code UI.

---

## ⚠️ NHẮC NHỞ: Tuân thủ Rules & Context

> **Agent dùng lâu có thể quên rules.** Trước khi bắt đầu code, tự kiểm tra:

### Quick Check (agent tự đánh giá)
1. ✅ Tôi đã đọc `.agent/rules/` trong phiên làm việc này chưa?
2. ✅ Tôi đã đọc AGENTS.md (hoặc context file) chưa?
3. ✅ Tôi nhớ rõ coding conventions của dự án này không?

**→ Nếu BẤT KỲ câu nào = "CHƯA" hoặc "KHÔNG CHẮC":**
- Đọc lại tất cả files trong `.agent/rules/` (hoặc thư mục rules tương ứng)
- Đọc lại AGENTS.md (hoặc context file tương ứng)
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/processed/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Tiêu chí hoàn thành
- [ ] Reuse check done — không tạo trùng
- [ ] Component files tạo đầy đủ (ts, html, scss, spec.ts)
- [ ] Reactive Forms nếu là form component
- [ ] Loading/error states handled
- [ ] RxJS unsubscribe (takeUntil pattern)
- [ ] Responsive design
- [ ] A11y check pass
- [ ] Tests viết và PASS
- [ ] Registered trong module
