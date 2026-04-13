---
name: evnict-kit-prompt-standard
description: Chuẩn viết prompt theo QĐ-TTPM Mục 8.5 — format, ví dụ tốt/xấu, template cho từng loại task.
compatibility: All AI tools
---

# evnict-kit-prompt-standard — Chuẩn Viết Prompt

## Khi nào dùng
- Viết prompt cho AI Agent
- Review chất lượng prompt
- Training member mới về prompt engineering

---

## Nguyên tắc chung (QĐ-TTPM Mục 8.5)

### 1. Rõ ràng, cụ thể
```
❌ SAI: "Sửa lỗi login"
✅ ĐÚNG: "Fix lỗi login API /api/auth/login trả về 500 khi password đúng nhưng account bị lock. Expected: trả 403 với message 'Tài khoản đã bị khóa'."
```

### 2. Một prompt = Một nhiệm vụ
```
❌ SAI: "Tạo API customer, thêm bảng mới, viết test, deploy"
✅ ĐÚNG: "Tạo API GET /api/customers — danh sách khách hàng phân trang, filter theo tên và trạng thái"
```

### 3. Có context đầy đủ
```
❌ SAI: "Thêm field vào form"
✅ ĐÚNG: "Thêm field 'Số điện thoại' vào form Customer (src/app/features/customer/pages/customer-form/). Field type: input text, validation: pattern 0[0-9]{9}, required: true. Dùng PrimeNG p-inputText."
```

### 4. Chỉ định output format
```
❌ SAI: "Viết test cho service"
✅ ĐÚNG: "Viết unit test cho CustomerService.create() bằng JUnit5 + Mockito. Test cases: 1) Happy path - valid data, 2) Name rỗng → BusinessException, 3) Phone sai format → ValidationException."
```

---

## Templates theo loại task

### Template: Tạo API
```
Tạo API {METHOD} {path}
- Mô tả: {description}
- Input: {fields with types and validation}
- Output: ResponseData với {data structure}
- Auth: {required | public}
- Business rules: {rules}
- Tech: Controller → Service → Repository (JOOQ)
```

### Template: Fix Bug
```
Fix bug: {description}
- Steps to reproduce: {steps}
- Expected: {expected}
- Actual: {actual}
- File(s) liên quan: {paths}
- TDD: viết test reproduce lỗi trước
```

### Template: Tạo Component
```
Tạo component {name} trong module {module}
- Loại: {page | shared | feature}
- Chức năng: {description}
- Data source: {API endpoint hoặc @Input}
- UI: {PrimeNG components to use}
- States: loading, error, empty, data
```

### Template: Code Review
```
Review code trên branch {branch}
- Focus: {security | logic | quality | all}
- Files changed: {list hoặc "git diff"}
- Spec reference: {path to spec}
```

---

## Anti-patterns

| ❌ Bad Prompt | ✅ Good Prompt | Lỗi |
|-------------|--------------|-----|
| "Làm cho nó chạy" | "Fix compile error ở CustomerService.java:45 — missing import for ResponseData" | Quá mơ hồ |
| "Sửa tất cả lỗi" | "Fix lỗi validation ở endpoint POST /api/customers — field 'phone' không check null" | Scope quá rộng |
| "Viết code đẹp hơn" | "Refactor CustomerRepository.search() — extract điều kiện filter thành private methods" | Không measurable |
| "Bắt chước project X" | "Implement pagination pattern giống CustomerRepository — dùng JOOQ offset/limit + fetchCount" | Thiếu context |

---

## Tiêu chí hoàn thành
- [ ] Prompt rõ ràng, cụ thể
- [ ] 1 prompt = 1 nhiệm vụ
- [ ] Có context (file, module, tech)
- [ ] Có expected output/format
- [ ] Không quá mơ hồ
