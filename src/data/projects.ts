export type ProjectCategory = "ai" | "enterprise" | "web" | "desktop" | "other";

export type ProjectListItem = {
  title: string;
  description: string;
  descriptionVi: string;
  period: string;
  type: string;
  typeVi: string;
  category: ProjectCategory;
  technologies: string[];
  href: string;
  hrefLabel?: string;
  hrefLabelVi?: string;
  featured?: boolean;
};

/**
 * The Projects page reads this catalogue directly. Add a new object here to
 * publish another row without changing the featured-project layout on Home.
 */
export const projects: ProjectListItem[] = [
  {
    title: "Agentic AI Personal Health Management",
    description:
      "A real-time personal health platform with anomaly detection and a safety-aware HybridRAG agent.",
    descriptionVi:
      "Nền tảng sức khỏe thời gian thực với phát hiện bất thường và HybridRAG agent chú trọng an toàn.",
    period: "2026",
    type: "Personal project",
    typeVi: "Dự án cá nhân",
    category: "ai",
    technologies: ["FastAPI", "LangGraph", "Kafka", "Qdrant", "Flutter"],
    href: "/projects/omnimer-health",
    hrefLabel: "View case study",
    hrefLabelVi: "Xem case study",
    featured: true,
  },
  {
    title: "ProdID · Odoo 18",
    description:
      "An internal product-lifecycle workflow connecting four business functions across roughly 10K records.",
    descriptionVi:
      "Quy trình vòng đời sản phẩm nội bộ kết nối bốn phòng ban trên khoảng 10K bản ghi.",
    period: "2026",
    type: "Professional work",
    typeVi: "Kinh nghiệm làm việc",
    category: "enterprise",
    technologies: ["Odoo 18", "Python", "PostgreSQL", "Docker"],
    href: "/projects/ritavo-prodid",
    hrefLabel: "View case study",
    hrefLabelVi: "Xem case study",
    featured: true,
  },
  {
    title: "Omnimer Health",
    description:
      "The public backend and AI system behind the Omnimer personal health platform.",
    descriptionVi:
      "Backend và hệ thống AI mã nguồn public của nền tảng sức khỏe cá nhân Omnimer.",
    period: "2026",
    type: "Open source",
    typeVi: "Mã nguồn mở",
    category: "ai",
    technologies: ["Python", "FastAPI", "Agentic AI", "RAG"],
    href: "https://github.com/HuynhTri-dev/omnimer_health",
  },
  {
    title: "Omnimer Health · Mobile",
    description:
      "Flutter client for health tracking, personal insights and AI-assisted workflows.",
    descriptionVi:
      "Ứng dụng Flutter cho theo dõi sức khỏe, insight cá nhân và quy trình hỗ trợ bởi AI.",
    period: "2026",
    type: "Open source",
    typeVi: "Mã nguồn mở",
    category: "web",
    technologies: ["Flutter", "Dart", "Mobile"],
    href: "https://github.com/HuynhTri-dev/fitness_omnimer_health",
  },
  {
    title: "Company Chatbot LOD",
    description:
      "An experimental company knowledge chatbot built around linked open data.",
    descriptionVi:
      "Chatbot tri thức doanh nghiệp thử nghiệm, xây dựng trên dữ liệu mở liên kết.",
    period: "2025",
    type: "Open source",
    typeVi: "Mã nguồn mở",
    category: "ai",
    technologies: ["Python", "LOD", "Chatbot"],
    href: "https://github.com/HuynhTri-dev/Company_Chatbot_LOD",
  },
  {
    title: "Rental Management",
    description:
      "A desktop system for rooms, tenants, rental history, services, contracts and billing.",
    descriptionVi:
      "Hệ thống desktop quản lý phòng, khách thuê, lịch sử thuê, dịch vụ, hợp đồng và hóa đơn.",
    period: "2025",
    type: "Personal project",
    typeVi: "Dự án cá nhân",
    category: "desktop",
    technologies: ["C#", ".NET", "SQL Server", "WinForms"],
    href: "https://github.com/HuynhTri-dev/QuanLyNhaTro",
  },
  {
    title: "Startup Investment Support Platform",
    description:
      "A web platform connecting startups and investors with real-time chat and role-based access.",
    descriptionVi:
      "Nền tảng kết nối startup và nhà đầu tư với chat thời gian thực và phân quyền người dùng.",
    period: "2025",
    type: "Academic project",
    typeVi: "Dự án học tập",
    category: "web",
    technologies: ["C#", "ASP.NET MVC", "SQL Server", "SignalR"],
    href: "https://github.com/HuynhTri-dev/QuanLyStartup",
  },
  {
    title: "Clothing Store Management",
    description:
      "A WinForms application for products, inventory, delivery, sales statistics and revenue reports.",
    descriptionVi:
      "Ứng dụng WinForms quản lý sản phẩm, tồn kho, giao hàng, thống kê bán hàng và doanh thu.",
    period: "2024",
    type: "Academic project",
    typeVi: "Dự án học tập",
    category: "desktop",
    technologies: ["C#", ".NET WinForms", "SQL Server", "Google Maps API"],
    href: "https://github.com/HuynhTri-dev/DoAnWin_ManageClothStore",
  },
  {
    title: "Campus Event Management",
    description:
      "A web project exploring workflows for organizing and managing campus events.",
    descriptionVi:
      "Dự án web thử nghiệm quy trình tổ chức và quản lý sự kiện trong trường.",
    period: "2025",
    type: "Academic project",
    typeVi: "Dự án học tập",
    category: "web",
    technologies: ["JavaScript", "Web"],
    href: "https://github.com/HuynhTri-dev/DACS_QLSKCS",
  },
  {
    title: "Omnishift",
    description:
      "A JavaScript project focused on shift-based operational workflows.",
    descriptionVi:
      "Dự án JavaScript tập trung vào các quy trình vận hành theo ca.",
    period: "2025",
    type: "Open source",
    typeVi: "Mã nguồn mở",
    category: "web",
    technologies: ["JavaScript", "Web"],
    href: "https://github.com/HuynhTri-dev/omnishift_source",
  },
  {
    title: "Office Supplies Network App",
    description:
      "A network-programming project for managing office-supply data and operations.",
    descriptionVi:
      "Dự án lập trình mạng phục vụ quản lý dữ liệu và vận hành văn phòng phẩm.",
    period: "2025",
    type: "Academic project",
    typeVi: "Dự án học tập",
    category: "web",
    technologies: ["JavaScript", "Networking"],
    href: "https://github.com/HuynhTri-dev/QLVanPhongPham_LapTrinhMang",
  },
  {
    title: "RiskChance",
    description:
      "A C# project exploring risk and probability through an interactive software model.",
    descriptionVi:
      "Dự án C# mô phỏng rủi ro và xác suất qua một mô hình phần mềm tương tác.",
    period: "2025",
    type: "Academic project",
    typeVi: "Dự án học tập",
    category: "desktop",
    technologies: ["C#", ".NET"],
    href: "https://github.com/HuynhTri-dev/RiskChance",
  },
  {
    title: "Tết Mini Games",
    description:
      "A playful TypeScript collection of small interactive experiences for Tết.",
    descriptionVi:
      "Bộ mini game tương tác vui nhộn cho dịp Tết, xây dựng bằng TypeScript.",
    period: "2026",
    type: "Creative project",
    typeVi: "Dự án sáng tạo",
    category: "web",
    technologies: ["TypeScript", "Web"],
    href: "https://github.com/HuynhTri-dev/tro_choi_tet",
  },
  {
    title: "Flower",
    description:
      "A small TypeScript visual experiment built for the web.",
    descriptionVi:
      "Thử nghiệm hình ảnh nhỏ trên web được xây dựng bằng TypeScript.",
    period: "2025",
    type: "Creative project",
    typeVi: "Dự án sáng tạo",
    category: "web",
    technologies: ["TypeScript", "Web"],
    href: "https://github.com/HuynhTri-dev/flower",
  },
];
