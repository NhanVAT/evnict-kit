---
trigger: always_on
---
# Frontend Conventions — EVNICT Standard
**Activation Mode: Always On**
**Source: QĐ-TTPM Điều 8, Mục 8.6**
**Tech: Angular + PrimeNG**

> Áp dụng cho TẤT CẢ code frontend. Mọi code mới hoặc sửa đổi PHẢI tuân thủ.

---

## 1. NO INLINE STYLES (RF01)

### Quy tắc
- KHÔNG sử dụng inline styles trực tiếp trong template
- Tất cả styles PHẢI đặt trong file `.scss` hoặc `.css` riêng
- Dùng CSS classes, KHÔNG dùng `[style]` binding
- Exception: dynamic styles từ business logic (VD: chart colors)

### Code examples
```html
<!-- ❌ SAI — Inline styles -->
<div style="color: red; font-size: 14px; margin-top: 10px">
  {{ errorMessage }}
</div>
<div [style.color]="isError ? 'red' : 'green'">Status</div>

<!-- ✅ ĐÚNG — CSS class -->
<div class="error-message" [class.error]="isError" [class.success]="!isError">
  {{ errorMessage }}
</div>
```

```scss
// ✅ Trong component.scss
.error-message {
  font-size: 14px;
  margin-top: 10px;
  
  &.error { color: var(--color-error); }
  &.success { color: var(--color-success); }
}
```

### Scan commands
```bash
grep -rn "style=\"" --include="*.html" src/
grep -rn "\[style\." --include="*.html" src/
```

---

## 2. COMPONENT REUSE (RF02)

### Quy tắc
- TRƯỚC KHI tạo component mới → kiểm tra đã có component tương tự chưa
- Tìm trong: `shared/components/`, PrimeNG library, project components
- Nếu đã có → reuse hoặc extend
- Component mới PHẢI đặt trong `shared/` nếu dùng ≥ 2 nơi

### Component categories
```
src/app/
├── shared/
│   ├── components/       ← Reusable components (dùng ≥ 2 nơi)
│   │   ├── data-table/   ← Generic table wrapper
│   │   ├── form-field/   ← Form field với validation
│   │   ├── file-upload/  ← Upload component
│   │   └── confirm-dialog/
│   ├── pipes/            ← Shared pipes
│   ├── directives/       ← Shared directives
│   └── services/         ← Shared services
├── features/
│   └── customer/
│       ├── components/   ← Feature-specific components
│       ├── pages/        ← Routed pages
│       └── services/     ← Feature services
```

### PrimeNG usage
```typescript
// ✅ ĐÚNG — Dùng PrimeNG components trước khi tự viết
// Table → p-table
// Dialog → p-dialog
// Form elements → p-inputText, p-dropdown, p-calendar
// Toast → p-toast (qua MessageService)
// Confirm → p-confirmDialog (qua ConfirmationService)

// ❌ SAI — Tự viết component khi PrimeNG đã có
// Custom table → Dùng p-table
// Custom dropdown → Dùng p-dropdown
// Custom date picker → Dùng p-calendar
```

---

## 3. NO HARDCODED TEXT / I18N (RF03)

### Quy tắc
- KHÔNG hardcode text hiển thị trong template hoặc component
- Tất cả text PHẢI qua i18n (ngx-translate hoặc Angular i18n)
- Labels, messages, tooltips, placeholders → đều qua translate

### Code examples
```html
<!-- ❌ SAI — Hardcoded text -->
<button>Tạo mới</button>
<label>Tên khách hàng:</label>
<p-message severity="error" text="Không tìm thấy dữ liệu"></p-message>

<!-- ✅ ĐÚNG — i18n -->
<button>{{ 'button.create' | translate }}</button>
<label>{{ 'customer.name' | translate }}:</label>
<p-message severity="error" [text]="'message.notFound' | translate"></p-message>
```

```json
// vi.json
{
  "button": {
    "create": "Tạo mới",
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "search": "Tìm kiếm"
  },
  "customer": {
    "name": "Tên khách hàng",
    "phone": "Số điện thoại"
  },
  "message": {
    "notFound": "Không tìm thấy dữ liệu",
    "saveSuccess": "Lưu thành công",
    "confirmDelete": "Bạn có chắc chắn muốn xóa?"
  }
}
```

### Ngoại lệ
- Technical strings (CSS class names, HTML attributes)
- Enum labels → nên qua i18n nhưng có thể hardcode trong các dict objects

---

## 4. ACCESSIBILITY / A11Y (RF04)

### Quy tắc
- Mọi `<img>` PHẢI có `alt` attribute
- Mọi form field PHẢI có `<label>` hoặc `aria-label`
- Mọi interactive element PHẢI có `tabindex` hợp lý
- Color contrast ratio ≥ 4.5:1 cho text

### Code examples
```html
<!-- ❌ SAI — Thiếu a11y -->
<img src="logo.png">
<input type="text" placeholder="Search">
<div (click)="doSomething()">Click me</div>

<!-- ✅ ĐÚNG — a11y đầy đủ -->
<img src="logo.png" alt="Logo EVNICT">
<label for="search">{{ 'label.search' | translate }}</label>
<input type="text" id="search" [placeholder]="'placeholder.search' | translate" aria-label="Search">
<button (click)="doSomething()" tabindex="0">
  {{ 'button.action' | translate }}
</button>
```

### Scan commands
```bash
grep -rn "<img " --include="*.html" src/ | grep -v "alt="
grep -rn "<input " --include="*.html" src/ | grep -v "aria-label\|id=" 
```

---

## 5. NO DIRECT DOM MANIPULATION (RF05)

### Quy tắc
- KHÔNG dùng `document.getElementById()`, `document.querySelector()`
- KHÔNG dùng `jQuery` hoặc truy cập DOM trực tiếp
- Dùng Angular bindings, `@ViewChild`, hoặc `Renderer2`
- Exception: third-party library integration (VD: chart.js) → dùng `@ViewChild`

### Code examples
```typescript
// ❌ SAI — Direct DOM manipulation
ngAfterViewInit() {
  document.getElementById('myInput').focus();
  document.querySelector('.container').classList.add('active');
  const el = document.getElementsByClassName('item');
}

// ✅ ĐÚNG — Angular way
@ViewChild('myInput') myInput: ElementRef;

ngAfterViewInit() {
  this.myInput.nativeElement.focus();
}

// ✅ ĐÚNG — Renderer2
constructor(private renderer: Renderer2) {}

setActive(el: ElementRef) {
  this.renderer.addClass(el.nativeElement, 'active');
}

// ✅ ĐÚNG — Template bindings
// <div [class.active]="isActive"></div>
// <input #myInput (keyup)="onKeyUp()">
```

### Scan commands
```bash
grep -rn "document\.getElementById\|document\.querySelector\|document\.getElement" --include="*.ts" src/
grep -rn "jQuery\|\\$(" --include="*.ts" src/
```

---

## 6. RESPONSIVE DESIGN (RF06)

### Quy tắc
- Tất cả pages PHẢI responsive cho: Desktop (≥1200px), Tablet (768-1199px), Mobile (≤767px)
- Dùng PrimeNG Grid system (p-grid, p-col) hoặc CSS Grid/Flexbox
- Test responsive trước khi commit
- Text KHÔNG bị cắt, table PHẢI scrollable trên mobile

### Code examples
```html
<!-- ✅ ĐÚNG — PrimeNG responsive grid -->
<div class="grid">
  <div class="col-12 md:col-6 lg:col-4">
    <!-- Card 1 -->
  </div>
  <div class="col-12 md:col-6 lg:col-4">
    <!-- Card 2 -->
  </div>
  <div class="col-12 md:col-12 lg:col-4">
    <!-- Card 3 -->
  </div>
</div>

<!-- ✅ Table responsive -->
<div class="table-responsive">
  <p-table [value]="data" [scrollable]="true" scrollHeight="400px"
           [responsive]="true" responsiveLayout="scroll">
    <!-- columns -->
  </p-table>
</div>
```

```scss
// ✅ SCSS responsive
.page-container {
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    
    .action-buttons {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}
```

---

## 7. ANGULAR CONVENTIONS

### File naming
| Loại | Pattern | Ví dụ |
|------|---------|-------|
| Component | `{name}.component.ts` | `customer-list.component.ts` |
| Service | `{name}.service.ts` | `customer.service.ts` |
| Module | `{name}.module.ts` | `customer.module.ts` |
| Pipe | `{name}.pipe.ts` | `date-format.pipe.ts` |
| Directive | `{name}.directive.ts` | `auto-focus.directive.ts` |
| Guard | `{name}.guard.ts` | `auth.guard.ts` |
| Interceptor | `{name}.interceptor.ts` | `auth.interceptor.ts` |
| Model/Interface | `{name}.model.ts` | `customer.model.ts` |

### Component structure
```typescript
// ✅ ĐÚNG — Component tiêu chuẩn
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy {
  // 1. Decorators
  @ViewChild('dt') table: Table;

  // 2. Public properties (used in template)
  customers: CustomerDTO[] = [];
  loading = false;
  totalRecords = 0;

  // 3. Private properties
  private destroy$ = new Subject<void>();

  // 4. Constructor (DI)
  constructor(
    private customerService: CustomerService,
    private messageService: MessageService
  ) {}

  // 5. Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 6. Public methods (used in template)
  loadData(): void { ... }
  onCreate(): void { ... }

  // 7. Private methods
  private handleError(err: any): void { ... }
}
```

### Service pattern
```typescript
// ✅ ĐÚNG — Service tiêu chuẩn
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private baseUrl = `${environment.apiUrl}/api/customers`;

  constructor(private http: HttpClient) {}

  search(keyword: string, page: number, size: number): Observable<ResponseData> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ResponseData>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ResponseData> {
    return this.http.get<ResponseData>(`${this.baseUrl}/${id}`);
  }

  create(dto: CustomerDTO): Observable<ResponseData> {
    return this.http.post<ResponseData>(this.baseUrl, dto);
  }

  update(id: number, dto: CustomerDTO): Observable<ResponseData> {
    return this.http.put<ResponseData>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ResponseData> {
    return this.http.delete<ResponseData>(`${this.baseUrl}/${id}`);
  }
}
```

### RxJS — Memory leak prevention
```typescript
// ❌ SAI — Không unsubscribe → memory leak
ngOnInit() {
  this.service.getData().subscribe(data => this.data = data);
}

// ✅ ĐÚNG — takeUntil pattern
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// ✅ ĐÚNG — async pipe (tự unsubscribe)
// component.ts
data$ = this.service.getData();
// template
<div *ngIf="data$ | async as data">{{ data.name }}</div>
```

### Scan commands
```bash
# Tìm subscribe không unsubscribe
grep -rn "\.subscribe(" --include="*.ts" src/ | grep -v "takeUntil\|async\|take(1)\|first()"
# Tìm inline styles
grep -rn "style=\"" --include="*.html" src/
# Tìm document access
grep -rn "document\." --include="*.ts" src/
```
