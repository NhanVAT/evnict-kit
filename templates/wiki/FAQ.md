# FAQ — Câu hỏi thường gặp

## 1. Wiki phình to ra thì truy vấn thế nào?

**Hiện tại hệ thống không dùng graph database hay vector search.** Cách hoạt động:

```
Query đến → đọc INDEX.md (danh mục) → tìm trang liên quan → đọc trang đó → follow [[wiki-links]] nếu cần thêm context
```

Theo quy mô:

| Quy mô wiki | Cách truy vấn | Đủ chưa? |
|---|---|---|
| < 100 trang | Đọc INDEX.md → tìm trang liên quan | Thừa đủ |
| 100-500 trang | INDEX.md + grep theo keywords | Vẫn ổn |
| 500+ trang | Cần search engine (qmd, ripgrep, hoặc embeddings) | Cần nâng cấp |

Không có "vault trung tâm" hay "layers". Mỗi query, LLM đọc INDEX.md như mục lục sách → chọn 3-10 trang liên quan nhất → đọc sâu → follow cross-links nếu cần.

Obsidian Graph View chỉ là **visualization** — nó hiển thị tất cả nodes, nhưng khi click vào 1 node, nó highlight local graph (1-2 hop). Đây là UI, không phải cách LLM truy vấn.

Khi wiki quá lớn, Karpathy đề xuất dùng [qmd](https://github.com/tobi/qmd) — search engine local cho markdown files, hybrid BM25 + vector search. LLM gọi qmd qua CLI thay vì đọc INDEX.md.

---

## 2. Schema thay đổi theo thời gian thì versioning thế nào?

**Schema (CLAUDE.md) là file sống** — bạn và LLM cùng phát triển nó. Karpathy nói: "You and the LLM co-evolve this over time as you figure out what works for your domain."

Cách handle:

**a) Schema thay đổi nhỏ** (thêm field, sửa quy tắc)

Wiki pages cũ vẫn hoạt động. Lint sẽ phát hiện pages không đúng format mới → cập nhật dần.

**b) Schema thay đổi lớn** (đổi cấu trúc thư mục, thay đổi categories)

Chạy `/llm-wiki run` với schema mới — LLM sẽ recompile wiki, di chuyển pages, cập nhật cross-links. Đây là lý do config.yaml có `recompile: weekly`.

**c) Versioning thực tế**

Wiki chỉ là folder markdown files. Dùng **git** để version control:

```bash
cd llm-wiki
git init
git add wiki/ CLAUDE.md config.yaml
git commit -m "wiki snapshot v1"
```

Muốn quay lại schema cũ? `git checkout` là xong. Karpathy cũng nói: "The wiki is just a git repo of markdown files. You get version history, branching, and collaboration for free."

**d) Raw sources luôn bất biến**

Dù schema thay đổi, `raw/` không bao giờ bị sửa. Worst case: xóa toàn bộ `wiki/`, sửa CLAUDE.md, chạy `/llm-wiki run` → LLM rebuild wiki từ đầu theo schema mới. Không mất data.

---

## 3. Muốn dùng cho tài liệu nội bộ (Confluence) mà không tìm lan man trên internet?

Có 3 cách:

### Cách 1: Drop tài liệu vào `raw/` (đơn giản nhất)

Export trang Confluence thành markdown hoặc copy-paste nội dung:

```
raw/
  notes/
    confluence-feature-abc.md
    confluence-feature-xyz.md
```

Rồi chạy `/llm-wiki ingest`. LLM chỉ tổng hợp từ nội dung bạn cung cấp.

Khi query, ghi rõ:

```
/llm-wiki query "Giải thích feature ABC — chỉ dựa trên tài liệu nội bộ"
```

Wiki rule đã có sẵn: "Trả lời DỰA TRÊN WIKI, không dùng kiến thức bên ngoài."

### Cách 2: Tắt discover (kiểm soát hoàn toàn)

Sửa `config.yaml`:

```yaml
# Tắt toàn bộ auto-discovery
discovery:
  strategies: []    # Không tự tìm nguồn
```

Lúc này hệ thống chỉ xử lý file bạn bỏ vào `raw/` — không bao giờ ra internet.

Workflow:

```
Export Confluence → bỏ vào raw/notes/ → /llm-wiki ingest → /llm-wiki query "..."
```

### Cách 3: Kết nối Confluence qua MCP (nâng cao)

Nếu dùng Atlassian Cloud, có thể kết nối Confluence MCP server — LLM đọc trực tiếp mà không cần export thủ công:

```
Confluence → MCP Server → Claude Code → LLM Wiki ingest
```

Cách này phức tạp hơn và cần cấu hình MCP connector.

**Tóm lại:** Đơn giản nhất là export tài liệu → bỏ vào `raw/notes/` → `ingest`. Tắt `discovery.strategies` trong config nếu không muốn LLM tìm trên internet.

---

## 4. Chi phí token chạy tự động có tốn không?

Mỗi `/llm-wiki run` cycle (discover + ingest + lint) tốn khoảng **30K-80K tokens** tùy số nguồn mới.

| Tần suất | Lần/ngày | Token ước tính/ngày |
|---|---|---|
| Mỗi 30 phút | 48 | 1.5M-4M tokens |
| Mỗi 1 giờ | 24 | 720K-2M tokens |
| Mỗi 2 giờ | 12 | 360K-1M tokens |

Khuyến nghị: `/loop 1h` khi đang làm việc (dùng chung session, không tốn thêm), Task Scheduler 2h làm fallback.

Nếu run mà không có nguồn mới → hệ thống skip nhanh, tốn rất ít tokens.

---

## 5. Có thể dùng cho team/nhiều người không?

Hiện tại thiết kế cho **1 người dùng**. Để dùng cho team:

- Đưa wiki lên **git repo chung** — mỗi người pull/push
- Mỗi người có `config.yaml` riêng với topics khác nhau
- Dùng **git branches** cho từng hướng nghiên cứu
- Obsidian hỗ trợ sync qua Git hoặc Obsidian Sync

Karpathy cũng đề cập use case team: "An internal wiki maintained by LLMs, fed by Slack threads, meeting transcripts, project documents. Possibly with humans in the loop reviewing updates."

---

## 6. Có thể dùng model khác ngoài Claude không?

Hiện tại SKILL.md được viết cho **Claude Code**. Nhưng pattern LLM Wiki là model-agnostic:

- **OpenAI Codex**: dùng AGENTS.md thay CLAUDE.md
- **Cursor**: dùng .cursorrules
- **Gemini CLI**: tương tự

Karpathy nói: "This is an idea file, designed to be copy pasted to your own LLM Agent." Bạn chỉ cần adapt SKILL.md cho agent khác.

---

## 7. Wiki có bị hallucinate (bịa thông tin) không?

Rủi ro có, nhưng được giảm thiểu bằng:

1. **Quy tắc cứng**: "Không bịa thông tin — chỉ viết những gì có trong raw sources"
2. **Citations bắt buộc**: mỗi claim phải link về raw source
3. **Raw sources bất biến**: luôn có thể verify ngược
4. **Lint định kỳ**: phát hiện claims thiếu nguồn, mâu thuẫn
5. **Error compounding warning**: khi outputs file lại, lỗi có thể tích lũy → lint là cơ chế phòng ngừa

Không hoàn hảo 100%, nhưng tốt hơn nhiều so với chat history bay mất.
