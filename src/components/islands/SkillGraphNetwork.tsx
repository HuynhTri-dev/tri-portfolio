/**
 * @name SkillGraphNetwork.tsx
 * @description Radial constellation / spider-web skill graph matching the gaming HUD design:
 *              central CORE node, 4 primary orbital branches (Voice AI, Backend, Mobile, Domain),
 *              concentric radar grid, leaf skill nodes (MAX / LV.4), and interactive Right-Hand HUD Inspector.
 */

import React, { useState, useMemo, useCallback } from "react";
import type { SkillRank } from "../../data/skill-matrix";

interface SkillGraphNetworkProps {
  language: "en" | "vi";
  onSelectSkill: (detail: {
    skillId: string | null;
    skillNameEn: string;
    skillNameVi: string;
    rank: SkillRank | null;
    domain: string | null;
    matchedSlugs: string[];
    proofs: { labelEn: string; labelVi: string; href: string }[];
  }) => void;
  selectedSkillId: string | null;
}

interface ConstellationNode {
  id: string;
  labelEn: string;
  labelVi: string;
  badge: "MAX" | "LV.4" | "CORE";
  hubId: "core" | "voice_ai" | "backend" | "mobile" | "domain";
  x: number;
  y: number;
  color: string;
  summaryEn: string;
  summaryVi: string;
  linkedSlugs: string[];
  attributes?: { labelEn: string; labelVi: string; value: string; pct: number; color: string }[];
  runes?: string[];
  raidQuests?: { titleEn: string; titleVi: string; descEn: string; descVi: string; slug?: string }[];
}

export const SkillGraphNetwork: React.FC<SkillGraphNetworkProps> = ({
  language,
  onSelectSkill,
  selectedSkillId,
}) => {
  const [activeBranchId, setActiveBranchId] = useState<string>("voice_ai");
  const [activeNodeId, setActiveNodeId] = useState<string>("voice_ai");

  // Center is (400, 310) in an 800x620 coordinate space
  const nodes: ConstellationNode[] = useMemo(
    () => [
      // 1. Central Core
      {
        id: "core",
        labelEn: "CORE\nDSA & C++",
        labelVi: "CỐT LÕI\nDSA & C++",
        badge: "CORE",
        hubId: "core",
        x: 400,
        y: 310,
        color: "#38bdf8",
        summaryEn: "Foundational Computer Science: Data Structures, Algorithms, Memory Management & High-Performance C++.",
        summaryVi: "Nền tảng Khoa học Máy tính: Cấu trúc Dữ liệu & Giải thuật, Quản lý Bộ nhớ & C++ Hiệu năng cao.",
        linkedSlugs: [],
        runes: ["C++20", "Algorithms", "Memory", "POSIX"],
        attributes: [
          { labelEn: "Algorithm Optimization", labelVi: "Tối ưu Thuật toán", value: "Tier S", pct: 98, color: "#38bdf8" },
          { labelEn: "Low-Level Systems", labelVi: "Hệ thống Cấp thấp", value: "MAX", pct: 95, color: "#38bdf8" },
        ],
        raidQuests: [
          {
            titleEn: "Core Computer Science Thesis",
            titleVi: "Đồ án Cốt lõi Khoa học Máy tính",
            descEn: "Advanced algorithmic modeling for real-time telemetry pipelines.",
            descVi: "Mô hình hóa thuật toán nâng cao cho đường ống dữ liệu thời gian thực.",
          },
        ],
      },

      // 2. Hub 1: VOICE AI (Top-Left, Orange)
      {
        id: "voice_ai",
        labelEn: "VOICE AI",
        labelVi: "VOICE AI",
        badge: "MAX",
        hubId: "voice_ai",
        x: 270,
        y: 200,
        color: "#f59e0b",
        summaryEn: "End-to-end Telephony AI pipelines, Asterisk PBX, SIP trunking, WebSockets, and low-latency LLM Voicebots.",
        summaryVi: "Hệ sinh thái Voice AI viễn thông, tổng đài Asterisk PBX, trung kế SIP, WebSocket và Voicebot LLM siêu tốc.",
        linkedSlugs: [
          "voicebot-asterisk-pipecat-elevenlabs-ollama",
          "pipecat-voicebot-production-guide",
          "asterisk-nang-cao-stasis-ha-voicebot",
          "asterisk-webrtc-tls-srtp",
        ],
        runes: ["Pipecat WebRTC", "ElevenLabs V4", "Asterisk 22", "Qdrant + Neo4j"],
        attributes: [
          { labelEn: "Real-time Voice Latency", labelVi: "Độ trễ Giọng nói", value: "Sub-1s", pct: 94, color: "#10b981" },
          { labelEn: "HybridRAG Accuracy", labelVi: "Độ chính xác HybridRAG", value: "Tier S", pct: 92, color: "#38bdf8" },
          { labelEn: "PBX / SIP Integration", labelVi: "Tích hợp Tổng đài PBX/SIP", value: "Lv. 4/5", pct: 88, color: "#a855f7" },
        ],
        raidQuests: [
          {
            titleEn: "Sacombank HQ Voicebot",
            titleVi: "Voicebot Ngân hàng Sacombank",
            descEn: "Onsite CTI, SIP Trunking & Debt Collection Workflow Integration.",
            descVi: "Tích hợp CTI, SIP Trunking và kịch bản nhắc nợ tự động Sacombank.",
            slug: "voicebot-asterisk-pipecat-elevenlabs-ollama",
          },
          {
            titleEn: "OmniMer Health (Solo Thesis)",
            titleVi: "OmniMer Health (Khóa luận)",
            descEn: "HybridRAG Medical Knowledge Graph & Apple HealthKit Wearable Sync.",
            descVi: "Đồ thị tri thức y tế HybridRAG và đồng bộ sinh hiệu Apple HealthKit.",
            slug: "building-omnimer-health",
          },
        ],
      },
      // Voice AI Children
      {
        id: "pipecat-elevenlabs",
        labelEn: "Pipecat & ElevenLabs",
        labelVi: "Pipecat & ElevenLabs",
        badge: "MAX",
        hubId: "voice_ai",
        x: 155,
        y: 110,
        color: "#f59e0b",
        summaryEn: "Sub-second speech synthesis with ElevenLabs V4 Turbo, custom SttEchoGate barge-in audio processing.",
        summaryVi: "Tổng hợp giọng nói dưới 1 giây với ElevenLabs V4 Turbo, bộ xử lý SttEchoGate khử vọng ngắt lời.",
        linkedSlugs: [
          "voicebot-asterisk-pipecat-elevenlabs-ollama",
          "pipecat-voicebot-production-guide",
        ],
      },
      {
        id: "asterisk-sip",
        labelEn: "Asterisk PBX / SIP",
        labelVi: "Asterisk PBX / SIP",
        badge: "LV.4",
        hubId: "voice_ai",
        x: 290,
        y: 85,
        color: "#f59e0b",
        summaryEn: "PJSIP channel drivers, WebRTC audio proxying, TLS/SRTP security, and carrier trunking interconnects.",
        summaryVi: "Driver kênh thoại PJSIP, proxy âm thanh WebRTC, mã hóa TLS/SRTP và kết nối trung kế nhà mạng.",
        linkedSlugs: [
          "asterisk-webrtc-tls-srtp",
          "asterisk-cdr-cel-ami-ari",
          "asterisk-van-hanh-debug-bao-mat",
          "asterisk-trunk-pstn",
          "asterisk-nen-tang-voip-sip-kien-truc",
        ],
      },
      {
        id: "hybrid-rag",
        labelEn: "HybridRAG (Qdrant/Neo4j)",
        labelVi: "HybridRAG (Qdrant/Neo4j)",
        badge: "MAX",
        hubId: "voice_ai",
        x: 130,
        y: 225,
        color: "#f59e0b",
        summaryEn: "Knowledge graph retrieval coupled with dense vector search for hallucination-free AI reasoning.",
        summaryVi: "Truy xuất đồ thị tri thức kết hợp tìm kiếm vector ngữ nghĩa chống ảo giác cho AI.",
        linkedSlugs: ["building-omnimer-health", "finance-analysis"],
      },

      // 3. Hub 2: BACKEND (Top-Right, Purple)
      {
        id: "backend",
        labelEn: "BACKEND",
        labelVi: "BACKEND",
        badge: "MAX",
        hubId: "backend",
        x: 530,
        y: 200,
        color: "#a855f7",
        summaryEn: "High-throughput asynchronous Python microservices, distributed Kafka pipelines, and Redis Stream telemetry.",
        summaryVi: "Vi dịch vụ Python bất đồng bộ hiệu năng cao, đường ống phân tán Kafka và Redis Stream thời gian thực.",
        linkedSlugs: [
          "kafka-core-concepts-and-architecture",
          "kafka-pbx-event-streaming-architecture",
          "redis-stream-theory-and-best-practices",
        ],
        runes: ["Apache Kafka", "Redis Stream", "FastAPI / Python", "PostgreSQL"],
        attributes: [
          { labelEn: "Stream Throughput", labelVi: "Băng thông Stream", value: "10k+ msg/s", pct: 95, color: "#a855f7" },
          { labelEn: "Cache & Persistence", labelVi: "Bộ nhớ Đệm & Lưu trữ", value: "Tier S", pct: 93, color: "#38bdf8" },
          { labelEn: "Microservice Uptime", labelVi: "Độ sẵn sàng Hệ thống", value: "99.98%", pct: 96, color: "#10b981" },
        ],
        raidQuests: [
          {
            titleEn: "ZaloPay Realtime Call Telemetry",
            titleVi: "Giám sát Cuộc gọi ZaloPay Thời gian thực",
            descEn: "Live 3CX-to-Redis wallboard pipeline with zero packet loss.",
            descVi: "Đường ống 3CX sang Redis cập nhật dashboard CSKH không thất thoát sự kiện.",
            slug: "redis-stream-theory-and-best-practices",
          },
          {
            titleEn: "Distributed Event Streaming Backbone",
            titleVi: "Hạ tầng Event Streaming Phân tán",
            descEn: "Kafka multi-partition consumer groups & commit storm mitigation.",
            descVi: "Nhóm consumer Kafka đa phân vùng và giải pháp chống bão rebalance.",
            slug: "kafka-pbx-event-streaming-architecture",
          },
        ],
      },
      // Backend Children
      {
        id: "python-microservices",
        labelEn: "Python / Microservices",
        labelVi: "Python / Microservices",
        badge: "MAX",
        hubId: "backend",
        x: 510,
        y: 85,
        color: "#a855f7",
        summaryEn: "FastAPI asynchronous endpoints, Pydantic validation, BackgroundWorkers, and Celery task execution.",
        summaryVi: "FastAPI bất đồng bộ, xác thực dữ liệu Pydantic, background worker và hàng đợi Celery.",
        linkedSlugs: ["finance-analysis", "building-omnimer-health"],
      },
      {
        id: "linux-cloudflare",
        labelEn: "Linux VPS / Cloudflare",
        labelVi: "Linux VPS / Cloudflare",
        badge: "LV.4",
        hubId: "backend",
        x: 655,
        y: 115,
        color: "#a855f7",
        summaryEn: "Cloudflare Edge Workers, D1 global SQLite, R2 storage, kernel RTP networking, and systemd daemons.",
        summaryVi: "Điện toán biên Cloudflare Workers, CSDL D1 toàn cầu, lưu trữ R2, tinh chỉnh kernel RTP và systemd.",
        linkedSlugs: ["asterisk-van-hanh-debug-bao-mat"],
      },
      {
        id: "webrtc-rest-sql",
        labelEn: "Kafka / Redis / WebRTC",
        labelVi: "Kafka / Redis / WebRTC",
        badge: "LV.4",
        hubId: "backend",
        x: 675,
        y: 235,
        color: "#a855f7",
        summaryEn: "Redis Streams with XACK consumer group recovery, Kafka commit logs, and WebSockets.",
        summaryVi: "Redis Stream khôi phục sự cố consumer group, commit log Kafka và WebSocket hai chiều.",
        linkedSlugs: [
          "kafka-core-concepts-and-architecture",
          "kafka-pbx-event-streaming-architecture",
          "redis-stream-theory-and-best-practices",
        ],
      },

      // 4. Hub 3: MOBILE (Bottom-Left, Cyan)
      {
        id: "mobile",
        labelEn: "MOBILE",
        labelVi: "MOBILE",
        badge: "MAX",
        hubId: "mobile",
        x: 270,
        y: 420,
        color: "#06b6d4",
        summaryEn: "Cross-platform mobile applications with Flutter, native iOS/Android bridge modules, and hardware SDK integration.",
        summaryVi: "Ứng dụng di động đa nền tảng Flutter, cầu nối native iOS/Android và tích hợp phần cứng cảm biến.",
        linkedSlugs: ["between-us-spatial-memory-canvas"],
        runes: ["Flutter / BLoC", "HealthKit & BLE", "Swift / iOS", "Kotlin Native"],
        attributes: [
          { labelEn: "UI / 60 FPS Fluidity", labelVi: "Độ mượt mà 60 FPS", value: "Sub-16ms", pct: 96, color: "#06b6d4" },
          { labelEn: "Cross-Platform Fidelity", labelVi: "Độ chuẩn xác Đa nền tảng", value: "Tier S", pct: 95, color: "#38bdf8" },
          { labelEn: "Battery-Safe Background GPS", labelVi: "Định vị Nền Tiết kiệm Pin", value: "Lv. 4/5", pct: 90, color: "#10b981" },
        ],
        raidQuests: [
          {
            titleEn: "Between Us · Spatial Canvas",
            titleVi: "Between Us · Thánh Địa Kỷ Niệm",
            descEn: "Real-time canvas co-creation & battery-efficient location tracking.",
            descVi: "Vùng vẽ tương tác thời gian thực và theo dõi vị trí tiết kiệm pin cho cặp đôi.",
            slug: "between-us-spatial-memory-canvas",
          },
          {
            titleEn: "OmniMer Food Companion",
            titleVi: "Trợ lý Ẩm thực OmniMer Food",
            descEn: "Offline food computer vision & voice-directed interactive cooking.",
            descVi: "Thị giác máy tính nhận diện món ăn offline và trợ lý giọng nói nấu ăn.",
          },
        ],
      },
      // Mobile Children
      {
        id: "flutter-bloc",
        labelEn: "Flutter / BLoC / Clean",
        labelVi: "Flutter / BLoC / Clean",
        badge: "MAX",
        hubId: "mobile",
        x: 135,
        y: 385,
        color: "#06b6d4",
        summaryEn: "Clean Architecture, BLoC reactive state management, custom Painter canvas, and responsive animations.",
        summaryVi: "Kiến trúc Clean Architecture, quản lý trạng thái BLoC, CustomPainter canvas và hiệu ứng đồ họa.",
        linkedSlugs: ["between-us-spatial-memory-canvas"],
      },
      {
        id: "healthkit-ble",
        labelEn: "HealthKit & BLE SDK",
        labelVi: "HealthKit & BLE SDK",
        badge: "LV.4",
        hubId: "mobile",
        x: 165,
        y: 515,
        color: "#06b6d4",
        summaryEn: "Apple HealthKit biometric streams, Bluetooth Low Energy wearable syncing, and heart rate telemetry.",
        summaryVi: "Truy xuất sinh hiệu Apple HealthKit, kết nối thiết bị đeo BLE và xử lý chuỗi nhịp tim thời gian thực.",
        linkedSlugs: ["building-omnimer-health"],
      },
      {
        id: "figma-blender",
        labelEn: "Figma Bento / UI Design",
        labelVi: "Figma Bento / UI Design",
        badge: "LV.4",
        hubId: "mobile",
        x: 290,
        y: 540,
        color: "#06b6d4",
        summaryEn: "Modern glassmorphism, Cyber-Arboretum UI tokens, Bento grid design systems, and micro-interactions.",
        summaryVi: "Thiết kế giao diện Bento, kính mờ Cyber-Arboretum, hệ thống Design Tokens và vi tương tác mượt mà.",
        linkedSlugs: ["between-us-spatial-memory-canvas"],
      },

      // 5. Hub 4: DOMAIN (Bottom-Right, Emerald)
      {
        id: "domain",
        labelEn: "DOMAIN",
        labelVi: "DOMAIN",
        badge: "MAX",
        hubId: "domain",
        x: 530,
        y: 420,
        color: "#10b981",
        summaryEn: "Commercial enterprise domains: Banking debt workflows, Odoo 18 PLM enterprise architectures, and digital health.",
        summaryVi: "Nghiệp vụ doanh nghiệp trọng yếu: Tự động hóa tín dụng ngân hàng, Odoo 18 PLM và y tế số.",
        linkedSlugs: ["finance-analysis"],
        runes: ["Odoo 18 PLM", "Commercial Banking", "Digital Signatures", "Debt Recovery"],
        attributes: [
          { labelEn: "Enterprise Compliance", labelVi: "Tuân thủ Chuẩn Doanh nghiệp", value: "Tier S", pct: 96, color: "#10b981" },
          { labelEn: "Automated Legal Workflows", labelVi: "Tự động hóa Pháp lý Tín dụng", value: "MAX", pct: 94, color: "#38bdf8" },
          { labelEn: "Multi-Role Delegation", labelVi: "Phân quyền Nhiều Cấp", value: "Lv. 4/5", pct: 89, color: "#f59e0b" },
        ],
        raidQuests: [
          {
            titleEn: "Consumer Lending NOL Clearance",
            titleVi: "Hệ thống Tất toán Khoản vay NOL",
            descEn: "Automated debt clearance certificate export with digital seals and audit logs.",
            descVi: "Xuất giấy tờ tất toán nợ tự động kèm con dấu số, phân quyền ký duyệt và audit log.",
          },
          {
            titleEn: "Rita Võ ProdID (Odoo 18 PLM)",
            titleVi: "ProdID Tập đoàn Rita Võ (Odoo 18)",
            descEn: "10,000 product records & DFS cyclic BOM detection algorithm.",
            descVi: "Quản trị 10.000 sản phẩm với thuật toán DFS phát hiện vòng lặp định mức vật liệu.",
          },
        ],
      },
      // Domain Children
      {
        id: "odoo-plm",
        labelEn: "Odoo v18 PLM / ProdID",
        labelVi: "Odoo v18 PLM / ProdID",
        badge: "MAX",
        hubId: "domain",
        x: 655,
        y: 385,
        color: "#10b981",
        summaryEn: "In-house enterprise PLM module, DFS cyclic BOM detection, and dynamic multi-level approval matrices.",
        summaryVi: "Module PLM doanh nghiệp lớn, thuật toán DFS phát hiện chu trình BOM và ma trận phê duyệt động.",
        linkedSlugs: [],
      },
      {
        id: "banking-debt",
        labelEn: "Banking Debt Workflow",
        labelVi: "Banking Debt Workflow",
        badge: "LV.4",
        hubId: "domain",
        x: 645,
        y: 515,
        color: "#10b981",
        summaryEn: "Notice of Loan (NOL) automated generation, cryptographic signing, signatory delegation, and audit trails.",
        summaryVi: "Tự động hóa hồ sơ tất toán nợ, chữ ký số, ủy quyền người ký và nhật ký kiểm toán bất biến.",
        linkedSlugs: [],
      },
      {
        id: "digital-health",
        labelEn: "Digital Health PHR",
        labelVi: "Digital Health PHR",
        badge: "MAX",
        hubId: "domain",
        x: 510,
        y: 540,
        color: "#10b981",
        summaryEn: "FHIR compliant personal health records, realtime telemetry anomaly detection, and patient data security.",
        summaryVi: "Hồ sơ sức khỏe cá nhân chuẩn FHIR, cảnh báo bất thường thời gian thực và bảo mật dữ liệu y tế.",
        linkedSlugs: ["building-omnimer-health"],
      },
    ],
    []
  );

  // Active selected node or fallback to active branch
  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === activeNodeId) || nodes.find((n) => n.id === activeBranchId) || nodes[1];
  }, [nodes, activeNodeId, activeBranchId]);

  // Active branch metadata for right HUD card
  const activeBranch = useMemo(() => {
    return nodes.find((n) => n.id === activeBranchId) || nodes[1];
  }, [nodes, activeBranchId]);

  // Edges connecting center to 4 hubs
  const coreEdges = useMemo(
    () => [
      { from: "core", to: "voice_ai", color: "#f59e0b" },
      { from: "core", to: "backend", color: "#a855f7" },
      { from: "core", to: "mobile", color: "#06b6d4" },
      { from: "core", to: "domain", color: "#10b981" },
    ],
    []
  );

  // Edges connecting hubs to their respective leaf nodes
  const leafEdges = useMemo(() => {
    return nodes
      .filter((n) => n.hubId !== "core" && n.id !== n.hubId)
      .map((n) => {
        const parent = nodes.find((p) => p.id === n.hubId);
        return {
          from: n.hubId,
          to: n.id,
          x1: parent?.x ?? 400,
          y1: parent?.y ?? 310,
          x2: n.x,
          y2: n.y,
          color: n.color,
        };
      });
  }, [nodes]);

  const handleSelectNode = useCallback(
    (node: ConstellationNode) => {
      setActiveNodeId(node.id);
      if (node.hubId !== "core") {
        setActiveBranchId(node.hubId);
      }

      const matchedSlugs = node.linkedSlugs || [];
      onSelectSkill({
        skillId: node.id,
        skillNameEn: node.labelEn.replace("\n", " "),
        skillNameVi: node.labelVi.replace("\n", " "),
        rank: (node.badge === "MAX" ? "S" : node.badge === "LV.4" ? "A" : "S") as SkillRank,
        domain: node.hubId,
        matchedSlugs,
        proofs: [
          {
            labelEn: `Skill Knowledge Base / ${node.labelEn.replace("\n", " ")}`,
            labelVi: `Kho Tri thức Kỹ năng / ${node.labelVi.replace("\n", " ")}`,
            href: `/blog/${matchedSlugs[0] || ""}`,
          },
        ],
      });
    },
    [onSelectSkill]
  );

  return (
    <div className="constellation-arena" data-skill-constellation>
      {/* Top Gaming Telemetry Header */}
      <div className="constellation-arena__topbar">
        <div className="arena-user-profile">
          <div className="arena-lvl-badge">
            <span className="arena-lvl-tag">LVL</span>
            <strong className="arena-lvl-val">22</strong>
          </div>
          <div className="arena-user-text">
            <h3 className="arena-user-name">HUỲNH MINH TRÍ</h3>
            <span className="arena-user-class">
              {language === "vi"
                ? "CHUYÊN NGÀNH: KIẾN TRÚC SƯ FULL-STACK AI & VIỄN THÔNG"
                : "CLASS: FULL-STACK AI & TELECOM ARCHITECT"}
            </span>
          </div>
        </div>

        {/* Academic & Field Mastery Progress Bar */}
        <div className="arena-mastery-progress">
          <div className="arena-mastery-labels">
            <span className="arena-mastery-title">
              {language === "vi"
                ? "NĂNG LỰC HỌC THUẬT & THỰC CHIẾN (GPA 3.61/4.0)"
                : "ACADEMIC & FIELD MASTERY (GPA 3.61/4.0)"}
            </span>
            <strong className="arena-mastery-credits">135 / 135 CREDITS</strong>
          </div>
          <div className="arena-mastery-track" aria-hidden="true">
            <div className="arena-mastery-fill" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Action pills / badge */}
        <div className="arena-top-actions">
          <span className="arena-honor-pill">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
            <span>{language === "vi" ? "THÀNH TỰU ĐỒNG" : "OLYMPIC & HONORS"}</span>
          </span>
        </div>
      </div>

      {/* Main Viewport: Left Radial Constellation SVG + Right Tactical HUD Card */}
      <div className="constellation-arena__stage">
        {/* SVG Radial Graph Visualizer */}
        <div className="constellation-canvas-wrap">
          <svg
            className="constellation-svg"
            viewBox="0 0 800 620"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Radial gradient glow for active centers */}
              <radialGradient id="hubGlowOrange" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hubGlowPurple" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hubGlowCyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hubGlowEmerald" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Concentric Radar / Orbit Circles */}
            <circle cx="400" cy="310" r="105" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <circle cx="400" cy="310" r="195" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <circle cx="400" cy="310" r="285" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Faint cross-axis guides */}
            <line x1="400" y1="40" x2="400" y2="580" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
            <line x1="120" y1="310" x2="680" y2="310" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />

            {/* Edges from Hubs to Leaf Nodes */}
            {leafEdges.map((e) => {
              const isActive = activeNodeId === e.to || activeBranchId === e.from;
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={e.color}
                  strokeWidth={isActive ? "2.2" : "1.2"}
                  strokeOpacity={isActive ? "0.9" : "0.35"}
                  className="constellation-edge"
                />
              );
            })}

            {/* Edges from Center Core to 4 Hubs */}
            {coreEdges.map((e) => {
              const targetNode = nodes.find((n) => n.id === e.to);
              if (!targetNode) return null;
              const isBranchActive = activeBranchId === e.to;
              return (
                <line
                  key={`core-${e.to}`}
                  x1="400"
                  y1="310"
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={e.color}
                  strokeWidth={isBranchActive ? "3.2" : "2"}
                  strokeOpacity={isBranchActive ? "1" : "0.55"}
                  className="constellation-edge"
                />
              );
            })}

            {/* Active Hub Background Glowing Circles */}
            {nodes
              .filter((n) => ["voice_ai", "backend", "mobile", "domain"].includes(n.id))
              .map((hub) => {
                const isSelected = activeBranchId === hub.id;
                let gradId = "hubGlowOrange";
                if (hub.id === "backend") gradId = "hubGlowPurple";
                if (hub.id === "mobile") gradId = "hubGlowCyan";
                if (hub.id === "domain") gradId = "hubGlowEmerald";

                return (
                  <circle
                    key={`glow-${hub.id}`}
                    cx={hub.x}
                    cy={hub.y}
                    r={isSelected ? "55" : "38"}
                    fill={`url(#${gradId})`}
                    className="constellation-hub-glow"
                  />
                );
              })}

            {/* Render Center CORE Node (Hexagon) */}
            <g
              className={`constellation-node-group constellation-node-group--core ${
                activeNodeId === "core" ? "is-active" : ""
              }`}
              onClick={() => handleSelectNode(nodes[0])}
              style={{ cursor: "pointer" }}
            >
              <polygon
                points="400,278 432,294 432,326 400,342 368,326 368,294"
                fill="#0d233a"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="constellation-hexagon"
              />
              <text x="400" y="306" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
                CORE
              </text>
              <text x="400" y="322" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="600">
                DSA & C++
              </text>
            </g>

            {/* Render Hub Nodes (VOICE AI, BACKEND, MOBILE, DOMAIN) */}
            {nodes
              .filter((n) => ["voice_ai", "backend", "mobile", "domain"].includes(n.id))
              .map((hub) => {
                const isSelected = activeNodeId === hub.id || activeBranchId === hub.id;
                return (
                  <g
                    key={hub.id}
                    className={`constellation-node-group constellation-node-group--hub ${
                      isSelected ? "is-active" : ""
                    }`}
                    onClick={() => handleSelectNode(hub)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Outer Dashed Orbit Ring */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r="32"
                      fill="none"
                      stroke={hub.color}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      className="constellation-hub-ring"
                    />
                    {/* Solid Inner Body */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r="25"
                      fill="#0b1712"
                      stroke={hub.color}
                      strokeWidth={isSelected ? "3" : "2"}
                    />
                    {/* Label inside Hub */}
                    <text
                      x={hub.x}
                      y={hub.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="800"
                      letterSpacing="0.04em"
                    >
                      {hub.labelEn}
                    </text>
                  </g>
                );
              })}

            {/* Render Leaf Nodes (MAX / LV.4) */}
            {nodes
              .filter((n) => n.hubId !== "core" && n.id !== n.hubId)
              .map((leaf) => {
                const isLeafActive = activeNodeId === leaf.id;
                const isBranchActive = activeBranchId === leaf.hubId;
                const badgeColor = leaf.badge === "MAX" ? leaf.color : "#94a3b8";

                return (
                  <g
                    key={leaf.id}
                    className={`constellation-node-group constellation-node-group--leaf ${
                      isLeafActive ? "is-active" : ""
                    }`}
                    onClick={() => handleSelectNode(leaf)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Leaf Circle Marker */}
                    <circle
                      cx={leaf.x}
                      cy={leaf.y}
                      r="16"
                      fill="#060e0a"
                      stroke={leaf.color}
                      strokeWidth={isLeafActive ? "2.5" : "1.5"}
                    />
                    {/* Badge text (MAX / LV.4) */}
                    <text
                      x={leaf.x}
                      y={leaf.y + 3.5}
                      textAnchor="middle"
                      fill={badgeColor}
                      fontSize="7.5"
                      fontWeight="800"
                      fontFamily="var(--font-mono)"
                    >
                      {leaf.badge}
                    </text>

                    {/* Skill Label Text beside or above the circle */}
                    <text
                      x={leaf.x}
                      y={leaf.y < 300 ? leaf.y - 20 : leaf.y + 28}
                      textAnchor="middle"
                      fill={isLeafActive ? "#f8fafc" : isBranchActive ? "#e2e8f0" : "#94a3b8"}
                      fontSize="9"
                      fontWeight={isLeafActive ? "700" : "600"}
                      className="constellation-leaf-label"
                    >
                      {language === "vi" ? leaf.labelVi : leaf.labelEn}
                    </text>
                  </g>
                );
              })}
          </svg>

          {/* Bottom Interactive Legend */}
          <div className="constellation-legend-bar">
            <button
              type="button"
              className={`legend-item ${activeBranchId === "voice_ai" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(nodes.find((n) => n.id === "voice_ai")!)}
            >
              <span className="legend-dot" style={{ background: "#f59e0b" }} />
              <span>{language === "vi" ? "AI & Viễn Thông (Orange)" : "AI & Telecom"}</span>
            </button>

            <button
              type="button"
              className={`legend-item ${activeBranchId === "mobile" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(nodes.find((n) => n.id === "mobile")!)}
            >
              <span className="legend-dot" style={{ background: "#06b6d4" }} />
              <span>{language === "vi" ? "Mobile & Giao Diện (Cyan)" : "Mobile & UI"}</span>
            </button>

            <button
              type="button"
              className={`legend-item ${activeBranchId === "backend" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(nodes.find((n) => n.id === "backend")!)}
            >
              <span className="legend-dot" style={{ background: "#a855f7" }} />
              <span>{language === "vi" ? "Backend & Đám Mây (Purple)" : "Backend/Cloud"}</span>
            </button>

            <button
              type="button"
              className={`legend-item ${activeBranchId === "domain" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(nodes.find((n) => n.id === "domain")!)}
            >
              <span className="legend-dot" style={{ background: "#10b981" }} />
              <span>{language === "vi" ? "ERP & Doanh Nghiệp (Emerald)" : "ERP/Business"}</span>
            </button>
          </div>
        </div>

        {/* Right Tactical HUD Card (Exactly matching template) */}
        <aside className="constellation-hud-card panel">
          <div className="hud-header">
            <span className="hud-kicker">SELECTED BRANCH [ACTIVE]</span>
            <h4 className="hud-branch-title" style={{ color: activeBranch.color }}>
              {activeBranch.id === "voice_ai" && (language === "vi" ? "AI & Giải Pháp Viễn Thông" : "AI & Telecom Solutions")}
              {activeBranch.id === "backend" && (language === "vi" ? "Hệ Thống Phân Tán & Đám Mây" : "Distributed Backend & Cloud")}
              {activeBranch.id === "mobile" && (language === "vi" ? "Kỹ Thuật Ứng Dụng Di Động" : "Mobile Systems & UI Architecture")}
              {activeBranch.id === "domain" && (language === "vi" ? "Giải Pháp Nghiệp Vụ Doanh Nghiệp" : "Enterprise ERP & Domain Systems")}
            </h4>
          </div>

          {/* Branch Attributes with Bars */}
          <div className="hud-section">
            <span className="hud-section-label">BRANCH ATTRIBUTES</span>
            <div className="hud-attributes-list">
              {(activeBranch.attributes || []).map((attr, idx) => (
                <div key={idx} className="hud-attr-row">
                  <div className="hud-attr-header">
                    <span>{language === "vi" ? attr.labelVi : attr.labelEn}</span>
                    <strong style={{ color: attr.color }}>{attr.value}</strong>
                  </div>
                  <div className="hud-attr-track">
                    <div
                      className="hud-attr-fill"
                      style={{ width: `${attr.pct}%`, background: attr.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipped Runes (Tech Stack) */}
          <div className="hud-section">
            <span className="hud-section-label">EQUIPPED RUNES (TECH STACK)</span>
            <div className="hud-runes-grid">
              {(activeBranch.runes || []).map((rune, idx) => (
                <span key={idx} className="hud-rune-pill">
                  {rune}
                </span>
              ))}
            </div>
          </div>

          {/* Completed Raid Quests / Verified D1 Case Studies */}
          <div className="hud-section">
            <span className="hud-section-label">
              {language === "vi" ? "BÀI HỌC D1 & THỰC CHIẾN LIÊN KẾT" : "COMPLETED RAID QUESTS & D1 LESSONS"}
            </span>
            <div className="hud-quests-list">
              {(activeBranch.raidQuests || []).map((quest, idx) => (
                <div key={idx} className="hud-quest-item">
                  <div className="hud-quest-head">
                    <i className="fa-solid fa-star" />
                    <strong>{language === "vi" ? quest.titleVi : quest.titleEn}</strong>
                  </div>
                  <p className="hud-quest-desc">
                    {language === "vi" ? quest.descVi : quest.descEn}
                  </p>
                  {quest.slug && (
                    <a href={`/blog/${quest.slug}`} className="hud-quest-link">
                      <span>{language === "vi" ? "Đọc bài nghiên cứu D1" : "Inspect D1 Study"}</span>
                      <i className="fa-solid fa-arrow-right" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Skill Node Inspector if specific leaf clicked */}
          {activeNode && activeNode.id !== activeBranch.id && (
            <div className="hud-leaf-inspect panel">
              <div className="hud-leaf-header">
                <span className="hud-leaf-badge" style={{ color: activeNode.color, borderColor: activeNode.color }}>
                  {activeNode.badge}
                </span>
                <strong>{language === "vi" ? activeNode.labelVi : activeNode.labelEn}</strong>
              </div>
              <p className="hud-leaf-desc">
                {language === "vi" ? activeNode.summaryVi : activeNode.summaryEn}
              </p>
              {activeNode.linkedSlugs && activeNode.linkedSlugs.length > 0 && (
                <div className="hud-leaf-links">
                  {activeNode.linkedSlugs.map((slug) => (
                    <a key={slug} href={`/blog/${slug}`} className="hud-leaf-link">
                      <i className="fa-solid fa-file-code" />
                      <span>{slug}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inspect Source / Demo Action Button */}
          <div className="hud-actions">
            <button
              type="button"
              className="hud-main-btn"
              onClick={() => handleSelectNode(activeNode)}
            >
              <i className="fa-solid fa-crosshairs" />
              <span>
                {language === "vi"
                  ? "LỌC BÀI VIẾT D1 THEO NHÁNH NÀY"
                  : "INSPECT SOURCE / FILTER D1 REPO"}
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
