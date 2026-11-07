/**
 * @name SvgNodeRender.tsx
 * @description Renders individual nodes: Heartwood Root Core, Primary Bough Knots (Hubs), and Crystal Leaf Pods.
 */

import React from "react";
import type { PositionedGraphNode, NodePhysicsPos } from "../types";
import type { SkillNodeSeed } from "../../../../lib/data/skill-graph-seed";
import { RANK_COLOR_MAP } from "../constants";
import { polarToCartesian } from "../geometry";

interface SvgNodeRenderProps {
  node: PositionedGraphNode;
  nodeIdx: number;
  pos: NodePhysicsPos;
  language: "en" | "vi";
  isSelected: boolean;
  isHovered: boolean;
  isHoverDimmed: boolean;
  isRankFilteredOut: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<SVGGElement>, id: string) => void;
  onPointerEnter: (id: string) => void;
  onPointerLeave: () => void;
  onClick: (id: string) => void;
}

export const SvgNodeRender: React.FC<SvgNodeRenderProps> = ({
  node,
  nodeIdx,
  pos,
  language,
  isSelected,
  isHovered,
  isHoverDimmed,
  isRankFilteredOut,
  isDragging,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onClick,
}) => {
  // 1. HEARTWOOD ROOT CORE
  if (node.kind === "CORE") {
    const lines = (language === "vi" ? node.shortVi : node.shortEn).split("\n");
    return (
      <g
        key={node.id}
        className="constellation-core-node"
        transform={`translate(${pos.x}, ${pos.y})`}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={(e) => onPointerDown(e, node.id)}
        onPointerEnter={() => onPointerEnter(node.id)}
        onPointerLeave={onPointerLeave}
        onClick={() => onClick(node.id)}
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
        onPointerDown={(e) => onPointerDown(e, node.id)}
        onPointerEnter={() => onPointerEnter(node.id)}
        onPointerLeave={onPointerLeave}
        onClick={() => onClick(node.id)}
      >
        {(isSelected || isHovered) && (
          <circle
            cx="0"
            cy="0"
            r="46"
            fill="url(#activeNodeHalo)"
            className="hub-pulse-aura"
          />
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
          strokeWidth={isSelected || isHovered ? "2.4" : "1.8"}
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

        {/* Hub Knot Content */}
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
      onPointerDown={(e) => onPointerDown(e, node.id)}
      onPointerEnter={() => onPointerEnter(node.id)}
      onPointerLeave={onPointerLeave}
      onClick={() => onClick(node.id)}
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
};

