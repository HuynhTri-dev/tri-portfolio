/**
 * @name search.ts (/api/kb/search)
 * @description API endpoint for Full-Text Search across Knowledge Base articles and troubleshooting problems.
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../lib/services/knowledge.service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const url = new URL(context.request.url);
    const query = url.searchParams.get("q") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const type = url.searchParams.get("type") || "all"; // 'article', 'problem', or 'all'

    if (!query.trim()) {
      return new Response(
        JSON.stringify({
          success: true,
          query: "",
          articles: [],
          problems: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const service = new KnowledgeService();

    let articleResults: any[] = [];
    let problemResults: any[] = [];

    if (type === "article" || type === "all") {
      articleResults = await service.searchArticles(query, limit);
    }

    if (type === "problem" || type === "all") {
      problemResults = await service.searchProblems(query, limit);
    }

    return new Response(
      JSON.stringify({
        success: true,
        query,
        count: articleResults.length + problemResults.length,
        articles: articleResults.map((r) => ({
          slug: r.article.slug,
          title: r.article.title,
          description: r.article.description,
          snippet: r.snippet,
          kbCategory: r.article.kb_category,
          hashtags: r.article.hashtags,
          url: `/blog/${r.article.slug}`,
          rawUrl: `/api/kb/${r.article.slug}?format=raw`,
        })),
        problems: problemResults.map((p) => ({
          id: p.problem.id,
          parentSlug: p.problem.parent_slug,
          title: p.problem.title,
          errorCode: p.problem.error_code,
          snippet: p.snippet,
          tags: p.problem.tags,
          solution: p.problem.solution_markdown,
          parentUrl: `/blog/${p.problem.parent_slug}`,
        })),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Search failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
