/**
 * @name search.ts (/api/kb/graph/search)
 * @description Graph-guided search API endpoint combining taxonomy node matching, parent hub resolution, and linked article discovery.
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../../lib/services/knowledge.service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const service = new KnowledgeService();

    const url = new URL(context.request.url);
    const query = url.searchParams.get("q") || "";

    if (!query.trim()) {
      return new Response(
        JSON.stringify({
          status: "success",
          query: "",
          data: {
            matchedNodes: [],
            relatedHubs: [],
            linkedArticles: [],
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const searchResults = await service.searchSkillGraph(query);

    return new Response(
      JSON.stringify({
        status: "success",
        query,
        count: searchResults.matchedNodes.length,
        data: searchResults,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/kb/graph/search] Error:", error);
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
