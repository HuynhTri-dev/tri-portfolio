/**
 * @name misses.ts (/api/kb/misses)
 * @description API endpoint returning top zero-hit search queries to guide future knowledge documentation.
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../lib/services/knowledge.service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const url = new URL(context.request.url);
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "25", 10)));

    const service = new KnowledgeService();
    const misses = await service.getSearchMisses(limit);

    return new Response(
      JSON.stringify({
        success: true,
        count: misses.length,
        misses,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=120",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to fetch search misses" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
