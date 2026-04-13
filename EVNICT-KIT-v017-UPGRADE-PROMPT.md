# EVNICT-KIT v0.1.7 — Upgrade Prompt
# Wiki Scan: Bổ sung nghiệp vụ (giữ nguyên kỹ thuật)

---

## THAY ĐỔI DUY NHẤT

### Vấn đề
`/evnict-kit:wiki-scan-project` sinh wiki notes đủ kỹ thuật nhưng **thiếu nghiệp vụ**. Cần BỔ SUNG phần nghiệp vụ, KHÔNG BỎ phần kỹ thuật hiện có.

### Giải pháp: 50% Nghiệp vụ + 50% Kỹ thuật

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-wiki-scan-project.md`

**Bước 4 (Sinh wiki notes)** — Sửa template note, THÊM sections nghiệp vụ lên trước, GIỮ NGUYÊN sections kỹ thuật:

```markdown
---
title: "Module {module_name}"
discovered: {YYYY-MM-DD}
topic: "{project_name}"
tags: [{module, project_type, tech_stack}]
source: "evnict-kit-scan"
type: module
---

# ═══ PHẦN NGHIỆP VỤ (BỔ SUNG MỚI) ═══

## Mục đích chức năng
{Chức năng này giải quyết vấn đề gì cho user? — 3-5 câu}
{Agent ĐỌC code (controller methods, service logic) rồi SUY RA mục đích}

## Đối tượng sử dụng
{Ai dùng? Role nào? Quyền gì?}
{Suy ra từ: auth annotations, data authorization logic, role checks}

## Nghiệp vụ chính
{Mô tả TỪNG thao tác user có thể làm — nhập, sửa, xóa, tìm, xuất...}
{Suy ra từ: controller endpoints + service methods}

### Nhập/Thêm mới
- {Mô tả hành vi, fields cần nhập, ràng buộc}

### Danh sách/Tìm kiếm
- {Mô tả filters, phân trang, sort}

### Sửa/Cập nhật
- {Mô tả}

### Xóa
- {Mô tả, confirm logic}

## Quy tắc nghiệp vụ
| Mã | Quy tắc |
|----|---------|
| BR01 | {Suy ra từ validation logic trong service/controller} |
| BR02 | {Suy ra từ unique constraints, foreign keys} |
| BR03 | {Suy ra từ authorization checks} |

## Liên kết chức năng
{Module này liên quan đến module nào khác?}
{Suy ra từ: foreign keys, service dependencies, shared DTOs}
- **{Module A}**: {mô tả liên kết — VD: dropdown lấy từ danh mục đơn vị}
- **{Module B}**: {mô tả liên kết}

# ═══ PHẦN KỸ THUẬT (GIỮ NGUYÊN NHƯ CŨ) ═══

## API Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| {method} | {path} | {description từ annotation/comment} |

## Database Tables
{Tables sử dụng trong Repository/DAO}

## Services
{List services + public methods}

## Components (nếu FE)
| Component | Route | Mô tả |
|-----------|-------|-------|
| {name} | {route} | {description} |

## Files
{List all files thuộc module}
```

**Thêm hướng dẫn cho Agent** — section mới trong workflow:

```markdown
## Hướng dẫn viết phần Nghiệp vụ

Agent PHẢI đọc code rồi SUY RA nghiệp vụ, KHÔNG chỉ liệt kê code:

| Đọc code | Suy ra nghiệp vụ |
|----------|-------------------|
| Controller có POST /save + validation | → "Nhập mới: cần điền fields X, Y, Z. Validate: X bắt buộc, Y <= today" |
| Service check duplicate(dept+profile+date) | → "BR01: Không nhập trùng bộ key (Đơn vị + Profile + Ngày)" |
| Repository query filter by departmentId | → "Danh sách: lọc theo đơn vị" |
| Auth annotation @PreAuthorize | → "Phân quyền: chỉ role ADMIN được xóa" |
| FK đến bảng LRS_DEPARTMENT | → "Liên kết: dropdown chọn đơn vị từ danh mục" |
| Service gọi ExternalAPI (CMIS) | → "Tích hợp: upload file qua hệ thống CMIS" |

Mục tiêu: người đọc wiki note HIỂU ĐƯỢC chức năng làm gì MÀ KHÔNG CẦN đọc code.
Phần kỹ thuật bên dưới để Agent AI tra cứu khi cần implement.
```

---

#### [MODIFY] `templates/skills/evnict-kit-wiki/SKILL.md`

Trong sub-command SCAN-CODE, thêm note:
```markdown
### Bổ sung nghiệp vụ khi scan
Khi scan code và sinh wiki note:
1. ĐỌC code để HIỂU nghiệp vụ — suy ra "user có thể làm gì"
2. Từ validation rules → suy ra business rules (BR01, BR02...)
3. Từ foreign keys → suy ra liên kết chức năng
4. Từ auth checks → suy ra phân quyền
5. Đặt phần nghiệp vụ LÊN TRƯỚC, phần kỹ thuật SAU
6. Tỷ lệ: 50% nghiệp vụ + 50% kỹ thuật
```

#### [MODIFY] `templates/workflows/antigravity/evnict-kit-wiki-archive-feature.md`

Cùng nguyên tắc: note template thêm sections nghiệp vụ lên trước, giữ kỹ thuật sau.

---

## CHECKLIST

- [ ] Sửa `evnict-kit-wiki-scan-project.md` — thêm 6 sections nghiệp vụ lên trước
- [ ] Sửa `evnict-kit-wiki/SKILL.md` — scan-code bổ sung hướng dẫn suy ra nghiệp vụ
- [ ] Sửa `evnict-kit-wiki-archive-feature.md` — cùng template 50/50
- [ ] Version bump → 0.1.7
