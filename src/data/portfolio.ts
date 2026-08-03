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
  { number: "02", href: "#projects", en: "Projects", vi: "Dự án" },
  { number: "03", href: "#technical-skill", en: "Technical Skills", vi: "Kỹ năng kỹ thuật" },
  { number: "04", href: "#soft-skill", en: "Soft Skills", vi: "Kỹ năng mềm" },
  { number: "05", href: "#achievements", en: "Achievements", vi: "Thành tựu" },
  { number: "06", href: "#beyond-code", en: "Beyond Code", vi: "Ngoài lập trình" },
  { number: "07", href: "#contact", en: "Contact", vi: "Liên hệ" },
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
