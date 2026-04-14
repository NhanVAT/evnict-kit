# Feature Small
**Command:** `/evnict-kit:feature-small $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Khi nào dùng
- Feature nhỏ, đơn giản (1 API, 1 component, sửa logic)
- Không cần spec chi tiết
- Ước lượng < 1 ngày

## Input
- Mô tả feature ngắn gọn
- VD: `/evnict-kit:feature-small Thêm API export danh sách khách hàng ra Excel`

---

## Bước 1: Query wiki
Tìm context liên quan trong wiki:
```bash
grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"
```
Đọc kết quả → áp dụng context.

## Bước 2: Plan ngắn
Tạo plan trực tiếp (KHÔNG tạo spec file):

```markdown
## Quick Plan: {feature}
- Files cần tạo/sửa: {list}
- Test cases: {list}
- Dependencies: {list}
- Estimated: {X} phút
```

Hỏi user confirm plan trước khi implement.

## Bước 3: Checkpoint
```bash
git checkout -b feature/{slug}
```

## Bước 4: TDD Implement
Với mỗi file:
1. [RED] Viết test → FAIL
2. [GREEN] Code tối thiểu → PASS
3. Verify: `./mvnw test` + `./mvnw compile`
4. Commit: `feat({module}): {description}`

3-Strike Rule vẫn áp dụng.

## Bước 5: Final verify
```bash
./mvnw test && ./mvnw spotless:check && ./mvnw compile
# hoặc
ng test --watch=false && ng lint && ng build
```

## Bước 6: Archive (optional)
Nếu thay đổi > 20 dòng → push wiki + tạo postmortem.
Nếu < 20 dòng → skip, chỉ commit.

## Bước cuối: Wiki
Gợi ý user:
```
💡 Feature hoàn thành. Thêm tri thức vào wiki?
A) Có — chạy `/evnict-kit:wiki-archive-feature` (nạp đầy đủ)
B) Nhanh — tôi tóm tắt ngắn gọn → push wiki
C) Không — skip
```
- Nếu A → chạy `/evnict-kit:wiki-archive-feature`
- Nếu B → gọi skill `evnict-kit-wiki` action=push → auto-ingest
- Nếu C → skip

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
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Checklist hoàn thành
- [ ] Wiki queried
- [ ] Plan confirmed
- [ ] Checkpoint created
- [ ] TDD implemented
- [ ] All tests pass
- [ ] Build OK
- [ ] Committed
- [ ] Wiki updated (nếu > 20 dòng)
