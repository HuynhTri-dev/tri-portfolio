/**
 * @name SkillGraphNetwork.tsx
 * @description Living Cyber-Arboretum Root & Canopy Tree (GraphDB):
 *              - Tapered Cubic-Bezier organic boughs, root tendrils, and flowing bioluminescent sap veins.
 *              - Botanical node morphologies: Heartwood Core, Bough Knots, Crystal Leaf Pods, and Golden D1 Spores.
 *              - Hover Sap Surge (lineage path illumination), On-Canvas Floating Bio-Tooltip,
 *                Ambient Forest Breeze Sway, Interactive Zoom, and Elastic Branch Bending Physics.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { SkillRank } from "../../data/skill-matrix";
import type { KbIndexSummaryItem } from "./SkillTreeMatrix";
import {
  SEED_DOMAINS,
  SEED_NODES,
  SEED_ARTICLE_LINKS,
  type SkillNodeSeed,
} from "../../lib/data/skill-graph-seed";

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
  kbItems?: KbIndexSummaryItem[];
  activeRankFilter?: "ALL" | SkillRank;
}

interface PositionedGraphNode {
  id: string;
  kind: "CORE" | "HUB" | "BRANCH" | "ARTICLE";
  labelEn: string;
  labelVi: string;
  shortEn: string;
  shortVi: string;
  summaryEn: string;
  summaryVi: string;
  rank: SkillRank;
  level: number;
  domainId: string;
  parentId: string | null;
  originX: number;
  originY: number;
  angleDeg: number;
  color: string;
  articleCount: number;
  href?: string;
}

interface PositionedEdge {
  id: string;
  from: string;
  to: string;
  color: string;
  isPrimary: boolean;
  curveBend: number;
}

interface NodePhysicsPos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const RANK_COLOR_MAP: Record<SkillRank, string> = {
  S: "#18c785",
  A: "#38bdf8",
  B: "#a855f7",
  C: "#94a3b8",
  D: "#64748b",
  E: "#475569",
  F: "#334155",
};

const DOMAIN_META: Record<
  string,
  {
    shortEn: string;
    shortVi: string;
    icon: string;
    color: string;
    proofs: { labelEn: string; labelVi: string; href: string }[];
  }
> = {
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
  be: {
    shortEn: "Backend, Kafka & Redis",
    shortVi: "Backend, Kafka & Redis",
    icon: "fa-solid fa-bolt",
    color: "#38bdf8",
    proofs: [
      {
        labelEn: "Realtime PBX Event Pipeline (Redis & Kafka)",
        labelVi: "Đường ống Sự kiện Tổng đài (Redis & Kafka)",
        href: "/experience/idb",
      },
      {
        labelEn: "Financial Multi-Agent Backend",
        labelVi: "Hệ thống Phân tích Tài chính Đa Agent",
        href: "/projects/finance-analysis",
      },
    ],
  },
  mobile: {
    shortEn: "Mobile (Flutter / Native)",
    shortVi: "Di động (Flutter / Native)",
    icon: "fa-solid fa-mobile-screen",
    color: "#06b6d4",
    proofs: [
      {
        labelEn: "Between Us · Spatial Memory Canvas",
        labelVi: "Between Us · Không gian Kỷ niệm Cặp đôi",
        href: "/projects/between-us",
      },
      {
        labelEn: "OmniMer Health · Wearable Biometrics",
        labelVi: "OmniMer Health · Đồng bộ Sinh hiệu Đeo tay",
        href: "/projects/omnimer-health",
      },
    ],
  },
  infra: {
    shortEn: "Cloud, D1 & Linux",
    shortVi: "Hạ tầng Cloud, D1 & Linux",
    icon: "fa-brands fa-cloudflare",
    color: "#f59e0b",
    proofs: [
      {
        labelEn: "Cloudflare Workers & D1 Knowledge API",
        labelVi: "Hệ thống API Tri thức trên Cloudflare D1",
        href: "/docs/api",
      },
    ],
  },
  fe: {
    shortEn: "Frontend & Astro",
    shortVi: "Giao diện & Astro Islands",
    icon: "fa-solid fa-layer-group",
    color: "#ec4899",
    proofs: [
      {
        labelEn: "Cyber-Arboretum Interactive Portfolio",
        labelVi: "Kiến trúc Đảo Tương tác Cyber-Arboretum",
        href: "/projects",
      },
    ],
  },
  pm_ba: {
    shortEn: "Fintech BA & ERP",
    shortVi: "Nghiệp vụ BA & ERP",
    icon: "fa-solid fa-sitemap",
    color: "#d9b36c",
    proofs: [
      {
        labelEn: "Rita Võ ProdID · Odoo 18 PLM",
        labelVi: "Rita Võ ProdID · Quản trị Vòng đời Sản phẩm",
        href: "/projects/ritavo-prodid",
      },
      {
        labelEn: "Enterprise Banking PoC & NOL Workflows",
        labelVi: "Nghiệm thu PoC Ngân hàng & Tất toán Khoản vay",
        href: "/experience/idb",
      },
    ],
  },
};

const ARTICLE_TITLE_FALLBACKS: Record<string, { en: string; vi: string; category: string }> = {
  "asterisk-nen-tang-voip-sip-kien-truc": {
    en: "Asterisk Part 1: VoIP Foundations, SIP/RTP & Core Architecture",
    vi: "Asterisk Phần 1: Nền tảng VoIP, SIP/RTP & Kiến trúc Lõi",
    category: "VoIP & Telephony",
  },
  "asterisk-cai-dat-thu-muc-cli": {
    en: "Asterisk Part 2: Source Compilation, Directory Layout & Core CLI",
    vi: "Asterisk Phần 2: Cài đặt từ Source, Cấu trúc Thư mục & Lệnh CLI",
    category: "VoIP & Telephony",
  },
  "asterisk-pjsip-wizard-transport-nat": {
    en: "Asterisk Part 3: PJSIP Wizard, Transport & NAT Traversal",
    vi: "Asterisk Phần 3: Cấu hình PJSIP Wizard, Transport & Xuyên NAT",
    category: "VoIP & Telephony",
  },
  "asterisk-dialplan-ivr-queue-voicemail": {
    en: "Asterisk Part 4: Dialplan Programming, IVR, Queues & Voicemail",
    vi: "Asterisk Phần 4: Lập trình Dialplan, Menu IVR, Hàng đợi & Voicemail",
    category: "VoIP & Telephony",
  },
  "asterisk-trunk-pstn": {
    en: "Asterisk Part 5: Carrier SIP Trunking & PSTN Interconnect",
    vi: "Asterisk Phần 5: Đấu nối SIP Trunk Nhà mạng & PSTN",
    category: "VoIP & Telephony",
  },
  "asterisk-webrtc-tls-srtp": {
    en: "Asterisk Part 6: WebRTC Browser Telephony, TLS & SRTP Encryption",
    vi: "Asterisk Phần 6: Tổng đài Trình duyệt WebRTC, Bảo mật TLS & SRTP",
    category: "VoIP & Telephony",
  },
  "asterisk-cdr-cel-ami-ari": {
    en: "Asterisk Part 7: Call Detail Records (CDR/CEL) & AMI/ARI Control",
    vi: "Asterisk Phần 7: Bản ghi Cuộc gọi CDR/CEL & Điều khiển qua AMI/ARI",
    category: "VoIP & Telephony",
  },
  "asterisk-van-hanh-debug-bao-mat": {
    en: "Asterisk Part 8: SNGREP Packet Debugging, Fail2ban & SIP Security",
    vi: "Asterisk Phần 8: Bắt gói tin SNGREP, Phòng thủ Fail2ban & Bảo mật SIP",
    category: "VoIP & Telephony",
  },
  "asterisk-nang-cao-stasis-ha-voicebot": {
    en: "Asterisk Part 9: Stasis App Engine, High Availability & AI Voicebots",
    vi: "Asterisk Phần 9: Động cơ Stasis, High Availability & Tích hợp Voicebot AI",
    category: "VoIP & Telephony",
  },
  "voicebot-asterisk-pipecat-elevenlabs-ollama": {
    en: "Production AI Voicebot with Asterisk, Pipecat, ElevenLabs & Ollama",
    vi: "Xây dựng AI Voicebot Thực chiến với Asterisk, Pipecat, ElevenLabs & Ollama",
    category: "AI Voicebot",
  },
  "pipecat-voicebot-production-guide": {
    en: "Pipecat Voicebot Production Guide: Sub-800ms Latency & Echo Gate",
    vi: "Hướng dẫn Tối ưu Pipecat Voicebot: Độ trễ dưới 800ms & Khử vọng",
    category: "AI Voicebot",
  },
  "kafka-core-concepts-and-architecture": {
    en: "Apache Kafka Core Concepts: Append-Only Logs, Partitions & KRaft",
    vi: "Kiến trúc Lõi Apache Kafka: Append-Only Log, Phân vùng & Đồng thuận KRaft",
    category: "Distributed Systems",
  },
  "kafka-pbx-event-streaming-architecture": {
    en: "High-Throughput PBX Call Event Streaming with Apache Kafka",
    vi: "Kiến trúc Streaming Sự kiện Tổng đài Chịu tải cao với Apache Kafka",
    category: "Distributed Systems",
  },
  "redis-stream-theory-and-best-practices": {
    en: "Redis Streams in Production: Consumer Groups, PEL & XACK Recovery",
    vi: "Redis Streams Thực chiến: Consumer Group, PEL & Khôi phục Sự cố XACK",
    category: "Distributed Systems",
  },
  "building-omnimer-health": {
    en: "Building OmniMer Health: GraphRAG & Apple HealthKit Wearable Telemetry",
    vi: "Xây dựng OmniMer Health: Đồ thị Tri thức Y tế GraphRAG & Apple HealthKit",
    category: "AI & Mobile Health",
  },
  "between-us-spatial-memory-canvas": {
    en: "Between Us: Flutter Spatial Canvas & Battery-Safe Location Architecture",
    vi: "Between Us: Kiến trúc Canvas Không gian Flutter & Định vị Tiết kiệm Pin",
    category: "Mobile Engineering",
  },
  "finance-analysis": {
    en: "Autonomous Multi-Agent Financial Analysis with LangGraph",
    vi: "Hệ thống Đa Tác tử Phân tích Tài chính Tự hành với LangGraph",
    category: "AI Agents",
  },
};

const SHORT_NODE_LABELS: Record<string, { en: string; vi: string }> = {
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

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 10) / 10,
    y: Math.round((cy + r * Math.sin(rad)) * 10) / 10,
  };
}

/**
 * Generates an organic Cubic-Bezier bough/root path between two points,
 * plus optional lateral root offshoot tendrils for authentic botanical morphology.
 */
function buildOrganicBoughGeometry(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bendFactor: number,
  isPrimary: boolean
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const offset1 = len * 0.16 * bendFactor;
  const offset2 = -len * 0.08 * bendFactor;

  const c1x = Math.round((x1 + dx * 0.34 + nx * offset1) * 10) / 10;
  const c1y = Math.round((y1 + dy * 0.34 + ny * offset1) * 10) / 10;
  const c2x = Math.round((x1 + dx * 0.68 + nx * offset2) * 10) / 10;
  const c2y = Math.round((y1 + dy * 0.68 + ny * offset2) * 10) / 10;

  const mainPath = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;

  // Lateral micro-root offshoot sprouting near mid-bough
  const midX = Math.round((x1 + dx * 0.52 + nx * (offset1 * 0.5)) * 10) / 10;
  const midY = Math.round((y1 + dy * 0.52 + ny * (offset1 * 0.5)) * 10) / 10;
  const sideSign = bendFactor >= 0 ? 1 : -1;
  const twigLen = isPrimary ? 22 : 14;
  const twigEndX = Math.round((midX + (dx / len) * twigLen * 0.7 + nx * twigLen * sideSign) * 10) / 10;
  const twigEndY = Math.round((midY + (dy / len) * twigLen * 0.7 + ny * twigLen * sideSign) * 10) / 10;
  const twigCtrlX = Math.round((midX + nx * twigLen * 0.6 * sideSign) * 10) / 10;
  const twigCtrlY = Math.round((midY + ny * twigLen * 0.6 * sideSign) * 10) / 10;

  const tendrilPath = `M ${midX} ${midY} Q ${twigCtrlX} ${twigCtrlY}, ${twigEndX} ${twigEndY}`;

  return { mainPath, tendrilPath, twigEndX, twigEndY };
}

export const SkillGraphNetwork: React.FC<SkillGraphNetworkProps> = ({
  language,
  onSelectSkill,
  kbItems = [],
  activeRankFilter = "ALL",
}) => {
  const [activeDomainId, setActiveDomainId] = useState<string>("ALL");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("asterisk-core");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [breezeEnabled, setBreezeEnabled] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const draggedNodeRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Map of slug -> article metadata
  const articleBySlug = useMemo(() => {
    const map = new Map<
      string,
      { slug: string; titleEn: string; titleVi: string; category: string; description: string }
    >();
    for (const [slug, fallback] of Object.entries(ARTICLE_TITLE_FALLBACKS)) {
      map.set(slug, {
        slug,
        titleEn: fallback.en,
        titleVi: fallback.vi,
        category: fallback.category,
        description: "",
      });
    }
    for (const item of kbItems) {
      const fb = ARTICLE_TITLE_FALLBACKS[item.slug];
      map.set(item.slug, {
        slug: item.slug,
        titleEn: fb?.en ?? item.title,
        titleVi: item.title,
        category: item.category || fb?.category || "Knowledge Base",
        description: item.description ?? "",
      });
    }
    return map;
  }, [kbItems]);

  const directLinksByNode = useMemo(() => {
    const map = new Map<string, { slug: string; relationship: string }[]>();
    for (const link of SEED_ARTICLE_LINKS) {
      const list = map.get(link.skill_node_id) ?? [];
      if (!list.some((item) => item.slug === link.article_slug)) {
        list.push({ slug: link.article_slug, relationship: link.relationship });
      }
      map.set(link.skill_node_id, list);
    }
    return map;
  }, []);

  const childrenByParentId = useMemo(() => {
    const map = new Map<string, SkillNodeSeed[]>();
    for (const node of SEED_NODES) {
      if (node.parent_id) {
        const list = map.get(node.parent_id) ?? [];
        list.push(node);
        map.set(node.parent_id, list);
      }
    }
    return map;
  }, []);

  const aggregatedLinksByNode = useMemo(() => {
    const map = new Map<string, { slug: string; relationship: string }[]>();
    for (const node of SEED_NODES) {
      const combined = new Map<string, string>();
      for (const item of directLinksByNode.get(node.id) ?? []) {
        combined.set(item.slug, item.relationship);
      }
      for (const child of childrenByParentId.get(node.id) ?? []) {
        for (const item of directLinksByNode.get(child.id) ?? []) {
          if (!combined.has(item.slug)) {
            combined.set(item.slug, item.relationship);
          }
        }
      }
      if (node.id === "kafka-distributed") {
        for (const extraId of ["redis-architecture", "redis-streams", "fastapi-backend"]) {
          for (const item of directLinksByNode.get(extraId) ?? []) {
            if (!combined.has(item.slug)) combined.set(item.slug, item.relationship);
          }
        }
      }
      if (node.id === "voicebot-pipecat") {
        for (const extraId of ["langgraph-rag", "graphrag-biometrics"]) {
          for (const item of directLinksByNode.get(extraId) ?? []) {
            if (!combined.has(item.slug)) combined.set(item.slug, item.relationship);
          }
        }
      }
      map.set(
        node.id,
        Array.from(combined.entries()).map(([slug, relationship]) => ({ slug, relationship }))
      );
    }
    return map;
  }, [directLinksByNode, childrenByParentId]);

  // Build organic root & canopy tree topology
  const { graphNodes, graphEdges } = useMemo(() => {
    const cx = 400;
    const cy = 300;
    const nodes: PositionedGraphNode[] = [];
    const edges: PositionedEdge[] = [];

    if (activeDomainId === "ALL") {
      nodes.push({
        id: "d1-core",
        kind: "CORE",
        labelEn: "HEARTWOOD ROOT CORE",
        labelVi: "CỘI RỄ TRI THỨC D1",
        shortEn: "ROOT CORE\n34 SKILLS",
        shortVi: "CỘI RỄ D1\n34 KỸ NĂNG",
        summaryEn: "Central symbiotic root nexus connecting 34 engineering capabilities to 18 verified Cloudflare D1 studies.",
        summaryVi: "Lõi rễ đại thụ trung tâm kết nối 34 nhánh kỹ năng kỹ thuật với 18 bài nghiên cứu thực chiến trong Cloudflare D1.",
        rank: "S",
        level: 100,
        domainId: "ALL",
        parentId: null,
        originX: cx,
        originY: cy,
        angleDeg: 0,
        color: "#18c785",
        articleCount: articleBySlug.size,
      });

      const overviewHubs: {
        id: string;
        angle: number;
        color: string;
        bend: number;
        leaves: { id: string; angle: number; bend: number }[];
      }[] = [
        {
          id: "asterisk-core",
          angle: 210,
          color: "#18c785",
          bend: 0.9,
          leaves: [
            { id: "asterisk-webrtc", angle: 180, bend: -0.8 },
            { id: "asterisk-stasis-voicebot", angle: 200, bend: -0.4 },
            { id: "asterisk-cdr-ami", angle: 220, bend: 0.5 },
            { id: "asterisk-pjsip-trunk", angle: 240, bend: 0.9 },
          ],
        },
        {
          id: "telecom-ba",
          angle: 270,
          color: "#d9b36c",
          bend: -0.7,
          leaves: [
            { id: "poc-validation", angle: 260, bend: -0.6 },
            { id: "telephony-3cx", angle: 280, bend: 0.6 },
          ],
        },
        {
          id: "voicebot-pipecat",
          angle: 330,
          color: "#a855f7",
          bend: -0.9,
          leaves: [
            { id: "pipecat-stt-tts", angle: 300, bend: -0.85 },
            { id: "pipecat-barge-in", angle: 320, bend: -0.4 },
            { id: "pipecat-vad-latency", angle: 340, bend: 0.45 },
            { id: "langgraph-rag", angle: 360, bend: 0.85 },
          ],
        },
        {
          id: "kafka-distributed",
          angle: 30,
          color: "#38bdf8",
          bend: 0.85,
          leaves: [
            { id: "kafka-partitions", angle: 20, bend: -0.7 },
            { id: "kafka-consumer-groups", angle: 40, bend: 0.35 },
            { id: "redis-architecture", angle: 60, bend: 0.85 },
          ],
        },
        {
          id: "cloudflare-edge",
          angle: 90,
          color: "#f59e0b",
          bend: 0.7,
          leaves: [
            { id: "linux-sysadmin", angle: 80, bend: -0.65 },
            { id: "astro-modern", angle: 100, bend: 0.65 },
          ],
        },
        {
          id: "mobile-ecosystem",
          angle: 150,
          color: "#06b6d4",
          bend: -0.85,
          leaves: [
            { id: "mobile-flutter", angle: 120, bend: -0.85 },
            { id: "mobile-react-native", angle: 134, bend: -0.4 },
            { id: "mobile-swift", angle: 148, bend: 0.4 },
            { id: "mobile-kotlin", angle: 162, bend: 0.85 },
          ],
        },
      ];

      for (const hubCfg of overviewHubs) {
        const seed = SEED_NODES.find((n) => n.id === hubCfg.id);
        if (!seed) continue;
        const pos = polarToCartesian(cx, cy, 128, hubCfg.angle);
        const short = SHORT_NODE_LABELS[seed.id] ?? { en: seed.name_en, vi: seed.name_vi };
        const count = (aggregatedLinksByNode.get(seed.id) ?? []).length;

        nodes.push({
          id: seed.id,
          kind: "HUB",
          labelEn: seed.name_en,
          labelVi: seed.name_vi,
          shortEn: short.en,
          shortVi: short.vi,
          summaryEn: seed.summary_en,
          summaryVi: seed.summary_vi,
          rank: seed.rank as SkillRank,
          level: seed.level,
          domainId: seed.domain_id,
          parentId: "d1-core",
          originX: pos.x,
          originY: pos.y,
          angleDeg: hubCfg.angle,
          color: hubCfg.color,
          articleCount: count,
        });

        edges.push({
          id: `core-${seed.id}`,
          from: "d1-core",
          to: seed.id,
          color: hubCfg.color,
          isPrimary: true,
          curveBend: hubCfg.bend,
        });

        for (const leafCfg of hubCfg.leaves) {
          const leafSeed = SEED_NODES.find((n) => n.id === leafCfg.id);
          if (!leafSeed) continue;
          const leafPos = polarToCartesian(cx, cy, 242, leafCfg.angle);
          const leafShort = SHORT_NODE_LABELS[leafSeed.id] ?? {
            en: leafSeed.name_en,
            vi: leafSeed.name_vi,
          };
          const leafCount = (aggregatedLinksByNode.get(leafSeed.id) ?? []).length;

          nodes.push({
            id: leafSeed.id,
            kind: "BRANCH",
            labelEn: leafSeed.name_en,
            labelVi: leafSeed.name_vi,
            shortEn: leafShort.en,
            shortVi: leafShort.vi,
            summaryEn: leafSeed.summary_en,
            summaryVi: leafSeed.summary_vi,
            rank: leafSeed.rank as SkillRank,
            level: leafSeed.level,
            domainId: leafSeed.domain_id,
            parentId: seed.id,
            originX: leafPos.x,
            originY: leafPos.y,
            angleDeg: leafCfg.angle,
            color: hubCfg.color,
            articleCount: leafCount,
          });

          edges.push({
            id: `edge-${seed.id}-${leafSeed.id}`,
            from: seed.id,
            to: leafSeed.id,
            color: hubCfg.color,
            isPrimary: false,
            curveBend: leafCfg.bend,
          });
        }
      }
    } else {
      // DOMAIN FOCUS MODE: Center is Domain Root, Ring 1 = All Skill Branches, Ring 2 = Sprouting D1 Knowledge Fruits
      const domainMeta = DOMAIN_META[activeDomainId] ?? DOMAIN_META.voip;
      const domainSkills = SEED_NODES.filter((n) => n.domain_id === activeDomainId);

      nodes.push({
        id: `domain-core-${activeDomainId}`,
        kind: "CORE",
        labelEn: domainMeta.shortEn.toUpperCase(),
        labelVi: domainMeta.shortVi.toUpperCase(),
        shortEn: `${activeDomainId.toUpperCase()}\n${domainSkills.length} ROOTS`,
        shortVi: `${activeDomainId.toUpperCase()}\n${domainSkills.length} NHÁNH`,
        summaryEn: `Focused botanical canopy for ${domainMeta.shortEn} and its connected Cloudflare D1 lessons.`,
        summaryVi: `Tán cây chuyên sâu của nhánh ${domainMeta.shortVi} cùng các bài học thực tế nối từ Cloudflare D1.`,
        rank: "S",
        level: 96,
        domainId: activeDomainId,
        parentId: null,
        originX: cx,
        originY: cy,
        angleDeg: 0,
        color: domainMeta.color,
        articleCount: 0,
      });

      const skillCount = Math.max(domainSkills.length, 1);
      const uniqueArticles = new Map<string, string[]>();

      domainSkills.forEach((skill, idx) => {
        const angle = -90 + (idx * 360) / skillCount;
        const pos = polarToCartesian(cx, cy, 138, angle);
        const short = SHORT_NODE_LABELS[skill.id] ?? { en: skill.name_en, vi: skill.name_vi };
        const directLinks = directLinksByNode.get(skill.id) ?? [];
        const bend = idx % 2 === 0 ? 0.75 : -0.75;

        nodes.push({
          id: skill.id,
          kind: skill.node_type === "HUB" ? "HUB" : "BRANCH",
          labelEn: skill.name_en,
          labelVi: skill.name_vi,
          shortEn: short.en,
          shortVi: short.vi,
          summaryEn: skill.summary_en,
          summaryVi: skill.summary_vi,
          rank: skill.rank as SkillRank,
          level: skill.level,
          domainId: skill.domain_id,
          parentId: `domain-core-${activeDomainId}`,
          originX: pos.x,
          originY: pos.y,
          angleDeg: angle,
          color: domainMeta.color,
          articleCount: directLinks.length,
        });

        edges.push({
          id: `dom-${skill.id}`,
          from: `domain-core-${activeDomainId}`,
          to: skill.id,
          color: domainMeta.color,
          isPrimary: true,
          curveBend: bend,
        });

        for (const link of directLinks) {
          const list = uniqueArticles.get(link.slug) ?? [];
          list.push(skill.id);
          uniqueArticles.set(link.slug, list);
        }
      });

      const articleEntries = Array.from(uniqueArticles.entries());
      const artCount = Math.max(articleEntries.length, 1);
      articleEntries.forEach(([slug, parentSkillIds], idx) => {
        const angle = -75 + (idx * 360) / artCount;
        const pos = polarToCartesian(cx, cy, 244, angle);
        const artMeta = articleBySlug.get(slug);
        const shortSlug = slug
          .replace(/^asterisk-/, "ast-")
          .replace(/^voicebot-/, "bot-")
          .slice(0, 16);

        const artNodeId = `art-${slug}`;
        nodes.push({
          id: artNodeId,
          kind: "ARTICLE",
          labelEn: artMeta?.titleEn ?? slug,
          labelVi: artMeta?.titleVi ?? slug,
          shortEn: `✦ ${shortSlug}`,
          shortVi: `✦ ${shortSlug}`,
          summaryEn: artMeta?.description || "Verified Cloudflare D1 engineering study.",
          summaryVi: artMeta?.description || "Bài nghiên cứu kỹ thuật thực chiến lưu trữ trên Cloudflare D1.",
          rank: "S",
          level: 100,
          domainId: activeDomainId,
          parentId: parentSkillIds[0],
          originX: pos.x,
          originY: pos.y,
          angleDeg: angle,
          color: "#d9b36c",
          articleCount: 1,
          href: `/blog/${slug}`,
        });

        for (const pId of parentSkillIds) {
          edges.push({
            id: `art-edge-${pId}-${slug}`,
            from: pId,
            to: artNodeId,
            color: "#d9b36c",
            isPrimary: false,
            curveBend: idx % 2 === 0 ? -0.55 : 0.55,
          });
        }
      });
    }

    return { graphNodes: nodes, graphEdges: edges };
  }, [activeDomainId, aggregatedLinksByNode, directLinksByNode, articleBySlug]);

  const [positions, setPositions] = useState<Record<string, NodePhysicsPos>>({});

  useEffect(() => {
    const next: Record<string, NodePhysicsPos> = {};
    for (const n of graphNodes) {
      next[n.id] = { x: n.originX, y: n.originY, vx: 0, vy: 0 };
    }
    setPositions(next);
  }, [graphNodes]);

  // Elastic branch physics loop
  useEffect(() => {
    let animId: number;
    let running = false;

    const step = () => {
      setPositions((prev) => {
        let moving = false;
        const next: Record<string, NodePhysicsPos> = {};
        const k = 0.09;
        const damping = 0.78;

        for (const n of graphNodes) {
          const cur = prev[n.id] ?? { x: n.originX, y: n.originY, vx: 0, vy: 0 };
          if (draggedNodeRef.current === n.id) {
            next[n.id] = cur;
            continue;
          }
          const dx = n.originX - cur.x;
          const dy = n.originY - cur.y;
          if (
            Math.abs(dx) > 0.08 ||
            Math.abs(dy) > 0.08 ||
            Math.abs(cur.vx) > 0.08 ||
            Math.abs(cur.vy) > 0.08
          ) {
            moving = true;
            const nvx = (cur.vx + dx * k) * damping;
            const nvy = (cur.vy + dy * k) * damping;
            next[n.id] = {
              x: cur.x + nvx,
              y: cur.y + nvy,
              vx: nvx,
              vy: nvy,
            };
          } else {
            next[n.id] = { x: n.originX, y: n.originY, vx: 0, vy: 0 };
          }
        }

        if (moving || draggedNodeRef.current) {
          animId = requestAnimationFrame(step);
          running = true;
        } else {
          running = false;
        }
        return next;
      });
    };

    if (isDragging && !running) {
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isDragging, graphNodes]);

  // Bioluminescent forest spores & fireflies
  const bioSpores = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => ({
      id: i,
      cx: ((i * 43) % 760) + 20,
      cy: ((i * 61) % 560) + 20,
      r: 0.9 + ((i * 7) % 15) / 10,
      isGold: i % 3 === 0,
      delay: ((i * 11) % 30) / 10,
      dur: 2.6 + ((i * 13) % 22) / 10,
    }));
  }, []);

  // Compute active lineage set for Hover Sap Surge & Selection
  const activeFocusId = hoveredNodeId ?? selectedNodeId;
  const activeLineageSet = useMemo(() => {
    const set = new Set<string>();
    if (!activeFocusId) return set;
    set.add(activeFocusId);

    const targetNode = graphNodes.find((n) => n.id === activeFocusId);
    if (targetNode) {
      // Trace upward to root core
      let curr: PositionedGraphNode | undefined = targetNode;
      while (curr && curr.parentId) {
        set.add(curr.parentId);
        curr = graphNodes.find((n) => n.id === curr?.parentId);
      }
      // Trace downward to immediate children
      for (const child of graphNodes) {
        if (child.parentId === targetNode.id) {
          set.add(child.id);
        }
      }
    }
    return set;
  }, [activeFocusId, graphNodes]);

  const hoveredGraphNode = useMemo(() => {
    if (!hoveredNodeId) return null;
    return graphNodes.find((n) => n.id === hoveredNodeId) ?? null;
  }, [hoveredNodeId, graphNodes]);

  const inspectedSeed = useMemo(() => {
    return (
      SEED_NODES.find((n) => n.id === selectedNodeId) ??
      SEED_NODES.find((n) => n.domain_id === activeDomainId) ??
      SEED_NODES[0]
    );
  }, [selectedNodeId, activeDomainId]);

  const inspectedDomainMeta = useMemo(() => {
    return DOMAIN_META[inspectedSeed.domain_id] ?? DOMAIN_META.voip;
  }, [inspectedSeed]);

  const clusterBranches = useMemo(() => {
    const parentHubId = inspectedSeed.parent_id ?? inspectedSeed.id;
    return SEED_NODES.filter(
      (n) =>
        n.parent_id === parentHubId ||
        (n.domain_id === inspectedSeed.domain_id && n.id !== parentHubId)
    );
  }, [inspectedSeed]);

  const inspectedArticles = useMemo(() => {
    const links = aggregatedLinksByNode.get(inspectedSeed.id) ?? [];
    return links.map((item) => {
      const meta = articleBySlug.get(item.slug);
      return {
        slug: item.slug,
        relationship: item.relationship,
        titleEn: meta?.titleEn ?? item.slug,
        titleVi: meta?.titleVi ?? item.slug,
        category: meta?.category ?? "Knowledge Base",
      };
    });
  }, [inspectedSeed, aggregatedLinksByNode, articleBySlug]);

  const handleSelectSeedNode = useCallback(
    (nodeId: string) => {
      if (nodeId.startsWith("art-")) {
        const slug = nodeId.replace(/^art-/, "");
        window.location.href = `/blog/${slug}`;
        return;
      }
      if (nodeId === "d1-core" || nodeId.startsWith("domain-core-")) {
        onSelectSkill({
          skillId: null,
          skillNameEn: "All Knowledge Base Studies",
          skillNameVi: "Tất cả Bài nghiên cứu D1",
          rank: "S",
          domain: null,
          matchedSlugs: [],
          proofs: [],
        });
        return;
      }

      const seed = SEED_NODES.find((n) => n.id === nodeId);
      if (!seed) return;

      setSelectedNodeId(seed.id);
      const links = aggregatedLinksByNode.get(seed.id) ?? [];
      const matchedSlugs = links.map((l) => l.slug);
      const dMeta = DOMAIN_META[seed.domain_id] ?? DOMAIN_META.voip;

      onSelectSkill({
        skillId: seed.id,
        skillNameEn: seed.name_en,
        skillNameVi: seed.name_vi,
        rank: seed.rank as SkillRank,
        domain: seed.domain_id.toUpperCase(),
        matchedSlugs,
        proofs: dMeta.proofs,
      });
    },
    [aggregatedLinksByNode, onSelectSkill]
  );

  const handleSelectDomainTab = useCallback(
    (domainId: string) => {
      setActiveDomainId(domainId);
      setZoom(1);
      if (domainId === "ALL") {
        setSelectedNodeId("asterisk-core");
        onSelectSkill({
          skillId: null,
          skillNameEn: "",
          skillNameVi: "",
          rank: null,
          domain: null,
          matchedSlugs: [],
          proofs: [],
        });
      } else {
        const firstHub =
          SEED_NODES.find((n) => n.domain_id === domainId && n.node_type === "HUB") ??
          SEED_NODES.find((n) => n.domain_id === domainId);
        if (firstHub) {
          handleSelectSeedNode(firstHub.id);
        }
      }
    },
    [handleSelectSeedNode, onSelectSkill]
  );

  // Pointer drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      draggedNodeRef.current = nodeId;
      setIsDragging(true);

      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = 800 / rect.width;
        const scaleY = 600 / rect.height;
        const svgX = (e.clientX - rect.left) * scaleX;
        const svgY = (e.clientY - rect.top) * scaleY;
        const curPos = positions[nodeId] ?? { x: 400, y: 300 };
        dragOffsetRef.current = { x: svgX - curPos.x, y: svgY - curPos.y };
      }
    },
    [positions]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggedNodeRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;
    const nx = Math.max(48, Math.min(752, svgX - dragOffsetRef.current.x));
    const ny = Math.max(42, Math.min(558, svgY - dragOffsetRef.current.y));
    const id = draggedNodeRef.current;

    setPositions((prev) => ({
      ...prev,
      [id]: { x: nx, y: ny, vx: 0, vy: 0 },
    }));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (draggedNodeRef.current) {
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      draggedNodeRef.current = null;
      setIsDragging(false);
    }
  }, []);

  const handleResetGraph = useCallback(() => {
    setZoom(1);
    const reset: Record<string, NodePhysicsPos> = {};
    for (const n of graphNodes) {
      reset[n.id] = { x: n.originX, y: n.originY, vx: 0, vy: 0 };
    }
    setPositions(reset);
  }, [graphNodes]);

  const handleScrollToD1Cards = useCallback(() => {
    const anchor = document.querySelector("[data-kb-results-anchor]");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Compute dynamic SVG viewBox based on zoom level
  const viewBoxStr = useMemo(() => {
    const w = Math.round(800 / zoom);
    const h = Math.round(600 / zoom);
    const x = Math.round(400 - w / 2);
    const y = Math.round(300 - h / 2);
    return `${x} ${y} ${w} ${h}`;
  }, [zoom]);

  return (
    <div className="arboretum-graph-shell" data-skill-constellation>
      {/* Unified Domain Branch Selector Bar */}
      <div className="arboretum-graph__domain-bar" role="tablist" aria-label="Skill graph domains">
        <div className="arboretum-graph__tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeDomainId === "ALL"}
            className={`domain-tab ${activeDomainId === "ALL" ? "is-active" : ""}`}
            onClick={() => handleSelectDomainTab("ALL")}
          >
            <i className="fa-solid fa-tree" aria-hidden="true" />
            <span className="domain-tab__label">
              {language === "vi" ? "Toàn cảnh Đại thụ" : "Full Canopy Tree"}
            </span>
            <span className="domain-tab__count">{SEED_NODES.length}</span>
          </button>

          {SEED_DOMAINS.map((dom) => {
            const meta = DOMAIN_META[dom.id] ?? DOMAIN_META.voip;
            const count = SEED_NODES.filter((n) => n.domain_id === dom.id).length;
            const isSelected = activeDomainId === dom.id;
            return (
              <button
                key={dom.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`domain-tab ${isSelected ? "is-active" : ""}`}
                style={
                  {
                    "--tab-accent": meta.color,
                    "--tab-soft": meta.color,
                    "--tab-glow": `${meta.color}33`,
                  } as React.CSSProperties
                }
                onClick={() => handleSelectDomainTab(dom.id)}
              >
                <i className={meta.icon} aria-hidden="true" />
                <span className="domain-tab__label">
                  {language === "vi" ? meta.shortVi : meta.shortEn}
                </span>
                <span className="domain-tab__count">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="arboretum-reset-btn"
          onClick={handleResetGraph}
          title={language === "vi" ? "Đặt lại cành & góc nhìn" : "Reset tree boughs & zoom"}
        >
          <i className="fa-solid fa-seedling" aria-hidden="true" />
          <span>{language === "vi" ? "Cân bằng rễ" : "Reset Tree"}</span>
        </button>
      </div>

      {/* Equal-Height 2-Column Workspace: Left Organic Tree + Right Synaptic Dossier */}
      <div className="arboretum-graph__workspace">
        {/* LEFT COLUMN: Living Cyber-Arboretum Root & Canopy Canvas */}
        <div className="arboretum-canvas-panel">
          <div className="arboretum-canvas-topbar">
            <span className="canvas-telemetry-tag">
              <span className="canvas-telemetry-dot" />
              {activeDomainId === "ALL"
                ? language === "vi"
                  ? "BỘ RỄ & TÁN CÂY ĐẠI THỤ // 6 CÀNH LỚN & 18 NHÁNH LÁ"
                  : "BIO-BANYAN CANOPY & ROOTS // 6 MAJOR BOUGHS & 18 LEAF PODS"
                : language === "vi"
                  ? `TÁN CÂY CHUYÊN SÂU // ${inspectedDomainMeta.shortVi.toUpperCase()}`
                  : `BOUGH CANOPY FOCUS // ${inspectedDomainMeta.shortEn.toUpperCase()}`}
            </span>

            {/* Interactive Zoom & Breeze Controls */}
            <div className="arboretum-canvas-controls">
              <button
                type="button"
                className={`canvas-ctrl-pill ${breezeEnabled ? "is-active" : ""}`}
                onClick={() => setBreezeEnabled((v) => !v)}
                title={language === "vi" ? "Bật/tắt hiệu ứng gió rừng" : "Toggle forest breeze sway"}
              >
                <i className="fa-solid fa-wind" aria-hidden="true" />
                <span>{language === "vi" ? "Gió rừng" : "Breeze"}</span>
              </button>

              <div className="canvas-zoom-group" role="group" aria-label="Zoom controls">
                <button
                  type="button"
                  className="canvas-zoom-btn"
                  onClick={() => setZoom((z) => Math.max(0.85, Math.round((z - 0.15) * 100) / 100))}
                  title="Zoom out"
                >
                  −
                </button>
                <span className="canvas-zoom-val">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className="canvas-zoom-btn"
                  onClick={() => setZoom((z) => Math.min(1.45, Math.round((z + 0.15) * 100) / 100))}
                  title="Zoom in"
                >
                  +
                </button>
              </div>

              {activeDomainId !== "ALL" && (
                <button
                  type="button"
                  className="canvas-back-overview-btn"
                  onClick={() => handleSelectDomainTab("ALL")}
                >
                  <i className="fa-solid fa-compress" aria-hidden="true" />
                  <span>{language === "vi" ? "Toàn cảnh" : "Full Tree"}</span>
                </button>
              )}
            </div>
          </div>

          {/* On-Canvas Floating Bio-Tooltip when hovering any skill node */}
          {hoveredGraphNode && hoveredGraphNode.kind !== "CORE" && (
            <div
              className="arboretum-floating-tooltip"
              style={{ borderColor: hoveredGraphNode.color }}
            >
              <div className="tooltip-top">
                <span className="tooltip-rank" style={{ color: hoveredGraphNode.color }}>
                  {hoveredGraphNode.kind === "ARTICLE"
                    ? "D1 STUDY"
                    : `RANK ${hoveredGraphNode.rank} · ${hoveredGraphNode.level}%`}
                </span>
                <span className="tooltip-spores">
                  ✦ {hoveredGraphNode.articleCount}{" "}
                  {language === "vi" ? "bài học D1" : "D1 studies"}
                </span>
              </div>
              <strong className="tooltip-title">
                {language === "vi" ? hoveredGraphNode.labelVi : hoveredGraphNode.labelEn}
              </strong>
              <p className="tooltip-desc">
                {language === "vi" ? hoveredGraphNode.summaryVi : hoveredGraphNode.summaryEn}
              </p>
            </div>
          )}

          <svg
            ref={svgRef}
            className={`arboretum-svg ${breezeEnabled ? "is-breeze-active" : ""}`}
            viewBox={viewBoxStr}
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <radialGradient id="arboretumSoilGlow" cx="50%" cy="50%" r="52%">
                <stop offset="0%" stopColor="#18c785" stopOpacity="0.24" />
                <stop offset="45%" stopColor="#7d553d" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#040c09" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="activeNodeHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#18c785" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#d9b36c" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#18c785" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="barkWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9c6b49" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#d9b36c" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#18c785" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Ambient Forest Soil & Heartwood Growth Rings */}
            <circle cx="400" cy="300" r="285" fill="url(#arboretumSoilGlow)" />
            <circle
              cx="400"
              cy="300"
              r="72"
              fill="none"
              stroke="rgba(217, 179, 108, 0.14)"
              strokeDasharray="6 4"
            />
            <circle
              cx="400"
              cy="300"
              r="128"
              fill="none"
              stroke="rgba(24, 199, 133, 0.14)"
              strokeDasharray="3 6"
            />
            <circle
              cx="400"
              cy="300"
              r="242"
              fill="none"
              stroke="rgba(217, 179, 108, 0.11)"
              strokeDasharray="2 8"
            />

            {/* Decorative Background Root Mycelium Filaments */}
            <g opacity="0.22" stroke="#7d553d" fill="none">
              <path d="M 400 300 Q 330 350, 250 340 T 120 390" strokeWidth="1.2" />
              <path d="M 400 300 Q 470 250, 560 260 T 690 210" strokeWidth="1.2" />
              <path d="M 400 300 Q 360 210, 310 130 T 230 50" strokeWidth="1.1" />
              <path d="M 400 300 Q 440 390, 490 470 T 570 550" strokeWidth="1.1" />
            </g>

            {/* Bioluminescent Forest Spores & Fireflies */}
            {bioSpores.map((s) => (
              <circle
                key={s.id}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill={s.isGold ? "rgba(230, 198, 135, 0.65)" : "rgba(110, 231, 183, 0.55)"}
                className="stardust-particle"
                style={{
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${s.dur}s`,
                }}
              />
            ))}

            {/* Organic Cubic-Bezier Tree Boughs, Bark Conduits & Flowing Sap Veins */}
            {graphEdges.map((edge) => {
              const p1 = positions[edge.from];
              const p2 = positions[edge.to];
              if (!p1 || !p2) return null;

              const isLineageActive =
                activeLineageSet.has(edge.from) && activeLineageSet.has(edge.to);
              const isDimmed = hoveredNodeId !== null && !isLineageActive;

              const { mainPath, tendrilPath, twigEndX, twigEndY } = buildOrganicBoughGeometry(
                p1.x,
                p1.y,
                p2.x,
                p2.y,
                edge.curveBend,
                edge.isPrimary
              );

              return (
                <g
                  key={edge.id}
                  style={{
                    opacity: isDimmed ? 0.22 : 1,
                    transition: "opacity 220ms ease",
                  }}
                >
                  {/* 1. Lateral Root Tendril Offshoot */}
                  <path
                    d={tendrilPath}
                    fill="none"
                    stroke={edge.isPrimary ? "#9c6b49" : edge.color}
                    strokeWidth="1.1"
                    strokeOpacity="0.42"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={twigEndX}
                    cy={twigEndY}
                    r="1.8"
                    fill={edge.color}
                    fillOpacity="0.65"
                  />

                  {/* 2. Outer Woody Bark Conduit (Thick & Tapered) */}
                  <path
                    d={mainPath}
                    fill="none"
                    stroke="url(#barkWoodGrad)"
                    strokeWidth={edge.isPrimary ? (isLineageActive ? "5.8" : "4.4") : isLineageActive ? "3.4" : "2.2"}
                    strokeOpacity={isLineageActive ? "0.9" : "0.52"}
                    strokeLinecap="round"
                  />

                  {/* 3. Inner Bioluminescent Sap Vein */}
                  <path
                    d={mainPath}
                    fill="none"
                    stroke={edge.color}
                    strokeWidth={edge.isPrimary ? (isLineageActive ? "2.6" : "1.8") : isLineageActive ? "2" : "1.2"}
                    strokeOpacity={isLineageActive ? "1" : "0.78"}
                    strokeLinecap="round"
                    className={isLineageActive ? "bough-sap-surge" : "bough-sap-vein"}
                  />

                  {/* 4. Flowing Sap Droplets along the curved bough */}
                  {(edge.isPrimary || isLineageActive) && (
                    <circle
                      r={isLineageActive ? "3.4" : "2.4"}
                      fill={isLineageActive ? "#fde68a" : "#a7f3d0"}
                    >
                      <animateMotion
                        path={mainPath}
                        dur={isLineageActive ? "1.35s" : edge.isPrimary ? "2.6s" : "3.1s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Render Botanical Nodes: Heartwood Core, Bough Knots, Crystal Leaf Pods & D1 Spores */}
            {graphNodes.map((node, nodeIdx) => {
              const pos = positions[node.id] ?? { x: node.originX, y: node.originY };
              const isSelected =
                selectedNodeId === node.id ||
                (node.kind === "HUB" && inspectedSeed.parent_id === node.id);
              const isHovered = hoveredNodeId === node.id;
              const isLineage = activeLineageSet.has(node.id);

              const isRankFilteredOut =
                activeRankFilter !== "ALL" &&
                node.kind !== "CORE" &&
                node.kind !== "ARTICLE" &&
                node.rank !== activeRankFilter;
              const isHoverDimmed = hoveredNodeId !== null && !isLineage;

              // 1. HEARTWOOD ROOT CORE
              if (node.kind === "CORE") {
                const lines = (language === "vi" ? node.shortVi : node.shortEn).split("\n");
                return (
                  <g
                    key={node.id}
                    className="constellation-core-node"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    onPointerDown={(e) => handlePointerDown(e, node.id)}
                    onPointerEnter={() => setHoveredNodeId(node.id)}
                    onPointerLeave={() => setHoveredNodeId(null)}
                    onClick={() => handleSelectSeedNode(node.id)}
                  >
                    {/* Root Anchor Spurs */}
                    <circle
                      cx="0"
                      cy="0"
                      r="46"
                      fill="none"
                      stroke="rgba(217, 179, 108, 0.35)"
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />
                    <polygon
                      points="0,-41 35.5,-20.5 35.5,20.5 0,41 -35.5,20.5 -35.5,-20.5"
                      fill="rgba(125, 85, 61, 0.22)"
                      stroke="#18c785"
                      strokeWidth="2.2"
                      className="core-beacon-ring"
                    />
                    <polygon
                      points="0,-33 28.5,-16.5 28.5,16.5 0,33 -28.5,16.5 -28.5,-16.5"
                      fill="#05140e"
                      stroke="#d9b36c"
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="none"
                      stroke="rgba(24, 199, 133, 0.25)"
                      strokeDasharray="2 3"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.2"
                      fontWeight="800"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {lines[0]}
                    </text>
                    <text
                      x="0"
                      y="10"
                      textAnchor="middle"
                      fill="#e6c687"
                      fontSize="7.8"
                      fontWeight="700"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {lines[1] ?? ""}
                    </text>
                  </g>
                );
              }

              // 2. PRIMARY BOUGH KNOTS (HUB NODES)
              if (node.kind === "HUB") {
                const rankColor = RANK_COLOR_MAP[node.rank] ?? "#18c785";
                const sporeDots = Math.min(node.articleCount, 7);
                return (
                  <g
                    key={node.id}
                    className="constellation-hub-node"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{
                      cursor: isDragging ? "grabbing" : "grab",
                      opacity: isRankFilteredOut || isHoverDimmed ? 0.26 : 1,
                    }}
                    onPointerDown={(e) => handlePointerDown(e, node.id)}
                    onPointerEnter={() => setHoveredNodeId(node.id)}
                    onPointerLeave={() => setHoveredNodeId(null)}
                    onClick={() => handleSelectSeedNode(node.id)}
                  >
                    {(isSelected || isHovered) && (
                      <circle cx="0" cy="0" r="46" fill="url(#activeNodeHalo)" className="hub-pulse-aura" />
                    )}

                    {/* Outer Wooden Bark Growth Ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r="34"
                      fill="#06140f"
                      stroke="#d9b36c"
                      strokeWidth={isSelected || isHovered ? "2.2" : "1.4"}
                      strokeDasharray="6 3"
                    />

                    {/* Inner Bio-Vascular Ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r="28"
                      fill="#04100b"
                      stroke={node.color}
                      strokeWidth={isSelected || isHovered ? "2.6" : "1.8"}
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill={node.color}
                      fillOpacity={isSelected || isHovered ? "0.28" : "0.14"}
                    />

                    {/* Sprouting D1 Spore Buds along top arc of Bough Knot */}
                    {Array.from({ length: sporeDots }, (_, sIdx) => {
                      const sAngle = -140 + (sIdx * 100) / Math.max(sporeDots - 1, 1);
                      const sPos = polarToCartesian(0, 0, 38, sAngle);
                      return (
                        <circle
                          key={sIdx}
                          cx={sPos.x}
                          cy={sPos.y}
                          r="2.4"
                          fill="#fbbf24"
                          stroke="#04100b"
                          strokeWidth="0.8"
                        />
                      );
                    })}

                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8.4"
                      fontWeight="800"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {language === "vi" ? node.shortVi : node.shortEn}
                    </text>
                    <text
                      x="0"
                      y="10"
                      textAnchor="middle"
                      fill={rankColor}
                      fontSize="7.2"
                      fontWeight="700"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      RANK {node.rank} · {node.articleCount}✦
                    </text>
                  </g>
                );
              }

              // 3. CRYSTAL LEAF PODS & GOLDEN D1 SPORE FRUITS (OUTER CANOPY)
              const isArticle = node.kind === "ARTICLE";
              const rankColor = isArticle ? "#fbbf24" : RANK_COLOR_MAP[node.rank] ?? node.color;
              const isTopHalf = pos.y < 300;
              const labelText = language === "vi" ? node.shortVi : node.shortEn;
              const pillWidth = Math.max(76, labelText.length * 5.6 + 16);
              const pillY = isTopHalf ? -36 : 20;
              const textY = isTopHalf ? -24 : 32;

              return (
                <g
                  key={node.id}
                  className="constellation-leaf-node"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{
                    cursor: isDragging ? "grabbing" : "pointer",
                    opacity: isRankFilteredOut || isHoverDimmed ? 0.25 : 1,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, node.id)}
                  onPointerEnter={() => setHoveredNodeId(node.id)}
                  onPointerLeave={() => setHoveredNodeId(null)}
                  onClick={() => handleSelectSeedNode(node.id)}
                >
                  <g
                    className="leaf-breeze-wrapper"
                    style={{ animationDelay: `${(nodeIdx % 7) * 0.35}s` }}
                  >
                    {/* Botanical Crystal Leaf Silhouette */}
                    <path
                      d="M 0,-18 C 14,-12 16,4 0,18 C -16,4 -14,-12 0,-18 Z"
                      fill="#05140e"
                      stroke={isSelected || isHovered ? "#ffffff" : node.color}
                      strokeWidth={isSelected || isHovered ? "2.4" : "1.6"}
                    />
                    {/* Inner Leaf Vein */}
                    <path
                      d="M 0,-13 L 0,13 M 0,-3 L -6,-8 M 0,3 L 6,-2"
                      stroke={node.color}
                      strokeWidth="1"
                      strokeOpacity="0.42"
                      fill="none"
                    />

                    {/* Golden Spore Bud at Leaf Tip if linked to D1 articles */}
                    {node.articleCount > 0 && (
                      <circle
                        cx="12"
                        cy="-12"
                        r="4.2"
                        fill="#d9b36c"
                        stroke="#04100b"
                        strokeWidth="1"
                      />
                    )}

                    {/* Rank / D1 Code inside Leaf */}
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={rankColor}
                      fontSize="7.4"
                      fontWeight="800"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {isArticle ? "D1" : node.rank}
                    </text>

                    {/* High-Contrast Glass Pill Label for 100% Readability */}
                    <rect
                      x={-pillWidth / 2}
                      y={pillY}
                      width={pillWidth}
                      height="17"
                      rx="6"
                      fill="rgba(4, 13, 9, 0.88)"
                      stroke={isSelected || isHovered ? node.color : "rgba(24, 199, 133, 0.22)"}
                      strokeWidth={isSelected || isHovered ? "1.3" : "0.8"}
                    />
                    <text
                      x="0"
                      y={textY}
                      textAnchor="middle"
                      fill={isSelected || isHovered ? "#ffffff" : "#d8ebe1"}
                      fontSize="8.5"
                      fontWeight={isSelected || isHovered ? "700" : "600"}
                      fontFamily="Be Vietnam Pro, sans-serif"
                    >
                      {labelText}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Bottom Canvas Legend & Botanical Guide */}
          <div className="arboretum-canvas-footer">
            <div className="arboretum-rank-pills">
              <span className="arboretum-rank-chip">
                <i className="fa-solid fa-leaf" style={{ color: "#18c785" }} />
                <span>RANK S · Core Mastery</span>
              </span>
              <span className="arboretum-rank-chip">
                <i className="fa-solid fa-leaf" style={{ color: "#38bdf8" }} />
                <span>RANK A · Production Advanced</span>
              </span>
              <span className="arboretum-rank-chip">
                <i className="fa-solid fa-seedling" style={{ color: "#d9b36c" }} />
                <span>
                  ✦ {language === "vi" ? "Nụ bào tử bài học D1" : "D1 Lesson Spore"}
                </span>
              </span>
            </div>
            <span className="arboretum-drag-hint">
              <i className="fa-solid fa-hand-sparkles" aria-hidden="true" />
              <span>
                {language === "vi"
                  ? "Rê chuột dẫn nhựa · Kéo uốn cành cây · Nhấp lá xem bài học"
                  : "Hover for sap surge · Drag to bend boughs · Click leaves for D1 studies"}
              </span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Equal-Height Synaptic Node Dossier */}
        <aside className="arboretum-dossier-panel">
          {/* 1. Node Identity Header */}
          <div className="dossier-node-header">
            <div className="dossier-node-topline">
              <span className="dossier-domain-badge" style={{ color: inspectedDomainMeta.color }}>
                <i className={inspectedDomainMeta.icon} aria-hidden="true" />
                <span>
                  {language === "vi" ? inspectedDomainMeta.shortVi : inspectedDomainMeta.shortEn}
                </span>
              </span>
              <span
                className="dossier-rank-pill"
                style={{
                  borderColor: RANK_COLOR_MAP[inspectedSeed.rank as SkillRank],
                  color: RANK_COLOR_MAP[inspectedSeed.rank as SkillRank],
                }}
              >
                RANK {inspectedSeed.rank} · {inspectedSeed.level}%
              </span>
            </div>

            <h4 className="dossier-node-title">
              {language === "vi" ? inspectedSeed.name_vi : inspectedSeed.name_en}
            </h4>

            <p className="dossier-node-summary">
              {language === "vi" ? inspectedSeed.summary_vi : inspectedSeed.summary_en}
            </p>

            {/* Focus / Expand Bough Button */}
            <div className="dossier-focus-actions">
              {activeDomainId !== inspectedSeed.domain_id ? (
                <button
                  type="button"
                  className="dossier-focus-btn"
                  onClick={() => handleSelectDomainTab(inspectedSeed.domain_id)}
                >
                  <i className="fa-solid fa-tree" aria-hidden="true" />
                  <span>
                    {language === "vi"
                      ? `Tách riêng tán cây ${inspectedDomainMeta.shortVi}`
                      : `Isolate ${inspectedDomainMeta.shortEn} Canopy`}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="dossier-focus-btn dossier-focus-btn--active"
                  onClick={() => handleSelectDomainTab("ALL")}
                >
                  <i className="fa-solid fa-arrows-to-circle" aria-hidden="true" />
                  <span>
                    {language === "vi"
                      ? "Đang xem riêng nhánh này · Về Đại thụ 34 kỹ năng"
                      : "Canopy Isolated · Return to Full 34-Skill Tree"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Connected Sub-Branches (Leaves on this Bough) */}
          {clusterBranches.length > 0 && (
            <div className="dossier-section">
              <span className="dossier-section-label">
                {language === "vi"
                  ? `CÁC NHÁNH LÁ TRÊN CÀNH NÀY (${clusterBranches.length})`
                  : `CONNECTED LEAF BRANCHES (${clusterBranches.length})`}
              </span>
              <div className="dossier-subbranches-grid">
                {clusterBranches.map((branch) => {
                  const isCurrent = selectedNodeId === branch.id;
                  const short = SHORT_NODE_LABELS[branch.id] ?? {
                    en: branch.name_en,
                    vi: branch.name_vi,
                  };
                  const bCount = (directLinksByNode.get(branch.id) ?? []).length;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      className={`dossier-branch-chip ${isCurrent ? "is-selected" : ""}`}
                      onMouseEnter={() => setHoveredNodeId(branch.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => handleSelectSeedNode(branch.id)}
                    >
                      <span
                        className="chip-rank-dot"
                        style={{ background: RANK_COLOR_MAP[branch.rank as SkillRank] }}
                      />
                      <span className="chip-name">
                        {language === "vi" ? short.vi : short.en}
                      </span>
                      {bCount > 0 && <span className="chip-count">✦{bCount}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Scrollable Linked Cloudflare D1 Lessons & Case Studies */}
          <div className="dossier-section dossier-section--grow">
            <div className="dossier-section-head">
              <span className="dossier-section-label">
                {language === "vi"
                  ? `QUẢ TRI THỨC & BÀI HỌC D1 (${inspectedArticles.length})`
                  : `SPROUTED D1 KNOWLEDGE STUDIES (${inspectedArticles.length})`}
              </span>
            </div>

            {inspectedArticles.length > 0 ? (
              <div className="dossier-lessons-scroll">
                {inspectedArticles.map((art) => (
                  <a
                    key={art.slug}
                    href={`/blog/${art.slug}`}
                    className="dossier-lesson-card"
                  >
                    <div className="lesson-card-top">
                      <span className="lesson-rel-tag">✦ {art.relationship.replace(/_/g, " ")}</span>
                      <span className="lesson-cat-tag">{art.category}</span>
                    </div>
                    <strong className="lesson-card-title">
                      {language === "vi" ? art.titleVi : art.titleEn}
                    </strong>
                    <span className="lesson-card-cta">
                      <span>{language === "vi" ? "Đọc bài phân tích" : "Read technical study"}</span>
                      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="dossier-empty-lessons">
                <p>
                  {language === "vi"
                    ? "Nhánh kỹ năng này được chứng thực trực tiếp qua các hồ sơ dự án thực tế bên dưới."
                    : "This branch is verified directly through the production project dossiers below."}
                </p>
              </div>
            )}

            {/* Verified Production Dossiers */}
            <div className="dossier-proofs-wrap">
              <span className="dossier-section-label">
                {language === "vi" ? "HỒ SƠ DỰ ÁN THỰC CHIẾN" : "VERIFIED PRODUCTION DOSSIERS"}
              </span>
              <div className="dossier-proofs-list">
                {inspectedDomainMeta.proofs.map((proof, idx) => (
                  <a key={idx} href={proof.href} className="dossier-proof-link">
                    <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                    <span>{language === "vi" ? proof.labelVi : proof.labelEn}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Synchronized D1 Repository Footer */}
          <div className="dossier-footer-bar">
            <span className="dossier-footer-status">
              <i className="fa-solid fa-seedling" aria-hidden="true" />
              <span>
                {language === "vi"
                  ? `Đang lọc ${inspectedArticles.length} bài dưới Kho D1`
                  : `Filtering ${inspectedArticles.length} studies in D1 Repo`}
              </span>
            </span>
            <button
              type="button"
              className="dossier-scroll-repo-btn"
              onClick={handleScrollToD1Cards}
            >
              <span>{language === "vi" ? "Cuộn xuống Kho D1" : "View D1 Cards"}</span>
              <i className="fa-solid fa-arrow-down" aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
