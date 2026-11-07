/**
 * @name ArboretumTooltip.tsx
 * @description Floating bio-luminescent on-canvas tooltip.
 */

import React from "react";
import type { PositionedGraphNode } from "../types";

interface ArboretumTooltipProps {
  language: "en" | "vi";
  hoveredGraphNode: PositionedGraphNode | null;
}

export const ArboretumTooltip: React.FC<ArboretumTooltipProps> = ({
  language,
  hoveredGraphNode,
}) => {
  if (!hoveredGraphNode || hoveredGraphNode.kind === "CORE") {
    return null;
  }

  return (
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
  );
};

