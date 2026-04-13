# EVNICT-KIT v0.1.4 — Upgrade Prompt
# Dùng trong Antigravity IDE + Opus 4.6
# Mở project evnict-kit → cho Agent đọc file này → Agent thực hiện

---

## TÓM TẮT THAY ĐỔI

v0.1.4 tập trung vào **7 nhóm cải tiến** dựa trên feedback test thực tế workflow `/evnict-kit:feature-large`:

| # | Cải tiến | Phạm vi |
|---|----------|---------|
| 1 | Interactive init (không cần flags, quét workspace, chọn repos) | CLI + init.js |
| 2 | SymbolicLink thư mục dùng chung (database, docs, wiki) | CLI init.js |
| 3 | Feature-large: nhận biết BE/FE, brainstorm, plan command | Workflows + Skills |
| 4 | 4 skills mới từ Superpowers | Skills mới |
| 5 | Handoff FE↔BE chi tiết hơn | Skill coordinate |
| 6 | Fix archive-wiki (dùng symlink wiki) | Workflow + Skill |
| 7 | Version bump + package.json | Metadata |

---

## THAY ĐỔI 1: Interactive Init

### Vấn đề
Hiện init yêu cầu: `evnict-kit init --name=ncpt --be=ncpt-backend-api --fe=ncpt-frontend-web`
- Phải biết trước tên folder BE/FE
- Chỉ hỗ trợ 1 BE + 1 FE
- Không có tương tác

### Giải pháp
`evnict-kit init` (KHÔNG CẦN flags) → chạy interactive wizard:

```
╔═══════════════════════════════════════════╗
║     🚀 EVNICT-KIT v0.1.4: Init Setup    ║
╚═══════════════════════════════════════════╝

? Tên dự án: ncpt
? Chọn AI Tool:
  ❯ Antigravity (default)
    Claude Code
    Cursor
    Codex
    Copilot

Scanning workspace...
Tìm thấy 4 folders:
  1. ncpt-backend-api/
  2. ncpt-frontend-web/
  3. ncpt-mobile/
  4. shared-libs/

? Chọn repos cần init (space để chọn, enter để confirm):
  ❯ ☑ ncpt-backend-api    (detected: Java Spring Boot)
    ☑ ncpt-frontend-web   (detected: Angular)
    ☐ ncpt-mobile         (detected: React Native)
    ☐ shared-libs          (detected: Java library)

? Loại cho mỗi repo đã chọn:
  ncpt-backend-api → backend
  ncpt-frontend-web → frontend

? Database: Oracle (default) / SQL Server

? Thêm LLM Wiki? (Y/n): Y

Initializing...
```

### Files cần sửa

#### [MODIFY] `bin/cli.js`
- Bỏ `requiredOption('--name')` — name sẽ hỏi interactive
- Giữ tất cả options làm **optional override** (nếu truyền thì skip hỏi)
- Thêm `--no-interactive` flag để chạy non-interactive (backward compat)

#### [MODIFY] `src/commands/init.js` — REWRITE LỚN

Thêm dependency: `import readline from 'node:readline';`

Logic mới:
```javascript
export async function initCommand(options) {
  // Nếu có --name → backward compat, chạy như cũ
  if (options.name) {
    return initNonInteractive(options);
  }
  // Không có --name → interactive wizard
  return initInteractive(options);
}

async function initInteractive(options) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(r => rl.question(q, r));
  
  // Step 1: Tên dự án
  const name = await ask('? Tên dự án: ');
  
  // Step 2: Chọn tool
  const tool = options.tool || await selectTool(rl);
  
  // Step 3: Scan workspace
  const cwd = process.cwd();
  const folders = scanWorkspaceFolders(cwd);
  
  // Step 4: Chọn repos (multi-select)
  const selectedRepos = await selectRepos(rl, folders);
  
  // Step 5: Gán type cho mỗi repo (backend/frontend)
  const repoConfigs = await assignTypes(rl, selectedRepos);
  
  // Step 6: Database
  const db = await ask('? Database (oracle/sqlserver) [oracle]: ') || 'oracle';
  
  // Step 7: Wiki
  const wiki = (await ask('? Thêm LLM Wiki? (Y/n): ')).toLowerCase() !== 'n';
  
  rl.close();
  
  // Deploy
  await deployWorkspace({ name, tool, repoConfigs, db, wiki, cwd });
}

function scanWorkspaceFolders(cwd) {
  // Scan tất cả folder trong cwd
  // Detect tech: tìm pom.xml → Java, package.json + angular.json → Angular, etc.
  // Trả về [{folder, detectedTech}]
}
```

#### Config.yaml mới (hỗ trợ multi-repo)
```yaml
project:
  name: "ncpt"
repos:
  - folder: "ncpt-backend-api"
    type: backend
    tech: springboot
  - folder: "ncpt-frontend-web"
    type: frontend
    tech: angular
  - folder: "ncpt-mobile"
    type: frontend
    tech: react-mobile
database: { type: "oracle", folder: "database" }
wiki: { enabled: true, folder: "ncpt-wiki" }
ai_tool: "antigravity"
```

#### Thêm lệnh bổ sung: `evnict-kit add <folder>`
Khi user chọn sót repo → chạy `evnict-kit add ncpt-mobile` để deploy evnict-kit vào repo đó sau.

---

## THAY ĐỔI 2: SymbolicLink thư mục dùng chung

### Vấn đề
Wiki, docs, database ở workspace level nhưng Agent chạy TRONG project con → không thấy.

### Giải pháp
Sau khi deploy vào mỗi project, tạo symbolic link:

```javascript
// Trong deployToProject()
import { symlinkSync } from 'node:fs';

// Symlink wiki
const wikiTarget = join(cwd, `${name}-wiki`);
const wikiLink = join(projectPath, `${name}-wiki`);
if (existsSync(wikiTarget) && !existsSync(wikiLink)) {
  symlinkSync(wikiTarget, wikiLink, 'junction'); // 'junction' cho Windows
  console.log(`   🔗 Symlink: ${name}-wiki → workspace wiki`);
}

// Symlink docs
const docsTarget = join(cwd, 'docs');
const docsLink = join(projectPath, 'docs');
if (existsSync(docsTarget) && !existsSync(docsLink)) {
  symlinkSync(docsTarget, docsLink, 'junction');
  console.log(`   🔗 Symlink: docs → workspace docs`);
}

// Symlink database
const dbTarget = join(cwd, 'database');
const dbLink = join(projectPath, 'database');
if (existsSync(dbTarget) && !existsSync(dbLink)) {
  symlinkSync(dbTarget, dbLink, 'junction');
  console.log(`   🔗 Symlink: database → workspace database`);
}

// Symlink .evnict (handoff, specs)
const evnictTarget = join(cwd, '.evnict');
const evnictLink = join(projectPath, '.evnict');
if (existsSync(evnictTarget) && !existsSync(evnictLink)) {
  symlinkSync(evnictTarget, evnictLink, 'junction');
  console.log(`   🔗 Symlink: .evnict → workspace .evnict`);
}
```

**LƯU Ý Windows**: Dùng `'junction'` thay vì `'dir'` vì junction không cần admin privilege trên Windows 10.

**Thêm vào .gitignore** của mỗi project:
```
# Symlinks từ evnict-kit
ncpt-wiki
docs
database
.evnict
```

### Cập nhật workflows/skills
Sau khi có symlink, các skill/workflow dùng wiki path cần update:
- Thay `{wiki_path}` absolute → dùng relative `{project_name}-wiki/` (vì đã symlink vào project)
- VD: `ncpt-wiki/raw/notes/` thay vì `../../ncpt-wiki/raw/notes/`

---

## THAY ĐỔI 3: Feature-large cải tiến

### 3.1: Thêm Phase 0 — Brainstorm (Socratic)

#### [NEW] `templates/skills/evnict-kit-brainstorm/SKILL.md`
Nội dung 150+ dòng, tham khảo Superpowers brainstorming skill:

```markdown
---
name: evnict-kit-brainstorm
description: Socratic design refinement — hỏi ngược user để refine ý tưởng, explore alternatives, đánh giá scope trước khi specify. HARD-GATE: không cho code trước khi design approved.
---

# evnict-kit-brainstorm

## Khi nào kích hoạt
- TỰ ĐỘNG khi user yêu cầu tạo feature mới
- TRƯỚC KHI chạy specify/plan
- HARD-GATE: KHÔNG được sinh code hay spec trước khi brainstorm xong

## Workflow

### Bước 1: Nhận ý tưởng thô
Đọc mô tả feature từ user.

### Bước 2: Xác định project context
- Đang chạy trong project nào? (BE hay FE?)
- Feature này CẦN cả BE và FE không?
- Nếu CẦN cả 2 → thông báo user:
  "Feature này cần code cả Backend và Frontend.
   Tôi đang ở [BE/FE]. Sau khi plan xong, sẽ tạo handoff cho [FE/BE] agent."

### Bước 3: Socratic Questioning (TỐI ĐA 5 câu hỏi)
Hỏi user để refine, KHÔNG tự giả định:

1. **Mục tiêu thực sự**: "Bạn muốn giải quyết vấn đề gì cho user cuối?"
2. **Scope boundary**: "Feature này bao gồm/không bao gồm gì?"
3. **Alternatives**: "Có cách tiếp cận nào khác không?"
   - Đưa ra 2-3 alternatives với pros/cons
4. **Constraints**: "Ràng buộc kỹ thuật/nghiệp vụ nào?"
5. **Integration**: "Feature này tương tác với module nào hiện có?"

### Bước 4: Scope Assessment
- Feature quá lớn? → Đề xuất split thành sub-features
- Feature chỉ 1 bên (BE/FE)? → Chuyển sang feature-small

### Bước 5: Design Brief
Tóm tắt kết quả brainstorm thành design brief:
```markdown
## Design Brief: {feature}
- Mục tiêu: ...
- Scope: ...
- Approach: {approach đã chọn}
- Alternatives rejected: {và lý do}
- Constraints: ...
- Cần: BE ☑ / FE ☑ / DB ☑
- Estimated complexity: Large/Medium/Small
```

### Bước 6: HARD-GATE
"Design brief đã sẵn sàng. Bạn approve để chuyển sang Phase 1: Specify?"
- User approve → tiếp tục
- User chỉnh → quay lại bước 3
```

### 3.2: Workflow feature-large cần nhận biết BE/FE

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-feature-large.md`

Thêm vào đầu Phase 1:
```markdown
### Bước 0: Detect project context
1. Kiểm tra project hiện tại là BE hay FE:
   - Có pom.xml/build.gradle → Backend
   - Có angular.json/package.json+react → Frontend
2. Đọc `.evnict/config.yaml` → liệt kê TẤT CẢ repos
3. Nếu feature cần cả BE+FE:
   - Spec PHẢI bao gồm cả BE và FE sections
   - Plan PHẢI sinh tasks cho CẢ BE và FE
   - Tasks BE đánh prefix `be-`, tasks FE đánh prefix `fe-`
   - API contract PHẢI được sinh trong plan phase
4. Thông báo: "Feature sẽ cần handoff sang [FE/BE]. 
   Sau implement, chạy `/evnict-kit:handoff` để chuyển tasks."
```

Cập nhật Phase 1 spec format — thêm sections:
```markdown
## 8. PHẠM VI KỸ THUẬT
### Backend
- API endpoints cần tạo: ...
- Database changes: ...
- Service logic: ...

### Frontend  
- Pages/Components cần tạo: ...
- State management: ...
- API integration: ...

### Database
- New tables/columns: ...
- Migration scripts: ...
```

### 3.3: Thêm command `/evnict-kit:plan`

#### [NEW] `templates/commands/antigravity/evnict-kit-plan.md`
```markdown
---
description: Chuyển từ spec đã confirm sang plan + task breakdown. Dùng sau khi user trả lời các câu hỏi clarify.
---

# Plan
**Command:** `/evnict-kit:plan`

## Input
- Spec file path (auto-detect từ `.evnict/specs/` gần nhất)
- Hoặc chỉ định: `/evnict-kit:plan .evnict/specs/feature-xyz/spec.md`

## Workflow
1. Đọc spec.md đã confirm
2. Nếu có câu hỏi clarify chưa trả lời → yêu cầu trả lời trước
3. Update spec.md với câu trả lời
4. Chạy Phase 2 trong workflow feature-large:
   - Sinh plan.md
   - Sinh task files (có prefix be-/fe-/db-)
   - Sinh API contract
5. Hiển thị plan → chờ user approve
6. Sau approve → hướng dẫn chạy `/evnict-kit:implement`
```

### 3.4: Cải thiện tương tác TDD

#### [MODIFY] `templates/skills/evnict-kit-tdd/SKILL.md`
Thêm section tương tác user:

```markdown
## User Interaction Points

### Sau mỗi subtask hoàn thành
Agent PHẢI hỏi user:
```
✅ Task {N} hoàn thành:
- Files created: {list}
- Tests: {pass/fail count}
- Commit: {hash}

Bạn muốn:
A) Review code trước khi tiếp → Agent chờ feedback
B) Tiếp tục task tiếp theo
C) Dừng lại, phân tích thủ công
```

### Khi gặp vấn đề
Agent PHẢI hỏi trước khi tự quyết:
```
⚠️ Task {N} gặp vấn đề:
{mô tả vấn đề}

Đề xuất:
A) {approach 1} — pros/cons
B) {approach 2} — pros/cons  
C) Bạn quyết định

Chọn approach nào?
```
```

---

## THAY ĐỔI 4: 4 Skills mới từ Superpowers

### [NEW] `templates/skills/evnict-kit-brainstorm/SKILL.md`
Đã mô tả ở Thay đổi 3.1 — 150+ dòng

### [NEW] `templates/skills/evnict-kit-receiving-review/SKILL.md`
```markdown
---
name: evnict-kit-receiving-review
description: Cách xử lý feedback code review — phân loại, prioritize, fix, respond. Dùng khi nhận review feedback.
---
```
Nội dung 80+ dòng:
- Phân loại feedback: Critical → Fix ngay | Important → Fix trước merge | Minor → Optional
- KHÔNG defensive — acknowledge issues
- Fix systematic (không patch từng chỗ)
- Response format cho reviewer

### [NEW] `templates/skills/evnict-kit-git-worktrees/SKILL.md`
```markdown
---
name: evnict-kit-git-worktrees
description: Git worktree cho parallel development — tạo, quản lý, cleanup worktrees. Isolation giữa các features.
---
```
Nội dung 80+ dòng:
- `git worktree add ../feature-xyz feature/xyz`
- Khi nào dùng worktree vs branch thường
- Cleanup: `git worktree remove`
- List: `git worktree list`

### [NEW] `templates/skills/evnict-kit-finish-branch/SKILL.md`
```markdown
---
name: evnict-kit-finish-branch
description: Kết thúc development branch — merge/PR decision, cleanup, verify. Dùng sau khi tất cả tasks hoàn thành.
---
```
Nội dung 80+ dòng:
- Pre-check: all tests pass? lint clean? build OK?
- Decision: Merge local | Create PR | Keep branch
- Cleanup: delete feature branch, worktree
- Post-merge verify

---

## THAY ĐỔI 5: Handoff FE↔BE chi tiết hơn

### [MODIFY] `templates/skills/evnict-kit-coordinate/SKILL.md`

Thêm action mới: `HANDOFF` — tạo handoff summary khi chuyển task sang agent khác.

```markdown
### Action: HANDOFF — Tạo handoff summary cho agent khác

#### Khi nào
Sau khi BE implement xong HOẶC cần FE implement phần frontend.

#### Nội dung handoff file
Tạo `.evnict/handoff/{feature}-handoff-{be|fe}.md`:

```markdown
# Handoff: {Feature Name}
## From: {BE/FE} Agent → To: {FE/BE} Agent
## Date: {timestamp}

## 1. Tóm tắt đã làm
{Mô tả ngắn gọn những gì đã implement}

### Files đã tạo/sửa
- `path/to/file1.java` — mô tả
- `path/to/file2.java` — mô tả

### API endpoints đã tạo
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/module/list | Danh sách (phân trang) |
| POST | /api/module/save | Tạo mới |

## 2. YÊU CẦU cho {FE/BE}
### Tasks cần làm
- [ ] Task FE-01: Tạo service gọi API /api/module/list
- [ ] Task FE-02: Tạo component danh sách
- [ ] Task FE-03: Tạo form thêm/sửa
- [ ] Task FE-04: Routing + menu

### API Contract
Xem: `.evnict/handoff/contracts/{feature}-api.yaml`

### Lưu ý đặc biệt
- {Validation rules cần sync giữa BE/FE}
- {Response format đặc biệt}
- {Auth requirements}

## 3. Cách chạy
FE agent mở project frontend, chạy:
`/evnict-kit:implement`
→ Agent đọc handoff file này + API contract → implement FE tasks
```

#### Workflow update
Sau khi `/evnict-kit:implement` xong ở BE:
1. Agent tự sinh handoff file
2. Update `.evnict/handoff/be-status.md` → status: done  
3. Thông báo user: "BE hoàn thành. Mở FE project, Agent sẽ đọc handoff."
```

### Thêm command handoff
#### [NEW] `templates/commands/antigravity/evnict-kit-handoff.md`
```markdown
---
description: Tạo handoff summary cho agent khác (FE→BE hoặc BE→FE)
---
# Handoff
**Command:** `/evnict-kit:handoff`
Sinh handoff file chi tiết để agent ở project khác đọc và tiếp tục implement.
```

---

## THAY ĐỔI 6: Fix archive-wiki + Symlink

### Vấn đề
Archive-wiki treo khi tạo file .md — có thể do:
1. Wiki path không tồn tại (chưa symlink)
2. Agent cố write vào path absolute ngoài project

### Fix
#### [MODIFY] `templates/workflows/antigravity/evnict-kit-archive-wiki.md`

Thêm pre-check:
```markdown
## Pre-checks (PHẢI pass trước khi chạy)

### Check 1: Wiki accessible
```bash
# Check symlink wiki tồn tại trong project
ls -la {project_name}-wiki/ 
# Nếu không tồn tại → báo lỗi:
# "Wiki chưa được link. Chạy evnict-kit init hoặc tạo symlink thủ công."
```

### Check 2: Wiki đã setup
```bash
ls {project_name}-wiki/package.json
# Nếu không tồn tại → nhắc: "Chạy /evnict-kit:init-wiki trước."
```

### Check 3: Quyền ghi
```bash
touch {project_name}-wiki/raw/notes/.test-write && rm {project_name}-wiki/raw/notes/.test-write
# Nếu lỗi → "Không có quyền ghi vào wiki. Kiểm tra permissions."
```
```

Sửa path: dùng RELATIVE path qua symlink thay vì absolute:
```markdown
# TRƯỚC (lỗi)
Copy vào `../../ncpt-wiki/raw/notes/{file}`

# SAU (đúng — qua symlink)
Copy vào `ncpt-wiki/raw/notes/{file}`
```

#### [MODIFY] `templates/skills/evnict-kit-wiki/SKILL.md`
Cập nhật wiki path detection:
```markdown
## Xác định wiki path
1. Check symlink trong project: `{project_name}-wiki/` 
2. Nếu không có symlink → đọc `.evnict/config.yaml` → `wiki.folder`
3. Nếu vẫn không tìm được → báo lỗi, hướng dẫn setup
```

---

## THAY ĐỔI 7: Version + Package

#### [MODIFY] `package.json`
- version: "0.1.3" → "0.1.4"

#### [MODIFY] `bin/cli.js`  
- Version string: v0.1.3 → v0.1.4
- Thêm command `add`: `evnict-kit add <folder>` để thêm project sau init

---

## CHECKLIST THỰC HIỆN

### CLI Changes
- [ ] `bin/cli.js` — version 0.1.4, remove requiredOption('--name'), add `add` command
- [ ] `src/commands/init.js` — interactive wizard, symlinks, multi-repo config
- [ ] `src/utils/config.js` — version 0.1.4
- [ ] `package.json` — version 0.1.4

### New Files
- [ ] `templates/skills/evnict-kit-brainstorm/SKILL.md` — 150+ dòng
- [ ] `templates/skills/evnict-kit-receiving-review/SKILL.md` — 80+ dòng
- [ ] `templates/skills/evnict-kit-git-worktrees/SKILL.md` — 80+ dòng
- [ ] `templates/skills/evnict-kit-finish-branch/SKILL.md` — 80+ dòng
- [ ] `templates/commands/antigravity/evnict-kit-plan.md` — 60+ dòng
- [ ] `templates/commands/antigravity/evnict-kit-handoff.md` — 50+ dòng

### Modified Files  
- [ ] `templates/workflows/antigravity/evnict-kit-feature-large.md` — Phase 0 brainstorm, BE/FE detect, plan command reference
- [ ] `templates/skills/evnict-kit-tdd/SKILL.md` — user interaction points
- [ ] `templates/skills/evnict-kit-coordinate/SKILL.md` — HANDOFF action, detailed status
- [ ] `templates/skills/evnict-kit-wiki/SKILL.md` — symlink path detection
- [ ] `templates/workflows/antigravity/evnict-kit-archive-wiki.md` — pre-checks, symlink paths

### Testing
```bash
# Test interactive init
cd /tmp && mkdir test-ws && cd test-ws
mkdir ncpt-be ncpt-fe
node /path/to/evnict-kit/bin/cli.js init
# → Should prompt interactively

# Test symlinks
ls -la ncpt-be/ncpt-wiki    # → symlink to ../ncpt-wiki
ls -la ncpt-be/docs          # → symlink to ../docs
ls -la ncpt-be/.evnict       # → symlink to ../.evnict

# Test backward compat
node /path/to/evnict-kit/bin/cli.js init --name=ncpt --be=ncpt-be --fe=ncpt-fe
# → Should work like v0.1.3

# Count new skills
ls templates/skills/ | wc -l  # → 22 (18 + 4 new)
```

---

## THỨ TỰ THỰC HIỆN

1. **CLI first**: init.js interactive + symlinks + multi-repo (phức tạp nhất)
2. **4 skills mới**: brainstorm, receiving-review, git-worktrees, finish-branch
3. **2 commands mới**: plan, handoff
4. **Modify workflows**: feature-large (Phase 0 + BE/FE detect)
5. **Modify skills**: tdd (interaction), coordinate (handoff), wiki (symlink)
6. **Fix archive-wiki**: pre-checks + relative paths
7. **Test**: interactive init + symlinks + backward compat

---

## LƯU Ý QUAN TRỌNG

### Symlinks trên Windows
```javascript
// PHẢI dùng 'junction' cho Windows — không cần admin privilege
symlinkSync(target, link, 'junction');

// Nếu chạy trên Linux/Mac → dùng 'dir'
const linkType = process.platform === 'win32' ? 'junction' : 'dir';
symlinkSync(target, link, linkType);
```

### Backward compatibility
- `evnict-kit init --name=xxx --be=yyy --fe=zzz` VẪN PHẢI hoạt động
- Interactive mode chỉ khi KHÔNG truyền `--name`

### Config.yaml breaking change
v0.1.3:
```yaml
repos:
  backend: { folder: "be", tech: "springboot" }
  frontend: { folder: "fe", tech: "angular" }
```
v0.1.4:
```yaml
repos:
  - { folder: "be", type: "backend", tech: "springboot" }
  - { folder: "fe", type: "frontend", tech: "angular" }
```
→ Cần migration logic trong `mergeWithConfig()` để đọc cả 2 format.

### Skill quality
Mỗi skill MỚI viết ≥ 80 dòng, có:
- Frontmatter đúng (name, description)
- Input Parameters
- Workflow Steps đánh số
- Code examples (nếu relevant)
- Tiêu chí hoàn thành
- Error handling
