/**
 * @name sync-kb.ts
 * @description CLI script to synchronize local markdown files into the SQLite database.
 */

import { KnowledgeService } from "../src/lib/services/knowledge.service";

async function main() {
  console.log("🚀 [Sync-KB] Initializing Knowledge Base sync...");
  const service = new KnowledgeService();
  const result = await service.syncMarkdownFilesToDb();
  console.log(`✅ [Sync-KB] Successfully indexed ${result.syncedArticles} articles into database!`);
}

main().catch((err) => {
  console.error("❌ [Sync-KB] Sync failed:", err);
  process.exit(1);
});
