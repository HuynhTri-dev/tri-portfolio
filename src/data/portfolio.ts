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

export type WorkplaceModel = "product" | "outsource" | "rd_team" | "core_tech";

export type ClientPartner = {
  name: string;
  logo: string;
  domainEn?: string;
  domainVi?: string;
};

export type ProjectEngagement = {
  id: string;
  titleEn: string;
  titleVi: string;
  roleEn?: string;
  roleVi?: string;
  clientName?: string;
  clientLogo?: string;
  clientDomainEn?: string;
  clientDomainVi?: string;
  periodEn?: string;
  periodVi?: string;
  isConfidential?: boolean;
  difficultyRank?: "S" | "A" | "B";
  tierLabelEn?: string;
  tierLabelVi?: string;
  unlockedEn?: string;
  unlockedVi?: string;
  statusEn: string;
  statusVi: string;
  descriptionEn: string;
  descriptionVi: string;
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
  roleEn: string;
  roleVi: string;
  periodEn: string;
  periodVi: string;
  locationEn: string;
  locationVi: string;
  overviewEn: string;
  overviewVi: string;
  detailHref: string;
  clientPartners?: ClientPartner[];
  projects: ProjectEngagement[];
  tasks: ExperienceTask[];
  project: ProjectEngagement;
  technologies: string[];
};

export const experiences: ExperienceItem[] = [
  {
    id: "idb",
    model: "outsource",
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
    overviewEn: "Enterprise client solutions, telecom & 3CX PBX integration, voicebot AI development for commercial banks (Sacombank, Nam A Bank, TNEX), loan clearance document automation, and realtime Redis/RabbitMQ event pipelines.",
    overviewVi: "Phát triển giải pháp kỹ thuật khách hàng doanh nghiệp, tích hợp tổng đài 3CX, phát triển Voicebot AI cho hệ thống ngân hàng (Sacombank, Nam Á Bank, TNEX), tự động hóa văn bản pháp lý tín dụng và đường ống dữ liệu thời gian thực Redis/RabbitMQ.",
    detailHref: "/experience/idb",
    clientPartners: [
      { name: "Sacombank", logo: "/images/clients/sacombank.svg", domainEn: "Tier-1 Commercial Banking", domainVi: "Ngân hàng Thương mại Cổ phần" },
      { name: "Vietmap", logo: "/images/clients/vietmap.png", domainEn: "Navigation & Telematics", domainVi: "Bản đồ số & Giải pháp Viễn thông" },
      { name: "ZaloPay", logo: "/images/clients/zalopay.svg", domainEn: "Fintech & Payment Gateway", domainVi: "Cổng thanh toán & Ví điện tử" },
      { name: "Aqua", logo: "/images/clients/aqua.png", domainEn: "Consumer Electronics CRM", domainVi: "Điện máy & Quản trị Khách hàng" },
      { name: "Nam A Bank", logo: "/images/clients/namabank.png", domainEn: "Commercial Banking", domainVi: "Ngân hàng Thương mại" },
      { name: "TNEX", logo: "/images/clients/tnex.png", domainEn: "Digital Banking Platform", domainVi: "Ngân hàng Thuần số" },
    ],
    projects: [
      {
        id: "idb-sacombank-voicebot",
        titleEn: "Sacombank Enterprise Voicebot AI System",
        titleVi: "Hệ thống Voicebot AI Ngân hàng Sacombank",
        roleEn: "Core Voicebot Developer",
        roleVi: "Lập trình viên Lõi Voicebot AI",
        clientName: "Sacombank",
        clientLogo: "/images/clients/sacombank.svg",
        clientDomainEn: "Tier-1 Commercial Banking & Financial Services (Sacombank)",
        clientDomainVi: "Ngân hàng Thương mại & Dịch vụ Tài chính (Sacombank)",
        periodEn: "OCT 2026 — PRESENT",
        periodVi: "T10/2026 — HIỆN TẠI",
        isConfidential: true,
        difficultyRank: "S",
        tierLabelEn: "TIER-1 BANKING CORE",
        tierLabelVi: "NGÂN HÀNG CẤP 1 · HỆ THỐNG LÕI",
        unlockedEn: "Sub-800ms Streaming Audio Latency & Production Dialogue Engine",
        unlockedVi: "Độ trễ luồng âm thanh <800ms & Động cơ hội thoại Production",
        statusEn: "Production Core Dev · Active Deployment",
        statusVi: "Phát triển Lõi · Đang triển khai thực tế",
        descriptionEn: "Main developer engineering the intelligent conversational voicebot system for Sacombank. Architecting low-latency audio streaming pipelines, dialogue state machines, banking customer service workflows, and backend API integrations.",
        descriptionVi: "Lập trình viên chính phát triển hệ thống Voicebot AI thông minh cho Ngân hàng Sacombank. Xây dựng đường ống âm thanh độ trễ thấp, máy trạng thái hội thoại tự động, kịch bản nghiệp vụ ngân hàng và tích hợp API backend.",
        tasks: [
          {
            titleEn: "Voicebot Core Engine & Dialogue Flow",
            titleVi: "Phát triển Lõi Voicebot & Luồng Hội thoại",
            descriptionEn: "Implemented core conversation orchestrations, intent recognition, and dynamic fallback handling for banking queries.",
            descriptionVi: "Phát triển bộ điều phối hội thoại lõi, nhận diện ý định và cơ chế xử lý fallback linh hoạt cho các truy vấn ngân hàng.",
            icon: "fa-solid fa-robot",
          },
          {
            titleEn: "Sub-Second Latency Audio Optimization",
            titleVi: "Tối ưu hóa Độ trễ Luồng Âm thanh",
            descriptionEn: "Fine-tuned streaming audio pipelines with STT and TTS integrations ensuring natural customer response latency (<800ms).",
            descriptionVi: "Tinh chỉnh luồng âm thanh streaming kết hợp STT/TTS đảm bảo phản hồi tức thì và tự nhiên với khách hàng (<800ms).",
            icon: "fa-solid fa-headset",
          },
        ],
        technologies: ["Python", "FastAPI", "Voicebot AI", "STT/TTS", "Banking Integration", "Redis"],
      },
      {
        id: "idb-vietmap-telephony",
        titleEn: "Vietmap 3CX Multi-Leg Telephony & RabbitMQ Pipeline",
        titleVi: "Xử lý Vòng đời Cuộc gọi 3CX Multi-Leg & RabbitMQ (Vietmap)",
        roleEn: "Telephony & Integration Engineer",
        roleVi: "Kỹ sư Tích hợp & Xử lý Viễn thông",
        clientName: "Vietmap",
        clientLogo: "/images/clients/vietmap.png",
        clientDomainEn: "Logistics & Digital Map Telephony (Vietmap)",
        clientDomainVi: "Viễn thông Vận tải & Bản đồ Số (Vietmap)",
        periodEn: "OCT 2026",
        periodVi: "T10/2026",
        isConfidential: true,
        difficultyRank: "S",
        tierLabelEn: "HIGH-STAKES TELEPHONY",
        tierLabelVi: "TỔNG ĐÀI VIỄN THÔNG TRỌNG YẾU",
        unlockedEn: "100% Zero-Loss Call Leg Event Delivery to RabbitMQ",
        unlockedVi: "100% Không thất thoát sự kiện chuyển Leg sang RabbitMQ",
        statusEn: "Resolved & Verified in Production",
        statusVi: "Đã xử lý dứt điểm & Vận hành thực tế",
        descriptionEn: "Resolved a critical data loss defect occurring when 3CX agents answered and transferred calls across multiple legs, causing missing action logs in PBX services. Engineered an algorithm to track and map call legs via CallID, ensuring full and accurate event delivery to RabbitMQ queues.",
        descriptionVi: "Xử lý dứt điểm lỗi mất dữ liệu action khi điện thoại viên trên 3CX bắt máy và chuyển leg khiến PBX Service gửi thiếu dữ liệu cho RabbitMQ. Viết thuật toán theo dõi Leg qua CallID để ánh xạ chuẩn xác toàn bộ vòng đời cuộc gọi, đảm bảo gửi đủ và đúng 100% action sự kiện vào RabbitMQ.",
        tasks: [
          {
            titleEn: "Call Leg Tracking & CallID Mapping Algorithm",
            titleVi: "Thuật toán Theo dõi Leg & Ánh xạ CallID",
            descriptionEn: "Engineered stateful tracking to correlate disparate 3CX call legs into unified call action sequences.",
            descriptionVi: "Thiết kế cơ chế theo dõi trạng thái đồng bộ các leg cuộc gọi rời rạc trên 3CX thành chuỗi sự kiện hoàn chỉnh.",
            icon: "fa-solid fa-diagram-project",
          },
          {
            titleEn: "RabbitMQ Event Pipeline Delivery",
            titleVi: "Đường ống Luồng Sự kiện RabbitMQ",
            descriptionEn: "Guaranteed reliable message queue publishing with zero dropped events for downstream analytics.",
            descriptionVi: "Đảm bảo xuất bản message vào RabbitMQ tin cậy, không thất thoát sự kiện phục vụ các dịch vụ phân tích phía sau.",
            icon: "fa-solid fa-arrows-split-up-and-left",
          },
        ],
        technologies: ["C#", ".NET", "RabbitMQ", "3CX Phone System", "Event-Driven"],
      },
      {
        id: "idb-welcome-report",
        titleEn: "Loan Settlement Clearance Automation & Legal Document Engine",
        titleVi: "Hệ thống Xuất Giấy tờ Tất toán Khoản vay & Tự động hóa Pháp lý",
        roleEn: "Backend Engineer & Solution Developer",
        roleVi: "Kỹ sư Backend & Phát triển Giải pháp",
        clientName: "Consumer Lending Operations",
        clientLogo: "/images/idb-logo.png",
        clientDomainEn: "Banking & Consumer Lending Operations",
        clientDomainVi: "Tài chính Tiêu dùng & Cho vay Ngân hàng",
        periodEn: "OCT 2026",
        periodVi: "T10/2026",
        isConfidential: true,
        difficultyRank: "A",
        tierLabelEn: "LEGAL FINTECH WORKFLOW",
        tierLabelVi: "TỰ ĐỘNG HÓA PHÁP LÝ TÍN DỤNG",
        unlockedEn: "Automated NOL PDF/Word Export with Digital Signatures & Audit Trail",
        unlockedVi: "Tự động hóa 100% chứng nhận NOL kèm chữ ký số, con dấu & audit log",
        statusEn: "Production Operational · Handover Complete",
        statusVi: "Vận hành Thực tế · Đã bàn giao tài liệu",
        descriptionEn: "Engineered an automated clearance document engine (Notice of Loan - NOL) exporting settlement verification files to PDF and Word with digital signatures and corporate seals. Built contract override mechanisms, signatory delegation (Director / Authorized Rep), document numbering, revision tracking, download metrics, optimized queries, and comprehensive audit logs.",
        descriptionVi: "Xây dựng hệ thống tự động xuất giấy tờ hoàn tất thanh toán khoản vay (NOL) ra PDF và Word có gán chữ ký điện tử và con dấu (mộc). Cho phép override thông tin hợp đồng, chọn người ký (Giám đốc / Người được ủy quyền), quản lý số văn bản, phiên bản, số lần tải; tối ưu truy vấn CSDL, thiết kế log vận hành và soạn thảo tài liệu bàn giao.",
        tasks: [
          {
            titleEn: "Legal Document Generation & Digital Stamps",
            titleVi: "Tự động Xuất Giấy tờ PDF/Word & Gán Con dấu",
            descriptionEn: "Automated generation of loan clearance certificates with digital signature and corporate stamp placement.",
            descriptionVi: "Tự động hóa xuất chứng nhận tất toán kèm chèn chữ ký số và con dấu pháp lý của người đại diện có thẩm quyền.",
            icon: "fa-solid fa-file-signature",
          },
          {
            titleEn: "Contract Override & Operational Audit Logs",
            titleVi: "Cơ chế Override Hợp đồng & Nhật ký Vận hành",
            descriptionEn: "Implemented versioning, document numbering, download counts, and strict database audit tracking in MySQL.",
            descriptionVi: "Xây dựng quản lý phiên bản, cấp số công văn, đếm lượt tải và ghi nhận nhật ký kiểm toán vận hành trên MySQL.",
            icon: "fa-solid fa-clock-rotate-left",
          },
        ],
        technologies: ["Python", "FastAPI", "MySQL", "Joget Workflow", "PDF/Word Automation", "Digital Signature"],
      },
      {
        id: "idb-zalo-call-monitor",
        titleEn: "Zalo Call Monitor · Realtime Telephony Dashboard (ZaloPay)",
        titleVi: "Hệ thống Giám sát Cuộc gọi Realtime ZaloPay (3CX to Redis)",
        roleEn: "Backend Engineer (Realtime Telephony Data)",
        roleVi: "Kỹ sư Backend (Dữ liệu Viễn thông Thời gian thực)",
        clientName: "ZaloPay",
        clientLogo: "/images/clients/zalopay.svg",
        clientDomainEn: "Fintech & Payment Gateway (ZaloPay)",
        clientDomainVi: "Fintech & Cổng Thanh toán Điện tử (ZaloPay)",
        periodEn: "SEP 2026",
        periodVi: "T09/2026",
        isConfidential: true,
        difficultyRank: "S",
        tierLabelEn: "FINTECH TELEMETRY",
        tierLabelVi: "GIÁM SÁT THỜI GIAN THỰC FINTECH",
        unlockedEn: "Live 3CX-to-Redis Wallboard Pipeline & Full Architecture Handover",
        unlockedVi: "Đường ống 3CX sang Redis thời gian thực & bàn giao trọn bộ kiến trúc",
        statusEn: "Production Operational · Handover Complete",
        statusVi: "Đã Bàn giao & Đang vận hành",
        descriptionEn: "Engineered high-throughput backend services collecting realtime telephony statistics from 3CX Phone System and caching live metrics into Redis to power the supervisor dashboard portal for ZaloPay support teams. Authored complete operational handover documentation.",
        descriptionVi: "Phát triển dịch vụ backend thu thập dữ liệu cuộc gọi thời gian thực từ tổng đài 3CX và lưu trữ vào Redis để frontend đẩy lên Dashboard giám sát cho đội ngũ vận hành ZaloPay. Biên soạn toàn bộ tài liệu kỹ thuật bàn giao.",
        tasks: [
          {
            titleEn: "3CX Realtime Data Ingestion to Redis",
            titleVi: "Thu thập Dữ liệu Cuộc gọi 3CX sang Redis",
            descriptionEn: "Extracted call metrics from 3CX APIs and streamed active queues into low-latency Redis cache.",
            descriptionVi: "Trích xuất dữ liệu cuộc gọi từ 3CX và đồng bộ luồng hàng đợi cuộc gọi vào Redis với độ trễ tối thiểu.",
            icon: "fa-solid fa-database",
          },
          {
            titleEn: "Technical Handover Documentation",
            titleVi: "Soạn thảo Tài liệu Bàn giao Kỹ thuật",
            descriptionEn: "Documented architecture specs, failover procedures, and data models for maintenance teams.",
            descriptionVi: "Viết tài liệu kiến trúc, quy trình xử lý sự cố và mô hình dữ liệu bàn giao cho đội ngũ vận hành.",
            icon: "fa-solid fa-book",
          },
        ],
        technologies: ["C#", ".NET", "Redis", "3CX Phone System", "REST APIs", "Documentation"],
      },
      {
        id: "idb-aqua-call-monitor",
        titleEn: "Aqua CRM · Realtime Call Monitor & Redis Cache Optimization",
        titleVi: "Tối ưu Dữ liệu Call Monitor Redis cho CRM Aqua",
        roleEn: "Telephony Support & Data Engineer",
        roleVi: "Kỹ sư Hỗ trợ Viễn thông & Dữ liệu",
        clientName: "Aqua",
        clientLogo: "/images/clients/aqua.png",
        clientDomainEn: "Enterprise CRM & Consumer Electronics (Aqua)",
        clientDomainVi: "Hệ thống CRM & Điện máy Doanh nghiệp (Aqua)",
        periodEn: "SEP 2026 — OCT 2026",
        periodVi: "T09/2026 — T10/2026",
        isConfidential: true,
        difficultyRank: "A",
        tierLabelEn: "ENTERPRISE CRM",
        tierLabelVi: "QUẢN TRỊ KHÁCH HÀNG DOANH NGHIỆP",
        unlockedEn: "Eliminated Race Conditions with Atomic Redis Call State Updates",
        unlockedVi: "Xóa bỏ race condition bằng cơ chế cập nhật trạng thái nguyên tử trên Redis",
        statusEn: "Production Stabilized",
        statusVi: "Đã ổn định Vận hành",
        descriptionEn: "Investigated, debugged, and resolved call data processing anomalies between the PBX monitor and Redis cache, ensuring accurate live call volume metrics on the supervisor CRM dashboard for Aqua customer care.",
        descriptionVi: "Hỗ trợ điều tra, gỡ lỗi và khắc phục sai lệch dữ liệu cuộc gọi giữa tổng đài và Redis cache, đảm bảo số liệu cuộc gọi thời gian thực hiển thị chuẩn xác trên Dashboard quản trị CRM của Aqua.",
        tasks: [
          {
            titleEn: "Redis Cache Synchronization & Anomaly Debugging",
            titleVi: "Khắc phục Sai lệch Dữ liệu & Đồng bộ Redis",
            descriptionEn: "Identified race conditions in call event updates and implemented atomic Redis data updates.",
            descriptionVi: "Phát hiện race condition khi cập nhật sự kiện cuộc gọi và áp dụng cơ chế cập nhật nguyên tử trên Redis.",
            icon: "fa-solid fa-bug",
          },
        ],
        technologies: ["Redis", "C#", "CRM Integration", "3CX Telephony", "Data Debugging"],
      },
      {
        id: "idb-sacombank-poc",
        titleEn: "Sacombank Voicebot Scenario QA-QC & Banking PoC Validation",
        titleVi: "Kiểm thử Kịch bản QA-QC & Xác thực PoC Voicebot Sacombank",
        roleEn: "Voice AI QA & PoC Engineer",
        roleVi: "Kỹ sư QA & Triển khai PoC Voice AI",
        clientName: "Sacombank",
        clientLogo: "/images/clients/sacombank.svg",
        clientDomainEn: "Tier-1 Commercial Banking (Sacombank)",
        clientDomainVi: "Ngân hàng Thương mại Cổ phần (Sacombank)",
        periodEn: "SEP 2026 — OCT 2026",
        periodVi: "T09/2026 — T10/2026",
        isConfidential: true,
        difficultyRank: "A",
        tierLabelEn: "TIER-1 BANKING POC",
        tierLabelVi: "NGHIỆM THU POC NGÂN HÀNG",
        unlockedEn: "PoC Approved · Converted Directly into Main Production Contract",
        unlockedVi: "Nghiệm thu PoC thành công · Chuyển sang hợp đồng phát triển chính thức",
        statusEn: "PoC Approved · Converted to Core Dev",
        statusVi: "PoC Thành công · Chuyển sang Phát triển Lõi",
        descriptionEn: "Designed end-to-end banking test matrices, branch background-noise stress tests, and live executive PoC demonstrations for Sacombank's conversational AI hotline, directly securing greenlight approval for full production engineering.",
        descriptionVi: "Xây dựng ma trận kiểm thử nghiệp vụ ngân hàng, giả lập nhiễu âm thanh quầy giao dịch và trình diễn PoC trực tiếp trước hội đồng kỹ thuật Sacombank, góp phần chuyển đổi thành dự án phát triển chính thức.",
        tasks: [
          {
            titleEn: "Retail Banking Intent & Noise Stress Testing",
            titleVi: "Kiểm thử Cây Ý định & Chống nhiễu Giao dịch",
            descriptionEn: "Validated card locking, transaction inquiry, and multi-turn escalation flows under realistic acoustic noise.",
            descriptionVi: "Kiểm chứng luồng khóa thẻ khẩn cấp, tra cứu giao dịch và chuyển tổng đài viên dưới môi trường nhiễu thực tế.",
            icon: "fa-solid fa-vial-circle-check",
          },
          {
            titleEn: "Stakeholder PoC Sandbox & Conversion",
            titleVi: "Dựng Sandbox Demo & Nghiệm thu Hội đồng",
            descriptionEn: "Configured live telephony demo scenarios and benchmarked response accuracy for banking stakeholders.",
            descriptionVi: "Cấu hình kịch bản gọi thử trực tiếp và đo kiểm độ chính xác phản hồi phục vụ nghiệm thu PoC.",
            icon: "fa-solid fa-award",
          },
        ],
        technologies: ["Voice AI", "Banking QA/QC", "STT/TTS Benchmarking", "Conversational Flows"],
      },
      {
        id: "idb-namabank-poc",
        titleEn: "Nam Á Bank Voicebot PoC & Regional Dialect Tuning",
        titleVi: "Triển khai PoC Voicebot & Tinh chỉnh Phương ngữ Nam Á Bank",
        roleEn: "Voice AI QA & PoC Specialist",
        roleVi: "Chuyên viên QA & Tinh chỉnh PoC Voice AI",
        clientName: "Nam Á Bank",
        clientLogo: "/images/clients/namabank.png",
        clientDomainEn: "Commercial Banking & Credit Services (Nam Á Bank)",
        clientDomainVi: "Ngân hàng Thương mại & Dịch vụ Tín dụng (Nam Á Bank)",
        periodEn: "SEP 2026 — OCT 2026",
        periodVi: "T09/2026 — T10/2026",
        isConfidential: true,
        difficultyRank: "A",
        tierLabelEn: "COMMERCIAL BANKING POC",
        tierLabelVi: "THỬ NGHIỆM VOICE AI NGÂN HÀNG",
        unlockedEn: "Multi-Region Vietnamese Dialect Coverage (North · Central · South)",
        unlockedVi: "Chuẩn hóa nhận diện phương ngữ Bắc · Trung · Nam cho nghiệp vụ thẻ",
        statusEn: "PoC Delivered & Benchmarked",
        statusVi: "Đã hoàn tất PoC & Đo kiểm",
        descriptionEn: "Conducted specialized speech recognition testing across Northern, Central, and Southern Vietnamese accents and validated automated credit card & account inquiry flows for Nam Á Bank's PoC evaluation.",
        descriptionVi: "Thực hiện kiểm thử chuyên sâu nhận diện giọng nói đa vùng miền (Bắc · Trung · Nam) và xác thực kịch bản tư vấn mở thẻ tín dụng, tra cứu số dư tự động trong khuôn khổ PoC cho Nam Á Bank.",
        tasks: [
          {
            titleEn: "Regional Dialect & Phonetic Edge-Case QA",
            titleVi: "Kiểm thử Phương ngữ & Từ vựng Tài chính",
            descriptionEn: "Evaluated STT accuracy on banking terminology, numerical sequences, and regional pronunciation variants.",
            descriptionVi: "Đánh giá độ chính xác STT trên thuật ngữ ngân hàng, chuỗi số tài khoản và biến thể phát âm vùng miền.",
            icon: "fa-solid fa-language",
          },
          {
            titleEn: "Credit & Account Advisory Demo Flows",
            titleVi: "Kịch bản Tư vấn Thẻ & Tài khoản Tự động",
            descriptionEn: "Prepared structured PoC demonstration scripts showcasing natural barge-in and fallback recovery.",
            descriptionVi: "Xây dựng kịch bản trình diễn PoC thể hiện khả năng ngắt lời tự nhiên và xử lý ngoại lệ mượt mà.",
            icon: "fa-solid fa-credit-card",
          },
        ],
        technologies: ["Voice AI", "Dialect QA", "Credit Workflows", "PoC Demonstration"],
      },
      {
        id: "idb-tnex-poc",
        titleEn: "TNEX Pure Digital Bank Conversational AI PoC Sandbox",
        titleVi: "Xây dựng Sandbox PoC Hội thoại AI cho Ngân hàng Thuần số TNEX",
        roleEn: "Voice AI PoC & Sandbox Specialist",
        roleVi: "Chuyên viên Sandbox & PoC Ngân hàng Số",
        clientName: "TNEX",
        clientLogo: "/images/clients/tnex.png",
        clientDomainEn: "Pure Digital Banking Platform (TNEX)",
        clientDomainVi: "Ngân hàng Thuần số Thế hệ mới (TNEX)",
        periodEn: "SEP 2026 — OCT 2026",
        periodVi: "T09/2026 — T10/2026",
        isConfidential: true,
        difficultyRank: "A",
        tierLabelEn: "DIGITAL-ONLY BANKING POC",
        tierLabelVi: "POC NGÂN HÀNG THUẦN SỐ",
        unlockedEn: "Interactive Gen-Z Digital Banking Voice Sandbox Ready for Executive Review",
        unlockedVi: "Hoàn thiện môi trường Sandbox AI tốc độ cao cho ngân hàng thuần số",
        statusEn: "PoC Sandbox Delivered",
        statusVi: "Đã bàn giao Phiên bản Demo PoC",
        descriptionEn: "Configured an interactive conversational AI sandbox tailored for TNEX Digital Bank's mobile-first user journeys, validating rapid onboarding, eKYC support FAQs, and low-latency turn-taking.",
        descriptionVi: "Thiết lập môi trường sandbox hội thoại AI chuyên biệt cho hành trình người dùng thuần số của TNEX, kiểm chứng kịch bản hỗ trợ eKYC, giải đáp tự động 24/7 và tốc độ phản hồi tức thời.",
        tasks: [
          {
            titleEn: "Digital-First eKYC & Support Flow Validation",
            titleVi: "Kiểm chứng Kịch bản eKYC & Hỗ trợ Số 24/7",
            descriptionEn: "Tested high-frequency digital banking support intents, app troubleshooting, and rapid turn-taking dialogues.",
            descriptionVi: "Kiểm thử các ý định hỗ trợ tần suất cao trên ứng dụng số, hướng dẫn định danh eKYC và hội thoại nhịp nhanh.",
            icon: "fa-solid fa-mobile-retro",
          },
          {
            titleEn: "Executive PoC Environment & Latency Audit",
            titleVi: "Cấu hình Môi trường Demo & Đo kiểm Độ trễ",
            descriptionEn: "Verified end-to-end audio stability and conversational persona alignment during live stakeholder sessions.",
            descriptionVi: "Đảm bảo độ ổn định âm thanh đầu-cuối và phong cách giao tiếp trẻ trung đúng định vị thương hiệu TNEX.",
            icon: "fa-solid fa-display",
          },
        ],
        technologies: ["Conversational AI", "Digital Banking", "Sandbox PoC", "Turn-Taking QA"],
      },
    ],
    tasks: [
      {
        titleEn: "Enterprise Voicebot & PBX Integration",
        titleVi: "Tích hợp Tổng đài PBX & Voicebot Doanh nghiệp",
        descriptionEn: "Developing core voicebot pipelines, dialogue orchestration, and telephony connectors with 3CX and Asterisk for banking clients.",
        descriptionVi: "Phát triển đường ống Voicebot cốt lõi, điều phối hội thoại và bộ kết nối viễn thông 3CX/Asterisk cho các ngân hàng.",
        icon: "fa-solid fa-headset",
      },
      {
        titleEn: "Realtime Telemetry & Event Streaming",
        titleVi: "Giám sát Thời gian thực & Xử lý Luồng Sự kiện",
        descriptionEn: "Building high-throughput message streaming with Redis and RabbitMQ to process live call events without data loss.",
        descriptionVi: "Xây dựng luồng xử lý thông điệp thông lượng cao với Redis và RabbitMQ xử lý dữ liệu cuộc gọi không thất thoát.",
        icon: "fa-solid fa-arrows-split-up-and-left",
      },
      {
        titleEn: "Legal Document Engine & API Workflows",
        titleVi: "Hệ thống Tự động hóa Văn bản Pháp lý & API",
        descriptionEn: "Architecting document generation with digital signatures, contract override controls, and audit trails on FastAPI & MySQL.",
        descriptionVi: "Xây dựng hệ thống xuất văn bản kèm chữ ký số, kiểm soát override hợp đồng và ghi log kiểm toán với FastAPI & MySQL.",
        icon: "fa-solid fa-file-signature",
      },
      {
        titleEn: "Quality Assurance & Production Handover",
        titleVi: "Đảm bảo Chất lượng QA & Bàn giao Kỹ thuật",
        descriptionEn: "Executing rigorous PoC testing, debugging complex multi-leg call lifecycles, and preparing technical handover specs.",
        descriptionVi: "Kiểm thử PoC thực tế, xử lý dứt điểm các lỗi vòng đời cuộc gọi multi-leg và hoàn thiện tài liệu bàn giao kỹ thuật.",
        icon: "fa-solid fa-shield-halved",
      },
    ],
    get project() {
      return this.projects[0];
    },
    technologies: ["Python", "FastAPI", "C#", ".NET", "Voicebot AI", "3CX Phone System", "RabbitMQ", "Redis", "MySQL", "Joget"],
  },
  {
    id: "ritavo",
    model: "product",
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
    overviewEn: "Engineered customized ERP business logic, data rules, and delivery automation on Odoo 18 for enterprise manufacturing & retail.",
    overviewVi: "Phát triển nghiệp vụ ERP tùy biến, kiểm soát ràng buộc dữ liệu và tự động hóa triển khai trên nền tảng Odoo 18 cho tập đoàn sản xuất & bán lẻ.",
    detailHref: "/experience/ritavo",
    projects: [
      {
        id: "ritavo-prodid",
        titleEn: "ProdID · Odoo 18 PLM Enterprise Platform",
        titleVi: "ProdID · Nền tảng Quản lý Vòng đời Sản phẩm Odoo 18",
        roleEn: "Odoo Developer Intern",
        roleVi: "Thực tập sinh Lập trình viên Odoo",
        clientName: "Rita Võ Group",
        clientLogo: "/images/ritavo-logo.svg",
        clientDomainEn: "Enterprise Manufacturing & Retail PLM",
        clientDomainVi: "Sản xuất & Bán lẻ Doanh nghiệp (PLM)",
        periodEn: "MAR 2026 — JUN 2026",
        periodVi: "T03/2026 — T06/2026",
        isConfidential: false,
        difficultyRank: "S",
        tierLabelEn: "ENTERPRISE ERP PLM",
        tierLabelVi: "HỆ THỐNG ERP SẢN XUẤT & BÁN LẺ",
        unlockedEn: "~10,000 Product Records Unified Across 4 Departments with DFS Cycle Guard",
        unlockedVi: "Đồng bộ ~10.000 mã sản phẩm xuyên 4 phòng ban & thuật toán chống vòng lặp BOM",
        statusEn: "Live Enterprise Portal",
        statusVi: "Cổng vận hành thực tế",
        descriptionEn: "An internal product-lifecycle workflow bridging R&D, Marketing, Sales and Purchasing across roughly 10,000 product records with automated multi-stage approvals.",
        descriptionVi: "Quy trình vòng đời sản phẩm nội bộ kết nối R&D, Marketing, Sales và Mua hàng trên quy mô xấp xỉ 10.000 bản ghi với luồng phê duyệt tự động đa cấp.",
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
        technologies: ["Odoo 18", "Python", "PostgreSQL", "Docker", "GitHub Actions", "DFS Cycle Detection"],
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
    ],
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
    get project() {
      return this.projects[0];
    },
    technologies: ["Odoo 18", "Python", "PostgreSQL", "Docker", "GitHub Actions", "DFS Cycle Detection"],
  },
  {
    id: "vinagreen",
    model: "core_tech",
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
    projects: [
      {
        id: "vinagreen-edge",
        titleEn: "VinaGreen Digital Platform & Edge Telemetry",
        titleVi: "Nền tảng số VinaGreen & Điện toán Biên",
        roleEn: "Core Technology (System & Architecture)",
        roleVi: "Công nghệ lõi (Hệ thống & Kiến trúc)",
        clientName: "VinaGreen (ViNar)",
        clientLogo: "/projects/vinagreen/vinar_logo.svg",
        clientDomainEn: "Agritech & Edge Computing",
        clientDomainVi: "Nông nghiệp Số & Điện toán Biên",
        periodEn: "2025 — PRESENT",
        periodVi: "2025 — HIỆN TẠI",
        isConfidential: false,
        difficultyRank: "S",
        tierLabelEn: "DEEP-TECH EDGE PLATFORM",
        tierLabelVi: "KIẾN TRÚC LÕI ĐIỆN TOÁN BIÊN",
        unlockedEn: "Global Edge Telemetry + AI Farmer Copilot & Real-Time Soil Dosage Engine",
        unlockedVi: "Hạ tầng Cloudflare Edge tốc độ cao kết hợp trợ lý AI nông vụ thực địa",
        statusEn: "Live Edge Deployment",
        statusVi: "Đang vận hành trên Edge",
        descriptionEn: "High-performance edge platform designed for resilient operational tracking, data transparency, and scalable service delivery across rural regions.",
        descriptionVi: "Nền tảng vận hành phân tán trên mạng lưới Edge, tối ưu hóa khả năng giám sát dữ liệu minh bạch và mở rộng dịch vụ cho vùng thực địa.",
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
        technologies: ["System Architecture", "Edge Computing", "Cloudflare Workers", "FastAPI", "TypeScript"],
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
    ],
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
    get project() {
      return this.projects[0];
    },
    technologies: ["System Architecture", "Edge Computing", "Cloudflare Workers", "Scalable APIs", "TypeScript"],
  },
  {
    id: "omnimer",
    model: "rd_team",
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
    projects: [
      {
        id: "omnimer-health",
        titleEn: "OmniMer Health · Wearable AI & GraphRAG",
        titleVi: "OmniMer Health · Trí tuệ Sức khỏe Đeo tay & GraphRAG",
        roleEn: "System Architect & AI Engineer",
        roleVi: "Kiến trúc sư Hệ thống & Kỹ sư AI",
        clientName: "Omnimer R&D",
        clientLogo: "/images/omnimer-logo.svg",
        clientDomainEn: "Healthcare & Realtime Biometrics",
        clientDomainVi: "Y tế Số & Sinh hiệu Thời gian thực",
        periodEn: "2025 — PRESENT",
        periodVi: "2025 — HIỆN TẠI",
        isConfidential: false,
        difficultyRank: "S",
        tierLabelEn: "AGENTIC HEALTH SYSTEM",
        tierLabelVi: "HỆ THỐNG AI SỨC KHỎE THỜI GIAN THỰC",
        unlockedEn: "<500ms Biometric Alert Path · 0.85 Relevancy · 90% Safety Recall (RAGAS)",
        unlockedVi: "Luồng cảnh báo sinh hiệu <500ms · 0.85 Relevancy · 90% Safety Recall",
        statusEn: "Open Source & Research",
        statusVi: "Mã nguồn mở & Nghiên cứu",
        descriptionEn: "Architected high-throughput Kafka & Redis pub/sub pipelines for wearable anomaly detection with <500ms latency, combined with safety-aware GraphRAG retrieval.",
        descriptionVi: "Thiết kế đường ống luồng dữ liệu Kafka & Redis phân tích bất thường nhịp tim thời gian thực với độ trễ <500ms, kết hợp truy xuất GraphRAG bảo đảm an toàn y tế.",
        technologies: ["LangGraph", "FastAPI", "Kafka", "GraphRAG", "Qdrant", "Redis"],
        links: [
          {
            labelEn: "OmniMer Health Dossier",
            labelVi: "Dự án OmniMer Health",
            href: "/projects/omnimer-health",
            isExternal: false,
            icon: "fa-folder-open",
          },
        ],
      },
      {
        id: "omnimer-food",
        titleEn: "OmniMer Food · Vision & Voice Nutrition Assistant",
        titleVi: "OmniMer Food · Trợ lý Dinh dưỡng Thị giác & Giọng nói",
        roleEn: "Mobile & Multimodal AI Engineer",
        roleVi: "Kỹ sư Mobile & AI Đa phương thức",
        clientName: "Omnimer R&D",
        clientLogo: "/images/omnimer-logo.svg",
        clientDomainEn: "Nutrition & Multimodal AI",
        clientDomainVi: "Dinh dưỡng & AI Đa phương thức",
        periodEn: "2025 — PRESENT",
        periodVi: "2025 — HIỆN TẠI",
        isConfidential: false,
        difficultyRank: "A",
        tierLabelEn: "MULTIMODAL MOBILE AI",
        tierLabelVi: "ỨNG DỤNG DI ĐỘNG AI ĐA PHƯƠNG THỨC",
        unlockedEn: "3-Modal Copilot (Vision, Voice, Text) with Dual-Layer GraphRAG Safety",
        unlockedVi: "Trợ lý 3 phương thức (Ảnh, Giọng nói, Văn bản) kèm kiểm chứng an toàn 2 lớp",
        statusEn: "Mobile App & Open Source",
        statusVi: "Ứng dụng Di động & Mã nguồn mở",
        descriptionEn: "Developed cross-platform Flutter application integrating food computer vision recognition and voice-guided interactive cooking assistance.",
        descriptionVi: "Lập trình ứng dụng di động Flutter tích hợp nhận diện ảnh món ăn và hướng dẫn nấu ăn từng bước bằng giọng nói tương tác.",
        technologies: ["Flutter", "Dart", "FastAPI", "Computer Vision", "Voice AI"],
        links: [
          {
            labelEn: "OmniMer Food Dossier",
            labelVi: "Dự án OmniMer Food",
            href: "/projects/omnimer-food",
            isExternal: false,
            icon: "fa-folder-open",
          },
        ],
      },
    ],
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
    get project() {
      return this.projects[0];
    },
    technologies: ["LangGraph", "FastAPI", "Kafka", "GraphRAG", "Qdrant", "Flutter"],
  },
];

