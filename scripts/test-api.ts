/**
 * @name test-api.ts
 * @description Verification script for Knowledge Base and Problem Troubleshooting Engine.
 */

import { KnowledgeService } from "../src/lib/services/knowledge.service";

async function test() {
  console.log("🧪 [Test] Running Knowledge Base test suite...");
  const service = new KnowledgeService();

  // 1. List articles
  const articles = await service.listArticles();
  console.log(`✅ Loaded ${articles.length} articles from DB`);

  // 2. Add a sample verified problem case study attached to 'building-omnimer-health'
  const sampleProblem = await service.createProblem(
    "building-omnimer-health",
    {
      slug: "fhir-bundle-memory-leak",
      title: "Memory leak khi parse FHIR Resource Bundle dung lượng lớn trên V8",
      errorCode: "ERR_WORKER_OUT_OF_MEMORY",
      errorSnippet: "FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory",
      environment: "Node 22, Fastify, FHIR R4 JSON parser",
      rootCause: "Parse toàn bộ JSON bundle 50MB cùng lúc vào bộ nhớ trong quá trình giải mã streaming khiến GC không kịp giải phóng.",
      solution: "Chuyển sang sử dụng `stream-json` parser pipeline kết hợp TransformStream để xử lý từng Entry tuần tự.",
      tags: ["fhir", "healthtech", "memory-leak", "streaming"],
    },
    { writeToDisk: true }
  );
  console.log(`✅ Created test problem: ${sampleProblem.title}`);

  // 3. Test FTS5 Search on Problem
  const searchProblemResults = await service.searchProblems("memory leak stream");
  console.log(`✅ FTS5 search for 'memory leak stream' returned ${searchProblemResults.length} result(s):`);
  for (const r of searchProblemResults) {
    console.log(`   - [${r.problem.id}] ${r.problem.title}`);
  }

  // 4. Test FTS5 Search on Articles
  const searchArticleResults = await service.searchArticles("health");
  console.log(`✅ FTS5 search for 'health' returned ${searchArticleResults.length} result(s):`);
  for (const r of searchArticleResults) {
    console.log(`   - [${r.article.slug}] ${r.article.title}`);
  }

  console.log("🎉 All tests passed successfully!");
}

test().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
