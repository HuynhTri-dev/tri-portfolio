/**
 * @name constants.ts
 * @description Constants, domain metadata, fallback article titles, and node short labels.
 */

import type { SkillRank } from "../../../data/skill-matrix";
import type { DomainMetaItem } from "./types";

export const RANK_COLOR_MAP: Record<SkillRank, string> = {
  S: "#18c785",
  A: "#38bdf8",
  B: "#a855f7",
  C: "#94a3b8",
  D: "#64748b",
  E: "#475569",
  F: "#334155",
};

export const DOMAIN_META: Record<string, DomainMetaItem> = {
  voip: {
    shortEn: "VoIP & Asterisk PBX",
    shortVi: "Tổng đài VoIP & Asterisk",
    icon: "fa-solid fa-phone-volume",
    color: "#18c785",
    proofs: [
      {
        labelEn: "IDB Enterprise 3CX & Asterisk Systems",
        labelVi: "Hệ thống Tổng đài 3CX & Asterisk tại IDB",
        href: "/experience/idb",
      },
    ],
  },
  ai: {
    shortEn: "Voicebot & AI RAG",
    shortVi: "Voicebot & AI RAG",
    icon: "fa-solid fa-microphone-lines",
    color: "#a855f7",
    proofs: [
      {
        labelEn: "Sacombank & Nam Á Bank AI Voicebot PoC",
        labelVi: "PoC Voicebot AI Ngân hàng Sacombank & Nam Á",
        href: "/experience/idb",
      },
      {
        labelEn: "OmniMer Health GraphRAG Architecture",
        labelVi: "Kiến trúc GraphRAG Y tế OmniMer Health",
        href: "/projects/omnimer-health",
      },
    ],
  },
  backend: {
    shortEn: "Kafka & High-Throughput",
    shortVi: "Kafka & Xử lý Phân tán",
    icon: "fa-solid fa-server",
    color: "#38bdf8",
    proofs: [
      {
        labelEn: "IDB CDR & Telemetry Event Streams",
        labelVi: "Xử lý Luồng Sự kiện CDR & Đo kiểm IDB",
        href: "/experience/idb",
      },
      {
        labelEn: "OmniMer Realtime Health Metric Ingestion",
        labelVi: "Tiếp nhận Chỉ số Y tế Thời gian thực OmniMer",
        href: "/projects/omnimer-health",
      },
    ],
  },
  mobile: {
    shortEn: "Cross-Platform Mobile",
    shortVi: "Di động Đa nền tảng",
    icon: "fa-solid fa-mobile-screen-button",
    color: "#f59e0b",
    proofs: [
      {
        labelEn: "OmniMer Health Flutter Patient Hub",
        labelVi: "Ứng dụng Theo dõi Sức khỏe Flutter OmniMer",
        href: "/projects/omnimer-health",
      },
      {
        labelEn: "VinaGreen Agriculture Supply Chain App",
        labelVi: "Ứng dụng Chuỗi Cung ứng Nông nghiệp VinaGreen",
        href: "/projects/vinagreen",
      },
    ],
  },
  devops: {
    shortEn: "Cloud, Edge & Infra",
    shortVi: "Hạ tầng Cloud & Biên Edge",
    icon: "fa-solid fa-cloud",
    color: "#ec4899",
    proofs: [
      {
        labelEn: "Cloudflare D1 & Workers Edge Portfolio",
        labelVi: "Kiến trúc Edge Portfolio Cloudflare D1 & Workers",
        href: "/projects/portfolio",
      },
      {
        labelEn: "VinaGreen Cold Storage IoT Edge Gateways",
        labelVi: "Gateway IoT Kho Lạnh VinaGreen",
        href: "/projects/vinagreen",
      },
    ],
  },
  ba: {
    shortEn: "Fintech & Telecom BA",
    shortVi: "BA Viễn thông & Ngân hàng",
    icon: "fa-solid fa-diagram-project",
    color: "#06b6d4",
    proofs: [
      {
        labelEn: "Sacombank Voicebot Requirements & PoC Signoff",
        labelVi: "Đặc tả Yêu cầu & Nghiệm thu PoC Sacombank",
        href: "/experience/idb",
      },
      {
        labelEn: "VinaGreen Agriculture Operations SRS",
        labelVi: "Hồ sơ Phân tích Nghiệp vụ Nông nghiệp VinaGreen",
        href: "/projects/vinagreen",
      },
    ],
  },
};

export const ARTICLE_TITLE_FALLBACKS: Record<
  string,
  { en: string; vi: string; category: string }
> = {
  "asterisk-webrtc": {
    en: "Hardening Asterisk WebRTC: WSS, DTLS-SRTP & ICE Negotiation",
    vi: "Tối ưu Asterisk WebRTC: WSS, DTLS-SRTP & Đàm phán ICE",
    category: "VoIP & Real-Time",
  },
  "asterisk-cdr-ami-ari": {
    en: "Realtime Telephony Telemetry: AMI, ARI and Kafka Pipeline",
    vi: "Đo kiểm Viễn thông Thời gian thực: AMI, ARI & Đường ống Kafka",
    category: "VoIP & Real-Time",
  },
  "asterisk-stasis-voicebot": {
    en: "Bidirectional Audio Streams via Asterisk Stasis & AudioSocket",
    vi: "Luồng Âm thanh Hai chiều qua Asterisk Stasis & AudioSocket",
    category: "VoIP & Real-Time",
  },
  "asterisk-sngrep-rtp-debug": {
    en: "Zero-Downtime SIP Diagnostics with Sngrep and Wireshark RTP",
    vi: "Chẩn đoán SIP Không Gián đoạn với Sngrep & Phân tích Gói RTP",
    category: "VoIP & Real-Time",
  },
  "asterisk-pjsip-trunk-kamailio": {
    en: "Carrier-Grade PJSIP Trunks with Kamailio Load Balancing",
    vi: "Đấu nối Trung kế PJSIP Cấp Nhà mạng với Cân bằng Tải Kamailio",
    category: "VoIP & Real-Time",
  },
  "asterisk-dialplan-patterns": {
    en: "Enterprise Dialplan Routing, Custom Macro & IVR Fallbacks",
    vi: "Định tuyến Cuộc gọi Doanh nghiệp, Macro Tùy biến & IVR Dự phòng",
    category: "VoIP & Real-Time",
  },
  "asterisk-cli-core-dumps": {
    en: "Production Asterisk Daemon Tuning & GDB Core Dump Analysis",
    vi: "Tinh chỉnh Daemon Asterisk Môi trường Chạy Thật & Phân tích GDB Core Dump",
    category: "VoIP & Real-Time",
  },
  "3cx-telephony-integration": {
    en: "IDB Enterprise 3CX Integration, Call Flow & CRM Sync",
    vi: "Tích hợp Tổng đài Doanh nghiệp 3CX, Luồng Cuộc gọi & Đồng bộ CRM tại IDB",
    category: "VoIP & Real-Time",
  },
  "voicebot-pipecat-daily": {
    en: "Sub-800ms Voicebot Pipeline: Pipecat AI, WebRTC & ElevenLabs",
    vi: "Đường ống Voicebot < 800ms: Pipecat AI, WebRTC & ElevenLabs",
    category: "AI & Voicebots",
  },
  "sacombank-voicebot-poc": {
    en: "Sacombank Banking AI Voicebot: Barge-In, Noise Cancellation & VAD",
    vi: "PoC Voicebot Ngân hàng Sacombank: Khử vọng, Ngắt lời Tức thì & VAD",
    category: "AI & Voicebots",
  },
  "langgraph-multi-agent-rag": {
    en: "Graph-Based Multi-Agent RAG with Self-Correction & LangGraph",
    vi: "Hệ thống RAG Đa Tác tử Dạng Đồ thị Tự Hiệu chỉnh với LangGraph",
    category: "AI & Voicebots",
  },
  "omnimer-health-graphrag": {
    en: "OmniMer Health: GraphRAG for Clinical Trials & Biometric Signals",
    vi: "OmniMer Health: GraphRAG Cho Thử nghiệm Y tế & Tín hiệu Sinh trắc",
    category: "AI & Voicebots",
  },
  "kafka-kraft-rebalance": {
    en: "Zero-Downtime KRaft Migration & Consumer Group Rebalance Mitigation",
    vi: "Chuyển đổi KRaft Không Gián đoạn & Tối ưu Tránh Rebalance Consumer Group",
    category: "High-Throughput Distributed",
  },
  "redis-streams-outbox": {
    en: "Transactional Outbox Pattern with Redis Streams & Idempotent XACK",
    vi: "Mô hình Transactional Outbox với Redis Streams & XACK Bất biến",
    category: "High-Throughput Distributed",
  },
  "fastapi-async-sip-telemetry": {
    en: "High-Concurrency FastAPI Microservices for Call Event Ingestion",
    vi: "Microservice FastAPI Bất đồng bộ Xử lý Hàng triệu Sự kiện Cuộc gọi",
    category: "High-Throughput Distributed",
  },
  "flutter-webrtc-sip-softphone": {
    en: "Cross-Platform WebRTC Softphone: Background VoIP Push & Jitter Buffer",
    vi: "Softphone WebRTC Đa Nền tảng: Thông báo Đẩy VoIP Chạy ngầm & Jitter Buffer",
    category: "Mobile Architecture",
  },
  "react-native-biometric-auth": {
    en: "Secure Biometric Auth & Offline SQLite Sync in React Native",
    vi: "Xác thực Sinh trắc Bảo mật & Đồng bộ SQLite Ngoại tuyến trong React Native",
    category: "Mobile Architecture",
  },
  "vinagreen-iot-flutter": {
    en: "VinaGreen Supply Chain Mobile: Offline Bluetooth IoT Telemetry",
    vi: "Ứng dụng Chuỗi Cung ứng VinaGreen: Đo kiểm IoT Bluetooth Ngoại tuyến",
    category: "Mobile Architecture",
  },
  "cloudflare-d1-hybrid-cache": {
    en: "Global Edge Architecture: Cloudflare Workers, D1 SQL & Stale-While-Revalidate",
    vi: "Kiến trúc Edge Toàn cầu: Cloudflare Workers, D1 SQL & Bộ đệm SWR",
    category: "Cloud, Edge & Infra",
  },
  "docker-asterisk-kamailio-lab": {
    en: "Reproducible Telecom Lab with Docker: Host-Networking & RTP Port Ranges",
    vi: "Môi trường Thử nghiệm Viễn thông Tái lặp với Docker: Mạng Host & Dải Cổng RTP",
    category: "Cloud, Edge & Infra",
  },
  "linux-sip-firewall-iptables": {
    en: "Hardening VoIP Servers: IPTables Conntrack, Fail2Ban & Sngrep Monitoring",
    vi: "Bảo mật Máy chủ VoIP: IPTables Conntrack, Fail2Ban & Giám sát Sngrep",
    category: "Cloud, Edge & Infra",
  },
  "fintech-telecom-ba-spec": {
    en: "Core Banking Voicebot Requirements Engineering & Latency Budgets",
    vi: "Kỹ thuật Đặc tả Yêu cầu Voicebot Ngân hàng Lõi & Ngân sách Độ trễ",
    category: "BA & Enterprise Architecture",
  },
  "finance-analysis": {
    en: "Autonomous Multi-Agent Financial Analysis with LangGraph",
    vi: "Hệ thống Đa Tác tử Phân tích Tài chính Tự hành với LangGraph",
    category: "AI Agents",
  },
};

export const SHORT_NODE_LABELS: Record<string, { en: string; vi: string }> = {
  "asterisk-core": { en: "ASTERISK PBX", vi: "ASTERISK PBX" },
  "asterisk-webrtc": { en: "WebRTC / SRTP", vi: "WebRTC / SRTP" },
  "asterisk-cdr-ami": { en: "CDR / AMI / ARI", vi: "CDR / AMI / ARI" },
  "asterisk-stasis-voicebot": { en: "Stasis Voicebot", vi: "Stasis Voicebot" },
  "asterisk-ops-security": { en: "SIP Debug & Sec", vi: "Bảo mật & SNGREP" },
  "asterisk-pjsip-trunk": { en: "PJSIP & PSTN", vi: "PJSIP & PSTN" },
  "asterisk-dialplan": { en: "Dialplan & IVR", vi: "Dialplan & IVR" },
  "asterisk-cli-config": { en: "CLI & Daemon", vi: "CLI & Hệ thống" },
  "telephony-3cx": { en: "3CX Telemetry", vi: "Tổng đài 3CX" },
  "kafka-distributed": { en: "KAFKA & REDIS", vi: "KAFKA & REDIS" },
  "kafka-partitions": { en: "Partitions / KRaft", vi: "Phân vùng KRaft" },
  "kafka-consumer-groups": { en: "Consumer Group", vi: "Consumer Group" },
  "redis-architecture": { en: "Redis Streams", vi: "Redis Streams" },
  "redis-streams": { en: "XACK & Snapshot", vi: "XACK & Snapshot" },
  "fastapi-backend": { en: "FastAPI Async", vi: "FastAPI Async" },
  "dotnet-csharp": { en: ".NET / C# PBX", vi: ".NET / C# PBX" },
  "voicebot-pipecat": { en: "PIPECAT AI", vi: "PIPECAT AI" },
  "pipecat-stt-tts": { en: "ElevenLabs TTS", vi: "ElevenLabs TTS" },
  "pipecat-barge-in": { en: "Echo Barge-in", vi: "Khử vọng Ngắt lời" },
  "pipecat-vad-latency": { en: "Sub-800ms VAD", vi: "VAD < 800ms" },
  "langgraph-rag": { en: "LangGraph RAG", vi: "LangGraph RAG" },
  "graphrag-biometrics": { en: "GraphRAG Health", vi: "GraphRAG Y tế" },
  "mobile-ecosystem": { en: "MOBILE STACK", vi: "DI ĐỘNG ĐA NỀN" },
  "mobile-flutter": { en: "Flutter & Dart", vi: "Flutter & Dart" },
  "mobile-react-native": { en: "React Native", vi: "React Native" },
  "mobile-swift": { en: "Swift / iOS", vi: "Swift / iOS" },
  "mobile-kotlin": { en: "Kotlin / Android", vi: "Kotlin / Android" },
  "cloudflare-edge": { en: "CLOUD & INFRA", vi: "CLOUD & INFRA" },
  "docker-containers": { en: "Docker Lab", vi: "Docker Lab" },
  "linux-sysadmin": { en: "Linux & SIP Ops", vi: "Linux & Tường lửa" },
  "astro-modern": { en: "Astro Islands", vi: "Astro Islands" },
  "react-ecosystem": { en: "React 19 UI", vi: "React 19 UI" },
  "telecom-ba": { en: "FINTECH BA", vi: "BA & NGHIỆP VỤ" },
  "poc-validation": { en: "Banking PoC QA", vi: "Nghiệm thu PoC" },
};

