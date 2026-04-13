#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const T = join(__dirname, '..', 'templates');
function w(p, c) { const f=join(T,p); mkdirSync(dirname(f),{recursive:true}); writeFileSync(f,c,'utf8'); console.log(`  ✅ ${p}`); }

console.log('🔧 evnict-kit v0.1.2 templates\n');

// ══ RULES COMMON R01-R08 ══
w('rules/common/evnict-kit-R01-no-hardcoded-secrets.md',`---\nid: R01\nname: No Hardcoded Secrets\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# R01: No Hardcoded Secrets\nCấm hardcode API keys, passwords, tokens, connection strings.\nDùng env variables hoặc secret manager.\nGrep: password\\s*=\\s*", secret\\s*=, key\\s*=\\s*", token\\s*=\\s*"\nĐã commit secret → rotate NGAY → thông báo Tech Lead.\n`);
w('rules/common/evnict-kit-R02-no-auto-git-push.md',`---\nid: R02\nname: No Auto Git Push\nseverity: HIGH\nstatus: ACTIVE\n---\n# R02: No Auto Git Push\nAgent KHÔNG git push/force/merge vào protected branch.\nĐược phép: add, commit (feature branch), checkout -b, stash, pull, diff.\n`);
w('rules/common/evnict-kit-R03-no-destructive-ops.md',`---\nid: R03\nname: No Destructive Operations\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# R03: No Destructive Operations\nAgent KHÔNG xóa file/folder, drop DB, chmod mà không có xác nhận user.\n`);
w('rules/common/evnict-kit-R04-no-pii-in-logs.md',`---\nid: R04\nname: No PII in Logs\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# R04: No PII in Logs\nKHÔNG log: password, token, JWT, CMND, SĐT, email, thẻ ngân hàng, data khách hàng EVN.\nLog ID thay vì data.\n`);
w('rules/common/evnict-kit-R05-test-before-commit.md',`---\nid: R05\nname: Test Before Commit\nseverity: HIGH\nstatus: ACTIVE\n---\n# R05: Test Before Commit\nMọi thay đổi PHẢI: linter pass, unit test pass, build OK, không warning mới.\n`);
w('rules/common/evnict-kit-R06-minimal-diff.md',`---\nid: R06\nname: Minimal Diff\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# R06: Minimal Diff — Chống Vibe Coding\nChỉ thay đổi code CẦN THIẾT. Sửa cùng chỗ >3 lần → DỪNG.\n`);
w('rules/common/evnict-kit-R07-no-placeholder-code.md',`---\nid: R07\nname: No Placeholder Code\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# R07: No Placeholder Code\nCấm TODO, FIXME, placeholder. Implement đầy đủ hoặc throw exception.\n`);
w('rules/common/evnict-kit-R08-respect-gitignore.md',`---\nid: R08\nname: Respect .gitignore\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# R08: Respect .gitignore\nKHÔNG tạo/sửa/commit file trong .gitignore.\n`);

// ══ RULES BACKEND RB01-RB06 ══
w('rules/backend/evnict-kit-RB01-input-validation.md',`---\nid: RB01\nname: Input Validation\nseverity: HIGH\nstatus: ACTIVE\n---\n# RB01: Input Validation\nMọi endpoint PHẢI validate input. @Valid + DTO annotations.\n`);
w('rules/backend/evnict-kit-RB02-sql-injection-prevention.md',`---\nid: RB02\nname: SQL Injection Prevention\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# RB02: SQL Injection Prevention\nCẤM nối chuỗi SQL. Dùng parameterized/ORM/JOOQ type-safe.\n`);
w('rules/backend/evnict-kit-RB03-error-handling.md',`---\nid: RB03\nname: Error Handling\nseverity: HIGH\nstatus: ACTIVE\n---\n# RB03: Error Handling\nMọi endpoint có error handling. KHÔNG lộ stack trace.\n`);
w('rules/backend/evnict-kit-RB04-migration-only.md',`---\nid: RB04\nname: Migration Only\nseverity: HIGH\nstatus: ACTIVE\n---\n# RB04: Migration Only\nThay đổi DB schema PHẢI qua migration. Naming: V{YYYYMMDD}_{SEQ}__{desc}.sql\n`);
w('rules/backend/evnict-kit-RB05-auth-on-every-route.md',`---\nid: RB05\nname: Auth on Every Route\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# RB05: Auth on Every Route\nMọi endpoint MỚI PHẢI có auth + authorization.\n`);
w('rules/backend/evnict-kit-RB06-rate-limiting.md',`---\nid: RB06\nname: Rate Limiting\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# RB06: Rate Limiting\nEndpoint public/heavy PHẢI xem xét rate limiting.\n`);

// ══ RULES FRONTEND RF01-RF06 ══
w('rules/frontend/evnict-kit-RF01-no-inline-styles.md',`---\nid: RF01\nname: No Inline Styles\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# RF01: No Inline Styles\nCấm inline CSS. Dùng class.\n`);
w('rules/frontend/evnict-kit-RF02-component-reuse.md',`---\nid: RF02\nname: Component Reuse\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# RF02: Component Reuse\nCheck component có sẵn trước khi tạo mới.\n`);
w('rules/frontend/evnict-kit-RF03-no-hardcoded-text.md',`---\nid: RF03\nname: No Hardcoded Text\nseverity: LOW\nstatus: ACTIVE\n---\n# RF03: No Hardcoded Text\nCó i18n → dùng translation keys. Không → constants file.\n`);
w('rules/frontend/evnict-kit-RF04-accessibility.md',`---\nid: RF04\nname: Accessibility\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# RF04: Accessibility\nimg→alt, button→aria-label, input→label, semantic HTML.\n`);
w('rules/frontend/evnict-kit-RF05-no-direct-dom.md',`---\nid: RF05\nname: No Direct DOM\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# RF05: No Direct DOM\nCẤM document.getElementById. Dùng ViewChild/refs.\n`);
w('rules/frontend/evnict-kit-RF06-responsive-design.md',`---\nid: RF06\nname: Responsive Design\nseverity: MEDIUM\nstatus: ACTIVE\n---\n# RF06: Responsive\nĐúng trên mobile(<768), tablet(768-1024), desktop(>1024).\n`);

// ══ RULES SECURITY ATTT01-08 ══
w('rules/security/evnict-kit-ATTT01-sql-injection.md',`---\nid: ATTT01\nname: SQL Injection Deep Scan\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# ATTT01: SQL Injection Scan\ngrep -rn "query.*+.*\\"\\|createNativeQuery.*+\\|DSL.field(.*+" --include="*.java" src/\n`);
w('rules/security/evnict-kit-ATTT02-xss-prevention.md',`---\nid: ATTT02\nname: XSS Prevention\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# ATTT02: XSS Scan\ngrep -rn "innerHTML\\|bypassSecurityTrust\\|dangerouslySetInnerHTML" src/\n`);
w('rules/security/evnict-kit-ATTT03-csrf-protection.md',`---\nid: ATTT03\nseverity: HIGH\nstatus: ACTIVE\n---\n# ATTT03: CSRF Protection\nPOST/PUT/DELETE PHẢI có CSRF token hoặc SameSite cookie.\n`);
w('rules/security/evnict-kit-ATTT04-jwt-security.md',`---\nid: ATTT04\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# ATTT04: JWT Security\nRS256/RS512, key≥2048, exp≤24h, refresh rotation, no sensitive data in payload.\n`);
w('rules/security/evnict-kit-ATTT05-dependency-cve.md',`---\nid: ATTT05\nseverity: HIGH\nstatus: ACTIVE\n---\n# ATTT05: Dependency CVE\nJava: mvnw dependency-check | Node: npm audit | .NET: dotnet list --vulnerable\nCritical→24h | High→sprint | Medium→next sprint\n`);
w('rules/security/evnict-kit-ATTT06-file-upload.md',`---\nid: ATTT06\nseverity: HIGH\nstatus: ACTIVE\n---\n# ATTT06: File Upload Security\nValidate ext+MIME+magic bytes+size. UUID rename. Lưu MinIO/S3 ngoài web root.\n`);
w('rules/security/evnict-kit-ATTT07-data-exposure.md',`---\nid: ATTT07\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# ATTT07: Data Exposure\nDùng DTO—KHÔNG return Entity. Error: message chung, KHÔNG stack trace.\n`);
w('rules/security/evnict-kit-ATTT08-owasp-top10.md',`---\nid: ATTT08\nseverity: CRITICAL\nstatus: ACTIVE\n---\n# ATTT08: OWASP Top 10 Checklist\nA01 Access→RB05 | A02 Crypto→ATTT04 | A03 Inject→RB02 | A04 Design→ATTT06\nA05 Config→R01 | A06 Components→ATTT05 | A07 Auth→RB05 | A08 Integrity→RB04\nA09 Logging→R04 | A10 SSRF\n`);

// ══ RULES DYNAMIC (CHƯA KHỞI TẠO) ══
const PH=`⚠️ CHƯA ĐƯỢC KHỞI TẠO — chạy /evnict-kit:init-rules để AI Agent điền nội dung`;
w('rules/project/evnict-kit-RP01-naming-convention.md',`---\nid: RP01\nname: Naming Convention\nstatus: CHƯA_KHỞI_TẠO\n---\n# RP01: Naming Convention\n${PH}\n## Sẽ chứa: class, method, variable, file, package, branch, commit, DB table/column naming\n`);
w('rules/project/evnict-kit-RP02-architecture-pattern.md',`---\nid: RP02\nname: Architecture Pattern\nstatus: CHƯA_KHỞI_TẠO\n---\n# RP02: Architecture\n${PH}\n## Sẽ chứa: kiến trúc tổng thể, package structure, dependency flow, decisions\n`);
w('rules/project/evnict-kit-RP03-coding-convention.md',`---\nid: RP03\nname: Coding Convention\nstatus: CHƯA_KHỞI_TẠO\n---\n# RP03: Coding Convention\n${PH}\n## Sẽ chứa: code style, import order, error handling, logging, DTO patterns\n`);
w('rules/project/evnict-kit-RP04-api-convention.md',`---\nid: RP04\nname: API Convention\nstatus: CHƯA_KHỞI_TẠO\n---\n# RP04: API Convention\n${PH}\n## Sẽ chứa: REST URL, request/response format, pagination, error format\n`);
w('rules/project/evnict-kit-RP05-database-convention.md',`---\nid: RP05\nname: Database Convention\nstatus: CHƯA_KHỞI_TẠO\n---\n# RP05: Database Convention\n${PH}\n## Sẽ chứa: table/column naming, ORM/JOOQ patterns, FK naming\n`);
w('rules/project/evnict-kit-RP06-component-convention.md',`---\nid: RP06\nname: Component Convention\nstatus: CHƯA_KHỞI_TẠO\n---\n# RP06: Component Convention\n${PH}\n## Sẽ chứa: component structure, state management, form handling, UI library\n`);
w('rules/project/evnict-kit-RP07-integration-map.md',`---\nid: RP07\nname: Integration Map\nstatus: CHƯA_KHỞI_TẠO\n---\n# RP07: Integration Map\n${PH}\n## Sẽ chứa: external services, API clients, message queues, scheduled jobs\n`);

w('rules/INDEX.md',`# EVNICT-KIT Rules Index v0.1.2\n## Static (28): R01-R08, RB01-RB06, RF01-RF06, ATTT01-ATTT08\n## Dynamic (7): RP01-RP07 — chạy /evnict-kit:init-rules để khởi tạo\n`);

console.log('✅ Rules done\n');

// ══ SKILLS (20 files) ══
const skills = [
['evnict-kit-create-api-endpoint','Tạo API endpoint chuẩn — validation, auth, error handling, test','backend'],
['evnict-kit-create-component','Tạo UI component — check reuse, props, styling, test, a11y','frontend'],
['evnict-kit-create-page','Tạo page/màn hình — routing, layout, responsive, loading states','frontend'],
['evnict-kit-database-migration','Tạo migration an toàn — V{date}_{seq}__{desc}.sql + rollback','backend'],
['evnict-kit-write-tests','Viết test TDD — Red→Green→Refactor, unit + integration','both'],
['evnict-kit-code-review','Code review checklist — security, logic, quality, vibe coding','both'],
['evnict-kit-bug-fix','Sửa bug — reproduce, root cause, TDD fix, regression test','both'],
['evnict-kit-fix-business-logic','Fix lỗi nghiệp vụ — verify business rules, test scenarios','both'],
['evnict-kit-security-audit','Security audit OWASP Top 10, dependency scan','both'],
['evnict-kit-fix-attt','Fix lỗi ATTT — classify, hotfix, OWASP fix, security review','both'],
['evnict-kit-checkpoint','Checkpoint & rollback plan trước khi dùng AI (QĐ Mục 8.8)','both'],
['evnict-kit-doc-postmortem','Tài liệu đặc tả sau AI session (QĐ Mục 8.9)','both'],
['evnict-kit-merge-checklist','Pre-merge checklist (QĐ Mục 8.10)','both'],
['evnict-kit-prompt-standard','Chuẩn viết prompt cho AI Agent (QĐ Mục 8.5)','both'],
['evnict-kit-onboard','Onboarding member mới — tóm tắt project từ wiki+context','both'],
['evnict-kit-wiki','Push/Query tri thức LLM Wiki — không cần mở wiki repo','both'],
['evnict-kit-spec','Tạo spec SDD — specify+clarify, propose plan','both'],
['evnict-kit-tdd','TDD per subtask — test→implement→verify, 3-strike rule','both'],
['evnict-kit-coordinate','FE↔BE coordination qua handoff files + API contracts','both'],
['evnict-kit-review-auto','Auto review trước merge — check rules, ATTT, conventions','both'],
];
for(const [name,desc,scope] of skills){
  w(`skills/${name}/SKILL.md`,`---\nname: ${name}\ndescription: ${desc}\nscope: ${scope}\n---\n# ${name}\n${desc}\n`);
}
console.log(`✅ Skills: ${skills.length}\n`);

// ══ WORKFLOWS (10 files) ══
const workflows = [
['init/evnict-kit-init-rules','evnict-kit:init-rules','Agent đọc code, điền rules động RP01-RP07'],
['init/evnict-kit-init-context','evnict-kit:init-context','Agent sinh context file từ rules đã khởi tạo'],
['init/evnict-kit-init-check','evnict-kit:init-check','Sinh demo code để verify conventions'],
['work/evnict-kit-feature-large','evnict-kit:feature-large','Feature lớn: spec→plan→TDD→archive'],
['work/evnict-kit-feature-small','evnict-kit:feature-small','Feature nhỏ: wiki query→plan→TDD→archive'],
['work/evnict-kit-bug-fix','evnict-kit:bug-fix','Bug fix: wiki→analyze→TDD fix→archive'],
['work/evnict-kit-attt','evnict-kit:attt','ATTT scan/check module'],
['work/evnict-kit-implement','evnict-kit:implement','Thực thi tasks TDD, FE↔BE coordination'],
['work/evnict-kit-archive-wiki','evnict-kit:archive-wiki','Push wiki + archive spec + postmortem'],
['work/evnict-kit-review','evnict-kit:review','Auto review: rules + ATTT + conventions'],
];
for(const [path,trigger,desc] of workflows){
  w(`workflows/${path}.md`,`---\nname: ${trigger}\ntype: workflow-command\ndescription: ${desc}\ntrigger: /${trigger}\n---\n# /${trigger}\n${desc}\n`);
}
console.log(`✅ Workflows: ${workflows.length}\n`);

// ══ CONTEXT TEMPLATES ══
w('context/AGENT.md.template',`# {{PROJECT_NAME}} — AI Agent Context\n# Generated by evnict-kit v0.1.2\n## Overview: {{TECH_STACK}} | {{DATABASE}}\n## Structure: <!-- CHƯA KHỞI TẠO -->\n## Commands: <!-- CHƯA KHỞI TẠO -->\n## Conventions: → rules/project/RP03\n## Architecture: → rules/project/RP02\n## Security: → rules/ (R01,RB02,RB05,ATTT01-08)\n## Safety: ❌ git push | ❌ xóa file | ❌ secrets | ❌ log PII\n`);
w('context/CLAUDE.md.template',`# {{PROJECT_NAME}} — Claude Code\n# Generated by evnict-kit v0.1.2\n## {{TECH_STACK}} | {{DATABASE}}\n## Rules: .claude/rules/ | ❌ push ❌ secrets ❌ PII\n<!-- CHƯA KHỞI TẠO — /evnict-kit:init-context -->\n`);
w('context/cursorrules.template',`# {{PROJECT_NAME}} | {{TECH_STACK}} | evnict-kit v0.1.2\n# Rules: .cursor/rules/ | ❌ push ❌ secrets ❌ PII\n<!-- CHƯA KHỞI TẠO -->\n`);

// ══ INSTRUCT TEMPLATES ══
w('instruct/Instruct-Agent-AI.be.md',`# Instruct-Agent-AI.md — Backend\n# Project: {{PROJECT_NAME}} | Tech: {{TECH_STACK}} | DB: {{DATABASE}}\n\n## Khi nhận /evnict-kit:init-rules:\n### Task 1: Scan structure → tree -L 3\n### Task 2: Naming → cập nhật RP01 → ACTIVE\n### Task 3: Architecture → cập nhật RP02 → ACTIVE\n### Task 4: Coding convention → cập nhật RP03 → ACTIVE\n### Task 5: API convention → cập nhật RP04 → ACTIVE\n### Task 6: Database convention → cập nhật RP05 → ACTIVE\n### Task 7: Integrations → cập nhật RP07 → ACTIVE\n### Task 8: Summary → {{AGENT_DIR}}/context/init-summary-backend.md\n\n## Bảo mật: KHÔNG ghi secrets, IP nội bộ, URLs production\n`);
w('instruct/Instruct-Agent-AI.fe.md',`# Instruct-Agent-AI.md — Frontend\n# Project: {{PROJECT_NAME}} | Tech: {{TECH_STACK}}\n\n## Khi nhận /evnict-kit:init-rules:\n### Task 1: Scan structure\n### Task 2: Naming → RP01 → ACTIVE\n### Task 3: Architecture → RP02 → ACTIVE\n### Task 4: Coding convention → RP03 → ACTIVE\n### Task 5: Component convention → RP06 → ACTIVE\n### Task 6: Integrations → RP07 → ACTIVE\n### Task 7: Summary → {{AGENT_DIR}}/context/init-summary-frontend.md\n`);

console.log('═══════════════════════════════════════');
console.log('  🎉 v0.1.2 complete!');
console.log(`  Rules: 36 | Skills: ${skills.length} | Workflows: ${workflows.length}`);
console.log('═══════════════════════════════════════\n');
