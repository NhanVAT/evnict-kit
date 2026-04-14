---
name: evnict-kit-onboard
description: Onboard thành viên mới — tóm tắt project, architecture, conventions, commands, workflow. Giúp member mới nắm bắt dự án nhanh chóng.
compatibility: All tech stacks
---

# evnict-kit-onboard — Onboard Member Mới

## Khi nào dùng
- Member mới tham gia dự án
- Developer chuyển sang module mới
- Cần tóm tắt toàn cảnh dự án

## Input Parameters
- `role` (optional): backend | frontend | fullstack (default: fullstack)
- `module` (optional): Module cần focus

---

## Workflow Steps

### Bước 1: Thu thập thông tin dự án
1. Đọc `.evnict/config.yaml` → project info
2. Đọc `AGENTS.md` hoặc context file → architecture overview
3. Đọc rules `05-evnict-kit-project-conventions.md` → conventions
4. Đọc wiki → domain knowledge
5. Scan codebase → project structure

### Bước 2: Sinh Onboarding Guide

```markdown
# 🚀 Onboarding: {Project Name}
## Date: {YYYY-MM-DD}
## Role: {backend | frontend | fullstack}

---

## 1. Tổng quan dự án
- **Tên dự án**: {name}
- **Mô tả**: {description}
- **Tech stack**: {tech stack}
- **Database**: {database}
- **Team size**: {estimate from git log}

## 2. Architecture
{ASCII architecture diagram from AGENTS.md}

### Layers
- Controller → Service → Repository → Database
- Frontend: Component → Service → API

### Key Modules
| Module | Mô tả | Owner |
|--------|--------|-------|
| {module} | {desc} | {from git blame} |

## 3. Project Structure
{tree -L 3 output}

## 4. Development Environment

### Prerequisites
- JDK {version}
- Node.js {version}
- Oracle/SQL Server client
- IDE: Any (recommend Antigravity/VS Code)

### Setup
```bash
# Clone
git clone {repo-url}

# Backend
cd {be-folder}
./mvnw clean install

# Frontend
cd {fe-folder}
ng serve
```

### Environment Variables
```
DB_HOST=localhost
DB_PORT=1521
DB_NAME={name}
JWT_KEY_PATH=path/to/key
```

## 5. Coding Conventions (tóm tắt)
{Các conventions quan trọng nhất từ rules}

- Naming: {pattern}
- API: {pattern}
- Commit message: {type}({scope}): {description}

## 6. Development Workflow
1. Nhận task → đọc spec
2. Tạo branch: `feature/{task-slug}`
3. Code theo TDD: Red → Green → Refactor
4. Commit thường xuyên
5. Chạy test + lint trước merge
6. Tạo merge request → review

## 7. AI Agent Commands
| Command | Mô tả |
|---------|--------|
| `/evnict-kit:init-rules` | Khởi tạo project conventions |
| `/evnict-kit:feature-large` | Phát triển feature lớn |
| `/evnict-kit:feature-small` | Feature nhỏ nhanh |
| `/evnict-kit:bug-fix` | Quy trình sửa lỗi |
| `/evnict-kit:review` | Auto review code |

## 8. Important Links
- Repository: {repo-url}
- CI/CD: {azure-devops-url}
- Wiki: {wiki-path}
- Specs: `.evnict/specs/`

## 9. Security Reminders (QĐ-TTPM)
- ❌ KHÔNG hardcode secrets
- ❌ KHÔNG git push (Agent không push)
- ❌ KHÔNG log PII
- ✅ Test trước khi commit
- ✅ Checkpoint trước phiên AI
```

### Bước 3: Module-specific onboarding (nếu có module)
Nếu user chỉ định module:
1. Đọc code module → list files, components, services
2. Đọc tests → hiểu business logic
3. Đọc specs liên quan trong `.evnict/specs/`
4. Tạo module-specific guide

---

## Tiêu chí hoàn thành
- [ ] Onboarding guide tạo đầy đủ
- [ ] Architecture diagram included
- [ ] Convention summary included
- [ ] Setup instructions verified
- [ ] AI commands listed
