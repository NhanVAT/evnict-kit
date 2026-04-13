---
name: evnict-kit-finish-branch
description: Quy trình để chuẩn bị merge/kết thúc quá trình phát triển (development) của một branch. Tuân thủ CI/CD checks, tạo PR Decision, Test & Dọn dẹp branch.
---

# evnict-kit-finish-branch

## Khi nào dùng
Hành động này đóng vai trò như một bộ "Final Quality Gate" (Chốt chặn chất lượng cuối) mà mọi lập trình viên và AI Agent cần chạy trước khi bàn giao một feature. 
Kỹ năng dùng khi:
- Khi người dùng thông báo: "Xong task rồi", "Kết thúc nhánh tại đây cho anh", hoặc "Merge branch này đi".
- Khi AI Agent chạy trong chuỗi TDD Workflow đã hoàn thiện tất cả các Sub-tasks của toàn bộ Feature và chuẩn bị Review kết thúc quy trình bự.
- Đóng gói dọn dẹp các tàn dư code dở đang thử nghiệm nháp.

## Core Rules & Mindset (Quy luật bắt buộc)
1. BẢO VỆ NHÁNH CHÍNH: KHÔNG BAO GIỜ tự tiện tiến hành merge nhánh vào Development / Main bừa bãi khi chưa chạy qua Pre-check Pipeline (Lint, Format, Test tự động). Quá trình này ép User và Agent phải nhìn thấy báo cáo QA trước khi ấn nút.
2. BÁO CÁO RÙI RO: Đưa ra Cảnh báo an toàn nếu phát hiện code coverage giảm đáng kể, Code Smells xuất hiện.
3. CLEAN CODE: Tuyệt đối rào cản gắt gao các logs rác rưởi như `console.log`, `System.out.println` dính lại trong pull request. Dọn rác kĩ trước khi khoe với Sếp.

---

## Workflow chi tiết (Đóng gói Branch)

### Bước 1: Quality Gate Pre-Check
Agent phải tự thực hiện bộ lệnh verify để đảm bảo branch local này hoàn toàn "vô trùng" không chứa Code Rác và Debug logs tạm:

**Với Backend (Spring Boot/Java):**
- System check: Chạy `./mvnw spotless:check` để xác nhận chuẩn style rule.
- Logic Test: Chạy `./mvnw test` để chắc chắn mọi bài tests vẫn đang ở trạng thái Xanh (Green).
- Garbage Hunt: Sử dụng Find/Grep lùng sục codebase tìm các tàn dư `System.out.println("Hello Here")` hay `e.printStackTrace()` mà Dev ném vào.

**Với Frontend (Angular/React):**
- System check: Chạy `ng lint` / `npm run lint` để kiểm tra convention TS/JS.
- Logic Test: Chạy `ng test --watch=false` hoặc `npm test` để kiểm tra logic UT fail.
- Garbage Hunt: Tìm và cảnh báo mạnh mẽ nếu vẫn chừa lại `console.log()` hoặc từ khoá `debugger;`.

> Nếu phát hiện Lỗi hệ thống: Agent ngay lúc đó tự sửa (Auto-fix routine).
> Cuối cùng Báo cáo: "Hệ thống CI Local đã bắt được X lỗi Lint và Y đoạn code rác. Agent đã dọn dẹp gọn gàng, tự đẩy commit bổ sung trước khi sẵn sàng cho Merge."

### Bước 2: Build Verification (Compile Test)
Mã sạch không có nghĩa là Mã chạy được trên Production. Cần chạy khâu build project để chứng minh code thực sự có thể đóng gói, liên kết module chéo không vấp ngã:
- Backend: Chạy lệnh build siêu tốc `./mvnw clean package -DskipTests` (Bỏ quả test vì bước 1 đã test rồi, bước này tập trung bắt lỗi Compiler/Dependency).
- Frontend: `npm run build` hoặc `ng build`. Nếu quá trình build sinh ra Error đỏ thì STOP quy trình tức khắc để User vào xem.

### Bước 3: Đưa ra Lựa chọn Kết thúc (Confirm Merge Decision)
Hỏi User hình thức xử lý kế tiếp với Branch đã khoẻ mạnh này. In 3 Option rõ ràng:

```markdown
✅ Hệ thống đã QA thành công toàn bộ nội dung của branch `feature/xxx`. Mã an toàn 100% để kết thúc luồng. 
Bạn vui lòng đưa ra chỉ thị tiếp theo để tôi xử lý:

**A) Khởi tạo Pull Request / Merge Request**: Tôi sẽ tổng hợp Diff và sinh nội dung PR chuyên nghiệp đẩy lên Server Git. Đặc biệt khuyên dùng khi làm nhóm! 
**B) Merge Local (Gộp và Chốt trực tiếp)**: Tool sẽ Switch thư mục sang nhánh `main` / `develop`, gộp toàn bộ nội dung này vào nhánh mẹ an toàn ngay tại local của bạn.
**C) Push Trữ Bản Draft**: Đẩy mã nguồn lên máy chủ (Push), Backup an toàn và dọn dẹp Worktree (nếu có), không gộp chéo gì.
```

(Chờ người dùng gõ câu lệnh hoặc phím tắt Chọn A, B, C).

### Bước 4: Xử lý Hành động theo Nhánh Điều Kiện

**Nếu user chọn (A) Create Pull Request**:
- Kéo lấy tổng hợp file khác biệt bằng `git diff main...HEAD`.
- Sinh ra một File mới `PR_DESCRIPTION.md` theo Format tiêu chuẩn xịn xò của công ty:
  - Tóm tắt ý tưởng tính năng.
  - Các thay đổi đặc thù về API Endpoints, Schema DB, và Màn hình UI.
  - Các Issue / Task Reference có liên quan để hệ thống tự Track.
- Gửi trực tiếp bản Text này ra màn hình Chat để User tiện lợi Copy > Paste.

**Nếu user chọn (B) Merge Local**:
- Hệ điều hành chạy `git checkout develop` hoặc `git checkout main` tuỳ team chuẩn.
- Tiến hành cập nhật mới từ server `git pull origin develop`.
- Nhập lệnh gộp `git merge --no-ff feature/xxx -m "Merge branch feature/xxx: [Brief desc]"`.
- Chú ý: Nếu git hú còi báo hiệu Xung đột Conflict, KHÔNG ĐƯỢC force merge, Agent Dừng màn hình để User nhảy vào gỡ Conflict bằng tay.

**Nếu user chọn (C) Push & Keep Draft**:
- `git push origin feature/xxx` (Thêm flag `--set-upstream` hay `-u` nếu là branch chưa tồn tại trên Remote repo).

### Bước 5: Branch Cleanup (Dọn dẹp môi trường)
Công đoạn xả rác ổ cứng:
- Tham khảo User xem có xoá Branch rác rưởi sau Merge chưa bằng lệnh gộp `git branch -D feature/xxx`. Gợi ý User xoá để bảng lệnh sạch sẽ hơn.
- Tra cứu bảng Git Worktree. Nhắc nhở & hỏi việc uỷ quyền xoá Directory rác: `git worktree remove ...`
- Vấn đề Workspace nội vụ AI: Di dời thư mục các files nháp specs sinh ra `.evnict/specs/` cất vào tủ Archive Documentation chuẩn theo quy tắc Workflow `evnict-kit-archive-wiki.md`.

## Tiêu chí hoàn thành (Definition of Done của Kỹ Năng)
1. Pipeline QA Linting / Testing / Build chứng nhận "All Pass". Không bỏ sót Log rác.
2. Bản PR hoặc lựa chọn Fast-Merge được người dùng xác nhận rõ ý.
3. Code được đóng kết, lịch sử Git Commit được dọn gọn, không còn để Branch hay Thư mục Local treo lơ lửng hoang phí ổ cứng máy hệ thống.
