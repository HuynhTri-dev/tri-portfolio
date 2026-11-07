/**
 * @name SvgBoughEdge.tsx
 * @description Renders an individual organic bough edge with wood conduit and glowing sap surge.
 */

import React from "react";
import type { PositionedEdge, NodePhysicsPos } from "../types";
import { buildOrganicBoughGeometry } from "../geometry";

interface SvgBoughEdgeProps {
  edge: PositionedEdge;
  p1: NodePhysicsPos;
  p2: NodePhysicsPos;
  isLineageActive: boolean;
  isDimmed: boolean;
}

export const SvgBoughEdge: React.FC<SvgBoughEdgeProps> = ({
  edge,
  p1,
  p2,
  isLineageActive,
  isDimmed,
}) => {
  const { mainPath, tendrilPath, twigEndX, twigEndY } = buildOrganicBoughGeometry(
    p1.x,
    p1.y,
    p2.x,
    p2.y,
    edge.curveBend,
    edge.isPrimary
  );

  return (
    <g
      key={edge.id}
      style={{
        opacity: isDimmed ? 0.22 : 1,
        transition: "opacity 220ms ease",
      }}
    >
      {/* 1. Lateral Root Tendril Offshoot */}
      <path
        d={tendrilPath}
        fill="none"
        stroke={edge.isPrimary ? "#9c6b49" : edge.color}
        strokeWidth="1.1"
        strokeOpacity="0.42"
        strokeLinecap="round"
      />
      <circle
        cx={twigEndX}
        cy={twigEndY}
        r="1.8"
        fill={edge.color}
        fillOpacity="0.65"
      />

      {/* 2. Outer Woody Bark Conduit (Thick & Tapered) */}
      <path
        d={mainPath}
        fill="none"
        stroke="url(#barkWoodGrad)"
        strokeWidth={
          edge.isPrimary
            ? isLineageActive
              ? "5.8"
              : "4.4"
            : isLineageActive
            ? "3.4"
            : "2.2"
        }
        strokeOpacity={isLineageActive ? "0.9" : "0.52"}
        strokeLinecap="round"
      />

      {/* 3. Inner Bioluminescent Sap Vein */}
      <path
        d={mainPath}
        fill="none"
        stroke={edge.color}
        strokeWidth={
          edge.isPrimary
            ? isLineageActive
              ? "2.6"
              : "1.8"
            : isLineageActive
            ? "2"
            : "1.2"
        }
        strokeOpacity={isLineageActive ? "1" : "0.78"}
        strokeLinecap="round"
        className={isLineageActive ? "bough-sap-surge" : "bough-sap-vein"}
      />

      {/* 4. Flowing Sap Droplets along the curved bough */}
      {(edge.isPrimary || isLineageActive) && (
        <circle
          r={isLineageActive ? "3.4" : "2.4"}
          fill={isLineageActive ? "#fde68a" : "#a7f3d0"}
        >
          <animateMotion
            path={mainPath}
            dur={isLineageActive ? "1.35s" : edge.isPrimary ? "2.6s" : "3.1s"}
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
};

