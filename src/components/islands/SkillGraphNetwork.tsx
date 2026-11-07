/**
 * @name SkillGraphNetwork.tsx
 * @description Living Cyber-Arboretum Root & Canopy Tree (GraphDB Orchestrator):
 *              - Coordinates state, physics simulation, node/edge topology computation.
 *              - Composes modular sub-components (Tabs, Toolbar, SvgCanvas, Dossier, Tooltip, Footer).
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { SkillRank } from "../../data/skill-matrix";
import {
  SEED_DOMAINS,
  SEED_NODES,
  SEED_ARTICLE_LINKS,
  type SkillNodeSeed,
} from "../../lib/data/skill-graph-seed";

import {
  type SkillGraphNetworkProps,
  type PositionedGraphNode,
  type PositionedEdge,
  type NodePhysicsPos,
  DOMAIN_META,
  ARTICLE_TITLE_FALLBACKS,
  SHORT_NODE_LABELS,
  polarToCartesian,
  ArboretumDomainTabs,
  ArboretumToolbar,
  ArboretumTooltip,
  ArboretumFooter,
  ArboretumSvgCanvas,
  ArboretumDossier,
} from "./skill-graph";

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
          id: `edge-core-${seed.id}`,
          from: "d1-core",
          to: seed.id,
          color: hubCfg.color,
          isPrimary: true,
          curveBend: hubCfg.bend,
        });

        for (const leafCfg of hubCfg.leaves) {
          const leafSeed = SEED_NODES.find((n) => n.id === leafCfg.id);
          if (!leafSeed) continue;
          const leafPos = polarToCartesian(cx, cy, 218, leafCfg.angle);
          const leafShort = SHORT_NODE_LABELS[leafSeed.id] ?? {
            en: leafSeed.name_en,
            vi: leafSeed.name_vi,
          };
          const leafCount = (directLinksByNode.get(leafSeed.id) ?? []).length;

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
      dur: `${2.8 + ((i * 13) % 24) / 10}s`,
      delay: `${((i * 9) % 28) / 10}s`,
      maxOpacity: 0.35 + ((i * 5) % 45) / 100,
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
    const parentHubId = inspectedSeed.node_type === "HUB" ? inspectedSeed.id : inspectedSeed.parent_id;
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
      {/* 1. Unified Domain Branch Selector Bar */}
      <ArboretumDomainTabs
        language={language}
        activeDomainId={activeDomainId}
        onSelectDomainTab={handleSelectDomainTab}
        onResetGraph={handleResetGraph}
      />

      {/* 2. Equal-Height 2-Column Workspace: Left Organic Tree + Right Synaptic Dossier */}
      <div className="arboretum-graph__workspace">
        {/* LEFT COLUMN: Organic Tree Canvas */}
        <div className="arboretum-canvas-panel">
          <ArboretumToolbar
            language={language}
            breezeEnabled={breezeEnabled}
            onToggleBreeze={() => setBreezeEnabled((v) => !v)}
            zoom={zoom}
            onZoomChange={setZoom}
            activeDomainId={activeDomainId}
            onSelectDomainTab={handleSelectDomainTab}
          />

          <ArboretumTooltip
            language={language}
            hoveredGraphNode={hoveredGraphNode}
          />

          <ArboretumSvgCanvas
            svgRef={svgRef}
            breezeEnabled={breezeEnabled}
            viewBoxStr={viewBoxStr}
            graphNodes={graphNodes}
            graphEdges={graphEdges}
            positions={positions}
            bioSpores={bioSpores}
            activeLineageSet={activeLineageSet}
            hoveredNodeId={hoveredNodeId}
            selectedNodeId={selectedNodeId}
            inspectedSeed={inspectedSeed}
            activeRankFilter={activeRankFilter}
            language={language}
            isDragging={isDragging}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onNodePointerDown={handlePointerDown}
            onNodePointerEnter={setHoveredNodeId}
            onNodePointerLeave={() => setHoveredNodeId(null)}
            onSelectNode={handleSelectSeedNode}
          />

          <ArboretumFooter language={language} />
        </div>

        {/* RIGHT COLUMN: Equal-Height Synaptic Node Dossier */}
        <ArboretumDossier
          language={language}
          inspectedSeed={inspectedSeed}
          inspectedDomainMeta={inspectedDomainMeta}
          activeDomainId={activeDomainId}
          selectedNodeId={selectedNodeId}
          clusterBranches={clusterBranches}
          inspectedArticles={inspectedArticles}
          directLinksByNode={directLinksByNode}
          onSelectDomainTab={handleSelectDomainTab}
          onSelectNode={handleSelectSeedNode}
          onHoverNode={setHoveredNodeId}
          onScrollToD1Cards={handleScrollToD1Cards}
        />
      </div>
    </div>
  );
};

export default SkillGraphNetwork;
