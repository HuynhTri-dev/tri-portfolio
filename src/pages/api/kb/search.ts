/**
 * @name search.ts (/api/kb/search)
 * @description API endpoint for Full-Text Search across articles, sections, and troubleshooting problems with BM25 ranking, section granularity, and agent-optimized plain text output.
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../lib/services/knowledge.service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const url = new URL(context.request.url);
    const query = (url.searchParams.get("q") || "").trim();
    const rawLimit = parseInt(url.searchParams.get("limit") || "10", 10);
    const limit = Math.max(1, Math.min(50, isNaN(rawLimit) ? 10 : rawLimit));
    const granularity = url.searchParams.get("granularity") || url.searchParams.get("type") || "all";
    const format = url.searchParams.get("format") || "json"; // 'json' or 'agent'
    const includeSolution = url.searchParams.get("include") === "solution";

    if (!query) {
      if (format === "agent") {
        return new Response("No query provided. Usage: /api/kb/search?q={keyword}&granularity={all|section|problem}&format=agent\n", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      return new Response(
        JSON.stringify({
          success: true,
          query: "",
          count: 0,
          articles: [],
          sections: [],
          problems: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const service = new KnowledgeService();

    // Run parallel search tasks based on requested granularity
    const searchTasks: [Promise<any[]>, Promise<any[]>, Promise<any[]>] = [
      granularity === "all" || granularity === "article" ? service.searchArticles(query, limit) : Promise.resolve([]),
      granularity === "all" || granularity === "section" ? service.searchSections(query, limit) : Promise.resolve([]),
      granularity === "all" || granularity === "problem" ? service.searchProblems(query, limit) : Promise.resolve([]),
    ];

    const [articleResults, sectionResults, problemResults] = await Promise.all(searchTasks);

    const totalCount = articleResults.length + sectionResults.length + problemResults.length;

    // Record search miss asynchronously if zero hits
    if (totalCount === 0) {
      if (context.locals && (context.locals as any).runtime?.ctx?.waitUntil) {
        (context.locals as any).runtime.ctx.waitUntil(service.recordSearchMiss(query));
      } else {
        service.recordSearchMiss(query).catch(() => {});
      }
    }

    // Format: Agent Plain Text Output (Zero HTML overhead, compressed context for LLM prompt injection)
    if (format === "agent") {
      let agentText = `# Knowledge Base Search: "${query}"\nFound ${totalCount} match(es)\n\n`;

      if (sectionResults.length > 0) {
        agentText += `## Section Hits (High Precision Granularity)\n`;
        for (const s of sectionResults) {
          agentText += `- [Section] ${s.section.heading}\n`;
          agentText += `  Article: /blog/${s.section.slug}#${s.section.anchor}\n`;
          agentText += `  Raw Section URL: /api/kb/${s.section.slug}?format=raw&section=${s.section.anchor}\n`;
          agentText += `  Token Estimate: ~${s.section.token_estimate} tokens\n`;
          agentText += `  Snippet: ${s.snippet.replace(/\[\[|\]\]/g, "")}\n\n`;
        }
      }

      if (problemResults.length > 0) {
        agentText += `## Troubleshooting & Problem Case Studies\n`;
        for (const p of problemResults) {
          agentText += `- [Problem] ${p.problem.title}\n`;
          if (p.problem.error_code) agentText += `  Error Code: ${p.problem.error_code}\n`;
          agentText += `  Parent Article: /blog/${p.problem.parent_slug}\n`;
          agentText += `  Root Cause: ${p.problem.root_cause}\n`;
          if (includeSolution) {
            agentText += `  Verified Solution:\n${p.problem.solution_markdown}\n`;
          } else {
            agentText += `  Solution: (pass include=solution or view /api/kb/${p.problem.parent_slug}/problems)\n`;
          }
          agentText += `\n`;
        }
      }

      if (articleResults.length > 0) {
        agentText += `## Article Matches\n`;
        for (const a of articleResults) {
          agentText += `- [Article] ${a.article.title}\n`;
          agentText += `  Slug: ${a.article.slug} | Category: ${a.article.kb_category}\n`;
          agentText += `  Outline URL: /api/kb/${a.article.slug}?format=outline\n`;
          agentText += `  Raw Markdown URL: /api/kb/${a.article.slug}?format=raw\n`;
          agentText += `  Summary: ${a.article.summary_for_agents || a.article.description}\n\n`;
        }
      }

      return new Response(agentText.trim() + "\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    // Default Format: JSON Response
    const responsePayload = {
      success: true,
      query,
      count: totalCount,
      granularity,
      articles: articleResults.map((r) => ({
        slug: r.article.slug,
        title: r.article.title,
        description: r.article.description,
        snippet: r.snippet,
        kbCategory: r.article.kb_category,
        hashtags: r.article.hashtags,
        url: `/blog/${r.article.slug}`,
        outlineUrl: `/api/kb/${r.article.slug}?format=outline`,
        rawUrl: `/api/kb/${r.article.slug}?format=raw`,
      })),
      sections: sectionResults.map((s) => ({
        id: s.section.id,
        slug: s.section.slug,
        anchor: s.section.anchor,
        heading: s.section.heading,
        level: s.section.level,
        snippet: s.snippet,
        tokenEstimate: s.section.token_estimate,
        url: `/blog/${s.section.slug}#${s.section.anchor}`,
        rawSectionUrl: `/api/kb/${s.section.slug}?format=raw&section=${s.section.anchor}`,
      })),
      problems: problemResults.map((p) => {
        const item: Record<string, any> = {
          id: p.problem.id,
          parentSlug: p.problem.parent_slug,
          title: p.problem.title,
          errorCode: p.problem.error_code,
          snippet: p.snippet,
          tags: p.problem.tags,
          rootCause: p.problem.root_cause,
          parentUrl: `/blog/${p.problem.parent_slug}`,
        };
        if (includeSolution) {
          item.solution = p.problem.solution_markdown;
        }
        return item;
      }),
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Search failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
