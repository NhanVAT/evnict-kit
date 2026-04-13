## Plan Review: ✅ Đúng, cho chạy

Plan gọn, đúng trọng tâm. Chỉ 1 lưu ý nhỏ:

### Về handoff command

Khi Agent sinh handoff file, nhớ **include cả API contract path** trong handoff summary — không chỉ liệt kê tasks mà FE agent cần đọc contract để biết request/response format:

```markdown
## API Contract
Xem chi tiết: .evnict/handoff/contracts/{feature}-api.yaml
→ FE agent ĐỌC FILE NÀY trước khi implement service calls
```