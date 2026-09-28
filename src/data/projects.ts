/**
 * @name projects.ts
 * @description Centralized project catalogue, categorizations, image assets, and groupings for portfolio archives
 */

export type ProjectCategory = "ai" | "enterprise" | "web" | "desktop" | "other";

export type ProjectGroup = "active" | "case-study" | "github";

export type ProjectMetric = {
  value: string;
  label: string;
  labelVi: string;
};

export type ProjectListItem = {
  id: string;
  title: string;
  description: string;
  descriptionVi: string;
  period: string;
  type: string;
  typeVi: string;
  category: ProjectCategory;
  group: ProjectGroup;
  image?: string;
  organization?: {
    en: string;
    vi: string;
  };
  statusBadge?: {
    en: string;
    vi: string;
    type?: "live" | "enterprise" | "personal";
  };
  technologies: string[];
  metrics?: ProjectMetric[];
  href: string;
  hrefLabel?: string;
  hrefLabelVi?: string;
  liveUrl?: string;
  liveLabel?: string;
  liveLabelVi?: string;
  featured?: boolean;
};

/**
 * The Projects page reads this catalogue directly.
 * It is organized into 3 key segments:
 * 1. "active": Live & running systems (Startup VinaR, Personal, RitaVo)
 * 2. "case-study": Deep-dive case studies with comprehensive dossiers
 * 3. "github": Open-source & academic code archives
 */
export const projects: ProjectListItem[] = [
  // ==========================================
  // SECTION 1: PROJECT ĐANG CHẠY (ACTIVE & RUNNING SYSTEMS)
  // ==========================================
  {
    id: "vinagreen",
    title: "ViNar (VinaGreen)",
    description: "Deep-tech circular agritech turning agro-waste into AgriGel™ and BioBandage™ with an AI farmer copilot.",
    descriptionVi: "Nền tảng nông nghiệp tuần hoàn Deep-tech tái sinh phế phẩm thành AgriGel™ và BioBandage™ tích hợp trợ lý AI.",
    period: "2025 — 2026",
    type: "Startup / Deep-Tech",
    typeVi: "Dự án Startup / Deep-Tech",
    category: "ai",
    group: "active",
    image: "/projects/vinagreen/hero_preview.png",
    organization: {
      en: "Startup ViNar",
      vi: "Startup VinaR",
    },
    statusBadge: {
      en: "Live in Production",
      vi: "Đang vận hành thực tế",
      type: "live",
    },
    technologies: ["Next.js", "TypeScript", "FastAPI", "AI Farmer Agent"],
    metrics: [
      { value: "450×", label: "Water retention", labelVi: "Sức ngậm nước" },
      { value: "88.4%", label: "Salt barrier (>3‰)", labelVi: "Khóa ion mặn" },
      { value: "21 DAYS", label: "Root moisture", labelVi: "Giữ ẩm rễ" },
    ],
    href: "/projects/vinagreen",
    hrefLabel: "Case study",
    hrefLabelVi: "Xem case study",
    liveUrl: "https://vinagreen.omnimer.io.vn/",
    liveLabel: "Live demo",
    liveLabelVi: "Trực tuyến",
    featured: true,
  },
  {
    id: "ai-finance-pro",
    title: "AI Finance Pro",
    description: "Financial analysis workspace unifying market data, Docling PDF extraction, and local AI reasoning.",
    descriptionVi: "Không gian phân tích tài chính kết hợp dữ liệu định lượng, bóc tách báo cáo PDF bằng Docling và AI cục bộ.",
    period: "2024 — 2026",
    type: "AI / Full-stack Product",
    typeVi: "Ứng dụng AI & Full-stack",
    category: "ai",
    group: "active",
    image: "/finance_analysis/1.png",
    organization: {
      en: "Personal Project",
      vi: "Project cá nhân dùng",
    },
    statusBadge: {
      en: "Active Workspace",
      vi: "Đang dùng hàng ngày",
      type: "personal",
    },
    technologies: ["Next.js", "FastAPI", "Ollama LLM", "Docling", "PostgreSQL"],
    metrics: [
      { value: "45m ➔ 2m", label: "Research time saved", labelVi: "Tiết kiệm thời gian" },
      { value: "100%", label: "Objective scoring", labelVi: "Định lượng khách quan" },
    ],
    href: "/projects/finance-analysis",
    hrefLabel: "Case study",
    hrefLabelVi: "Xem case study",
    featured: true,
  },
  {
    id: "prodid",
    title: "ProdID · Odoo 18",
    description: "Enterprise product-lifecycle module connecting procurement, manufacturing, marketing, and approval workflows.",
    descriptionVi: "Module vòng đời sản phẩm nội bộ kết nối mua hàng, sản xuất, marketing và phê duyệt trên 4 phòng ban.",
    period: "MAR — JUL 2026",
    type: "Professional work",
    typeVi: "Kinh nghiệm làm việc",
    category: "enterprise",
    group: "active",
    image: "/projects/ritavo_prodid_preview.jpg",
    organization: {
      en: "RitaVo Company",
      vi: "Công ty RitaVo",
    },
    statusBadge: {
      en: "Enterprise Production",
      vi: "Vận hành nội bộ",
      type: "enterprise",
    },
    technologies: ["Odoo 18", "Python", "PostgreSQL", "Docker Compose"],
    metrics: [
      { value: "~10K", label: "Product records", labelVi: "Bản ghi sản phẩm" },
      { value: "4", label: "Connected departments", labelVi: "Phòng ban kết nối" },
    ],
    href: "/projects/ritavo-prodid",
    hrefLabel: "Case study",
    hrefLabelVi: "Xem case study",
    featured: true,
  },

  // ==========================================
  // SECTION 2: DỰ ÁN TÂM ĐẮC CÓ CASE STUDY (FEATURED CASE STUDIES)
  // ==========================================
  {
    id: "omnimer-health",
    title: "Agentic AI Personal Health",
    description: "Real-time wearable health platform featuring biometrics anomaly detection and a safety-aware HybridRAG agent.",
    descriptionVi: "Nền tảng sức khỏe thời gian thực phát hiện bất thường từ wearable và HybridRAG agent chú trọng an toàn.",
    period: "MAR — JUN 2026",
    type: "Personal project",
    typeVi: "Dự án cá nhân",
    category: "ai",
    group: "case-study",
    image: "/projects/omnimerhealth_preview.jpg",
    technologies: ["FastAPI", "LangGraph", "Kafka", "Qdrant", "Flutter"],
    metrics: [
      { value: "0.85", label: "Answer relevancy", labelVi: "Độ liên quan" },
      { value: "0.78", label: "Faithfulness", labelVi: "Độ trung thực" },
      { value: "90%", label: "Safety recall", labelVi: "Safety recall" },
    ],
    href: "/projects/omnimer-health",
    hrefLabel: "Case study",
    hrefLabelVi: "Xem case study",
    liveUrl: "https://github.com/HuynhTri-dev/omnimer_health",
    liveLabel: "GitHub",
    liveLabelVi: "Mã nguồn",
    featured: true,
  },
  {
    id: "omnimer-food",
    title: "OmniMer Food Assistant",
    description: "Multimodal nutrition copilot combining meal image recognition, GraphRAG safety checks, and voice cooking guide.",
    descriptionVi: "Trợ lý dinh dưỡng đa phương thức kết hợp nhận diện món ăn bằng ảnh, kiểm tra an toàn GraphRAG và giọng nói.",
    period: "2026",
    type: "Team project",
    typeVi: "Dự án nhóm",
    category: "ai",
    group: "case-study",
    image: "/projects/omnimerfood_preview.jpg",
    technologies: ["Flutter", "FastAPI", "GraphRAG", "AI Vision", "Speech AI"],
    metrics: [
      { value: "3 INPUTS", label: "Text, image, voice", labelVi: "Văn bản, ảnh & giọng nói" },
      { value: "2 LAYERS", label: "Safety validation", labelVi: "Kiểm tra an toàn" },
    ],
    href: "/projects/omnimer-food",
    hrefLabel: "Case study",
    hrefLabelVi: "Xem case study",
    liveUrl: "https://www.youtube.com/watch?v=obmTFMHNa2c",
    liveLabel: "Video demo",
    liveLabelVi: "Video demo",
    featured: true,
  },
  {
    id: "cj-crop",
    title: "Design Your Future · CJ Crop",
    description: "End-to-end UX/UI system design for the CJ Corporation competition, recognized in Top 5 Excellent Projects.",
    descriptionVi: "Hệ thống thiết kế UX/UI toàn diện cho cuộc thi của tập đoàn CJ, đạt Top 5 Dự án Xuất sắc toàn quốc.",
    period: "2025",
    type: "Product Design",
    typeVi: "Thiết kế Sản phẩm",
    category: "other",
    group: "case-study",
    image: "/cj_crop/1.png",
    technologies: ["Figma", "UX/UI Design", "System Design", "React/Astro"],
    metrics: [
      { value: "Top 5", label: "Excellent Projects", labelVi: "Dự án xuất sắc" },
      { value: "CJ Crop", label: "Global Competition", labelVi: "Cuộc thi quốc tế" },
    ],
    href: "/projects/cj-crop",
    hrefLabel: "Case study",
    hrefLabelVi: "Xem case study",
    featured: true,
  },

  // ==========================================
  // SECTION 3: PROJECT (GITHUB) CÒN LẠI (CODE ARCHIVE & REPOSITORIES)
  // ==========================================
  {
    id: "omnimer-health-web",
    title: "Omnimer Health · Web",
    description: "Flutter client application for personal wellness tracking and AI health workflows.",
    descriptionVi: "Ứng dụng Flutter cho theo dõi sức khỏe và quy trình hỗ trợ bởi AI.",
    period: "2026",
    type: "Open source",
    typeVi: "Mã nguồn mở",
    category: "web",
    group: "github",
    image: "/projects/omnimerhealth_mobile.png",
    technologies: ["Flutter", "Dart", "REST API"],
    href: "https://github.com/HuynhTri-dev/fitness_omnimer_health",
    hrefLabel: "GitHub",
    hrefLabelVi: "GitHub",
  },
  {
    id: "company-chatbot-lod",
    title: "Company Chatbot LOD",
    description: "Experimental company knowledge chatbot leveraging linked open data and semantic search.",
    descriptionVi: "Chatbot tri thức doanh nghiệp thử nghiệm, xây dựng trên dữ liệu mở liên kết.",
    period: "2025",
    type: "Open source",
    typeVi: "Mã nguồn mở",
    category: "ai",
    group: "github",
    technologies: ["Python", "RDF / SPARQL", "Chatbot"],
    href: "https://github.com/HuynhTri-dev/Company_Chatbot_LOD",
    hrefLabel: "GitHub",
    hrefLabelVi: "GitHub",
  },
  {
    id: "rental-management",
    title: "Rental Management",
    description: "Desktop software managing rooms, tenant leases, billing records, and automated contracts.",
    descriptionVi: "Hệ thống desktop quản lý phòng trọ, khách thuê, hợp đồng và hóa đơn dịch vụ.",
    period: "2025",
    type: "Personal project",
    typeVi: "Dự án cá nhân",
    category: "desktop",
    group: "github",
    image: "/projects/rental_management.png",
    technologies: ["C#", ".NET", "SQL Server", "WinForms"],
    href: "https://github.com/HuynhTri-dev/QuanLyNhaTro",
    hrefLabel: "GitHub",
    hrefLabelVi: "GitHub",
  },
  {
    id: "clothing-store-management",
    title: "Clothing Store Management",
    description: "WinForms retail application for inventory tracking, order logistics, and revenue statistics.",
    descriptionVi: "Ứng dụng WinForms quản lý sản phẩm, tồn kho, giao hàng và báo cáo doanh thu.",
    period: "2024",
    type: "Academic project",
    typeVi: "Dự án học tập",
    category: "desktop",
    group: "github",
    technologies: ["C#", ".NET WinForms", "SQL Server"],
    href: "https://github.com/HuynhTri-dev/DoAnWin_ManageClothStore",
    hrefLabel: "GitHub",
    hrefLabelVi: "GitHub",
  },
  {
    id: "omnishift",
    title: "Omnishift",
    description: "Web application focused on team shift scheduling, operational rosters, and duty handovers.",
    descriptionVi: "Dự án web tối ưu quy trình phân ca làm việc và bàn giao vận hành.",
    period: "2025",
    type: "Open source",
    typeVi: "Mã nguồn mở",
    category: "web",
    group: "github",
    technologies: ["JavaScript", "Web Engine"],
    href: "https://github.com/HuynhTri-dev/omnishift_source",
    hrefLabel: "GitHub",
    hrefLabelVi: "GitHub",
  },
  {
    id: "riskchance",
    title: "RiskChance",
    description: "Interactive C# software simulating probabilistic risk distribution and decision trees.",
    descriptionVi: "Phần mềm C# mô phỏng rủi ro và xác suất qua mô hình tương tác.",
    period: "2025",
    type: "Academic project",
    typeVi: "Dự án học tập",
    category: "desktop",
    group: "github",
    technologies: ["C#", ".NET", "Probability Modeling"],
    href: "https://github.com/HuynhTri-dev/RiskChance",
    hrefLabel: "GitHub",
    hrefLabelVi: "GitHub",
  },
];
