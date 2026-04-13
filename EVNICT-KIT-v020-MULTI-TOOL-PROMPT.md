# EVNICT-KIT v0.2.0 — Multi-Tool Support
# Claude Code, Cursor, Copilot, Codex

---

## TỔNG QUAN

v0.2.0 mở rộng evnict-kit từ **chỉ Antigravity** sang hỗ trợ **5 AI tools**. Mỗi tool có cấu trúc file/folder HOÀN TOÀN KHÁC NHAU — không phải copy-paste đổi tên.

### Ma trận khác biệt giữa các tools

| Aspect | Antigravity | Claude Code | Cursor | Copilot | Codex |
|--------|-------------|-------------|--------|---------|-------|
| Agent dir | `.agent/` | `.claude/` | `.cursor/` | `.github/` | `.agent/` |
| Context file | `AGENTS.md` (root) | `CLAUDE.md` (root) | `.cursorrules` (root) | `.github/copilot-instructions.md` | `AGENTS.md` (root) |
| Rules | `.agent/rules/*.md` (flat) | **Gộp TRONG CLAUDE.md** | `.cursor/rules/*.mdc` (ext `.mdc`!) | **Gộp trong instructions.md** | `.agent/rules/*.md` (flat) |
| Skills | `.agent/skills/*/SKILL.md` | `.claude/commands/*.md` (plugin system) | ❌ Không có native | ❌ Không có | `.agent/skills/*/SKILL.md` |
| Workflows | `.agent/workflows/*.md` (flat) | `.claude/commands/*.md` | ❌ Không có | ❌ Không có | `.agent/workflows/*.md` (flat) |
| Trigger mechanism | Frontmatter `trigger:` | Slash commands `/command` | Chat-based, rules auto-apply | Chat-based | Slash commands |
| Plugin system | Skill tool | Claude Plugins (`/plugin`) | Cursor Plugins | Copilot Extensions | — |

### Chiến lược: Adapter Pattern

Không rewrite nội dung — **adapt format**:

```
templates/
├── content/           ← NỘI DUNG gốc (1 bộ duy nhất, tool-agnostic)
│   ├── rules/         ← 5 rule files (nội dung)
│   ├── skills/        ← 22 skill folders (nội dung)
│   ├── workflows/     ← 17 workflow files (nội dung)
│   └── context/       ← context template (nội dung)
│
├── adapters/          ← ADAPTER cho từng tool
│   ├── antigravity/   ← giữ nguyên v0.1.7 (đã hoạt động)
│   ├── claude/        ← adapt → .claude/ structure
│   ├── cursor/        ← adapt → .cursor/ + .cursorrules
│   ├── copilot/       ← adapt → .github/ structure  
│   └── codex/         ← adapt → giống antigravity
│
└── wiki/              ← giữ nguyên
```

**CLI init.js** sẽ:
1. Đọc content/ → lấy nội dung
2. Đọc adapters/{tool}/ → lấy cấu trúc đích
3. Merge → deploy vào project

---

## PHASE 1: Refactor — Tách content khỏi format

### [REFACTOR] Templates structure

**Bước 1:** Copy nội dung hiện tại từ `templates/workflows/antigravity/` → `templates/content/workflows/`

**Bước 2:** Copy nội dung từ `templates/rules/antigravity/` → `templates/content/rules/`

**Bước 3:** `templates/skills/` đã tool-agnostic → giữ nguyên path (rename thành `templates/content/skills/`)

**Bước 4:** Tạo adapter configs

---

## PHASE 2: Claude Code Adapter

### Cấu trúc deploy cho Claude Code

```
project-root/
├── .claude/
│   └── commands/           ← TẤT CẢ slash commands (skills + workflows gộp)
│       ├── evnict-kit-feature-large.md
│       ├── evnict-kit-bug-fix.md
│       ├── evnict-kit-plan.md
│       ├── evnict-kit-implement.md
│       ├── evnict-kit-handoff.md
│       ├── evnict-kit-wiki-query.md
│       ├── evnict-kit-wiki-scan-project.md
│       ├── evnict-kit-wiki-archive-feature.md
│       ├── evnict-kit-init-rules.md
│       ├── ... (17 workflows → 17 command files)
│       └── ... (chọn lọc skills quan trọng → thêm command files)
├── CLAUDE.md               ← 1 FILE DUY NHẤT chứa:
│                              - Context (tech stack, structure, commands)
│                              - Rules (R01-R08, RB, RF, ATTT gộp hết)
│                              - Project conventions (CHƯA KHỞI TẠO)
│                              - Security rules
│                              - Good/Bad examples
└── Instruct-Agent-AI.md
```

### CLAUDE.md — Mega file (~800-1200 dòng)

Claude Code đọc `CLAUDE.md` ở MỌI request. Nên file này phải chứa TẤT CẢ rules + context:

```markdown
# {PROJECT_NAME} — Claude Code Context

## Project Overview
{tech stack, architecture, external services}

## Project Structure  
{thư mục chính}

## Development Commands
{build, test, lint, run}

## Coding Conventions
{naming, patterns, DTO format}
<!-- CHƯA ĐƯỢC KHỞI TẠO — chạy /evnict-kit:init-rules -->

## Rules — PHẢI TUÂN THỦ

### Rules Chung (R01-R08)
- **R01 No Secrets**: Không hardcode API keys, passwords...
- **R02 No Auto Push**: Không tự động git push...
{gom 8 rules thành bullets ngắn gọn — CLAUDE.md không cần detail bằng file riêng}

### Rules Backend (RB01-RB06)
{gom 6 rules}

### Rules Frontend (RF01-RF06)  
{gom 6 rules}

### Rules Security (ATTT01-ATTT08)
{gom 8 rules — chỉ key points, scan commands}

### Project Conventions
<!-- CHƯA ĐƯỢC KHỞI TẠO -->

## Safety & Permissions
{R02, R03 expanded}

## Available Commands
| Command | Mô tả |
|---------|-------|
| `/evnict-kit:feature-large` | Feature lớn |
| `/evnict-kit:bug-fix` | Sửa bug |
{list tất cả 17+ commands}
```

### Commands adaptation

Workflows Antigravity → Claude Code commands. Format khác:

**Antigravity workflow:**
```markdown
---
description: Feature lớn
---
# Feature Large
...
```

**Claude Code command:**
```markdown
# Feature Large
**Command:** `/evnict-kit:feature-large $ARGUMENTS`

$ARGUMENTS chứa mô tả feature từ user.

## Workflow
{nội dung giữ nguyên, chỉ sửa format trigger}
```

Key differences:
- Không có frontmatter `trigger:`/`globs:`
- Dùng `$ARGUMENTS` cho user input
- Skills Claude Code cũng là commands (`.claude/commands/`)
- Subagent: Claude Code hỗ trợ native → có thể enhance TDD skill

---

## PHASE 3: Cursor Adapter

### Cấu trúc deploy cho Cursor

```
project-root/
├── .cursor/
│   └── rules/              ← Cursor rules (ext .mdc!)
│       ├── evnict-kit-general.mdc
│       ├── evnict-kit-security.mdc
│       ├── evnict-kit-backend.mdc
│       └── evnict-kit-project.mdc
├── .cursorrules             ← Context file (tương đương AGENTS.md)
└── Instruct-Agent-AI.md
```

### .cursorrules — Tương tự CLAUDE.md nhưng cho Cursor

```markdown
# {PROJECT_NAME} — Cursor AI Context

## Overview
{tech stack, structure}

## Conventions
{naming, patterns}

## Rules
{key rules — ngắn gọn hơn CLAUDE.md vì Cursor context window nhỏ hơn}

## Commands Guide
Cursor không có slash commands. Thay vào đó, user gõ tự nhiên:
- "Tạo feature mới quản lý công suất giờ" → Cursor đọc rules và conventions
- "Fix bug lỗi validate ngày" → Cursor áp dụng security + backend rules
```

### .mdc rules format

Cursor dùng extension `.mdc` (Markdown Cursor):

```markdown
---
description: EVNICT General Rules
globs: 
alwaysApply: true
---

# General Rules

## R01: No Hardcoded Secrets
{nội dung tương tự nhưng ngắn gọn hơn}
...
```

### Lưu ý Cursor
- Cursor **KHÔNG có** skills/workflows native
- Rules auto-apply dựa trên `alwaysApply: true` hoặc `globs: **/*.java`
- User tương tác qua chat, không qua slash commands
- Context window nhỏ hơn Claude → rules phải NGẮN GỌN hơn

---

## PHASE 4: Copilot Adapter

### Cấu trúc deploy cho GitHub Copilot

```
project-root/
├── .github/
│   └── copilot-instructions.md   ← 1 FILE DUY NHẤT
└── Instruct-Agent-AI.md
```

### copilot-instructions.md

Copilot chỉ hỗ trợ **1 file** instructions. Phải gom TẤT CẢ vào:

```markdown
# {PROJECT_NAME} — GitHub Copilot Instructions

## Project Context
{tech stack, structure — ngắn gọn}

## Coding Rules
{gom R01-R08, RB, RF thành bullets ngắn}

## Security Rules  
{gom ATTT thành bullets — chỉ key points}

## Conventions
{naming, patterns — tối giản}

## Workflow Guide
Khi được yêu cầu tạo feature:
1. Hỏi clarify trước khi code
2. Viết test trước (TDD)
3. Follow conventions ở trên
4. Không tự push git
```

### Lưu ý Copilot
- **Đơn giản nhất** — chỉ 1 file
- Không có skills, workflows, commands
- Copilot chủ yếu inline completion + chat
- Instructions file ảnh hưởng MỌI suggestion
- Nên NGẮN (<500 dòng) vì ảnh hưởng performance

---

## PHASE 5: Codex Adapter

### Cấu trúc deploy cho Codex

```
project-root/
├── .agent/                  ← Giống Antigravity
│   ├── rules/*.md
│   ├── skills/*/SKILL.md
│   └── workflows/*.md
├── AGENTS.md                ← Context file
└── Instruct-Agent-AI.md
```

### Lưu ý Codex
- Cấu trúc **gần giống Antigravity** (cùng dùng AGENTS.md standard)
- Khác: Codex dùng sandboxed environment → một số bash commands không chạy được
- Skills: Codex đọc SKILL.md nhưng tool mapping khác (xem superpowers codex-tools.md)
- Giữ nội dung giống Antigravity, chỉ thêm notes cho Codex-specific limitations

---

## PHASE 6: CLI Changes

### [MODIFY] `src/utils/config.js`

```javascript
export const SUPPORTED_TOOLS = ['antigravity', 'claude', 'cursor', 'copilot', 'codex'];

export const TOOL_MAP = {
  antigravity: {
    agentDir: '.agent',
    contextFile: 'AGENTS.md',
    rulesDir: '.agent/rules',
    skillsDir: '.agent/skills',
    workflowsDir: '.agent/workflows',
    contextDir: '.agent/context',
    ruleExt: '.md',
    deployMode: 'flat',        // flat files in dirs
  },
  claude: {
    agentDir: '.claude',
    contextFile: 'CLAUDE.md',
    rulesDir: null,            // Rules IN CLAUDE.md, not separate
    skillsDir: null,           // Skills = commands
    workflowsDir: '.claude/commands',  // Everything is a command
    contextDir: null,
    ruleExt: '.md',
    deployMode: 'mega-file',   // 1 big CLAUDE.md + commands/
  },
  cursor: {
    agentDir: '.cursor',
    contextFile: '.cursorrules',
    rulesDir: '.cursor/rules',
    skillsDir: null,
    workflowsDir: null,
    contextDir: null,
    ruleExt: '.mdc',           // Cursor uses .mdc extension!
    deployMode: 'rules-only',  // Only rules + context
  },
  copilot: {
    agentDir: '.github',
    contextFile: '.github/copilot-instructions.md',
    rulesDir: null,
    skillsDir: null,
    workflowsDir: null,
    contextDir: null,
    ruleExt: null,
    deployMode: 'single-file', // Everything in 1 file
  },
  codex: {
    agentDir: '.agent',
    contextFile: 'AGENTS.md',
    rulesDir: '.agent/rules',
    skillsDir: '.agent/skills',
    workflowsDir: '.agent/workflows',
    contextDir: '.agent/context',
    ruleExt: '.md',
    deployMode: 'flat',        // Same as antigravity
  },
};
```

### [MODIFY] `src/commands/init.js`

`deployToProject()` cần switch theo `deployMode`:

```javascript
function deployToProject(projectPath, cwd, opts) {
  const { tool, toolMap } = opts;
  
  switch (toolMap.deployMode) {
    case 'flat':
      // Antigravity + Codex: deploy rules/, skills/, workflows/ riêng
      deployFlat(projectPath, cwd, opts);
      break;
      
    case 'mega-file':
      // Claude Code: sinh 1 CLAUDE.md lớn + .claude/commands/
      deployClaude(projectPath, cwd, opts);
      break;
      
    case 'rules-only':
      // Cursor: deploy .cursor/rules/*.mdc + .cursorrules
      deployCursor(projectPath, cwd, opts);
      break;
      
    case 'single-file':
      // Copilot: sinh 1 file .github/copilot-instructions.md
      deployCopilot(projectPath, cwd, opts);
      break;
  }
}
```

### Adapter functions

```javascript
function deployClaude(projectPath, cwd, opts) {
  // 1. Sinh CLAUDE.md từ template (rules gộp vào trong)
  // 2. Deploy workflows → .claude/commands/ (rename + reformat)
  // 3. Deploy selected skills → .claude/commands/ (flatten)
}

function deployCursor(projectPath, cwd, opts) {
  // 1. Sinh .cursorrules từ template
  // 2. Deploy rules → .cursor/rules/*.mdc (đổi extension!)
  // 3. Reformat frontmatter: trigger → alwaysApply + globs
}

function deployCopilot(projectPath, cwd, opts) {
  // 1. Sinh .github/copilot-instructions.md (gom tất cả vào 1 file)
}
```

---

## PHASE 7: Templates cho từng tool

### Cần tạo mới

| Tool | Files cần tạo |
|------|---------------|
| Claude | `templates/context/CLAUDE.md.template` (~800 dòng mega file) |
| Cursor | `templates/context/cursorrules.template` (~400 dòng) |
| Cursor | `templates/rules/cursor/*.mdc` (5 files, reformat từ antigravity) |
| Copilot | `templates/context/copilot-instructions.md.template` (~400 dòng) |
| Codex | Copy từ antigravity (chỉ thêm notes Codex-specific) |

### Reformat rules cho Cursor (.mdc)

```markdown
---
description: EVNICT General Rules — No Secrets, No Auto Push, Test Before Commit...
globs: 
alwaysApply: true
---

{nội dung tương tự 01-evnict-kit-general-rules.md nhưng ngắn gọn hơn ~50%}
```

### Reformat workflows cho Claude Code (commands)

```markdown
{Bỏ frontmatter ---/description/---}
{Thêm $ARGUMENTS handling}
{Giữ nguyên nội dung workflow}
```

---

## CHECKLIST THỰC HIỆN

### Phase 1: Refactor
- [ ] Tạo `templates/content/` structure
- [ ] Copy content từ antigravity → content/
- [ ] Verify: antigravity vẫn hoạt động sau refactor

### Phase 2: Claude Code
- [ ] `templates/context/CLAUDE.md.template` — 800+ dòng
- [ ] Adapt 17 workflows → `.claude/commands/*.md` format
- [ ] Adapt key skills → `.claude/commands/*.md`
- [ ] `deployClaude()` function trong init.js

### Phase 3: Cursor
- [ ] `templates/context/cursorrules.template` — 400+ dòng
- [ ] 5 rule files `.mdc` extension
- [ ] `deployCursor()` function

### Phase 4: Copilot
- [ ] `templates/context/copilot-instructions.md.template` — 400+ dòng
- [ ] `deployCopilot()` function

### Phase 5: Codex
- [ ] Copy antigravity adapter + Codex-specific notes
- [ ] Verify deploy giống antigravity

### Phase 6: CLI
- [ ] `SUPPORTED_TOOLS` → all 5
- [ ] `deployToProject()` switch by deployMode
- [ ] Interactive init → 5 tool choices
- [ ] Test: `evnict-kit init --tool=claude` → verify .claude/ structure
- [ ] Test: `evnict-kit init --tool=cursor` → verify .cursor/ + .mdc
- [ ] Test: `evnict-kit init --tool=copilot` → verify .github/
- [ ] Version bump → 0.2.0

---

## THỨ TỰ THỰC HIỆN

Do v0.2.0 là release LỚN, chia thành **sub-sessions**:

1. **Session 1**: Refactor templates/ + Claude Code adapter (Nhân dùng Claude Code nên ưu tiên)
2. **Session 2**: Cursor adapter
3. **Session 3**: Copilot + Codex adapters
4. **Session 4**: CLI changes + test toàn bộ 5 tools
5. **Session 5**: Test thực tế + fix issues

---

## LƯU Ý QUAN TRỌNG

### Không copy-paste bừa
Mỗi tool có **context window** và **cách đọc** khác nhau:
- Antigravity: đọc từng file khi trigger → CÓ THỂ viết dài chi tiết
- Claude Code: đọc CLAUDE.md ở MỌI request → phải CÔ ĐỌNG (rules gom bullets)
- Cursor: context window nhỏ → rules phải NGẮN NHẤT
- Copilot: 1 file → phải TỔNG HỢP

### Content reuse strategy
- **Nội dung gốc** (content/) giữ ở mức detail CAO NHẤT (Antigravity level)
- **Adapter** sẽ CONDENSED nội dung theo tool:
  - Antigravity/Codex: 100% detail
  - Claude Code: ~70% detail (rules gom, giữ examples)
  - Cursor: ~50% detail (rules ngắn gọn, bỏ bớt examples)
  - Copilot: ~30% detail (bullets only, key rules)

### Giữ Antigravity là source of truth
Khi cần update rules/workflows trong tương lai:
1. Sửa trong `templates/content/` (hoặc `templates/workflows/antigravity/`)
2. Chạy adapter script để re-generate cho tools khác
3. KHÔNG sửa trực tiếp files của claude/cursor/copilot
