# ATTT — An Toàn Thông Tin
**Command:** `/evnict-kit:attt $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Khi nào dùng
- Kiểm tra ATTT định kỳ
- Trước khi release
- Review module mới

## Input
- Mode 1: `/evnict-kit:attt --scan` → Scan toàn bộ project
- Mode 2: `/evnict-kit:attt {module}` → Check module cụ thể

---

## Mode 1: Full Scan (`--scan`)

### Bước 1: Chạy Security Audit
Gọi skill `evnict-kit-security-audit` với scope=all:
1. Dependency scan (CVE)
2. Code scan ATTT01-ATTT08
3. Configuration review
4. Tạo report

### Bước 2: Fix Issues
Với mỗi issue Critical/High → gọi skill `evnict-kit-fix-attt`:
1. Classify severity
2. Tạo hotfix branch
3. Fix theo OWASP guide
4. Test
5. Commit

### Bước 3: Re-scan
Sau khi fix → chạy lại scan → verify 0 Critical/High.

### Bước 4: Report
Lưu report vào `docs/attt/security-audit-{date}.md`

---

## Mode 2: Module Check (`{module}`)

### Bước 1: Scope to module
```bash
# Chỉ scan files trong module
grep -rn "pattern" --include="*.java" src/main/java/com/evn/{project}/{module}/
```

### Bước 2: Run ATTT checks
Chạy scan commands từ `02-evnict-kit-security-rules.md` nhưng chỉ trong module path.

### Bước 3: Quick Report
```markdown
## 🔒 Module ATTT Check: {module}
| ATTT | Status | Details |
|------|--------|---------|
| ATTT01 SQL Injection | ✅/❌ | {details} |
| ATTT02 XSS | ✅/❌ | |
| ATTT03 CSRF | ✅/❌ | |
| ATTT04 JWT | ✅/❌ | |
| ATTT06 Upload | ✅/❌ | |
| ATTT07 Data Exposure | ✅/❌ | |
| Secrets | ✅/❌ | |
| PII Logs | ✅/❌ | |
```

---

## Bước cuối: Wiki Integration (BẮT BUỘC cho ATTT)
ATTT fix **LUÔN** phải push vào wiki (không hỏi user):
```
🔒 ATTT fix → TỰ ĐỘNG push vào wiki...
```
Gọi skill `evnict-kit-wiki` action=push:
- Security vulnerability description
- ATTT category (ATTT01-ATTT08)
- Fix approach + OWASP reference
- Files changed
- Re-scan results

Auto-ingest:
```bash
cd {wiki_path} && Agent follow SKILL.md to ingest
```

> **Lưu ý:** Để nạp tri thức chi tiết hơn, dùng:
> - `/evnict-kit:wiki-archive-feature` — nạp đầy đủ từ spec+plan+code
> - `/evnict-kit:wiki-query "ATTT"` — truy vấn ATTT knowledge trước khi scan

---

---

## ⚠️ NHẮC NHỞ: Tuân thủ Rules & Context

> **Agent dùng lâu có thể quên rules.** Trước khi bắt đầu code, tự kiểm tra:

### Quick Check (agent tự đánh giá)
1. ✅ Tôi đã đọc `.agent/rules/` trong phiên làm việc này chưa?
2. ✅ Tôi đã đọc AGENTS.md (hoặc context file) chưa?
3. ✅ Tôi nhớ rõ coding conventions của dự án này không?

**→ Nếu BẤT KỲ câu nào = "CHƯA" hoặc "KHÔNG CHẮC":**
- Đọc lại tất cả files trong `.agent/rules/` (hoặc thư mục rules tương ứng)
- Đọc lại AGENTS.md (hoặc context file tương ứng)
- Query wiki nếu có: `grep -rl "{keyword}" {wiki_path}/wiki/ --include="*.md"`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.

## Checklist hoàn thành
- [ ] Scan completed (full hoặc module)
- [ ] Critical/High issues fixed
- [ ] Report created
- [ ] Re-scan verified (for full scan)
- [ ] Wiki pushed (BẮT BUỘC cho ATTT fix)
