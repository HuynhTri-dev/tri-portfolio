/**
 * @name llms.txt.ts (/llms.txt)
 * @description Standardized machine-readable catalog for LLMs and AI Agents (Cursor, Claude, OpenAI).
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

## API Endpoints for AI Agents
- API Documentation (Web): ${siteUrl}/docs/api
- Search Full-Text: ${siteUrl}/api/kb/search?q={query}
- List Articles (JSON): ${siteUrl}/api/kb
- Raw Markdown Template: ${siteUrl}/api/kb/{slug}?format=raw
- Troubleshooting by Parent: ${siteUrl}/api/kb/{parentSlug}/problems

## Knowledge Base Articles
`;

    if (articles.length === 0) {
      text += `\n*No articles indexed yet. Use POST /api/kb or POST /api/kb/sync to populate.*`;
    } else {
      for (const a of articles) {
        const rawUrl = `${siteUrl}/api/kb/${a.slug}?format=raw`;
        const summary = a.summary_for_agents || a.description || "";
        const tags = a.hashtags.join(", ");
        text += `\n- [${a.title}](${rawUrl}): ${summary} (Category: ${a.kb_category} | Tags: ${tags})`;
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
