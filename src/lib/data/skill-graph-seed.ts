/**
 * @name skill-graph-seed.ts
 * @description Default seed data for the Skill Knowledge Graph (Domains, Hubs, Branches, Edges, and Article Links).
 */

export interface SkillDomainSeed {
  id: string;
  name_en: string;
  name_vi: string;
  color_hex: string;
  order_index: number;
}

export interface SkillNodeSeed {
  id: string;
  domain_id: string;
  parent_id?: string | null;
  name_en: string;
  name_vi: string;
  rank: "F" | "D" | "C" | "B" | "A" | "S";
  level: number;
  node_type: "HUB" | "BRANCH" | "LEAF";
  summary_en: string;
  summary_vi: string;
  icon?: string;
}

export interface SkillGraphEdgeSeed {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relation_type: "BRANCHES_TO" | "DEPENDS_ON" | "COMPLEMENTS";
  weight: number;
}

export interface ArticleSkillLinkSeed {
  article_slug: string;
  skill_node_id: string;
  relationship: string;
}

export const SEED_DOMAINS: SkillDomainSeed[] = [
  {
    id: "voip",
    name_en: "VoIP, Telephony & Realtime Audio",
    name_vi: "Tổng đài VoIP & Audio Thời gian thực",
    color_hex: "#18c785",
    order_index: 1,
  },
  {
    id: "be",
    name_en: "Backend Systems & Event Streaming",
    name_vi: "Hệ thống Phân tán & Luồng Dữ liệu",
    color_hex: "#3b82f6",
    order_index: 2,
  },
  {
    id: "ai",
    name_en: "AI Agents, Voicebots & LLM RAG",
    name_vi: "Hệ thống Trí tuệ Nhân tạo & Voicebot",
    color_hex: "#a855f7",
    order_index: 3,
  },
  {
    id: "mobile",
    name_en: "Cross-Platform & Native Mobile",
    name_vi: "Ứng dụng Di động Đa nền tảng",
    color_hex: "#06b6d4",
    order_index: 4,
  },
  {
    id: "infra",
    name_en: "Cloud, Containers & Observability",
    name_vi: "Hạ tầng Đám mây & Vận hành Lab",
    color_hex: "#f59e0b",
    order_index: 5,
  },
  {
    id: "fe",
    name_en: "Frontend & Island Architecture",
    name_vi: "Kiến trúc Giao diện & Hiệu năng Web",
    color_hex: "#ec4899",
    order_index: 6,
  },
  {
    id: "pm_ba",
    name_en: "Product & Technical Business Analysis",
    name_vi: "Phân tích Nghiệp vụ & Quản lý Sản phẩm",
    color_hex: "#10b981",
    order_index: 7,
  },
];

export const SEED_NODES: SkillNodeSeed[] = [
  // --- VOIP DOMAIN ---
  {
    id: "asterisk-core",
    domain_id: "voip",
    parent_id: null,
    name_en: "Asterisk PBX Core",
    name_vi: "Lõi Tổng đài Asterisk 22",
    rank: "S",
    level: 95,
    node_type: "HUB",
    summary_en: "Core telephony engine, channel drivers, dialplans, and low-latency audio pipelines.",
    summary_vi: "Động cơ tổng đài lõi, điều khiển kênh thoại, dialplan và đường ống âm thanh độ trễ thấp.",
    icon: "fa-solid fa-phone-volume",
  },
  {
    id: "asterisk-webrtc",
    domain_id: "voip",
    parent_id: "asterisk-core",
    name_en: "WebRTC / TLS / SRTP",
    name_vi: "Giao thức WebRTC & Mã hóa SRTP",
    rank: "S",
    level: 92,
    node_type: "BRANCH",
    summary_en: "Secure browser-to-PBX audio via WSS, DTLS handshake, and ICE/STUN/TURN NAT traversal.",
    summary_vi: "Truyền âm thanh trình duyệt qua WSS, bắt tay DTLS và xuyên NAT bằng ICE/STUN/TURN.",
    icon: "fa-solid fa-shield-halved",
  },
  {
    id: "asterisk-cdr-ami",
    domain_id: "voip",
    parent_id: "asterisk-core",
    name_en: "CDR / CEL / AMI / ARI",
    name_vi: "Bản ghi Cuộc gọi & Giao tiếp Quản trị",
    rank: "S",
    level: 94,
    node_type: "BRANCH",
    summary_en: "Realtime call event tracking, AMI sockets, and RESTful ARI channel orchestration.",
    summary_vi: "Theo dõi sự kiện cuộc gọi thời gian thực, socket AMI và điều khiển kênh bằng REST ARI.",
    icon: "fa-solid fa-database",
  },
  {
    id: "asterisk-stasis-voicebot",
    domain_id: "voip",
    parent_id: "asterisk-core",
    name_en: "Stasis, HA & Voicebot Engine",
    name_vi: "Động cơ Stasis & Kết nối Voicebot",
    rank: "S",
    level: 96,
    node_type: "BRANCH",
    summary_en: "ExternalMedia bidirectional PCM audio bridges for conversational AI voicebots.",
    summary_vi: "Cầu nối âm thanh hai chiều ExternalMedia kết nối bot AI với độ trễ <800ms.",
    icon: "fa-solid fa-robot",
  },
  {
    id: "asterisk-ops-security",
    domain_id: "voip",
    parent_id: "asterisk-core",
    name_en: "PBX Debug, Fail2ban & Security",
    name_vi: "Giám sát, Debug & Phòng thủ SIP DDoS",
    rank: "A",
    level: 88,
    node_type: "BRANCH",
    summary_en: "SNGREP packet analysis, Fail2ban rate-limiting, and SIP fraud mitigation.",
    summary_vi: "Bắt gói tin SNGREP, phòng thủ Fail2ban và chống tấn công vét cạn SIP.",
    icon: "fa-solid fa-bug",
  },
  {
    id: "asterisk-pjsip-trunk",
    domain_id: "voip",
    parent_id: "asterisk-core",
    name_en: "PJSIP Trunk & PSTN Interconnect",
    name_vi: "Cấu hình Trunk SIP & Kết nối PSTN",
    rank: "A",
    level: 89,
    node_type: "BRANCH",
    summary_en: "Modern PJSIP endpoints, AORs, auth, and carrier PSTN trunk gateways.",
    summary_vi: "Khởi tạo endpoint PJSIP, định danh AOR và đấu nối trunk nhà mạng PSTN.",
    icon: "fa-solid fa-network-wired",
  },
  {
    id: "asterisk-dialplan",
    domain_id: "voip",
    parent_id: "asterisk-core",
    name_en: "Dialplan & Extensions.conf",
    name_vi: "Kịch bản Định tuyến Dialplan",
    rank: "A",
    level: 87,
    node_type: "BRANCH",
    summary_en: "Extensions routing, IVR menus, queue distribution, and voicemail macros.",
    summary_vi: "Định tuyến extensions, menu IVR, hàng đợi cuộc gọi và hộp thư thoại.",
    icon: "fa-solid fa-diagram-project",
  },
  {
    id: "asterisk-cli-config",
    domain_id: "voip",
    parent_id: "asterisk-core",
    name_en: "CLI & Config Architecture",
    name_vi: "Cài đặt & Kiến trúc Thư mục Asterisk",
    rank: "B",
    level: 82,
    node_type: "BRANCH",
    summary_en: "Source build flags, systemd unit daemons, and core CLI maintenance commands.",
    summary_vi: "Biên dịch mã nguồn, daemon systemd và bộ lệnh điều khiển qua CLI.",
    icon: "fa-solid fa-terminal",
  },
  {
    id: "telephony-3cx",
    domain_id: "voip",
    parent_id: null,
    name_en: "3CX Enterprise PBX & Telemetry",
    name_vi: "Tổng đài Doanh nghiệp 3CX & Giám sát",
    rank: "S",
    level: 93,
    node_type: "HUB",
    summary_en: "Multi-leg call routing, wallboard telemetry, and zero-loss message queues.",
    summary_vi: "Điều hướng cuộc gọi đa nhánh, bảng giám sát thời gian thực và hàng đợi RabbitMQ.",
    icon: "fa-solid fa-headset",
  },

  // --- BACKEND DOMAIN ---
  {
    id: "kafka-distributed",
    domain_id: "be",
    parent_id: null,
    name_en: "Apache Kafka Event Streaming",
    name_vi: "Nền tảng Luồng Sự kiện Phân tán Kafka",
    rank: "S",
    level: 94,
    node_type: "HUB",
    summary_en: "High-throughput distributed commit log, append-only disk architecture, and KRaft consensus.",
    summary_vi: "Nhật ký commit phân tán hiệu năng cao, ghi đĩa tuần tự và đồng thuận KRaft.",
    icon: "fa-solid fa-bolt",
  },
  {
    id: "kafka-partitions",
    domain_id: "be",
    parent_id: "kafka-distributed",
    name_en: "Partitions, Hashing & KRaft",
    name_vi: "Phân vùng Dữ liệu & Đồng thuận KRaft",
    rank: "S",
    level: 92,
    node_type: "BRANCH",
    summary_en: "Hot partition avoidance, murmur2 hash partitioning, and zero-copy PageCache optimization.",
    summary_vi: "Xử lý lệch tải phân vùng, băm murmur2 và tối ưu PageCache Zero-Copy.",
    icon: "fa-solid fa-cubes",
  },
  {
    id: "kafka-consumer-groups",
    domain_id: "be",
    parent_id: "kafka-distributed",
    name_en: "Consumer Groups & Rebalance",
    name_vi: "Nhóm Tiêu thụ & Xử lý Tránh Bão Rebalance",
    rank: "S",
    level: 90,
    node_type: "BRANCH",
    summary_en: "CommitFailedException mitigation, heartbeat thread isolation, and cooperative sticky rebalancing.",
    summary_vi: "Khắc phục lỗi CommitFailedException, tách luồng heartbeat và rebalance ổn định.",
    icon: "fa-solid fa-users-gear",
  },
  {
    id: "redis-architecture",
    domain_id: "be",
    parent_id: null,
    name_en: "Redis Stream & Pub/Sub",
    name_vi: "Đường ống Luồng Dữ liệu Redis Stream",
    rank: "S",
    level: 92,
    node_type: "HUB",
    summary_en: "In-memory streaming, consumer groups, pending entry lists (PEL), and state snapshots.",
    summary_vi: "Luồng dữ liệu trên RAM, consumer group, danh sách PEL và ảnh chụp trạng thái.",
    icon: "fa-solid fa-server",
  },
  {
    id: "redis-streams",
    domain_id: "be",
    parent_id: "redis-architecture",
    name_en: "Consumer Groups & Snapshots",
    name_vi: "Consumer Group & Khôi phục Snapshot",
    rank: "S",
    level: 91,
    node_type: "BRANCH",
    summary_en: "Wallboard cache syncing, XACK acknowledgments, and consumer failover recovery.",
    summary_vi: "Đồng bộ giám sát cuộc gọi, xác nhận XACK và chuyển vùng dự phòng sự cố.",
    icon: "fa-solid fa-clock-rotate-left",
  },
  {
    id: "fastapi-backend",
    domain_id: "be",
    parent_id: null,
    name_en: "FastAPI & Async Python",
    name_vi: "Backend Bất đồng bộ FastAPI & Python",
    rank: "A",
    level: 88,
    node_type: "HUB",
    summary_en: "ASGI asynchronous endpoints, Pydantic validation, and background worker queues.",
    summary_vi: "Điểm cuối ASGI bất đồng bộ, xác thực schema Pydantic và hàng đợi tác vụ.",
    icon: "fa-solid fa-code",
  },
  {
    id: "dotnet-csharp",
    domain_id: "be",
    parent_id: null,
    name_en: ".NET & C# Realtime Telecom",
    name_vi: "Dịch vụ Viễn thông Realtime C#/.NET",
    rank: "A",
    level: 85,
    node_type: "HUB",
    summary_en: "High-performance PBX event listeners, RabbitMQ consumers, and microservices.",
    summary_vi: "Trình lắng nghe sự kiện tổng đài, tiêu thụ message RabbitMQ và vi dịch vụ.",
    icon: "fa-brands fa-microsoft",
  },

  // --- AI DOMAIN ---
  {
    id: "voicebot-pipecat",
    domain_id: "ai",
    parent_id: null,
    name_en: "Pipecat Telephony Voicebot Pipeline",
    name_vi: "Đường ống Voicebot Telephony Pipecat",
    rank: "S",
    level: 95,
    node_type: "HUB",
    summary_en: "Streaming frame processors, bidirectional WebSockets, and stateful voice conversations.",
    summary_vi: "Đường ống xử lý frame âm thanh trực tiếp, WebSocket hai chiều và hội thoại thông minh.",
    icon: "fa-solid fa-microphone-lines",
  },
  {
    id: "pipecat-stt-tts",
    domain_id: "ai",
    parent_id: "voicebot-pipecat",
    name_en: "ElevenLabs STT & TTS Turbo",
    name_vi: "Chuyển đổi Giọng nói Siêu tốc ElevenLabs",
    rank: "S",
    level: 93,
    node_type: "BRANCH",
    summary_en: "Sub-second speech-to-text scribe and low-latency eleven_v4_turbo neural speech synthesis.",
    summary_vi: "Nhận diện giọng nói scribe độ chính xác cao và tổng hợp tiếng nói tự nhiên độ trễ thấp.",
    icon: "fa-solid fa-wave-square",
  },
  {
    id: "pipecat-barge-in",
    domain_id: "ai",
    parent_id: "voicebot-pipecat",
    name_en: "Acoustic Echo Gate & Barge-in",
    name_vi: "Khử Vọng Loa Ngoài & Ngắt Lời Tự nhiên",
    rank: "S",
    level: 94,
    node_type: "BRANCH",
    summary_en: "Custom SttEchoGateProcessor, instant audio stream interruption, and anti-deadlock buffers.",
    summary_vi: "Bộ xử lý SttEchoGate chống vọng loa thoại, ngắt lời người nói tức thì và tránh kẹt buffer.",
    icon: "fa-solid fa-volume-xmark",
  },
  {
    id: "pipecat-vad-latency",
    domain_id: "ai",
    parent_id: "voicebot-pipecat",
    name_en: "Sub-800ms Latency & VAD Tuning",
    name_vi: "Tinh chỉnh VAD & Độ trễ Dưới 800ms",
    rank: "S",
    level: 92,
    node_type: "BRANCH",
    summary_en: "Silero VAD threshold optimization, chunk pre-buffering, and end-of-turn calibration.",
    summary_vi: "Tối ưu ngưỡng phát hiện giọng nói Silero, đệm gói nhỏ và căn chỉnh lượt nói tự nhiên.",
    icon: "fa-solid fa-stopwatch",
  },
  {
    id: "langgraph-rag",
    domain_id: "ai",
    parent_id: null,
    name_en: "LangGraph Multi-Agent & RAG",
    name_vi: "Hệ thống Đa Agent LangGraph & RAG",
    rank: "S",
    level: 92,
    node_type: "HUB",
    summary_en: "Stateful agent graphs, cyclical routing, guardrails, and vector store retrieval.",
    summary_vi: "Đồ thị trạng thái đa tác tử, định tuyến lặp, rào chắn an toàn và truy xuất tri thức.",
    icon: "fa-solid fa-diagram-nested",
  },
  {
    id: "graphrag-biometrics",
    domain_id: "ai",
    parent_id: null,
    name_en: "GraphRAG & Anomaly Detection",
    name_vi: "Truy xuất Tri thức Đồ thị & Sinh hiệu",
    rank: "A",
    level: 89,
    node_type: "HUB",
    summary_en: "Knowledge graphs for medical telemetry, FHIR compliance, and sub-500ms safety alerts.",
    summary_vi: "Đồ thị tri thức phân tích sinh hiệu đeo tay, chuẩn FHIR và cảnh báo an toàn y tế.",
    icon: "fa-solid fa-heart-pulse",
  },

  // --- MOBILE DOMAIN ---
  {
    id: "mobile-ecosystem",
    domain_id: "mobile",
    parent_id: null,
    name_en: "Mobile Engineering Ecosystem",
    name_vi: "Hệ Sinh Thái Kỹ Thuật Ứng Dụng Di Động",
    rank: "S",
    level: 94,
    node_type: "HUB",
    summary_en: "Full mobile stack across cross-platform frameworks and platform-native runtimes.",
    summary_vi: "Toàn bộ hệ sinh thái di động gồm framework đa nền tảng và runtime native chuyên sâu.",
    icon: "fa-solid fa-mobile-screen",
  },
  {
    id: "mobile-flutter",
    domain_id: "mobile",
    parent_id: "mobile-ecosystem",
    name_en: "Flutter & Dart Cross-Platform",
    name_vi: "Phát triển Đa nền tảng Flutter & Dart",
    rank: "S",
    level: 95,
    node_type: "BRANCH",
    summary_en: "BLoC state management, custom canvas rendering, offline computer vision, and battery-efficient GPS.",
    summary_vi: "Quản lý trạng thái BLoC, canvas tùy biến, thị giác máy tính offline và tối ưu pin GPS.",
    icon: "fa-brands fa-flutter",
  },
  {
    id: "mobile-react-native",
    domain_id: "mobile",
    parent_id: "mobile-ecosystem",
    name_en: "React Native & Native Bridges",
    name_vi: "Ứng dụng React Native & Module Cầu nối",
    rank: "A",
    level: 87,
    node_type: "BRANCH",
    summary_en: "TurboModules, JSI native bindings, WebRTC audio streaming, and cross-platform hooks.",
    summary_vi: "Kiến trúc TurboModules, cầu nối JSI, truyền luồng âm thanh WebRTC và hook tùy biến.",
    icon: "fa-brands fa-react",
  },
  {
    id: "mobile-swift",
    domain_id: "mobile",
    parent_id: "mobile-ecosystem",
    name_en: "Swift / iOS Native Architecture",
    name_vi: "Kiến trúc Ứng dụng iOS Chuẩn Native",
    rank: "A",
    level: 85,
    node_type: "BRANCH",
    summary_en: "SwiftUI, Combine, AVAudioEngine real-time buffers, and CoreLocation background daemons.",
    summary_vi: "Giao diện SwiftUI, Combine, xử lý buffer âm thanh AVAudioEngine và dịch vụ nền vị trí.",
    icon: "fa-brands fa-apple",
  },
  {
    id: "mobile-kotlin",
    domain_id: "mobile",
    parent_id: "mobile-ecosystem",
    name_en: "Kotlin / Android Native Systems",
    name_vi: "Lập trình Android Native & Dịch vụ Nền",
    rank: "A",
    level: 86,
    node_type: "BRANCH",
    summary_en: "Jetpack Compose, Kotlin Coroutines/Flow, Foreground Services, and AudioRecord low-latency I/O.",
    summary_vi: "Giao diện Jetpack Compose, Coroutine/Flow, Dịch vụ tiền tuyến và ghi âm PCM độ trễ thấp.",
    icon: "fa-brands fa-android",
  },

  // --- INFRA DOMAIN ---
  {
    id: "cloudflare-edge",
    domain_id: "infra",
    parent_id: null,
    name_en: "Cloudflare Edge, Workers & D1",
    name_vi: "Nền tảng Điện toán Biên Cloudflare D1",
    rank: "S",
    level: 92,
    node_type: "HUB",
    summary_en: "Serverless edge functions, globally distributed D1 SQLite, R2 object stores, and zero-latency routing.",
    summary_vi: "Điện toán biên không máy chủ, cơ sở dữ liệu D1 toàn cầu, lưu trữ R2 và định tuyến biên.",
    icon: "fa-brands fa-cloudflare",
  },
  {
    id: "docker-containers",
    domain_id: "infra",
    parent_id: null,
    name_en: "Docker & Container Orchestration",
    name_vi: "Đóng gói Container & Triển khai Lab",
    rank: "A",
    level: 88,
    node_type: "HUB",
    summary_en: "Multi-stage Docker builds, Compose networks, volume mounts, and isolated PBX testbeds.",
    summary_vi: "Đóng gói Docker nhiều giai đoạn, mạng Compose và môi trường giả lập tổng đài độc lập.",
    icon: "fa-brands fa-docker",
  },
  {
    id: "linux-sysadmin",
    domain_id: "infra",
    parent_id: null,
    name_en: "Linux Hardening & Network Ops",
    name_vi: "Quản trị Linux, Tường lửa & Giám sát SIP",
    rank: "A",
    level: 89,
    node_type: "HUB",
    summary_en: "IPTables/NFTables rules, kernel sysctl tuning for RTP ports, and systemd process supervision.",
    summary_vi: "Cấu hình tường lửa IPTables, tinh chỉnh nhân kernel cho cổng RTP và giám sát systemd.",
    icon: "fa-brands fa-linux",
  },

  // --- FRONTEND DOMAIN ---
  {
    id: "astro-modern",
    domain_id: "fe",
    parent_id: null,
    name_en: "Astro Island Architecture",
    name_vi: "Kiến trúc Đảo Tối ưu Tốc độ Astro",
    rank: "S",
    level: 94,
    node_type: "HUB",
    summary_en: "Zero-JS by default, partial hydration islands, SSR on Edge Workers, and markdown pipelines.",
    summary_vi: "Tối ưu zero-JS mặc định, hydrate từng phần, chạy SSR trên Workers và render markdown.",
    icon: "fa-solid fa-rocket",
  },
  {
    id: "react-ecosystem",
    domain_id: "fe",
    parent_id: null,
    name_en: "React 19 & State Primitives",
    name_vi: "Hệ sinh thái React 19 & Tối ưu Render",
    rank: "S",
    level: 93,
    node_type: "HUB",
    summary_en: "Concurrent features, custom hooks, canvas charts, and ultra-smooth CSS keyframe choreography.",
    summary_vi: "Tính năng Concurrent, hook tùy biến, biểu đồ canvas và hiệu ứng chuyển động mượt mà.",
    icon: "fa-brands fa-react",
  },

  // --- PM & BA DOMAIN ---
  {
    id: "telecom-ba",
    domain_id: "pm_ba",
    parent_id: null,
    name_en: "Telephony & Fintech Technical BA",
    name_vi: "Phân tích Nghiệp vụ Kỹ thuật Viễn thông",
    rank: "S",
    level: 95,
    node_type: "HUB",
    summary_en: "Software requirements specifications, IVR dialogue decision trees, and banking integration matrices.",
    summary_vi: "Đặc tả yêu cầu phần mềm, cây quyết định hội thoại IVR và ma trận tích hợp ngân hàng.",
    icon: "fa-solid fa-file-invoice",
  },
  {
    id: "poc-validation",
    domain_id: "pm_ba",
    parent_id: null,
    name_en: "Banking PoC Acceptance & QA",
    name_vi: "Xác thực Nghiệm thu PoC Ngân hàng",
    rank: "S",
    level: 96,
    node_type: "HUB",
    summary_en: "Live executive demonstrations, branch noise edge-case validation, and stakeholder sign-off.",
    summary_vi: "Trình diễn trực tiếp trước hội đồng, kiểm thử nhiễu quầy giao dịch và nghiệm thu dự án.",
    icon: "fa-solid fa-clipboard-check",
  },
];

export const SEED_EDGES: SkillGraphEdgeSeed[] = [
  // Asterisk Core Branches
  { id: "e-ast-webrtc", source_node_id: "asterisk-core", target_node_id: "asterisk-webrtc", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-ast-cdr", source_node_id: "asterisk-core", target_node_id: "asterisk-cdr-ami", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-ast-stasis", source_node_id: "asterisk-core", target_node_id: "asterisk-stasis-voicebot", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-ast-ops", source_node_id: "asterisk-core", target_node_id: "asterisk-ops-security", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-ast-pjsip", source_node_id: "asterisk-core", target_node_id: "asterisk-pjsip-trunk", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-ast-dialplan", source_node_id: "asterisk-core", target_node_id: "asterisk-dialplan", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-ast-cli", source_node_id: "asterisk-core", target_node_id: "asterisk-cli-config", relation_type: "BRANCHES_TO", weight: 1.0 },

  // Kafka Branches
  { id: "e-kf-partitions", source_node_id: "kafka-distributed", target_node_id: "kafka-partitions", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-kf-cg", source_node_id: "kafka-distributed", target_node_id: "kafka-consumer-groups", relation_type: "BRANCHES_TO", weight: 1.0 },

  // Redis Branches
  { id: "e-rd-streams", source_node_id: "redis-architecture", target_node_id: "redis-streams", relation_type: "BRANCHES_TO", weight: 1.0 },

  // Pipecat Branches
  { id: "e-pc-stt-tts", source_node_id: "voicebot-pipecat", target_node_id: "pipecat-stt-tts", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-pc-barge-in", source_node_id: "voicebot-pipecat", target_node_id: "pipecat-barge-in", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-pc-vad", source_node_id: "voicebot-pipecat", target_node_id: "pipecat-vad-latency", relation_type: "BRANCHES_TO", weight: 1.0 },

  // Mobile Ecosystem Branches
  { id: "e-mob-flutter", source_node_id: "mobile-ecosystem", target_node_id: "mobile-flutter", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-mob-rn", source_node_id: "mobile-ecosystem", target_node_id: "mobile-react-native", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-mob-swift", source_node_id: "mobile-ecosystem", target_node_id: "mobile-swift", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-mob-kotlin", source_node_id: "mobile-ecosystem", target_node_id: "mobile-kotlin", relation_type: "BRANCHES_TO", weight: 1.0 },

  // Cross-Cluster Dependencies & Complements
  { id: "e-cross-pc-stasis", source_node_id: "voicebot-pipecat", target_node_id: "asterisk-stasis-voicebot", relation_type: "DEPENDS_ON", weight: 1.0 },
  { id: "e-cross-3cx-redis", source_node_id: "telephony-3cx", target_node_id: "redis-architecture", relation_type: "DEPENDS_ON", weight: 1.0 },
  { id: "e-cross-3cx-kafka", source_node_id: "telephony-3cx", target_node_id: "kafka-distributed", relation_type: "DEPENDS_ON", weight: 1.0 },
  { id: "e-cross-fl-ai", source_node_id: "mobile-flutter", target_node_id: "voicebot-pipecat", relation_type: "COMPLEMENTS", weight: 0.8 },
  { id: "e-cross-fl-rag", source_node_id: "mobile-flutter", target_node_id: "langgraph-rag", relation_type: "COMPLEMENTS", weight: 0.8 },
  { id: "e-cross-cf-d1", source_node_id: "astro-modern", target_node_id: "cloudflare-edge", relation_type: "DEPENDS_ON", weight: 1.0 },
  { id: "e-cross-ba-poc", source_node_id: "telecom-ba", target_node_id: "poc-validation", relation_type: "BRANCHES_TO", weight: 1.0 },
  { id: "e-cross-poc-telecom", source_node_id: "poc-validation", target_node_id: "telephony-3cx", relation_type: "COMPLEMENTS", weight: 0.9 },
  { id: "e-cross-poc-ast", source_node_id: "poc-validation", target_node_id: "asterisk-core", relation_type: "COMPLEMENTS", weight: 0.9 },
];

export const SEED_ARTICLE_LINKS: ArticleSkillLinkSeed[] = [
  // Asterisk Series
  { article_slug: "asterisk-nen-tang-voip-sip-kien-truc", skill_node_id: "asterisk-core", relationship: "EXPLAINS_THEORY" },
  { article_slug: "asterisk-cai-dat-thu-muc-cli", skill_node_id: "asterisk-cli-config", relationship: "EXPLAINS_THEORY" },
  { article_slug: "asterisk-pjsip-wizard-transport-nat", skill_node_id: "asterisk-pjsip-trunk", relationship: "EXPLAINS_THEORY" },
  { article_slug: "asterisk-dialplan-ivr-queue-voicemail", skill_node_id: "asterisk-dialplan", relationship: "EXPLAINS_THEORY" },
  { article_slug: "asterisk-trunk-pstn", skill_node_id: "asterisk-pjsip-trunk", relationship: "EXPLAINS_THEORY" },
  { article_slug: "asterisk-webrtc-tls-srtp", skill_node_id: "asterisk-webrtc", relationship: "PROVES_PRODUCTION" },
  { article_slug: "asterisk-cdr-cel-ami-ari", skill_node_id: "asterisk-cdr-ami", relationship: "PROVES_PRODUCTION" },
  { article_slug: "asterisk-van-hanh-debug-bao-mat", skill_node_id: "asterisk-ops-security", relationship: "FIXES_BUG" },
  { article_slug: "asterisk-nang-cao-stasis-ha-voicebot", skill_node_id: "asterisk-stasis-voicebot", relationship: "PROVES_PRODUCTION" },

  // Pipecat Voicebot Guides
  { article_slug: "voicebot-asterisk-pipecat-elevenlabs-ollama", skill_node_id: "voicebot-pipecat", relationship: "PROVES_PRODUCTION" },
  { article_slug: "voicebot-asterisk-pipecat-elevenlabs-ollama", skill_node_id: "asterisk-stasis-voicebot", relationship: "PROVES_PRODUCTION" },
  { article_slug: "voicebot-asterisk-pipecat-elevenlabs-ollama", skill_node_id: "pipecat-stt-tts", relationship: "PROVES_PRODUCTION" },
  { article_slug: "voicebot-asterisk-pipecat-elevenlabs-ollama", skill_node_id: "pipecat-barge-in", relationship: "FIXES_BUG" },
  { article_slug: "pipecat-voicebot-production-guide", skill_node_id: "voicebot-pipecat", relationship: "EXPLAINS_THEORY" },
  { article_slug: "pipecat-voicebot-production-guide", skill_node_id: "pipecat-vad-latency", relationship: "PROVES_PRODUCTION" },

  // Kafka Series
  { article_slug: "kafka-core-concepts-and-architecture", skill_node_id: "kafka-distributed", relationship: "EXPLAINS_THEORY" },
  { article_slug: "kafka-core-concepts-and-architecture", skill_node_id: "kafka-partitions", relationship: "EXPLAINS_THEORY" },
  { article_slug: "kafka-pbx-event-streaming-architecture", skill_node_id: "kafka-distributed", relationship: "PROVES_PRODUCTION" },
  { article_slug: "kafka-pbx-event-streaming-architecture", skill_node_id: "kafka-consumer-groups", relationship: "FIXES_BUG" },
  { article_slug: "kafka-pbx-event-streaming-architecture", skill_node_id: "telephony-3cx", relationship: "PROVES_PRODUCTION" },

  // Redis Series
  { article_slug: "redis-stream-theory-and-best-practices", skill_node_id: "redis-architecture", relationship: "EXPLAINS_THEORY" },
  { article_slug: "redis-stream-theory-and-best-practices", skill_node_id: "redis-streams", relationship: "PROVES_PRODUCTION" },

  // AI & RAG
  { article_slug: "building-omnimer-health", skill_node_id: "graphrag-biometrics", relationship: "PROVES_PRODUCTION" },
  { article_slug: "building-omnimer-health", skill_node_id: "langgraph-rag", relationship: "EXPLAINS_THEORY" },
  { article_slug: "finance-analysis", skill_node_id: "langgraph-rag", relationship: "EXPLAINS_THEORY" },

  // Mobile Flutter
  { article_slug: "between-us-spatial-memory-canvas", skill_node_id: "mobile-flutter", relationship: "PROVES_PRODUCTION" },
];
