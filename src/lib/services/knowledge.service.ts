/**
 * @name knowledge.service.ts
 * @description Core service layer managing Knowledge Base articles, full-text search indexing, and troubleshooting problem records.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getDb, type IDatabase } from "../db/client";

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
  created_at?: string;
  updated_at?: string;
}

export interface ProblemRecord {
  id: string;
  parent_slug: string;
  title: string;
  error_code?: string;
  error_snippet?: string;
  environment?: string;
  root_cause: string;
  solution_markdown: string;
  tags: string[]; // parsed from JSON
  file_path?: string;
  created_at?: string;
  updated_at?: string;
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

export class KnowledgeService {
  private db: IDatabase;

  constructor(d1Binding?: any) {
    this.db = getDb(d1Binding);
  }

  /**
   * Retrieves a list of articles with optional filtering
   */
  async listArticles(filters: {
    isKnowledgeBase?: boolean;
    category?: string;
    tag?: string;
    agent?: string;
    includeDrafts?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ArticleRecord[]> {
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

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await this.db.query<any>(sql, params);
    return result.results.map((row) => this.mapArticleRow(row));
  }

  /**
   * Retrieves a single article by its unique slug
   */
  async getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
    const sql = `SELECT * FROM articles WHERE slug = ? LIMIT 1`;
    const result = await this.db.query<any>(sql, [slug]);
    if (!result.results || result.results.length === 0) return null;
    return this.mapArticleRow(result.results[0]);
  }

  /**
   * Full-Text Search across articles using SQLite FTS5 with BM25 ranking
   */
  async searchArticles(query: string, limit = 10): Promise<{ article: ArticleRecord; snippet: string }[]> {
    if (!query || !query.trim()) return [];

    // Sanitize query for FTS5 (preserve alphanumeric and spaces)
    const sanitized = query.replace(/[^\p{L}\p{N}\s_-]/gu, " ").trim();
    if (!sanitized) return [];

    // Build FTS MATCH expression: individual terms joined by AND
    const terms = sanitized.split(/\s+/).filter(Boolean);
    const matchQuery = terms.map((t) => `"${t}"*`).join(" AND ");

    const sql = `
      SELECT 
        a.*, 
        snippet(articles_fts, 6, '<mark>', '</mark>', '...', 24) as search_snippet,
        bm25(articles_fts) as rank
      FROM articles_fts f
      JOIN articles a ON a.rowid = f.rowid
      WHERE articles_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `;

    try {
      const res = await this.db.query<any>(sql, [matchQuery, limit]);
      return res.results.map((row) => ({
        article: this.mapArticleRow(row),
        snippet: row.search_snippet || row.description || "",
      }));
    } catch (err) {
      console.warn("[KnowledgeService] FTS5 search fallback:", err);
      // Fallback to LIKE if FTS expression fails
      const fallbackSql = `
        SELECT *, description as search_snippet FROM articles 
        WHERE title LIKE ? OR description LIKE ? OR raw_markdown LIKE ?
        ORDER BY pub_date DESC LIMIT ?
      `;
      const term = `%${sanitized}%`;
      const res = await this.db.query<any>(fallbackSql, [term, term, term, limit]);
      return res.results.map((row) => ({
        article: this.mapArticleRow(row),
        snippet: row.description || "",
      }));
    }
  }

  /**
   * Creates or updates an article in the database and optionally writes to disk
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
    let filePath = `src/content/blog/${slug}.mdx`;

    // Optionally write to local disk if running in Node environment
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
        summary_for_agents, raw_markdown, raw_content, file_path, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, CURRENT_TIMESTAMP
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
    ]);

    const created = await this.getArticleBySlug(slug);
    return created!;
  }

  /**
   * Attaches a troubleshooting problem and verified solution to a parent article
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

    // Construct Markdown file content
    const problemFrontmatter = {
      title: input.title,
      parentSlug,
      errorCode: input.errorCode || "",
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
        id, parent_slug, title, error_code, error_snippet, environment,
        root_cause, solution_markdown, tags, file_path, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        error_code = excluded.error_code,
        error_snippet = excluded.error_snippet,
        environment = excluded.environment,
        root_cause = excluded.root_cause,
        solution_markdown = excluded.solution_markdown,
        tags = excluded.tags,
        file_path = excluded.file_path,
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.db.execute(sql, [
      problemId,
      parentSlug,
      input.title,
      input.errorCode || "",
      input.errorSnippet || "",
      input.environment || "",
      input.rootCause,
      solutionMarkdown,
      JSON.stringify(tags),
      filePath,
    ]);

    const res = await this.db.query<any>(`SELECT * FROM kb_problems WHERE id = ? LIMIT 1`, [problemId]);
    return this.mapProblemRow(res.results[0]);
  }

  /**
   * Retrieves all verified problem resolutions attached to a parent article
   */
  async getProblemsByParent(parentSlug: string): Promise<ProblemRecord[]> {
    const sql = `SELECT * FROM kb_problems WHERE parent_slug = ? ORDER BY created_at DESC`;
    const res = await this.db.query<any>(sql, [parentSlug]);
    return res.results.map((row) => this.mapProblemRow(row));
  }

  /**
   * Full-Text Search across known problems and error solutions
   */
  async searchProblems(query: string, limit = 10): Promise<{ problem: ProblemRecord; snippet: string }[]> {
    if (!query || !query.trim()) return [];

    const sanitized = query.replace(/[^\p{L}\p{N}\s_-]/gu, " ").trim();
    if (!sanitized) return [];

    const terms = sanitized.split(/\s+/).filter(Boolean);
    const matchQuery = terms.map((t) => `"${t}"*`).join(" AND ");

    const sql = `
      SELECT 
        p.*, 
        snippet(kb_problems_fts, 5, '<mark>', '</mark>', '...', 24) as search_snippet,
        bm25(kb_problems_fts) as rank
      FROM kb_problems_fts f
      JOIN kb_problems p ON p.rowid = f.rowid
      WHERE kb_problems_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `;

    try {
      const res = await this.db.query<any>(sql, [matchQuery, limit]);
      return res.results.map((row) => ({
        problem: this.mapProblemRow(row),
        snippet: row.search_snippet || row.root_cause || "",
      }));
    } catch {
      const fallbackSql = `
        SELECT *, root_cause as search_snippet FROM kb_problems
        WHERE title LIKE ? OR error_code LIKE ? OR error_snippet LIKE ? OR root_cause LIKE ?
        ORDER BY created_at DESC LIMIT ?
      `;
      const term = `%${sanitized}%`;
      const res = await this.db.query<any>(fallbackSql, [term, term, term, term, limit]);
      return res.results.map((row) => ({
        problem: this.mapProblemRow(row),
        snippet: row.root_cause || "",
      }));
    }
  }

  /**
   * Scans local markdown files and synchronizes them into the database
   */
  async syncMarkdownFilesToDb(): Promise<{ syncedArticles: number; syncedProblems: number }> {
    if (typeof process === "undefined" || !process.cwd) {
      return { syncedArticles: 0, syncedProblems: 0 };
    }

    let syncedArticles = 0;
    let syncedProblems = 0;

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
          },
          { writeToDisk: false }
        );
        syncedArticles++;
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
      error_snippet: row.error_snippet,
      environment: row.environment,
      root_cause: row.root_cause,
      solution_markdown: row.solution_markdown,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [],
      file_path: row.file_path,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
