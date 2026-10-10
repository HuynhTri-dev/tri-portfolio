/**
 * @name knowledge.service.ts
 * @description Core service layer managing Knowledge Base articles, sections FTS5 indexing, troubleshooting problem records, and feedback misses.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getDb, type IDatabase } from "../db/client";
import {
  foldVietnamese,
  normalizeSearchQuery,
  extractMarkdownSections,
  estimateTokens,
  type SectionRecord,
} from "./search-utils";

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  pub_date: string;
  updated_date?: string;
  thumbnail: string;
  thumbnail_alt: string;
  hashtags: string[]; // parsed from JSON
  seo_keywords?: string[];
  draft: boolean;
  is_knowledge_base: boolean;
  kb_category: string;
  target_agents: string[]; // parsed from JSON
  summary_for_agents?: string;
  raw_markdown: string;
  raw_content: string;
  file_path?: string;
  source?: string;
  search_text?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProblemRecord {
  id: string;
  parent_slug: string;
  title: string;
  error_code?: string;
  error_code_norm?: string;
  error_snippet?: string;
  environment?: string;
  root_cause: string;
  solution_markdown: string;
  tags: string[]; // parsed from JSON
  file_path?: string;
  search_text?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleOutline {
  slug: string;
  title: string;
  tokenEstimate: number;
  sections: {
    anchor: string;
    heading: string;
    level: number;
    tokenEstimate: number;
    url: string;
    rawSectionUrl: string;
  }[];
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  description: string;
  pubDate?: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  hashtags: string[];
  seoKeywords?: string[];
  draft?: boolean;
  isKnowledgeBase?: boolean;
  kbCategory?: string;
  targetAgents?: string[];
  summaryForAgents?: string;
  content: string; // Markdown body
  source?: string;
}

export interface CreateProblemInput {
  slug?: string;
  title: string;
  errorCode?: string;
  errorSnippet?: string;
  environment?: string;
  rootCause: string;
  solution: string;
  tags?: string[];
  content?: string;
}

export interface SearchArticleHit {
  article: ArticleRecord;
  snippet: string;
  rank?: number;
}

export interface SearchProblemHit {
  problem: ProblemRecord;
  snippet: string;
  rank?: number;
}

export interface SearchSectionHit {
  section: SectionRecord;
  snippet: string;
  rank?: number;
}

export class KnowledgeService {
  private db: IDatabase;

  constructor(d1Binding?: any) {
    this.db = getDb(d1Binding);
  }

  /**
   * Retrieves a list of articles with optional filtering
   * 
   * @param filters Filtering and pagination parameters
   * @returns Array of matched article records
   */
  async listArticles(
    filters: {
      isKnowledgeBase?: boolean;
      category?: string;
      tag?: string;
      agent?: string;
      includeDrafts?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ArticleRecord[]> {
    let sql = `SELECT * FROM articles WHERE 1=1`;
    const params: unknown[] = [];

    if (!filters.includeDrafts) {
      sql += ` AND draft = 0`;
    }

    if (filters.isKnowledgeBase !== undefined) {
      sql += ` AND is_knowledge_base = ?`;
      params.push(filters.isKnowledgeBase ? 1 : 0);
    }

    if (filters.category) {
      sql += ` AND kb_category = ?`;
      params.push(filters.category);
    }

    if (filters.tag) {
      sql += ` AND hashtags LIKE ?`;
      params.push(`%"${filters.tag}"%`);
    }

    if (filters.agent) {
      sql += ` AND target_agents LIKE ?`;
      params.push(`%"${filters.agent}"%`);
    }

    sql += ` ORDER BY pub_date DESC`;

    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const offset = Math.max(0, filters.offset || 0);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await this.db.query<any>(sql, params);
    return result.results.map((row) => this.mapArticleRow(row));
  }

  /**
   * Retrieves a single article by its unique slug
   * 
   * @param slug Article slug identifier
   * @returns Article record or null if not found
   */
  async getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
    const sql = `SELECT * FROM articles WHERE slug = ? LIMIT 1`;
    const result = await this.db.query<any>(sql, [slug]);
    if (!result.results || result.results.length === 0) return null;
    return this.mapArticleRow(result.results[0]);
  }

  /**
   * Generates a lightweight table of contents / outline for an article with token estimates.
   * Enables AI agents to read the structure (~150 tokens) before selecting specific sections.
   * 
   * @param slug Article slug identifier
   * @returns Article outline with sections metadata, or null if article does not exist
   */
  async getArticleOutline(slug: string): Promise<ArticleOutline | null> {
    const article = await this.getArticleBySlug(slug);
    if (!article) return null;

    const sql = `SELECT * FROM article_sections WHERE slug = ? ORDER BY ordinal ASC`;
    const res = await this.db.query<any>(sql, [slug]);
    const sections = res.results.map((row) => ({
      anchor: row.anchor,
      heading: row.heading,
      level: Number(row.level) || 2,
      tokenEstimate: Number(row.token_estimate) || 0,
      url: `/blog/${slug}#${row.anchor}`,
      rawSectionUrl: `/api/kb/${slug}?format=raw&section=${row.anchor}`,
    }));

    const totalTokens = sections.reduce((sum, s) => sum + s.tokenEstimate, 0) || estimateTokens(article.raw_markdown);

    return {
      slug,
      title: article.title,
      tokenEstimate: totalTokens,
      sections,
    };
  }

  /**
   * Retrieves a single section from an article by heading anchor.
   * 
   * @param slug Article slug
   * @param anchor Heading anchor slug
   * @returns Section record or null
   */
  async getArticleSection(slug: string, anchor: string): Promise<SectionRecord | null> {
    const rawAnchor = anchor.replace(/^#/, "").trim();
    let decodedAnchor = rawAnchor;
    let encodedAnchor = rawAnchor;
    try {
      decodedAnchor = decodeURIComponent(rawAnchor);
      encodedAnchor = encodeURIComponent(decodedAnchor);
    } catch {
      // Fallback
    }

    const sql = `SELECT * FROM article_sections WHERE slug = ? AND (anchor = ? OR anchor = ?) LIMIT 1`;
    const res = await this.db.query<any>(sql, [slug, decodedAnchor, encodedAnchor]);
    if (!res.results || res.results.length === 0) return null;
    const row = res.results[0];
    return {
      id: row.id,
      slug: row.slug,
      anchor: row.anchor,
      heading: row.heading,
      level: Number(row.level),
      ordinal: Number(row.ordinal),
      content: row.content,
      token_estimate: Number(row.token_estimate),
      search_text: row.search_text || "",
    };
  }

  /**
   * Full-Text Search across articles with weighted BM25, diacritic folding, and AND->OR relaxation
   * 
   * @param query Search keywords
   * @param limit Max items returned (clamped 1-50)
   * @returns Array of matched articles with snippets and ranks
   */
  async searchArticles(query: string, limit = 10): Promise<SearchArticleHit[]> {
    const clampedLimit = Math.max(1, Math.min(50, limit));
    const qMeta = normalizeSearchQuery(query);
    if (qMeta.meaningfulTerms.length === 0) return [];

    // Helper to run query with given terms matching expression
    const runFts = async (matchExp: string) => {
      const sql = `
        SELECT 
          a.*, 
          snippet(articles_fts, -1, '[[', ']]', '...', 24) as search_snippet,
          bm25(articles_fts, 0.0, 10.0, 4.0, 3.0, 1.0, 6.0, 1.0, 2.0) as rank
        FROM articles_fts f
        JOIN articles a ON a.rowid = f.rowid
        WHERE articles_fts MATCH ?
        ORDER BY rank ASC, a.pub_date DESC
        LIMIT ?
      `;
      const res = await this.db.query<any>(sql, [matchExp, clampedLimit]);
      return res.results.map((row) => ({
        article: this.mapArticleRow(row),
        snippet: row.search_snippet || row.description || "",
        rank: row.rank,
      }));
    };

    try {
      // 1. Strict AND prefix query
      const andExp = qMeta.meaningfulTerms.map((t) => `"${t}"*`).join(" AND ");
      let results = await runFts(andExp);

      // 2. Relaxed OR fallback if fewer than 3 hits and multiple terms exist
      if (results.length < 3 && qMeta.meaningfulTerms.length > 1) {
        const orTerms = qMeta.meaningfulTerms.slice(0, 6);
        const orExp = orTerms.map((t) => `"${t}"*`).join(" OR ");
        const orResults = await runFts(orExp);

        // Merge results avoiding duplicate slugs
        const seenSlugs = new Set(results.map((r) => r.article.slug));
        for (const item of orResults) {
          if (!seenSlugs.has(item.article.slug)) {
            results.push(item);
            seenSlugs.add(item.article.slug);
          }
        }
      }

      return results.slice(0, clampedLimit);
    } catch (err) {
      console.warn("[KnowledgeService] Article FTS fallback to LIKE:", err);
      const fallbackSql = `
        SELECT *, description as search_snippet FROM articles 
        WHERE title LIKE ? OR description LIKE ? OR search_text LIKE ?
        ORDER BY pub_date DESC LIMIT ?
      `;
      const term = `%${qMeta.folded}%`;
      const res = await this.db.query<any>(fallbackSql, [term, term, term, clampedLimit]);
      return res.results.map((row) => ({
        article: this.mapArticleRow(row),
        snippet: row.description || "",
      }));
    }
  }

  /**
   * Full-Text Search across section-level fragments for high-precision, low-token agent answers.
   * 
   * @param query Search keywords
   * @param limit Max items returned (clamped 1-50)
   * @returns Array of matched sections with anchors and snippets
   */
  async searchSections(query: string, limit = 10): Promise<SearchSectionHit[]> {
    const clampedLimit = Math.max(1, Math.min(50, limit));
    const qMeta = normalizeSearchQuery(query);
    if (qMeta.meaningfulTerms.length === 0) return [];

    const runFts = async (matchExp: string) => {
      const sql = `
        SELECT 
          s.*, 
          snippet(sections_fts, -1, '[[', ']]', '...', 24) as search_snippet,
          bm25(sections_fts, 0.0, 0.0, 10.0, 2.0, 3.0) as rank
        FROM sections_fts f
        JOIN article_sections s ON s.rowid = f.rowid
        WHERE sections_fts MATCH ?
        ORDER BY rank ASC, s.ordinal ASC
        LIMIT ?
      `;
      const res = await this.db.query<any>(sql, [matchExp, clampedLimit]);
      return res.results.map((row) => ({
        section: {
          id: row.id,
          slug: row.slug,
          anchor: row.anchor,
          heading: row.heading,
          level: Number(row.level),
          ordinal: Number(row.ordinal),
          content: row.content,
          token_estimate: Number(row.token_estimate),
          search_text: row.search_text || "",
        },
        snippet: row.search_snippet || row.heading || "",
        rank: row.rank,
      }));
    };

    try {
      const andExp = qMeta.meaningfulTerms.map((t) => `"${t}"*`).join(" AND ");
      let results = await runFts(andExp);

      if (results.length < 3 && qMeta.meaningfulTerms.length > 1) {
        const orTerms = qMeta.meaningfulTerms.slice(0, 6);
        const orExp = orTerms.map((t) => `"${t}"*`).join(" OR ");
        const orResults = await runFts(orExp);

        const seenIds = new Set(results.map((r) => r.section.id));
        for (const item of orResults) {
          if (!seenIds.has(item.section.id)) {
            results.push(item);
            seenIds.add(item.section.id);
          }
        }
      }

      return results.slice(0, clampedLimit);
    } catch (err) {
      console.warn("[KnowledgeService] Sections FTS fallback to LIKE:", err);
      const fallbackSql = `
        SELECT *, heading as search_snippet FROM article_sections
        WHERE heading LIKE ? OR search_text LIKE ?
        ORDER BY ordinal ASC LIMIT ?
      `;
      const term = `%${qMeta.folded}%`;
      const res = await this.db.query<any>(fallbackSql, [term, term, clampedLimit]);
      return res.results.map((row) => ({
        section: {
          id: row.id,
          slug: row.slug,
          anchor: row.anchor,
          heading: row.heading,
          level: Number(row.level),
          ordinal: Number(row.ordinal),
          content: row.content,
          token_estimate: Number(row.token_estimate),
          search_text: row.search_text || "",
        },
        snippet: row.heading || "",
      }));
    }
  }

  /**
   * Full-Text Search across known problems and error solutions with exact error code fast-path.
   * 
   * @param query Search query or error code
   * @param limit Max items returned
   * @returns Array of matched troubleshooting records
   */
  async searchProblems(query: string, limit = 10): Promise<SearchProblemHit[]> {
    const clampedLimit = Math.max(1, Math.min(50, limit));
    const qMeta = normalizeSearchQuery(query);
    if (qMeta.meaningfulTerms.length === 0 && !qMeta.detectedErrorCode) return [];

    const problemHits: SearchProblemHit[] = [];
    const seenIds = new Set<string>();

    // Fast-path: Exact lookup on error_code_norm if error code pattern detected
    if (qMeta.detectedErrorCode) {
      const codeNorm = qMeta.detectedErrorCode.toUpperCase();
      const exactSql = `
        SELECT * FROM kb_problems 
        WHERE error_code_norm LIKE ? OR error_code LIKE ?
        ORDER BY created_at DESC LIMIT 5
      `;
      const exactRes = await this.db.query<any>(exactSql, [`%${codeNorm}%`, `%${qMeta.detectedErrorCode}%`]);
      for (const row of exactRes.results) {
        problemHits.push({
          problem: this.mapProblemRow(row),
          snippet: `[Exact Error Match] ${row.title}: ${row.root_cause}`,
          rank: -100.0,
        });
        seenIds.add(row.id);
      }
    }

    const runFts = async (matchExp: string) => {
      const sql = `
        SELECT 
          p.*, 
          snippet(kb_problems_fts, -1, '[[', ']]', '...', 24) as search_snippet,
          bm25(kb_problems_fts, 0.0, 0.0, 8.0, 10.0, 5.0, 3.0, 2.0, 3.0, 2.0) as rank
        FROM kb_problems_fts f
        JOIN kb_problems p ON p.rowid = f.rowid
        WHERE kb_problems_fts MATCH ?
        ORDER BY rank ASC, p.created_at DESC
        LIMIT ?
      `;
      const res = await this.db.query<any>(sql, [matchExp, clampedLimit]);
      return res.results.map((row) => ({
        problem: this.mapProblemRow(row),
        snippet: row.search_snippet || row.root_cause || "",
        rank: row.rank,
      }));
    };

    try {
      const andExp = qMeta.meaningfulTerms.map((t) => `"${t}"*`).join(" AND ");
      let ftsResults = await runFts(andExp);

      if (ftsResults.length < 3 && qMeta.meaningfulTerms.length > 1) {
        const orTerms = qMeta.meaningfulTerms.slice(0, 6);
        const orExp = orTerms.map((t) => `"${t}"*`).join(" OR ");
        const orResults = await runFts(orExp);

        const localSeen = new Set(ftsResults.map((r) => r.problem.id));
        for (const item of orResults) {
          if (!localSeen.has(item.problem.id)) {
            ftsResults.push(item);
            localSeen.add(item.problem.id);
          }
        }
      }

      for (const item of ftsResults) {
        if (!seenIds.has(item.problem.id)) {
          problemHits.push(item);
          seenIds.add(item.problem.id);
        }
      }

      return problemHits.slice(0, clampedLimit);
    } catch {
      const fallbackSql = `
        SELECT *, root_cause as search_snippet FROM kb_problems
        WHERE title LIKE ? OR error_code LIKE ? OR error_snippet LIKE ? OR search_text LIKE ?
        ORDER BY created_at DESC LIMIT ?
      `;
      const term = `%${qMeta.folded}%`;
      const res = await this.db.query<any>(fallbackSql, [term, term, term, term, clampedLimit]);
      for (const row of res.results) {
        if (!seenIds.has(row.id)) {
          problemHits.push({
            problem: this.mapProblemRow(row),
            snippet: row.root_cause || "",
          });
          seenIds.add(row.id);
        }
      }
      return problemHits.slice(0, clampedLimit);
    }
  }

  /**
   * Logs a zero-result search query into search_misses table asynchronously.
   * Provides signals on missing documentation to guide future knowledge creation.
   * 
   * @param query Search query string
   */
  async recordSearchMiss(query: string): Promise<void> {
    const qMeta = normalizeSearchQuery(query);
    if (!qMeta.folded || qMeta.folded.length < 3) return;

    try {
      const sql = `
        INSERT INTO search_misses (q_norm, hits, last_seen)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(q_norm) DO UPDATE SET hits = hits + 1, last_seen = CURRENT_TIMESTAMP
      `;
      await this.db.execute(sql, [qMeta.folded]);
    } catch (err) {
      console.warn("[KnowledgeService] Failed to record search miss:", err);
    }
  }

  /**
   * Retrieves top missed search queries to prioritize new knowledge articles.
   * 
   * @param limit Max records returned
   * @returns Array of query strings and hit counts
   */
  async getSearchMisses(limit = 20): Promise<{ q_norm: string; hits: number; last_seen: string }[]> {
    const sql = `SELECT * FROM search_misses ORDER BY hits DESC, last_seen DESC LIMIT ?`;
    const res = await this.db.query<any>(sql, [limit]);
    return res.results.map((r) => ({
      q_norm: r.q_norm,
      hits: Number(r.hits),
      last_seen: r.last_seen,
    }));
  }

  /**
   * Creates or updates an article in the database, extracts section fragments, and optionally writes to disk.
   * 
   * @param input Article input data
   * @param options Execution options (e.g. writeToDisk)
   * @returns Created article record
   */
  async upsertArticle(input: CreateArticleInput, options: { writeToDisk?: boolean } = {}): Promise<ArticleRecord> {
    const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const pubDate = input.pubDate || new Date().toISOString();
    const updatedDate = new Date().toISOString();
    const hashtags = input.hashtags || ["Engineering"];
    const targetAgents = input.targetAgents || ["claude", "cursor", "codex", "anti"];
    const isKnowledgeBase = input.isKnowledgeBase ?? true;
    const kbCategory = input.kbCategory || "general";
    const draft = input.draft ? 1 : 0;
    const thumbnail = input.thumbnail || "/images/blog/default.png";
    const thumbnailAlt = input.thumbnailAlt || input.title;
    const source = input.source || "git";

    // Generate folded search_text for 100% Vietnamese recall
    const searchText = foldVietnamese(
      `${input.title} ${input.description} ${hashtags.join(" ")} ${input.summaryForAgents || ""} ${input.content}`
    );

    // Generate YAML frontmatter
    const frontmatterData: Record<string, any> = {
      title: input.title,
      description: input.description,
      pubDate,
      updatedDate,
      thumbnail,
      thumbnailAlt,
      hashtags,
      draft: !!input.draft,
      isKnowledgeBase,
      kbCategory,
      targetAgents,
    };
    if (input.seoKeywords?.length) frontmatterData.seoKeywords = input.seoKeywords;
    if (input.summaryForAgents) frontmatterData.summaryForAgents = input.summaryForAgents;

    const fullContent = matter.stringify(input.content || "", frontmatterData);
    const filePath = `src/content/blog/${slug}.mdx`;

    if (options.writeToDisk && typeof process !== "undefined" && process.cwd) {
      try {
        const fullDiskPath = path.resolve(process.cwd(), filePath);
        const dir = path.dirname(fullDiskPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullDiskPath, fullContent, "utf-8");
      } catch (err) {
        console.warn("[KnowledgeService] Disk write skipped or failed:", err);
      }
    }

    const sql = `
      INSERT INTO articles (
        id, slug, title, description, pub_date, updated_date, thumbnail, thumbnail_alt,
        hashtags, seo_keywords, draft, is_knowledge_base, kb_category, target_agents,
        summary_for_agents, raw_markdown, raw_content, file_path, source, search_text, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      )
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        updated_date = excluded.updated_date,
        thumbnail = excluded.thumbnail,
        thumbnail_alt = excluded.thumbnail_alt,
        hashtags = excluded.hashtags,
        seo_keywords = excluded.seo_keywords,
        draft = excluded.draft,
        is_knowledge_base = excluded.is_knowledge_base,
        kb_category = excluded.kb_category,
        target_agents = excluded.target_agents,
        summary_for_agents = excluded.summary_for_agents,
        raw_markdown = excluded.raw_markdown,
        raw_content = excluded.raw_content,
        file_path = excluded.file_path,
        source = excluded.source,
        search_text = excluded.search_text,
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.db.execute(sql, [
      slug,
      slug,
      input.title,
      input.description,
      pubDate,
      updatedDate,
      thumbnail,
      thumbnailAlt,
      JSON.stringify(hashtags),
      JSON.stringify(input.seoKeywords || []),
      draft,
      isKnowledgeBase ? 1 : 0,
      kbCategory,
      JSON.stringify(targetAgents),
      input.summaryForAgents || "",
      input.content,
      fullContent,
      filePath,
      source,
      searchText,
    ]);

    // Split markdown and synchronize article_sections
    const sections = extractMarkdownSections(slug, input.content);
    await this.syncArticleSections(slug, sections);

    const created = await this.getArticleBySlug(slug);
    return created!;
  }

  /**
   * Synchronizes section fragments into article_sections table.
   * 
   * @param slug Article slug
   * @param sections Extracted section records
   */
  private async syncArticleSections(slug: string, sections: SectionRecord[]): Promise<void> {
    try {
      await this.db.execute(`DELETE FROM article_sections WHERE slug = ?`, [slug]);
      for (const s of sections) {
        const sql = `
          INSERT INTO article_sections (
            id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        await this.db.execute(sql, [
          s.id,
          s.slug,
          s.anchor,
          s.heading,
          s.level,
          s.ordinal,
          s.content,
          s.token_estimate,
          s.search_text,
        ]);
      }
    } catch (err) {
      console.warn("[KnowledgeService] Failed to sync sections:", err);
    }
  }

  /**
   * Attaches a troubleshooting problem and verified solution to a parent article.
   * 
   * @param parentSlug Slug of the parent knowledge article
   * @param input Problem description, error codes, and solution
   * @param options Execution options (e.g. writeToDisk)
   * @returns Created problem record
   */
  async createProblem(
    parentSlug: string,
    input: CreateProblemInput,
    options: { writeToDisk?: boolean } = {}
  ): Promise<ProblemRecord> {
    const parent = await this.getArticleBySlug(parentSlug);
    if (!parent) {
      throw new Error(`Parent knowledge article not found with slug: ${parentSlug}`);
    }

    const problemSlug =
      input.slug ||
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .slice(0, 50);
    const problemId = `${parentSlug}-${problemSlug}`;
    const tags = input.tags || ["troubleshooting"];
    const solutionMarkdown = input.solution || input.content || "";
    const filePath = `src/content/problems/${parentSlug}/${problemSlug}.md`;

    const errorCode = input.errorCode || "";
    const errorCodeNorm = errorCode.toUpperCase().replace(/[^A-Z0-9_]/g, "");

    const searchText = foldVietnamese(
      `${input.title} ${errorCode} ${errorCodeNorm} ${input.errorSnippet || ""} ${input.rootCause} ${solutionMarkdown} ${tags.join(" ")}`
    );

    const problemFrontmatter = {
      title: input.title,
      parentSlug,
      errorCode,
      environment: input.environment || "",
      tags,
      date: new Date().toISOString(),
    };
    const bodyContent = `
## Error Symptoms
\`\`\`
${input.errorSnippet || "N/A"}
\`\`\`

## Root Cause
${input.rootCause}

## Verified Solution
${solutionMarkdown}
`.trim();

    const fullContent = matter.stringify(bodyContent, problemFrontmatter);

    if (options.writeToDisk && typeof process !== "undefined" && process.cwd) {
      try {
        const fullDiskPath = path.resolve(process.cwd(), filePath);
        const dir = path.dirname(fullDiskPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullDiskPath, fullContent, "utf-8");
      } catch (err) {
        console.warn("[KnowledgeService] Problem disk write skipped:", err);
      }
    }

    const sql = `
      INSERT INTO kb_problems (
        id, parent_slug, title, error_code, error_code_norm, error_snippet, environment,
        root_cause, solution_markdown, tags, file_path, search_text, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        error_code = excluded.error_code,
        error_code_norm = excluded.error_code_norm,
        error_snippet = excluded.error_snippet,
        environment = excluded.environment,
        root_cause = excluded.root_cause,
        solution_markdown = excluded.solution_markdown,
        tags = excluded.tags,
        file_path = excluded.file_path,
        search_text = excluded.search_text,
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.db.execute(sql, [
      problemId,
      parentSlug,
      input.title,
      errorCode,
      errorCodeNorm,
      input.errorSnippet || "",
      input.environment || "",
      input.rootCause,
      solutionMarkdown,
      JSON.stringify(tags),
      filePath,
      searchText,
    ]);

    const res = await this.db.query<any>(`SELECT * FROM kb_problems WHERE id = ? LIMIT 1`, [problemId]);
    return this.mapProblemRow(res.results[0]);
  }

  /**
   * Retrieves all verified problem resolutions attached to a parent article.
   * 
   * @param parentSlug Slug of the parent article
   * @returns Array of problem records
   */
  async getProblemsByParent(parentSlug: string): Promise<ProblemRecord[]> {
    const sql = `SELECT * FROM kb_problems WHERE parent_slug = ? ORDER BY created_at DESC`;
    const res = await this.db.query<any>(sql, [parentSlug]);
    return res.results.map((row) => this.mapProblemRow(row));
  }

  /**
   * Scans local markdown files in src/content/blog and src/content/problems and synchronizes them into the database.
   * Single source of truth: Git files populate D1 with all metadata preserved.
   * 
   * @returns Count of synced articles and problems
   */
  async syncMarkdownFilesToDb(): Promise<{ syncedArticles: number; syncedProblems: number }> {
    if (typeof process === "undefined" || !process.cwd) {
      return { syncedArticles: 0, syncedProblems: 0 };
    }

    let syncedArticles = 0;
    let syncedProblems = 0;

    // 1. Sync blog articles
    const blogDir = path.resolve(process.cwd(), "src/content/blog");
    if (fs.existsSync(blogDir)) {
      const files = fs.readdirSync(blogDir);
      for (const file of files) {
        if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
        const fullPath = path.join(blogDir, file);
        const contentStr = fs.readFileSync(fullPath, "utf-8");
        const parsed = matter(contentStr);

        const slug = file.replace(/\.(md|mdx)$/, "");
        const data = parsed.data || {};

        await this.upsertArticle(
          {
            slug,
            title: data.title || slug,
            description: data.description || "",
            pubDate: data.pubDate ? new Date(data.pubDate).toISOString() : new Date().toISOString(),
            thumbnail: data.thumbnail || "/images/blog/default.png",
            thumbnailAlt: data.thumbnailAlt || data.title || "",
            hashtags: Array.isArray(data.hashtags) ? data.hashtags : ["Engineering"],
            seoKeywords: data.seoKeywords || [],
            draft: !!data.draft,
            isKnowledgeBase: data.isKnowledgeBase !== undefined ? !!data.isKnowledgeBase : true,
            kbCategory: data.kbCategory || "general",
            targetAgents: data.targetAgents || ["claude", "cursor", "codex", "anti"],
            summaryForAgents: data.summaryForAgents || data.description || "",
            content: parsed.content || "",
            source: "git",
          },
          { writeToDisk: false }
        );
        syncedArticles++;
      }
    }

    // 2. Sync problems from src/content/problems/{parentSlug}/*.md
    const problemsDir = path.resolve(process.cwd(), "src/content/problems");
    if (fs.existsSync(problemsDir)) {
      const parentDirs = fs.readdirSync(problemsDir);
      for (const parentSlug of parentDirs) {
        const fullParentDir = path.join(problemsDir, parentSlug);
        if (!fs.statSync(fullParentDir).isDirectory()) continue;

        const problemFiles = fs.readdirSync(fullParentDir);
        for (const pFile of problemFiles) {
          if (!pFile.endsWith(".md")) continue;
          const fullPath = path.join(fullParentDir, pFile);
          const raw = fs.readFileSync(fullPath, "utf-8");
          const parsed = matter(raw);
          const data = parsed.data || {};

          // Extract sections from body
          const body = parsed.content || "";
          let symptoms = "";
          let rootCause = "";
          let solution = "";

          const symptomMatch = body.match(/## Error Symptoms\s*```[\r\n]+([\s\S]*?)```/);
          if (symptomMatch) symptoms = symptomMatch[1].trim();

          const rootMatch = body.match(/## Root Cause\s*([\s\S]*?)(?=## Verified Solution|$)/);
          if (rootMatch) rootCause = rootMatch[1].trim();

          const solutionMatch = body.match(/## Verified Solution\s*([\s\S]*?)$/);
          if (solutionMatch) solution = solutionMatch[1].trim();

          const problemSlug = pFile.replace(/\.md$/, "");

          await this.createProblem(
            parentSlug,
            {
              slug: problemSlug,
              title: data.title || problemSlug,
              errorCode: data.errorCode || "",
              errorSnippet: symptoms,
              environment: data.environment || "",
              rootCause: rootCause || data.title || "",
              solution: solution || body,
              tags: Array.isArray(data.tags) ? data.tags : ["troubleshooting"],
            },
            { writeToDisk: false }
          );
          syncedProblems++;
        }
      }
    }

    return { syncedArticles, syncedProblems };
  }

  private mapArticleRow(row: any): ArticleRecord {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      pub_date: row.pub_date,
      updated_date: row.updated_date,
      thumbnail: row.thumbnail,
      thumbnail_alt: row.thumbnail_alt,
      hashtags: typeof row.hashtags === "string" ? JSON.parse(row.hashtags) : row.hashtags || [],
      seo_keywords: typeof row.seo_keywords === "string" ? JSON.parse(row.seo_keywords) : row.seo_keywords || [],
      draft: Boolean(row.draft),
      is_knowledge_base: Boolean(row.is_knowledge_base),
      kb_category: row.kb_category,
      target_agents: typeof row.target_agents === "string" ? JSON.parse(row.target_agents) : row.target_agents || [],
      summary_for_agents: row.summary_for_agents,
      raw_markdown: row.raw_markdown,
      raw_content: row.raw_content,
      file_path: row.file_path,
      source: row.source || "git",
      search_text: row.search_text || "",
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapProblemRow(row: any): ProblemRecord {
    return {
      id: row.id,
      parent_slug: row.parent_slug,
      title: row.title,
      error_code: row.error_code,
      error_code_norm: row.error_code_norm,
      error_snippet: row.error_snippet,
      environment: row.environment,
      root_cause: row.root_cause,
      solution_markdown: row.solution_markdown,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [],
      file_path: row.file_path,
      search_text: row.search_text || "",
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
