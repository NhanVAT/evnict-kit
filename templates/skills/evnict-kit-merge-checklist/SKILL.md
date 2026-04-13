---
name: evnict-kit-merge-checklist
description: Pre-merge checklist theo QĐ-TTPM Mục 8.10 — 9 hạng mục kiểm tra bắt buộc trước khi merge vào main/develop.
compatibility: All tech stacks, Git
---

# evnict-kit-merge-checklist — Pre-Merge Checklist

## Khi nào dùng
- Trước MỌI merge request/pull request
- Trước khi merge feature branch vào main/develop

## Input Parameters
- `branch` (optional): Branch cần check (default: current)

---

## Checklist (9 hạng mục)

Thực hiện TỪNG hạng mục. Nếu BẤT KỲ hạng mục nào FAIL → KHÔNG merge.

### 1. ✅ Code compiles / builds
```bash
./mvnw compile      # Java
ng build             # Angular
dotnet build         # .NET
```

### 2. ✅ All tests pass
```bash
./mvnw test          # Java
ng test --watch=false # Angular
dotnet test          # .NET
```

### 3. ✅ Lint / format pass
```bash
./mvnw spotless:check   # Java
ng lint                  # Angular
```

### 4. ✅ No security vulnerabilities
```bash
grep -rn "password\s*=\s*\"" --include="*.java" --include="*.ts" src/
grep -rn "query.*+.*\"" --include="*.java" src/
npm audit              # Frontend
```

### 5. ✅ No hardcoded secrets
```bash
grep -rn "secret\|apiKey\|token.*=.*\"" --include="*.java" --include="*.ts" src/
```

### 6. ✅ Commit messages follow convention
```bash
git log --oneline main..HEAD
# Format: {type}({scope}): {description} [task-{N}]
# Types: feat, fix, refactor, test, docs, chore
```

### 7. ✅ No unnecessary file changes
```bash
git diff --stat main..HEAD
# Verify: chỉ files liên quan đến feature/fix
```

### 8. ✅ Documentation updated
- [ ] API docs updated (nếu có endpoint mới)
- [ ] Spec archived (nếu feature)
- [ ] Postmortem created (nếu > 20 dòng code)

### 9. ✅ Migration scripts have rollback
```bash
find database/migrations -name "*ROLLBACK*"
# Mỗi UP migration PHẢI có ROLLBACK
```

---

## Output Format

```markdown
## 📋 Pre-Merge Checklist
### Branch: {branch} → {target}
### Date: {date}

| # | Hạng mục | Status | Notes |
|---|----------|--------|-------|
| 1 | Build | ✅/❌ | |
| 2 | Tests | ✅/❌ | {count} tests |
| 3 | Lint | ✅/❌ | |
| 4 | Security | ✅/❌ | |
| 5 | Secrets | ✅/❌ | |
| 6 | Commits | ✅/❌ | |
| 7 | Files | ✅/❌ | {count} files |
| 8 | Docs | ✅/❌ | |
| 9 | Migration | ✅/❌ | |

## Verdict: {PASS | FAIL}
{Nếu FAIL: danh sách items cần fix}
```

---

## Tiêu chí hoàn thành
- [ ] 9 hạng mục đã check
- [ ] Tất cả PASS → merge OK
- [ ] Bất kỳ FAIL → KHÔNG merge, fix trước
