/**
 * @name ArboretumDomainTabs.tsx
 * @description Top domain selector bar with tree-wide reset button.
 */

import React from "react";
import { SEED_DOMAINS, SEED_NODES } from "../../../../lib/data/skill-graph-seed";
import { DOMAIN_META } from "../constants";

interface ArboretumDomainTabsProps {
  language: "en" | "vi";
  activeDomainId: string;
  onSelectDomainTab: (domainId: string) => void;
  onResetGraph: () => void;
}

export const ArboretumDomainTabs: React.FC<ArboretumDomainTabsProps> = ({
  language,
  activeDomainId,
  onSelectDomainTab,
  onResetGraph,
}) => {
  return (
    <div className="arboretum-graph__domain-bar" role="tablist" aria-label="Skill graph domains">
      <div className="arboretum-graph__tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeDomainId === "ALL"}
          className={`domain-tab ${activeDomainId === "ALL" ? "is-active" : ""}`}
          onClick={() => onSelectDomainTab("ALL")}
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
              onClick={() => onSelectDomainTab(dom.id)}
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
        onClick={onResetGraph}
        title={language === "vi" ? "Đặt lại cành & góc nhìn" : "Reset tree boughs & zoom"}
      >
        <i className="fa-solid fa-seedling" aria-hidden="true" />
        <span>{language === "vi" ? "Cân bằng rễ" : "Reset Tree"}</span>
      </button>
    </div>
  );
};
