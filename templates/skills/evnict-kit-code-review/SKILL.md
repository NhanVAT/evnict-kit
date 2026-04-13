---
name: evnict-kit-code-review
description: Review checklist theo QĐ-TTPM Mục 8.10 — kiểm tra security, logic, quality, vibe coding trước khi merge. 9 hạng mục bắt buộc.
compatibility: All tech stacks
---

# evnict-kit-code-review — Auto Code Review

## Khi nào dùng
- Trước khi merge code vào main/develop
- Review code do AI Agent sinh ra
- Kiểm tra toàn bộ changes trong branch hiện tại

## Input Parameters
- `scope` (optional): all | security | logic | quality (default: all)
- `branch` (optional): Branch cần review (default: current)

---

## Workflow Steps

### Bước 1: Thu thập changes
```bash
git diff --stat main..HEAD        # Files changed
git diff main..HEAD               # Full diff
git log --oneline main..HEAD      # Commits
```

### Bước 2: Chạy 9 hạng mục review (QĐ-TTPM Mục 8.10)

#### ✅ Hạng mục 1: Security — ATTT
Đọc rules `02-evnict-kit-security-rules.md` → scan:
```bash
# SQL Injection
grep -rn "query.*+.*\"" --include="*.java" src/
grep -rn "DSL\.field(.*+\s" --include="*.java" src/

# XSS
grep -rn "\[innerHTML\]" --include="*.html" src/
grep -rn "bypassSecurityTrust" --include="*.ts" src/

# Secrets
grep -rn "password\s*=\s*\"" --include="*.java" --include="*.ts" src/

# Data exposure
grep -rn "ResponseEntity.ok(.*repository" --include="*.java" src/
```

| Check | Pass/Fail | Details |
|-------|-----------|---------|
| No SQL Injection | ✅/❌ | {details} |
| No XSS | ✅/❌ | {details} |
| No hardcoded secrets | ✅/❌ | {details} |
| No data exposure | ✅/❌ | {details} |
| Auth on endpoints | ✅/❌ | {details} |

#### ✅ Hạng mục 2: Logic — Business correctness
- [ ] Business rules implemented correctly (so sánh với spec)
- [ ] Edge cases handled
- [ ] Error handling đầy đủ
- [ ] Null/empty checks

#### ✅ Hạng mục 3: Quality — Code quality
- [ ] Naming conventions tuân thủ
- [ ] No code duplication
- [ ] Methods không quá dài (< 50 lines)
- [ ] Comments cho logic phức tạp
- [ ] No dead code

#### ✅ Hạng mục 4: Tests
- [ ] Unit tests viết cho code mới
- [ ] Tests PASS: `./mvnw test` hoặc `ng test`
- [ ] Coverage đạt target (Service ≥ 80%, Controller ≥ 70%)

#### ✅ Hạng mục 5: Build & Lint
```bash
./mvnw compile && echo "✅ Build OK" || echo "❌ Build FAIL"
./mvnw spotless:check && echo "✅ Lint OK" || echo "❌ Lint FAIL"
```

#### ✅ Hạng mục 6: Vibe Coding Check
- [ ] Không có file thay đổi không liên quan
- [ ] Mỗi commit có message rõ ràng
- [ ] Code có thể giải thích được
- [ ] Không có logic trùng lặp/mâu thuẫn

#### ✅ Hạng mục 7: Database
- [ ] Migration script có rollback
- [ ] Index cho columns thường query
- [ ] Không DROP/TRUNCATE table production

#### ✅ Hạng mục 8: Documentation
- [ ] API mới có description
- [ ] Complex logic có comments
- [ ] Spec updated nếu scope thay đổi

#### ✅ Hạng mục 9: Performance
- [ ] No N+1 query
- [ ] Pagination cho list endpoints
- [ ] File upload có size limit
- [ ] No unbounded loops

### Bước 3: Tạo Review Report

```markdown
## 📋 Code Review Report
### Feature: {feature-name}
### Branch: {branch}
### Date: {date}
### Reviewer: AI Agent

## Summary
| Hạng mục | Status | Issues |
|----------|--------|--------|
| Security | ✅/❌ | {count} |
| Logic | ✅/❌ | {count} |
| Quality | ✅/❌ | {count} |
| Tests | ✅/❌ | {count} |
| Build | ✅/❌ | {count} |
| Vibe Coding | ✅/❌ | {count} |
| Database | ✅/❌ | {count} |
| Documentation | ✅/❌ | {count} |
| Performance | ✅/❌ | {count} |

## ❌ Issues Found
### Issue 1: {title}
- Severity: Critical/High/Medium/Low
- File: {path}
- Line: {line}
- Description: {desc}
- Fix: {suggested fix}

## ✅ Verdict
{APPROVE | REQUEST CHANGES | BLOCK}
{Reason}
```

---

## Error Handling

### BLOCK merge khi:
- Security issue Critical/High → PHẢI fix trước
- Tests FAIL → PHẢI fix
- Build FAIL → PHẢI fix

### REQUEST CHANGES khi:
- Security issue Medium → Fix recommended
- Quality issues → Suggest improvements
- Missing tests → Add tests

---

## Tiêu chí hoàn thành
- [ ] 9 hạng mục đã review
- [ ] Report tạo đầy đủ
- [ ] Critical/High issues → BLOCK
- [ ] Verdict rõ ràng: APPROVE | REQUEST CHANGES | BLOCK
