---
name: evnict-kit-frontend-design
description: Hướng dẫn tư duy thiết kế UI chất lượng cao cho Angular. Tập trung vào design thinking, aesthetics, typography, color, motion — tránh UI generic "AI slop". Dùng khi tạo component, page, hoặc cải thiện giao diện.
compatibility: Angular 16+
---

# evnict-kit-frontend-design — Thiết kế UI Chất lượng Cao

## Khi nào dùng
- Tạo UI component/page mới
- Cải thiện giao diện hiện có
- Thiết kế landing page, dashboard, form phức tạp
- Khi cần UI vượt trội hơn mức "tạm được"

## Nguyên tắc cốt lõi
> **UI do AI sinh ra PHẢI trông như được thiết kế bởi designer chuyên nghiệp,
> KHÔNG phải output generic của AI.**

---

## 1. Design Thinking — TRƯỚC KHI CODE

Trước khi viết bất kỳ dòng code nào, Agent PHẢI trả lời 4 câu hỏi:

### 1.1 Purpose — Giao diện này giải quyết vấn đề gì?
- Ai là người dùng? (admin, nhân viên, khách hàng?)
- Họ cần làm gì? (nhập liệu, tra cứu, phê duyệt?)
- Tần suất sử dụng? (hàng ngày vs. thi thoảng)

### 1.2 Tone — Chọn hướng thẩm mỹ RÕ RÀNG
Không dùng "trung tính an toàn". Chọn 1 hướng và đẩy mạnh:
- **Refined/Professional** — enterprise app, dashboard, quản trị
- **Minimalist/Clean** — form nhập liệu, workflow step-by-step
- **Data-Dense/Utilitarian** — bảng dữ liệu lớn, reporting
- **Modern/Dynamic** — landing page, portal, user-facing
- **Soft/Approachable** — onboarding, wizard, hướng dẫn

### 1.3 Constraints — Ràng buộc kỹ thuật
- Framework: Angular (tuân thủ Angular conventions)
- Component library đang dùng trong project
- Responsive requirements
- Accessibility requirements
- Performance constraints

### 1.4 Differentiation — Điểm nhấn đáng nhớ
- UI này có gì KHÁC BIỆT so với template mặc định?
- Người dùng sẽ nhớ gì sau khi rời trang?
- Micro-interaction nào tạo cảm giác "chuyên nghiệp"?

---

## 2. Nguyên tắc Thẩm mỹ — Frontend Aesthetics

### 2.1 Typography — Chữ phải ĐẸP và CÓ CÁ TÍNH
- **KHÔNG dùng** font generic mặc định (Arial, system fonts)
- **Chọn font có cá tính** phù hợp với tone của ứng dụng
- **Pair fonts:** 1 display font nổi bật + 1 body font dễ đọc
- **Hierarchy rõ ràng:** heading > subheading > body > caption
- **Spacing:** line-height, letter-spacing phải được tinh chỉnh — không dùng default

### 2.2 Color & Theme — Màu sắc PHẢI có chủ đích
- **Commit vào 1 color palette nhất quán** — dùng CSS variables
- **Dominant + Accent:** 1 màu chủ đạo mạnh + 1-2 màu nhấn, tốt hơn nhiều màu đều nhau
- **TRÁNH:** tím gradient trên nền trắng (AI cliché), màu quá generic (red/blue/green thuần)
- **Dark mode:** Nếu phù hợp — dark theme tạo cảm giác premium cho enterprise app
- **Semantic colors:** success/warning/error/info phải nhất quán toàn app

### 2.3 Motion & Micro-interactions — Sống động nhưng KHÔNG rối
- **Ưu tiên CSS-only:** transitions, animations — không cần thêm lib nếu không cần thiết
- **High-impact moments:** page load staggered reveal, hover state, expand/collapse
- **Scroll-triggered effects:** chỉ dùng khi phù hợp (landing page, dashboard)
- **Form feedback:** input focus, validation animation, submit loading state
- **NGUYÊN TẮC:** 1 animation tốt > 10 animation rời rạc

### 2.4 Spatial Composition — Bố cục KHÔNG nhàm chán
- **TRÁNH:** layout đối xứng hoàn toàn, mọi thứ căn giữa
- **Negative space:** khoảng trống có chủ đích tạo sự thoáng
- **Grid-breaking:** 1-2 element phá grid tạo điểm nhấn
- **Card depth:** shadow, border, background tạo layer hierarchy
- **Responsive:** mobile-first, breakpoints hợp lý

### 2.5 Backgrounds & Visual Details — Tạo chiều sâu
- **KHÔNG mặc định nền trắng/xám nhạt** — cân nhắc gradient nhẹ, pattern, texture
- **Depth effects:** shadow layers, glassmorphism (nếu phù hợp)
- **Decorative elements:** border styles, dividers, icons có phong cách
- **NGUYÊN TẮC:** Mỗi pixel phải có lý do tồn tại

---

## 3. Anti-Patterns — TUYỆT ĐỐI TRÁNH

### ❌ "AI Slop" — Dấu hiệu UI sinh bởi AI kém chất lượng
- Font Inter/Roboto/Arial trên mọi project
- Tím gradient (#6366f1 → #8b5cf6) trên nền trắng
- Card bo góc 8px + shadow nhẹ — mọi component giống nhau
- Layout 100% đối xứng, không có điểm nhấn
- Icon generic không có phong cách riêng
- Spacing đều đặn máy móc, không có rhythm

### ✅ Dấu hiệu UI được THIẾT KẾ tốt
- Font choice phản ánh tính cách ứng dụng
- Color palette có chủ đích, nhất quán
- Layout có hierarchy rõ, mắt biết nhìn đâu trước
- Micro-interactions tạo feedback tự nhiên
- Mỗi trang/component có "cá tính" riêng — không copy-paste aesthetic

---

## 4. Áp dụng cho Angular

### 4.1 Component Design
- Mỗi component nên có CSS riêng — KHÔNG dùng inline styles tràn lan
- Dùng CSS variables cho theme consistency
- `:host` styling để component self-contained
- `@media` queries cho responsive — mobile-first

### 4.2 Theming
- Định nghĩa design tokens (colors, spacing, typography) ở root/shared level
- Component consume tokens — KHÔNG hardcode values
- Support theme switching nếu dự án yêu cầu

### 4.3 Animation trong Angular
- Ưu tiên CSS transitions/animations
- Angular Animations API cho complex state transitions
- `@defer` cho lazy-loaded content với loading states đẹp

### 4.4 Responsive
- Breakpoints nhất quán toàn project
- Mobile layout PHẢI được thiết kế — không chỉ "co lại"
- Table → card view trên mobile
- Navigation → hamburger/drawer trên mobile

---

## 5. Quy trình áp dụng

```
1. Đọc yêu cầu → Trả lời 4 câu hỏi Design Thinking
2. Chọn tone + color palette + typography
3. Sketch layout (mô tả text hoặc wireframe đơn giản)
4. Implement component với full styling
5. Review: so sánh với Anti-Patterns checklist
6. Polish: micro-interactions, responsive, accessibility
```

> **QUAN TRỌNG:** Match complexity với vision.
> - Design maximalist → code phải elaborate (animations, effects, layers)
> - Design minimalist → code phải precise (spacing, typography, subtle details)
> - Elegance = thực thi đúng vision, không phải nhiều hay ít code

---

## Tiêu chí chất lượng
- [ ] Design Thinking 4 câu hỏi đã trả lời
- [ ] Tone thẩm mỹ rõ ràng, nhất quán
- [ ] Typography: font có cá tính, hierarchy rõ
- [ ] Color: palette nhất quán, có dominant + accent
- [ ] Layout: có hierarchy, không đối xứng nhàm chán
- [ ] Motion: ít nhất 1 micro-interaction có ý nghĩa
- [ ] Responsive: mobile-first, breakpoints hợp lý
- [ ] KHÔNG có dấu hiệu "AI slop"
