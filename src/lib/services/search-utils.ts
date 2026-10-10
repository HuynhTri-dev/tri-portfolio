/**
 * @name search-utils.ts
 * @description Search utilities, Vietnamese diacritic folding, query normalization, stop-word filtering, synonym expansion, and section extraction.
 */

import GithubSlugger from "github-slugger";

/**
 * Folds Vietnamese diacritics and converts special characters:
 * - Maps 'đ' and 'Đ' to 'd'
 * - Strips combining diacritical marks (NFD -> NFC)
 * - Converts to lowercase and trims
 * 
 * @param text Input string
 * @returns Normalized unaccented lowercase string
 */
export function foldVietnamese(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
}

/**
 * Common English and Vietnamese stop words for query cleaning.
 * Natural language queries from AI agents contain many of these filler words.
 */
export const STOP_WORDS = new Set([
  // English stop words
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in",
  "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the",
  "their", "then", "there", "these", "they", "this", "to", "was", "will",
  "with", "how", "what", "why", "can", "fix", "guide", "solve", "issue", "problem",
  "about", "from", "when", "where", "which", "who", "all", "any", "both", "each",
  // Vietnamese stop words (already folded to unaccented form)
  "la", "cua", "va", "cac", "nhung", "mot", "cai", "duoc", "cho", "co", "ve",
  "voi", "trong", "nay", "theo", "tai", "tu", "nhu", "de", "do", "bi", "cach",
  "huong", "dan", "lam", "sao", "khi", "nao", "gi", "hay", "nen", "se", "da",
  "dang", "ra", "lai", "qua", "nhieu", "it", "boi", "vi"
]);

/**
 * Bidirectional domain synonym dictionary for architectural & infrastructure queries.
 */
export const SYNONYMS: Record<string, string[]> = {
  "rebalance": ["tai can bang", "rebalancing"],
  "partition": ["phan vung"],
  "consumer lag": ["do tre consumer", "lag"],
  "throughput": ["thong luong"],
  "latency": ["do tre"],
  "concurrency": ["dong thoi"],
  "commit log": ["nhat ky commit"],
  "ordering": ["thu tu"],
  "backpressure": ["ap luc nguoc"],
  "zero copy": ["zero-copy", "pagecache"],
  "zero-copy": ["zero copy", "pagecache"],
  "health": ["suc khoe", "y te", "healthtech"],
  "fhir": ["bundle", "healthtech"],
  "fastify": ["backend", "streaming"],
  "kafka": ["redpanda", "event streaming"],
  "hot partition": ["lech tai", "imbalance"],
  "exception": ["error", "loi"],
  "broker": ["cluster", "cum broker"],
  "kraft": ["zookeeper", "consensus"],
  "replication": ["sao chep", "replica", "isr"]
};

/**
 * Regular expression detecting common exception and error code naming patterns:
 * - CamelCase exceptions: CommitFailedException, OutOfMemoryError
 * - SCREAMING_SNAKE_CASE: ERR_WORKER_OUT_OF_MEMORY, SQLITE_BUSY, DB_CONNECTION_POOL_EXHAUSTION
 */
export const ERROR_CODE_REGEX = /^[A-Z][A-Za-z0-9_.]*(?:Exception|Error)$|^[A-Z0-9_]{4,}$/;

export interface NormalizedQuery {
  raw: string;
  folded: string;
  terms: string[];
  meaningfulTerms: string[];
  isErrorCode: boolean;
  detectedErrorCode?: string;
  synonymExpansions: string[];
}

/**
 * Analyzes and normalizes search queries from humans and AI agents.
 * 
 * @param query Input raw search query string
 * @returns Structured query metadata including stop-word removal and error code detection
 */
export function normalizeSearchQuery(query: string): NormalizedQuery {
  const rawTrimmed = (query || "").trim();
  const folded = foldVietnamese(rawTrimmed);

  // Check for exact or embedded error code
  let isErrorCode = false;
  let detectedErrorCode: string | undefined;

  const words = rawTrimmed.split(/\s+/).filter(Boolean);
  for (const word of words) {
    const cleanWord = word.replace(/[^A-Za-z0-9_.]/g, "");
    if (ERROR_CODE_REGEX.test(cleanWord)) {
      isErrorCode = true;
      detectedErrorCode = cleanWord;
      break;
    }
  }

  // Tokenize and sanitize
  const sanitized = folded.replace(/[^\p{L}\p{N}\s_-]/gu, " ").trim();
  const terms = sanitized.split(/\s+/).filter((t) => t.length > 0);

  // Filter out stop words
  const meaningfulTerms = terms.filter((term) => !STOP_WORDS.has(term));

  // Fallback: if all terms were stop words (e.g. user literally searched "how to"), keep original terms
  const activeTerms = meaningfulTerms.length > 0 ? meaningfulTerms : terms;

  // Check synonym expansions
  const synonymExpansions: string[] = [];
  for (const [key, synList] of Object.entries(SYNONYMS)) {
    const keyFolded = foldVietnamese(key);
    if (folded.includes(keyFolded)) {
      for (const syn of synList) {
        const synFolded = foldVietnamese(syn);
        if (!folded.includes(synFolded)) {
          synonymExpansions.push(synFolded);
        }
      }
    }
  }

  return {
    raw: rawTrimmed,
    folded,
    terms,
    meaningfulTerms: activeTerms,
    isErrorCode,
    detectedErrorCode,
    synonymExpansions,
  };
}

/**
 * Estimates LLM token count from raw text length.
 * Vietnamese text typically tokenizes at ~3.5-4 characters per token.
 * 
 * @param text Input markdown or text
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 3.8));
}

export interface SectionRecord {
  id: string; // slug#anchor
  slug: string;
  anchor: string;
  heading: string;
  level: number;
  ordinal: number;
  content: string;
  token_estimate: number;
  search_text: string;
}

/**
 * Splits a full Markdown document into distinct logical sections by ## and ### headings.
 * Uses GithubSlugger for 100% anchor compatibility with Astro HTML rendering.
 * 
 * @param slug Article slug identifier
 * @param markdown Full markdown body (without frontmatter)
 * @returns Array of section records with anchors and token estimates
 */
export function extractMarkdownSections(slug: string, markdown: string): SectionRecord[] {
  if (!markdown || !markdown.trim()) return [];

  const slugger = new GithubSlugger();
  const lines = markdown.split("\n");
  const sections: SectionRecord[] = [];

  let currentHeading = "Overview";
  let currentAnchor = "overview";
  let currentLevel = 2;
  let currentLines: string[] = [];
  let ordinal = 0;

  function pushSection() {
    const content = currentLines.join("\n").trim();
    if (content.length > 0 || currentAnchor !== "overview") {
      const tokenEst = estimateTokens(content);
      const searchText = foldVietnamese(`${currentHeading} ${content}`);
      sections.push({
        id: `${slug}#${currentAnchor}`,
        slug,
        anchor: currentAnchor,
        heading: currentHeading,
        level: currentLevel,
        ordinal: ordinal++,
        content,
        token_estimate: tokenEst,
        search_text: searchText,
      });
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      // Finalize previous section
      pushSection();

      currentLevel = headingMatch[1].length;
      currentHeading = headingMatch[2].trim();
      currentAnchor = slugger.slug(currentHeading);
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Push the final section
  pushSection();

  return sections;
}
