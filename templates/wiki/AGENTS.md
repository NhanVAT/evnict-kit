# LLM Wiki — Schema & Quy tắc vận hành

> Hệ thống knowledge base cá nhân dựa trên pattern của Andrej Karpathy.
> LLM xây dựng và duy trì wiki từ nguồn thô. Con người chỉ đọc wiki và hỏi đáp.

## Kiến trúc 3 lớp

```
raw/        → Nguồn thô (bất biến — LLM CHỈ ĐỌC, KHÔNG BAO GIỜ SỬA)
wiki/       → Wiki do LLM viết & duy trì hoàn toàn
outputs/    → Kết quả query, reports, phân tích
config.yaml → Cấu hình topics, feeds, lịch chạy
```

## Cấu trúc thư mục

```
llm-wiki/
├── CLAUDE.md              ← File này — schema & quy tắc
├── config.yaml            ← Cấu hình hệ thống
├── raw/                   ← Nguồn thô (KHÔNG ĐƯỢC SỬA)
│   ├── articles/          ← Web articles (markdown, text)
│   ├── papers/            ← PDF, research papers
│   ├── notes/             ← Ghi chú cá nhân
│   ├── media/             ← Screenshots, diagrams
│   └── assets/            ← Downloaded images từ articles
├── wiki/                  ← LLM sở hữu toàn bộ
│   ├── INDEX.md           ← Catalog mọi trang wiki
│   ├── LOG.md             ← Timeline sự kiện
│   ├── entities/          ← Người, tổ chức, tool, project
│   ├── concepts/          ← Khái niệm, pattern, methodology
│   ├── sources/           ← Summary từng raw source
│   └── syntheses/         ← Phân tích tổng hợp, so sánh
├── outputs/               ← Kết quả query & reports
└── .discoveries/          ← Metadata cho auto-discovery
    ├── feeds.json         ← Nguồn đang theo dõi
    ├── gaps.json          ← Knowledge gaps cần lấp
    └── history.json       ← Nguồn đã xử lý (tránh trùng)
```

## Quy tắc vàng

### 1. Raw sources là bất biến
- KHÔNG BAO GIỜ sửa, xóa, hoặc di chuyển file trong `raw/`
- Đây là source of truth — mọi thứ trong wiki phải truy ngược được về raw

### 2. Wiki do LLM sở hữu hoàn toàn
- Con người KHÔNG sửa wiki bằng tay
- LLM tạo, cập nhật, xóa trang wiki
- Mỗi thay đổi phải được ghi vào LOG.md

### 3. Mỗi topic một file
- Mỗi entity, concept, source summary là một file `.md` riêng
- File name: `kebab-case.md` (VD: `andrej-karpathy.md`, `llm-agents.md`)
- Không tạo file quá dài — tách thành nhiều file nếu > 500 dòng

### 4. Cross-reference bằng wiki links
- Dùng format `[[tên-file]]` để liên kết giữa các trang
- Mỗi trang nên có ít nhất 2 liên kết đến trang khác
- Orphan pages (không ai liên kết đến) cần được phát hiện khi lint

### 5. INDEX.md luôn cập nhật
- Mỗi lần tạo/xóa trang → cập nhật INDEX.md
- Format: `- [Tên trang](path) — mô tả một dòng`
- Phân nhóm theo category: entities, concepts, sources, syntheses

### 6. LOG.md ghi nhận mọi hoạt động
- Format: `## [YYYY-MM-DD HH:mm] action | Mô tả`
- Actions: `ingest`, `query`, `lint`, `discover`, `update`
- Mỗi entry ghi rõ: files đã tạo/sửa, số trang bị ảnh hưởng

## Workflows

### Ingest (Nhập nguồn mới)

```
1. Đọc file mới trong raw/
2. Tạo source summary trong wiki/sources/
3. Trích xuất entities → tạo/cập nhật wiki/entities/
4. Trích xuất concepts → tạo/cập nhật wiki/concepts/
5. Tìm connections với trang đã có → thêm cross-references
6. Phát hiện contradictions với nội dung cũ → ghi chú
7. Cập nhật INDEX.md
8. Ghi LOG.md
9. Cập nhật .discoveries/history.json
```

**Quy tắc ingest:**
- Một source có thể ảnh hưởng 5-15 wiki pages
- Luôn trích dẫn nguồn: `[Nguồn: tên-file-raw](../raw/path)`
- Nếu thông tin mới mâu thuẫn với cũ → giữ cả hai, ghi rõ mâu thuẫn
- Không bịa thông tin — chỉ viết những gì có trong raw sources

### Query (Hỏi đáp)

```
1. Đọc INDEX.md để tìm trang liên quan
2. Đọc các trang wiki liên quan
3. Tổng hợp câu trả lời với citations
4. Nếu câu trả lời có giá trị → lưu vào outputs/ hoặc wiki/syntheses/
5. Ghi LOG.md
```

**Quy tắc query:**
- Trả lời dựa trên wiki, KHÔNG dựa trên kiến thức ngoài
- Nếu wiki không có đủ thông tin → nói rõ và gợi ý nguồn cần tìm
- Câu trả lời hay (so sánh, phân tích) → file lại thành wiki page mới

### Lint (Kiểm tra sức khỏe)

```
1. Kiểm tra contradictions giữa các trang
2. Tìm orphan pages (không ai liên kết đến)
3. Tìm mentioned-but-missing (nhắc đến nhưng chưa có trang)
4. Tìm stale claims (thông tin cũ bị nguồn mới bác bỏ)
5. Tìm knowledge gaps (lĩnh vực thiếu coverage)
6. Kiểm tra broken wiki links
7. Đề xuất trang mới cần tạo
8. Đề xuất nguồn mới cần tìm
9. Ghi kết quả vào outputs/ và LOG.md
```

### Discover (Tự động tìm nguồn)

```
1. Đọc config.yaml → lấy danh sách topics & feeds
2. Đọc .discoveries/gaps.json → lấy knowledge gaps
3. Web search theo topics + gaps
4. Scrape articles tìm được → lưu vào raw/articles/
5. Cập nhật .discoveries/feeds.json & history.json
6. Trigger ingest cho nguồn mới
7. Ghi LOG.md
```

**Quy tắc discover:**
- Chỉ tìm nguồn liên quan đến topics trong config.yaml
- Không tải lại nguồn đã có trong history.json
- Ưu tiên: gaps.json > trending topics > feeds định kỳ
- Mỗi lần discover tối đa 5-10 nguồn mới (tránh overload)

## Format trang wiki

### Entity page (wiki/entities/)

```markdown
---
type: entity
category: person | organization | tool | project
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [danh sách raw sources]
---

# Tên Entity

Mô tả ngắn 1-2 câu.

## Tổng quan
[Mô tả chi tiết]

## Điểm đáng chú ý
- [Bullet points]

## Liên kết
- [[concept-liên-quan]]
- [[entity-liên-quan]]

## Nguồn
- [Source 1](../raw/path)
- [Source 2](../raw/path)
```

### Concept page (wiki/concepts/)

```markdown
---
type: concept
domain: ai | engineering | business | ...
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [danh sách raw sources]
---

# Tên Concept

Mô tả ngắn 1-2 câu.

## Định nghĩa
[Giải thích rõ ràng]

## Cách hoạt động
[Chi tiết kỹ thuật nếu cần]

## Ví dụ
[Ví dụ cụ thể]

## Liên kết
- [[concept-liên-quan]]
- [[entity-liên-quan]]

## Nguồn
- [Source 1](../raw/path)
```

### Source summary (wiki/sources/)

```markdown
---
type: source
format: article | paper | note | video | podcast
raw_path: raw/articles/ten-file.md
ingested: YYYY-MM-DD
---

# Tên Source

## Tóm tắt
[2-3 đoạn tóm tắt nội dung chính]

## Key takeaways
- [Bullet points — điểm quan trọng nhất]

## Entities được nhắc đến
- [[entity-1]]
- [[entity-2]]

## Concepts được nhắc đến
- [[concept-1]]
- [[concept-2]]

## Trích dẫn đáng chú ý
> "Quote quan trọng từ nguồn"
```

### Synthesis page (wiki/syntheses/)

```markdown
---
type: synthesis
topic: chủ đề phân tích
created: YYYY-MM-DD
sources_count: N
---

# Tiêu đề phân tích

## Câu hỏi gốc
[Câu hỏi hoặc mục đích phân tích]

## Phân tích
[Nội dung phân tích tổng hợp]

## Kết luận
[Tóm tắt kết luận]

## Nguồn sử dụng
- [[source-1]]
- [[source-2]]
```

## Auto-Discovery

Hệ thống tự động tìm nguồn mới dựa trên:

1. **Topics** trong config.yaml — web search định kỳ
2. **Knowledge gaps** — lint phát hiện thiếu gì → discover tự tìm
3. **Feeds** — RSS, GitHub repos, YouTube channels
4. **Snowball** — đọc references trong sources đã có → follow links

Chu kỳ tự động (cấu hình trong config.yaml):
- Discover: mỗi ngày (hoặc theo cron)
- Ingest: ngay khi có file mới trong raw/
- Lint: hàng tuần
- Full recompile: hàng tháng (nếu cần)

## Ngôn ngữ

- Wiki content viết bằng **tiếng Việt có dấu** (trừ thuật ngữ kỹ thuật giữ tiếng Anh)
- File names: tiếng Anh, kebab-case
- Frontmatter: tiếng Anh
