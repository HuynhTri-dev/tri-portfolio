/**
 * @name index.ts (/api/kb/graph)
 * @description REST API endpoint providing the full or filtered Skill Knowledge Graph topology for web clients & AI agents.
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../../lib/services/knowledge.service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const service = new KnowledgeService();

    const url = new URL(context.request.url);
    const domain = url.searchParams.get("domain") || undefined;
    const root = url.searchParams.get("root") || undefined;
    const format = url.searchParams.get("format") || "full";

    const topology = await service.getSkillGraph({ domain, root });

    if (format === "compact") {
      // Minified payload optimized for low-token consumption by LLM agents
      const compactResponse = {
        domains: topology.domains.map((d) => ({ id: d.id, name: d.name_en })),
        nodes: topology.nodes.map((n) => ({
          id: n.id,
          domain: n.domain_id,
          parent: n.parent_id,
          name: n.name_en,
          rank: n.rank,
          level: n.level,
          type: n.node_type,
          articles: n.linkedArticles.map((a) => a.slug),
        })),
        edges: topology.edges.map((e) => `${e.source_node_id}->${e.target_node_id} (${e.relation_type})`),
        stats: topology.stats,
      };

      return new Response(JSON.stringify(compactResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120, s-maxage=600",
        },
      });
    }

    return new Response(
      JSON.stringify({
        status: "success",
        data: topology,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120, s-maxage=600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/kb/graph] Error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
