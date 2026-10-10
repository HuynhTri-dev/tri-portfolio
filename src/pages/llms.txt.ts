/**
 * @name llms.txt.ts (/llms.txt)
 * @description Standardized machine-readable catalog for LLMs and AI Agents (Cursor, Claude, OpenAI, Antigravity).
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../lib/services/knowledge.service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const service = new KnowledgeService();

    const articles = await service.listArticles({ isKnowledgeBase: true, limit: 100 });
    const siteUrl = context.site?.toString().replace(/\/$/, "") || "https://trihuynh.omnimer.io.vn";

    let text = `# Huynh Minh Tri — Engineering Knowledge Base & Research
> Technical architecture notes, verified troubleshooting guides, and system designs for AI Coding Agents (Claude, Cursor, Codex, Antigravity).

## API Endpoints for AI Agents (High Token Efficiency)
- API Documentation (Web): ${siteUrl}/docs/api
- Search (Universal JSON): ${siteUrl}/api/kb/search?q={query}
- Search (Section Granularity): ${siteUrl}/api/kb/search?q={query}&granularity=section
- Search (Agent Plain Text): ${siteUrl}/api/kb/search?q={query}&format=agent
- Article Outline & Headings (~150 tokens): ${siteUrl}/api/kb/{slug}?format=outline
- Granular Section Markdown: ${siteUrl}/api/kb/{slug}?format=raw&section={anchor}
- Full Raw Markdown Body: ${siteUrl}/api/kb/{slug}?format=raw
- Verified Troubleshooting Fixes: ${siteUrl}/api/kb/{parentSlug}/problems
- Top Missing Content Feedback: ${siteUrl}/api/kb/misses

## Knowledge Base Articles
`;

    if (articles.length === 0) {
      text += `\n*No articles indexed yet. Use npm run kb:sync or POST /api/kb to populate.*`;
    } else {
      for (const a of articles) {
        const rawUrl = `${siteUrl}/api/kb/${a.slug}?format=raw`;
        const outlineUrl = `${siteUrl}/api/kb/${a.slug}?format=outline`;
        const summary = a.summary_for_agents || a.description || "";
        const tags = a.hashtags.join(", ");
        text += `\n- [${a.title}](${rawUrl}): ${summary}\n  - Outline: ${outlineUrl}\n  - Category: ${a.kb_category} | Tags: ${tags}\n`;
      }
    }

    return new Response(text.trim() + "\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    });
  } catch (error: any) {
    console.error("LLMS.TXT ERROR STACK:", error);
    return new Response(`# Error generating llms.txt: ${error.message}\n${error.stack}\n`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
};
