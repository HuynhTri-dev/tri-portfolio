/**
 * @name ArboretumDossier.tsx
 * @description Right column synaptic dossier panel showing active node info, connected leaves, D1 lessons, and proofs.
 */

import React from "react";
import type { SkillRank } from "../../../../data/skill-matrix";
import type { SkillNodeSeed } from "../../../../lib/data/skill-graph-seed";
import type { DomainMetaItem, DirectArticleLink } from "../types";
import { RANK_COLOR_MAP, SHORT_NODE_LABELS } from "../constants";

interface InspectedArticleView {
  slug: string;
  titleEn: string;
  titleVi: string;
  category: string;
  relationship: string;
}

interface ArboretumDossierProps {
  language: "en" | "vi";
  inspectedSeed: SkillNodeSeed;
  inspectedDomainMeta: DomainMetaItem;
  activeDomainId: string;
  selectedNodeId: string;
  clusterBranches: SkillNodeSeed[];
  inspectedArticles: InspectedArticleView[];
  directLinksByNode: Map<string, DirectArticleLink[]>;
  onSelectDomainTab: (domainId: string) => void;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
  onScrollToD1Cards: () => void;
}

export const ArboretumDossier: React.FC<ArboretumDossierProps> = ({
  language,
  inspectedSeed,
  inspectedDomainMeta,
  activeDomainId,
  selectedNodeId,
  clusterBranches,
  inspectedArticles,
  directLinksByNode,
  onSelectDomainTab,
  onSelectNode,
  onHoverNode,
  onScrollToD1Cards,
}) => {
  return (
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
              onClick={() => onSelectDomainTab(inspectedSeed.domain_id)}
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
              onClick={() => onSelectDomainTab("ALL")}
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
                  onMouseEnter={() => onHoverNode(branch.id)}
                  onMouseLeave={() => onHoverNode(null)}
                  onClick={() => onSelectNode(branch.id)}
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
        <button
          type="button"
          className="dossier-scroll-repo-btn"
          onClick={onScrollToD1Cards}
        >
          <span>{language === "vi" ? "Cuộn xuống Kho D1" : "View D1 Cards"}</span>
          <i className="fa-solid fa-arrow-down" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
};

