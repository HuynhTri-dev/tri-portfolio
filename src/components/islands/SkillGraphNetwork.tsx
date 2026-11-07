/**
 * @name SkillGraphNetwork.tsx
 * @description Living Constellation Skill Graph Engine:
 *              - Elastic spring drag physics: drag any star/hub node with spring-loaded edges.
 *              - Organic celestial aesthetic: twinkling stardust, quadrant nebulas, and moving photon energy pulses.
 *              - Seamless integration: eliminated inner dark-blue container box.
 *              - Streamlined HUD: eliminated redundant 'Inspect Source' button in favor of contextual D1 lesson links.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  originX: number;
  originY: number;
  color: string;
  summaryEn: string;
  summaryVi: string;
  linkedSlugs: string[];
  attributes?: { labelEn: string; labelVi: string; value: string; pct: number; color: string }[];
  runes?: string[];
  raidQuests?: { titleEn: string; titleVi: string; descEn: string; descVi: string; slug?: string }[];
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const SkillGraphNetwork: React.FC<SkillGraphNetworkProps> = ({
  language,
  onSelectSkill,
  selectedSkillId,
}) => {
  const [activeBranchId, setActiveBranchId] = useState<string>("voice_ai");
  const [activeNodeId, setActiveNodeId] = useState<string>("voice_ai");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const draggedNodeRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initial nodes configuration (Base 800x620 coordinate space)
  const baseNodes: ConstellationNode[] = useMemo(
    () => [
      // 1. Central Core
      {
        id: "core",
        labelEn: "CORE\nDSA & C++",
        labelVi: "CỐT LÕI\nDSA & C++",
        badge: "CORE",
        hubId: "core",
        originX: 400,
        originY: 310,
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
        originX: 270,
        originY: 200,
        color: "#f59e0b",
        summaryEn: "End-to-end Telephony AI pipelines, Asterisk PBX, SIP trunking, WebSockets, and low-latency LLM Voicebots.",
        summaryVi: "Hệ sinh thái Voice AI viễn thông, tổng đài Asterisk PBX, trung kế SIP, WebSocket và Voicebot LLM siêu tốc.",
        linkedSlugs: [
          "voicebot-asterisk-pipecat-elevenlabs-ollama",
          "pipecat-voicebot-production-guide",
          "asterisk-nang-cao-stasis-ha-voicebot",
          "asterisk-webrtc-tls-srtp",
        ],
        runes: ["Pipecat WebRTC", "ElevenLabs V4", "Cisco PBX / SIP", "Qdrant + Neo4j"],
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
      // Voice AI Leaves
      {
        id: "pipecat-elevenlabs",
        labelEn: "PipeCat & ElevenLabs",
        labelVi: "PipeCat & ElevenLabs",
        badge: "MAX",
        hubId: "voice_ai",
        originX: 155,
        originY: 110,
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
        labelEn: "Cisco PBX / SIP",
        labelVi: "Cisco PBX / SIP",
        badge: "LV.4",
        hubId: "voice_ai",
        originX: 290,
        originY: 85,
        color: "#f59e0b",
        summaryEn: "PJSIP channel drivers, WebRTC audio proxying, TLS/SRTP security, and enterprise Cisco trunking.",
        summaryVi: "Driver kênh thoại PJSIP, proxy âm thanh WebRTC, mã hóa TLS/SRTP và kết nối trung kế Cisco doanh nghiệp.",
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
        originX: 130,
        originY: 235,
        color: "#f59e0b",
        summaryEn: "Dual-retrieval vector and graph knowledge base, reciprocal rank fusion (RRF), and context reranking.",
        summaryVi: "CSDL đồ thị kết hợp vector đa tầng, thuật toán hợp nhất điểm RRF và tinh chỉnh xếp hạng ngữ cảnh.",
        linkedSlugs: [
          "building-omnimer-health",
          "voicebot-asterisk-pipecat-elevenlabs-ollama",
        ],
      },

      // 3. Hub 2: BACKEND (Top-Right, Purple)
      {
        id: "backend",
        labelEn: "BACKEND",
        labelVi: "BACKEND",
        badge: "MAX",
        hubId: "backend",
        originX: 530,
        originY: 200,
        color: "#a855f7",
        summaryEn: "High-throughput asynchronous backends, event streaming with Kafka/Redis, and Cloudflare edge microservices.",
        summaryVi: "Hệ thống backend bất đồng bộ chịu tải cao, event streaming với Kafka/Redis và vi dịch vụ điện toán biên Cloudflare.",
        linkedSlugs: [
          "kafka-core-concepts-and-architecture",
          "kafka-pbx-event-streaming-architecture",
          "redis-stream-theory-and-best-practices",
          "asterisk-van-hanh-debug-bao-mat",
        ],
        runes: ["Python FastAPI", "Linux VPS", "Cloudflare D1", "Kafka / Redis"],
        attributes: [
          { labelEn: "Concurrent Request Throughput", labelVi: "Băng thông Xử lý Đồng thời", value: "Tier S", pct: 96, color: "#a855f7" },
          { labelEn: "Zero-Downtime Deployment", labelVi: "Triển khai Không Gián đoạn", value: "MAX", pct: 93, color: "#38bdf8" },
          { labelEn: "Stream Partitioning", labelVi: "Phân vùng Dòng Dữ liệu", value: "Lv. 4/5", pct: 90, color: "#10b981" },
        ],
        raidQuests: [
          {
            titleEn: "Redis Streams PBX Event Pipeline",
            titleVi: "Đường Ống Sự Kiện PBX Qua Redis Stream",
            descEn: "Zero event loss call event piping from 3CX to CRM agent dashboards.",
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
      // Backend Leaves
      {
        id: "python-microservices",
        labelEn: "Python / Microservices",
        labelVi: "Python / Microservices",
        badge: "MAX",
        hubId: "backend",
        originX: 510,
        originY: 85,
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
        originX: 655,
        originY: 115,
        color: "#a855f7",
        summaryEn: "Cloudflare Edge Workers, D1 global SQLite, R2 storage, kernel RTP networking, and systemd daemons.",
        summaryVi: "Điện toán biên Cloudflare Workers, CSDL D1 toàn cầu, lưu trữ R2, tinh chỉnh kernel RTP và systemd.",
        linkedSlugs: ["asterisk-van-hanh-debug-bao-mat"],
      },
      {
        id: "webrtc-rest-sql",
        labelEn: "WebRTC / REST / SQL",
        labelVi: "WebRTC / REST / SQL",
        badge: "LV.4",
        hubId: "backend",
        originX: 675,
        originY: 235,
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
        originX: 270,
        originY: 420,
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
            titleEn: "OmniMer Health Biometrics",
            titleVi: "Sinh Hiệu Sức Khỏe OmniMer Health",
            descEn: "Realtime Apple HealthKit wearable biometric streams & sensor telemetry.",
            descVi: "Truy xuất sinh hiệu Apple HealthKit và kết nối cảm biến wearable thời gian thực.",
            slug: "building-omnimer-health",
          },
        ],
      },
      // Mobile Leaves
      {
        id: "flutter-bloc",
        labelEn: "Flutter / BLoC / Clean",
        labelVi: "Flutter / BLoC / Clean",
        badge: "MAX",
        hubId: "mobile",
        originX: 135,
        originY: 385,
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
        originX: 165,
        originY: 515,
        color: "#06b6d4",
        summaryEn: "Apple HealthKit biometric streams, Bluetooth Low Energy wearable syncing, and heart rate telemetry.",
        summaryVi: "Truy xuất sinh hiệu Apple HealthKit, kết nối thiết bị đeo BLE và xử lý chuỗi nhịp tim thời gian thực.",
        linkedSlugs: ["building-omnimer-health"],
      },
      {
        id: "figma-blender",
        labelEn: "Figma Bento / Blender",
        labelVi: "Figma Bento / Blender",
        badge: "LV.4",
        hubId: "mobile",
        originX: 290,
        originY: 540,
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
        originX: 530,
        originY: 420,
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
      // Domain Leaves
      {
        id: "odoo-plm",
        labelEn: "Odoo v18 PLM / ProdID",
        labelVi: "Odoo v18 PLM / ProdID",
        badge: "MAX",
        hubId: "domain",
        originX: 655,
        originY: 385,
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
        originX: 645,
        originY: 515,
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
        originX: 510,
        originY: 540,
        color: "#10b981",
        summaryEn: "FHIR compliant personal health records, realtime telemetry anomaly detection, and patient data security.",
        summaryVi: "Hồ sơ sức khỏe cá nhân chuẩn FHIR, cảnh báo bất thường thời gian thực và bảo mật dữ liệu y tế.",
        linkedSlugs: ["building-omnimer-health"],
      },
    ],
    []
  );

  // Dynamic positions map for living physics
  const [positions, setPositions] = useState<Record<string, NodePosition>>(() => {
    const initial: Record<string, NodePosition> = {};
    for (const node of baseNodes) {
      initial[node.id] = { x: node.originX, y: node.originY, vx: 0, vy: 0 };
    }
    return initial;
  });

  // Stardust background particles
  const stardust = useMemo(() => {
    const stars = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const cx = (i * 37) % 780 + 10;
      const cy = (i * 53) % 600 + 10;
      const r = 0.8 + ((i * 7) % 15) / 10;
      const delay = ((i * 13) % 30) / 10;
      const dur = 2.5 + ((i * 17) % 25) / 10;
      stars.push({ id: i, cx, cy, r, delay, dur });
    }
    return stars;
  }, []);

  // Active selected node or fallback to active branch
  const activeNode = useMemo(() => {
    return baseNodes.find((n) => n.id === activeNodeId) || baseNodes.find((n) => n.id === activeBranchId) || baseNodes[1];
  }, [baseNodes, activeNodeId, activeBranchId]);

  // Active branch metadata for right HUD card
  const activeBranch = useMemo(() => {
    return baseNodes.find((n) => n.id === activeBranchId) || baseNodes[1];
  }, [baseNodes, activeBranchId]);

  // Physics animation loop for smooth spring wobble
  useEffect(() => {
    let animId: number;
    let isRunning = false;

    const tick = () => {
      setPositions((prev) => {
        let hasMovement = false;
        const next: Record<string, NodePosition> = {};
        const k = 0.08; // Spring stiffness
        const damping = 0.78; // Air resistance

        for (const node of baseNodes) {
          const current = prev[node.id] || { x: node.originX, y: node.originY, vx: 0, vy: 0 };

          // If currently dragging this node, keep at cursor
          if (draggedNodeRef.current === node.id) {
            next[node.id] = current;
            continue;
          }

          // Return force towards origin
          const dx = node.originX - current.x;
          const dy = node.originY - current.y;

          if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05 || Math.abs(current.vx) > 0.05 || Math.abs(current.vy) > 0.05) {
            hasMovement = true;
            const ax = dx * k;
            const ay = dy * k;
            const nvx = (current.vx + ax) * damping;
            const nvy = (current.vy + ay) * damping;
            next[node.id] = {
              x: current.x + nvx,
              y: current.y + nvy,
              vx: nvx,
              vy: nvy,
            };
          } else {
            next[node.id] = { x: node.originX, y: node.originY, vx: 0, vy: 0 };
          }
        }

        if (hasMovement || draggedNodeRef.current) {
          animId = requestAnimationFrame(tick);
          isRunning = true;
        } else {
          isRunning = false;
        }

        return next;
      });
    };

    if (isDragging && !isRunning) {
      animId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animId);
  }, [isDragging, baseNodes]);

  // Pointer drag event handlers
  const handlePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    draggedNodeRef.current = nodeId;
    setIsDragging(true);

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 620 / rect.height;
      const svgX = (e.clientX - rect.left) * scaleX;
      const svgY = (e.clientY - rect.top) * scaleY;
      const nodePos = positions[nodeId] || { x: 400, y: 310 };
      dragOffsetRef.current = {
        x: svgX - nodePos.x,
        y: svgY - nodePos.y,
      };
    }
  }, [positions]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggedNodeRef.current || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 620 / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    const newX = Math.max(40, Math.min(760, svgX - dragOffsetRef.current.x));
    const newY = Math.max(40, Math.min(580, svgY - dragOffsetRef.current.y));

    const nodeId = draggedNodeRef.current;

    setPositions((prev) => ({
      ...prev,
      [nodeId]: {
        ...(prev[nodeId] || { vx: 0, vy: 0 }),
        x: newX,
        y: newY,
        vx: 0,
        vy: 0,
      },
    }));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (draggedNodeRef.current) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
      draggedNodeRef.current = null;
      setIsDragging(false);
    }
  }, []);

  // Reset positions button
  const handleResetPositions = useCallback(() => {
    const reset: Record<string, NodePosition> = {};
    for (const node of baseNodes) {
      reset[node.id] = { x: node.originX, y: node.originY, vx: 0, vy: 0 };
    }
    setPositions(reset);
  }, [baseNodes]);

  // Edges connecting hubs to leaf nodes with dynamic coordinates
  const leafEdges = useMemo(() => {
    return baseNodes
      .filter((n) => n.hubId !== "core" && n.id !== n.hubId)
      .map((n) => {
        const parentPos = positions[n.hubId] || { x: 400, y: 310 };
        const myPos = positions[n.id] || { x: n.originX, y: n.originY };
        return {
          from: n.hubId,
          to: n.id,
          x1: parentPos.x,
          y1: parentPos.y,
          x2: myPos.x,
          y2: myPos.y,
          color: n.color,
        };
      });
  }, [baseNodes, positions]);

  // Core spokes connecting center to hubs
  const coreSpokes = useMemo(() => {
    const centerPos = positions["core"] || { x: 400, y: 310 };
    return [
      { hubId: "voice_ai", color: "#f59e0b" },
      { hubId: "backend", color: "#a855f7" },
      { hubId: "mobile", color: "#06b6d4" },
      { hubId: "domain", color: "#10b981" },
    ].map((spoke) => {
      const hubPos = positions[spoke.hubId] || { x: 400, y: 310 };
      return {
        ...spoke,
        x1: centerPos.x,
        y1: centerPos.y,
        x2: hubPos.x,
        y2: hubPos.y,
      };
    });
  }, [positions]);

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

  const handleScrollToD1 = useCallback(() => {
    const target = document.querySelector("[data-kb-results-anchor]");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="constellation-arena" data-skill-constellation>
      {/* Top Gaming Telemetry Header (Seamless Floating Bar) */}
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

        {/* Action pills & Reset positions button */}
        <div className="arena-top-actions">
          <span className="arena-honor-pill">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
            <span>{language === "vi" ? "THÀNH TỰU ĐỒNG" : "OLYMPIC & HONORS"}</span>
          </span>
          <button
            type="button"
            className="arena-ctrl-btn"
            title={language === "vi" ? "Đặt lại vị trí chòm sao" : "Reset star positions"}
            onClick={handleResetPositions}
          >
            <i className="fa-solid fa-arrows-rotate" aria-hidden="true" />
            <span>{language === "vi" ? "Đặt lại" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport: Left Living Constellation Canvas + Right Floating HUD */}
      <div className="constellation-arena__stage">
        {/* SVG Living Constellation Visualizer */}
        <div className="constellation-canvas-wrap">
          <svg
            ref={svgRef}
            className="constellation-svg"
            viewBox="0 0 800 620"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              {/* Soft quadrant nebulas */}
              <radialGradient id="nebulaOrange" cx="20%" cy="20%" r="40%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="nebulaPurple" cx="80%" cy="20%" r="40%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="nebulaCyan" cx="20%" cy="80%" r="40%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="nebulaEmerald" cx="80%" cy="80%" r="40%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>

              {/* Hub active glowing filters */}
              <radialGradient id="hubGlowOrange" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hubGlowPurple" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hubGlowCyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hubGlowEmerald" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>

              {/* Hexagon Core Clip */}
              <polygon id="hexShape" points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" />
            </defs>

            {/* Quadrant Nebulas */}
            <rect x="0" y="0" width="400" height="310" fill="url(#nebulaOrange)" />
            <rect x="400" y="0" width="400" height="310" fill="url(#nebulaPurple)" />
            <rect x="0" y="310" width="400" height="310" fill="url(#nebulaCyan)" />
            <rect x="400" y="310" width="400" height="310" fill="url(#nebulaEmerald)" />

            {/* Twinkling Stardust Field */}
            {stardust.map((s) => (
              <circle
                key={s.id}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill="rgba(255, 255, 255, 0.65)"
                className="stardust-particle"
                style={{
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${s.dur}s`,
                }}
              />
            ))}

            {/* Concentric Celestial Orbit Rings */}
            <circle cx="400" cy="310" r="105" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
            <circle cx="400" cy="310" r="195" fill="none" stroke="rgba(255,255,255,0.07)" strokeDasharray="4 5" />
            <circle cx="400" cy="310" r="285" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 6" />

            {/* Core Spokes (Center -> 4 Hubs) with Energy Pulses */}
            {coreSpokes.map((spoke) => {
              const pathD = `M ${spoke.x1} ${spoke.y1} L ${spoke.x2} ${spoke.y2}`;
              return (
                <g key={spoke.hubId}>
                  <line
                    x1={spoke.x1}
                    y1={spoke.y1}
                    x2={spoke.x2}
                    y2={spoke.y2}
                    stroke={spoke.color}
                    strokeWidth="2.5"
                    strokeOpacity="0.85"
                  />
                  {/* Flowing Photon Pulse */}
                  <circle r="3.5" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)">
                    <animateMotion path={pathD} dur="2.2s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}

            {/* Leaf Edges (Hub -> Leaves) with Energy Pulses */}
            {leafEdges.map((e) => {
              const isHighlighted = activeNode.id === e.to || activeBranch.id === e.from;
              const pathD = `M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`;
              return (
                <g key={e.to}>
                  <line
                    x1={e.x1}
                    y1={e.y1}
                    x2={e.x2}
                    y2={e.y2}
                    stroke={e.color}
                    strokeWidth={isHighlighted ? "2" : "1.2"}
                    strokeOpacity={isHighlighted ? "0.9" : "0.45"}
                    strokeDasharray={isHighlighted ? undefined : "3 3"}
                  />
                  {isHighlighted && (
                    <circle r="2.5" fill="#ffffff" filter="drop-shadow(0 0 3px #ffffff)">
                      <animateMotion path={pathD} dur="2.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Render 4 Primary Orbital Hubs */}
            {baseNodes
              .filter((n) => n.id === n.hubId && n.id !== "core")
              .map((hub) => {
                const isActive = activeBranch.id === hub.id;
                const pos = positions[hub.id] || { x: hub.originX, y: hub.originY };

                let glowUrl = "url(#hubGlowOrange)";
                if (hub.id === "backend") glowUrl = "url(#hubGlowPurple)";
                if (hub.id === "mobile") glowUrl = "url(#hubGlowCyan)";
                if (hub.id === "domain") glowUrl = "url(#hubGlowEmerald)";

                return (
                  <g
                    key={hub.id}
                    className="constellation-hub-node"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    onPointerDown={(e) => handlePointerDown(e, hub.id)}
                    onClick={() => handleSelectNode(hub)}
                  >
                    {/* Glowing Aura if Active */}
                    {isActive && (
                      <circle cx="0" cy="0" r="46" fill={glowUrl} className="hub-pulse-aura" />
                    )}

                    {/* Orbital Dashed Ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r="33"
                      fill="#060c14"
                      stroke={hub.color}
                      strokeWidth={isActive ? "2.5" : "1.8"}
                      strokeDasharray={isActive ? "4 3" : undefined}
                    />

                    {/* Inner Badge Fill */}
                    <circle cx="0" cy="0" r="26" fill={hub.color} fillOpacity={isActive ? "0.32" : "0.18"} />

                    {/* Hub Text */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="IBM Plex Mono, monospace"
                      letterSpacing="0.04em"
                    >
                      {hub.labelEn}
                    </text>
                  </g>
                );
              })}

            {/* Render Leaf Nodes (Stars) */}
            {baseNodes
              .filter((n) => n.hubId !== "core" && n.id !== n.hubId)
              .map((leaf) => {
                const isSelected = activeNode.id === leaf.id;
                const pos = positions[leaf.id] || { x: leaf.originX, y: leaf.originY };

                return (
                  <g
                    key={leaf.id}
                    className="constellation-leaf-node"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    onPointerDown={(e) => handlePointerDown(e, leaf.id)}
                    onClick={() => handleSelectNode(leaf)}
                  >
                    {/* Star Halo */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? "18" : "14"}
                      fill="#060c14"
                      stroke={leaf.color}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                    />

                    {/* Star Badge text (MAX / LV.4) */}
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={leaf.color}
                      fontSize="7.5"
                      fontWeight="800"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {leaf.badge}
                    </text>

                    {/* Node Label underneath/above */}
                    <text
                      x="0"
                      y="26"
                      textAnchor="middle"
                      fill={isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.85)"}
                      fontSize="9"
                      fontWeight={isSelected ? "700" : "500"}
                      fontFamily="Be Vietnam Pro, sans-serif"
                    >
                      {language === "vi" ? leaf.labelVi : leaf.labelEn}
                    </text>
                  </g>
                );
              })}

            {/* Render Central Hexagon: CORE (DSA & C++) */}
            {(() => {
              const corePos = positions["core"] || { x: 400, y: 310 };
              const isSelected = activeNode.id === "core";
              return (
                <g
                  className="constellation-core-node"
                  transform={`translate(${corePos.x}, ${corePos.y})`}
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                  onPointerDown={(e) => handlePointerDown(e, "core")}
                  onClick={() => handleSelectNode(baseNodes[0])}
                >
                  {/* Hexagon Outer Glow */}
                  <polygon
                    points="0,-36 32,-18 32,18 0,36 -32,18 -32,-18"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth={isSelected ? "3" : "1.8"}
                    strokeOpacity="0.8"
                    className="core-beacon-ring"
                  />
                  <polygon
                    points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
                    fill="#04121a"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="IBM Plex Mono, monospace"
                    letterSpacing="0.08em"
                  >
                    CORE
                  </text>
                  <text
                    x="0"
                    y="12"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    DSA &amp; C++
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Bottom Interactive Legend Bar & Quick Branch Filter */}
          <div className="constellation-legend-bar" role="group" aria-label="Branch selector">
            <button
              type="button"
              className={`legend-pill ${activeBranch.id === "voice_ai" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(baseNodes.find((n) => n.id === "voice_ai")!)}
            >
              <span className="legend-dot" style={{ background: "#f59e0b" }} />
              <span>{language === "vi" ? "AI & Viễn Thông" : "AI & Telecom"}</span>
            </button>
            <button
              type="button"
              className={`legend-pill ${activeBranch.id === "mobile" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(baseNodes.find((n) => n.id === "mobile")!)}
            >
              <span className="legend-dot" style={{ background: "#06b6d4" }} />
              <span>{language === "vi" ? "Di Động & UI" : "Mobile & UI"}</span>
            </button>
            <button
              type="button"
              className={`legend-pill ${activeBranch.id === "backend" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(baseNodes.find((n) => n.id === "backend")!)}
            >
              <span className="legend-dot" style={{ background: "#a855f7" }} />
              <span>{language === "vi" ? "Hệ Thống Phân Tán" : "Backend/Cloud"}</span>
            </button>
            <button
              type="button"
              className={`legend-pill ${activeBranch.id === "domain" ? "is-active" : ""}`}
              onClick={() => handleSelectNode(baseNodes.find((n) => n.id === "domain")!)}
            >
              <span className="legend-dot" style={{ background: "#10b981" }} />
              <span>{language === "vi" ? "ERP & Doanh Nghiệp" : "ERP/Business"}</span>
            </button>
          </div>
        </div>

        {/* Right Floating Tactical HUD Card */}
        <aside className="constellation-hud-card">
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

          {/* Completed Raid Quests & Verified D1 Case Studies */}
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
                    <a href={`/blog/${quest.slug}`} className="hud-quest-link" title={quest.titleEn}>
                      <span>{language === "vi" ? "📖 Đọc bài nghiên cứu D1" : "📖 Read Case Study"}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Skill Node Inspector if specific leaf clicked */}
          {activeNode && activeNode.id !== activeBranch.id && (
            <div className="hud-leaf-inspect">
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

          {/* Streamlined Contextual D1 Footer (Replaced bloated button) */}
          <div className="hud-footer-indicator">
            <div className="hud-indicator-info">
              <i className="fa-solid fa-circle-nodes" style={{ color: activeBranch.color }} />
              <span>
                {language === "vi"
                  ? `${activeBranch.linkedSlugs.length} bài phân tích liên kết từ D1`
                  : `${activeBranch.linkedSlugs.length} studies indexed in Cloudflare D1`}
              </span>
            </div>
            <button
              type="button"
              className="hud-filter-scroll-btn"
              onClick={handleScrollToD1}
              title={language === "vi" ? "Cuộn xuống xem kho bài viết D1" : "Scroll to filtered D1 studies"}
            >
              <span>{language === "vi" ? "Xem kho D1" : "View D1 Repo"}</span>
              <i className="fa-solid fa-arrow-down" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
