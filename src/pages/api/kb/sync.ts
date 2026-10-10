/**
 * @name sync.ts (/api/kb/sync)
 * @description API endpoint to scan existing Markdown files and synchronize them into the database.
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../lib/services/knowledge.service";
import { validateApiKey, unauthorizedResponse } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!await validateApiKey(context)) {
    return unauthorizedResponse();
  }

  try {
    const service = new KnowledgeService();

    const result = await service.syncMarkdownFilesToDb();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Synchronized markdown files to database successfully",
        syncedArticles: result.syncedArticles,
        syncedProblems: result.syncedProblems,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Sync failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
