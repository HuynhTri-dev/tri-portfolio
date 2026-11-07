/**
 * @name types.ts
 * @description Type definitions for the Cyber-Arboretum Skill Graph Network.
 */

import type { SkillRank } from "../../../data/skill-matrix";
import type { KbIndexSummaryItem } from "../SkillTreeMatrix";

export interface SkillGraphNetworkProps {
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
  kbItems?: KbIndexSummaryItem[];
  activeRankFilter?: "ALL" | SkillRank;
}

export interface PositionedGraphNode {
  id: string;
  kind: "CORE" | "HUB" | "BRANCH" | "ARTICLE";
  labelEn: string;
  labelVi: string;
  shortEn: string;
  shortVi: string;
  summaryEn: string;
  summaryVi: string;
  rank: SkillRank;
  level: number;
  domainId: string;
  parentId: string | null;
  originX: number;
  originY: number;
  angleDeg: number;
  color: string;
  articleCount: number;
  href?: string;
}

export interface PositionedEdge {
  id: string;
  from: string;
  to: string;
  color: string;
  isPrimary: boolean;
  curveBend: number;
}

export interface NodePhysicsPos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface DomainMetaItem {
  shortEn: string;
  shortVi: string;
  icon: string;
  color: string;
  proofs: { labelEn: string; labelVi: string; href: string }[];
}

export interface ArticleDetailItem {
  slug: string;
  titleEn: string;
  titleVi: string;
  category: string;
  description: string;
}

export interface DirectArticleLink {
  slug: string;
  relationship: string;
}

