export type LocalizedText = {
  en: string;
  vi: string;
};

export type TechGroup = {
  step: string;
  short: string;
  title: LocalizedText;
  evidence: LocalizedText;
  description: LocalizedText;
  technologies: string[];
};

export const profileLinks = [
  { number: "01", href: "#education", en: "Education", vi: "Học vấn" },
  { number: "02", href: "#technical-skill", en: "Technical Skills", vi: "Kỹ năng kỹ thuật" },
  { number: "03", href: "#soft-skill", en: "Soft Skills", vi: "Kỹ năng mềm" },
  { number: "04", href: "#achievements", en: "Achievements", vi: "Thành tựu" },
  { number: "05", href: "#beyond-code", en: "Beyond Code", vi: "Ngoài lập trình" },
];

export const techGroups: TechGroup[] = [
  {
    step: "01",
    short: "BE",
    title: { en: "Backend Engineering", vi: "Kỹ thuật Backend" },
    evidence: { en: "Production & internship", vi: "Sản phẩm & thực tập" },
    description: {
      en: "Designing APIs, workflows and business rules that remain clear as a product grows.",
      vi: "Thiết kế API, workflow và quy tắc nghiệp vụ rõ ràng khi sản phẩm mở rộng.",
    },
    technologies: ["Python", "FastAPI", "Node.js", "Express", "Odoo 18", "TypeScript"],
  },
  {
    step: "02",
    short: "AI",
    title: { en: "Agentic AI & RAG", vi: "Agentic AI & RAG" },
    evidence: { en: "Personal health platform", vi: "Nền tảng sức khỏe cá nhân" },
    description: {
      en: "Building and evaluating multi-step agents with hybrid semantic and graph retrieval.",
      vi: "Xây dựng và đánh giá agent nhiều bước với truy xuất ngữ nghĩa kết hợp đồ thị.",
    },
    technologies: ["LangGraph", "ReAct", "HybridRAG", "BGE-M3", "BM25", "RAGAS"],
  },
  {
    step: "03",
    short: "DT",
    title: { en: "Data & Retrieval", vi: "Dữ liệu & Truy xuất" },
    evidence: { en: "Real-time and semantic data", vi: "Dữ liệu thời gian thực & ngữ nghĩa" },
    description: {
      en: "Moving event streams, operational records, vectors and connected knowledge through one system.",
      vi: "Kết nối luồng sự kiện, dữ liệu vận hành, vector và tri thức liên kết trong một hệ thống.",
    },
    technologies: ["PostgreSQL", "MongoDB", "Redis", "Kafka", "Qdrant", "Neo4j"],
  },
  {
    step: "04",
    short: "DV",
    title: { en: "DevOps & Infrastructure", vi: "DevOps & Hạ tầng" },
    evidence: { en: "Staging deployment & CI", vi: "Triển khai staging & CI" },
    description: {
      en: "Packaging services and protecting delivery quality with automated checks.",
      vi: "Đóng gói dịch vụ và bảo vệ chất lượng bàn giao bằng kiểm tra tự động.",
    },
    technologies: ["Docker", "Docker Compose", "GitHub Actions", "Automated Testing"],
  },
  {
    step: "05",
    short: "UI",
    title: { en: "Mobile & Frontend", vi: "Mobile & Frontend" },
    evidence: { en: "Working knowledge", vi: "Kiến thức thực hành" },
    description: {
      en: "Connecting backend capabilities to usable mobile and web product experiences.",
      vi: "Đưa năng lực backend đến trải nghiệm sản phẩm mobile và web dễ sử dụng.",
    },
    technologies: ["Flutter", "Next.js", "UI/UX"],
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
