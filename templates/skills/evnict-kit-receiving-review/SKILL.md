---
name: evnict-kit-receiving-review
description: Hướng dẫn Agent xử lý Code Review Feedback. Phân loại feedback, lập kế hoạch fix systemwide và phản hồi reviewer một cách chuẩn xác, không tranh cãi.
---

# evnict-kit-receiving-review

## Khi nào dùng
- Khi Pull Request / Merge Request nhận được comments từ Reviewer.
- Khi người dùng (User) tự thực hiện Code Review và dán (paste) comments vào chat.
- Khi có một hệ thống tự động (SonarQube, GitLab CI) trả về các lỗi Quality Gate.

## Tư duy cốt lõi (Core Mindset)
1. **Không Phòng Thủ (No Defensiveness)**: Tuyệt đối không bao giờ trả lời bằng cách mang tính chất cãi lại hay bảo vệ code cũ trừ khi logic hoàn toàn sai lệch dẫn tới hỏng hệ thống. Phải luôn Acknowledge (ghi nhận) đóng góp.
2. **Sửa Tận Gốc (Systematic Fix)**: Khi reviewer comment về một lỗi ở một file, hãy chủ động dùng `grep_search` quét TOÀN BỘ codebase xem có chỗ nào mắc lỗi tương tự không và sửa đồng loạt.
3. **Phân Loại Rõ Ràng**: Không phải mọi comment đều có chung mức độ ưu tiên. Cần biết phân biệt critical và minor.
4. **Giữ Nhịp Độ (Pacing)**: Báo cho reviewer tiến trình. Tránh sửa loạn xạ dẫn đến conflict các file không cần thiết.

---

## Workflow chi tiết

### Bước 1: Tiếp nhận và Phân loại Feedback (Feedback Categorization)
Đọc toàn bộ các comment review từ user, tách bạch từng mục thành danh sách. Tạo một Tóm tắt phân loại theo 3 mức độ:

**Critical (Phải sửa ngay)**
- Lỗi Security (VD: SQL Injection, XSS, gọi API thiếu Access Control / Role check).
- Lỗi Performance nghiêm trọng (VD: N+1 Queries do JPA Hibernate, Memory leak vòng lặp).
- Lỗi Business Logic có kết quả sai lệch hoặc không khớp với Design Brief/Specs đã ký.

**Important (Sửa trước khi merge)**
- Lỗi Design Pattern (VD: Vi phạm MVC, Tight coupling, Service đan chéo Controller).
- Thiếu Unit Test trầm trọng hoặc Code Coverage rớt thê thảm đỏ lè trên CI.
- Lỗi vi phạm nghiêm trọng Conventions của dự án (VD: Đặt tên sai, quên Logging block, Hardcode tham số config).

**Minor (Optional / Tốt hơn nên làm)**
- Typo sai chính tả trong đoạn Comments hay Docstrings.
- Các tối ưu hoá nhỏ lẻ, refactoring mức siêu nhỏ cho Code ngắn gọn hơn (Nitpicks).
- Reviewer đưa "Ý kiến cá nhân" về sở thích viết code chứ không tác động Business hay System.

### Bước 2: Lập Kế hoạch Sửa chữa (Fix Plan)
Trình bày Kế hoạch rõ ràng cho người dùng thay vì đi fix câm lặng. Trình bày dạng checklist markdown `[ ]`.
- "Dựa trên X comments phản hồi, Agent đã tổng hợp và đề xuất Fix Plan như sau:"
- Đối với Lỗi hệ thống: "Lỗi N+1, Agent sẽ rà soát TOÀN BỘ các file tương tự chứ không chỉ file bị comment."
- Đối với những Minor/Nitpick, đề xuất "Mục tiểu tiết này Agent sẽ sửa luôn do thời gian fix <1 phút" hoặc "Mục này đòi hỏi refactor rộng, đề xuất tạo Jira Task mới và skip trong PR hiện tại".

### Bước 3: Sửa chữa theo chuẩn TDD và System-Wide Fix
- Dùng `grep_search` để lùng sục triệt để mã nguồn. Nếu reviewer kêu code gọi API quên Timeout ở 1 chỗ, lập tức tìm những chỗ gọi HTTP client khác để xử lý triệt để.
- Nếu logic Business bị lỗi và cần thay: Cần chạy lại Test Component. Sửa Test cũ (để nó RED - tức là fail đúng như cách hệ thống bị lỗi), sau đó dọn dẹp Code để test PASS (GREEN).
- Đảm bảo việc sửa không tạo thêm Bug lặp (Regression bug).

### Bước 4: Kiểm chứng Cuối (Verification Pipeline)
Luôn kiểm tra lại toàn hệ thống sau sửa chữa:
- Pass Code Linting (`ng lint`, `./mvnw spotless:check`).
- Các bài Unit Test và Integration Test phải 100% xanh (`npm test`, `./mvnw verify`).
- Project Compile thành công không vướng Compile-Time errors.

### Bước 5: Soạn Response Format cho Reviewer
Sau khi sửa xong, cung cấp cho User một response mẫu chuyên nghiệp để user có thể copy/paste trên GitHub/GitLab:

```markdown
Cảm ơn review của bạn. Dưới đây là các thay đổi đã thực hiện:

### Đã xử lý (Fixed)
- ✅ **[Trầm trọng]** Xử lý việc thiếu Role Check ở `AdminController.java`. Đã tách riêng logic phân quyền thành annotation `@PreAuthorize`.
- ✅ **[Quan trọng]** Đã tối ưu hoá câu Query N+1 ở `OrderRepository.java` bằng cách dùng vòng lặp fetch join. (Bên cạnh đó, em đã kiểm tra lại trên toàn bộ files Repository và fix luôn 2 hàm tương tự).
- ✅ Bổ sung 4 Unit Tests cho các Edge Cases bạn đã nhắc. Coverage đã được cover đạt 92%.

### Sẽ xử lý trong tương lai (Deferred / Out-of-Scope)
- 💡 Về việc chuyển sang dùng Caching Layer (`Redis`), em xin phép tạo một thẻ Ticket riêng [TICKET-123] do tác động tới Architecture của Server quá lớn so với mục tiêu thực thi Pull Request hiện tại. 

Vui lòng Review lại bản mới nhận nhé!
```

---

## Xử lý các tình huống khó khăn (Edge Cases Handling)

1. **Reviewer yêu cầu 1 thứ đi ngược lại với `01-evnict-kit-general-rules.md`**: 
   - Giải pháp: Trao đổi nhẹ nhàng và nhắc đến chuẩn. VD: "Cảm ơn ý kiến của anh/chị. Tuy nhiên theo chuẩn Project (RP01), chúng ta nên dùng ResponseEntity/Wrapper classes. Anh/chị xem hướng chuẩn này có hợp lý không ạ?"
2. **Reviewer yêu cầu tính năng lấn sang scope khác (Scope Creep)**:
   - Giải pháp: Tách bạch rõ. Ghi nhận là ý tưởng hoàn toàn tốt và có tính hệ thống nhưng đề xuất bóc tách ra Feature độc lập để PR nhanh chóng đi vào production. VD: "Tụi em đồng tình chức năng Báo cáo tự động này hữu ích, tuy nhiên nó vượt ra ngoài luồng Thêm mới SP nên Agent đề nghị mở 1 nhánh feature mới".

## Tiêu chí hoàn thành (Definition of Done)
1. Đã phân loại rõ ràng 100% các ý kiến.
2. Đã fix thực tế trên codebase mọi lỗi Critical và Important do reviewer nhắc đến.
3. Code mới bổ sung đều compile, lint, test PASS 100%. Lịch sử Git sạch sẽ.
4. Có bài Soạn thảo Response gãy gọn, không đụng chạm đến self-respect.
5. Đã lưu lại lessons learned vào file cấu hình Dự án hoặc Wiki (nếu nhận diện đây là một Architectural Flaw thay vì bug thuần tuý).
