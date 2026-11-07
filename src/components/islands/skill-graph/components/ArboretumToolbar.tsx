/**
 * @name ArboretumToolbar.tsx
 * @description Topbar controls for the canvas: breeze toggle, zoom levels, full tree reset.
 */

import React from "react";

interface ArboretumToolbarProps {
  language: "en" | "vi";
  breezeEnabled: boolean;
  onToggleBreeze: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  activeDomainId: string;
  onSelectDomainTab: (domainId: string) => void;
}

export const ArboretumToolbar: React.FC<ArboretumToolbarProps> = ({
  language,
  breezeEnabled,
  onToggleBreeze,
  zoom,
  onZoomChange,
  activeDomainId,
  onSelectDomainTab,
}) => {
  return (
    <div className="arboretum-canvas-topbar">
      <div className="arboretum-canvas-controls">
        <button
          type="button"
          className={`canvas-ctrl-pill ${breezeEnabled ? "is-active" : ""}`}
          onClick={onToggleBreeze}
          title={language === "vi" ? "Bật/tắt hiệu ứng gió rừng" : "Toggle forest breeze sway"}
        >
          <i className="fa-solid fa-wind" aria-hidden="true" />
          <span>{language === "vi" ? "Gió rừng" : "Breeze"}</span>
        </button>

        <div className="canvas-zoom-group" role="group" aria-label="Zoom controls">
          <button
            type="button"
            className="canvas-zoom-btn"
            onClick={() => onZoomChange(Math.max(0.85, Math.round((zoom - 0.15) * 100) / 100))}
            title="Zoom out"
          >
            −
          </button>
          <span className="canvas-zoom-val">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="canvas-zoom-btn"
            onClick={() => onZoomChange(Math.min(1.45, Math.round((zoom + 0.15) * 100) / 100))}
            title="Zoom in"
          >
            +
          </button>
        </div>

        {activeDomainId !== "ALL" && (
          <button
            type="button"
            className="canvas-back-overview-btn"
            onClick={() => onSelectDomainTab("ALL")}
          >
            <i className="fa-solid fa-compress" aria-hidden="true" />
            <span>{language === "vi" ? "Toàn cảnh" : "Full Tree"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

