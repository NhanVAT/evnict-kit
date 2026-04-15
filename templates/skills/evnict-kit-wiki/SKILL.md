---
name: evnict-kit-wiki
description: Quản lý knowledge base dự án bằng LLM Wiki. Push tri thức, query, ingest, status, scan-code. Tích hợp sẵn vào cuối mọi workflow.
compatibility: AI Agent (Claude Code / Antigravity)
---

# evnict-kit-wiki — Project Knowledge Base

## Khi nào dùng
- Push kiến thức mới vào wiki sau khi hoàn thành feature/bugfix/ATTT
- Query wiki để tìm context trước khi bắt đầu task mới
- Ingest raw notes thành wiki pages
- Scan code hiện có để sinh wiki notes
- Kiểm tra health/status wiki

## Sub-commands

| Command | Mô tả | Trigger bởi |
|---------|-------|-------------|
| push | Thêm tri thức mới vào wiki | Agent gọi sau feature/bugfix/ATTT |
| query | Tìm kiếm tri thức | Agent gọi trước khi bắt đầu task |
| ingest | Xử lý raw notes thành wiki pages | Tự động sau push |
| status | Xem trạng thái wiki | Kiểm tra health |
| scan-code | Đọc code BE/FE → sinh wiki notes | Dùng cho dự án có sẵn code |

## Input Parameters
- `action` (bắt buộc): push | query | ingest | status | scan-code
- `content` (cho push): Nội dung cần push
- `keyword` (cho query): Từ khóa tìm kiếm
- `domain` (optional): Module/domain filter
- `tags` (optional): Tags filter
- `scope` (cho scan-code): all | controllers | services | entities

---

## Xác định Wiki Path (qua symlink)

**Thứ tự ưu tiên:**
1. **Symlink (Ưu tiên):** Kiểm tra ở root dự án có thư mục `{project_name}-wiki/`
   - Dùng Relative Path (đường dẫn tương đối) để tránh bug pathing OS chéo
2. **Config (Fallback):** Đọc `.evnict/config.yaml` → `wiki.folder`
3. **Verify:** Tồn tại `config.yaml` + `raw/` + `wiki/` trong wiki path
4. **Nếu chưa setup** → DỪNG VÀ BÁO: *"Chạy `/evnict-kit:init-wiki` trước"*

```bash
# Quick check
ls {project_name}-wiki/config.yaml 2>/dev/null || echo "Wiki chưa setup"
```

---

## Sub-command: PUSH — Thêm tri thức vào wiki

### Khi nào
- Sau khi hoàn thành feature (gọi bởi workflow archive-wiki)
- Sau khi fix bug (gọi bởi workflow bug-fix)
- Sau khi fix ATTT (gọi bởi workflow attt — BẮT BUỘC)
- Khi user yêu cầu thêm tri thức thủ công

### Quy trình

#### Bước 1: Sinh markdown file với frontmatter chuẩn llm-wiki
```yaml
---
title: "{title}"
url: ""
discovered: {YYYY-MM-DD}
topic: "{module/domain}"
tags: [{tags}]
source: "evnict-kit-auto"
type: feature|bugfix|attt|architecture|convention
related_specs: ["{spec_path}"]
---
```

#### Bước 2: Viết nội dung — PHẢI bao gồm đầy đủ
Nội dung push PHẢI chứa tất cả các mục sau (nếu applicable):

```markdown
## Tóm tắt
{Mô tả feature/bugfix — 3-5 câu}

## API Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| POST | /api/{module}/{action} | {description} |
| ... | ... | ... |

## Database Changes
| Table | Change | Details |
|-------|--------|---------|
| {TABLE} | CREATE/ALTER | {columns added/modified} |

## Business Rules áp dụng
| Mã | Rule | Implementation |
|----|------|----------------|
| BR01 | {rule} | {how it was implemented} |

## Key Code Patterns sử dụng
- Repository Pattern: {file} — JOOQ type-safe queries
- DTO mapping: {file} — @JsonProperty UPPER_SNAKE
- ...

## Files thay đổi chính
| File | Action | Lines |
|------|--------|-------|
| {path} | CREATE | {N} |
| {path} | MODIFY | {N} |

## Lessons Learned
- {Issue encountered} → {How resolved}
- {Pattern discovered} → {How applied}
```

#### Bước 3: Copy vào wiki
```bash
# Naming convention: {domain}-{slug}.md
cp {generated_file} {wiki_path}/raw/notes/{domain}-{slug}.md
```

#### Bước 4: TỰ ĐỘNG chạy ingest
**KHÔNG bắt user chạy node/npm.** Agent TRỰC TIẾP chạy ingest:
Thực hiện ingest procedure (tiến hành theo hướng dẫn Sub-command INGEST).

#### Bước 5: Confirm
```
✅ Wiki pushed: {wiki_path}/raw/notes/{domain}-{slug}.md
✅ Ingest completed: {N} pages created/updated
📚 Wiki size: {total_raw} raw, {total_wiki} wiki pages
```

---

## Sub-command: QUERY — Tìm kiếm và Tổng hợp tri thức

### Khi nào
- Trước khi bắt đầu feature mới → tìm context liên quan
- Khi fix bug → tìm nguyên nhân, chức năng liên quan
- Khi brainstorm → explore và tổng hợp tri thức đã có
- Khi cần hiểu business rule, architecture, convention

### Quy trình (theo llm-wiki pattern)

#### Bước 1: Đọc INDEX.md — Xác định trang liên quan
1. Đọc `{wiki_path}/wiki/INDEX.md`
2. Map keywords từ câu hỏi vào danh mục wiki
3. Xác định categories cần đọc: entities, concepts, sources, syntheses
4. Lập danh sách trang cần đọc dựa trên INDEX

#### Bước 2: Đọc ĐẦY ĐỦ các trang wiki liên quan
1. Đọc tất cả trang liên quan đã xác định từ INDEX (không chỉ 1-2 trang)
2. Theo cross-references `[[links]]` trong các trang → mở rộng context
3. Nếu INDEX không đủ → dùng grep bổ sung:
   ```bash
   grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md" 2>/dev/null
   ```
4. Nếu keyword không khớp chính xác → thử mở rộng:
   - Tách keyword thành từ đơn
   - Tìm theo domain/topic trong frontmatter
   - Tìm theo tags

#### Bước 3: Tổng hợp câu trả lời (SYNTHESIS)
**Đây là bước QUAN TRỌNG NHẤT — tạo giá trị tri thức compound.**

1. Tổng hợp thông tin từ nhiều trang wiki thành câu trả lời hoàn chỉnh
2. Trích dẫn nguồn wiki: `[[tên-trang-wiki]]`
3. Nếu nhiều góc nhìn → so sánh, phân tích, bảng đối chiếu
4. Nếu có mâu thuẫn giữa các trang → ghi rõ cả hai quan điểm

**Quy tắc:**
- Trả lời **DỰA TRÊN WIKI** — KHÔNG dùng kiến thức bên ngoài
- Nếu wiki thiếu thông tin → nói rõ và gợi ý:
  - Topics/sources cần discover thêm
  - Chạy `/evnict-kit:wiki-scan-project` để populate
  - Push thêm tri thức thủ công
- Format đầu ra linh hoạt: markdown, bảng so sánh, bullet points

#### Bước 4: Lưu kết quả (nếu có giá trị phân tích)
Nếu câu trả lời chứa so sánh/phân tích/tổng hợp có giá trị:
1. Tạo synthesis page với frontmatter chuẩn:
   ```yaml
   ---
   type: synthesis
   topic: "{keyword}"
   created: YYYY-MM-DD
   sources_count: N
   ---
   ```
2. Lưu vào `{wiki_path}/wiki/syntheses/{keyword-slug}.md`
3. Hoặc lưu query result vào `{wiki_path}/outputs/query-{keyword-slug}-{date}.md`
4. Cập nhật `{wiki_path}/wiki/INDEX.md` (nếu tạo synthesis page mới)

#### Bước 5: Ghi LOG.md
Ghi vào `{wiki_path}/wiki/LOG.md`:
```markdown
## [YYYY-MM-DD HH:mm] query | "{keyword}"
- Trang đọc: {N} pages
- Kết quả: {tóm tắt 1 dòng}
- Synthesis: {path nếu có lưu}
```

### Output format
```
📚 Wiki Query: "{keyword}"
═══════════════════════════

## Tổng hợp
{Câu trả lời tổng hợp từ nhiều nguồn wiki — đây là phần QUAN TRỌNG NHẤT}

## Nguồn wiki đã tham chiếu
- [[entity-or-concept-1]] — {1 dòng context}
- [[entity-or-concept-2]] — {1 dòng context}
- [[source-summary]] — {1 dòng context}

## Gaps detected
{Nếu wiki thiếu thông tin:}
💡 Wiki chưa có đủ thông tin về "{keyword}".
   Gợi ý: Chạy scan-code hoặc push thêm tri thức.

## Synthesis saved
{Nếu đã lưu:} ✅ Đã lưu tổng hợp: wiki/syntheses/{slug}.md
```

---

## Sub-command: INGEST (từ project qua symlink)
1. Wiki path: {project_name}-wiki/ (symlink)
2. Đọc {wiki_path}/CLAUDE.md → hiểu schema
3. Scan {wiki_path}/raw/notes/ → tìm file chưa có trong history.json
4. Sinh wiki/sources/, wiki/entities/, wiki/concepts/
5. Cập nhật INDEX.md + LOG.md + history.json
→ Agent tự làm hết, KHÔNG cần mở Agent riêng

### QUAN TRỌNG
- **KHÔNG BAO GIỜ** sửa file trong `raw/`
- Trích dẫn nguồn: `[Nguồn: filename](../raw/path)`
- Nếu mâu thuẫn giữa sources → giữ cả hai, ghi rõ

---

## Sub-command: SCAN-CODE — Sinh wiki từ codebase

### Mục đích
Đọc code hiện có của dự án → sinh wiki notes cho tri thức chưa được document.

### Khi nào
- Dự án đã có sẵn code nhưng chưa có wiki
- Sau khi init-rules xong → scan-code để populate wiki
- Khi onboard member mới → document codebase nhanh

### Quy trình

#### Bước 1: Thu thập context
1. Đọc AGENTS.md → hiểu project overview
2. Đọc `.agent/rules/05-*-project-conventions.md` → conventions đã detect
3. Đọc `.evnict/config.yaml` → project structure

#### Bước 2: Scan source code
**Controllers:**
```bash
find src/ -name "*Controller.java" -type f 2>/dev/null
# hoặc Angular
find src/ -name "*.service.ts" -type f 2>/dev/null
```
→ Sinh wiki note cho mỗi API module:
- Endpoints list
- Request/Response format
- Auth requirements

**Services:**
→ Sinh wiki note cho business logic:
- Methods và mục đích
- Business rules enforced
- Dependencies

**Entities/DTOs:**
→ Sinh wiki note cho data model:
- Fields mapping
- Database tables
- Relationships

#### Bước 3: Đọc handoff files (nếu có)
```bash
ls .evnict/handoff/ 2>/dev/null
```
Kết hợp context từ BE/FE handoff.

#### Bước 4: Push tất cả vào wiki
Với mỗi note đã sinh → copy vào `raw/notes/`
Naming: `{domain}-{type}-{slug}.md`

#### Bước 5: Chạy ingest
Thực hiện ingest procedure (tiến hành theo hướng dẫn Sub-command INGEST).

#### Bước 6: Report
```
📊 Scan-Code Results
═══════════════════════════════════
  Scanned: {N} controllers, {M} services, {K} entities
  Generated: {X} wiki notes
  Topics: {list of domains/modules}
  
  New wiki pages:
    + {domain}-api-{module}.md
    + {domain}-service-{module}.md
    + {domain}-model-{entity}.md
    ...
═══════════════════════════════════
```

### Bổ sung nghiệp vụ khi scan
Khi scan code và sinh wiki note:
1. ĐỌC code để HIỂU nghiệp vụ — suy ra "user có thể làm gì"
2. Từ validation rules → suy ra business rules (BR01, BR02...)
3. Từ foreign keys → suy ra liên kết chức năng
4. Từ auth checks → suy ra phân quyền
5. Đặt phần nghiệp vụ LÊN TRƯỚC, phần kỹ thuật SAU
6. Tỷ lệ: 50% nghiệp vụ + 50% kỹ thuật

---

## Sub-command: STATUS — Kiểm tra wiki health

### Output Format
```
📚 Wiki Status: {project_name}-wiki
══════════════════════════════════
  Path:        {wiki_path}
  Raw sources: {N} files
  Wiki pages:  {M} pages
  Last push:   {date} ({file_name})
  Last ingest: {date}
  Health:      ✅ Good | ⚠️ Warning | ❌ Needs Attention
  
  Domains:     {list unique domains}
  Gaps:        {list topics chưa có wiki}
══════════════════════════════════
```

### Health check rules
| Status | Condition |
|--------|-----------|
| ✅ Good | Raw đã ingest hết, wiki pages > 0 |
| ⚠️ Warning | Có raw chưa ingest, hoặc > 30 ngày chưa push |
| ❌ Needs Attention | Wiki rỗng, hoặc ingest lỗi |

---

## Tích hợp vào các Workflow khác

Mỗi workflow khi hoàn thành PHẢI gợi ý wiki:

### feature-large / feature-small
Sau archive → **tự động push wiki → ingest**

### bug-fix
Sau fix xong → gợi ý:
```
💡 Bug fix hoàn thành. Bạn muốn thêm tri thức vào wiki không?
A) Có — tôi sẽ tóm tắt bug + fix → push wiki
B) Không — skip
```

### attt
Sau fix ATTT → **tự động push wiki** (BẮT BUỘC — ATTT fix luôn cần document)

### init (lần đầu)
Sau init-rules + init-context xong → gợi ý:
```
💡 Project đã có code sẵn. Chạy scan-code để tạo wiki từ codebase?
A) Có — scan-code → push → ingest
B) Không — skip, tôi sẽ push thủ công sau
```

---

## Frontmatter Rules

### Required fields
| Field | Type | Description |
|-------|------|-------------|
| title | string | Tiêu đề ngắn gọn |
| discovered | string | YYYY-MM-DD (ngày tạo) |
| topic | string | Module/domain (customer, order, auth...) |
| tags | string[] | Auto-detected keywords |
| source | string | "evnict-kit-auto" hoặc "manual" |
| type | string | feature, bugfix, attt, architecture, convention |

### Optional fields
| Field | Type | Description |
|-------|------|-------------|
| url | string | URL tham chiếu (trống nếu internal) |
| related_specs | string[] | Paths to related spec files |
| deprecated | boolean | Đánh dấu nếu obsolete |

---

## Error Handling

### DỪNG khi:
- Wiki folder không tồn tại → *"Chạy `/evnict-kit:init-wiki` trước"*
- Error file config → Verify `config.yaml`
- Frontmatter thiếu required fields → KHÔNG push, sửa trước

### Auto-recovery:
- Agent tự động bổ sung file chưa hoàn thiện.

---

## Tiêu chí hoàn thành
- [ ] File markdown tạo đúng format frontmatter (llm-wiki chuẩn)
- [ ] Nội dung đầy đủ (API, DB, BR, files, lessons)
- [ ] File đã copy vào `raw/notes/` đúng naming
- [ ] Ingest đã thực hiện hoàn tất TỰ ĐỘNG
- [ ] Query trả về results có format rõ ràng + gap detection
- [ ] scan-code sinh được wiki notes từ codebase
- [ ] Status cho health check chính xác
