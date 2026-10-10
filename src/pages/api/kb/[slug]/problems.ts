/**
 * @name problems.ts (/api/kb/[slug]/problems)
 * @description API endpoint to list troubleshooting problems (GET) or record a new problem resolution (POST) for a parent article.
 */

import type { APIRoute } from "astro";
import { KnowledgeService } from "../../../../lib/services/knowledge.service";
import { validateApiKey, unauthorizedResponse } from "../../../../lib/auth";

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

    const problems = await service.getProblemsByParent(slug);

    return new Response(
      JSON.stringify({
        success: true,
        parentSlug: slug,
        count: problems.length,
        problems,
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
      JSON.stringify({ success: false, error: error.message || "Failed to fetch problems" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const POST: APIRoute = async (context) => {
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

    const body = await context.request.json();

    if (!body.title || !body.rootCause || (!body.solution && !body.content)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: title, rootCause, solution (or content)",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const created = await service.createProblem(
      slug,
      {
        slug: body.slug,
        title: body.title,
        errorCode: body.errorCode,
        errorSnippet: body.errorSnippet,
        environment: body.environment,
        rootCause: body.rootCause,
        solution: body.solution || body.content,
        tags: body.tags || [],
      },
      { writeToDisk: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Problem record and verified resolution added successfully",
        problem: created,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to create problem" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
