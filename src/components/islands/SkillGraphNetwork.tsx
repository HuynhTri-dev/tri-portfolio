/**
 * @name SkillGraphNetwork.tsx
 * @description Interactive Cyber-Arboretum Skill Knowledge Graph component visualizing
 *              domain hubs, sub-branches (Asterisk, Mobile, Kafka, Voicebots, etc.),
 *              F->S ranks, and direct two-way connections to Cloudflare D1 Knowledge Base articles.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SEED_DOMAINS,
  SEED_NODES,
  SEED_EDGES,
  SEED_ARTICLE_LINKS,
  type SkillDomainSeed,
  type SkillNodeSeed,
  type SkillGraphEdgeSeed,
} from "../../lib/data/skill-graph-seed";
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

export const SkillGraphNetwork: React.FC<SkillGraphNetworkProps> = ({
  language,
  onSelectSkill,
  selectedSkillId,
}) => {
  const [activeDomain, setActiveDomain] = useState<string>("ALL");
  const [expandedHubId, setExpandedHubId] = useState<string>("asterisk-core");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [apiNodes, setApiNodes] = useState<any[] | null>(null);

  // Fetch live topology from /api/kb/graph on mount for real-time D1 hydration
  useEffect(() => {
    let mounted = true;
    fetch("/api/kb/graph")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (mounted && payload?.data?.nodes) {
          setApiNodes(payload.data.nodes);
        }
      })
      .catch(() => {
        // Fallback gracefully to SEED_NODES
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Map nodes with linked articles
  const nodes = useMemo(() => {
    const rawNodes = apiNodes || SEED_NODES;
    return rawNodes.map((n) => {
      const links = SEED_ARTICLE_LINKS.filter((l) => l.skill_node_id === n.id);
      return {
        ...n,
        linkedArticleSlugs: links.map((l) => l.article_slug),
      };
    });
  }, [apiNodes]);

  const hubs = useMemo(() => {
    return nodes.filter((n) => n.node_type === "HUB");
  }, [nodes]);

  const branchesByHub = useMemo(() => {
    const map = new Map<string, typeof nodes>();
    for (const hub of hubs) {
      map.set(
        hub.id,
        nodes.filter((n) => n.parent_id === hub.id)
      );
    }
    return map;
  }, [nodes, hubs]);

  // Filter hubs based on domain tab & search
  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) => {
      const matchDomain = activeDomain === "ALL" || hub.domain_id === activeDomain;
      if (!matchDomain) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const branches = branchesByHub.get(hub.id) || [];
      const matchHubText =
        hub.name_en.toLowerCase().includes(q) ||
        hub.name_vi.toLowerCase().includes(q) ||
        (hub.summary_en || "").toLowerCase().includes(q) ||
        (hub.summary_vi || "").toLowerCase().includes(q);

      const matchBranchText = branches.some(
        (b) =>
          b.name_en.toLowerCase().includes(q) ||
          b.name_vi.toLowerCase().includes(q) ||
          b.linkedArticleSlugs.some((s) => s.toLowerCase().includes(q))
      );

      return matchHubText || matchBranchText;
    });
  }, [hubs, activeDomain, searchQuery, branchesByHub]);

  // Selected or Active Node Inspector
  const activeNode = useMemo(() => {
    if (!selectedSkillId) {
      return nodes.find((n) => n.id === expandedHubId) || hubs[0];
    }
    return nodes.find((n) => n.id === selectedSkillId) || hubs[0];
  }, [nodes, selectedSkillId, expandedHubId, hubs]);

  const activeDomainMeta = useMemo(() => {
    if (!activeNode) return SEED_DOMAINS[0];
    return SEED_DOMAINS.find((d) => d.id === activeNode.domain_id) || SEED_DOMAINS[0];
  }, [activeNode]);

  const handleNodeClick = useCallback(
    (node: typeof nodes[0]) => {
      if (node.node_type === "HUB") {
        setExpandedHubId(node.id);
      } else if (node.parent_id) {
        setExpandedHubId(node.parent_id);
      }

      const matchedSlugs = node.linkedArticleSlugs || [];
      onSelectSkill({
        skillId: node.id,
        skillNameEn: node.name_en,
        skillNameVi: node.name_vi,
        rank: (node.rank as SkillRank) || "S",
        domain: node.domain_id,
        matchedSlugs,
        proofs: [
          {
            labelEn: `Knowledge Base / ${node.name_en}`,
            labelVi: `Kho Tri thức / ${node.name_vi}`,
            href: `/blog/${matchedSlugs[0] || ""}`,
          },
        ],
      });
    },
    [onSelectSkill]
  );

  const handleResetFilter = useCallback(() => {
    onSelectSkill({
      skillId: null,
      skillNameEn: "",
      skillNameVi: "",
      rank: null,
      domain: null,
      matchedSlugs: [],
      proofs: [],
    });
  }, [onSelectSkill]);

  return (
    <div className="skill-graph-net" data-skill-graph-container>
      {/* Search & Domain Filter Toolbar */}
      <div className="skill-graph-net__toolbar">
        <div className="skill-graph-net__search-wrap">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="text"
            className="skill-graph-net__search-input"
            placeholder={
              language === "vi"
                ? "Tra cứu kỹ năng, nhánh con (ví dụ: asterisk, webrtc, flutter, kafka, voicebot...)"
                : "Search skills & sub-branches (e.g. asterisk, webrtc, flutter, kafka, voicebot...)"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="skill-graph-net__search-clear"
              onClick={() => setSearchQuery("")}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Domain filter pills */}
        <div className="skill-graph-net__domain-pills" role="tablist">
          <button
            type="button"
            className={`domain-pill ${activeDomain === "ALL" ? "domain-pill--active" : ""}`}
            onClick={() => setActiveDomain("ALL")}
          >
            {language === "vi" ? "Tất Cả Phân Hệ (All)" : "All Domains"}
          </button>
          {SEED_DOMAINS.map((domain) => (
            <button
              key={domain.id}
              type="button"
              className={`domain-pill ${activeDomain === domain.id ? "domain-pill--active" : ""}`}
              style={
                {
                  "--pill-color": domain.color_hex,
                } as React.CSSProperties
              }
              onClick={() => setActiveDomain(domain.id)}
            >
              {language === "vi" ? domain.name_vi : domain.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Graph Viewport */}
      <div className="skill-graph-net__viewport">
        {/* Hub Cluster List (Left/Main Orbit) */}
        <div className="skill-graph-net__clusters">
          {filteredHubs.map((hub) => {
            const isExpanded = expandedHubId === hub.id;
            const isSelected = selectedSkillId === hub.id;
            const branches = branchesByHub.get(hub.id) || [];
            const domainColor =
              SEED_DOMAINS.find((d) => d.id === hub.domain_id)?.color_hex || "#18c785";

            return (
              <div
                key={hub.id}
                className={`graph-cluster ${isExpanded ? "graph-cluster--expanded" : ""} ${
                  isSelected ? "graph-cluster--selected" : ""
                }`}
                style={{ "--cluster-color": domainColor } as React.CSSProperties}
              >
                {/* Core Hub Node Button */}
                <button
                  type="button"
                  className="graph-node graph-node--hub"
                  onClick={() => handleNodeClick(hub)}
                >
                  <div className="graph-node__glyph">
                    <i className={hub.icon || "fa-solid fa-circle-nodes"} aria-hidden="true" />
                  </div>
                  <div className="graph-node__meta">
                    <div className="graph-node__kicker">
                      <span>HUB</span>
                      <span className="graph-node__rank-tag">RANK {hub.rank}</span>
                    </div>
                    <strong className="graph-node__title">
                      {language === "vi" ? hub.name_vi : hub.name_en}
                    </strong>
                    <span className="graph-node__sub">
                      {branches.length} {language === "vi" ? "nhánh con" : "sub-branches"}
                    </span>
                  </div>
                  <div className="graph-node__orbit-ring" />
                </button>

                {/* Sub-branches Constellation (Expanding under or around hub) */}
                {isExpanded && branches.length > 0 && (
                  <div className="graph-branches-grid">
                    <div className="graph-branches__conduit" aria-hidden="true" />
                    {branches.map((branch) => {
                      const isBranchSelected = selectedSkillId === branch.id;
                      const hasArticles = branch.linkedArticleSlugs.length > 0;

                      return (
                        <button
                          key={branch.id}
                          type="button"
                          className={`graph-node graph-node--branch ${
                            isBranchSelected ? "graph-node--selected" : ""
                          }`}
                          onClick={() => handleNodeClick(branch)}
                        >
                          <div className="graph-node__branch-head">
                            <span className="graph-node__rank-pill">RANK {branch.rank}</span>
                            {hasArticles && (
                              <span className="graph-node__lesson-tag">
                                <i className="fa-solid fa-book-bookmark" />
                                {branch.linkedArticleSlugs.length}{" "}
                                {language === "vi" ? "bài học" : "lessons"}
                              </span>
                            )}
                          </div>
                          <div className="graph-node__branch-body">
                            <i className={branch.icon || "fa-solid fa-code-branch"} />
                            <span>{language === "vi" ? branch.name_vi : branch.name_en}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tactical Node Inspector HUD (Right Dock) */}
        {activeNode && (
          <aside className="skill-graph-net__inspector panel">
            <div className="inspector-head">
              <span className="inspector-kicker">
                <i className="fa-solid fa-microchip" />
                <span>
                  {language === "vi" ? "THÔNG SỐ NÚT KỸ NĂNG" : "NODE TELEMETRY INSPECTOR"}
                </span>
              </span>
              <span
                className={`exp-rank-crest exp-rank-crest--${(activeNode.rank || "s").toLowerCase()}`}
              >
                <small>RANK</small>
                <strong>{activeNode.rank}</strong>
              </span>
            </div>

            <h4 className="inspector-title">
              {language === "vi" ? activeNode.name_vi : activeNode.name_en}
            </h4>
            <span
              className="inspector-domain"
              style={{ color: activeDomainMeta.color_hex }}
            >
              {language === "vi" ? activeDomainMeta.name_vi : activeDomainMeta.name_en} //{" "}
              {activeNode.node_type}
            </span>

            {/* Level Bar */}
            <div className="inspector-level-row">
              <span>{language === "vi" ? "Độ thông thạo:" : "Mastery Level:"}</span>
              <strong>{activeNode.level}%</strong>
            </div>
            <div className="inspector-level-track">
              <div
                className="inspector-level-fill"
                style={{
                  width: `${activeNode.level}%`,
                  background: activeDomainMeta.color_hex,
                }}
              />
            </div>

            <p className="inspector-desc">
              {language === "vi" ? activeNode.summary_vi : activeNode.summary_en}
            </p>

            {/* Linked Production Lessons & Articles */}
            <div className="inspector-articles">
              <span className="inspector-articles-kicker">
                <i className="fa-solid fa-link" />
                {language === "vi"
                  ? "BÀI HỌC & CASE STUDY D1 LIÊN KẾT:"
                  : "LINKED D1 LESSONS & CASE STUDIES:"}
              </span>

              {activeNode.linkedArticleSlugs && activeNode.linkedArticleSlugs.length > 0 ? (
                <div className="inspector-article-chips">
                  {activeNode.linkedArticleSlugs.map((slug: string) => (
                    <a
                      key={slug}
                      href={`/blog/${slug}`}
                      className="inspector-article-chip"
                      title={slug}
                    >
                      <i className="fa-solid fa-file-lines" />
                      <span>{slug}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="inspector-no-articles">
                  <small>
                    {language === "vi"
                      ? "Nút kỹ năng này là nền tảng hệ sinh thái — mở rộng nhánh con để xem từng bài viết cụ thể."
                      : "Core ecosystem node — expand sub-branches to study individual production guides."}
                  </small>
                </div>
              )}
            </div>

            {/* Direct Cross-Filter Action Button */}
            <div className="inspector-actions">
              <button
                type="button"
                className="inspector-filter-btn"
                onClick={() => handleNodeClick(activeNode)}
              >
                <i className="fa-solid fa-filter" />
                <span>
                  {language === "vi"
                    ? "Lọc Kho D1 Theo Nút Này"
                    : "Filter D1 Repo by this Node"}
                </span>
              </button>
              {selectedSkillId && (
                <button
                  type="button"
                  className="inspector-clear-btn"
                  onClick={handleResetFilter}
                >
                  <i className="fa-solid fa-rotate-left" />
                  <span>{language === "vi" ? "Đặt lại bộ lọc" : "Clear Filter"}</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
