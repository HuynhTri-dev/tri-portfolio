/**
 * @name [slug].ts (/api/kb/[slug])
 * @description API endpoint to retrieve an article in JSON, outline, section markdown, or full raw Markdown (GET) and update it (PUT).
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

    const url = new URL(context.request.url);
    const format = url.searchParams.get("format");
    const sectionAnchor = url.searchParams.get("section");
    const acceptHeader = context.request.headers.get("Accept") || "";

    // 1. Outline format: Returns table of contents + section anchors + token estimates (~150 tokens)
    if (format === "outline") {
      const outline = await service.getArticleOutline(slug);
      if (!outline) {
        return new Response(JSON.stringify({ success: false, error: "Article not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, outline }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120, s-maxage=600",
        },
      });
    }

    // 2. Section extraction: Returns raw markdown for ONLY that section anchor
    if (sectionAnchor) {
      const section = await service.getArticleSection(slug, sectionAnchor);
      if (!section) {
        return new Response(
          JSON.stringify({ success: false, error: `Section '#${sectionAnchor}' not found in article '${slug}'` }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      if (format === "raw" || acceptHeader.includes("text/markdown")) {
        return new Response(section.content, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=120, s-maxage=600",
            "X-Token-Estimate": String(section.token_estimate),
            "X-Section-Anchor": section.anchor,
          },
        });
      }

      return new Response(JSON.stringify({ success: true, section }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120, s-maxage=600",
        },
      });
    }

    // Fetch full article record
    const article = await service.getArticleBySlug(slug);
    if (!article) {
      return new Response(JSON.stringify({ success: false, error: "Article not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Raw full markdown format
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

    // 4. Full JSON response with problems and outline
    const [problems, outline] = await Promise.all([
      service.getProblemsByParent(slug),
      service.getArticleOutline(slug),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        article,
        problems,
        outline: outline?.sections || [],
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
        source: existing.source || "api",
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
