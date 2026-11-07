/**
 * @name SkillGraphNetwork.tsx
 * @description Cohesive Cyber-Arboretum Synaptic Skill Graph (GraphDB) connected to the
 *              34-node skill taxonomy and 18 Cloudflare D1 Knowledge Base studies.
 *              Features two-level radial constellation geometry (Overview + Domain Focus),
 *              elastic spring drag physics, and an equal-height Synaptic Node Dossier.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { SkillRank } from "../../data/skill-matrix";
import type { KbIndexSummaryItem } from "./SkillTreeMatrix";
import {
  SEED_DOMAINS,
  SEED_NODES,
  SEED_EDGES,
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
  rank: SkillRank;
  level: number;
  domainId: string;
  parentId: string | null;
  originX: number;
  originY: number;
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

/**
 * Fallback human-readable titles for D1 article slugs if not present in kbItems.
 */
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

/**
 * Concise display labels for graph nodes so radial text never collides.
 */
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

export const SkillGraphNetwork: React.FC<SkillGraphNetworkProps> = ({
  language,
  onSelectSkill,
  kbItems = [],
  activeRankFilter = "ALL",
}) => {
  const [activeDomainId, setActiveDomainId] = useState<string>("ALL");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("asterisk-core");
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

  // Map of skill_node_id -> linked article slugs (including children if Hub)
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
      const direct = directLinksByNode.get(node.id) ?? [];
      for (const item of direct) {
        combined.set(item.slug, item.relationship);
      }
      const children = childrenByParentId.get(node.id) ?? [];
      for (const child of children) {
        const childLinks = directLinksByNode.get(child.id) ?? [];
        for (const item of childLinks) {
          if (!combined.has(item.slug)) {
            combined.set(item.slug, item.relationship);
          }
        }
      }
      // Also if hub is kafka-distributed, include redis-architecture articles in overview cluster
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

  // Build radial nodes & edges depending on activeDomainId ("ALL" vs specific domain)
  const { graphNodes, graphEdges } = useMemo(() => {
    const cx = 400;
    const cy = 300;
    const nodes: PositionedGraphNode[] = [];
    const edges: PositionedEdge[] = [];

    if (activeDomainId === "ALL") {
      // 1. Center Core Node
      nodes.push({
        id: "d1-core",
        kind: "CORE",
        labelEn: "D1 KNOWLEDGE CORE",
        labelVi: "LÕI ĐỒ THỊ D1",
        shortEn: "D1 GRAPH\n34 SKILLS",
        shortVi: "ĐỒ THỊ D1\n34 KỸ NĂNG",
        rank: "S",
        level: 100,
        domainId: "ALL",
        parentId: null,
        originX: cx,
        originY: cy,
        color: "#18c785",
        articleCount: articleBySlug.size,
      });

      // 2. 6 Primary Orbital Hubs at r = 126
      const overviewHubs: {
        id: string;
        angle: number;
        color: string;
        leaves: { id: string; angle: number }[];
      }[] = [
        {
          id: "asterisk-core",
          angle: 210,
          color: "#18c785",
          leaves: [
            { id: "asterisk-webrtc", angle: 180 },
            { id: "asterisk-stasis-voicebot", angle: 200 },
            { id: "asterisk-cdr-ami", angle: 220 },
            { id: "asterisk-pjsip-trunk", angle: 240 },
          ],
        },
        {
          id: "telecom-ba",
          angle: 270,
          color: "#d9b36c",
          leaves: [
            { id: "poc-validation", angle: 260 },
            { id: "telephony-3cx", angle: 280 },
          ],
        },
        {
          id: "voicebot-pipecat",
          angle: 330,
          color: "#a855f7",
          leaves: [
            { id: "pipecat-stt-tts", angle: 300 },
            { id: "pipecat-barge-in", angle: 320 },
            { id: "pipecat-vad-latency", angle: 340 },
            { id: "langgraph-rag", angle: 360 },
          ],
        },
        {
          id: "kafka-distributed",
          angle: 30,
          color: "#38bdf8",
          leaves: [
            { id: "kafka-partitions", angle: 20 },
            { id: "kafka-consumer-groups", angle: 40 },
            { id: "redis-architecture", angle: 60 },
          ],
        },
        {
          id: "cloudflare-edge",
          angle: 90,
          color: "#f59e0b",
          leaves: [
            { id: "linux-sysadmin", angle: 80 },
            { id: "astro-modern", angle: 100 },
          ],
        },
        {
          id: "mobile-ecosystem",
          angle: 150,
          color: "#06b6d4",
          leaves: [
            { id: "mobile-flutter", angle: 120 },
            { id: "mobile-react-native", angle: 134 },
            { id: "mobile-swift", angle: 148 },
            { id: "mobile-kotlin", angle: 162 },
          ],
        },
      ];

      for (const hubCfg of overviewHubs) {
        const seed = SEED_NODES.find((n) => n.id === hubCfg.id);
        if (!seed) continue;
        const pos = polarToCartesian(cx, cy, 126, hubCfg.angle);
        const short = SHORT_NODE_LABELS[seed.id] ?? { en: seed.name_en, vi: seed.name_vi };
        const count = (aggregatedLinksByNode.get(seed.id) ?? []).length;

        nodes.push({
          id: seed.id,
          kind: "HUB",
          labelEn: seed.name_en,
          labelVi: seed.name_vi,
          shortEn: short.en,
          shortVi: short.vi,
          rank: seed.rank as SkillRank,
          level: seed.level,
          domainId: seed.domain_id,
          parentId: "d1-core",
          originX: pos.x,
          originY: pos.y,
          color: hubCfg.color,
          articleCount: count,
        });

        edges.push({
          id: `core-${seed.id}`,
          from: "d1-core",
          to: seed.id,
          color: hubCfg.color,
          isPrimary: true,
        });

        for (const leafCfg of hubCfg.leaves) {
          const leafSeed = SEED_NODES.find((n) => n.id === leafCfg.id);
          if (!leafSeed) continue;
          const leafPos = polarToCartesian(cx, cy, 240, leafCfg.angle);
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
            rank: leafSeed.rank as SkillRank,
            level: leafSeed.level,
            domainId: leafSeed.domain_id,
            parentId: seed.id,
            originX: leafPos.x,
            originY: leafPos.y,
            color: hubCfg.color,
            articleCount: leafCount,
          });

          edges.push({
            id: `edge-${seed.id}-${leafSeed.id}`,
            from: seed.id,
            to: leafSeed.id,
            color: hubCfg.color,
            isPrimary: false,
          });
        }
      }
    } else {
      // DOMAIN FOCUS MODE: Center is the Domain Core, Ring 1 = All Skill Nodes of Domain, Ring 2 = Connected D1 Articles
      const domainMeta = DOMAIN_META[activeDomainId] ?? DOMAIN_META.voip;
      const domainSkills = SEED_NODES.filter((n) => n.domain_id === activeDomainId);

      nodes.push({
        id: `domain-core-${activeDomainId}`,
        kind: "CORE",
        labelEn: domainMeta.shortEn.toUpperCase(),
        labelVi: domainMeta.shortVi.toUpperCase(),
        shortEn: `${activeDomainId.toUpperCase()}\n${domainSkills.length} NODES`,
        shortVi: `${activeDomainId.toUpperCase()}\n${domainSkills.length} KỸ NĂNG`,
        rank: "S",
        level: 96,
        domainId: activeDomainId,
        parentId: null,
        originX: cx,
        originY: cy,
        color: domainMeta.color,
        articleCount: 0,
      });

      const skillCount = Math.max(domainSkills.length, 1);
      const uniqueArticles = new Map<string, string[]>(); // slug -> connected skillIds

      domainSkills.forEach((skill, idx) => {
        const angle = -90 + (idx * 360) / skillCount;
        const pos = polarToCartesian(cx, cy, 138, angle);
        const short = SHORT_NODE_LABELS[skill.id] ?? { en: skill.name_en, vi: skill.name_vi };
        const directLinks = directLinksByNode.get(skill.id) ?? [];

        nodes.push({
          id: skill.id,
          kind: skill.node_type === "HUB" ? "HUB" : "BRANCH",
          labelEn: skill.name_en,
          labelVi: skill.name_vi,
          shortEn: short.en,
          shortVi: short.vi,
          rank: skill.rank as SkillRank,
          level: skill.level,
          domainId: skill.domain_id,
          parentId: `domain-core-${activeDomainId}`,
          originX: pos.x,
          originY: pos.y,
          color: domainMeta.color,
          articleCount: directLinks.length,
        });

        edges.push({
          id: `dom-${skill.id}`,
          from: `domain-core-${activeDomainId}`,
          to: skill.id,
          color: domainMeta.color,
          isPrimary: true,
        });

        for (const link of directLinks) {
          const list = uniqueArticles.get(link.slug) ?? [];
          list.push(skill.id);
          uniqueArticles.set(link.slug, list);
        }
      });

      // Outer ring: Actual D1 Lesson Nodes
      const articleEntries = Array.from(uniqueArticles.entries());
      const artCount = Math.max(articleEntries.length, 1);
      articleEntries.forEach(([slug, parentSkillIds], idx) => {
        const angle = -75 + (idx * 360) / artCount;
        const pos = polarToCartesian(cx, cy, 245, angle);
        const artMeta = articleBySlug.get(slug);
        const shortSlug = slug
          .replace(/^asterisk-/, "ast-")
          .replace(/^voicebot-/, "bot-")
          .slice(0, 18);

        const artNodeId = `art-${slug}`;
        nodes.push({
          id: artNodeId,
          kind: "ARTICLE",
          labelEn: artMeta?.titleEn ?? slug,
          labelVi: artMeta?.titleVi ?? slug,
          shortEn: `📄 ${shortSlug}`,
          shortVi: `📄 ${shortSlug}`,
          rank: "S",
          level: 100,
          domainId: activeDomainId,
          parentId: parentSkillIds[0],
          originX: pos.x,
          originY: pos.y,
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
          });
        }
      });
    }

    return { graphNodes: nodes, graphEdges: edges };
  }, [activeDomainId, aggregatedLinksByNode, directLinksByNode, articleBySlug]);

  // Physics positions state synchronized with graphNodes
  const [positions, setPositions] = useState<Record<string, NodePhysicsPos>>({});

  useEffect(() => {
    const next: Record<string, NodePhysicsPos> = {};
    for (const n of graphNodes) {
      next[n.id] = { x: n.originX, y: n.originY, vx: 0, vy: 0 };
    }
    setPositions(next);
  }, [graphNodes]);

  // Elastic spring animation loop when dragging/releasing
  useEffect(() => {
    let animId: number;
    let running = false;

    const step = () => {
      setPositions((prev) => {
        let moving = false;
        const next: Record<string, NodePhysicsPos> = {};
        const k = 0.1;
        const damping = 0.76;

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

  // Stardust spores in background
  const bioSpores = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      cx: ((i * 43) % 760) + 20,
      cy: ((i * 61) % 560) + 20,
      r: 0.9 + ((i * 7) % 14) / 10,
      delay: ((i * 11) % 30) / 10,
      dur: 2.8 + ((i * 13) % 20) / 10,
    }));
  }, []);

  // Currently inspected skill seed from SEED_NODES
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

  // Sub-branches / related nodes in the same cluster
  const clusterBranches = useMemo(() => {
    const parentHubId = inspectedSeed.parent_id ?? inspectedSeed.id;
    const children = SEED_NODES.filter(
      (n) => n.parent_id === parentHubId || (n.domain_id === inspectedSeed.domain_id && n.id !== parentHubId)
    );
    return children;
  }, [inspectedSeed]);

  // Linked D1 articles for the currently inspected skill
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

  // Select a skill node and broadcast to the D1 repository filter
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

  // Switch domain filter tab
  const handleSelectDomainTab = useCallback(
    (domainId: string) => {
      setActiveDomainId(domainId);
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
        // Ignore if not captured
      }
      draggedNodeRef.current = null;
      setIsDragging(false);
    }
  }, []);

  const handleResetGraph = useCallback(() => {
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

  return (
    <div className="arboretum-graph-shell" data-skill-constellation>
      {/* Unified Domain Branch Selector Bar (Cohesive with Cyber-Arboretum Matrix) */}
      <div className="arboretum-graph__domain-bar" role="tablist" aria-label="Skill graph domains">
        <div className="arboretum-graph__tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeDomainId === "ALL"}
            className={`domain-tab ${activeDomainId === "ALL" ? "is-active" : ""}`}
            onClick={() => handleSelectDomainTab("ALL")}
          >
            <i className="fa-solid fa-circle-nodes" aria-hidden="true" />
            <span className="domain-tab__label">
              {language === "vi" ? "Toàn cảnh Đồ thị" : "All Domains"}
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
          title={language === "vi" ? "Đặt lại tọa độ các nút" : "Reset node coordinates"}
        >
          <i className="fa-solid fa-arrows-rotate" aria-hidden="true" />
          <span>{language === "vi" ? "Cân bằng" : "Reset"}</span>
        </button>
      </div>

      {/* Equal-Height 2-Column Workspace: Left Radial Synaptic Map + Right Node Dossier */}
      <div className="arboretum-graph__workspace">
        {/* LEFT COLUMN: Interactive Radial Synaptic Graph */}
        <div className="arboretum-canvas-panel">
          <div className="arboretum-canvas-topbar">
            <span className="canvas-telemetry-tag">
              <span className="canvas-telemetry-dot" />
              {activeDomainId === "ALL"
                ? language === "vi"
                  ? "CHẾ ĐỘ TOÀN CẢNH // 6 CỤM TRỤ CỘT & 18 NHÁNH TIÊU BIỂU"
                  : "OVERVIEW TOPOLOGY // 6 PRIMARY HUBS & 18 SUB-BRANCHES"
                : language === "vi"
                  ? `CHẾ ĐỘ PHÓNG TO NHÁNH // ${inspectedDomainMeta.shortVi.toUpperCase()}`
                  : `CLUSTER FOCUS // ${inspectedDomainMeta.shortEn.toUpperCase()}`}
            </span>

            {activeDomainId !== "ALL" && (
              <button
                type="button"
                className="canvas-back-overview-btn"
                onClick={() => handleSelectDomainTab("ALL")}
              >
                <i className="fa-solid fa-compress" aria-hidden="true" />
                <span>{language === "vi" ? "Xem toàn bộ 34 kỹ năng" : "Back to Full Graph"}</span>
              </button>
            )}
          </div>

          <svg
            ref={svgRef}
            className="arboretum-svg"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <radialGradient id="arboretumCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#18c785" stopOpacity="0.22" />
                <stop offset="65%" stopColor="#18c785" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#18c785" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="activeNodeHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#18c785" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#18c785" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Bioluminescent Forest Center Glow */}
            <circle cx="400" cy="300" r="275" fill="url(#arboretumCenterGlow)" />

            {/* Bioluminescent Spores */}
            {bioSpores.map((s) => (
              <circle
                key={s.id}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill="rgba(110, 231, 183, 0.45)"
                className="stardust-particle"
                style={{
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${s.dur}s`,
                }}
              />
            ))}

            {/* Concentric Cyber-Arboretum Radar Rings */}
            <circle
              cx="400"
              cy="300"
              r="128"
              fill="none"
              stroke="rgba(24, 199, 133, 0.16)"
              strokeDasharray="4 5"
            />
            <circle
              cx="400"
              cy="300"
              r="240"
              fill="none"
              stroke="rgba(217, 179, 108, 0.14)"
              strokeDasharray="3 6"
            />
            <line
              x1="400"
              y1="25"
              x2="400"
              y2="575"
              stroke="rgba(24, 199, 133, 0.05)"
              strokeDasharray="2 6"
            />
            <line
              x1="80"
              y1="300"
              x2="720"
              y2="300"
              stroke="rgba(24, 199, 133, 0.05)"
              strokeDasharray="2 6"
            />

            {/* Synaptic Edges */}
            {graphEdges.map((edge) => {
              const p1 = positions[edge.from];
              const p2 = positions[edge.to];
              if (!p1 || !p2) return null;

              const isHighlighted =
                selectedNodeId === edge.from ||
                selectedNodeId === edge.to ||
                (inspectedSeed.parent_id === edge.from && inspectedSeed.id === edge.to);

              const pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

              return (
                <g key={edge.id}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={edge.color}
                    strokeWidth={edge.isPrimary ? (isHighlighted ? "2.6" : "1.8") : isHighlighted ? "2.2" : "1.2"}
                    strokeOpacity={isHighlighted ? "0.95" : edge.isPrimary ? "0.65" : "0.38"}
                    strokeDasharray={edge.isPrimary || isHighlighted ? undefined : "3 3"}
                  />
                  {(edge.isPrimary || isHighlighted) && (
                    <circle r={edge.isPrimary ? "3" : "2.2"} fill="#a7f3d0">
                      <animateMotion
                        path={pathD}
                        dur={edge.isPrimary ? "2.4s" : "2.9s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Render Graph Nodes */}
            {graphNodes.map((node) => {
              const pos = positions[node.id] ?? { x: node.originX, y: node.originY };
              const isSelected =
                selectedNodeId === node.id ||
                (node.kind === "HUB" && inspectedSeed.parent_id === node.id);
              const isDimmed =
                activeRankFilter !== "ALL" &&
                node.kind !== "CORE" &&
                node.kind !== "ARTICLE" &&
                node.rank !== activeRankFilter;

              if (node.kind === "CORE") {
                const lines = (language === "vi" ? node.shortVi : node.shortEn).split("\n");
                return (
                  <g
                    key={node.id}
                    className="constellation-core-node"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    onPointerDown={(e) => handlePointerDown(e, node.id)}
                    onClick={() => handleSelectSeedNode(node.id)}
                  >
                    <polygon
                      points="0,-38 33,-19 33,19 0,38 -33,19 -33,-19"
                      fill="none"
                      stroke="#18c785"
                      strokeWidth="2"
                      className="core-beacon-ring"
                    />
                    <polygon
                      points="0,-31 27,-15.5 27,15.5 0,31 -27,15.5 -27,-15.5"
                      fill="#05130e"
                      stroke="#d9b36c"
                      strokeWidth="1.4"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="800"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {lines[0]}
                    </text>
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fill="#6ee7b7"
                      fontSize="8"
                      fontWeight="600"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {lines[1] ?? ""}
                    </text>
                  </g>
                );
              }

              if (node.kind === "HUB") {
                const rankColor = RANK_COLOR_MAP[node.rank] ?? "#18c785";
                return (
                  <g
                    key={node.id}
                    className="constellation-hub-node"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{
                      cursor: isDragging ? "grabbing" : "grab",
                      opacity: isDimmed ? 0.3 : 1,
                    }}
                    onPointerDown={(e) => handlePointerDown(e, node.id)}
                    onClick={() => handleSelectSeedNode(node.id)}
                  >
                    {isSelected && (
                      <circle cx="0" cy="0" r="42" fill="url(#activeNodeHalo)" className="hub-pulse-aura" />
                    )}
                    <circle
                      cx="0"
                      cy="0"
                      r="30"
                      fill="#06130e"
                      stroke={node.color}
                      strokeWidth={isSelected ? "2.6" : "1.8"}
                      strokeDasharray={isSelected ? "4 3" : undefined}
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="23"
                      fill={node.color}
                      fillOpacity={isSelected ? "0.28" : "0.14"}
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8.5"
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
                      fontSize="7.5"
                      fontWeight="700"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      RANK {node.rank} · {node.articleCount} D1
                    </text>
                  </g>
                );
              }

              // BRANCH or ARTICLE node on outer orbit
              const isArticle = node.kind === "ARTICLE";
              const rankColor = isArticle ? "#d9b36c" : RANK_COLOR_MAP[node.rank] ?? node.color;
              const isTopHalf = pos.y < 300;

              return (
                <g
                  key={node.id}
                  className="constellation-leaf-node"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{
                    cursor: isDragging ? "grabbing" : "pointer",
                    opacity: isDimmed ? 0.25 : 1,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, node.id)}
                  onClick={() => handleSelectSeedNode(node.id)}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? "17" : "14"}
                    fill="#05110d"
                    stroke={isSelected ? "#ffffff" : node.color}
                    strokeWidth={isSelected ? "2.4" : "1.5"}
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={rankColor}
                    fontSize="7.5"
                    fontWeight="800"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {isArticle ? "D1" : `R-${node.rank}`}
                  </text>
                  <text
                    x="0"
                    y={isTopHalf ? "-20" : "26"}
                    textAnchor="middle"
                    fill={isSelected ? "#ffffff" : "#d8ebe1"}
                    fontSize="8.8"
                    fontWeight={isSelected ? "700" : "600"}
                    fontFamily="Be Vietnam Pro, sans-serif"
                  >
                    {language === "vi" ? node.shortVi : node.shortEn}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Canvas Legend & Interaction Guide */}
          <div className="arboretum-canvas-footer">
            <div className="arboretum-rank-pills">
              <span className="arboretum-rank-chip">
                <i className="fa-solid fa-circle" style={{ color: "#18c785" }} />
                <span>RANK S · Core Mastery</span>
              </span>
              <span className="arboretum-rank-chip">
                <i className="fa-solid fa-circle" style={{ color: "#38bdf8" }} />
                <span>RANK A · Production Advanced</span>
              </span>
              <span className="arboretum-rank-chip">
                <i className="fa-solid fa-circle" style={{ color: "#a855f7" }} />
                <span>RANK B · Applied</span>
              </span>
            </div>
            <span className="arboretum-drag-hint">
              <i className="fa-solid fa-hand-pointer" aria-hidden="true" />
              <span>
                {language === "vi"
                  ? "Kéo thả các nút · Nhấp vào kỹ năng để xem bài học D1"
                  : "Drag nodes freely · Click any skill to inspect D1 lessons"}
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

            {/* Focus / Expand Cluster Button */}
            <div className="dossier-focus-actions">
              {activeDomainId !== inspectedSeed.domain_id ? (
                <button
                  type="button"
                  className="dossier-focus-btn"
                  onClick={() => handleSelectDomainTab(inspectedSeed.domain_id)}
                >
                  <i className="fa-solid fa-magnifying-glass-plus" aria-hidden="true" />
                  <span>
                    {language === "vi"
                      ? `Mở rộng toàn bộ nhánh ${inspectedDomainMeta.shortVi}`
                      : `Focus all ${inspectedDomainMeta.shortEn} branches`}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="dossier-focus-btn dossier-focus-btn--active"
                  onClick={() => handleSelectDomainTab("ALL")}
                >
                  <i className="fa-solid fa-table-cells" aria-hidden="true" />
                  <span>
                    {language === "vi"
                      ? "Đang phóng to nhánh này · Quay lại Toàn cảnh"
                      : "Cluster Focused · Return to Full Constellation"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Connected Sub-Branches in this Cluster */}
          {clusterBranches.length > 0 && (
            <div className="dossier-section">
              <span className="dossier-section-label">
                {language === "vi"
                  ? `NHÁNH KỸ NĂNG CON TRONG CỤM (${clusterBranches.length})`
                  : `CONNECTED SUB-BRANCHES (${clusterBranches.length})`}
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
                      onClick={() => handleSelectSeedNode(branch.id)}
                    >
                      <span
                        className="chip-rank-dot"
                        style={{ background: RANK_COLOR_MAP[branch.rank as SkillRank] }}
                      />
                      <span className="chip-name">
                        {language === "vi" ? short.vi : short.en}
                      </span>
                      {bCount > 0 && <span className="chip-count">{bCount}</span>}
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
                  ? `BÀI HỌC & NGHIÊN CỨU TRONG D1 (${inspectedArticles.length})`
                  : `LINKED D1 KNOWLEDGE STUDIES (${inspectedArticles.length})`}
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
                      <span className="lesson-rel-tag">{art.relationship.replace(/_/g, " ")}</span>
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
                    ? "Kỹ năng này được chứng thực trực tiếp qua các hồ sơ dự án thực tế bên dưới."
                    : "This capability is verified directly through the production project dossiers below."}
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
              <i className="fa-solid fa-database" aria-hidden="true" />
              <span>
                {language === "vi"
                  ? `Đồng bộ lọc ${inspectedArticles.length} bài dưới Kho D1`
                  : `Synced ${inspectedArticles.length} studies in D1 Repo`}
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
