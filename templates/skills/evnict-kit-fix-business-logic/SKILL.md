---
name: evnict-kit-fix-business-logic
description: Fix lỗi nghiệp vụ — verify business rules → test scenarios → fix → validate với spec.
compatibility: All tech stacks
---

# evnict-kit-fix-business-logic — Fix Lỗi Nghiệp Vụ

## Khi nào dùng
- Logic nghiệp vụ cho kết quả sai
- Business rules không được áp dụng đúng
- Tính toán sai (công thức, quy tắc, workflow)

## Input Parameters
- `description` (bắt buộc): Mô tả lỗi nghiệp vụ
- `expected` (bắt buộc): Kết quả mong đợi
- `actual` (bắt buộc): Kết quả thực tế

---

## Workflow Steps

### Bước 1: Tìm Spec/Business Rules
1. Đọc `.evnict/specs/` → tìm spec liên quan
2. Đọc wiki → tìm business rules document
3. Xác định business rules bị vi phạm

```markdown
## Business Rule Check
- Rule: {BR-XX}: {description}
- Expected: {expected behavior}
- Actual: {actual behavior}
- Source: {spec file / business document}
```

### Bước 2: Tạo Test Scenarios
Viết test cases bao gồm:
- Happy path (input hợp lệ → kết quả đúng)
- Edge cases (biên giới trị, giá trị đặc biệt)
- Error cases (input không hợp lệ → xử lý đúng)

```java
@Test
@DisplayName("BR01: Đơn hàng > 1tr cần duyệt")
void order_above1M_shouldRequireApproval() {
    OrderDTO order = new OrderDTO();
    order.setTotal(1_500_000);
    
    OrderDTO result = orderService.create(order);
    
    assertTrue(result.isNeedApproval());
}

@Test
@DisplayName("BR01: Đơn hàng <= 1tr không cần duyệt")
void order_below1M_shouldNotRequireApproval() {
    OrderDTO order = new OrderDTO();
    order.setTotal(500_000);
    
    OrderDTO result = orderService.create(order);
    
    assertFalse(result.isNeedApproval());
}
```

### Bước 3: Fix Logic
1. Xác định file/method chứa business logic
2. Sửa logic → test PASS
3. Verify với spec/business rules

### Bước 4: Validate với Spec
So sánh kết quả fix với:
- Acceptance criteria trong spec
- Business rules table
- Luồng nghiệp vụ (main flow + exception flow)

### Bước 5: Commit
```bash
git commit -m "fix({module}): correct {business rule} logic [BR-{XX}]"
```

---

## Tiêu chí hoàn thành
- [ ] Business rules xác định rõ
- [ ] Test scenarios viết đủ (happy + edge + error)
- [ ] Logic fix đúng với spec
- [ ] All tests PASS
- [ ] Validate với business rules document
