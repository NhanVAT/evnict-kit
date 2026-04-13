# EVNICT-KIT v0.1.3 — Upgrade Prompt
# Dùng file này trong Antigravity IDE + Opus 4.6 thinking
# Mở project evnict-kit → paste prompt này → Agent sẽ rewrite tất cả files

---

## MỤC TIÊU

Bạn đang làm việc trên project **evnict-kit** — bộ công cụ CLI giúp khởi tạo workspace cho các dự án phần mềm EVNICT có sử dụng AI Agent.

Hiện tại các file templates (rules, skills, workflows) trong `templates/` chỉ là **stub trống** — cần rewrite lại TOÀN BỘ với nội dung chi tiết, chất lượng production.

## CONTEXT QUAN TRỌNG

### Evnict-kit làm gì
1. CLI command `evnict-kit init` → tạo workspace + deploy files vào từng project (BE, FE)
2. Files được deploy VÀO TRONG project (VD: `cmis-be/.agent/rules/`, `cmis-be/.agent/workflows/`)
3. Mỗi AI tool (Antigravity, Claude Code, Cursor...) có cấu trúc folder riêng

### Source tham khảo — QĐ-TTPM
Quy định hướng dẫn sử dụng AI trong PTPM tại EVNICT. Nội dung chính:
- **Điều 7**: Thiết lập ngữ cảnh (Context File, Rules, Skills)
- **Điều 8**: Nguyên tắc sử dụng AI an toàn
  - Mục 8.2: An toàn dữ liệu
  - Mục 8.4: Quy trình làm việc (review, test, commit)
  - Mục 8.5: Viết prompt chuẩn
  - Mục 8.6: Ràng buộc kỹ thuật
  - Mục 8.7: Chống Vibe Coding
  - Mục 8.8: Checkpoint & Rollback
  - Mục 8.9: Tài liệu đặc tả
  - Mục 8.10: Checklist merge
- **Phụ lục II**: Quy trình theo loại công việc (dự án mới, feature, fix bug)
- **Phụ lục III**: Cấu trúc tài liệu thiết kế (BA spec)
- **Phụ lục IV**: Hướng dẫn thiết lập ngữ cảnh

### Công nghệ EVNICT sử dụng
- **Backend**: Java Spring Boot, ASP.NET Core, Java EE
- **Frontend**: Angular, React Web, React Mobile
- **Database**: Oracle, SQL Server
- **ORM**: JOOQ (chủ yếu), JPA/Hibernate
- **CI/CD**: Azure DevOps
- **Container**: Docker, Kubernetes
- **Storage**: MinIO
- **Auth**: JWT (RSA256), EVN SSO

### 3 công cụ core tích hợp
1. **spec-kit** (GitHub) — Spec-Driven Development: specify → clarify → plan → tasks → implement
2. **OpenSpec** — SDD: propose changes → apply → archive
3. **LLM Wiki** (github.com/mduongvandinh/llm-wiki) — Knowledge base: push notes → ingest → query

---

## CẤU TRÚC ĐÚNG CHO ANTIGRAVITY IDE

```
project-root/
├── .agent/
│   ├── rules/              ← Flat! Mỗi file ngang cấp nhau, KHÔNG subdirectory
│   │   ├── 01-evnict-kit-core-conventions.md
│   │   ├── 02-evnict-kit-security-rules.md
│   │   ├── 03-evnict-kit-...md
│   │   └── ...
│   ├── skills/             ← Mỗi skill là 1 subfolder chứa SKILL.md
│   │   ├── evnict-kit-spec/
│   │   │   └── SKILL.md
│   │   ├── evnict-kit-tdd/
│   │   │   └── SKILL.md
│   │   └── ...
│   ├── workflows/          ← Flat! Mỗi file ngang cấp nhau
│   │   ├── evnict-kit-feature-large.md
│   │   ├── evnict-kit-bug-fix.md
│   │   └── ...
│   └── commands/           ← Flat! Slash commands
│       ├── evnict-kit-init-rules.md
│       └── ...
├── AGENTS.md               ← Context file duy nhất ở root (1 file, 400-600 dòng)
└── Instruct-Agent-AI.md    ← Hướng dẫn Agent khởi tạo rules
```

### Frontmatter format cho Antigravity

**Rules:**
```yaml
---
trigger: always_on
---
```

**Workflows:**
```yaml
---
description: Mô tả ngắn gọn workflow này làm gì
---
```
hoặc nếu trigger theo file:
```yaml
---
description: Mô tả
trigger: glob
globs: **/*Repository*.java
---
```

**Skills:**
```yaml
---
name: evnict-kit-xxx
description: Mô tả chi tiết (2-3 câu)
compatibility: Yêu cầu
---
```

**Commands:**
```yaml
---
description: Mô tả command
---
```

### CẤU TRÚC CHO CLAUDE CODE

```
project-root/
├── .claude/
│   └── commands/           ← Slash commands
│       ├── evnict-kit-feature-large.md
│       └── ...
├── CLAUDE.md               ← Context file duy nhất ở root
└── Instruct-Agent-AI.md
```
Lưu ý: Claude Code không có rules/ hay workflows/ folder. Tất cả rules đặt TRONG CLAUDE.md. Skills thì dùng commands/.

### CẤU TRÚC CHO CURSOR

```
project-root/
├── .cursor/
│   └── rules/              ← Cursor rules
│       ├── evnict-kit-security.mdc
│       └── ...
├── .cursorrules             ← Context file ở root
└── Instruct-Agent-AI.md
```

### CẤU TRÚC CHO GITHUB COPILOT

```
project-root/
├── .github/
│   └── copilot-instructions.md   ← Context file
└── Instruct-Agent-AI.md
```

---

## DANH SÁCH FILES CẦN REWRITE

### A. Rules (FLAT — cho Antigravity)

File đặt trong `templates/rules/antigravity/` (CLI sẽ copy vào `.agent/rules/`)

| File | Nội dung | Dòng tối thiểu |
|------|----------|-----------------|
| `01-evnict-kit-general-rules.md` | R01-R08 gộp: No Secrets, No Auto Push, No Destructive, No PII, Test Before Commit, Minimal Diff, No Placeholder, Respect Gitignore | 150+ |
| `02-evnict-kit-security-rules.md` | ATTT01-ATTT08 gộp: SQLi, XSS, CSRF, JWT, CVE, Upload, Data Exposure, OWASP | 200+ (đã có exemplar) |
| `03-evnict-kit-backend-conventions.md` | RB01-RB06 + conventions: Input Validation, Error Handling, Migration, Auth, Rate Limit. Code examples cho Spring Boot + JOOQ + Oracle | 200+ |
| `04-evnict-kit-frontend-conventions.md` | RF01-RF06: No Inline, Component Reuse, i18n, a11y, No DOM, Responsive. Code examples cho Angular + PrimeNG | 150+ |
| `05-evnict-kit-project-conventions.md` | RP01-RP07 CHƯA KHỞI TẠO: Naming, Architecture, Coding, API, Database, Component, Integration. Mỗi section có placeholder "⚠️ CHƯA ĐƯỢC KHỞI TẠO" | 100+ |

Tổng: **5 rule files** (thay vì 35 file nhỏ). Gộp lại cho gọn — Antigravity đọc flat files.

### B. Skills (subfolder/SKILL.md)

File đặt trong `templates/skills/{skill-name}/SKILL.md`

| Skill | Mô tả | Dòng tối thiểu |
|-------|--------|-----------------|
| `evnict-kit-spec` | SDD: specify + clarify + propose plan. Gộp flow từ spec-kit + OpenSpec. Chi tiết format spec.md, plan.md, task files | 200+ |
| `evnict-kit-tdd` | TDD per subtask: Red→Green→Refactor→Verify→Commit. 3-strike rule. Hướng dẫn viết test cho Spring Boot + Angular | 150+ |
| `evnict-kit-wiki` | Push/Query llm-wiki: format frontmatter, copy vào raw/notes/, trigger ingest, query processed/ | 100+ |
| `evnict-kit-coordinate` | FE↔BE coordination: handoff protocol, API contract format, status sync | 100+ |
| `evnict-kit-checkpoint` | Checkpoint + Rollback plan (QĐ Mục 8.8): branch, commit, stash, rollback plan | 80+ |
| `evnict-kit-code-review` | Review checklist (QĐ Mục 8.10): security, logic, quality, vibe coding | 80+ |
| `evnict-kit-create-api` | Tạo API endpoint chuẩn: DTO→Controller→Service→Repository→Test. Code examples Spring Boot + JOOQ | 150+ |
| `evnict-kit-create-component` | Tạo UI component: check reuse → generate → style → test → a11y. Angular + PrimeNG | 100+ |
| `evnict-kit-create-page` | Tạo page mới: module → routing → component → service → loading states | 100+ |
| `evnict-kit-database-migration` | Migration: naming, UP/DOWN scripts, test, Oracle + SQL Server | 80+ |
| `evnict-kit-fix-attt` | Fix lỗi ATTT: classify severity → hotfix → OWASP fix → scan similar → security review | 100+ |
| `evnict-kit-bug-fix` | Bug fix: reproduce → root cause → TDD fix → scan similar → postmortem | 100+ |
| `evnict-kit-fix-business-logic` | Fix lỗi nghiệp vụ: verify business rules → test scenarios → fix | 80+ |
| `evnict-kit-doc-postmortem` | Tài liệu đặc tả (QĐ Mục 8.9): format, nội dung bắt buộc, ví dụ | 80+ |
| `evnict-kit-merge-checklist` | Pre-merge checklist (QĐ Mục 8.10): 9 hạng mục | 50+ |
| `evnict-kit-security-audit` | Security audit: dependency scan → code scan ATTT01-08 → report | 100+ |
| `evnict-kit-onboard` | Onboard member mới: tóm tắt project, architecture, conventions | 80+ |
| `evnict-kit-prompt-standard` | Chuẩn viết prompt (QĐ Mục 8.5): format, ví dụ tốt/xấu | 60+ |

Tổng: **18 skills**

### C. Workflows (FLAT — cho Antigravity)

File đặt trong `templates/workflows/antigravity/`

| Workflow | Mô tả | Dòng |
|----------|--------|------|
| `evnict-kit-feature-large.md` | Feature lớn (đã có exemplar) | 200+ |
| `evnict-kit-feature-small.md` | Feature nhỏ: skip spec, query wiki → plan → TDD → archive | 80+ |
| `evnict-kit-bug-fix.md` | Bug fix: query wiki → classify → reproduce → TDD fix → archive | 100+ |
| `evnict-kit-attt.md` | ATTT: 2 modes (--scan toàn bộ, check module cụ thể) | 80+ |
| `evnict-kit-implement.md` | Implement: TDD per subtask từ plan đã approve | 80+ |
| `evnict-kit-archive-wiki.md` | Archive: summarize → push wiki → archive spec → postmortem | 80+ |
| `evnict-kit-review.md` | Auto review: check rules + ATTT + conventions trước merge | 60+ |
| `evnict-kit-spec-archive.md` | Spec CRUD: save, find, update specs | 50+ |

Tổng: **8 workflows**

### D. Commands (FLAT — cho Antigravity)

File đặt trong `templates/commands/antigravity/`

| Command | Trigger | Mô tả |
|---------|---------|--------|
| `evnict-kit-init-rules.md` | `/evnict-kit:init-rules` | Agent đọc code → điền rules RP01-RP07 |
| `evnict-kit-init-context.md` | `/evnict-kit:init-context` | Agent sinh AGENTS.md từ rules đã khởi tạo |
| `evnict-kit-init-check.md` | `/evnict-kit:init-check` | Agent sinh demo code để verify |
| `evnict-kit-init-wiki.md` | `/evnict-kit:init-wiki` | Setup llm-wiki: npm install, config, first ingest |

### E. Context template

| File | Mô tả |
|------|--------|
| `templates/context/AGENTS.md.template` | Template AGENTS.md — 400-600 dòng, có placeholder cho Agent điền |
| `templates/instruct/Instruct-Agent-AI.be.md` | Hướng dẫn Agent init backend |
| `templates/instruct/Instruct-Agent-AI.fe.md` | Hướng dẫn Agent init frontend |

### F. Wiki

| Item | Mô tả |
|------|--------|
| `templates/wiki/` | Copy từ https://github.com/mduongvandinh/llm-wiki — có sẵn trong package |
| `templates/commands/antigravity/evnict-kit-init-wiki.md` | Command setup wiki |

---

## EXEMPLAR FILES (THAM KHẢO CHẤT LƯỢNG)

Tao đã viết 2 file mẫu đúng chất lượng production:

1. **`exemplar-rule-evnict-kit-security.md`** — Rule ATTT, 250+ dòng, code examples chi tiết
2. **`exemplar-workflow-feature-large.md`** — Workflow feature lớn, 250+ dòng, flow đầy đủ

→ Đọc 2 file này để hiểu level chất lượng cần thiết cho TẤT CẢ files khác.

Ngoài ra tham khảo các file thực tế trong `.agent/` đã được upload:
- `.agent/rules/01-backend-core-conventions.md` — 165 dòng, code thực tế dự án NCPT
- `.agent/rules/05-security-rules.md` — 124 dòng
- `.agent/skills/speckit-specify/SKILL.md` — 250+ dòng, chi tiết từng bước
- `AGENTS.md` — 624 dòng context file hoàn chỉnh

---

## HƯỚNG DẪN THỰC HIỆN

### Bước 1: Đọc exemplar files
Đọc 2 file exemplar trong thư mục gốc project để hiểu chất lượng cần thiết.

### Bước 2: Restructure templates/
```bash
# Xóa cấu trúc cũ
rm -rf templates/rules templates/skills templates/workflows templates/context templates/instruct

# Tạo cấu trúc mới
mkdir -p templates/rules/antigravity
mkdir -p templates/rules/claude
mkdir -p templates/rules/cursor
mkdir -p templates/workflows/antigravity
mkdir -p templates/workflows/claude
mkdir -p templates/commands/antigravity
mkdir -p templates/commands/claude
mkdir -p templates/context
mkdir -p templates/instruct
# Skills structure giữ nguyên (subfolder/SKILL.md)
```

### Bước 3: Viết từng file
Ưu tiên thứ tự:
1. Rules (5 files) — vì mọi thứ khác reference rules
2. Skills quan trọng nhất: evnict-kit-spec, evnict-kit-tdd, evnict-kit-wiki, evnict-kit-create-api
3. Workflows: feature-large (đã có), feature-small, bug-fix, attt
4. Commands: init-rules, init-context, init-wiki
5. Context template: AGENTS.md.template
6. Còn lại

### Bước 4: Update CLI
Sửa `src/commands/init.js` để:
- Deploy rules FLAT vào `.agent/rules/` (không subdirs)
- Deploy workflows FLAT vào `.agent/workflows/`
- Deploy commands FLAT vào `.agent/commands/`
- Sinh AGENTS.md từ template (1 file ở root project, không phải folder)
- Detect `--tool` → chọn đúng folder templates (antigravity/claude/cursor)

### Bước 5: Test
```bash
mkdir -p /tmp/test/cmis-be /tmp/test/cmis-fe
cd /tmp/test
node /path/to/evnict-kit/bin/cli.js init --name=cmis --be=cmis-be --fe=cmis-fe --tool=antigravity
# Verify:
ls cmis-be/.agent/rules/     # → flat .md files, không subdirs
ls cmis-be/.agent/workflows/  # → flat .md files
ls cmis-be/.agent/skills/     # → subfolders with SKILL.md
ls cmis-be/AGENTS.md          # → 1 file context
```

---

## LƯU Ý KHI VIẾT NỘI DUNG

### Rules
- Mỗi rule file gộp nhiều rules liên quan (thay vì 1 file/rule)
- Có frontmatter `trigger: always_on`
- Có code examples **cả đúng ✅ và sai ❌**
- Có scan commands (grep patterns)
- Tham chiếu QĐ-TTPM cụ thể (Điều, Mục)
- Phần project conventions (RP01-RP07) phải có placeholder "⚠️ CHƯA ĐƯỢC KHỞI TẠO"

### Skills
- Mỗi SKILL.md phải có frontmatter đúng (name, description, compatibility)
- Phải có Input Parameters rõ ràng
- Phải có Workflow Steps chi tiết (đánh số)
- Phải có Code examples nếu liên quan
- Phải có Tiêu chí hoàn thành (checklist)
- Phải có Error handling (khi nào DỪNG)
- Viết CHO AI AGENT ĐỌC VÀ THỰC HIỆN — không phải cho người đọc

### Workflows
- Mỗi workflow phải có frontmatter `description:`
- Có Command trigger rõ ràng
- Có Input Parameters
- Có Steps chi tiết với flow diagram (nếu phức tạp)
- Reference đúng skills cần dùng
- Viết CHO AI AGENT THỰC HIỆN — agent đọc file này và biết phải làm gì

### Context (AGENTS.md)
- 1 FILE DUY NHẤT ở root project
- 400-600 dòng
- Có architecture diagram (ASCII art)
- Có tech stack table
- Có project structure tree
- Có development commands
- Có coding conventions (hoặc tham chiếu rules)
- Có security rules summary
- Có agent commands list
- Phần "CHƯA KHỞI TẠO" → Agent sẽ điền khi chạy /evnict-kit:init-context

---

## CHECKLIST HOÀN THÀNH

- [ ] 5 rule files trong templates/rules/antigravity/ (flat, frontmatter đúng)
- [ ] 18 skill folders trong templates/skills/*/SKILL.md (nội dung chi tiết)
- [ ] 8 workflow files trong templates/workflows/antigravity/ (flat)
- [ ] 4 command files trong templates/commands/antigravity/ (flat)
- [ ] AGENTS.md.template trong templates/context/
- [ ] Instruct-Agent-AI.be.md + .fe.md trong templates/instruct/
- [ ] src/commands/init.js deploy đúng cấu trúc flat
- [ ] Test: init → verify .agent/ structure đúng Antigravity
- [ ] Wiki template có sẵn trong package (không clone runtime)
- [ ] package.json version 0.1.3
