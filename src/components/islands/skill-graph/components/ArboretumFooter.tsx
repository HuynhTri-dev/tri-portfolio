/**
 * @name ArboretumFooter.tsx
 * @description Canvas footer displaying rank chips and lesson spore indicators.
 */

import React from "react";

interface ArboretumFooterProps {
  language: "en" | "vi";
}

export const ArboretumFooter: React.FC<ArboretumFooterProps> = ({ language }) => {
  return (
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
    </div>
  );
};

