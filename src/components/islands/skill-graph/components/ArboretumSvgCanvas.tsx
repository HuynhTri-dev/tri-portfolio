/**
 * @name ArboretumSvgCanvas.tsx
 * @description SVG Canvas containing gradients, soil rings, bio-spores, organic boughs, and nodes.
 */

import React from "react";
import type {
  PositionedGraphNode,
  PositionedEdge,
  NodePhysicsPos,
} from "../types";
import type { SkillRank } from "../../../../data/skill-matrix";
import type { SkillNodeSeed } from "../../../../lib/data/skill-graph-seed";
import { SvgBoughEdge } from "./SvgBoughEdge";
import { SvgNodeRender } from "./SvgNodeRender";

interface BioSpore {
  id: number;
  cx: number;
  cy: number;
  r: number;
  dur: string;
  delay: string;
  maxOpacity: number;
}

interface ArboretumSvgCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  breezeEnabled: boolean;
  viewBoxStr: string;
  graphNodes: PositionedGraphNode[];
  graphEdges: PositionedEdge[];
  positions: Record<string, NodePhysicsPos>;
  bioSpores: BioSpore[];
  activeLineageSet: Set<string>;
  hoveredNodeId: string | null;
  selectedNodeId: string;
  inspectedSeed: SkillNodeSeed;
  activeRankFilter: "ALL" | SkillRank;
  language: "en" | "vi";
  isDragging: boolean;
  onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => void;
  onNodePointerDown: (e: React.PointerEvent<SVGGElement>, id: string) => void;
  onNodePointerEnter: (id: string) => void;
  onNodePointerLeave: () => void;
  onSelectNode: (id: string) => void;
}

export const ArboretumSvgCanvas: React.FC<ArboretumSvgCanvasProps> = ({
  svgRef,
  breezeEnabled,
  viewBoxStr,
  graphNodes,
  graphEdges,
  positions,
  bioSpores,
  activeLineageSet,
  hoveredNodeId,
  selectedNodeId,
  inspectedSeed,
  activeRankFilter,
  language,
  isDragging,
  onPointerMove,
  onPointerUp,
  onNodePointerDown,
  onNodePointerEnter,
  onNodePointerLeave,
  onSelectNode,
}) => {
  return (
    <svg
      ref={svgRef}
      className={`arboretum-svg ${breezeEnabled ? "is-breeze-active" : ""}`}
      viewBox={viewBoxStr}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <defs>
        <radialGradient id="arboretumSoilGlow" cx="50%" cy="50%" r="52%">
          <stop offset="0%" stopColor="#18c785" stopOpacity="0.24" />
          <stop offset="45%" stopColor="#7d553d" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#040c09" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="activeNodeHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#18c785" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#d9b36c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#18c785" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barkWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9c6b49" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#d9b36c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#18c785" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Ambient Forest Soil & Heartwood Growth Rings */}
      <circle cx="400" cy="300" r="285" fill="url(#arboretumSoilGlow)" />
      <circle
        cx="400"
        cy="300"
        r="72"
        fill="none"
        stroke="rgba(217, 179, 108, 0.14)"
        strokeDasharray="6 4"
      />
      <circle
        cx="400"
        cy="300"
        r="128"
        fill="none"
        stroke="rgba(24, 199, 133, 0.14)"
        strokeDasharray="3 6"
      />
      <circle
        cx="400"
        cy="300"
        r="196"
        fill="none"
        stroke="rgba(217, 179, 108, 0.08)"
        strokeDasharray="4 8"
      />

      {/* Ambient Bioluminescent Spores Floating in the Soil */}
      <g className="arboretum-forest-spores">
        {bioSpores.map((spore) => (
          <circle
            key={spore.id}
            cx={spore.cx}
            cy={spore.cy}
            r={spore.r}
            fill="#d9b36c"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values={`0.08;${spore.maxOpacity};0.08`}
              dur={spore.dur}
              begin={spore.delay}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${spore.cy};${spore.cy - 14};${spore.cy}`}
              dur={spore.dur}
              begin={spore.delay}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* Render Curved Organic Bough Edges & Flowing Bioluminescent Sap Veins */}
      {graphEdges.map((edge) => {
        const p1 = positions[edge.from];
        const p2 = positions[edge.to];
        if (!p1 || !p2) return null;

        const isLineageActive =
          activeLineageSet.has(edge.from) && activeLineageSet.has(edge.to);
        const isDimmed = hoveredNodeId !== null && !isLineageActive;

        return (
          <SvgBoughEdge
            key={edge.id}
            edge={edge}
            p1={p1}
            p2={p2}
            isLineageActive={isLineageActive}
            isDimmed={isDimmed}
          />
        );
      })}

      {/* Render Botanical Nodes: Heartwood Core, Bough Knots, Crystal Leaf Pods & D1 Spores */}
      {graphNodes.map((node, nodeIdx) => {
        const pos = positions[node.id] ?? { x: node.originX, y: node.originY };
        const isSelected =
          selectedNodeId === node.id ||
          (node.kind === "HUB" && inspectedSeed.parent_id === node.id);
        const isHovered = hoveredNodeId === node.id;
        const isLineage = activeLineageSet.has(node.id);

        const isRankFilteredOut =
          activeRankFilter !== "ALL" &&
          node.kind !== "CORE" &&
          node.kind !== "ARTICLE" &&
          node.rank !== activeRankFilter;
        const isHoverDimmed = hoveredNodeId !== null && !isLineage;

        return (
          <SvgNodeRender
            key={node.id}
            node={node}
            nodeIdx={nodeIdx}
            pos={pos}
            language={language}
            isSelected={isSelected}
            isHovered={isHovered}
            isHoverDimmed={isHoverDimmed}
            isRankFilteredOut={isRankFilteredOut}
            isDragging={isDragging}
            onPointerDown={onNodePointerDown}
            onPointerEnter={onNodePointerEnter}
            onPointerLeave={onNodePointerLeave}
            onClick={onSelectNode}
          />
        );
      })}
    </svg>
  );
};

