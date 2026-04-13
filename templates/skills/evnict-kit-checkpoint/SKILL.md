---
name: evnict-kit-checkpoint
description: Checkpoint & Rollback plan theo QĐ-TTPM Mục 8.8 — tạo branch, commit checkpoint, stash, lập rollback plan trước khi AI Agent thực hiện thay đổi.
compatibility: Git 2.x+
---

# evnict-kit-checkpoint — Checkpoint & Rollback

## Khi nào dùng
- TRƯỚC MỖI phiên làm việc với AI Agent
- Trước thay đổi lớn (nhiều file/module)
- Khi cần tạo rollback plan bằng văn bản

## Input Parameters
- `action` (bắt buộc): create | rollback | plan | status
- `description` (optional): Mô tả checkpoint

---

## Workflow Steps

### Action: CREATE — Tạo checkpoint

#### Bước 1: Kiểm tra git status
```bash
git status
git stash list
```

#### Bước 2: Chọn strategy
| Tình huống | Strategy | Command |
|------------|----------|---------|
| Feature mới | Branch mới | `git checkout -b feature/{slug}` |
| Task nhỏ | Commit checkpoint | `git add . && git commit -m "checkpoint: {desc}"` |
| Thử nghiệm | Stash | `git stash push -m "{desc}"` |

#### Bước 3: Tạo checkpoint
```bash
# Option 1: Feature branch (KHUYẾN NGHỊ)
git checkout -b feature/{slug}-{date}

# Option 2: Commit checkpoint
git add .
git commit -m "checkpoint: before {description}"

# Option 3: Stash
git stash push -m "checkpoint: {description}"
```

#### Bước 4: Confirm
```
✅ Checkpoint created
   Strategy: {branch|commit|stash}
   Reference: {branch name | commit hash | stash ref}
   Rollback: git checkout main | git reset HEAD~1 | git stash pop
```

---

### Action: ROLLBACK — Thực hiện rollback

#### Bước 1: Xác định checkpoint
```bash
git log --oneline -5    # Tìm commit checkpoint
git stash list           # Tìm stash
git branch               # Tìm branch
```

#### Bước 2: Rollback
```bash
# Nếu dùng branch → quay về main
git checkout main
git branch -D feature/{slug}

# Nếu dùng commit checkpoint → reset
git reset --hard {checkpoint-hash}

# Nếu dùng stash → pop
git stash pop
```

#### Bước 3: Verify
```bash
git status               # Clean
git log --oneline -3     # Confirm đúng state
```

---

### Action: PLAN — Tạo Rollback Plan (cho thay đổi lớn)

Tạo file `.evnict/rollback-plan-{date}.md`:

```markdown
# Rollback Plan: {feature/task description}
## Date: {YYYY-MM-DD}
## Author: AI Agent

## Scope of Change
- Files affected: {count}
- Modules: {list}
- Database changes: {yes/no}
- Breaking changes: {yes/no}

## Checkpoint
- Type: {branch|commit|stash}
- Reference: {ref}
- Created: {timestamp}

## Rollback Steps
1. `git checkout main` — Quay về main branch
2. `git branch -D feature/{slug}` — Xóa feature branch
3. {Nếu có DB migration} → Chạy rollback script:
   `database/migrations/V{date}_ROLLBACK.sql`
4. {Nếu có config change} → Revert config:
   `git checkout {checkpoint-hash} -- path/to/config`

## Verification After Rollback
- [ ] `git status` clean
- [ ] Build passes: `./mvnw compile`
- [ ] Tests pass: `./mvnw test`
- [ ] Application starts normally

## Risk Assessment
- Impact if rollback needed: {low|medium|high}
- Data loss risk: {none|partial|full}
- Downtime: {none|minutes|hours}
```

---

### Action: STATUS — Kiểm tra checkpoint status

```markdown
## 📋 Checkpoint Status

### Active Checkpoints
| Type | Reference | Description | Date |
|------|-----------|-------------|------|
| branch | feature/xxx | Before auth changes | 2026-04-01 |
| stash | stash@{0} | WIP: customer form | 2026-04-01 |

### Recent Commits
{git log --oneline -5}

### Working Tree
{git status --short}
```

---

## Tiêu chí hoàn thành
- [ ] Checkpoint tạo thành công
- [ ] Rollback plan tạo cho thay đổi lớn
- [ ] Revert trong ≤ 1 thao tác git
- [ ] Verify sau rollback: build + test pass
