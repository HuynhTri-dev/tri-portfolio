/**
 * @name skill-matrix.ts
 * @description Structured F-to-S engineering mastery matrix covering PM, BA, DA,
 *              Backend, AI Agents, Frontend, and Infrastructure domains, cross-linked
 *              to Cloudflare D1 Knowledge Base studies and production dossiers.
 */

export type SkillRank = "S" | "A" | "B" | "C" | "D" | "E" | "F";

export type SkillDomainId = "PM" | "BA" | "DA" | "BE" | "AI" | "FE" | "INFRA";

export interface SkillRankMeta {
  rank: SkillRank;
  titleEn: string;
  titleVi: string;
  criteriaEn: string;
  criteriaVi: string;
  accent: string;
  glow: string;
}

export interface SkillProofLink {
  labelEn: string;
  labelVi: string;
  href: string;
}

export interface SkillNode {
  id: string;
  domain: SkillDomainId;
  nameEn: string;
  nameVi: string;
  rank: SkillRank;
  level: number;
  icon: string;
  summaryEn: string;
  summaryVi: string;
  keywords: string[];
  proofs: SkillProofLink[];
}

export interface SkillDomainBranch {
  id: SkillDomainId;
  code: string;
  icon: string;
  titleEn: string;
  titleVi: string;
  subtitleEn: string;
  subtitleVi: string;
  accent: string;
  softAccent: string;
  glow: string;
  skills: SkillNode[];
}

export const SKILL_RANK_LEGEND: SkillRankMeta[] = [
  {
    rank: "S",
    titleEn: "Core Architecture & Mission-Critical",
    titleVi: "Kiến trúc Lõi & Vận hành Trọng yếu",
    criteriaEn: "Production core ownership, sub-second latency tuning, zero-loss mission-critical reliability.",
    criteriaVi: "Làm chủ kiến trúc lõi production, tối ưu độ trễ dưới 1 giây, xử lý sự cố trọng yếu không mất dữ liệu.",
    accent: "#18c785",
    glow: "rgba(24, 199, 133, 0.28)",
  },
  {
    rank: "A",
    titleEn: "Production Advanced",
    titleVi: "Chuyên sâu Thực chiến",
    criteriaEn: "Independent enterprise module design, query/pipeline optimization, and rigorous security.",
    criteriaVi: "Thiết kế và vận hành độc lập phân hệ doanh nghiệp, tối ưu truy vấn và bảo mật.",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.24)",
  },
  {
    rank: "B",
    titleEn: "Production Applied",
    titleVi: "Ứng dụng Thành thạo",
    criteriaEn: "Solid applied delivery across production integrations, CI/CD, and clean modular code.",
    criteriaVi: "Ứng dụng thành thạo trong dự án thực tế, tích hợp dịch vụ và tự động hóa triển khai.",
    accent: "#a855f7",
    glow: "rgba(168, 85, 247, 0.24)",
  },
  {
    rank: "C",
    titleEn: "Operational Working",
    titleVi: "Vận hành Tiêu chuẩn",
    criteriaEn: "Working operational command for scripting, maintenance, and cross-stack support.",
    criteriaVi: "Nắm vững nguyên lý nền tảng, duy trì vận hành và hỗ trợ kỹ thuật liên tầng.",
    accent: "#94a3b8",
    glow: "rgba(148, 163, 184, 0.2)",
  },
  {
    rank: "D",
    titleEn: "Exploratory Prototype",
    titleVi: "Thực nghiệm Nguyên mẫu",
    criteriaEn: "Active R&D prototyping and sandbox evaluation.",
    criteriaVi: "Đang nghiên cứu thực nghiệm R&D và đánh giá trên môi trường sandbox.",
    accent: "#64748b",
    glow: "rgba(100, 116, 139, 0.16)",
  },
  {
    rank: "F",
    titleEn: "Uncharted Frontier",
    titleVi: "Chưa Khai mở",
    criteriaEn: "Queued on future learning roadmap.",
    criteriaVi: "Nằm trong lộ trình nghiên cứu tiếp theo.",
    accent: "#475569",
    glow: "rgba(71, 85, 105, 0.14)",
  },
];

export const SKILL_MATRIX_BRANCHES: SkillDomainBranch[] = [
  {
    id: "BE",
    code: "01 // BACKEND",
    icon: "fa-solid fa-server",
    titleEn: "Backend & Telephony Core",
    titleVi: "Backend & Tổng đài Lõi",
    subtitleEn: "High-throughput APIs, PBX multi-leg call tracking, and enterprise workflow engines",
    subtitleVi: "API thông lượng cao, xử lý cuộc gọi PBX multi-leg và động cơ quy trình doanh nghiệp",
    accent: "#18c785",
    softAccent: "#6ee7b7",
    glow: "rgba(24, 199, 133, 0.2)",
    skills: [
      {
        id: "voicebot-state-engine",
        domain: "BE",
        nameEn: "Voicebot Core & Dialogue State Machines",
        nameVi: "Động cơ Voicebot Lõi & Máy Trạng thái Hội thoại",
        rank: "S",
        level: 96,
        icon: "fa-solid fa-wave-square",
        summaryEn: "Low-latency conversational state orchestration, barge-in handling, and banking backend integration.",
        summaryVi: "Điều phối trạng thái hội thoại độ trễ thấp, ngắt lời tức thì (barge-in) và tích hợp API ngân hàng.",
        keywords: ["voicebot", "pipecat", "asterisk", "telephony", "realtimeai", "webrtc"],
        proofs: [
          { labelEn: "IDB · Sacombank Voicebot", labelVi: "IDB · Voicebot Sacombank", href: "/experience/idb" },
          { labelEn: "Pipecat Production Guide", labelVi: "Cẩm nang Pipecat Production", href: "/blog/pipecat-voicebot-production-guide" },
        ],
      },
      {
        id: "fastapi-async-python",
        domain: "BE",
        nameEn: "FastAPI & High-Throughput Async Python",
        nameVi: "FastAPI & Python Bất đồng bộ Hiệu năng cao",
        rank: "S",
        level: 95,
        icon: "fa-solid fa-bolt",
        summaryEn: "Non-blocking microservice architecture, Pydantic v2 contracts, and streaming I/O pipelines.",
        summaryVi: "Kiến trúc microservice bất đồng bộ, hợp đồng dữ liệu Pydantic v2 và đường ống streaming I/O.",
        keywords: ["fastapi", "python", "architecture", "omnimer", "voicebot"],
        proofs: [
          { labelEn: "OmniMer Health Dossier", labelVi: "Hồ sơ OmniMer Health", href: "/projects/omnimer-health" },
          { labelEn: "ViNar AI Backend", labelVi: "Backend AI ViNar", href: "/projects/vinagreen" },
        ],
      },
      {
        id: "pbx-multileg-telephony",
        domain: "BE",
        nameEn: "3CX / Asterisk PBX & Multi-Leg Tracking",
        nameVi: "Tổng đài 3CX / Asterisk & Theo dõi Multi-Leg",
        rank: "S",
        level: 94,
        icon: "fa-solid fa-phone-volume",
        summaryEn: "CallID/linkedid correlation across transferred legs, chan_websocket slin16 audio, and zero-loss PBX events.",
        summaryVi: "Ánh xạ CallID/linkedid qua nhiều chặng chuyển máy, cấu hình slin16 và chống thất thoát sự kiện tổng đài.",
        keywords: ["pbx", "telephony", "asterisk", "3cx", "kafka-pbx", "zalocallmonitor"],
        proofs: [
          { labelEn: "Vietmap 3CX Multi-Leg", labelVi: "Vietmap 3CX Multi-Leg", href: "/experience/idb" },
          { labelEn: "PBX Event Streaming", labelVi: "Kiến trúc PBX Streaming", href: "/blog/kafka-pbx-event-streaming-architecture" },
        ],
      },
      {
        id: "joget-legal-doc-engine",
        domain: "BE",
        nameEn: "Joget Workflow & Legal Document Automation",
        nameVi: "Joget Workflow & Tự động hóa Văn bản Pháp lý",
        rank: "A",
        level: 88,
        icon: "fa-solid fa-file-signature",
        summaryEn: "Automated NOL loan clearance PDF/Word generation with digital signatures, seals, and revision audit trails.",
        summaryVi: "Tự động xuất chứng nhận tất toán khoản vay PDF/Word gán chữ ký số, con dấu và nhật ký kiểm toán.",
        keywords: ["joget", "workflow", "mysql", "enterprise", "odoo"],
        proofs: [
          { labelEn: "IDB · Loan Clearance Engine", labelVi: "IDB · Hệ thống Tất toán NOL", href: "/experience/idb" },
          { labelEn: "RitaVõ · Odoo 18 ProdID", labelVi: "RitaVõ · Odoo 18 ProdID", href: "/projects/ritavo-prodid" },
        ],
      },
      {
        id: "dotnet-enterprise-daemons",
        domain: "BE",
        nameEn: "C# .NET Enterprise Telemetry Services",
        nameVi: "Dịch vụ Đồng bộ Viễn thông C# .NET",
        rank: "A",
        level: 85,
        icon: "fa-solid fa-gears",
        summaryEn: "Resilient background workers bridging 3CX telephony events to RabbitMQ and Redis live wallboards.",
        summaryVi: "Background worker bền bỉ kết nối sự kiện tổng đài 3CX sang RabbitMQ và bảng giám sát Redis.",
        keywords: ["redis", "zalocallmonitor", "telephony", "pbx", "stream"],
        proofs: [
          { labelEn: "ZaloPay Call Monitor", labelVi: "ZaloPay Call Monitor", href: "/experience/idb" },
          { labelEn: "Redis Stream Wallboard", labelVi: "Redis Stream Wallboard", href: "/blog/redis-stream-theory-and-best-practices" },
        ],
      },
    ],
  },
  {
    id: "AI",
    code: "02 // AI AGENTS",
    icon: "fa-solid fa-brain",
    titleEn: "AI Agents, Voice & RAG",
    titleVi: "AI Agents, Giọng nói & RAG",
    subtitleEn: "Sub-800ms speech pipelines, LangGraph multi-agent orchestration, and safety-verified RAG",
    subtitleVi: "Luồng giọng nói <800ms, điều phối đa tác tử LangGraph và truy xuất tri thức an toàn",
    accent: "#a855f7",
    softAccent: "#d8b4fe",
    glow: "rgba(168, 85, 247, 0.22)",
    skills: [
      {
        id: "realtime-stt-tts-streaming",
        domain: "AI",
        nameEn: "Sub-800ms Audio STT/TTS & VAD Streaming",
        nameVi: "Luồng Âm thanh STT/TTS & VAD Dưới 800ms",
        rank: "S",
        level: 96,
        icon: "fa-solid fa-microphone-lines",
        summaryEn: "Pipecat frame pipelines, Silero VAD + Smart Turn v3 Vietnamese tuning, and SttEchoGate echo cancellation.",
        summaryVi: "Đường ống frame Pipecat, tinh chỉnh Silero VAD + Smart Turn v3 tiếng Việt và khử vang SttEchoGate.",
        keywords: ["pipecat", "voicebot", "elevenlabs", "ollama", "webrtc", "realtimeai", "asterisk"],
        proofs: [
          { labelEn: "Asterisk 22 + Pipecat Guide", labelVi: "Tích hợp Asterisk 22 + Pipecat", href: "/blog/voicebot-asterisk-pipecat-elevenlabs-ollama" },
          { labelEn: "Sacombank Voicebot Core", labelVi: "Voicebot Ngân hàng Sacombank", href: "/experience/idb" },
        ],
      },
      {
        id: "hybrid-rag-retrieval",
        domain: "AI",
        nameEn: "Hybrid RAG (Dense Qdrant + BM25 + Alias)",
        nameVi: "Hybrid RAG (Vector Qdrant + BM25 + Alias)",
        rank: "S",
        level: 93,
        icon: "fa-solid fa-magnifying-glass-chart",
        summaryEn: "Multi-stage evidence retrieval combining BGE-M3 dense embeddings, sparse lexical matching, and domain aliases.",
        summaryVi: "Truy xuất đa tầng kết hợp vector BGE-M3, đối sánh từ khóa BM25 và từ điển bí danh chuyên ngành.",
        keywords: ["hybridrag", "rag", "qdrant", "agenticai", "healthtech"],
        proofs: [
          { labelEn: "OmniMer Health Architecture", labelVi: "Kiến trúc OmniMer Health", href: "/projects/omnimer-health" },
          { labelEn: "Building OmniMer Health", labelVi: "Bài viết OmniMer Health", href: "/blog/building-omnimer-health" },
        ],
      },
      {
        id: "langgraph-orchestration",
        domain: "AI",
        nameEn: "Multi-Agent Orchestration (LangGraph)",
        nameVi: "Điều phối Đa Agent (LangGraph)",
        rank: "A",
        level: 90,
        icon: "fa-solid fa-diagram-project",
        summaryEn: "Stateful cyclic graphs, deterministic tool guardrails, memory checkpoints, and fallback verification.",
        summaryVi: "Đồ thị trạng thái có chu trình, kiểm soát gọi công cụ an toàn, lưu vết bộ nhớ và kiểm chứng đầu ra.",
        keywords: ["langgraph", "multiagent", "agenticai", "ai", "pipecat"],
        proofs: [
          { labelEn: "OmniMer Health Agent", labelVi: "Tác tử OmniMer Health", href: "/projects/omnimer-health" },
          { labelEn: "AI Finance Pro", labelVi: "AI Finance Pro", href: "/projects/finance-analysis" },
        ],
      },
      {
        id: "graphrag-neo4j",
        domain: "AI",
        nameEn: "GraphRAG & Knowledge Graph Traversal",
        nameVi: "GraphRAG & Duyệt Đồ thị Tri thức (Neo4j)",
        rank: "A",
        level: 87,
        icon: "fa-solid fa-circle-nodes",
        summaryEn: "Entity-relationship reasoning over medical and nutritional knowledge graphs to prevent unsafe advice.",
        summaryVi: "Suy luận quan hệ thực thể trên đồ thị tri thức y tế và dinh dưỡng nhằm ngăn ngừa khuyến nghị rủi ro.",
        keywords: ["graphrag", "neo4j", "knowledge", "omnimer"],
        proofs: [
          { labelEn: "OmniMer Food Multimodal", labelVi: "OmniMer Food Đa phương thức", href: "/projects/omnimer-food" },
          { labelEn: "Omnimer R&D Lab", labelVi: "Nhóm R&D Omnimer", href: "/experience/omnimer" },
        ],
      },
      {
        id: "ragas-safety-evals",
        domain: "AI",
        nameEn: "RAGAS Benchmarking & AI Safety Recall",
        nameVi: "Đánh giá Định lượng RAGAS & Kiểm thử An toàn AI",
        rank: "A",
        level: 88,
        icon: "fa-solid fa-shield-heart",
        summaryEn: "100-scenario evaluation harness achieving 0.85 answer relevancy, 0.78 faithfulness, and 90% safety recall.",
        summaryVi: "Bộ kiểm thử 100 kịch bản đạt 0.85 độ liên quan, 0.78 độ trung thực và 90% safety recall.",
        keywords: ["eval", "ragas", "agenticai", "safety", "voicebot"],
        proofs: [
          { labelEn: "OmniMer Benchmark Dossier", labelVi: "Báo cáo Benchmark OmniMer", href: "/projects/omnimer-health" },
        ],
      },
    ],
  },
  {
    id: "DA",
    code: "03 // DATA & STREAM",
    icon: "fa-solid fa-chart-column",
    titleEn: "DA & Realtime Data Platforms",
    titleVi: "Phân tích & Nền tảng Dữ liệu",
    subtitleEn: "Kafka/RabbitMQ event streaming, Redis snapshot/stream design, and quantitative analytics",
    subtitleVi: "Luồng sự kiện Kafka/RabbitMQ, kiến trúc Redis Stream/Snapshot và phân tích định lượng",
    accent: "#06b6d4",
    softAccent: "#67e8f9",
    glow: "rgba(6, 182, 212, 0.22)",
    skills: [
      {
        id: "event-streaming-kafka-rabbitmq",
        domain: "DA",
        nameEn: "Event Streaming (Apache Kafka, Redpanda & RabbitMQ)",
        nameVi: "Luồng Sự kiện (Apache Kafka, Redpanda & RabbitMQ)",
        rank: "S",
        level: 95,
        icon: "fa-solid fa-arrows-split-up-and-left",
        summaryEn: "Partition-key ordering by call/device ID, consumer group scaling, ISR durability, and zero dropped events.",
        summaryVi: "Bảo toàn thứ tự theo Partition Key, mở rộng Consumer Group, chống hot partition và không mất sự kiện.",
        keywords: ["kafka", "redpanda", "eventstreaming", "eventdriven", "distributed", "rabbitmq"],
        proofs: [
          { labelEn: "Kafka Core Architecture", labelVi: "Toàn tập Kiến trúc Kafka", href: "/blog/kafka-core-concepts-and-architecture" },
          { labelEn: "PBX Kafka Streaming", labelVi: "Kafka cho Tổng đài PBX", href: "/blog/kafka-pbx-event-streaming-architecture" },
        ],
      },
      {
        id: "redis-stream-wallboard",
        domain: "DA",
        nameEn: "In-Memory Redis (Snapshot + Pub/Sub & Streams)",
        nameVi: "Kiến trúc Redis (Snapshot + Pub/Sub & Streams)",
        rank: "S",
        level: 94,
        icon: "fa-solid fa-bolt-lightning",
        summaryEn: "PEL/XACK lifecycle, MAXLEN memory safety under noeviction, and atomic live call wallboard state.",
        summaryVi: "Quản lý PEL/XACK, giới hạn bộ nhớ MAXLEN chống OOM và đồng bộ nguyên tử cho dashboard cuộc gọi.",
        keywords: ["redis", "redisstream", "zalocallmonitor", "realtime", "cache"],
        proofs: [
          { labelEn: "Redis Stream Best Practices", labelVi: "Lý thuyết & Thực chiến Redis Stream", href: "/blog/redis-stream-theory-and-best-practices" },
          { labelEn: "Aqua & ZaloPay Call Monitor", labelVi: "Giám sát Cuộc gọi Aqua & ZaloPay", href: "/experience/idb" },
        ],
      },
      {
        id: "sql-tuning-audit-models",
        domain: "DA",
        nameEn: "Relational Data Modeling & SQL Optimization",
        nameVi: "Mô hình hóa CSDL & Tối ưu Truy vấn SQL",
        rank: "A",
        level: 89,
        icon: "fa-solid fa-database",
        summaryEn: "PostgreSQL & MySQL schema indexing, 10K+ SKU lifecycle tables, and immutable operational audit logs.",
        summaryVi: "Tối ưu chỉ mục PostgreSQL/MySQL, quản trị bảng 10.000+ mã sản phẩm và nhật ký kiểm toán bất biến.",
        keywords: ["postgresql", "mysql", "sql", "database", "architecture"],
        proofs: [
          { labelEn: "ProdID ~10K Records", labelVi: "ProdID ~10.000 Bản ghi", href: "/projects/ritavo-prodid" },
          { labelEn: "Between Us · Neon Postgres", labelVi: "Between Us · Neon Postgres", href: "/projects/between-us" },
        ],
      },
      {
        id: "biometrics-quant-analytics",
        domain: "DA",
        nameEn: "Biometrics & Quantitative Financial Analytics",
        nameVi: "Phân tích Sinh hiệu & Định lượng Tài chính",
        rank: "A",
        level: 86,
        icon: "fa-solid fa-chart-line",
        summaryEn: "Personalized wearable anomaly baselines (<500ms alert path) and automated financial statement scoring.",
        summaryVi: "Đường cơ sở sinh hiệu cá nhân hóa (cảnh báo <500ms) và chấm điểm báo cáo tài chính tự động.",
        keywords: ["fintech", "healthtech", "biometrics", "analytics", "finance"],
        proofs: [
          { labelEn: "AI Finance Pro Dossier", labelVi: "Hồ sơ AI Finance Pro", href: "/projects/finance-analysis" },
          { labelEn: "OmniMer Health Stream", labelVi: "Luồng Sinh hiệu OmniMer", href: "/projects/omnimer-health" },
        ],
      },
    ],
  },
  {
    id: "BA",
    code: "04 // BUSINESS ANALYSIS",
    icon: "fa-solid fa-compass-drafting",
    titleEn: "BA & System Specification",
    titleVi: "Phân tích Nghiệp vụ (BA)",
    subtitleEn: "SRS/FRD authoring, BPMN 2.0 cross-department workflows, and banking/ERP domain rules",
    subtitleVi: "Đặc tả SRS/FRD, quy trình BPMN 2.0 liên phòng ban và nghiệp vụ ngân hàng / ERP",
    accent: "#f97316",
    softAccent: "#fdba74",
    glow: "rgba(249, 115, 22, 0.22)",
    skills: [
      {
        id: "srs-frd-specification",
        domain: "BA",
        nameEn: "SRS / FRD & Handover Architecture Docs",
        nameVi: "Đặc tả SRS / FRD & Tài liệu Bàn giao Hệ thống",
        rank: "S",
        level: 93,
        icon: "fa-solid fa-file-contract",
        summaryEn: "IEEE/INVEST-grade requirement specs, sequence/state diagrams, and production handover blueprints.",
        summaryVi: "Đặc tả yêu cầu chuẩn INVEST, sơ đồ tuần tự/trạng thái và hồ sơ bàn giao vận hành doanh nghiệp.",
        keywords: ["architecture", "systemarchitecture", "documentation", "product"],
        proofs: [
          { labelEn: "ZaloPay & NOL Handover Specs", labelVi: "Hồ sơ Bàn giao ZaloPay & NOL", href: "/experience/idb" },
          { labelEn: "ViNar System Specification", labelVi: "Đặc tả Hệ thống ViNar", href: "/experience/vinagreen" },
        ],
      },
      {
        id: "bpmn-erp-workflows",
        domain: "BA",
        nameEn: "BPMN 2.0 & Multi-Department ERP Workflows",
        nameVi: "Quy trình BPMN 2.0 & Phê duyệt Liên phòng ban",
        rank: "S",
        level: 92,
        icon: "fa-solid fa-sitemap",
        summaryEn: "Bridging R&D, Marketing, Purchasing, and Sales into deterministic multi-stage approval matrices.",
        summaryVi: "Chuyển hóa quy trình R&D, Marketing, Mua hàng và Kinh doanh thành ma trận phê duyệt tự động.",
        keywords: ["workflow", "erp", "odoo", "enterprise", "systemarchitecture"],
        proofs: [
          { labelEn: "RitaVõ 4-Dept PLM Matrix", labelVi: "Ma trận PLM 4 Phòng ban RitaVõ", href: "/projects/ritavo-prodid" },
        ],
      },
      {
        id: "banking-lending-domain",
        domain: "BA",
        nameEn: "Commercial Banking & Lending Domain Logic",
        nameVi: "Nghiệp vụ Ngân hàng Thương mại & Tín dụng",
        rank: "A",
        level: 88,
        icon: "fa-solid fa-building-columns",
        summaryEn: "Loan settlement clearance (NOL), signatory delegation rules, and retail/digital banking intent trees.",
        summaryVi: "Nghiệp vụ tất toán khoản vay (NOL), ủy quyền ký số pháp lý và cây ý định giao dịch ngân hàng số.",
        keywords: ["banking", "fintech", "voicebot", "finance"],
        proofs: [
          { labelEn: "Sacombank · Nam Á · TNEX", labelVi: "Sacombank · Nam Á · TNEX", href: "/experience/idb" },
        ],
      },
      {
        id: "uml-dataflow-modeling",
        domain: "BA",
        nameEn: "UML, ERD & Failure-Mode Modeling",
        nameVi: "Mô hình hóa UML, ERD & Kịch bản Sự cố",
        rank: "A",
        level: 87,
        icon: "fa-solid fa-bezier-curve",
        summaryEn: "Mapping edge cases, race conditions, and failover recovery before writing production code.",
        summaryVi: "Phân tích tình huống biên, race condition và kịch bản chịu lỗi trước khi triển khai mã nguồn.",
        keywords: ["architecture", "distributed", "kafka", "redis"],
        proofs: [
          { labelEn: "Redis Failover & PEL Analysis", labelVi: "Phân tích Chịu lỗi Redis PEL", href: "/blog/redis-stream-theory-and-best-practices" },
        ],
      },
    ],
  },
  {
    id: "PM",
    code: "05 // PRODUCT & PM",
    icon: "fa-solid fa-chess-king",
    titleEn: "PM & Technical Delivery",
    titleVi: "Quản trị Sản phẩm (PM)",
    subtitleEn: "Product-oriented scoping, stakeholder PoC leadership, and measurable outcome KPIs",
    subtitleVi: "Định hình phạm vi sản phẩm, dẫn dắt PoC khách hàng và đo lường kết quả bằng KPI",
    accent: "#f59e0b",
    softAccent: "#fde68a",
    glow: "rgba(245, 158, 11, 0.22)",
    skills: [
      {
        id: "stakeholder-poc-delivery",
        domain: "PM",
        nameEn: "Enterprise Stakeholder Alignment & PoC Delivery",
        nameVi: "Phối hợp Đối tác Doanh nghiệp & Dẫn dắt PoC",
        rank: "S",
        level: 92,
        icon: "fa-solid fa-handshake-simple",
        summaryEn: "Leading live banking PoC demonstrations that convert technical evaluations into production contracts.",
        summaryVi: "Trình diễn PoC trực tiếp trước hội đồng ngân hàng, chuyển hóa thử nghiệm thành hợp đồng triển khai chính thức.",
        keywords: ["product", "commercialsaas", "startups", "voicebot"],
        proofs: [
          { labelEn: "IDB Banking PoC Conversions", labelVi: "Chuyển đổi PoC Ngân hàng IDB", href: "/experience/idb" },
          { labelEn: "CJ Top 5 Excellent Project", labelVi: "Top 5 Dự án Xuất sắc CJ", href: "/projects/cj-crop" },
        ],
      },
      {
        id: "product-scoping-monetization",
        domain: "PM",
        nameEn: "Product Scoping, Co-Creation & SaaS Strategy",
        nameVi: "Định hình MVP, Trải nghiệm Sản phẩm & Mô hình SaaS",
        rank: "A",
        level: 89,
        icon: "fa-solid fa-rocket",
        summaryEn: "Translating user pain points into focused MVPs, pricing strategy, and retention-driven product loops.",
        summaryVi: "Chuyển hóa nỗi đau người dùng thành MVP tinh gọn, chiến lược thương mại hóa và vòng lặp giữ chân.",
        keywords: ["productdesign", "commercialsaas", "startups", "between-us"],
        proofs: [
          { labelEn: "Between Us SaaS Strategy", labelVi: "Chiến lược SaaS Between Us", href: "/blog/between-us-spatial-memory-canvas" },
          { labelEn: "Between Us Live Platform", labelVi: "Sản phẩm Between Us", href: "/projects/between-us" },
        ],
      },
      {
        id: "agile-sprint-execution",
        domain: "PM",
        nameEn: "Agile / Kanban Sprint Ownership",
        nameVi: "Điều phối Tiến độ Agile / Kanban",
        rank: "A",
        level: 87,
        icon: "fa-solid fa-list-check",
        summaryEn: "Breaking complex AI and backend initiatives into testable sprint increments with clear ownership.",
        summaryVi: "Phân rã hệ thống AI và backend phức tạp thành các gói công việc kiểm thử được theo sprint.",
        keywords: ["engineering", "product", "fullstack"],
        proofs: [
          { labelEn: "Omnimer R&D Team Lead", labelVi: "Điều phối Nhóm R&D Omnimer", href: "/experience/omnimer" },
        ],
      },
      {
        id: "outcome-kpi-telemetry",
        domain: "PM",
        nameEn: "Outcome Metrics & Engineering SLA Tracking",
        nameVi: "Đo lường Chỉ số Sản phẩm & Cam kết SLA",
        rank: "A",
        level: 88,
        icon: "fa-solid fa-gauge-high",
        summaryEn: "Defining concrete SLAs: <800ms voice response, 45m -> 2m research compression, and 0đ R2 egress.",
        summaryVi: "Thiết lập thước đo định lượng: phản hồi thoại <800ms, rút ngắn nghiên cứu 45p còn 2p, 0đ phí băng thông.",
        keywords: ["fintech", "realtime", "pipecat", "product"],
        proofs: [
          { labelEn: "AI Finance Pro Metrics", labelVi: "Chỉ số AI Finance Pro", href: "/blog/finance-analysis" },
        ],
      },
    ],
  },
  {
    id: "FE",
    code: "06 // FRONTEND & UX",
    icon: "fa-solid fa-layer-group",
    titleEn: "Frontend, Mobile & UX/UI",
    titleVi: "Frontend, Di động & UX/UI",
    subtitleEn: "Astro/Next.js islands, Flutter mobile apps, WebGL spatial UI, and WCAG AA design systems",
    subtitleVi: "Kiến trúc đảo Astro/Next.js, ứng dụng di động Flutter, không gian 3D WebGL và chuẩn WCAG AA",
    accent: "#3b82f6",
    softAccent: "#93c5fd",
    glow: "rgba(59, 130, 246, 0.22)",
    skills: [
      {
        id: "astro-nextjs-hybrid",
        domain: "FE",
        nameEn: "Astro 7 & Next.js 15 Edge/Islands Architecture",
        nameVi: "Kiến trúc Astro 7 & Next.js 15 Edge / Islands",
        rank: "S",
        level: 93,
        icon: "fa-solid fa-wand-magic-sparkles",
        summaryEn: "Zero-JS-by-default SSR/static hybrid pages, interactive spatial canvases, and <1ms edge asset delivery.",
        summaryVi: "Trang lai SSR/static tối ưu tốc độ, canvas không gian tương tác thời gian thực và phân phối tại Edge.",
        keywords: ["fullstack", "realtimeweb", "productdesign", "between-us"],
        proofs: [
          { labelEn: "Between Us Spatial Canvas", labelVi: "Bảng Không gian Between Us", href: "/projects/between-us" },
          { labelEn: "ViNar Digital Portal", labelVi: "Cổng thông tin Số ViNar", href: "/projects/vinagreen" },
        ],
      },
      {
        id: "react-motion-webgl",
        domain: "FE",
        nameEn: "React 19, Motion & Three.js Spatial Interfaces",
        nameVi: "Giao diện Tương tác React 19, Motion & Three.js",
        rank: "A",
        level: 89,
        icon: "fa-solid fa-cube",
        summaryEn: "Spring-driven micro-interactions, real-time co-presence cursors, and GPU-throttled WebGL scenes.",
        summaryVi: "Chuyển động vật lý mượt mà, đồng hiện diện thời gian thực qua WebSocket và cảnh 3D tối ưu GPU.",
        keywords: ["realtimeweb", "react", "webgl", "between-us"],
        proofs: [
          { labelEn: "Cyber-Arboretum Portfolio", labelVi: "Khu rừng Tri thức 3D", href: "/" },
          { labelEn: "Between Us Co-Presence", labelVi: "Đồng hiện diện Between Us", href: "/projects/between-us" },
        ],
      },
      {
        id: "flutter-cross-platform",
        domain: "FE",
        nameEn: "Flutter Mobile & Multimodal Client Apps",
        nameVi: "Ứng dụng Đa nền tảng Flutter (BLE, Voice & Vision)",
        rank: "A",
        level: 88,
        icon: "fa-solid fa-mobile-screen-button",
        summaryEn: "Cross-platform mobile apps integrating wearable BLE streams, camera meal recognition, and voice guides.",
        summaryVi: "Ứng dụng di động tích hợp luồng dữ liệu vòng đeo tay, nhận diện món ăn qua camera và giọng nói.",
        keywords: ["flutter", "healthtech", "omnimer"],
        proofs: [
          { labelEn: "OmniMer Food Mobile", labelVi: "Ứng dụng OmniMer Food", href: "/projects/omnimer-food" },
          { labelEn: "OmniMer Health Mobile", labelVi: "Ứng dụng OmniMer Health", href: "/projects/omnimer-health" },
        ],
      },
      {
        id: "ux-design-systems",
        domain: "FE",
        nameEn: "UX/UI Design Systems (C.R.A.P. & WCAG 2.1 AA)",
        nameVi: "Hệ thống Thiết kế UX/UI (C.R.A.P. & WCAG 2.1 AA)",
        rank: "A",
        level: 87,
        icon: "fa-solid fa-pen-ruler",
        summaryEn: "Tokenized typography/color scales, contrast-verified interfaces, and award-winning product journeys.",
        summaryVi: "Chuẩn hóa design token, kiểm chứng độ tương phản tiếp cận và thiết kế hành trình đạt giải quốc gia.",
        keywords: ["productdesign", "ux", "design"],
        proofs: [
          { labelEn: "CJ Crop · Top 5 UX/UI", labelVi: "CJ Crop · Top 5 Thiết kế", href: "/projects/cj-crop" },
        ],
      },
    ],
  },
  {
    id: "INFRA",
    code: "07 // CLOUD & INFRA",
    icon: "fa-solid fa-cloud-bolt",
    titleEn: "Cloud, Edge & DevOps",
    titleVi: "Hạ tầng Cloud, Edge & DevOps",
    subtitleEn: "Cloudflare Edge (Workers, D1, R2), Dockerized AI/PBX stacks, and CI/CD pipelines",
    subtitleVi: "Hệ sinh thái Cloudflare Edge (Workers, D1, R2), đóng gói Docker AI/PBX và đường ống CI/CD",
    accent: "#94a3b8",
    softAccent: "#e2e8f0",
    glow: "rgba(148, 163, 184, 0.22)",
    skills: [
      {
        id: "cloudflare-edge-stack",
        domain: "INFRA",
        nameEn: "Cloudflare Edge Stack (Workers, D1, R2 & KV)",
        nameVi: "Hạ tầng Biên Cloudflare (Workers, D1, R2 & KV)",
        rank: "S",
        level: 94,
        icon: "fa-solid fa-globe",
        summaryEn: "Serverless SQLite FTS5 indexing on D1, zero-egress R2 object storage, and sub-ms edge routing.",
        summaryVi: "Đánh chỉ mục tìm kiếm toàn văn FTS5 trên D1, lưu trữ đối tượng R2 0đ băng thông và định tuyến biên.",
        keywords: ["cloudflare", "architecture", "systemarchitecture", "between-us"],
        proofs: [
          { labelEn: "Live D1 Knowledge API", labelVi: "API Tri thức D1 Trực tuyến", href: "/docs/api" },
          { labelEn: "ViNar & Between Us Edge", labelVi: "Hạ tầng Edge ViNar & Between Us", href: "/projects/between-us" },
        ],
      },
      {
        id: "docker-compose-stacks",
        domain: "INFRA",
        nameEn: "Docker & Multi-Service Compose Orchestration",
        nameVi: "Đóng gói Docker & Điều phối Đa Dịch vụ Compose",
        rank: "A",
        level: 89,
        icon: "fa-brands fa-docker",
        summaryEn: "Reproducible containers for Asterisk PBX, Pipecat, Kafka/Redpanda, Qdrant, Odoo 18, and PostgreSQL.",
        summaryVi: "Đóng gói môi trường đồng nhất cho Asterisk PBX, Pipecat, Kafka/Redpanda, Qdrant, Odoo 18 và PostgreSQL.",
        keywords: ["docker", "asterisk", "kafka", "redpanda", "pipecat"],
        proofs: [
          { labelEn: "Asterisk + Pipecat Stack", labelVi: "Cụm Docker Asterisk + Pipecat", href: "/blog/voicebot-asterisk-pipecat-elevenlabs-ollama" },
          { labelEn: "ProdID Docker Environment", labelVi: "Môi trường Docker ProdID", href: "/projects/ritavo-prodid" },
        ],
      },
      {
        id: "linux-networking-webrtc",
        domain: "INFRA",
        nameEn: "Linux Server, SIP/RTP & WebRTC Networking",
        nameVi: "Quản trị Linux, Mạng Viễn thông SIP/RTP & WebRTC",
        rank: "A",
        level: 85,
        icon: "fa-solid fa-network-wired",
        summaryEn: "Systemd daemons, low-jitter audio socket transport, NAT/ICE traversal, and production log observability.",
        summaryVi: "Quản trị tiến trình systemd, tối ưu truyền tải gói âm thanh độ trễ thấp và giám sát log vận hành.",
        keywords: ["webrtc", "asterisk", "telephony", "pipecat"],
        proofs: [
          { labelEn: "WebRTC & SIP Production", labelVi: "Triển khai WebRTC & SIP", href: "/blog/pipecat-voicebot-production-guide" },
        ],
      },
      {
        id: "cicd-release-automation",
        domain: "INFRA",
        nameEn: "CI/CD Pipelines & Automated Verification",
        nameVi: "Đường ống CI/CD & Kiểm thử Tự động",
        rank: "B",
        level: 80,
        icon: "fa-solid fa-code-branch",
        summaryEn: "GitHub Actions workflows for schema checks, automated test suites, and zero-downtime deployments.",
        summaryVi: "Luồng GitHub Actions tự động kiểm tra lược đồ CSDL, chạy bộ test và phát hành liên tục.",
        keywords: ["github", "engineering", "architecture"],
        proofs: [
          { labelEn: "RitaVõ GitHub Actions CI", labelVi: "CI/CD GitHub Actions RitaVõ", href: "/experience/ritavo" },
        ],
      },
    ],
  },
];
