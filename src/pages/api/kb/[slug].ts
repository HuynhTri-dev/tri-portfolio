/**
 * @name [slug].ts (/api/kb/[slug])
 * @description API endpoint to retrieve a single article in JSON or raw Markdown (GET) and update it (PUT).
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../lib/services/knowledge.service";
import { validateApiKey, unauthorizedResponse } from "../../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const { slug } = context.params;
    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: "Slug is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const service = new KnowledgeService();

    const article = await service.getArticleBySlug(slug);
    if (!article) {
      return new Response(JSON.stringify({ success: false, error: "Article not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if client requested raw markdown format (via query param or Accept header)
    const url = new URL(context.request.url);
    const format = url.searchParams.get("format");
    const acceptHeader = context.request.headers.get("Accept") || "";
    const wantsRawMarkdown = format === "raw" || acceptHeader.includes("text/markdown");

    if (wantsRawMarkdown) {
      return new Response(article.raw_content || article.raw_markdown, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=120, s-maxage=600",
        },
      });
    }

    // Also fetch any attached troubleshooting problems
    const problems = await service.getProblemsByParent(slug);

    return new Response(
      JSON.stringify({
        success: true,
        article,
        problems,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120, s-maxage=600",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to fetch article" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const PUT: APIRoute = async (context) => {
  if (!await validateApiKey(context)) {
    return unauthorizedResponse();
  }

  try {
    const { slug } = context.params;
    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: "Slug is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const service = new KnowledgeService();

    const existing = await service.getArticleBySlug(slug);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: "Article not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await context.request.json();

    const updated = await service.upsertArticle(
      {
        slug,
        title: body.title || existing.title,
        description: body.description || existing.description,
        pubDate: existing.pub_date,
        thumbnail: body.thumbnail || existing.thumbnail,
        thumbnailAlt: body.thumbnailAlt || existing.thumbnail_alt,
        hashtags: body.hashtags || existing.hashtags,
        seoKeywords: body.seoKeywords || existing.seo_keywords,
        draft: body.draft !== undefined ? body.draft : existing.draft,
        isKnowledgeBase: body.isKnowledgeBase !== undefined ? body.isKnowledgeBase : existing.is_knowledge_base,
        kbCategory: body.kbCategory || existing.kb_category,
        targetAgents: body.targetAgents || existing.target_agents,
        summaryForAgents: body.summaryForAgents || existing.summary_for_agents,
        content: body.content !== undefined ? body.content : existing.raw_markdown,
      },
      { writeToDisk: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Article updated successfully",
        article: updated,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to update article" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
