---
name: evnict-kit-doc-postmortem
description: Tạo tài liệu đặc tả theo QĐ-TTPM Mục 8.9 — ghi lại task, công cụ, prompts, thay đổi, kiểm tra, vấn đề cho mỗi phiên AI.
compatibility: All
---

# evnict-kit-doc-postmortem — Tài Liệu Đặc Tả

## Khi nào dùng
- Sau khi hoàn thành feature/bugfix bằng AI Agent
- Khi thay đổi > 20 dòng code (bắt buộc theo QĐ-TTPM)
- Khi Archive spec

## Input Parameters
- `feature` (bắt buộc): Feature/task name
- `type` (optional): feature | bugfix | hotfix | refactor

---

## Workflow Steps

### Bước 1: Thu thập thông tin
```bash
git log --oneline main..HEAD                  # Commits
git diff --stat main..HEAD                     # Files changed
git diff main..HEAD --shortstat                # Lines changed
```

### Bước 2: Tạo postmortem document
Tạo file `docs/postmortem/{feature}-{date}.md`:

```markdown
# Tài Liệu Đặc Tả: {Feature Name}
## Theo QĐ-TTPM Điều 8, Mục 8.9
## Date: {YYYY-MM-DD}

---

### 1. Nhiệm vụ
- Task: {Mô tả nhiệm vụ giao cho Agent}
- Type: {feature | bugfix | hotfix | refactor}
- Spec: {path to spec file if exists}
- Branch: {branch name}

### 2. Công cụ
- AI Tool: {Antigravity | Claude Code | Cursor}
- Model: {model name}
- Config: {relevant config}

### 3. Prompt chính
{Các prompts quan trọng đã sử dụng — đã clean sensitive data}

> Prompt 1: "{prompt text}"
> Prompt 2: "{prompt text}"

### 4. Thay đổi
| File | Action | Lines Changed | Description |
|------|--------|---------------|-------------|
| {path} | {add/modify/delete} | {+N/-M} | {desc} |

Total: {N} files changed, {X} insertions, {Y} deletions

### 5. Kiểm tra
- [ ] Unit tests: {pass/fail} ({count} tests)
- [ ] Lint: {pass/fail}
- [ ] Build: {pass/fail}
- [ ] Security scan: {pass/fail}
- [ ] Manual test: {description}

### 6. Vấn đề & Lessons Learned
| # | Issue | Resolution | Lesson |
|---|-------|------------|--------|
| 1 | {issue} | {resolution} | {lesson} |

### 7. Commit References
| Hash | Message |
|------|---------|
| {hash} | {message} |
```

### Bước 3: Validate document
- [ ] 7 sections đầy đủ
- [ ] Không chứa secrets/IP nội bộ
- [ ] Prompts đã clean sensitive data
- [ ] File changes chính xác (từ git diff)

---

## Tiêu chí hoàn thành
- [ ] Postmortem file tạo đúng format 7 sections
- [ ] Stored in docs/postmortem/
- [ ] No sensitive data
- [ ] Git refs chính xác
