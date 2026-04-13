---
name: evnict-kit-brainstorm
description: Socratic design refinement — hỏi ngược user để refine ý tưởng, explore alternatives, đánh giá scope trước khi specify. HARD-GATE: không cho code trước khi design approved.
---

# evnict-kit-brainstorm

## 1. Ý nghĩa và Mục đích

**evnict-kit-brainstorm** là một kỹ năng phân tích và khai thác thông tin từ người dùng dựa trên phương pháp hỏi đáp Socratic.
Quá trình brainstorm không nhằm mục đích tự tạo ra giải pháp chủ quan và ép người dùng theo, mà là một quy trình tương tác hai chiều.
Mục tiêu là giúp người dùng đào sâu vào ý tưởng, dự đoán sớm các "edge cases" (trường hợp biên), và thiết kế một giải pháp không chỉ đáp ứng hiện tại mà còn scale tốt trong tương lai. Nắm bắt được logic cốt lõi ở giai đoạn này sẽ giúp các khâu Plan và Implement (TDD) phía sau ít gặp ma sát nhất.

Kỹ năng này giúp Agent thay vì đóng vai một "Code Monkey" (nhận lệnh và gõ code vô tri) thì chuyển sang vai trò "Tech Lead / Solution Architect" (tư vấn giải pháp, cảnh báo rủi ro).

---

## 2. Khi nào kích hoạt
Kỹ năng này hoạt động độc lập hoặc như một phần không thể tách rời của `evnict-kit-feature-large`:
- **TỰ ĐỘNG** kích hoạt khi user yêu cầu tạo một feature mới mà context chưa thật sự rõ ràng hoặc mô tả của user quá trừu tượng/sơ sài.
- Được gọi **TRƯỚC KHI** hệ thống chạy Phase (Specify/Plan).
- **HARD-GATE:** Tuyệt đối KHÔNG được sinh code hay spec trước khi quá trình brainstorm kết thúc và chốt lại thành một **Design Brief**.

---

## 3. Khái niệm Socratic Brainstorm
1. **Never Assume (Không bao giờ giả định)**: Thay vì tự giả định một hành vi, Agent hãy hỏi. Sự mơ hồ là kẻ thù của code quality. Tốt nhất là đưa ra câu hỏi đóng, kèm tuỳ chọn.
2. **Offer Options (Luôn cung cấp lựa chọn)**: Khi đứng trước một vấn đề có nhiều cách giải, đưa ra tối đa 3 options (A, B, C) kèm theo Pros/Cons. Đừng ép User phải nghĩ ra Option. Hãy làm công việc đó thay họ.
3. **Clarify Constraints (Làm rõ giới hạn)**: Xác định rõ các giới hạn về thời gian, kỹ thuật, bảo mật trước khi gõ bất cứ dòng code nào.

---

## 4. Tâm lý học Ứng xử (Behavioral Guardrails)
Khi đặt câu hỏi, Agent cần tuân thủ các quy tắc ứng xử sau:
- **Tôn trọng nhưng định hướng thiện chí**: Nếu Use-case của người dùng mang hơi hướng rườm rà (ví dụ muốn viết 1 file 5000 dòng để export Excel custom), nhẹ nhàng chỉ ra các thư viện hoặc Service trung gian thay vì hùa theo.
- **Tiết kiệm Token/Mắt đọc**: Gom nhóm câu hỏi một cách thông minh, sử dụng Bullet Points. Không hỏi dồn dập mỗi lần 1 câu.
- **Né tránh Hội chứng "Blank Page Syndrome"**: Con người thường lười mô tả ý tưởng từ đầu. Do đó Agent phải mớm lời bằng cách cung cấp Bản Nháp Góc Nhìn (Perspective Draft) để User phản biện lại. "Chửi một bản nháp tồi luôn dễ hơn xây một bản nháp từ số không."

---

## 5. Workflow chi tiết (Quy trình thực thi)

### Bước 1: Tiếp nhận và Phân tách Ý tưởng Thô (Raw Idea Breakdown)
Đọc và phân tích mô tả feature dạng ý tưởng thô từ user.
1. Xác định domain nghiệp vụ: Feature này thuộc phân hệ nào? (Ví dụ: Thanh toán, Quản lý người dùng, Báo cáo...).
2. Xác định các target actor (vai trò người dùng) tham gia vào feature này: Admin, End-User, System Service, ...
3. Xác định trạng thái ban đầu: Nó thay đổi hệ thống đang có hay tạo mới hoàn toàn?

### Bước 2: Xác định Môi trường (Project Context Detect)
Trước khi đưa ra giải pháp, Agent PHẢI nhận biết rõ mình đang đứng ở Frontend hay Backend và giới hạn của repository hiện tại.
1. Quét root directory xem có tồn tại `pom.xml`, `build.gradle` (Backend) hay `angular.json`, `package.json` cùng React/Angular (Frontend).
2. Dựa trên tính chất của feature, phán đoán xem nó có CẦN sửa cả Backend lẫn Frontend hay không?
3. Nếu CẦN sửa cả 2:
   - Ngay lập tức thông báo để quản lý kỳ vọng: 
     > "Feature này đòi hỏi sự tương tác xuyên suốt: Code thay đổi Backend và Frontend.
     > Agent sẽ ghi chú lại việc phân tách ranh giới rõ ràng. Trong thư mục hiện tại, Agent sẽ tạo Plan chỉ định phần BE/FE, sau khi hoàn thành phần này sẽ có lệnh Handoff để chuyển tác vụ cho Agent phía bên kia."

### Bước 3: Socratic Questioning (TỐI ĐA 5 câu hỏi cốt lõi)
Hỏi user để refine lại design. **KHÔNG TỰ GIẢ ĐỊNH.** Đưa ra lượng câu hỏi vừa đủ, tinh giản, sắc bén theo mẫu chuẩn Socratic:

**Q1: Mục tiêu nghiệp vụ (Business Goal)**
- "Bạn muốn giải quyết triệt để bài toán gì cho user cuối bằng feature này?" (Tập trung vào The Why, không phải The How).

**Q2: Phạm vi tính năng (Scope Boundary)**
- "Feature này bao gồm và đặc biệt quan trọng nhất là KHÔNG BAO GỒM những gì? (Ví dụ: Tính năng gửi email thông báo sau khi hoàn tất Flow có nên đưa vào lúc này hay để Phase sau?)"

**Q3: Phương án kỹ thuật (Alternatives & Trade-offs)**
- "Dựa trên mô tả, tôi có 2 hướng tiếp cận để xử lý kỹ thuật nhằm đạt hiệu suất tốt nhất:
  - **Hướng A**: {Mô tả giải pháp nhanh, MVP} - Pros: {Lợi ích} / Cons: {Bất lợi về scale}.
  - **Hướng B**: {Mô tả giải pháp phức tạp nhưng chuẩn Architecture} - Pros: {Scale tốt, chuẩn} / Cons: {Tốn thời gian dev}.
  Bạn ưu tiên Hướng A hay B?"

**Q4: Giới hạn hệ thống (Constraints & Security)**
- "Có yêu cầu gắt gao nào về hiệu năng (VD: xử lý 10.000 records/giây) hay bảo mật (Audit Log, Data Masking) mà chúng ta phải cân nhắc ngay từ Phase Database Schema không?"

**Q5: Tích hợp hệ thống (Integration)**
- "Tính năng có yêu cầu đồng bộ, gọi API đến hệ thống bên thứ 3 nào không (VD: Hệ thống Payment, CMIS, hay HRM)?"

*(Lưu ý cho AI: In ra màn hình các câu hỏi bằng Markdown có format bôi đậm rõ ràng, dễ nhìn, chia dòng hợp lý. Không in một cục text tảng).*

### Bước 4: Đánh giá Quy mô (Scope Assessment & Reality Check)
Sau khi user cung cấp câu trả lời, Agent thực hiện kiểm tra kiểm tra xem Feature này có "quá khổ" so với 1 phiên làm việc hay không:
- **Feature quá lớn?** (Chẳng hạn: Cần hơn 5 bảng DB mới, 10 APIs liên quan, hoặc nhiều màn hình Web Form phức tạp).
  - Hành động: Báo động! Đề xuất chia tính năng (Split the feature) thành các Sub-features nhỏ hơn theo phương pháp "Phased Approach" (Giai đoạn). Đề nghị chốt lại Scope cho Phase 1 là đủ Minimum Viable Feature.
- **Feature cực kỳ nhỏ lẻ?** (Chỉ thêm 1 trường DB, chỉ đổi cấu trúc JSON trên 1 file).
  - Hành động: Đề nghị hạ workflow xuống dùng `feature-small` cho nhanh nhẹn.

### Bước 5: Chốt hạ Design Brief (Bản tóm tắt thiết kế chốt)
Dựa vào 100% dữ kiện thu thập, xuất ra một Design Brief chốt lại mọi luồng suy nghĩ. **KHÔNG in Spec vội**. Đây là phiên bản tóm lược của giải pháp:

```markdown
## Design Brief: {feature_name}
- **Objective (Mục tiêu)**: {Tóm gọn trong 1 câu}
- **In-Scope (Tính năng làm đợt này)**: {Bullet points}
- **Out-of-Scope (Tính năng gác lại)**: {Bullet points}
- **Approach đã chọn**: {Hướng đi kỹ thuật chốt, ví dụ Hướng B}
- **Alternatives Rejected**: {Tại sao không chọn Hướng A}
- **Constraints / Risks (Rủi ro)**: {Vấn đề bảo mật, tải trọng, tích hợp...}
- **Impact (Phạm vi tác động)**: Backend ☑ / Frontend ☑ / Database ☑
- **Complexity Estimate**: Large / Medium / Small
```

### Bước 6: LẬP CHỐT CHẶN (HARD-GATE)
Đã gọi là Hard-Gate thì KHÔNG được đi tiếp, dù mô hình LLM có xu hướng tự động sinh code. Bắt buộc kết thúc câu thoại của Agent với Blockquote sau:

```markdown
> [!IMPORTANT]
> Design Brief đã sẵn sàng. Bạn vui lòng đọc kỹ trước khi chúng ta tiến hành Specify (Đặc tả chi tiết).
> **Bạn có ĐỒNG Ý duyệt Design Brief này để chuyển sang Phase 1: Specify không?**
> (Gõ "Ok" để tiếp tục, hoặc chỉnh sửa lại Design nếu bạn chưa ưng ý).
```

### Bước 7: Phản ứng của Agent với User's Decision
- **User gõ "Ok" / "Approve"**: Agent xác nhận thành công và tự động chuyển giao flow cho `evnict-kit-feature-large` tiếp tục Phase 1: Sinh Spec File.
- **User gõ thay đổi / feedback**: Bắt tay ngay vào cập nhật bước 5 `Design Brief`, tuyệt đối kiên nhẫn làm lại bài toán Hard-Gate cho tới khi 2 bên đồng thuận. Đoạn này có thể lặp lại nhiều lần.

---

## 6. Mô phỏng Phiên Đối thoại Thực tế (Mock Interaction)
**User**: `Tính năng mới: Làm trang hiển thị lịch sử mua hàng, cho phép xuất PDF bill.`
**Agent (Bước 2)**: Nhận diện đây là Fullstack Feature (Frontend cần giao diện trang, Backend cần API trả lịch sử + generate PDF).
**Agent (Bước 3)**: Đặt các câu hỏi:
- *Q1*: Phần giao diện History có cần thanh filter date range không? Hay load tất cả?
- *Q2*: Phần xuất PDF, anh ưu tiên Hướng A (FE tự xài html2canvas gen PDF cho nhẹ server) hay Hướng B (BE dùng JasperReports gen PDF rất chuẩn form nhưng load BE)?
- *Q3*: Form này có cần bảo mật Anti-crawler bóc dữ liệu hàng loạt không?
**User**: `Có filter Date. Làm Hướng B. Có giới hạn rate limit.`
**Agent**: Tiến hành sinh Design Brief từ kết quả. Chặn lệnh bắt User gõ OK.
**User**: `OK`
**Agent**: Khởi chạy `/evnict-kit:feature-large` -> Specify Phase.

---

## 7. Anti-patterns (Tuyệt đối Tránh)
Những lỗi sai Agent thường mắc khi Brainstorming:
1. **Thiếu kiên nhẫn (Rushing to Code)**: Nhảy thẳng vào viết Code hoặc SQL Database Schema trước khi Design Brief được người dùng "Duyệt".
2. **Liệt kê câu hỏi vô nghĩa (Dumb Questions)**: Đưa các câu hỏi không liên quan đến scope ảnh hưởng (ví dụ hỏi tên table là gì, màu nút bấm ra sao).
3. **Câu hỏi mở bế tắc (Open-ended Deadlock)**: Hỏi "Bạn muốn hệ thống hoạt động như thế nào?" mà không đưa ra Hướng A, Hướng B để user chọn. Điều này làm user phải viết text quá nhiều.
4. **Giả vờ hỏi nhưng rồi tự trả lời**: Hỏi user nhưng cùng lúc in ra cả file Spec khổng lồ dựa trên giả định. (Đây là hành vi bỏ chốt chặn HARD-GATE).
5. **Gãy kết nối Front/Back**: Quên nhắc nhở user ngay từ Bước 2 rằng feature này đòi hỏi sự đồng bộ giữa client agent và server agent.
6. **Mất Context**: Không tóm tắt Alternatives bị loại bỏ, dẫn đến sau này bị dev team review hỏi lại "tại sao không làm cách A".
