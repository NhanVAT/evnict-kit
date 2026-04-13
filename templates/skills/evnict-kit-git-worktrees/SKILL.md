---
name: evnict-kit-git-worktrees
description: Hướng dẫn quản lý Git worktree. Git worktree cho phép check out nhiều branches đồng thời vào những folder khác nhau mà không cần clone lại toàn bộ repo. Rất hữu ích khi context-switching.
---

# evnict-kit-git-worktrees

## Mục đích và Lợi ích
Git Worktree sinh ra để giải quyết nỗi ám ảnh Context Switching (chuyển đổi bối cảnh) giữa các Feature.
Thay vì tải toàn bộ source code lại từ máy chủ vào một folder khác (Clone thứ hai) cực kỳ tốn thời gian, hoặc `git stash` code rủi ro cao, Git Worktree xây dựng các máy trạm rẽ nhánh (folder song song) từ chung một thư viện `.git` cốt lõi ở Local. 

## Khi nào dùng
- Khi bạn đang phát triển một Feature dài hạn (Feature A) nhưng bất ngờ bị Leader / DevOps gọi sang fix Hotfix khẩn cấp ở nhánh khác (`hotfix-prd`).
- Khi cần so sánh code đang chạy giữa 2 nhánh (Branch A vs Branch B) side-by-side trên cùng 1 máy tính để phân tích lỗi.
- Khi làm việc liên tục giữa Frontend và Backend và cần test chéo nhiều code version khác nhau kết nối tới cùng 1 DB.
- Tham gia Peer Review một PR phức tạp không thể review chay trên Web, buộc phải kéo về localhost để chạy nhưng không muốn phá luồng công việc nhánh hiện tại.

## Tại sao dùng Worktrees thay vì Branch checkout thuần tuý?
Nếu dùng `git branch` và `git checkout` bình thường:
- Phải stash code liên tục, dễ quên stash mất code hoặc bị conflict rác khi pop ra.
- Trình soạn thảo (IDE) như VSCode/IntelliJ/Eclipse phải tự động xoá index và re-index lại các tệp tin theo luồng nhánh mới, làm giật lag, tốn thời gian.
- IDE phải khởi động lại terminal / compiler (VD: `npm start` hay Spring Boot server phải restart, Gradle phải re-sync build cache).

Với Git Worktree, bạn có một project rẽ nhánh yên bình, IDE thứ hai độc lập.

---

## Workflow chi tiết

### Bước 1: Khởi tạo Worktree mới
Thay vì `git checkout -b feature/xyz`, dùng lệnh add worktree.
**Quy tắc VÀNG**: Thư mục của worktree NÊN được tạo ở vị trí ngang hàng (`../`) với thư mục gốc dự án để tránh lọt vào vòng lặp git (hoặc phải đưa thư mục này vào `.gitignore`).

**Trường hợp 1: Tạo Worktree từ một branch CÓ SẴN (Remote pull or existing local):**
```bash
# Cấu trúc: git worktree add <path> <branch-name>
# VD: Tạo một folder ../my-project-hotfix để kéo nhánh hotfix/123-urgent-bug về.
git worktree add ../my-project-hotfix hotfix/123-urgent-bug
```

**Trường hợp 2: Tạo Worktree mới kẹp theo lệnh tạo Branch MỚI:**
```bash
# Cấu trúc: git worktree add -b <new-branch> <path> <source-branch>
# VD: Copy từ nhánh main, rẽ một folder mới bên ngoài để code task A.
git worktree add -b feature/xyz ../my-project-feature main
```

Lúc này, bạn mở VSCode/IDE bằng folder `../my-project-feature` và code bình thường như một project gốc độc lập. 


### Bước 2: Quản lý các Worktrees
Để xem hiện tại bạn đang có bao nhiêu folder nhánh con đang hoạt động từ gốc dự án mẹ:
```bash
git worktree list
```
Output sẽ hiển thị chi tiết đường dẫn absolute của folder và commit/branch name đang liên kết.

**Lưu ý RẤT QUAN TRỌNG phần Onboarding Setup:**
Do Repo Git đã được "nhân bản mềm", những thành phần không nằm trong version control sẽ KHÔNG đi theo (Ví dụ `.env`, `node_modules`, `target/`).
Bạn cần có thao tác "Warm-up" ngay sau khi setup Folder mới:
```bash
# Nhảy vào thư mục tạo ra
cd ../my-project-feature

# Khởi tạo NPM Dependencies (cho Frontend / Node)
npm install

# Build Gradle / Maven dependencies (cho Backend)
./mvnw clean install -DskipTests

# Bổ sung các biến môi trường
cp ../my-project-core/.env .env
```

### Bước 3: Dọn dẹp (Cleanup) sau khi hoàn thành
Khi nhánh `feature/xyz` đã code xong, Pull Request đã merge, thư mục rác này không còn tác dụng. Việc để lại sẽ dần ăn hết bộ nhớ ổ cứng. Cần làm trình tự sau.

**Phase 1: Gỡ bỏ Worktree một cách hệ thống**
Đảm bảo bạn đứng ở Project Folder Mẹ (Core rễ):
```bash
# Cắt bỏ liên kết Folder (Rút phích cắm worktree):
git worktree remove ../my-project-feature
```
*(Lưu ý: Nếu folder worktree chưa được dọn dẹp sạch mã nguồn, tệp tin chưa add/commit, Git sẽ cảnh báo từ chối. Nếu vẫn muốn cưỡng chế xoá, dùng `git worktree remove --force ../my-project-feature`).*

**Phase 2: Xoá branch Git (Tránh nợ kỹ thuật)**
Xoá bỏ branch rác đã hoàn tất:
```bash
git branch -d feature/xyz
```

**Phase 3: Dọn dẹp Metadata**
Thi thoảng, có những lúc User vô tình xoá xoẹt folder `../my-project-feature` bằng Explorer (Windows) thay vì lệnh git. Hệ thống metadata của Git bị kẹt. Khắc phục bằng:
```bash
git worktree prune
```

---

## Các thao tác AI Agent (Lưu ý)
1. **Liên lạc trước với User**: Với Quyền hạn của Agent AI, bạn CÓ THỂ tự tạo Folder mới cho Worktree, nhưng BẮT BUỘC hỏi ý kiến User trước xem lưu trữ ở vị trí folder nào cho chuẩn.
2. **Context Persistence**: Khi sử dụng Terminal chuyển qua lại thư mục mới, Agent buộc phải ghi nhớ cấu trúc đường dẫn absolute path. Không phụ thuộc thư mục gốc cũ. Agent cần tìm và đọc lại các `01-evnict-kit-general-rules.md`, v.v...
3. **Cảnh báo Xoá rác**: Tuyệt đối Không tự thực hiện việc xoá (remove) worktree nếu chưa xin một lệnh confirm y/n rõ ràng của User. Xoá nhầm của User sẽ làm bay toàn bộ chất xám chưa commit.
4. Mọi Git hook (`pre-commit`), hay Linter tích hợp đều vẫn hoạt động bình thường qua worktree do bộ não hook ở file core mẹ. Không cần cấu hình lại Git Hooks.
