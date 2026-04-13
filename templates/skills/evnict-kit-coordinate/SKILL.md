---
name: evnict-kit-coordinate
description: FE↔BE coordination protocol — handoff, API contract format, status sync. Đảm bảo 2 agent (BE, FE) phối hợp đúng khi cùng làm 1 feature.
compatibility: All tech stacks
---

# evnict-kit-coordinate — FE↔BE Coordination

## Khi nào dùng
- Feature cần cả Backend và Frontend
- BE agent xong API → FE agent cần biết để implement
- Cần sync status giữa 2 project/agent

## Input Parameters
- `action` (bắt buộc): handoff | publish-contract | read-contract | update-status | check-status
- `feature` (bắt buộc): Feature slug

---

## Workflow Steps

### Action: HANDOFF — Bàn giao feature chi tiết
Hành động đặc biệt được kích hoạt bởi lệnh `/evnict-kit:handoff`.

> **CHI TIẾT:** Xem command `evnict-kit-handoff` để biết template handoff 5 sections đầy đủ.

#### Bước 1: Rà soát và Publish Contract
Chạy nội dung tương đương `PUBLISH-CONTRACT` nếu chưa chạy. Xác minh `contracts/{feature}-api.yaml` đã có đầy đủ.

#### Bước 2: Append Entry vào Handoff Log (5 SECTIONS)
**KHÔNG** tạo file riêng cho mỗi feature. Thay vào đó, APPEND entry vào `.evnict/handoff/handoff.md`.

Nếu file chưa tồn tại → tạo mới với header:
```markdown
# Agent Handoff Log
> File này dùng để trao đổi giữa BE Agent và FE Agent.
> Mỗi issue ghi theo format bên dưới.

---
```

Mỗi entry PHẢI có 5 sections:

| Section | Nội dung |
|---------|----------|
| 1. Tổng quan | Tasks hoàn thành, files, tests, commits |
| 2. API Contract | Endpoints, DTO→TypeScript interface, Validation rules sync, Request/Response format |
| 3. Yêu cầu FE | FE tasks, UI requirements, Dropdowns cần load |
| 4. Lưu ý | ResponseData wrapper, Auth, Date format, Audit fields |
| 5. Hướng dẫn | Step-by-step cho FE Agent |

Entry format:
```markdown
### [{YYYY-MM-DD}] BE→FE: {Feature Name} — Handoff
- **Trạng thái:** 🔴 Chờ xử lý
- **Mô tả:** {tóm tắt}
- **API liên quan:** {endpoints}
- **Kết quả xử lý:** _(FE Agent điền sau khi implement xong)_
```

#### Bước 3: DTO → TypeScript Interface
Agent PHẢI đọc Java DTO file và generate TypeScript interface:
```typescript
// Auto-generated từ {EntityName}DTO.java
export interface {EntityName} {
  ID: number;
  FIELD_NAME: string;           // @JsonProperty("FIELD_NAME")
  NULLABLE_FIELD?: string;      // nullable → optional (?)
  // ... map tất cả fields
}
```

**Quy tắc mapping:**
| Java Type | TypeScript Type | Note |
|-----------|----------------|------|
| Long, Integer, int | number | |
| String | string | |
| Date, LocalDate | string | format: yyyy-MM-dd |
| BigDecimal | number | |
| Boolean | boolean | |
| Nullable field | optional (?) | thêm `?` |

#### Bước 4: Validation Rules Sync Table
Trích validation từ BE code → tạo sync table:
```markdown
| Field | Rule | Error Message (tiếng Việt) |
|-------|------|---------------------------|
| {FIELD} | Required | "Vui lòng nhập {field}" |
| {FIELD} | MaxLength(N) | "Không quá N ký tự" |
```
FE PHẢI implement cùng validation rules để đảm bảo UX nhất quán.

#### Bước 5: Update BE Status
Cập nhật `.evnict/handoff/be-status.md`:
```markdown
# BE Status
status: done
feature: {feature-name}
completed_tasks: ["task-01", "task-02", ...]
api_contract: handoff/contracts/{feature}-api.yaml
handoff_entry: handoff/handoff.md (entry [{date}] BE→FE: {feature})
last_updated: {timestamp}
```

#### Khi Agent bên kia xử lý xong
Update status entry trong `handoff.md`:
- Đổi `🔴 Chờ xử lý` → `🟢 Đã xử lý`
- Điền **Kết quả xử lý:** {mô tả kết quả}

---

### Action: PUBLISH-CONTRACT — BE agent ghi API contract

#### Bước 1: Tạo contract file
Sau khi BE hoàn thành API, tạo file:
`.evnict/handoff/contracts/{feature}-api.yaml`

```yaml
feature: {feature-name}
generated: {YYYY-MM-DD HH:mm}
status: ready
base_url: /api/{module}

endpoints:
  - method: GET
    path: /api/{module}
    description: Danh sách (phân trang)
    auth: required
    params:
      keyword: { type: string, required: false }
      page: { type: integer, default: 0 }
      size: { type: integer, default: 20 }
    response:
      200:
        schema: ResponseData
        data:
          content: [{ id: number, name: string, ... }]
          totalElements: number
          totalPages: number

  - method: POST
    path: /api/{module}
    description: Tạo mới
    auth: required
    body:
      name: { type: string, required: true, maxLength: 200 }
      phone: { type: string, pattern: "^0[0-9]{9}$" }
    response:
      200:
        schema: ResponseData
        data: { id: number, name: string, ... }
      400:
        schema: ResponseData
        error: { message: string }
```

#### Bước 2: Update BE status
Cập nhật `.evnict/handoff/be-status.md`:
```markdown
# BE Status
status: done
feature: {feature-name}
completed_tasks: ["task-01", "task-02", "task-03", "task-04"]
api_contract: handoff/contracts/{feature}-api.yaml
last_updated: {timestamp}
notes: {any important notes for FE agent}
```

---

### Action: READ-CONTRACT — FE agent đọc contract

#### Bước 1: Check BE status
```bash
cat .evnict/handoff/be-status.md
# → status: done? → Đọc contract
# → status: in-progress? → CHƯA sẵn sàng, chờ
```

#### Bước 2: Đọc contract
```bash
cat .evnict/handoff/contracts/{feature}-api.yaml
```

#### Bước 3: Generate FE service từ contract
Dựa vào contract → tạo Angular service:
```typescript
// Auto-generated from contract
@Injectable({ providedIn: 'root' })
export class {Module}Service {
  private baseUrl = `${environment.apiUrl}/api/{module}`;

  constructor(private http: HttpClient) {}

  // Từ GET endpoint trong contract
  search(keyword: string, page: number, size: number): Observable<ResponseData> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ResponseData>(this.baseUrl, { params });
  }

  // Từ POST endpoint trong contract
  create(dto: {Module}DTO): Observable<ResponseData> {
    return this.http.post<ResponseData>(this.baseUrl, dto);
  }
}
```

---

### Action: UPDATE-STATUS — Cập nhật status

#### BE Status format
```markdown
# BE Status
status: idle | in-progress | done | blocked
feature: {feature-name}
current_task: task-{N}
completed_tasks: ["task-01", "task-02"]
blocked_reason: {reason if blocked}
last_updated: {timestamp}
```

#### FE Status format
```markdown
# FE Status
status: idle | waiting-be | in-progress | done | blocked
feature: {feature-name}
current_task: task-{N}
completed_tasks: ["task-05", "task-06"]
waiting_for: {what FE is waiting for}
last_updated: {timestamp}
```

---

### Action: CHECK-STATUS — Kiểm tra status

Đọc cả 2 file status → tóm tắt:
```markdown
## 📊 Feature: {feature-name}

### Backend
- Status: {status}
- Progress: {completed}/{total} tasks
- API Contract: {ready/not-ready}

### Frontend
- Status: {status}
- Progress: {completed}/{total} tasks
- Waiting for: {if any}

### Next Action
- {Recommendation based on status}
```

---

## Error Handling

### DỪNG khi:
- FE agent cố implement mà BE chưa done → Phải chờ hoặc dùng mock
- Contract file không tồn tại → BE chưa publish
- Contract format lỗi → Nhắc fix trước

---

## Tiêu chí hoàn thành
- [ ] Contract file tạo đúng format YAML
- [ ] Status files cập nhật đúng
- [ ] FE agent đọc được contract
- [ ] Status sync giữa BE ↔ FE chính xác
