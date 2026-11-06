/**
 * @name SkillTreeMatrix.tsx
 * @description Interactive F-to-S engineering mastery matrix island for the Blog D1
 *              Repository tier, providing domain branch switching, rank criteria telemetry,
 *              verified dossier links, and real-time D1 case-study cross-filtering.
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SKILL_MATRIX_BRANCHES,
  SKILL_RANK_LEGEND,
  type SkillDomainBranch,
  type SkillDomainId,
  type SkillNode,
  type SkillRank,
} from "../../data/skill-matrix";
import "./SkillTreeMatrix.css";

type Language = "en" | "vi";

export interface KbIndexSummaryItem {
  slug: string;
  title: string;
  category: string;
  hashtags: string[];
  description?: string;
}

interface SkillTreeMatrixProps {
  kbItems?: KbIndexSummaryItem[];
}

export interface KbSkillFilterDetail {
  skillId: string | null;
  skillNameEn: string;
  skillNameVi: string;
  rank: SkillRank | null;
  domain: SkillDomainId | null;
  matchedSlugs: string[];
  proofs: SkillNode["proofs"];
}

/**
 * Extracts normalized word and camelCase tokens from an article summary so short
 * domain keywords (e.g., "ai", "rag", "erp", "ux") match exact terms without false
 * substring collisions.
 */
function tokenizeKbItem(item: KbIndexSummaryItem): Set<string> {
  const expandedHashtags = item.hashtags
    .map((tag) => `${tag} ${tag.replace(/([a-z0-9])([A-Z])/g, "$1 $2")}`)
    .join(" ");

  const rawSource = [
    item.slug,
    item.slug.replace(/-/g, ""),
    item.title,
    item.category,
    expandedHashtags,
    item.description ?? "",
  ].join(" ");

  const tokens = rawSource
    .toLowerCase()
    .split(/[^a-z0-9\u00c0-\u1ef9]+/)
    .filter(Boolean);

  return new Set(tokens);
}

/**
 * Evaluates whether a skill node's keyword list matches a tokenized D1 Knowledge Base study.
 */
function matchesSkillTokens(keywords: string[], articleTokens: Set<string>): boolean {
  for (const rawKw of keywords) {
    const kw = rawKw.toLowerCase().replace(/[-_#\s]+/g, "");
    if (!kw) continue;

    if (articleTokens.has(kw)) {
      return true;
    }

    if (kw.length >= 5) {
      for (const token of articleTokens) {
        if (token.includes(kw) || (token.length >= 5 && kw.includes(token))) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Renders the enterprise F-to-S Skill Tree Matrix with 7 specialized branches,
 * interactive rank telemetry, and two-way D1 Knowledge Base filtering.
 */
export default function SkillTreeMatrix({ kbItems = [] }: SkillTreeMatrixProps) {
  const [language, setLanguage] = useState<Language>("en");
  const [activeDomain, setActiveDomain] = useState<"ALL" | SkillDomainId>("ALL");
  const [activeRankFilter, setActiveRankFilter] = useState<"ALL" | SkillRank>("ALL");
  const [inspectedRank, setInspectedRank] = useState<SkillRank>("S");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const allSkills = useMemo(
    () => SKILL_MATRIX_BRANCHES.flatMap((branch) => branch.skills),
    [],
  );

  const branchById = useMemo(() => {
    const map = new Map<SkillDomainId, SkillDomainBranch>();
    for (const branch of SKILL_MATRIX_BRANCHES) {
      map.set(branch.id, branch);
    }
    return map;
  }, []);

  const tokenizedKbMap = useMemo(() => {
    return kbItems.map((item) => ({
      slug: item.slug,
      tokens: tokenizeKbItem(item),
    }));
  }, [kbItems]);

  const skillMatchesMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const skill of allSkills) {
      const matched = tokenizedKbMap
        .filter((entry) => matchesSkillTokens(skill.keywords, entry.tokens))
        .map((entry) => entry.slug);
      map.set(skill.id, matched);
    }
    return map;
  }, [allSkills, tokenizedKbMap]);

  const rankCounts = useMemo(() => {
    const counts: Record<SkillRank, number> = {
      S: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };
    for (const skill of allSkills) {
      counts[skill.rank] += 1;
    }
    return counts;
  }, [allSkills]);

  /**
   * Broadcasts the currently selected skill filter to the parent Astro D1 KB grid
   * and synchronizes the URL query parameter without reloading the page.
   */
  const broadcastSkillFilter = useCallback(
    (skill: SkillNode | null, updateHistory = true) => {
      const matchedSlugs = skill ? (skillMatchesMap.get(skill.id) ?? []) : [];

      if (updateHistory && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (skill) {
          url.searchParams.set("skill", skill.id);
        } else {
          url.searchParams.delete("skill");
        }
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      }

      if (typeof window !== "undefined") {
        const detail: KbSkillFilterDetail = {
          skillId: skill?.id ?? null,
          skillNameEn: skill?.nameEn ?? "",
          skillNameVi: skill?.nameVi ?? "",
          rank: skill?.rank ?? null,
          domain: skill?.domain ?? null,
          matchedSlugs,
          proofs: skill?.proofs ?? [],
        };
        window.dispatchEvent(new CustomEvent("portfolio:filter-kb", { detail }));
      }
    },
    [skillMatchesMap],
  );

  useEffect(() => {
    const docLang = document.documentElement.lang === "vi" ? "vi" : "en";
    try {
      const savedLang = localStorage.getItem("portfolio-language");
      setLanguage(savedLang === "vi" || docLang === "vi" ? "vi" : "en");
    } catch {
      setLanguage(docLang);
    }

    const handleLanguage = (event: Event) => {
      const nextLang = (event as CustomEvent<{ language: Language }>).detail?.language;
      if (nextLang === "en" || nextLang === "vi") {
        setLanguage(nextLang);
      }
    };

    const handleExternalReset = () => {
      setSelectedSkillId(null);
      broadcastSkillFilter(null, true);
    };

    window.addEventListener("portfolio:language", handleLanguage);
    window.addEventListener("portfolio:reset-kb-filter", handleExternalReset);

    // Restore initial skill filter from ?skill=<id> if present
    const initialSkillParam = new URLSearchParams(window.location.search).get("skill");
    if (initialSkillParam) {
      const found = allSkills.find((s) => s.id === initialSkillParam);
      if (found) {
        setSelectedSkillId(found.id);
        setActiveDomain(found.domain);
        setInspectedRank(found.rank);
        // Defer slightly so Astro script listener is attached
        requestAnimationFrame(() => {
          broadcastSkillFilter(found, false);
        });
      }
    }

    return () => {
      window.removeEventListener("portfolio:language", handleLanguage);
      window.removeEventListener("portfolio:reset-kb-filter", handleExternalReset);
    };
  }, [allSkills, broadcastSkillFilter]);

  /**
   * Switches the active engineering domain tab and informs the 3D Cyber-Arboretum
   * background to tint its ambient lighting accordingly.
   */
  const handleSelectDomain = (domainId: "ALL" | SkillDomainId) => {
    setActiveDomain(domainId);
    if (domainId !== "ALL" && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("portfolio:capability-change", {
          detail: { short: domainId },
        }),
      );
    }
  };

  /**
   * Toggles a skill node to filter or clear the live D1 Knowledge Base cards below.
   */
  const handleToggleSkill = (skill: SkillNode) => {
    setInspectedRank(skill.rank);
    if (selectedSkillId === skill.id) {
      setSelectedSkillId(null);
      broadcastSkillFilter(null, true);
      return;
    }

    setSelectedSkillId(skill.id);
    broadcastSkillFilter(skill, true);

    const filterAnchor = document.querySelector("[data-kb-results-anchor]");
    if (filterAnchor) {
      const rect = filterAnchor.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.88) {
        filterAnchor.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
        });
      }
    }
  };

  const visibleSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      const matchesDomain = activeDomain === "ALL" || skill.domain === activeDomain;
      const matchesRank = activeRankFilter === "ALL" || skill.rank === activeRankFilter;
      return matchesDomain && matchesRank;
    });
  }, [allSkills, activeDomain, activeRankFilter]);

  const activeBranch = activeDomain !== "ALL" ? branchById.get(activeDomain) : null;
  const inspectedRankMeta =
    SKILL_RANK_LEGEND.find((item) => item.rank === inspectedRank) ?? SKILL_RANK_LEGEND[0];

  const branchSummaryStats = useMemo(() => {
    const pool = activeBranch ? activeBranch.skills : allSkills;
    const avgLevel = Math.round(
      pool.reduce((sum, item) => sum + item.level, 0) / Math.max(pool.length, 1),
    );
    const sCount = pool.filter((item) => item.rank === "S").length;
    const totalProofs = pool.reduce((sum, item) => sum + item.proofs.length, 0);
    return { avgLevel, sCount, totalProofs, count: pool.length };
  }, [activeBranch, allSkills]);

  // Display progression F -> S as requested, keeping active ranks interactive
  const orderedScale = useMemo(() => [...SKILL_RANK_LEGEND].reverse(), []);

  return (
    <section
      className="skill-matrix"
      suppressHydrationWarning
      aria-label={
        language === "vi"
          ? "Ma trận cây kỹ năng kỹ thuật F đến S"
          : "Engineering skill tree matrix F to S"
      }
      style={
        {
          "--matrix-accent": activeBranch?.accent ?? "#18c785",
          "--matrix-soft": activeBranch?.softAccent ?? "#6ee7b7",
          "--matrix-glow": activeBranch?.glow ?? "rgba(24, 199, 133, 0.2)",
        } as React.CSSProperties
      }
    >
      {/* Top Telemetry Bar & F -> S Rank Scale */}
      <div className="skill-matrix__top">
        <div className="skill-matrix__intro">
          <div className="skill-matrix__kicker-row">
            <span className="skill-matrix__pulse" aria-hidden="true" />
            <span className="skill-matrix__kicker">
              {language === "vi"
                ? "SKILL MATRIX // HỆ THỐNG NĂNG LỰC F → S"
                : "SKILL MATRIX // MASTERY TAXONOMY F → S"}
            </span>
          </div>
          <h3 className="skill-matrix__heading">
            {language === "vi"
              ? "Sơ đồ Nhánh Kỹ năng Đa Chuyên môn"
              : "Cross-Domain Capability Tree"}
          </h3>
          <p className="skill-matrix__sub">
            {language === "vi"
              ? "Chọn từng nhánh chuyên môn (PM, BA, DA, Backend, AI, Frontend, Infra) hoặc nhấp vào một kỹ năng để lọc trực tiếp các bài nghiên cứu D1 bên dưới."
              : "Explore specialized branches (PM, BA, DA, Backend, AI, Frontend, Infra) or click any skill node to filter live D1 Knowledge Base studies below."}
          </p>
        </div>

        {/* Interactive Rank Progression Scale: F -> S */}
        <div className="skill-matrix__legend-box">
          <div className="skill-matrix__legend-header">
            <span className="skill-matrix__legend-label">
              {language === "vi" ? "THANG CẤP ĐỘ (F → S)" : "RANK SCALE (F → S)"}
            </span>
            {activeRankFilter !== "ALL" && (
              <button
                type="button"
                className="skill-matrix__rank-reset"
                onClick={() => setActiveRankFilter("ALL")}
              >
                {language === "vi" ? "Tất cả Rank" : "All Ranks"}
              </button>
            )}
          </div>

          <div
            className="skill-matrix__rank-scale"
            role="group"
            aria-label={language === "vi" ? "Lọc theo cấp độ Rank" : "Filter by mastery rank"}
          >
            {orderedScale.map((meta, idx) => {
              const count = rankCounts[meta.rank];
              const isSelected = activeRankFilter === meta.rank;
              const isInspected = inspectedRank === meta.rank;
              const hasNodes = count > 0;

              return (
                <div key={meta.rank} className="skill-matrix__rank-step">
                  <button
                    type="button"
                    className={[
                      "skill-matrix__rank-pill",
                      `skill-matrix__rank-pill--${meta.rank.toLowerCase()}`,
                      isSelected ? "is-selected" : "",
                      isInspected ? "is-inspected" : "",
                      !hasNodes ? "is-dormant" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setInspectedRank(meta.rank)}
                    onFocus={() => setInspectedRank(meta.rank)}
                    onClick={() => {
                      setInspectedRank(meta.rank);
                      if (!hasNodes) return;
                      setActiveRankFilter((prev) => (prev === meta.rank ? "ALL" : meta.rank));
                    }}
                    aria-pressed={isSelected}
                    title={`${meta.rank} — ${language === "vi" ? meta.titleVi : meta.titleEn}`}
                  >
                    <span className="rank-letter">{meta.rank}</span>
                    {count > 0 && <span className="rank-count">×{count}</span>}
                  </button>
                  {idx < orderedScale.length - 1 && (
                    <span className="skill-matrix__rank-arrow" aria-hidden="true">
                      ▸
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="skill-matrix__criteria-bar"
            style={{ "--rank-color": inspectedRankMeta.accent } as React.CSSProperties}
          >
            <span className="criteria-badge">RANK {inspectedRankMeta.rank}</span>
            <strong className="criteria-title">
              {language === "vi" ? inspectedRankMeta.titleVi : inspectedRankMeta.titleEn}:
            </strong>
            <span className="criteria-text">
              {language === "vi" ? inspectedRankMeta.criteriaVi : inspectedRankMeta.criteriaEn}
            </span>
          </div>
        </div>
      </div>

      {/* 7-Branch Domain Selector Bar */}
      <div
        className="skill-matrix__domains"
        role="tablist"
        aria-label={language === "vi" ? "Các nhánh kỹ năng chuyên môn" : "Engineering skill branches"}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeDomain === "ALL"}
          className={`domain-tab ${activeDomain === "ALL" ? "is-active" : ""}`}
          onClick={() => handleSelectDomain("ALL")}
        >
          <i className="fa-solid fa-border-all" aria-hidden="true" />
          <span className="domain-tab__label">
            {language === "vi" ? "Tất cả Nhánh" : "All Branches"}
          </span>
          <span className="domain-tab__count">{allSkills.length}</span>
        </button>

        {SKILL_MATRIX_BRANCHES.map((branch) => {
          const isSelected = activeDomain === branch.id;
          const sRanks = branch.skills.filter((s) => s.rank === "S").length;
          return (
            <button
              key={branch.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`domain-tab ${isSelected ? "is-active" : ""}`}
              style={
                {
                  "--tab-accent": branch.accent,
                  "--tab-soft": branch.softAccent,
                  "--tab-glow": branch.glow,
                } as React.CSSProperties
              }
              onClick={() => handleSelectDomain(branch.id)}
            >
              <i className={branch.icon} aria-hidden="true" />
              <span className="domain-tab__label">
                {language === "vi" ? branch.titleVi : branch.titleEn}
              </span>
              <span className="domain-tab__count" title={`${sRanks} Rank-S skills`}>
                {branch.skills.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Branch Telemetry Readout */}
      <div className="skill-matrix__telemetry">
        <div className="telemetry-branch-info">
          <span className="telemetry-code">
            {activeBranch ? activeBranch.code : "00 // FULL-SPECTRUM MATRIX"}
          </span>
          <span className="telemetry-desc">
            {activeBranch
              ? language === "vi"
                ? activeBranch.subtitleVi
                : activeBranch.subtitleEn
              : language === "vi"
                ? "Tổng hợp 7 nhánh kỹ năng từ Quản trị Sản phẩm, Phân tích Nghiệp vụ, Dữ liệu đến Kỹ thuật Lõi & AI."
                : "Integrated view across PM, BA, Data Streaming, Core Backend, AI Agents, Frontend, and Cloud Infra."}
          </span>
        </div>

        <div className="telemetry-metrics">
          <div className="telemetry-chip">
            <span>AVG LVL</span>
            <strong>{branchSummaryStats.avgLevel}/100</strong>
          </div>
          <div className="telemetry-chip telemetry-chip--s">
            <span>RANK S</span>
            <strong>
              {branchSummaryStats.sCount}/{branchSummaryStats.count}
            </strong>
          </div>
          <div className="telemetry-chip">
            <span>{language === "vi" ? "MINH CHỨNG" : "PROOFS"}</span>
            <strong>{branchSummaryStats.totalProofs}</strong>
          </div>
        </div>
      </div>

      {/* Skill Nodes Circuit Grid */}
      <div className="skill-matrix__grid">
        <AnimatePresence mode="popLayout">
          {visibleSkills.map((skill) => {
            const branch = branchById.get(skill.domain);
            const matchedSlugs = skillMatchesMap.get(skill.id) ?? [];
            const isSelected = selectedSkillId === skill.id;

            return (
              <motion.article
                key={skill.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className={[
                  "skill-node",
                  `skill-node--rank-${skill.rank.toLowerCase()}`,
                  isSelected ? "is-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    "--node-branch-accent": branch?.accent ?? "#18c785",
                    "--node-branch-soft": branch?.softAccent ?? "#6ee7b7",
                  } as React.CSSProperties
                }
                onClick={() => handleToggleSkill(skill)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleSkill(skill);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                {/* Node Header: Polygonal Rank Crest + Branch Tag + KB Match Pill */}
                <div className="skill-node__head">
                  <div className="skill-node__crest-wrap">
                    <span
                      className={`rank-crest rank-crest--${skill.rank.toLowerCase()}`}
                      title={`Rank ${skill.rank}`}
                    >
                      <small>RANK</small>
                      <strong>{skill.rank}</strong>
                    </span>
                    <span className="skill-node__domain-pill">
                      <i className={skill.icon} aria-hidden="true" />
                      <span>{skill.domain}</span>
                    </span>
                  </div>

                  <span
                    className={`skill-node__kb-badge ${matchedSlugs.length > 0 ? "has-kb" : ""}`}
                    title={
                      language === "vi"
                        ? "Nhấp để lọc bài nghiên cứu D1 liên quan"
                        : "Click card to filter matching D1 studies"
                    }
                  >
                    <i
                      className={
                        isSelected
                          ? "fa-solid fa-filter-circle-xmark"
                          : matchedSlugs.length > 0
                            ? "fa-solid fa-database"
                            : "fa-solid fa-folder-tree"
                      }
                      aria-hidden="true"
                    />
                    <span>
                      {isSelected
                        ? language === "vi"
                          ? "Đang lọc"
                          : "Filtering"
                        : matchedSlugs.length > 0
                          ? `${matchedSlugs.length} D1`
                          : `${skill.proofs.length} ${language === "vi" ? "Hồ sơ" : "Dossier"}`}
                    </span>
                  </span>
                </div>

                {/* Skill Title & Concise Operational Summary */}
                <h4 className="skill-node__title">
                  {language === "vi" ? skill.nameVi : skill.nameEn}
                </h4>

                <p className="skill-node__summary">
                  {language === "vi" ? skill.summaryVi : skill.summaryEn}
                </p>

                {/* Mastery Level Progress Meter */}
                <div className="skill-node__meter">
                  <div className="skill-node__meter-labels">
                    <span>MASTERY INDEX</span>
                    <strong>LVL {skill.level}/100</strong>
                  </div>
                  <div className="skill-node__meter-track" aria-hidden="true">
                    <div
                      className="skill-node__meter-fill"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>

                {/* Direct Verified Proofs (Stop propagation so links open cleanly) */}
                <div className="skill-node__proofs">
                  {skill.proofs.map((proof) => (
                    <a
                      key={proof.href + proof.labelEn}
                      href={proof.href}
                      className="skill-node__proof-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      <span>{language === "vi" ? proof.labelVi : proof.labelEn}</span>
                    </a>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
