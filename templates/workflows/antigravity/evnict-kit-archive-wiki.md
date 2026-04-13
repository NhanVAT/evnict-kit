---
description: Archive workflow — summarize feature → push wiki → archive spec → tạo postmortem. Dùng sau khi implement xong và user đã review.
---

# Archive + Wiki
**Command:** `/evnict-kit:archive-wiki`

## Khi nào dùng
- Sau khi implement xong
- User đã review code
- Cần archive spec + push kiến thức vào wiki

## Input
- Feature slug (auto-detect từ branch hoặc chỉ định)

---

## Pre-checks (Danh sách kiểm định PHẢI pass trước khi chạy)

### Check 1: Wiki accessible
Agent thực hiện:
```bash
# Check symlink wiki tồn tại trong thư mục Root của Project
ls -la {project_name}-wiki/ 
```
Nếu không tồn tại → DỪNG VÀ BÁO LỖI:
*"Thư mục Wiki chưa được liên kết (symlink) vào project này. Vui lòng chạy lệnh evnict-kit init ở ngoài Workspace hoặc tạo symlink thủ công."*

### Check 2: Wiki Software đã setup
Agent thực hiện:
```bash
ls {project_name}-wiki/package.json
```
Nếu không tồn tại file package.json → DỪNG VÀ BÁO LỖI:
*"Thư mục Wiki chưa được khởi tạo thư viện Ingestion. Vui lòng chạy `/evnict-kit:init-wiki` trước."*

### Check 3: Read/Write Permissions
Agent thực hiện:
```bash
touch {project_name}-wiki/raw/notes/.test-write && rm {project_name}-wiki/raw/notes/.test-write
```
Nếu văng lỗi Permission Denied → DỪNG VÀ BÁO LỖI:
*"Không có quyền ghi vào thư mục Wiki. Vui lòng kiểm tra Administrator/Permissions trên MacOS/Windows."*

---

## Bước 1: Tóm tắt feature
Đọc:
- `.evnict/specs/{feature}/spec.md`
- `git log --oneline main..HEAD`
- `git diff --stat main..HEAD`

## Bước 2: Push wiki
Gọi skill `evnict-kit-wiki` action=push:
- Sinh markdown file với frontmatter chuẩn
- Copy vào `{wiki_path}/raw/notes/`

## Bước 3: Auto-ingest (THAY CHO npm run ingest thủ công)
Agent TRỰC TIẾP chạy:
```bash
cd {wiki_path} && node scripts/ingest.js
```
KHÔNG bắt user switch terminal hay chạy npm thủ công.
Nếu `scripts/ingest.js` không tồn tại → thử `npm run ingest`.
Nếu vẫn fail → báo: *"Chạy `/evnict-kit:init-wiki`"*

## Bước 4: Archive spec
```bash
cp -r .evnict/specs/{feature}/ docs/specs/{feature}/
```

## Bước 5: Tạo postmortem
Gọi skill `evnict-kit-doc-postmortem`:
- Tạo `docs/postmortem/{feature}-{date}.md`
- 7 sections theo QĐ-TTPM Mục 8.9

## Bước 6: Confirm
```
✅ Wiki updated: {wiki_path}/raw/notes/{file}
✅ Spec archived: docs/specs/{feature}/
✅ Postmortem: docs/postmortem/{feature}-{date}.md
✅ Ingest triggered
```

---

## Lưu ý
Workflow này là shortcut. Để nạp tri thức chi tiết hơn, dùng:
- `/evnict-kit:wiki-archive-feature` — nạp đầy đủ từ spec+plan+code
- `/evnict-kit:wiki-scan-project` — scan toàn bộ codebase
- `/evnict-kit:wiki-query` — truy vấn tri thức

---

## Checklist
- [ ] Feature summarized
- [ ] Wiki pushed
- [ ] Ingest triggered
- [ ] Spec archived to docs/
- [ ] Postmortem created (nếu > 20 dòng code)
