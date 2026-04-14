---
name: evnict-kit-create-page
description: Tạo page mới — module → routing → component → service → loading/error states. Angular lazy-loaded.
compatibility: Angular 16+, PrimeNG
---

# evnict-kit-create-page — Tạo Page Mới

## Khi nào dùng
- Tạo page mới trong feature module
- Tạo feature module mới với routing

## Input Parameters
- `name` (bắt buộc): Tên page (VD: customer-list, order-detail)
- `module` (bắt buộc): Module chứa page
- `route` (optional): Route path (default: based on name)

---

## Workflow Steps

### Bước 1: Kiểm tra module

#### Module đã tồn tại?
```bash
find src/app/features -name "{module}.module.ts"
```

#### Nếu chưa → Tạo module mới
```
src/app/features/{module}/
├── {module}.module.ts
├── {module}-routing.module.ts
├── pages/
│   └── {page-name}/
├── components/
├── services/
└── models/
```

```typescript
// {module}.module.ts
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    {Module}RoutingModule,
    SharedModule,
    // PrimeNG modules
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule
  ]
})
export class {Module}Module {}
```

```typescript
// {module}-routing.module.ts
const routes: Routes = [
  { path: '', component: {PageName}Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class {Module}RoutingModule {}
```

### Bước 2: Thêm lazy loading vào app-routing
```typescript
// app-routing.module.ts
{
  path: '{module}',
  loadChildren: () => import('./features/{module}/{module}.module')
    .then(m => m.{Module}Module),
  canActivate: [AuthGuard]
}
```

### Bước 3: Tạo page component
Dùng skill `evnict-kit-create-component` với type=page.

#### List Page Pattern
```typescript
@Component({
  selector: 'app-{name}-list',
  templateUrl: './{name}-list.component.html'
})
export class {Name}ListComponent implements OnInit {
  data: {Type}[] = [];
  totalRecords = 0;
  loading = false;
  keyword = '';

  // Dialog
  showDialog = false;
  selectedItem: {Type} | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private service: {Module}Service,
    private messageService: MessageService,
    private confirmService: ConfirmationService
  ) {}

  ngOnInit(): void { this.search(); }

  search(event?: any): void {
    this.loading = true;
    const page = event ? event.first / event.rows : 0;
    const size = event ? event.rows : 20;

    this.service.search(this.keyword, page, size)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
      .subscribe(res => {
        if (res.status === 0) {
          this.data = res.data.content;
          this.totalRecords = res.data.totalElements;
        }
      });
  }

  onCreate(): void {
    this.selectedItem = null;
    this.showDialog = true;
  }

  onEdit(item: {Type}): void {
    this.selectedItem = { ...item };
    this.showDialog = true;
  }

  onDelete(item: {Type}): void {
    this.confirmService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        this.service.delete(item.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(res => {
            if (res.status === 0) {
              this.messageService.add({ severity: 'success', detail: 'Xóa thành công' });
              this.search();
            }
          });
      }
    });
  }

  onSaved(): void {
    this.showDialog = false;
    this.search();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### List Page Template
```html
<div class="page-container">
  <div class="page-header">
    <h2>{{ 'page.{module}.title' | translate }}</h2>
    <button pButton label="{{ 'button.create' | translate }}" icon="pi pi-plus"
            (click)="onCreate()"></button>
  </div>

  <div class="search-bar">
    <span class="p-input-icon-left">
      <i class="pi pi-search"></i>
      <input pInputText [(ngModel)]="keyword" (keyup.enter)="search()"
             [placeholder]="'placeholder.search' | translate">
    </span>
  </div>

  <p-table [value]="data" [lazy]="true" [paginator]="true" [rows]="20"
           [totalRecords]="totalRecords" [loading]="loading"
           (onLazyLoad)="search($event)" [responsive]="true" responsiveLayout="scroll">
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'column.name' | translate }}</th>
        <th>{{ 'column.status' | translate }}</th>
        <th style="width: 120px">{{ 'column.action' | translate }}</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-item>
      <tr>
        <td>{{ item.name }}</td>
        <td>{{ item.status }}</td>
        <td>
          <button pButton icon="pi pi-pencil" class="p-button-text" (click)="onEdit(item)"></button>
          <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="onDelete(item)"></button>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr><td colspan="3" class="text-center">{{ 'message.noData' | translate }}</td></tr>
    </ng-template>
  </p-table>

  <!-- Form Dialog -->
  <app-{name}-form *ngIf="showDialog" [visible]="showDialog" [data]="selectedItem"
                   (onSave)="onSaved()" (onCancel)="showDialog = false">
  </app-{name}-form>
</div>

<p-confirmDialog></p-confirmDialog>
```

### Bước 4: Tạo service (nếu chưa có)
Dùng pattern từ `04-evnict-kit-frontend-conventions.md`.

### Bước 5: Test page
```typescript
describe('{Name}ListComponent', () => {
  // Test: load data on init
  // Test: search with keyword
  // Test: pagination
  // Test: create dialog opens
  // Test: delete with confirmation
});
```

### Bước 6: Verify
```bash
ng test --watch=false
ng lint
ng build
```

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
- [ ] Module tạo/update đúng
- [ ] Routing configured (lazy-loaded)
- [ ] Page component với loading/error states
- [ ] Service created/reused
- [ ] i18n keys added
- [ ] Responsive design
- [ ] Tests viết và PASS
- [ ] Build OK
