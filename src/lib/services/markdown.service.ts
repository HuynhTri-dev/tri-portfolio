/**
 * @name markdown.service.ts
 * @description Markdown rendering service with server-side syntax highlighting (PrismJS) for dynamic content from Cloudflare D1.
 */

import { Marked } from "marked";
import Prism from "prismjs";

// Load syntax grammars for target languages
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-yaml.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-docker.js";
import "prismjs/components/prism-go.js";
import "prismjs/components/prism-rust.js";
import "prismjs/components/prism-markdown.js";

/**
 * Normalizes code block language aliases to supported Prism grammars.
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  py: "python",
  python: "python",
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  zsh: "bash",
  json: "json",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  docker: "docker",
  dockerfile: "docker",
  go: "go",
  golang: "go",
  rust: "rust",
  rs: "rust",
  md: "markdown",
  markdown: "markdown",
  html: "markup",
  xml: "markup",
  css: "css",
};

/**
 * Escapes unsafe HTML characters to prevent XSS in unhighlighted code blocks.
 *
 * @param text - Raw plain text string
 * @returns Sanitized HTML-safe string
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Configured Marked instance with custom code renderer producing GitHub Dark Shiki-compatible markup.
 */
const markedInstance = new Marked({
  renderer: {
    code(token) {
      const rawLang = (token.lang || "").trim().toLowerCase();

      // Preserve Mermaid diagrams for client-side SVG rendering
      if (rawLang === "mermaid") {
        return `<pre><code class="language-mermaid">${token.text}</code></pre>\n`;
      }

      // Preserve Math blocks for KaTeX
      if (rawLang === "math") {
        return `<pre><code class="language-math">${token.text}</code></pre>\n`;
      }

      const normalizedLang = LANGUAGE_ALIASES[rawLang] || rawLang;
      const grammar = Prism.languages[normalizedLang];

      let highlightedCode: string;
      if (grammar) {
        try {
          highlightedCode = Prism.highlight(token.text, grammar, normalizedLang);
        } catch {
          highlightedCode = escapeHtml(token.text);
        }
      } else {
        highlightedCode = escapeHtml(token.text);
      }

      const langAttr = normalizedLang || "plaintext";
      return `<pre class="astro-code github-dark prism-code" style="background-color:#24292e;color:#e1e4e8;overflow-x:auto" tabindex="0" data-language="${langAttr}"><code>${highlightedCode}</code></pre>\n`;
    },
  },
});

/**
 * Parses markdown into HTML with Prism syntax highlighting for code blocks.
 *
 * @param markdown - Raw markdown string to be rendered
 * @returns Rendered HTML string with syntax highlighted code elements
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  if (!markdown) return "";
  return await markedInstance.parse(markdown);
}
