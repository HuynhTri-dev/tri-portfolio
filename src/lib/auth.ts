/**
 * @name auth.ts
 * @description API Authentication utilities for protecting Knowledge Base write endpoints.
 */

import type { APIContext } from "astro";

/**
 * Validates the Authorization header Bearer token against the configured KB_API_KEY.
 * 
 * @param context Astro APIContext
 * @returns Promise<boolean> true if valid, false otherwise
 */
export async function validateApiKey(context: APIContext): Promise<boolean> {
  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return false;

  let configuredKey =
    (typeof process !== "undefined" && process.env ? process.env.KB_API_KEY : null) ||
    (globalThis as any)?.KB_API_KEY;

  if (!configuredKey) {
    try {
      const cf = await import("cloudflare:workers");
      if (cf?.env?.KB_API_KEY) {
        configuredKey = cf.env.KB_API_KEY;
      }
    } catch {
      // Not in Cloudflare Workers runtime
    }
  }

  configuredKey = configuredKey || "tri-kb-secret-key-2026"; // Fallback dev key

  return token === configuredKey;
}

/**
 * Creates a standard JSON error response for unauthorized requests.
 */
export function unauthorizedResponse(message = "Unauthorized: Invalid or missing API key"): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}
