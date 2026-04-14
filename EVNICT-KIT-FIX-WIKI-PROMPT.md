# EVNICT-KIT — Fix Wiki Integration
# Thay thế bundled wiki template bằng real llm-wiki

---

## VẤN ĐỀ NGHIÊM TRỌNG

Bundled wiki template trong `templates/wiki/` là **hoàn toàn sai** so với repo thật https://github.com/mduongvandinh/llm-wiki:

- Có `package.json` + `scripts/ingest.js` giả — real llm-wiki KHÔNG DÙNG Node.js
- Real llm-wiki dùng **AI Agent** (Claude Code/Antigravity) làm engine — Agent đọc SKILL.md → thực thi ingest/query/discover
- Thiếu hoàn toàn: CLAUDE.md, AGENTS.md, wiki/ folder, .discoveries/, outputs/, wiki-viewer.html, skills/

---

## THAY ĐỔI 1: Thay thế templates/wiki/

### Xóa toàn bộ templates/wiki/ cũ

### Tạo templates/wiki/ mới — copy từ real llm-wiki

```
templates/wiki/
├── .gitignore                    ← Copy từ real repo
├── CLAUDE.md                     ← Schema & quy tắc (CỰC QUAN TRỌNG)
├── AGENTS.md                     ← Copy từ real repo  
├── README.md                     ← Copy từ real repo
├── FAQ.md                        ← Copy từ real repo
├── config.example.yaml           ← Copy từ real repo (ĐẦY ĐỦ — topics, feeds, discovery, schedule)
├── wiki-viewer.html              ← Copy từ real repo
├── scripts/
│   ├── run-wiki.sh               ← Copy từ real repo
│   └── setup-scheduler.ps1       ← Copy từ real repo
├── skills/
│   └── llm-wiki/
│       └── SKILL.md              ← Copy từ real repo (250+ dòng)
├── wiki/
│   ├── INDEX.md                  ← Template trống
│   ├── INDEX.template.md         ← Template
│   ├── LOG.md                    ← Template trống
│   └── LOG.template.md           ← Template
├── raw/
│   ├── articles/                 ← Trống (user thêm sau)
│   ├── papers/
│   ├── notes/
│   ├── media/
│   └── assets/
├── .discoveries/
│   ├── feeds.json                ← "[]"
│   ├── gaps.json                 ← "[]"
│   └── history.json              ← "[]"
└── outputs/                      ← Trống
```

**KHÔNG có package.json — llm-wiki KHÔNG phải Node.js project.**

### Config customization khi init

Khi CLI deploy wiki, cần customize `config.example.yaml` → `config.yaml`:
- Thay `wiki.name` → tên dự án
- Thay `wiki.description` → mô tả dự án
- Thay `topics` → theo tech stack dự án (VD: Java Spring Boot + Angular)
- Giữ nguyên structure: feeds, schedule, discovery

```javascript
// Trong init.js, khi copy wiki:
let config = readFileSync(join(wikiSrc, 'config.example.yaml'), 'utf8');
config = config.replace('LLM Wiki', `${projectName} Wiki`);
config = config.replace(
  'Personal knowledge base focused on Java Spring Boot and Angular',
  `Knowledge base cho dự án ${projectName}`
);
// Giữ nguyên topics, feeds, schedule — user tự customize sau
writeFileSync(join(wikiPath, 'config.yaml'), config);
```

---

## THAY ĐỔI 2: Sửa tất cả workflows reference "node scripts/ingest.js"

Real llm-wiki KHÔNG có ingest script. Ingest được thực hiện bởi **AI Agent đọc SKILL.md**.

### Cách ingest ĐÚNG

**Với Antigravity** (đang ở trong wiki repo):
Agent đọc `skills/llm-wiki/SKILL.md` → thực hiện ingest command

**Với Claude Code:**
```bash
cd {wiki_path} && claude --print "/llm-wiki ingest"
```

**Với evnict-kit workflow (đang ở project repo, wiki qua symlink):**
Agent vào wiki folder (qua symlink) → đọc SKILL.md → thực hiện ingest

### Files cần sửa

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-archive-wiki.md`
Thay:
```markdown
## Bước 3: Auto-ingest
cd {wiki_path} && node scripts/ingest.js
```
Bằng:
```markdown
## Bước 3: Trigger ingest
Agent thực hiện ingest bằng cách:
1. Chuyển working directory vào wiki folder (qua symlink): `{project_name}-wiki/`
2. Đọc file `skills/llm-wiki/SKILL.md` trong wiki
3. Thực hiện sub-command INGEST theo hướng dẫn trong SKILL.md:
   - Scan `raw/` → tìm file mới chưa có trong `.discoveries/history.json`
   - Tạo source summary → `wiki/sources/`
   - Trích xuất entities → `wiki/entities/`
   - Trích xuất concepts → `wiki/concepts/`
   - Cập nhật cross-references `[[links]]`
   - Cập nhật `wiki/INDEX.md`
   - Ghi `wiki/LOG.md`
   - Cập nhật `.discoveries/history.json`

⚠️ KHÔNG chạy `node scripts/ingest.js` — file đó KHÔNG TỒN TẠI.
⚠️ KHÔNG chạy `npm run ingest` — llm-wiki KHÔNG phải Node.js project.
```

#### [MODIFY] `templates/skills/evnict-kit-wiki/SKILL.md`
Sửa toàn bộ sub-command INGEST + PUSH:
- Bỏ reference đến `node scripts/ingest.js`
- Bỏ reference đến `npm run ingest`
- Thay bằng: Agent đọc `{wiki_path}/skills/llm-wiki/SKILL.md` → follow ingest procedure
- Push = tạo file trong `raw/notes/` → trigger ingest (Agent tự làm)

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-wiki-archive-feature.md`
Cùng fix: bỏ `node scripts/ingest.js`, thay bằng Agent-driven ingest

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-wiki-scan-project.md`
Cùng fix

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-init-wiki.md`
Sửa setup flow:
```markdown
## Setup Wiki

### Bước 1: Copy wiki template
CLI đã copy template vào `{project_name}-wiki/` khi init.

### Bước 2: Customize config
Mở `{project_name}-wiki/config.yaml`:
- Sửa `wiki.name` → tên dự án
- Sửa `wiki.description` → mô tả
- Thêm topics phù hợp với dự án
- Cấu hình feeds (GitHub repos, Reddit subreddits...)

### Bước 3: Init wiki
Mở AI Agent TRONG thư mục wiki, chạy:
```
/llm-wiki init "{project_name}"
```
Agent sẽ đọc CLAUDE.md + config.yaml → tạo cấu trúc wiki.

### KHÔNG CẦN:
- npm install (không phải Node.js project)
- node scripts/... (không có Node.js scripts)
```

---

## THAY ĐỔI 3: Sửa init.js — deploy wiki đúng

#### [MODIFY] `src/commands/init.js`

Phần wiki deployment:

```javascript
// Bỏ:
// - Copy package.json
// - Nhắc "npm install"

// Thêm:
// 1. Copy toàn bộ real llm-wiki structure
// 2. Tạo raw/ subfolders (articles, papers, notes, media, assets)
// 3. Tạo wiki/ subfolders (entities, concepts, sources, syntheses)  
// 4. Tạo .discoveries/ với empty JSON arrays
// 5. Tạo outputs/ folder
// 6. Customize config.yaml từ config.example.yaml
// 7. KHÔNG tạo package.json
// 8. Nhắc user: "Mở Agent trong wiki folder, chạy /llm-wiki init"
```

Sửa output message:
```javascript
// Bỏ: console.log('💡 Run: cd ${name}-wiki && npm install');
// Thay: console.log('💡 Mở Agent trong ${name}-wiki/, chạy: /llm-wiki init "${name}"');
```

---

## THAY ĐỔI 4: Sửa Claude Code workflows (nếu đã tạo)

Nếu `templates/workflows/claude/` đã có files reference `node scripts/ingest.js` → sửa tương tự.

Claude Code có thể gọi trực tiếp:
```bash
claude --print "/llm-wiki ingest"
```

---

## CHECKLIST

### Wiki template
- [ ] Xóa `templates/wiki/package.json` 
- [ ] Xóa `templates/wiki/scripts/ingest.js`
- [ ] Copy CLAUDE.md từ real llm-wiki
- [ ] Copy AGENTS.md từ real llm-wiki
- [ ] Copy config.example.yaml ĐẦY ĐỦ từ real llm-wiki
- [ ] Copy skills/llm-wiki/SKILL.md từ real llm-wiki
- [ ] Copy wiki-viewer.html từ real llm-wiki
- [ ] Copy scripts/run-wiki.sh + setup-scheduler.ps1
- [ ] Copy .gitignore từ real llm-wiki
- [ ] Tạo wiki/ folder structure (INDEX.md, LOG.md, templates)
- [ ] Tạo raw/ subfolders (articles, papers, notes, media, assets)
- [ ] Tạo .discoveries/ với empty JSON
- [ ] Tạo outputs/ folder

### Workflows + Skills
- [ ] Sửa evnict-kit-archive-wiki.md — bỏ `node scripts/ingest.js`
- [ ] Sửa evnict-kit-wiki/SKILL.md — bỏ Node.js references
- [ ] Sửa evnict-kit-wiki-archive-feature.md — bỏ Node.js
- [ ] Sửa evnict-kit-wiki-scan-project.md — bỏ Node.js
- [ ] Sửa evnict-kit-init-wiki.md — bỏ npm install, thay bằng /llm-wiki init

### CLI
- [ ] Sửa init.js — deploy wiki đúng structure
- [ ] Bỏ "npm install" message
- [ ] Thêm customize config.yaml logic

### Claude workflows (nếu có)
- [ ] Sửa tương tự cho templates/workflows/claude/

---

## LƯU Ý QUAN TRỌNG

### llm-wiki là AI-Agent-Driven
Real llm-wiki hoạt động kiểu:
1. User mở AI Agent (Claude Code / Antigravity) TRONG wiki folder
2. Agent đọc CLAUDE.md (schema) + skills/llm-wiki/SKILL.md (commands)
3. User gõ `/llm-wiki ingest` hoặc `/llm-wiki query "keyword"`
4. Agent thực hiện — đọc raw/, sinh wiki/, cập nhật INDEX.md + LOG.md

KHÔNG CÓ Node.js, KHÔNG CÓ npm, KHÔNG CÓ scripts chạy độc lập.

### Trong evnict-kit workflow
Khi Agent ở project (VD: ncpt-backend-api/) muốn push wiki:
1. Sinh file .md → copy vào `{project_name}-wiki/raw/notes/` (qua symlink)
2. Muốn ingest → Agent đọc `{project_name}-wiki/skills/llm-wiki/SKILL.md` → follow procedure
3. Hoặc nhắc user: "Mở Agent trong wiki folder, chạy /llm-wiki ingest"

### Vì sao có `scripts/run-wiki.sh`?
File này dùng cho **scheduler** (cron/Task Scheduler) — tự động chạy `claude --print "/llm-wiki run"` theo lịch. Đây là cho use case auto-discovery (tìm nguồn mới từ internet), KHÔNG phải cho ingest thông thường.
