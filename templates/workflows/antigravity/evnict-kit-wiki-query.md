---
description: Truy vấn và tổng hợp tri thức từ wiki — đọc INDEX, tổng hợp từ nhiều trang, lưu synthesis. Theo đúng pattern llm-wiki.
---

# Wiki Query
**Command:** `/evnict-kit:wiki-query "từ khóa"`

## Khi nào dùng
- Trước khi bắt đầu feature mới → tìm context liên quan
- Khi fix bug → tìm thông tin chức năng bị bug
- Khi cần hiểu business rule → tìm trong wiki
- Khi onboard → tìm hiểu module

## Input
- Từ khóa tìm kiếm (tiếng Việt hoặc tiếng Anh)
- VD: `/evnict-kit:wiki-query "công suất giờ"`
- VD: `/evnict-kit:wiki-query "API import CSV"`

---

## Bước 1: Xác định wiki path
1. Check symlink `{project_name}-wiki/` trong thư mục gốc project
2. Nếu không tồn tại → đọc `.evnict/config.yaml` → lấy `wiki.folder`
3. Nếu vẫn không tìm thấy → DỪNG: *"Wiki chưa được liên kết. Chạy `evnict-kit init`."*

## Bước 2: Đọc INDEX.md — Xác định trang liên quan
1. Đọc `{wiki_path}/wiki/INDEX.md`
2. Map keywords từ câu hỏi vào danh mục wiki
3. Xác định categories cần đọc: entities, concepts, sources, syntheses
4. Lập danh sách trang cần đọc dựa trên INDEX

## Bước 3: Đọc ĐẦY ĐỦ các trang wiki liên quan
1. Đọc tất cả trang liên quan từ INDEX (không chỉ 1-2 trang)
2. Theo cross-references `[[links]]` → mở rộng context
3. Nếu INDEX không đủ → dùng grep bổ sung:
   ```bash
   grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"
   grep -rl "{keyword}" {wiki_path}/raw/notes/ --include="*.md"
   ```
4. Nếu keyword không khớp chính xác → thử tìm kiếm mở rộng:
   - Tách keyword thành từ đơn
   - Tìm theo domain/topic trong frontmatter
   - Tìm theo tags

## Bước 4: Tổng hợp câu trả lời (SYNTHESIS)
**Đây là bước QUAN TRỌNG NHẤT — tạo giá trị tri thức compound.**

1. Tổng hợp thông tin từ nhiều trang wiki thành câu trả lời hoàn chỉnh
2. Trích dẫn nguồn wiki: `[[tên-trang-wiki]]`
3. Nếu nhiều góc nhìn → so sánh, phân tích, bảng đối chiếu
4. Trả lời **DỰA TRÊN WIKI** — KHÔNG dùng kiến thức bên ngoài
5. Nếu wiki thiếu → nói rõ và gợi ý topics cần discover/push

Output format:
```
📚 Wiki Query: "{keyword}"
═══════════════════════════

## Tổng hợp
{Câu trả lời tổng hợp từ nhiều nguồn wiki — đây là phần QUAN TRỌNG NHẤT}

## Nguồn wiki đã tham chiếu
- [[entity-or-concept-1]] — {1 dòng context}
- [[source-summary]] — {1 dòng context}

## Gaps detected
{Nếu wiki thiếu thông tin:}
💡 Wiki chưa có đủ thông tin về "{keyword}".
   Gợi ý: Chạy scan-code hoặc push thêm tri thức.
```

## Bước 5: Lưu synthesis (nếu có phân tích sâu)
Nếu query dẫn đến so sánh/phân tích giữa nhiều trang:
1. Tổng hợp thành synthesis document với frontmatter chuẩn:
   ```yaml
   ---
   type: synthesis
   topic: "{keyword}"
   created: YYYY-MM-DD
   sources_count: N
   ---
   ```
2. Lưu vào `{wiki_path}/wiki/syntheses/{keyword-slug}.md`
3. Cập nhật `{wiki_path}/wiki/INDEX.md`
4. Thông báo: "✅ Đã lưu tổng hợp vào syntheses/"

## Bước 6: Ghi LOG.md
Ghi vào `{wiki_path}/wiki/LOG.md`:
```markdown
## [YYYY-MM-DD HH:mm] query | "{keyword}"
- Trang đọc: {N} pages
- Kết quả: {tóm tắt 1 dòng}
- Synthesis: {path nếu có lưu}
```

---

## Lưu ý
- Query KHÔNG sửa wiki pages hiện có — chỉ đọc + tạo synthesis mới
- Context trích xuất PHẢI đủ chi tiết để Agent sử dụng được
- Nếu trang wiki bị thiếu/cũ → gợi ý user chạy `/evnict-kit:wiki-archive-feature` hoặc `/evnict-kit:wiki-scan-project`
- Workflow này được gọi TỰ ĐỘNG bởi các workflow khác (feature-large, feature-small, bug-fix) ở bước đầu tiên

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
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Checklist hoàn thành
- [ ] Wiki path xác định
- [ ] INDEX.md đọc và phân tích
- [ ] Trang wiki liên quan đọc đầy đủ
- [ ] Câu trả lời tổng hợp với citations
- [ ] Synthesis lưu (nếu có phân tích sâu)
- [ ] LOG.md ghi nhận query
