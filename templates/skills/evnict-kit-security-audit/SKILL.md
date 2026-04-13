---
name: evnict-kit-security-audit
description: Security audit toàn diện — dependency scan → code scan ATTT01-08 → configuration review → report. Đánh giá ATTT cho module hoặc toàn bộ dự án.
compatibility: Java Spring Boot, Angular, ASP.NET Core
---

# evnict-kit-security-audit — Security Audit

## Khi nào dùng
- Trước khi release version mới
- Review module mới trước khi merge
- Kiểm tra định kỳ ATTT (theo QĐ-TTPM)

## Input Parameters
- `scope` (optional): all | module (default: all)
- `module` (optional): Tên module cụ thể nếu scope=module
- `report_path` (optional): Đường dẫn lưu report

---

## Workflow Steps

### Bước 1: Dependency Scan

#### Java (Maven)
```bash
./mvnw org.owasp:dependency-check-maven:check
./mvnw versions:display-dependency-updates
```

#### Node.js (Angular/React)
```bash
npm audit
npm audit --json > audit-report.json
```

#### .NET
```bash
dotnet list package --vulnerable
```

Ghi nhận kết quả:
| Dependency | CVE | Severity | Fix Available |
|-----------|-----|----------|---------------|
| {lib} | {CVE-xxx} | {Critical/High/Medium/Low} | {Yes/No} |

### Bước 2: Code Scan — ATTT01-ATTT08

Chạy TOÀN BỘ scan commands từ `02-evnict-kit-security-rules.md`:

```bash
# ATTT01: SQL Injection
grep -rn "query.*+.*\"" --include="*.java" src/
grep -rn "createNativeQuery.*+\s" --include="*.java" src/
grep -rn "DSL\.field(.*+\s" --include="*.java" src/
grep -rn "DSL\.condition(.*+\s" --include="*.java" src/

# ATTT02: XSS
grep -rn "\[innerHTML\]" --include="*.html" src/
grep -rn "bypassSecurityTrust" --include="*.ts" src/
grep -rn "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx" src/

# ATTT04: JWT
grep -rn "HS256\|alg.*none\|secret.*=\"" --include="*.java" src/
grep -rn "parse.*Unsafe\|without.*verification" --include="*.java" src/

# ATTT07: Data Exposure
grep -rn "ResponseEntity.ok(.*repository\|ResponseEntity.ok(.*entity" --include="*.java" src/
grep -rn "printStackTrace\|getStackTrace" --include="*.java" src/

# R01: Secrets
grep -rn "password\s*=\s*\"" --include="*.java" --include="*.ts" --include="*.yml" src/
grep -rn "apiKey\s*=\s*\"" --include="*.java" --include="*.ts" src/
grep -rn "secret\s*=\s*\"" --include="*.java" --include="*.ts" src/

# R04: PII in logs
grep -rn "log\.\(info\|debug\|warn\|error\).*password\|log\.\(info\|debug\|warn\|error\).*token" --include="*.java" src/
```

### Bước 3: Configuration Review

#### Kiểm tra Security Config
```bash
find src -name "SecurityConfig*.java" -o -name "WebSecurityConfig*.java" | head -5
```

Verify:
- [ ] CSRF configured (hoặc disabled với JWT justification)
- [ ] CORS configured properly (không wildcard `*` cho production)
- [ ] CSP headers set
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Strict-Transport-Security set

#### Kiểm tra .gitignore
```bash
cat .gitignore
```
Verify chặn: `.env`, `*.key`, `*.pem`, `application-prod.yml`

#### Kiểm tra endpoints public
```bash
grep -rn "permitAll\|anonymous" --include="*.java" src/
```
Verify: chỉ login, refresh, health endpoint là public

### Bước 4: Tạo Security Report

```markdown
# 🔒 Security Audit Report
## Project: {project-name}
## Date: {YYYY-MM-DD}
## Scope: {all | module: {name}}
## Auditor: AI Agent

---

## Executive Summary
| Category | Issues Found | Critical | High | Medium | Low |
|----------|-------------|----------|------|--------|-----|
| Dependencies | {N} | {n} | {n} | {n} | {n} |
| Code (ATTT) | {N} | {n} | {n} | {n} | {n} |
| Configuration | {N} | {n} | {n} | {n} | {n} |
| **Total** | **{N}** | **{n}** | **{n}** | **{n}** | **{n}** |

## Verdict: {PASS | FAIL | NEEDS ATTENTION}

---

## 1. Dependency Vulnerabilities
{Table of CVEs found}

## 2. Code Vulnerabilities
### ATTT01 — SQL Injection: {PASS/FAIL}
{Details}

### ATTT02 — XSS: {PASS/FAIL}
{Details}

### ATTT03 — CSRF: {PASS/FAIL}
{Details}

### ATTT04 — JWT Security: {PASS/FAIL}
{Details}

### ATTT05 — Dependencies: {PASS/FAIL}
{Details}

### ATTT06 — File Upload: {PASS/FAIL}
{Details}

### ATTT07 — Data Exposure: {PASS/FAIL}
{Details}

### ATTT08 — OWASP Top 10: {PASS/FAIL}
{Details}

## 3. Configuration Issues
{List of config issues}

## 4. Recommendations
| # | Priority | Action | Effort |
|---|----------|--------|--------|
| 1 | {P} | {action} | {estimate} |

## 5. Sign-off
- Reviewed by: AI Agent
- Date: {date}
- Next audit: {recommended date}
```

Lưu report vào: `docs/attt/security-audit-{date}.md`

---

## Error Handling

### FAIL audit khi:
- Critical CVE chưa patch → BLOCK deployment
- SQL Injection found → BLOCK + fix ngay
- Hardcoded secrets found → BLOCK + rotate secrets

---

## Tiêu chí hoàn thành
- [ ] Dependency scan completed
- [ ] Code scan ATTT01-08 completed
- [ ] Configuration reviewed
- [ ] Report created với verdict
- [ ] Critical/High issues escalated
