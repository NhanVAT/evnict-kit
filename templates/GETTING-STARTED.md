# EVNICT-KIT — Hướng Dẫn Sử Dụng
> File này được tạo bởi evnict-kit v0.2.1
> Đọc file này để biết dùng workflow nào cho công việc nào

---

## 📋 Danh sách Workflows theo Case Công Việc

### 🚀 Lần đầu setup dự án
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `evnict-kit init` | Chạy ở terminal workspace, tạo cấu trúc |
| 2 | `/evnict-kit:init-rules` | Mở Agent trong project, Agent đọc code → điền rules |
| 3 | `/evnict-kit:init-context` | Agent sinh file AGENTS.md từ rules |
| 4 | `/evnict-kit:init-check` | Agent sinh demo code để verify conventions |
| 5 | `/evnict-kit:init-wiki` | Setup wiki repo (nếu chưa có) |
| 6 | `/evnict-kit:wiki-scan-project` | Scan code hiện có → nạp wiki |

---

### 🔧 Phát triển Feature LỚN (cần cả BE + FE + DB)
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:feature-large "mô tả"` | Brainstorm → Spec → Clarify |
| 2 | `/evnict-kit:plan` | Sinh plan + task files chi tiết |
| 3 | `/evnict-kit:implement` | TDD per subtask (STOP-AND-ASK) |
| 4 | `/evnict-kit:handoff` | Chuyển giao cho FE/BE Agent |
| 5 | `/evnict-kit:review` | Auto review trước merge |
| 6 | `/evnict-kit:wiki-archive-feature` | Nạp tri thức vào wiki |

---

### 🔨 Phát triển Feature NHỎ (sửa UI, thêm field)
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:feature-small "mô tả"` | Query wiki → plan nhanh |
| 2 | `/evnict-kit:implement` | TDD implement |
| 3 | `/evnict-kit:wiki-archive-feature` | Nạp wiki (nếu > 20 dòng) |

---

### 🐛 Sửa Bug
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:bug-fix "mô tả bug"` | Query wiki → classify → TDD fix |
| 2 | `/evnict-kit:wiki-archive-feature` | Nạp wiki (tùy chọn) |

---

### 🔒 Kiểm tra / Fix ATTT
| Bước | Lệnh | Mô tả |
|------|-------|-------|
| 1 | `/evnict-kit:attt --scan` | Quét toàn bộ project |
| 2 | `/evnict-kit:attt "module"` | Check module cụ thể |
| 3 | Wiki tự động push | ATTT fix luôn nạp wiki |

---

### 📚 Wiki — Quản lý Tri thức
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:wiki-query "từ khóa"` | Tìm thông tin trước khi làm task |
| `/evnict-kit:wiki-archive-feature` | Nạp tri thức sau khi xong feature |
| `/evnict-kit:wiki-scan-project` | Scan code → nạp wiki (lần đầu) |
| `/evnict-kit:init-wiki` | Setup wiki repo |

---

### 🤝 Handoff — Trao đổi giữa BE↔FE
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:handoff` | BE xong API → chuyển cho FE |
| Đọc `handoff.md` | FE mở project → đọc yêu cầu từ BE |

---

### 👀 Review + Merge
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:review` | Trước khi merge PR |
| `/evnict-kit:finish-branch` | Merge/PR/cleanup branch (tham khảo skill) |

---

### 👋 Onboard Member Mới
| Lệnh | Khi nào |
|-------|---------|
| `/evnict-kit:wiki-query "overview"` | Tìm hiểu project |
| Đọc `AGENTS.md` | Context file tổng quan |
| Đọc `GETTING-STARTED.md` | File này! |

---

## 📂 Cấu trúc thư mục Agent
```
.agent/
├── rules/          ← 5 files: quy tắc chung, security, BE, FE, project
├── skills/         ← 22 folders: kỹ năng cho Agent  
├── workflows/      ← 17 files: quy trình cho từng loại công việc
└── context/        ← Context bổ sung
AGENTS.md           ← Context file chính (Agent đọc đầu tiên)
Instruct-Agent-AI.md ← Hướng dẫn init rules/context
GETTING-STARTED.md  ← File này — hướng dẫn sử dụng
```

---

## ⚡ Quick Tips
- Mọi lệnh `/evnict-kit:xxx` gõ trong Agent chat, không phải terminal
- Agent tự biết đọc workflow file khi nhận lệnh
- Tri thức wiki dùng chung giữa BE+FE (qua symlink)
- Handoff dùng file `.evnict/handoff/handoff.md` — mở để xem yêu cầu từ Agent khác
- Sau mỗi feature → nhớ nạp wiki (Agent sẽ gợi ý)

---

## ❓ Workflow thường dùng — Quick Ref

### Luồng phát triển đầy đủ (Feature Large)
```
feature-large → plan → implement → handoff → review → wiki-archive-feature
```

### Luồng phát triển nhanh (Feature Small)
```
feature-small → implement → wiki-archive-feature (optional)
```

### Luồng sửa lỗi
```
bug-fix → implement fix → wiki-archive-feature (optional)
```

### Luồng ATTT
```
attt --scan → fix issues → re-scan → wiki (auto)
```

### Luồng setup ban đầu
```
evnict-kit init → init-rules → init-context → init-check → init-wiki → wiki-scan-project
```

---

## 🔄 Handoff — Trao đổi giữa BE↔FE Agents

### BE Agent xong → chuyển cho FE
1. Chạy `/evnict-kit:handoff` trong project BE
2. Agent tự sinh entry mới trong `.evnict/handoff/handoff.md`
3. Entry có status 🔴 Chờ xử lý
4. Chuyển sang FE project → Agent đọc `handoff.md` → implement

### FE Agent xong → báo lại BE
1. FE Agent update status entry → 🟢 Đã xử lý
2. Điền "Kết quả xử lý" trong entry

### Theo dõi trạng thái
- 🔴 Chờ xử lý — chưa ai xử lý
- 🟡 Đang xử lý — đang được Agent xử lý
- 🟢 Đã xử lý — hoàn thành

---

## 📚 Wiki — Best Practices

### Khi nào nạp wiki?
- ✅ Sau khi xong feature lớn → `/evnict-kit:wiki-archive-feature`
- ✅ Sau khi fix bug quan trọng → option A trong bug-fix
- ✅ ATTT fix → tự động nạp (bắt buộc)
- ✅ Lần đầu setup → `/evnict-kit:wiki-scan-project`

### Khi nào truy vấn wiki?
- 🔍 Trước khi bắt đầu feature mới
- 🔍 Khi cần hiểu business rule
- 🔍 Khi fix bug → tìm context
- 🔍 Khi onboard member mới

---

## 🆘 Khi gặp vấn đề
| Vấn đề | Giải pháp |
|--------|-----------|
| Agent không hiểu lệnh | Kiểm tra file workflow trong `.agent/workflows/` |
| Wiki không truy cập được | Check symlink: `ls -la {project_name}-wiki/` |
| Handoff không thấy | Check `.evnict/handoff/handoff.md` |
| Muốn thêm project | Chạy `evnict-kit add <folder>` ở terminal workspace |
| Wiki trống sau init | Chạy `/evnict-kit:wiki-scan-project` |
| Ingest lỗi | Chạy `/evnict-kit:init-wiki` rồi thử lại |

---

## 📌 Phiên bản
- **evnict-kit:** v0.2.1
- **Ngày tạo:** {{DATE}}
- **Project:** {{PROJECT_NAME}}
