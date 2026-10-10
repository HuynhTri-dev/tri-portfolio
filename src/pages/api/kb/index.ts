/**
 * @name index.ts (/api/kb)
 * @description API endpoint to list Knowledge Base articles (GET) or create a new article (POST).
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../lib/services/knowledge.service";
import { validateApiKey, unauthorizedResponse } from "../../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const service = new KnowledgeService();

    const url = new URL(context.request.url);
    const isKbParam = url.searchParams.get("is_kb");
    const category = url.searchParams.get("category") || undefined;
    const tag = url.searchParams.get("tag") || undefined;
    const agent = url.searchParams.get("agent") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    const isKnowledgeBase = isKbParam !== null ? isKbParam === "true" || isKbParam === "1" : undefined;

    const articles = await service.listArticles({
      isKnowledgeBase,
      category,
      tag,
      agent,
      limit,
      offset,
    });

    return new Response(
      JSON.stringify({
        success: true,
        count: articles.length,
        articles: articles.map((a) => ({
          slug: a.slug,
          title: a.title,
          description: a.description,
          pubDate: a.pub_date,
          updatedDate: a.updated_date,
          hashtags: a.hashtags,
          isKnowledgeBase: a.is_knowledge_base,
          kbCategory: a.kb_category,
          targetAgents: a.target_agents,
          summaryForAgents: a.summary_for_agents,
          url: `/blog/${a.slug}`,
          rawUrl: `/api/kb/${a.slug}?format=raw`,
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
      JSON.stringify({ success: false, error: error.message || "Failed to fetch articles" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const POST: APIRoute = async (context) => {
  if (!await validateApiKey(context)) {
    return unauthorizedResponse();
  }

  try {
    const service = new KnowledgeService();

    const body = await context.request.json();

    if (!body.slug || !body.title || !body.content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: slug, title, content",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const created = await service.upsertArticle(
      {
        slug: body.slug,
        title: body.title,
        description: body.description || "",
        pubDate: body.pubDate,
        thumbnail: body.thumbnail,
        thumbnailAlt: body.thumbnailAlt,
        hashtags: body.hashtags || ["Engineering", "Knowledge-Base"],
        seoKeywords: body.seoKeywords || [],
        draft: body.draft || false,
        isKnowledgeBase: body.isKnowledgeBase !== undefined ? body.isKnowledgeBase : true,
        kbCategory: body.kbCategory || "general",
        targetAgents: body.targetAgents || ["claude", "cursor", "codex", "anti"],
        summaryForAgents: body.summaryForAgents || body.description || "",
        content: body.content,
      },
      { writeToDisk: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Article created and indexed successfully",
        article: created,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to create article" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
