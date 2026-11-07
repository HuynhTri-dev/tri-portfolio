---
title: "Nghẽn Hiển Thị và Giật Khung Hình Khi Dồn Toàn Bộ Tương Tác Canvas & Dữ Liệu Vào Một Component Độc Bản"
parentSlug: "between-us-spatial-memory-canvas"
errorCode: "ERR_FRONTEND_CANVAS_MONOLITH_OVERLOAD"
environment: "React 19, Astro 5, TypeScript 5.8, SVG Canvas Physics"
tags:
  - react
  - frontend-architecture
  - component-decomposition
  - svg-canvas
  - performance
  - ux-ui-design
date: "2026-11-07T06:28:00.000Z"
---

## Error Symptoms
```
Triệu chứng mã nguồn và trải nghiệm người dùng:
1. Component giao diện đồ thị (SkillGraphNetwork) phình to hơn 1,840 dòng mã, kết hợp chung:
   - Các định nghĩa Types và Interfaces
   - Dữ liệu tĩnh (Metadata, bảng màu, bài học dự phòng fallback)
   - Thuật toán hình học phức tạp (Cubic-Bezier, Polar coordinate math)
   - SVG Canvas rendering (các node, bough spline, bioluminescent sap veins)
   - Toàn bộ thanh điều khiển zoom/filter và bảng thông tin chi tiết (Dossier Panel).
2. Khi người dùng tương tác kéo thả node hoặc hover vào nhánh cây:
   - Toàn bộ đồ thị bị re-render không cần thiết.
   - Thao tác bảo trì hoặc sửa 1 nhãn chữ nhỏ đòi hỏi duyệt qua hàng ngàn dòng code, nguy cơ gây lỗi dây chuyền rất cao (Rigid & Fragile code).
3. Về mặt UX: Nhồi nhét quá nhiều chữ, thông số kỹ thuật và nhãn chi tiết trực tiếp lên mặt Canvas khiến người dùng bị ngợp thông tin (Visual Clutter & Cognitive Overload).
```

## Root Cause
- **Vi phạm Single Responsibility Principle (SRP)**: Một component đảm nhận quá nhiều vai trò: vừa làm kho dữ liệu, vừa tính toán hình học, vừa xử lý vòng lặp vật lý, vừa render trực tiếp tất cả các phần tử UI.
- **Thiếu phân tầng thông tin (Information Architecture)**: Không phân biệt rõ ranh giới giữa *Điểm chính nhận diện thị giác* và *Nội dung chi tiết chuyên sâu*.
- **Thiếu cơ chế ngắt vòng lặp Animation (Unconditional rAF)**: Vòng lặp `requestAnimationFrame` dễ chạy liên tục nếu không có điều kiện dừng khi vận tốc đàn hồi tiệm cận 0.

## Verified Solution
Áp dụng mô hình **Phân rã 5 tầng (5-Tier Modular Decomposition)** và **Quy tắc phân tầng độ sâu thông tin 3 cấp (3-Tier Information Depth)**:

### 1. Phân rã Component từ 1,840 dòng thành các mô-đun độc lập
* `types.ts`: Chứa toàn bộ Data Contract, Interfaces của Graph Node, Edges, và Props.
* `constants.ts`: Lưu trữ Metadata phân loại domain, bảng màu Rank (`RANK_COLOR_MAP`), nhãn ngắn gọn (`SHORT_NODE_LABELS`).
* `geometry.ts`: Đóng gói các hàm tính toán hình học thuần túy (`polarToCartesian`, `buildOrganicBoughGeometry`) phục vụ Unit Testing.
* `components/`: Tách thành các sub-components chuyên trách (`ArboretumDomainTabs`, `ArboretumToolbar`, `ArboretumSvgCanvas`, `ArboretumTooltip`, `ArboretumFooter`, `ArboretumDossier`).
* `SkillGraphNetwork.tsx`: Thu gọn chỉ còn vai trò **Orchestrator Container** (~450 dòng) quản lý state và điều phối physics.

### 2. Tối ưu hóa vòng lặp Physics có điều kiện dừng
```typescript
// Chỉ chạy step khi có tương tác kéo thả hoặc có gia tốc di chuyển
if (moving || draggedNodeRef.current) {
  animId = requestAnimationFrame(step);
  running = true;
} else {
  running = false;
  // Tự động dừng rAF để trả lại CPU/GPU khi hệ thống đạt trạng thái tĩnh
}
```

### 3. Phân tầng thông tin UX chuẩn mực
- **Trên Canvas**: Chỉ hiển thị điểm chính (Tên rút gọn 1–2 từ, Rank Crest S/A/B, biểu tượng hạt tri thức D1).
- **Trên Dossier Panel (Cột bên)**: Tóm tắt năng lực cốt lõi, danh sách các nhánh lá phụ thuộc và tiêu đề bài viết chứng minh thực tế.
- **Trên Trang riêng (/blog/{slug})**: Dành riêng cho độc giả cần đào sâu toàn bộ kiến trúc và mã nguồn thực thi.

