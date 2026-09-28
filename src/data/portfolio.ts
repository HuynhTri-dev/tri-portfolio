/**
 * @name portfolio.ts
 * @description Centralized portfolio profile data, skills, experiences, and technical groupings
 */

export type LocalizedText = {
  en: string;
  vi: string;
};

export type TechnologyDepth = "primary" | "production" | "applied";

export type TechGroup = {
  step: string;
  short: string;
  title: LocalizedText;
  description: LocalizedText;
  signal: {
    value: string;
    label: LocalizedText;
  };
  capabilities: LocalizedText[];
  technologies: {
    name: string;
    depth: TechnologyDepth;
  }[];
  proofs: {
    value: string;
    label?: LocalizedText;
    href?: string;
  }[];
};

export const profileLinks = [
  { number: "01", href: "#education", en: "Education", vi: "Học vấn" },
  { number: "02", href: "#experience", en: "Experience & Teams", vi: "Nơi làm việc & Tổ chức" },
  { number: "03", href: "#projects", en: "Projects", vi: "Dự án" },
  { number: "04", href: "#technical-skill", en: "Technical Skills", vi: "Kỹ năng kỹ thuật" },
  { number: "05", href: "#soft-skill", en: "Soft Skills", vi: "Kỹ năng mềm" },
  { number: "06", href: "#achievements", en: "Achievements", vi: "Thành tựu" },
  { number: "07", href: "#beyond-code", en: "Beyond Code", vi: "Ngoài lập trình" },
  { number: "08", href: "#contact", en: "Contact", vi: "Liên hệ" },
];

export const techGroups: TechGroup[] = [
  {
    step: "01",
    short: "BE",
    title: { en: "Backend Systems", vi: "Hệ thống Backend" },
    description: {
      en: "Designing reliable APIs, workflows and business platforms that can evolve with the product.",
      vi: "Thiết kế API, workflow và nền tảng nghiệp vụ đáng tin cậy, có thể phát triển cùng sản phẩm.",
    },
    signal: {
      value: "10K",
      label: { en: "operational records", vi: "bản ghi vận hành" },
    },
    capabilities: [
      {
        en: "API architecture, authentication and authorization",
        vi: "Kiến trúc API, xác thực và phân quyền",
      },
      {
        en: "Async jobs, event processing and external integrations",
        vi: "Tác vụ bất đồng bộ, xử lý sự kiện và tích hợp ngoài",
      },
      {
        en: "Business workflows, validation and audit tracking",
        vi: "Quy trình nghiệp vụ, kiểm tra dữ liệu và audit",
      },
      {
        en: "Internal tools, reporting APIs and administration systems",
        vi: "Công cụ nội bộ, API báo cáo và hệ thống quản trị",
      },
    ],
    technologies: [
      { name: "TypeScript", depth: "primary" },
      { name: "Node.js", depth: "primary" },
      { name: "Python", depth: "primary" },
      { name: "Express", depth: "production" },
      { name: "FastAPI", depth: "applied" },
      { name: "PostgreSQL", depth: "production" },
      { name: "Odoo 18", depth: "production" },
    ],
    proofs: [
      { value: "OmniMer Health", href: "/projects/omnimer-health" },
      { value: "Rita Võ · ProdID", href: "/projects/ritavo-prodid" },
      { value: "OmniMer Food", href: "/projects/omnimer-food" },
    ],
  },
  {
    step: "02",
    short: "AI",
    title: { en: "AI Agents & Retrieval", vi: "AI Agent & Truy xuất" },
    description: {
      en: "Building AI systems that retrieve evidence, use tools and operate within safety boundaries.",
      vi: "Xây dựng hệ thống AI biết truy xuất bằng chứng, sử dụng công cụ và hoạt động trong giới hạn an toàn.",
    },
    signal: {
      value: "0.85",
      label: { en: "answer relevancy", vi: "độ liên quan câu trả lời" },
    },
    capabilities: [
      {
        en: "Multi-step agent orchestration with LangGraph",
        vi: "Điều phối agent nhiều bước với LangGraph",
      },
      {
        en: "Hybrid RAG with dense, sparse and alias retrieval",
        vi: "Hybrid RAG kết hợp dense, sparse và alias retrieval",
      },
      {
        en: "GraphRAG and knowledge-graph traversal",
        vi: "GraphRAG và duyệt đồ thị tri thức",
      },
      {
        en: "Tool guardrails, memory and response validation",
        vi: "Guardrail cho tool, memory và kiểm tra phản hồi",
      },
    ],
    technologies: [
      { name: "LangGraph", depth: "primary" },
      { name: "LLMs", depth: "primary" },
      { name: "Qdrant", depth: "applied" },
      { name: "Neo4j", depth: "applied" },
      { name: "BGE-M3", depth: "applied" },
      { name: "BM25", depth: "applied" },
    ],
    proofs: [
      {
        value: "0.78",
        label: { en: "Faithfulness", vi: "Faithfulness" },
      },
      {
        value: "90%",
        label: { en: "Safety recall", vi: "Safety recall" },
      },
      { value: "OmniMer Health", href: "/projects/omnimer-health" },
    ],
  },
  {
    step: "03",
    short: "DT",
    title: { en: "Data Platforms", vi: "Nền tảng Dữ liệu" },
    description: {
      en: "Turning realtime and domain data into queryable, reliable system context.",
      vi: "Biến dữ liệu thời gian thực và dữ liệu chuyên ngành thành ngữ cảnh hệ thống đáng tin cậy, có thể truy vấn.",
    },
    signal: {
      value: "<500 ms",
      label: { en: "alert path", vi: "luồng cảnh báo" },
    },
    capabilities: [
      {
        en: "Realtime ingestion and event-driven processing",
        vi: "Thu nhận realtime và xử lý hướng sự kiện",
      },
      {
        en: "Relational, document, vector and graph data modelling",
        vi: "Mô hình dữ liệu quan hệ, document, vector và graph",
      },
      {
        en: "Personalized statistical baselines and anomaly detection",
        vi: "Baseline thống kê cá nhân hóa và phát hiện bất thường",
      },
      {
        en: "Retrieval pipelines and knowledge synchronization",
        vi: "Pipeline truy xuất và đồng bộ tri thức",
      },
    ],
    technologies: [
      { name: "PostgreSQL", depth: "production" },
      { name: "Redis", depth: "applied" },
      { name: "Kafka", depth: "applied" },
      { name: "MongoDB", depth: "applied" },
      { name: "Qdrant", depth: "applied" },
      { name: "Neo4j", depth: "applied" },
    ],
    proofs: [
      {
        value: "Welford",
        label: { en: "Adaptive baseline", vi: "Baseline thích ứng" },
      },
      {
        value: "Z-score",
        label: { en: "Anomaly detection", vi: "Phát hiện bất thường" },
      },
      { value: "Health pipeline", href: "/projects/omnimer-health" },
    ],
  },
  {
    step: "04",
    short: "DV",
    title: { en: "Production Delivery", vi: "Đưa hệ thống lên Production" },
    description: {
      en: "Taking systems from local development to repeatable deployment and operation.",
      vi: "Đưa hệ thống từ môi trường local tới quy trình triển khai và vận hành có thể lặp lại.",
    },
    signal: {
      value: "A → Z",
      label: { en: "architecture to deployment", vi: "kiến trúc tới triển khai" },
    },
    capabilities: [
      {
        en: "Containerized development and deployment",
        vi: "Phát triển và triển khai bằng container",
      },
      {
        en: "CI/CD with automated testing and image publishing",
        vi: "CI/CD với kiểm thử tự động và phát hành image",
      },
      {
        en: "Background workers, caching and service integration",
        vi: "Background worker, caching và tích hợp service",
      },
      {
        en: "Environment standardization and production configuration",
        vi: "Chuẩn hóa môi trường và cấu hình production",
      },
    ],
    technologies: [
      { name: "Docker", depth: "production" },
      { name: "GitHub Actions", depth: "production" },
      { name: "GHCR", depth: "production" },
      { name: "Linux", depth: "applied" },
      { name: "Nginx", depth: "applied" },
      { name: "Redis", depth: "applied" },
    ],
    proofs: [
      { value: "Odoo CI/CD", href: "/projects/ritavo-prodid" },
      { value: "OmniMer services", href: "/projects/omnimer-health" },
      {
        value: "GHCR",
        label: { en: "Image delivery", vi: "Phát hành image" },
      },
    ],
  },
  {
    step: "05",
    short: "UI",
    title: { en: "Product Interfaces", vi: "Giao diện Sản phẩm" },
    description: {
      en: "Connecting backend capabilities to usable mobile and web product experiences.",
      vi: "Đưa năng lực backend đến trải nghiệm sản phẩm mobile và web dễ sử dụng.",
    },
    signal: {
      value: "E2E",
      label: { en: "backend to interface", vi: "backend tới giao diện" },
    },
    capabilities: [
      {
        en: "UX/UI System Design from Figma to coded components",
        vi: "Thiết kế hệ thống UX/UI từ Figma đến component code",
      },
      {
        en: "Flutter applications and API integration",
        vi: "Ứng dụng Flutter và tích hợp API",
      },
      {
        en: "Responsive, content-driven web interfaces",
        vi: "Giao diện web responsive, hướng nội dung",
      },
      {
        en: "End-to-end delivery across client and backend",
        vi: "Bàn giao end-to-end từ client tới backend",
      },
    ],
    technologies: [
      { name: "Figma", depth: "primary" },
      { name: "Flutter", depth: "primary" },
      { name: "Dart", depth: "primary" },
      { name: "Astro", depth: "applied" },
      { name: "Tailwind CSS", depth: "applied" },
      { name: "TypeScript", depth: "primary" },
    ],
    proofs: [
      { value: "OmniMer Health", href: "/projects/omnimer-health" },
      { value: "OmniMer Food", href: "/projects/omnimer-food" },
      {
        value: "Apple Watch",
        label: { en: "Health sync", vi: "Đồng bộ sức khỏe" },
      },
    ],
  },
];

export const softSkills = [
  {
    number: "01",
    en: "Product Ownership",
    vi: "Làm chủ sản phẩm",
    evidenceEn: "Took a solo health platform from backend design and data processing through evaluation and containerized delivery.",
    evidenceVi: "Tự mình đưa nền tảng sức khỏe từ thiết kế backend, xử lý dữ liệu đến đánh giá và triển khai đóng gói.",
  },
  {
    number: "02",
    en: "Analytical Problem Solving",
    vi: "Giải quyết vấn đề",
    evidenceEn: "Applied DFS cycle detection for bills of materials and statistical anomaly detection for wearable health signals.",
    evidenceVi: "Áp dụng DFS để phát hiện chu trình BOM và thống kê để nhận diện bất thường trong dữ liệu sức khỏe.",
  },
  {
    number: "03",
    en: "Cross-team Communication",
    vi: "Giao tiếp liên phòng ban",
    evidenceEn: "Translated a product lifecycle spanning R&D, Marketing, Sales and Purchasing into implementable Odoo workflows.",
    evidenceVi: "Chuyển quy trình sản phẩm xuyên suốt R&D, Marketing, Sales và Purchasing thành workflow Odoo khả thi.",
  },
  {
    number: "04",
    en: "Leadership",
    vi: "Lãnh đạo",
    evidenceEn: "Led and contributed within academic and extracurricular teams, supported by structured planning and clear ownership.",
    evidenceVi: "Dẫn dắt và đóng góp trong các nhóm học thuật, ngoại khóa với kế hoạch và trách nhiệm rõ ràng.",
  },
  {
    number: "05",
    en: "Agile Mindset",
    vi: "Tư duy Agile",
    evidenceEn: "Uses Kanban and sprint planning to break complex product work into visible, testable increments.",
    evidenceVi: "Dùng Kanban và sprint planning để chia công việc phức tạp thành các phần nhỏ, rõ ràng và kiểm thử được.",
  },
  {
    number: "06",
    en: "Fast Learning",
    vi: "Học hỏi nhanh",
    evidenceEn: "Expanded from backend engineering into UI/UX, mobile technology, enterprise Odoo and Agentic AI.",
    evidenceVi: "Mở rộng từ backend sang UI/UX, công nghệ mobile, Odoo doanh nghiệp và Agentic AI.",
  },
];

export const achievements = [
  {
    tagEn: "Academic competition",
    tagVi: "Cuộc thi học thuật",
    titleEn: "Top 5 Excellent Projects",
    titleVi: "Top 5 Dự án xuất sắc",
    metaEn: "Design Your Future · CJ Corporation · 2025",
    metaVi: "Design Your Future · CJ Corporation · 2025",
    descriptionEn: "Recognized among the competition’s five excellent projects for a product-focused solution.",
    descriptionVi: "Được công nhận trong nhóm năm dự án xuất sắc của cuộc thi nhờ giải pháp định hướng sản phẩm.",
    metric: "TOP 5",
    href: "",
  },
  {
    tagEn: "National informatics olympiad",
    tagVi: "Olympic Tin học toàn quốc",
    titleEn: "Open Source Consolation Prize",
    titleVi: "Giải Khuyến khích Phần mềm nguồn mở",
    metaEn: "Vietnam Student Informatics Olympic · 2025",
    metaVi: "Olympic Tin học Sinh viên Việt Nam · 2025",
    descriptionEn: "Contributed to GreenWave, an AI and IoT system for cleaner, smarter urban traffic.",
    descriptionVi: "Đóng góp cho GreenWave, hệ thống AI và IoT hướng đến giao thông đô thị thông minh, sạch hơn.",
    metric: "OLP ’25",
    href: "https://github.com/sonmessia/GreenWave",
  },
  {
    tagEn: "System evaluation",
    tagVi: "Đánh giá hệ thống",
    titleEn: "Agentic AI Benchmark",
    titleVi: "Đánh giá Agentic AI",
    metaEn: "100-question RAGAS benchmark · 20 high-risk scenarios",
    metaVi: "Bộ 100 câu hỏi RAGAS · 20 tình huống rủi ro cao",
    descriptionEn: "Measured 0.85 answer relevancy, 0.78 faithfulness and 90% safety recall.",
    descriptionVi: "Đạt 0.85 độ liên quan, 0.78 độ trung thực và 90% safety recall.",
    metric: "90% SAFE",
    href: "/projects/omnimer-health",
  },
];

export const beyondCards = [
  {
    label: "01 / DESIGN",
    en: "Design curiosity",
    vi: "Tò mò về thiết kế",
    descriptionEn: "Self-learning UI/UX helps turn complex technical systems into clearer, more usable product experiences.",
    descriptionVi: "Tự học UI/UX giúp chuyển các hệ thống kỹ thuật phức tạp thành trải nghiệm sản phẩm rõ ràng, dễ dùng hơn.",
  },
  {
    label: "02 / SYSTEMS",
    en: "Cross-domain thinking",
    vi: "Tư duy liên ngành",
    descriptionEn: "Exploring healthcare, enterprise operations and smart mobility builds a wider view of real-world software problems.",
    descriptionVi: "Khám phá y tế, vận hành doanh nghiệp và giao thông thông minh mở rộng góc nhìn về bài toán phần mềm thực tế.",
  },
  {
    label: "03 / PEOPLE",
    en: "Team energy",
    vi: "Năng lượng đội nhóm",
    descriptionEn: "Academic and extracurricular leadership strengthens initiative, shared responsibility and communication.",
    descriptionVi: "Hoạt động lãnh đạo học thuật và ngoại khóa rèn tính chủ động, trách nhiệm chung và khả năng giao tiếp.",
  },
];

export type ExperienceLink = {
  labelEn: string;
  labelVi: string;
  href: string;
  isExternal?: boolean;
  icon?: string;
};

export type ExperienceTask = {
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  icon?: string;
};

export type ExperienceItem = {
  id: string;
  badgeEn: string;
  badgeVi: string;
  badgeType: "current" | "enterprise" | "core" | "team";
  orgName: string;
  orgHref?: string;
  logo: string;
  roleEn: string;
  roleVi: string;
  periodEn: string;
  periodVi: string;
  locationEn: string;
  locationVi: string;
  overviewEn: string;
  overviewVi: string;
  detailHref: string;
  tasks: ExperienceTask[];
  project: {
    titleEn: string;
    titleVi: string;
    statusEn: string;
    statusVi: string;
    descriptionEn: string;
    descriptionVi: string;
    links: ExperienceLink[];
  };
  technologies: string[];
};

export const experiences: ExperienceItem[] = [
  {
    id: "idb",
    badgeEn: "CURRENT WORKPLACE",
    badgeVi: "VỊ TRÍ HIỆN TẠI",
    badgeType: "current",
    orgName: "IDB Group (Tập đoàn IDB)",
    orgHref: "https://idb.com.vn/All/Support",
    logo: "/images/idb-logo.png",
    roleEn: "Junior Software Engineer",
    roleVi: "Kỹ sư phần mềm (Junior Software Engineer)",
    periodEn: "2026 — PRESENT",
    periodVi: "2026 — HIỆN TẠI",
    locationEn: "Ho Chi Minh City, Vietnam",
    locationVi: "TP. Hồ Chí Minh, Việt Nam",
    overviewEn: "Enterprise software engineering, core backend services, and internal platform architecture.",
    overviewVi: "Kỹ thuật phần mềm doanh nghiệp, phát triển dịch vụ backend cốt lõi và kiến trúc nền tảng nội bộ.",
    detailHref: "/experience/idb",
    tasks: [
      {
        titleEn: "Enterprise Backend Architecture",
        titleVi: "Kiến trúc Backend Doanh nghiệp",
        descriptionEn: "Researching and building foundational backend workflows, API integrations, and internal systems with Python and TypeScript.",
        descriptionVi: "Nghiên cứu và xây dựng workflow backend nền tảng, tích hợp API và hệ thống nội bộ bằng Python và TypeScript.",
        icon: "fa-solid fa-server",
      },
      {
        titleEn: "Telecommunications & Platform Integration",
        titleVi: "Tích hợp Hệ thống Viễn thông",
        descriptionEn: "Integrating enterprise communication pipelines and automated VoIP service management with internal operational portals.",
        descriptionVi: "Tích hợp đường ống viễn thông doanh nghiệp và quản lý tự động dịch vụ VoIP vào cổng vận hành nội bộ.",
        icon: "fa-solid fa-network-wired",
      },
      {
        titleEn: "Database Schema & Query Optimization",
        titleVi: "Tối ưu Cơ sở Dữ liệu & Truy vấn",
        descriptionEn: "Designing relational PostgreSQL schemas, implementing strict data validation, indexing, and automated backup strategies.",
        descriptionVi: "Thiết kế lược đồ quan hệ PostgreSQL, thiết lập kiểm tra ràng buộc dữ liệu, đánh chỉ mục và sao lưu định kỳ.",
        icon: "fa-solid fa-database",
      },
      {
        titleEn: "Security & Role-Based Access Control",
        titleVi: "Bảo mật & Phân quyền Truy cập",
        descriptionEn: "Enforcing authentication security protocols, confidential workflow boundaries, and system activity audit trails.",
        descriptionVi: "Triển khai giao thức bảo mật xác thực, phân vùng quyền hạn bảo mật nội bộ và ghi log lịch sử hệ thống.",
        icon: "fa-solid fa-shield-halved",
      },
    ],
    project: {
      titleEn: "Internal Enterprise Architecture & Systems",
      titleVi: "Kiến trúc & Hệ thống Doanh nghiệp Nội bộ",
      statusEn: "In Development · Confidential",
      statusVi: "Đang phát triển · Bảo mật nội bộ",
      descriptionEn: "Researching and building foundational backend workflows, API integrations, and internal systems (Confidential / currently in active development without public product release).",
      descriptionVi: "Nghiên cứu và xây dựng workflow backend nền tảng, tích hợp API và hệ thống nội bộ (Bảo mật / hiện đang trong quá trình phát triển tích cực, chưa phát hành sản phẩm công khai).",
      links: [
        {
          labelEn: "IDB Support Portal",
          labelVi: "Cổng thông tin IDB",
          href: "https://idb.com.vn/All/Support",
          isExternal: true,
          icon: "fa-arrow-up-right-from-square",
        },
      ],
    },
    technologies: ["Python", "TypeScript", "Software Architecture", "Backend APIs", "PostgreSQL"],
  },
  {
    id: "ritavo",
    badgeEn: "ENTERPRISE ERP",
    badgeVi: "HỆ THỐNG ERP",
    badgeType: "enterprise",
    orgName: "Rita Võ Group (Tập đoàn Rita Võ)",
    orgHref: "https://prodid.ritavo.com/web/login",
    logo: "/images/ritavo-logo.svg",
    roleEn: "Odoo Developer Intern",
    roleVi: "Thực tập sinh Lập trình viên Odoo",
    periodEn: "MAR 2026 — JUN 2026",
    periodVi: "T03/2026 — T06/2026",
    locationEn: "Ho Chi Minh City, Vietnam",
    locationVi: "TP. Hồ Chí Minh, Việt Nam",
    overviewEn: "Engineered customized ERP business logic, data rules, and delivery automation on Odoo 18.",
    overviewVi: "Phát triển nghiệp vụ ERP tùy biến, kiểm soát ràng buộc dữ liệu và tự động hóa triển khai trên nền tảng Odoo 18.",
    detailHref: "/experience/ritavo",
    tasks: [
      {
        titleEn: "ProdID Module Development",
        titleVi: "Phát triển Phân hệ ProdID",
        descriptionEn: "Engineered an internal product lifecycle management (PLM) module connecting R&D, Marketing, Sales, and Purchasing across ~10,000 product records.",
        descriptionVi: "Phát triển module quản lý vòng đời sản phẩm (PLM) kết nối R&D, Marketing, Sales và Mua hàng trên quy mô ~10.000 bản ghi.",
        icon: "fa-solid fa-boxes-stacked",
      },
      {
        titleEn: "BOM & DFS Cycle Detection",
        titleVi: "Thuật toán Phát hiện Chu trình BOM",
        descriptionEn: "Implemented Depth-First Search algorithm to prevent recursive bill-of-materials cycles and circular product dependencies.",
        descriptionVi: "Ứng dụng thuật toán tìm kiếm theo chiều sâu (DFS) nhằm phát hiện và ngăn chặn phụ thuộc vòng lặp trong định mức vật liệu.",
        icon: "fa-solid fa-diagram-project",
      },
      {
        titleEn: "Dynamic Approval Workflows",
        titleVi: "Tự động hóa Quy trình Phê duyệt",
        descriptionEn: "Designed multi-stage approval matrix (Draft -> R&D Review -> Commercial Ready) with automated state transitions and access rights.",
        descriptionVi: "Xây dựng ma trận phê duyệt nhiều bước với quyền hạn theo phòng ban và chuyển trạng thái tự động.",
        icon: "fa-solid fa-list-check",
      },
      {
        titleEn: "PostgreSQL Migration & Pipeline CI/CD",
        titleVi: "Migration Cơ sở Dữ liệu & CI/CD",
        descriptionEn: "Managed schema migrations, Docker Compose environments, and automated GitHub Actions testing for seamless release cycles.",
        descriptionVi: "Quản lý migration lược đồ cơ sở dữ liệu, môi trường Docker Compose và kiểm thử tự động với GitHub Actions.",
        icon: "fa-solid fa-gears",
      },
    ],
    project: {
      titleEn: "ProdID · Odoo 18",
      titleVi: "ProdID · Odoo 18",
      statusEn: "Live Enterprise Portal",
      statusVi: "Cổng vận hành thực tế",
      descriptionEn: "An internal product-lifecycle workflow bridging R&D, Marketing, Sales and Purchasing across roughly 10,000 product records.",
      descriptionVi: "Quy trình vòng đời sản phẩm nội bộ kết nối R&D, Marketing, Sales và Mua hàng trên quy mô xấp xỉ 10.000 bản ghi.",
      links: [
        {
          labelEn: "ProdID Live Portal",
          labelVi: "Cổng đăng nhập ProdID",
          href: "https://prodid.ritavo.com/web/login",
          isExternal: true,
          icon: "fa-arrow-up-right-from-square",
        },
        {
          labelEn: "Case study dossier",
          labelVi: "Hồ sơ dự án",
          href: "/projects/ritavo-prodid",
          isExternal: false,
          icon: "fa-folder-open",
        },
      ],
    },
    technologies: ["Odoo 18", "Python", "PostgreSQL", "Docker", "GitHub Actions", "DFS Cycle Detection"],
  },
  {
    id: "vinagreen",
    badgeEn: "CORE ARCHITECTURE",
    badgeVi: "CÔNG NGHỆ LÕI",
    badgeType: "core",
    orgName: "VinaGreen",
    orgHref: "https://vinagreen.omnimer.io.vn/",
    logo: "/projects/vinagreen/vinar_logo.svg",
    roleEn: "Core Technology (System & Architecture)",
    roleVi: "Công nghệ lõi (Hệ thống & Kiến trúc)",
    periodEn: "2025 — PRESENT",
    periodVi: "2025 — HIỆN TẠI",
    locationEn: "Ho Chi Minh City, Vietnam",
    locationVi: "TP. Hồ Chí Minh, Việt Nam",
    overviewEn: "System specifications, service contracts, and edge cloud infrastructure for sustainable digital platforms.",
    overviewVi: "Định hình chuẩn kiến trúc hệ thống, giao ước dịch vụ và hạ tầng đám mây phân tán cho giải pháp số xanh.",
    detailHref: "/experience/vinagreen",
    tasks: [
      {
        titleEn: "Edge Infrastructure & Low-Latency Delivery",
        titleVi: "Hạ tầng Edge & Truy xuất Tốc độ cao",
        descriptionEn: "Deployed Cloudflare Workers edge functions ensuring fast response times for agricultural telemetry across rural regions.",
        descriptionVi: "Triển khai hàm Edge trên Cloudflare Workers đảm bảo tốc độ phản hồi nhanh cho bà con nông dân và dữ liệu thực địa.",
        icon: "fa-solid fa-cloud",
      },
      {
        titleEn: "AI Farmer Copilot Engine",
        titleVi: "Trợ lý AI Nông vụ Thông minh",
        descriptionEn: "Integrated FastAPI backend with LLM agents to deliver tailored crop drought and salinity mitigation advice based on localized soil conditions.",
        descriptionVi: "Tích hợp backend FastAPI với LLM Agent cung cấp khuyến nghị tưới tiêu và chống nhiễm mặn theo từng loại cây trồng.",
        icon: "fa-solid fa-robot",
      },
      {
        titleEn: "Dynamic Soil Dosage Calculator",
        titleVi: "Công cụ Định lượng Dinh dưỡng Đất",
        descriptionEn: "Engineered real-time calculation models for AgriGel™ and BioBandage™ dosage according to soil salinity (>3‰) and drought indexes.",
        descriptionVi: "Xây dựng thuật toán tính toán chính xác liều lượng AgriGel™ và BioBandage™ theo độ mặn và chu kỳ khô hạn.",
        icon: "fa-solid fa-calculator",
      },
      {
        titleEn: "Circular BioTech System Integration",
        titleVi: "Tích hợp Hệ thống Nông nghiệp Tuần hoàn",
        descriptionEn: "Structured automated product traceability pipelines connecting lab trial data with live digital demonstrations.",
        descriptionVi: "Kết nối dữ liệu thực nghiệm phòng lab với mô hình tương tác trực quan trên trang web công khai.",
        icon: "fa-solid fa-leaf",
      },
    ],
    project: {
      titleEn: "VinaGreen Digital Platform",
      titleVi: "Nền tảng số VinaGreen",
      statusEn: "Live Edge Deployment",
      statusVi: "Đang vận hành trên Edge",
      descriptionEn: "High-performance edge platform designed for resilient operational tracking, data transparency, and scalable service delivery.",
      descriptionVi: "Nền tảng vận hành phân tán trên mạng lưới Edge, tối ưu hóa khả năng giám sát dữ liệu minh bạch và mở rộng dịch vụ.",
      links: [
        {
          labelEn: "ViNar (VinaGreen) Dossier",
          labelVi: "Xem Case Study ViNar",
          href: "/projects/vinagreen",
          isExternal: false,
          icon: "fa-folder-open",
        },
        {
          labelEn: "Live Platform",
          labelVi: "Trang trực tuyến",
          href: "https://vinagreen.omnimer.io.vn/",
          isExternal: true,
          icon: "fa-arrow-up-right-from-square",
        },
      ],
    },
    technologies: ["System Architecture", "Edge Computing", "Cloudflare Workers", "Scalable APIs", "TypeScript"],
  },
  {
    id: "omnimer",
    badgeEn: "AI & PRODUCT R&D",
    badgeVi: "NHÓM R&D & SẢN PHẨM",
    badgeType: "team",
    orgName: "Omnimer Team",
    orgHref: "https://github.com/omnimerteam",
    logo: "/images/omnimer-logo.svg",
    roleEn: "Core Member & System Architect",
    roleVi: "Thành viên kỹ thuật lõi & Kiến trúc sư hệ thống",
    periodEn: "2025 — PRESENT",
    periodVi: "2025 — HIỆN TẠI",
    locationEn: "Distributed / Remote",
    locationVi: "Làm việc từ xa / Phân tán",
    overviewEn: "Steering product architecture and engineering AI agents, GraphRAG retrieval, and real-time health intelligence.",
    overviewVi: "Định hướng kiến trúc sản phẩm, xây dựng AI Agent, truy xuất tri thức GraphRAG và hệ thống sức khỏe thời gian thực.",
    detailHref: "/experience/omnimer",
    tasks: [
      {
        titleEn: "LangGraph Multi-Agent Orchestration",
        titleVi: "Điều phối Multi-Agent bằng LangGraph",
        descriptionEn: "Built autonomous agent workflows with state machines, tool-use guardrails, and dynamic fallback validation.",
        descriptionVi: "Xây dựng máy trạng thái LangGraph cho AI Agent với cơ chế kiểm soát công cụ và fallback an toàn.",
        icon: "fa-solid fa-brain",
      },
      {
        titleEn: "HybridRAG & GraphRAG Pipeline",
        titleVi: "Đường ống Truy xuất HybridRAG & GraphRAG",
        descriptionEn: "Combined dense vector search (Qdrant), BM25 keyword matching, and Neo4j knowledge graph traversal for grounded answers.",
        descriptionVi: "Kết hợp tìm kiếm ngữ nghĩa vector (Qdrant), đối sánh từ khóa BM25 và duyệt đồ thị tri thức Neo4j.",
        icon: "fa-solid fa-circle-nodes",
      },
      {
        titleEn: "Real-time Biometrics Streaming",
        titleVi: "Xử lý Dữ liệu Sinh hiệu Thời gian thực",
        descriptionEn: "Architected high-throughput Kafka & Redis pub/sub pipelines for wearable anomaly detection with <500ms latency.",
        descriptionVi: "Thiết kế đường ống luồng dữ liệu Kafka & Redis phân tích bất thường nhịp tim thời gian thực với độ trễ <500ms.",
        icon: "fa-solid fa-heart-pulse",
      },
      {
        titleEn: "Cross-Platform Flutter Client & Voice AI",
        titleVi: "Ứng dụng Đa nền tảng Flutter & Voice AI",
        descriptionEn: "Developed mobile applications integrating food vision recognition and voice-guided cooking assistance.",
        descriptionVi: "Lập trình ứng dụng di động Flutter tích hợp nhận diện ảnh món ăn và hướng dẫn nấu ăn bằng giọng nói.",
        icon: "fa-solid fa-mobile-screen",
      },
    ],
    project: {
      titleEn: "Multimodal AI Health & Nutrition Suite",
      titleVi: "Hệ sinh thái AI Đa phương thức (Sức khỏe & Dinh dưỡng)",
      statusEn: "Open Source & Research",
      statusVi: "Mã nguồn mở & Nghiên cứu",
      descriptionEn: "A connected suite of intelligent applications including OmniMer Health (anomaly detection & safety-aware RAG), OmniMer Food (vision & voice cooking assistant), and ViNar (deep-tech circular agritech & AI farmer assistant).",
      descriptionVi: "Bộ ứng dụng AI thông minh gồm OmniMer Health (phát hiện bất thường & RAG an toàn), OmniMer Food (trợ lý dinh dưỡng nhận diện món ăn & giọng nói) và ViNar (nông nghiệp tuần hoàn sinh học & trợ lý AI nông vụ).",
      links: [
        {
          labelEn: "Omnimer GitHub",
          labelVi: "GitHub Omnimer",
          href: "https://github.com/omnimerteam",
          isExternal: true,
          icon: "fa-github",
        },
        {
          labelEn: "OmniMer Health Dossier",
          labelVi: "Dự án OmniMer Health",
          href: "/projects/omnimer-health",
          isExternal: false,
          icon: "fa-folder-open",
        },
        {
          labelEn: "OmniMer Food Dossier",
          labelVi: "Dự án OmniMer Food",
          href: "/projects/omnimer-food",
          isExternal: false,
          icon: "fa-folder-open",
        },
      ],
    },
    technologies: ["LangGraph", "FastAPI", "Kafka", "GraphRAG", "Qdrant", "Flutter"],
  },
];

