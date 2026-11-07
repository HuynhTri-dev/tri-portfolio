/**
 * @name sync-kb.ts
 * @description CLI script to synchronize local markdown files into the SQLite database.
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { KnowledgeService } from "../src/lib/services/knowledge.service";

async function main() {
  console.log("🚀 [Sync-KB] Initializing Knowledge Base sync...");
  const service = new KnowledgeService();
  const result = await service.syncMarkdownFilesToDb();
  console.log(`✅ [Sync-KB] Successfully indexed ${result.syncedArticles} articles into SQLite!`);

  // Synchronize local SQLite state to Miniflare / Wrangler local D1 instances if present
  const srcDbPath = path.resolve(process.cwd(), "data/knowledge.db");
  const miniflareDir = path.resolve(process.cwd(), ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

  if (fs.existsSync(srcDbPath) && fs.existsSync(miniflareDir)) {
    for (const file of fs.readdirSync(miniflareDir)) {
      if (!file.endsWith(".sqlite") || file === "metadata.sqlite") continue;
      const targetDbPath = path.join(miniflareDir, file);
      try {
        const db = new Database(targetDbPath);
        const artCols = db.prepare("PRAGMA table_info(articles)").all().map((c: any) => c.name);
        if (!artCols.includes("source")) db.exec("ALTER TABLE articles ADD COLUMN source TEXT DEFAULT 'git'");
        if (!artCols.includes("search_text")) db.exec("ALTER TABLE articles ADD COLUMN search_text TEXT");

        const probCols = db.prepare("PRAGMA table_info(kb_problems)").all().map((c: any) => c.name);
        if (!probCols.includes("search_text")) db.exec("ALTER TABLE kb_problems ADD COLUMN search_text TEXT");
        if (!probCols.includes("error_code_norm")) db.exec("ALTER TABLE kb_problems ADD COLUMN error_code_norm TEXT");

        db.prepare("ATTACH DATABASE ? AS source").run(srcDbPath);
        db.exec(`
          INSERT OR REPLACE INTO articles SELECT * FROM source.articles;
          INSERT OR REPLACE INTO kb_problems (id, parent_slug, title, error_code, error_code_norm, error_snippet, environment, root_cause, solution_markdown, tags, file_path, search_text, created_at, updated_at)
            SELECT id, parent_slug, title, error_code, error_code_norm, error_snippet, environment, root_cause, solution_markdown, tags, file_path, search_text, created_at, updated_at FROM source.kb_problems;
          INSERT OR REPLACE INTO article_sections SELECT * FROM source.article_sections;
          INSERT OR REPLACE INTO skill_domains SELECT * FROM source.skill_domains;
          INSERT OR REPLACE INTO skill_nodes SELECT * FROM source.skill_nodes;
          INSERT OR REPLACE INTO skill_graph_edges SELECT * FROM source.skill_graph_edges;
          INSERT OR REPLACE INTO article_skill_links SELECT * FROM source.article_skill_links;
        `);
        db.prepare("DETACH DATABASE source").run();
        console.log(`📦 [Sync-KB] Synced Miniflare D1 store (${file})`);
      } catch (err: any) {
        console.warn(`⚠️ [Sync-KB] Notice for Miniflare store ${file}:`, err.message);
      }
    }
  }
}

main().catch((err) => {
  console.error("❌ [Sync-KB] Sync failed:", err);
  process.exit(1);
});
