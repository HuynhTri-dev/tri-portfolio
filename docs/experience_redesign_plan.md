# Kế Hoạch Tái Cấu Trúc Hệ Thống Quản Lý Kinh Nghiệm (Workplace & Experience Redesign)

> **File:** `docs/experience_redesign_plan.md`  
> **Author:** Antigravity AI & Huỳnh Minh Trí  
> **Date:** 2026-10-18  
> **Status:** Draft / Brainstorm Plan — Awaiting `/code` approval  

---

## 1. PHÂN TÍCH HIỆN TRẠNG & BÀI TOÁN (PROBLEM ANALYSIS)

### 1.1. Sự khác biệt bản chất giữa các môi trường làm việc của Trí

Trong hồ sơ hiện tại, Trí có 4 tổ chức đại diện cho 3 mô hình kỹ thuật hoàn toàn khác nhau:

| Tổ chức | Mô hình hoạt động | Đặc thù công việc & dự án | Thách thức với cấu trúc cũ |
| :--- | :--- | :--- | :--- |
| **Rita Võ Group** | **Enterprise Product** | Thực tập/làm việc tập trung trong thời gian ngắn (Mar 2026 — Jun 2026), gắn liền sâu với **1 sản phẩm cốt lõi duy nhất**: `ProdID · Odoo 18 PLM`. | Schema hiện tại chỉ cho phép 1 role chung và 1 project, tình cờ vừa vặn với Rita Võ nhưng lại làm mất chiều sâu về module. |
| **IDB Group** | **Software Outsource & Services** | Công ty dịch vụ phần mềm / outsource, đụng **nhiều dự án khách hàng khác nhau**, mỗi dự án đóng một **role chuyên môn riêng biệt** (Voice AI / PBX, Realtime Event Streaming, Core Backend Portal). | Schema cũ chỉ cho phép **1 role chung** ("Junior Software Engineer") và **1 project duy nhất** ("Internal Enterprise Architecture"), biến mọi dự án đa dạng của IDB thành một cục chung chung, làm lu mờ năng lực thích ứng và thực chiến của Trí. |
| **Omnimer Team** | **AI & Product R&D Lab** | Nhóm nghiên cứu & phát triển hệ sinh thái đa sản phẩm (`OmniMer Health`, `OmniMer Food`, `ViNar`). | Cũng có nhiều sản phẩm con nhưng hiện tại đang bị ép vào 1 description đơn lẻ. |
| **VinaGreen** | **Deep-Tech Startup** | Nền tảng nông nghiệp công nghệ cao trên mạng lưới Edge (`ViNar Platform`). | 1 nền tảng chính, gắn liền hạ tầng Cloudflare Workers. |

---

### 1.2. Các hạn chế kỹ thuật trong Source Code hiện tại

1. **Giới hạn 1-1 cứng nhắc trong Data Model (`src/data/portfolio.ts`)**:
   - `ExperienceItem` định nghĩa `project: { ... }` là một **Object đơn lẻ**, không phải mảng (`projects: [...]`).
   - `roleEn` / `roleVi` được cố định ở cấp công ty. Không có cơ chế khai báo: *"Tại IDB, ở Dự án A tôi làm Voicebot Integration Engineer, còn ở Dự án B tôi làm Backend & Kafka Streaming Engineer"*.
   - Danh sách `tasks: ExperienceTask[]` nằm phẳng ở cấp công ty, làm mất ngữ cảnh công việc đó thuộc về dự án nào.

2. **Hạn chế tại Trang chủ (`src/components/home/ExperienceSection.astro`)**:
   - Khối `.connected-product-box` chỉ hiển thị 1 dòng `item.project.titleEn`.
   - Với công ty Product (Rita Võ), việc ghi tên sản phẩm rất hợp lý. Nhưng với công ty Outsource (IDB), việc chỉ hiển thị 1 cái tên chung chung không làm nổi bật được việc Trí đã tham gia nhiều dự án khách hàng với các domain khác nhau.

3. **Hạn chế tại Trang chi tiết (`src/pages/experience/[id].astro`)**:
   - Layout cố định một khối `tasks` rồi đến một khối `connected-section` cho 1 project duy nhất.
   - Không hỗ trợ hiển thị danh sách nhiều dự án con với trạng thái bảo mật (Confidential / NDA), vai trò riêng (Role per project), công nghệ riêng và kết quả đạt được.

---

## 2. KIẾN TRÚC THIẾT KẾ MỚI (PROPOSED ARCHITECTURAL DESIGN)

### 2.1. Phân loại Mô hình Doanh nghiệp (`WorkplaceModel`)

Phân tách các tổ chức theo 3 mô hình trực quan:
- `'product'`: Doanh nghiệp Product / In-house (e.g., Rita Võ). Trọng tâm: Chiều sâu sản phẩm, vòng đời tính năng (lifecycle), tối ưu thuật toán nghiệp vụ.
- `'outsource'`: Công ty Dịch vụ / Gia công phần mềm (e.g., IDB Group). Trọng tâm: Nhiều dự án khách hàng (multi-project), tính linh hoạt đa vai trò (multi-role), khả năng tích hợp công nghệ mới theo yêu cầu khách hàng, tuân thủ NDA.
- `'rd_team'`: Nhóm R&D / Open-source Ecosystem (e.g., Omnimer). Trọng tâm: Nghiên cứu công nghệ mới, hệ sinh thái kết nối.
- `'core_tech'`: Startup kỹ thuật nền tảng (e.g., VinaGreen). Trọng tâm: Hạ tầng và kiến trúc lõi.

---

### 2.2. Thiết kế lại Schema Data Model (`src/data/portfolio.ts`)

```typescript
export type WorkplaceModel = "product" | "outsource" | "rd_team" | "core_tech";

export type ProjectEngagement = {
  id: string;
  titleEn: string;
  titleVi: string;
  // Role riêng cho từng dự án (Đặc biệt quan trọng cho Outsource!)
  roleEn?: string; 
  roleVi?: string;
  // Phân hệ / Ngành nghề của khách hàng (Telecom, ERP, AI, Healthcare...)
  clientDomainEn?: string;
  clientDomainVi?: string;
  periodEn?: string;
  periodVi?: string;
  // Trạng thái bảo mật khách hàng
  isConfidential?: boolean;
  statusEn: string;
  statusVi: string;
  descriptionEn: string;
  descriptionVi: string;
  // Nhiệm vụ & thành tựu kỹ thuật cụ thể trong dự án này
  tasks?: ExperienceTask[];
  technologies: string[];
  links?: ExperienceLink[];
};

export type ExperienceItem = {
  id: string;
  model: WorkplaceModel;
  badgeEn: string;
  badgeVi: string;
  badgeType: "current" | "enterprise" | "core" | "team";
  orgName: string;
  orgHref?: string;
  logo: string;
  // Role chức danh tổng tại tổ chức
  roleEn: string;
  roleVi: string;
  periodEn: string;
  periodVi: string;
  locationEn: string;
  locationVi: string;
  overviewEn: string;
  overviewVi: string;
  detailHref: string;
  
  // Hỗ trợ N dự án (Thay thế cho 1 project duy nhất)
  projects: ProjectEngagement[];
  
  // Nhiệm vụ tổng quan cấp tổ chức (cho product hoặc phương pháp luận chung)
  generalTasks?: ExperienceTask[];
  technologies: string[];
  
  // Getter hoặc compatibility field để không gãy các component chưa update
  project?: ProjectEngagement;
};
```

---

### 2.3. Bóc tách nội dung thực tế cho IDB Group & Rita Võ

#### 🏢 A. IDB Group (Mô hình Outsource / Dịch vụ Kỹ thuật)
- **Primary Role:** `Junior Software Engineer` (Chức danh chính tại IDB).
- **Overview:** Phụ trách phát triển giải pháp kỹ thuật khách hàng doanh nghiệp, tích hợp tổng đài 3CX, phát triển Voicebot AI cho hệ thống ngân hàng (Sacombank, Nam Á Bank, TNEX), tự động hóa văn bản pháp lý tín dụng và đường ống dữ liệu thời gian thực Redis/RabbitMQ.
- **Danh sách 6 dự án thực tế (Engagements):**
  1. **Dự án 1: Sacombank Enterprise Voicebot AI System (OCT 2026 — PRESENT)**
     - *Role:* `Core Voicebot Developer` (Lập trình viên chính phát triển hệ thống Voicebot)
     - *Client Domain:* Tier-1 Commercial Banking & Financial Services (Sacombank)
     - *Status:* `Production Core Dev · Active Deployment`
     - *Nhiệm vụ:* Xây dựng đường ống âm thanh độ trễ thấp, máy trạng thái hội thoại tự động, kịch bản nghiệp vụ ngân hàng và tích hợp API backend.
     - *Tech:* `Python`, `FastAPI`, `Voicebot AI Engine`, `STT/TTS`, `Banking Integration`, `Redis`.
  2. **Dự án 2: Vietmap 3CX Multi-Leg Telephony & RabbitMQ Pipeline (OCT 2026)**
     - *Role:* `Telephony & Integration Engineer`
     - *Client Domain:* Logistics & Digital Map Telephony (Vietmap)
     - *Status:* `Resolved & Verified in Production`
     - *Nhiệm vụ:* Xử lý bug mất action data khi Agent 3CX bắt máy và chuyển leg khiến PBX Service gửi thiếu dữ liệu cho RabbitMQ. Viết thuật toán theo dõi Leg qua CallID để ánh xạ chuẩn xác toàn bộ vòng đời cuộc gọi, đảm bảo gửi đủ và đúng 100% action sự kiện vào RabbitMQ.
     - *Tech:* `C#`, `.NET`, `RabbitMQ`, `3CX Phone System`, `Event-Driven`.
  3. **Dự án 3: Loan Settlement Clearance Automation & Legal Document Engine (Welcome Report - OCT 2026)**
     - *Role:* `Backend Engineer & Solution Developer`
     - *Client Domain:* Banking & Consumer Lending Operations (Tài chính Tín dụng)
     - *Status:* `Production Operational · Handover Complete`
     - *Nhiệm vụ:* Xây dựng hệ thống tự động xuất giấy tờ hoàn tất thanh toán khoản vay (NOL) ra PDF và Word có gán chữ ký điện tử và con dấu (mộc). Override thông tin hợp đồng, chọn người ký (Giám đốc / Đại diện ủy quyền), quản lý số văn bản, phiên bản, số lần tải; tối ưu truy vấn CSDL, thiết kế log vận hành và soạn thảo tài liệu bàn giao.
     - *Tech:* `Python`, `FastAPI`, `MySQL`, `Joget Workflow`, `PDF/Word Automation`, `Digital Signature`.
  4. **Dự án 4: Zalo Call Monitor · Realtime Telephony Dashboard for ZaloPay (SEP 2026)**
     - *Role:* `Backend Engineer (Realtime Telephony Data)`
     - *Client Domain:* Fintech & Payment Gateway (ZaloPay)
     - *Status:* `Production Operational · Handover Complete`
     - *Nhiệm vụ:* Backend thu thập dữ liệu cuộc gọi thời gian thực từ tổng đài 3CX sang Redis để frontend đẩy lên Dashboard giám sát cho đội ngũ CSKH ZaloPay. Viết tài liệu bàn giao kỹ thuật.
     - *Tech:* `C#`, `.NET`, `Redis`, `3CX Phone System`, `REST APIs`, `Documentation`.
  5. **Dự án 5: Aqua CRM · Realtime Call Monitor & Redis Cache Optimization (SEP–OCT 2026)**
     - *Role:* `Telephony Support & Data Engineer`
     - *Client Domain:* Enterprise CRM & Consumer Electronics (Aqua)
     - *Status:* `Production Stabilized`
     - *Nhiệm vụ:* Điều tra, debug và fix lỗi sai lệch dữ liệu Call Monitor với Redis cho Dashboard quản lý cuộc gọi của hệ thống CRM Aqua.
     - *Tech:* `Redis`, `C#`, `CRM Integration`, `3CX Telephony`, `Data Debugging`.
  6. **Dự án 6: Commercial Banking Voicebot QA-QC & Multi-Bank PoC Demos (SEP–OCT 2026)**
     - *Role:* `Voice AI QA & PoC Specialist`
     - *Client Domain:* Commercial Banking & Digital Finance (Sacombank, Nam Á Bank, TNEX)
     - *Status:* `PoC Complete · Converted to Main Development`
     - *Nhiệm vụ:* Thực hiện kiểm thử chất lượng QA-QC kịch bản hội thoại AI, chuẩn bị PoC và tham gia demo trực tiếp giải pháp Voicebot cho các ngân hàng: Sacombank, Nam Á Bank và TNEX.
     - *Tech:* `Voice AI`, `QA/QC Testing`, `PoC & Demo`, `Conversational AI`, `Banking Scenarios`.

#### 🏢 B. Rita Võ Group (Mô hình Product / In-house Enterprise)
- **Primary Role:** `Odoo Developer Intern`
- **Overview:** Thiết kế và phát triển nghiệp vụ tùy biến trên nền tảng Odoo 18, số hóa vòng đời sản phẩm và tự động hóa quy trình cho doanh nghiệp quy mô lớn.
- **Sản phẩm cốt lõi duy nhất (Flagship Product):**
  1. **ProdID · Odoo 18 PLM (Product Lifecycle Management)**
     - *Role:* `Odoo Developer Intern`
     - *Status:* `Live Enterprise Portal · Đang vận hành thực tế`
     - *Mô tả:* Module cốt lõi kết nối dữ liệu liên phòng ban (R&D, Marketing, Sales, Purchasing) trên quy mô ~10.000 bản ghi sản phẩm.
     - *Deep-Dive Features:*
       - Thuật toán tìm kiếm theo chiều sâu (DFS) phát hiện chu trình vòng lặp trong định mức vật liệu (BOM).
       - Ma trận phê duyệt động nhiều bước với phân quyền theo vai trò.
       - Tự động hóa CI/CD với Docker và GitHub Actions.
     - *Links:* Cổng đăng nhập ProdID thực tế (`https://prodid.ritavo.com/web/login`) + Dossier chi tiết (`/projects/ritavo-prodid`).

---

## 3. THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX DESIGN)

### 3.1. Giao diện Trang chủ (`src/components/home/ExperienceSection.astro`)
Hiện tại card hiển thị cứng một ô `CONNECTED SYSTEM`. Ta sẽ refactor để hiển thị linh hoạt theo mô hình:
- **Nếu là `product`:**
  - Tiêu đề nhỏ: `FLAGSHIP PRODUCT` / `SẢN PHẨM CỐT LÕI`
  - Hiển thị: 1 sản phẩm chính kèm link trực tiếp (như Rita Võ -> `ProdID · Odoo 18`).
- **Nếu là `outsource`:**
  - Tiêu đề nhỏ: `CLIENT ENGAGEMENTS` / `DỰ ÁN KHÁCH HÀNG & PHÂN HỆ`
  - Hiển thị: Huy hiệu số lượng + Tag các dự án tiêu biểu (Ví dụ: `⚡ 3 Projects: Voicebot PBX · CDR Streaming · Enterprise Portal`).
- Giữ nguyên chiều cao đồng đều (uniform card height) bằng CSS Flexbox và layout tính toán sẵn.

---

### 3.2. Giao diện Trang chi tiết Nơi làm việc (`src/pages/experience/[id].astro`)
Tạo trải nghiệm chuyên sâu và tương ứng với từng mô hình:
1. **Hero Header:**
   - Hiển thị Logo, Tên công ty, Role chính, Timeline, Địa điểm.
   - Thêm Badge thể hiện loại hình: `ENTERPRISE PRODUCT` vs `OUTSOURCE & CLIENT SERVICES`.
2. **Khu vực Hiển thị Dự án (Projects Showcase):**
   - **Với Rita Võ (Product):**
     - Hiển thị dạng **Spotlight Showcase**: Khối sản phẩm lớn với đầy đủ thông số, kiến trúc, liên kết Case Study và Live Portal.
     - Phần Tasks hiển thị các module kỹ thuật nổi bật (DFS Algorithm, Approval Matrix, CI/CD).
   - **Với IDB Group (Outsource):**
     - Hiển thị dạng **Multi-Project Cards / Timeline**:
       - Mỗi dự án con là một thẻ panel riêng biệt.
       - Header của thẻ: Tên dự án, Role cụ thể trong dự án đó (`roleEn`/`roleVi`), Thẻ ngành hàng (`Telecom / VoIP`, `Data Engineering`), Badge trạng thái bảo mật (`Confidential / NDA` hoặc `Operational`).
       - Body của thẻ: Mô tả bài toán khách hàng, các nhiệm vụ kỹ thuật đã làm (`tasks` của dự án).
       - Footer của thẻ: Tech stack riêng của từng dự án.
3. **Khu vực Tiêu chuẩn Kỹ thuật chung (General Engineering Practices):**
   - Trình bày quy trình làm việc chuyên nghiệp (Agile/Scrum, Git Flow, Code Review, Security).

---

## 4. KẾ HOẠCH TRIỂN KHAI TỪNG BƯỚC (STEP-BY-STEP IMPLEMENTATION PLAN)

```mermaid
flowchart TD
    A[Bước 1: Cập nhật Data Type & Portfolio Data] --> B[Bước 2: Nâng cấp Trang chi tiết experience/id.astro]
    B --> C[Bước 3: Tối ưu Component Trang chủ ExperienceSection.astro]
    C --> D[Bước 4: Cập nhật Trang danh mục experience/index.astro]
    D --> E[Bước 5: Kiểm thử Build Astro & Kiểm tra Hiển thị Đa ngôn ngữ]
```

### Bước 1: Cập nhật Schema & Dữ liệu trong `src/data/portfolio.ts`
- Định nghĩa type `WorkplaceModel`, mở rộng `ExperienceItem` hỗ trợ `projects: ProjectEngagement[]`.
- Bổ sung trường `project` dự phòng (`getter` hoặc thuộc tính đầu tiên của mảng) để duy trì tính tương thích ngược nếu còn component cũ gọi đến.
- Viết lại dữ liệu chi tiết cho:
  - `idb`: 3 dự án outsource với từng vai trò, domain viễn thông, streaming, security và tech stack riêng.
  - `ritavo`: 1 sản phẩm PLM với các phân hệ R&D, Sales, Purchasing, thuật toán DFS.
  - `omnimer` & `vinagreen`: Cập nhật schema `projects` tương thích.

### Bước 2: Nâng cấp Trang chi tiết (`src/pages/experience/[id].astro`)
- Tạo điều kiện render:
  - Nếu `experience.projects.length > 1`: Render danh sách các dự án con theo layout thẻ dạng Multi-Project Engagement (hiển thị Role riêng, Tech riêng, Tasks riêng của từng dự án).
  - Nếu `experience.projects.length === 1`: Render dạng Single Product Spotlight như hiện tại nhưng giàu thông tin hơn.
- Thiết kế badge nhận diện `Confidential Client (NDA)` trang nhã, đúng phong cách kỹ sư cao cấp.

### Bước 3: Cập nhật Component Trang chủ (`src/components/home/ExperienceSection.astro`)
- Chỉnh sửa khối `connected-product-box`:
  - Nếu có 1 dự án (Product): Hiển thị tên sản phẩm duy nhất.
  - Nếu có nhiều dự án (Outsource/Team): Hiển thị số lượng dự án + các pill tag đại diện (Voice AI PBX, Streaming, Portal) để người xem thấy ngay sự đa năng của Trí.

### Bước 4: Cập nhật Trang danh mục (`src/pages/experience/index.astro`)
- Cập nhật card tóm tắt tại `/experience`: Thêm số lượng dự án đã thực hiện và vai trò nổi bật.

### Bước 5: Kiểm thử (Validation & Edge Cases)
- Chạy `astro check` hoặc build test để bảo đảm TypeScript strict không báo lỗi.
- Kiểm tra tính năng chuyển đổi song ngữ (EN / VI) trên cả trang chủ và trang chi tiết.
- Kiểm tra responsive trên cả Desktop và Mobile.

---

## 5. RỦI RO & PHƯƠNG ÁN XỬ LÝ (RISKS & EDGE CASES)

| Rủi ro / Tình huống biên | Mức độ | Phương án phòng ngừa & xử lý |
| :--- | :---: | :--- |
| **Gãy tương thích ngược với các file gọi `item.project.titleEn`** | Trung bình | Trong `ExperienceItem`, song song với `projects: ProjectEngagement[]`, vẫn giữ thuộc tính `project: ProjectEngagement` (gán bằng `projects[0]`) để nếu có file nào chưa kịp sửa vẫn không bị `undefined`. |
| **Bảo mật thông tin khách hàng outsource (NDA)** | Cao | Tuyệt đối không để lộ tên đối tác thương mại nhạy cảm của IDB. Dùng tên định danh dự án chuyên nghiệp: *"Enterprise Voicebot & PBX Telephony Integration"*, *"Distributed Event Streaming Platform"*, gắn nhãn `Enterprise Client · NDA`. |
| **Chênh lệch chiều cao thẻ ở Trang chủ** | Thấp | Thiết lập `min-height` và `line-clamp` chặt chẽ cho khối `connected-product-box` để card của Rita Võ và IDB luôn bằng nhau hoàn hảo trên grid 2 cột. |
| **Ngôn ngữ kép (EN/VI) cho từng dự án con** | Thấp | Toàn bộ field trong `ProjectEngagement` đều có hậu tố `En` và `Vi` (`roleEn`, `roleVi`, `titleEn`, `titleVi`, `descriptionEn`, `descriptionVi`), tương thích 100% với script toggle ngôn ngữ `data-en` / `data-vi` sẵn có của trang. |

---

## 7. ĐÁNH GIÁ TÁC ĐỘNG TỐC ĐỘ TẢI TRANG (PERFORMANCE & MDX SCALABILITY)

### 7.1. Đẩy nhiều thông tin vào Source/Data có làm chậm trang web không?
**Câu trả lời ngắn gọn: HOÀN TOÀN KHÔNG ẢNH HƯỞNG đến tốc độ tải của trình duyệt (Client Performance).**

Lý do bắt nguồn từ kiến trúc **Zero-JS by Default** và **Static Site Generation (SSG)** của Astro:
1. **Dữ liệu trong `src/data/portfolio.ts`:**
   - File này chỉ được Node.js/Astro đọc **tại thời điểm build (`astro build`)**.
   - Dữ liệu TypeScript được Astro biên dịch thẳng thành các thẻ HTML tĩnh (`<div>`, `<span>`, `<p>`).
   - Trình duyệt người dùng **KHÔNG BAO GIỜ phải tải file `portfolio.ts` hay chạy JS để parse JSON**. Trình duyệt chỉ nhận về file HTML nhẹ vài chục KB.
   - Thêm 50 hay 200 dòng text mô tả dự án vào `portfolio.ts` chỉ làm file HTML tăng khoảng 1–2 KB thô (qua nén Gzip/Brotli của Cloudflare chỉ tương đương ~0.3 KB truyền qua mạng), hoàn toàn không thể làm chậm trang.

2. **Các file bài viết & dự án MDX (`src/content/projects/*.mdx`):**
   - Astro sử dụng **Content Layer API** với tính năng **Route-based Code Splitting** tự động 100%.
   - Mỗi file MDX (như `omnimer-health.mdx`, `ritavo-prodid.mdx`) sẽ được Astro biên dịch thành một trang HTML độc lập (ví dụ `/projects/omnimer-health/index.html`).
   - **Khi người dùng vào Trang chủ (`/`) hoặc vào trang Nơi làm việc (`/experience/idb`), trình duyệt TUYỆT ĐỐI KHÔNG tải nội dung của bất kỳ file MDX nào!**
   - Dù bạn có 5 hay 50 file MDX với hàng ngàn dòng phân tích chuyên sâu, trang chủ và các trang khác vẫn giữ nguyên 100% tốc độ tải ban đầu (Lighthouse 98–100).

---

### 7.2. Chiến lược phân tầng nội dung: Khi nào dùng `portfolio.ts`, khi nào dùng file `.mdx`?

Để giữ cho repository sạch sẽ, tinh gọn và tải siêu tốc, ta áp dụng mô hình phân tầng:

```
┌────────────────────────────────────────────────────────┐
│                   TẦNG 1: LIGHTWEIGHT DATA             │
│                 (Nằm trong portfolio.ts)               │
│  - Tóm tắt: Role, Domain, Period, Confidential Badge   │
│  - Bullet tasks: 2-3 gạch đầu dòng nhiệm vụ cốt lõi    │
│  - Tech Stack tags: [Python, Kafka, Asterisk, Redis]   │
│  => Phục vụ hiển thị trên: Home & /experience/[id]     │
└──────────────────────────┬─────────────────────────────┘
                           │ (Nếu là dự án lớn / public case study)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   TẦNG 2: DEEP-DIVE DOSSIER            │
│            (Nằm trong src/content/projects/*.mdx)      │
│  - Phân tích kiến trúc toàn diện (Architecture Spec)    │
│  - Biểu đồ luồng dữ liệu Mermaid, sơ đồ tuần tự         │
│  - Thuật toán, công thức toán học KaTeX, Benchmark RAG │
│  - Code snippets, hình ảnh chụp thực tế                │
│  => Phục vụ hiển thị trên: /projects/[slug]            │
└────────────────────────────────────────────────────────┘
```

#### Quy tắc quyết định cho các dự án tại IDB và Rita Võ:
- **Với Rita Võ:**
  - `portfolio.ts`: Chứa tóm tắt phân hệ ProdID Odoo 18.
  - `src/content/projects/ritavo-prodid.mdx`: Hồ sơ chuyên sâu về thuật toán DFS chu trình BOM, quy trình duyệt đa cấp, CI/CD pipeline.
- **Với IDB Group (Outsource):**
  - **Dự án có bảo mật (NDA / Khách hàng doanh nghiệp):** Lưu **trực tiếp trong `portfolio.ts`** ở dạng thẻ dự án con. Không cần tạo file MDX nếu thông tin thuộc diện bảo mật. Điều này vừa giúp Trí khoe được trọn vẹn kỹ năng thực chiến, vừa tuân thủ cam kết bảo mật mà không tạo rác cho hệ thống nội dung.
  - **Dự án công khai (hoặc giải pháp kiến trúc đã được sanitize / khử thông tin nhạy cảm):** Nếu Trí muốn viết 1 bài case study kỹ thuật chuyên sâu (ví dụ: *"Cách tích hợp Pipecat Voicebot với Asterisk PBX độ trễ <800ms"*), lúc đó ta mới tạo 1 file MDX riêng trong `src/content/projects/`.

---

### 7.3. Những yếu tố THỰC SỰ ảnh hưởng tốc độ tải trang & Cách xử lý triệt để

Nếu nội dung text và MDX không làm chậm trang, thì điều gì có thể làm chậm? Dưới đây là các điểm cần lưu tâm và cách dự án đã tối ưu:

| Yếu tố gây chậm tiềm tàng | Mức độ rủi ro | Cơ chế đã và đang tối ưu trong dự án |
| :--- | :---: | :--- |
| **Hình ảnh & Media dung lượng lớn** (Screenshots, Diagrams PNG/JPG 2–5MB) | Rất cao | - Chuyển sang định dạng hiện đại **WebP / AVIF**.<br>- Luôn gắn thuộc tính `loading="lazy"` và kích thước `width`/`height` tường minh để tránh CLS (Layout Shift). |
| **Thư viện vẽ biểu đồ nặng (`mermaid.js` ~1.8MB)** | Cao | - Không nhúng Mermaid vào trang chủ (`/`) hay trang nơi làm việc (`/experience`).<br>- Chỉ load động (dynamic import) Mermaid khi trang bài viết MDX thực sự có chứa thẻ `pre.mermaid` (Đã được tối ưu trong phiên bản trước). |
| **Công thức toán (`katex.js`)** | Trung bình | - Sử dụng `rehype-katex` để compile công thức toán học thành HTML + CSS tĩnh ngay từ lúc build. Trình duyệt không cần chạy JS runtime để render công thức. |
| **Edge Cache & CDN** | Rất thấp | - Dự án triển khai trên **Cloudflare Pages / Workers** với adapter `@astrojs/cloudflare`. Toàn bộ file tĩnh và HTML được cache tại 300+ edge data center toàn cầu, phản hồi TTFB < 30ms. |

---

## 8. KẾT LUẬN & CHUẨN BỊ BƯỚC TIẾP THEO

Bản kế hoạch trên giải quyết trọn vẹn mong muốn của Trí:
1. **Lột tả đúng thực tế:** Tách biệt rõ nét tính chất **Chuyên sâu một sản phẩm (Rita Võ)** và **Đa nhiệm nhiều dự án khách hàng với từng vai trò riêng (IDB Outsource)**.
2. **Tôn vinh năng lực kỹ thuật:** Giúp nhà tuyển dụng hoặc khách hàng thấy rõ Trí không chỉ biết Odoo ERP mà còn cực kỳ mạnh về Telephony Voicebot AI, PBX, Event Streaming Kafka, và CSDL tại IDB.
3. **Mã nguồn sạch & Tốc độ tải tối đa (100/100):** Tận dụng triệt để Zero-JS của Astro và phân tầng dữ liệu thông minh giữa `portfolio.ts` (Metadata gọn gàng) và `src/content/projects/` (Dossier chuyên sâu).

> 🛑 **CHẾ ĐỘ BRAINSTORM ĐÃ HOÀN TẤT:**  
> Toàn bộ thiết kế và kế hoạch đã được lưu trữ an toàn tại [`docs/experience_redesign_plan.md`](file:///Users/macbookair/Downloads/huynh_minh_tri/tri-portfolio/docs/experience_redesign_plan.md).  
> Theo quy tắc vận hành DUAL MODE, hệ thống sẽ dừng tại đây và **chờ lệnh `/code`** từ bạn để tiến hành lập trình!

