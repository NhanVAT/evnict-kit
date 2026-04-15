<div align="center">

# 🚀 EVNICT-KIT

### AI-Assisted Development Toolkit

[![npm version](https://img.shields.io/npm/v/evnict-kit.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/evnict-kit)
[![node](https://img.shields.io/node/v/evnict-kit.svg?style=flat-square&color=339933)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/evnict-kit.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/evnict-kit)
[![downloads](https://img.shields.io/npm/dt/evnict-kit.svg?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/evnict-kit)

**Bộ công cụ chuẩn hóa phát triển phần mềm với AI Agent — theo QĐ-TTPM**

*Tích hợp Rules Engine · Skills Framework · TDD Workflows · Wiki Knowledge Base · Multi-Tool Support*

---

[Cài đặt](#-cài-đặt) · [Quick Start](#-quick-start) · [Tính năng](#-tính-năng) · [Workflows](#-danh-sách-workflows) · [Multi-Tool](#-multi-tool-support) · [CLI Commands](#-cli-commands)

</div>

---

## 📦 Cài đặt

```bash
npm install -g evnict-kit
```

Kiểm tra cài đặt:

```bash
evnict-kit --version       # Xem phiên bản hiện tại
evnict-kit doctor           # Kiểm tra môi trường & cập nhật
evnict-kit info             # Thống kê chi tiết về toolkit
```

> **Yêu cầu:** Node.js >= 18.0.0

---

## ⚡ Quick Start

### 1. Khởi tạo workspace

```bash
cd /path/to/workspace         # Thư mục chứa các project BE, FE
evnict-kit init --name=myapp --be=myapp-be --fe=myapp-fe
```

### 2. Setup AI Agent trong từng project

Mở AI Agent (Antigravity / Claude / Cursor / ...) trong thư mục project, sau đó gõ:

```
/evnict-kit:init-rules        # Agent quét code → tự sinh coding rules
/evnict-kit:init-context      # Agent sinh context file (AGENTS.md)
/evnict-kit:init-wiki         # Setup wiki repo tri thức
/evnict-kit:wiki-scan-project # Scan code → nạp wiki lần đầu
```

### 3. Bắt đầu phát triển

```
/evnict-kit:feature-large "Mô tả tính năng"   # Feature lớn (BE+FE+DB)
/evnict-kit:feature-small "Mô tả"             # Feature nhỏ (sửa UI, thêm field)
/evnict-kit:bug-fix "Mô tả bug"               # Sửa bug với TDD
```

---

## 🔄 Cập nhật phiên bản mới (Upgrade)

Khi có bản cập nhật mới của `evnict-kit`, bạn làm theo 2 bước sau để nâng cấp hoàn chỉnh:

### 1. Nâng cấp công cụ trên máy (Global)
Cập nhật package cài đặt chung cho môi trường làm việc của bạn:
```bash
npm update -g evnict-kit
# Hoặc an toàn hơn, dùng lệnh có sẵn:
evnict-kit upgrade
```

### 2. Đồng bộ file vào Project hiện tại (Sync)
Lưu ý: Các dự án của bạn (đã được `init` từ bản cũ) **sẽ không tự động nhận** các Workflows, Skills hay Rules mới.
Bạn cần di chuyển vào thư mục dự án và chạy lệnh:
```bash
cd /path/to/workspace/your-project
evnict-kit sync
```
> **💡 Tính năng lệnh Sync:** Hệ thống sẽ tự động phát hiện xem project đang dùng AI Tool nào (Antigravity/Claude/Cursor...) và cập nhật/ghi đè các file chuẩn của `evnict-kit`, trong khi vẫn **GIỮ NGUYÊN HOÀN TOÀN** các đoạn code hoặc Project Rules riêng mà bạn tự định nghĩa.

---

## 🎯 Tính năng

### 🧠 Rules Engine — 5 Rule Sets

| Rule File | Nội dung |
|-----------|----------|
| `01-general-rules` | Quy tắc chung — git flow, commit convention, code style |
| `02-security-rules` | ATTT — OWASP, input validation, auth/authz |
| `03-backend-conventions` | BE — Spring Boot / ASP.NET / Java EE patterns |
| `04-frontend-conventions` | FE — Angular / React component & state patterns |
| `05-project-conventions` | Project-specific — Agent tự scan & bổ sung |

### 🛠️ Skills Framework — 22 Skills

Kỹ năng chuyên biệt giúp Agent thực thi chính xác:

| Nhóm | Skills |
|------|--------|
| **Development** | `create-api` · `create-component` · `create-page` · `database-migration` |
| **Quality** | `code-review` · `tdd` · `bug-fix` · `fix-business-logic` · `fix-attt` |
| **Process** | `brainstorm` · `spec` · `checkpoint` · `coordinate` · `prompt-standard` |
| **Git** | `finish-branch` · `merge-checklist` · `git-worktrees` · `receiving-review` |
| **Knowledge** | `wiki` · `onboard` · `doc-postmortem` · `security-audit` |

### 📋 Workflows — 17 Quy trình

Quy trình từng bước, Agent thực thi tự động:

| Workflow | Mô tả |
|----------|-------|
| `feature-large` | Brainstorm → Spec → Plan → Implement → Review |
| `feature-small` | Query wiki → Plan nhanh → Implement |
| `bug-fix` | Classify → Root cause → TDD fix |
| `plan` | Sinh plan + task files chi tiết |
| `implement` | TDD per subtask (STOP-AND-ASK) |
| `handoff` | Trao đổi giữa BE ↔ FE Agents |
| `review` | Auto review trước merge |
| `attt` | Quét & fix lỗi bảo mật |
| `wiki-scan-project` | Scan code → nạp wiki tri thức |
| `wiki-archive-feature` | Nạp tri thức feature vào wiki |
| `wiki-query` | Tìm thông tin trong wiki |
| `init-rules` / `init-context` / `init-check` / `init-wiki` | Setup ban đầu |
| `spec-archive` | Lưu trữ specification |

### 📚 Wiki — Knowledge Base

Hệ thống tri thức dùng chung giữa các Agent (BE + FE qua symlink):

- **Scan & Ingest**: Quét code tự động → sinh wiki notes
- **Query**: Tìm kiếm tri thức trước khi code
- **Archive**: Nạp tri thức sau mỗi feature/bugfix
- **Handoff Protocol**: Trao đổi file `handoff.md` giữa các Agent

---

## 🔧 Multi-Tool Support

EVNICT-KIT hỗ trợ **5 AI coding tools** — cùng hệ tri thức, khác format deploy:

| Tool | Agent Dir | Context File | Deploy Mode |
|------|-----------|-------------|-------------|
| **Antigravity** (default) | `.agent/` | `AGENTS.md` | Rules + Skills + Workflows |
| **Claude Code** | `.claude/` | `CLAUDE.md` | Mega-file + Commands |
| **Cursor** | `.cursor/` | `.cursorrules` | Rules only (`.mdc`) |
| **GitHub Copilot** | `.github/` | `copilot-instructions.md` | Single file |
| **OpenAI Codex** | `.agent/` | `AGENTS.md` | Rules + Skills + Workflows |

```bash
# Chọn tool khi init
evnict-kit init --name=myapp --tool=claude
evnict-kit init --name=myapp --tool=cursor

# Hoặc thay đổi tool cho project đã init
evnict-kit init-rules --tool=cursor
```

---

## 💻 CLI Commands

### Lệnh chính (Terminal)

| Lệnh | Mô tả |
|-------|-------|
| `evnict-kit init` | Khởi tạo workspace — interactive wizard hoặc flags |
| `evnict-kit add <folder>` | Thêm project vào workspace đã init |
| `evnict-kit doctor` | 🩺 Kiểm tra môi trường, phiên bản, cập nhật |
| `evnict-kit info` | 📊 Thống kê chi tiết toolkit |
| `evnict-kit upgrade` | 🔄 Kiểm tra & cập nhật phiên bản mới nhất |
| `evnict-kit sync` | 🔄 Re-deploy templates vào các project — ghi đè files evnict-kit, giữ nguyên files user |

### Lệnh Agent (gõ trong AI Agent chat)

| Lệnh | Mô tả |
|-------|-------|
| `/evnict-kit:init-rules` | Agent quét code → điền conventions |
| `/evnict-kit:init-context` | Agent sinh AGENTS.md |
| `/evnict-kit:init-check` | Agent sinh demo code verify |
| `/evnict-kit:init-wiki` | Setup wiki repo |
| `/evnict-kit:feature-large "..."` | Phát triển feature lớn |
| `/evnict-kit:feature-small "..."` | Phát triển feature nhỏ |
| `/evnict-kit:bug-fix "..."` | Sửa bug với TDD |
| `/evnict-kit:plan` | Sinh plan chi tiết |
| `/evnict-kit:implement` | TDD implement |
| `/evnict-kit:handoff` | Chuyển giao BE ↔ FE |
| `/evnict-kit:review` | Auto review |
| `/evnict-kit:attt` | Kiểm tra ATTT |
| `/evnict-kit:wiki-query "..."` | Tìm tri thức |
| `/evnict-kit:wiki-scan-project` | Scan code → wiki |
| `/evnict-kit:wiki-archive-feature` | Nạp tri thức feature |

---

## 📐 Kiến trúc

```
evnict-kit/
├── bin/cli.js                  # CLI entry point (Commander.js)
├── src/
│   ├── commands/               # CLI command handlers
│   │   ├── init.js             # Interactive wizard + workspace setup
│   │   ├── add.js              # Thêm project vào workspace
│   │   ├── doctor.js           # Health check & version check
│   │   ├── info.js             # Toolkit statistics
│   │   └── upgrade.js          # Auto-upgrade
│   └── utils/
│       ├── config.js           # Config loader + TOOL_MAP
│       └── file.js             # File utilities
└── templates/
    ├── content/                # Tool-agnostic content (source of truth)
    │   ├── rules/              # 5 rule files
    │   ├── skills/             # 22 skill folders
    │   └── workflows/          # 17 workflow files
    ├── rules/                  # Tool-specific formatted rules
    │   ├── antigravity/        # .md files
    │   ├── claude/             # Mega-file sections
    │   └── cursor/             # .mdc files
    ├── workflows/              # Tool-specific formatted workflows
    ├── skills/                 # Tool-specific formatted skills
    ├── context/                # Context file templates
    ├── instruct/               # Instruction templates
    ├── wiki/                   # Wiki scaffold (MIT — llm-wiki)
    └── GETTING-STARTED.md      # User guide (deployed vào project)
```

---

## 🔄 Luồng làm việc

### Feature Development (Full)

```
feature-large → plan → implement → handoff → review → wiki-archive-feature
```

### Feature Development (Quick)

```
feature-small → implement → wiki-archive-feature (optional)
```

### Bug Fix

```
bug-fix → implement fix → wiki-archive-feature (optional)
```

### Workspace Setup

```
evnict-kit init → init-rules → init-context → init-check → init-wiki → wiki-scan-project
```

### Handoff Protocol (BE ↔ FE)

```
BE: /evnict-kit:handoff → sinh entry 🔴 Chờ xử lý
FE: Đọc handoff.md → implement → update 🟢 Đã xử lý
```

---

## ⚙️ Options Reference

### `evnict-kit init`

| Flag | Mô tả | Default |
|------|-------|---------|
| `--name <n>` | Tên dự án | *(interactive)* |
| `--be <folder>` | Folder backend | `<name>-be` |
| `--fe <folder>` | Folder frontend | `<name>-fe` |
| `--tool <tool>` | AI tool | `antigravity` |
| `--tech-be <tech>` | `springboot\|aspnet\|javaee` | `springboot` |
| `--tech-fe <tech>` | `angular\|react-web\|react-mobile` | `angular` |
| `--db <db>` | `oracle\|sqlserver` | `oracle` |
| `--no-wiki` | Không setup wiki | `false` |
| `--no-interactive` | Non-interactive mode | `false` |

### `evnict-kit add <folder>`

| Flag | Mô tả |
|------|-------|
| `--type <type>` | `backend\|frontend` |
| `--tech <tech>` | `springboot\|angular\|react-web\|...` |
| `--tool <tool>` | Override AI tool |

---

## 📊 Stats

| Metric | Count |
|--------|-------|
| Rule Sets | 5 |
| Skills | 23 |
| Workflows | 17 |
| Supported AI Tools | 5 |
| Tech Stacks (BE) | SpringBoot · ASP.NET · Java EE |
| Tech Stacks (FE) | Angular · React Web · React Native |
| Databases | Oracle · SQL Server |

---

## 🆘 Troubleshooting

| Vấn đề | Giải pháp |
|---------|-----------|
| Agent không hiểu lệnh | Kiểm tra file workflow trong `.agent/workflows/` |
| Wiki không truy cập | Check symlink: `ls -la <project>-wiki/` |
| Handoff không thấy | Check `.evnict/handoff/handoff.md` |
| Muốn thêm project | `evnict-kit add <folder>` |
| Wiki trống sau init | Chạy `/evnict-kit:wiki-scan-project` |
| Cần update toolkit | `evnict-kit doctor` hoặc `npm update -g evnict-kit` |

---

## 📜 Changelog

### v0.2.7 (Current)
- 🧠 **Dynamic Wiki Scope**: Nới lỏng ràng buộc cho workflow `wiki-scan-project`, cho phép xuất đầu ra (wiki notes) linh hoạt theo module, nhóm API, một tính năng nhỏ hoặc từng file cấu trúc tuỳ theo query của người dùng, thay vì gò bó cứng "mỗi module 1 file" như trước. Tự động nhận diện cấu trúc file wiki sinh ra với tham số YAML `type` và `title` linh hoạt theo phạm vi quy mô code.

### v0.2.6
- 🧹 **Workflow Ingestion Fix**: Thay thế hoàn toàn mã giả bash script (pseudo-code) cho tiến trình Auto-ingest tại tất cả 15 file quy trình (`wiki-scan-project`, `wiki-archive-feature`, `feature-large`, `attt`, `archive-wiki`) thành dạng natural language prompts chuẩn mực giúp AI auto-trigger skill Ingest, khắc phục lỗi Agent không thể nhận diện được lệnh giả dưới Terminal.
- 📂 **Workspace Output Fix**: Chỉ định đích danh đường dẫn đầu ra bắt buộc `{wiki_path}/raw/notes/` cho kết quả sau quét Codebase (module `evnict-kit-wiki-scan-project`) để tương thích trọn vẹn với pattern LLM-Wiki.
- ⚙️ **Dynamic CLI Initialization**: Framework config `init.js` nay đã tự động ánh xạ version trực tiếp từ `package.json` thay vì fix cứng.

### v0.2.5
- 🧠 **Wiki Query Synthesis**: Nâng cấp query từ grep-listing lên **full synthesis** theo chuẩn llm-wiki — Agent đọc INDEX.md → tổng hợp từ nhiều trang → tạo synthesis pages → ghi LOG.md
- 🧹 **Init Wiki Cleanup**: Xóa bước "Install dependencies" (tàn dư npm) khỏi workflow init-wiki, sync với bản content gốc
- 📂 **Wiki Template Fix**: Bổ sung `raw/reddit/` và `raw/twitter/` còn thiếu trong template (cần cho discover + pain-rank)
- 🎨 **Init Wizard UX**: Cải thiện prompt phân loại project — hiện rõ tech đã detect, gợi ý loại, hướng dẫn nhập
- 🗑️ Xóa file `EVNICT-KIT-FIX-WIKI-PROMPT.md` (checklist migration đã hoàn thành)

### v0.2.4
- 📚 **Native llm-wiki Integration**: Chuyển đổi toàn bộ quy trình Wiki sang chuẩn `llm-wiki` với Agent-driven ingestion — xoá bỏ sự phụ thuộc script Node.js (`scripts/ingest.js`)
- 🧹 **Cấu trúc Wiki chuẩn hóa**: Wiki project giờ đây được sắp xếp sạch sẽ trong `wiki/entities/`, `wiki/concepts/`, `wiki/sources/`, `wiki/syntheses/` (thay vì folder `processed/` cũ)
- 🤖 **Auto-Skills**: Agent tự động dùng skill `llm-wiki` (`SKILL.md`) để đọc code, sinh tri thức và trích xuất thực thể chuyên nghiệp
- 🗑️ **Refactoring**: Cập nhật toàn bộ Agent workflow (scan, query, archive) bám sát kiến trúc mới

### v0.2.3
- 🎨 **Frontend Design Skill**: Skill mới `evnict-kit-frontend-design` — hướng dẫn tư duy thiết kế UI chất lượng cao cho Angular, tránh "AI slop" aesthetics
- 🧠 **Context Refresh**: Thêm section "Tuân thủ Rules & Context" vào TẤT CẢ 36 workflows/skills — cơ chế smart check (chỉ đọc lại nếu chưa đọc, tiết kiệm token)
- 🎯 **FE Design Hint**: 6 workflows có code FE được bổ sung nhắc tham chiếu skill frontend-design
- 🔄 **Sync Command**: Lệnh `evnict-kit sync` — re-deploy templates khi upgrade version, không xóa files user tự thêm
- 📦 Hỗ trợ cả Antigravity + Claude workflows

### v0.2.2
- 🧹 Removed obsolete standalone commands (`init-rules`, `init-context`, `init-workflow`, `init-check`)
- 🩺 `doctor` command: health check, version check, workspace status
- 📊 `info` command: toolkit statistics dashboard
- 🔄 `upgrade` command: check & auto-upgrade to latest
- 🎨 Post-install banner on `npm install`

### v0.2.1
- ✨ Multi-tool support: Antigravity, Claude, Cursor, Copilot, Codex
- 📚 Wiki system: scan-project, archive-feature, query
- 🤝 Handoff protocol: BE ↔ FE standardized
- 📖 GETTING-STARTED.md: comprehensive user guide
- 🩺 `doctor` & `info` CLI commands

### v0.1.6
- 📚 Wiki workflows: archive-feature, scan-project, query
- 🤝 Standardized Handoff protocol (single `handoff.md`)
- 📖 GETTING-STARTED.md user guide

### v0.1.5
- 🔐 Security rules & ATTT workflows
- 📋 TDD workflow improvements

### v0.1.4
- 🔧 Multi-repo support (array format)
- ➕ `evnict-kit add` command

### v0.1.3
- 🚀 Initial release — Rules, Skills, Workflows
- 🧙 Interactive wizard

---

## 📄 License

**UNLICENSED** — Internal use only (EVNICT — Trung tâm Phát triển Phần mềm)

### Third-party

| Package | License | Note |
|---------|---------|------|
| [llm-wiki](https://github.com/mduongvandinh/llm-wiki) | MIT | Minimal scaffold bundled in `templates/wiki/` |
| [Commander.js](https://github.com/tj/commander.js) | MIT | CLI framework |
| [js-yaml](https://github.com/nodeca/js-yaml) | MIT | YAML parser |

---

<div align="center">

**Made with ❤️ by EVNICT — Trung tâm Phát triển Phần mềm**

*Nâng cao năng suất phát triển phần mềm với AI Agent*

</div>
