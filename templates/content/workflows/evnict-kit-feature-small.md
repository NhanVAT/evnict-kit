---
description: Feature nhỏ nhanh — skip spec chi tiết, query wiki → plan ngắn → TDD → archive. Dùng khi feature đơn giản, dưới 1 ngày.
---

# Feature Small
**Command:** `/evnict-kit:feature-small`

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

## Checklist hoàn thành
- [ ] Wiki queried
- [ ] Plan confirmed
- [ ] Checkpoint created
- [ ] TDD implemented
- [ ] All tests pass
- [ ] Build OK
- [ ] Committed
- [ ] Wiki updated (nếu > 20 dòng)
