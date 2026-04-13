---
name: evnict-kit-fix-attt
description: Fix lỗi ATTT — classify severity → hotfix branch → OWASP fix → scan similar → security review. Theo QĐ-TTPM Điều 8.
compatibility: All tech stacks
---

# evnict-kit-fix-attt — Fix Lỗi An Toàn Thông Tin

## Khi nào dùng
- Phát hiện lỗ hổng bảo mật (SQL Injection, XSS, CSRF, etc.)
- Kết quả OWASP dependency scan có CVE
- Security audit phát hiện vấn đề

## Input Parameters
- `vulnerability` (bắt buộc): Mô tả lỗ hổng
- `severity` (bắt buộc): critical | high | medium | low
- `category` (optional): ATTT01-ATTT08 (auto-detect nếu không chỉ định)

---

## Workflow Steps

### Bước 1: Classify & Escalate
| Severity | Response Time | Action |
|----------|--------------|--------|
| Critical | 24h | Hotfix branch NGAY, deploy ASAP, thông báo Tech Lead + Tổ trưởng ANTT |
| High | Sprint hiện tại | Fix branch, thông báo Tech Lead |
| Medium | Sprint tiếp | Lên kế hoạch, ghi vào backlog |
| Low | Đánh giá | Theo dõi, fix khi có thể |

**Critical/High → Thông báo NGAY:**
```
⚠️ PHÁT HIỆN LỖ HỔNG BẢO MẬT [{severity}]
Category: {ATTT-XX}
Description: {vulnerability}
File(s): {affected files}
→ Cần thông báo Tech Lead + Tổ trưởng ANTT
```

### Bước 2: Tạo hotfix branch
```bash
git checkout -b hotfix/attt-{category}-{date}
```

### Bước 3: Fix theo category

#### ATTT01 — SQL Injection
1. Tìm tất cả string concatenation trong SQL:
```bash
grep -rn "query.*+.*\"" --include="*.java" src/
grep -rn "DSL\.field(.*+\s" --include="*.java" src/
```
2. Thay thế bằng parameterized queries / JOOQ type-safe
3. Whitelist dynamic ORDER BY

#### ATTT02 — XSS
1. Tìm innerHTML và bypass:
```bash
grep -rn "\[innerHTML\]" --include="*.html" src/
grep -rn "bypassSecurityTrust" --include="*.ts" src/
```
2. Thay bằng interpolation hoặc DOMPurify
3. Kiểm tra CSP headers

#### ATTT03 — CSRF
1. Kiểm tra CSRF configuration trong SecurityConfig
2. Verify double-submit cookie hoặc JWT (nếu stateless)

#### ATTT04 — JWT Security
1. Kiểm tra algorithm (PHẢI RS256+, KHÔNG HS256)
2. Kiểm tra key size ≥ 2048
3. Kiểm tra token expiration
4. Kiểm tra refresh token rotation

#### ATTT05 — CVE Dependencies
```bash
./mvnw org.owasp:dependency-check-maven:check
npm audit
```
Fix: upgrade dependency hoặc apply patch

#### ATTT06 — File Upload
1. Kiểm tra extension whitelist
2. Kiểm tra MIME type validation
3. Kiểm tra file size limit
4. UUID rename

#### ATTT07 — Data Exposure
1. Kiểm tra DTO vs Entity return
2. Kiểm tra stack trace exposure
3. Kiểm tra log sensitive data

#### ATTT08 — OWASP Top 10
Tham chiếu bảng trong `02-evnict-kit-security-rules.md`

### Bước 4: Scan Similar — Tìm lỗi tương tự toàn codebase
```bash
# Chạy tất cả scan commands từ security rules
grep -rn "query.*+.*\"" --include="*.java" src/
grep -rn "\[innerHTML\]" --include="*.html" src/
grep -rn "password\s*=\s*\"" --include="*.java" src/
# ... các scan khác
```

### Bước 5: Viết test cho fix
Dùng skill `evnict-kit-tdd`:
- Test case: input injection → PHẢI bị chặn
- Test case: valid input → PHẢI hoạt động bình thường

### Bước 6: Security Review
Dùng skill `evnict-kit-code-review` với scope=security

### Bước 7: Commit + Document
```bash
git add .
git commit -m "fix(security): fix {ATTT-XX} {description} [hotfix]"
```

Tạo postmortem: `docs/attt/{ATTT-XX}-{date}.md`

---

## Tiêu chí hoàn thành
- [ ] Lỗ hổng đã fix
- [ ] Scan similar → không còn lỗi tương tự
- [ ] Tests viết và PASS
- [ ] Security review PASS
- [ ] Postmortem documented
- [ ] Tech Lead + Tổ trưởng ANTT đã thông báo (Critical/High)
