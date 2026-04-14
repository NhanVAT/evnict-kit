---
description: Truy vấn tri thức từ wiki — tìm kiếm theo keyword, domain, tags. Trả context cho Agent sử dụng.
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

## Bước 2: Search
1. Đọc `{wiki_path}/wiki/INDEX.md` → map keywords (nếu INDEX tồn tại)
2. Search trong `{wiki_path}/wiki/` và `{wiki_path}/raw/notes/`:
   ```bash
   grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"
   grep -rl "{keyword}" {wiki_path}/raw/notes/ --include="*.md"
   ```
3. Đọc các pages liên quan (đọc ĐỦ nội dung, không chỉ 1-2 trang)
4. Nếu keyword không khớp chính xác → thử tìm kiếm mở rộng:
   - Tách keyword thành từ đơn
   - Tìm theo domain/topic trong frontmatter
   - Tìm theo tags

## Bước 3: Trả kết quả
```
📚 Wiki Query: "{keyword}"
═══════════════════════════
Tìm thấy {N} trang liên quan:

1. {page_name} — {1 dòng mô tả}
   Tags: {tags}
   
2. {page_name} — {1 dòng mô tả}
   Tags: {tags}

───────────────────────────
## Context trích xuất:
{Tổng hợp nội dung liên quan từ các trang — đây là phần QUAN TRỌNG NHẤT}

## Nguồn:
- {wiki_path}/wiki/{page_1}.md
- {wiki_path}/raw/notes/{page_2}.md
```

Nếu KHÔNG tìm thấy kết quả:
```
📚 Wiki Query: "{keyword}"
═══════════════════════════
Không tìm thấy trang nào liên quan.

💡 Gợi ý:
- Thử từ khóa khác (tiếng Việt/Anh)
- Nạp thêm tri thức: /evnict-kit:wiki-scan-project
- Wiki có thể trống — kiểm tra: ls {wiki_path}/raw/notes/
```

## Bước 4: Lưu synthesis (nếu phân tích sâu)
Nếu query dẫn đến so sánh/phân tích giữa nhiều trang:
1. Tổng hợp thành 1 synthesis document
2. Lưu vào `{wiki_path}/wiki/syntheses/{keyword-slug}-{date}.md`
3. Thông báo: "Đã lưu tổng hợp vào syntheses/"

---

## Lưu ý
- Query KHÔNG sửa wiki — chỉ đọc
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
- [ ] Search hoàn tất
- [ ] Context trích xuất đầy đủ
- [ ] Kết quả trả về cho Agent/User
- [ ] Synthesis lưu (nếu có phân tích sâu)
