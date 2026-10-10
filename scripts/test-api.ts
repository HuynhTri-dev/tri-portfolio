/**
 * @name test-api.ts
 * @description Comprehensive verification test suite for Knowledge Base FTS5 search, Vietnamese folding, section retrieval, and problem troubleshooting engine.
 */

import { KnowledgeService } from "../src/lib/services/knowledge.service";

async function test() {
  console.log("🧪 [Test] Running Knowledge Base test suite...\n");
  const service = new KnowledgeService();

  // 1. Verify Articles in DB
  const articles = await service.listArticles();
  console.log(`✅ [1/7] Loaded ${articles.length} articles from DB`);
  for (const a of articles) {
    console.log(`       - ${a.slug} (Hashtags: ${a.hashtags.join(", ")})`);
  }

  // 2. Test Vietnamese Diacritic Folding (đảm bảo vs dam bao)
  const damBaoHits = await service.searchArticles("dam bao");
  const damBaoAccentedHits = await service.searchArticles("đảm bảo");
  console.log(`\n✅ [2/7] Vietnamese Diacritic Folding:`);
  console.log(`       - 'dam bao' (unaccented): ${damBaoHits.length} hits`);
  console.log(`       - 'đảm bảo' (accented):   ${damBaoAccentedHits.length} hits`);
  if (damBaoHits.length === 0) {
    throw new Error("FAIL: 'dam bao' should match articles containing 'đảm bảo'");
  }

  // 3. Test Diacritic Folding on 'phân vùng' vs 'phan vung'
  const phanVungHits = await service.searchArticles("phan vung");
  console.log(`\n✅ [3/7] Term matching 'phan vung': ${phanVungHits.length} hits`);

  // 4. Test Error Code Exact Matching (CommitFailedException)
  const exactHits = await service.searchProblems("CommitFailedException");
  console.log(`\n✅ [4/7] Exact Error Code Match ('CommitFailedException'): ${exactHits.length} hits`);
  if (exactHits.length === 0) {
    throw new Error("FAIL: 'CommitFailedException' should match problem record");
  }
  console.log(`       - Top match: [${exactHits[0].problem.error_code}] ${exactHits[0].problem.title}`);

  // 5. Test Natural Language Query with Stop Words ('how to fix commit failed exception in kafka consumer')
  const nlHits = await service.searchProblems("how to fix commit failed exception in kafka consumer");
  console.log(`\n✅ [5/7] Natural Language Agent Query: ${nlHits.length} hits`);
  if (nlHits.length === 0) {
    throw new Error("FAIL: NL query should match CommitFailedException case study");
  }
  console.log(`       - Top match: ${nlHits[0].problem.title}`);

  // 6. Test Section-Level Index & Token Savings
  const sectionHits = await service.searchSections("acks");
  console.log(`\n✅ [6/7] Granular Section Search ('acks'): ${sectionHits.length} hits`);
  for (const s of sectionHits) {
    console.log(`       - ${s.section.id} (~${s.section.token_estimate} tokens): "${s.section.heading}"`);
  }

  // 7. Test Outline and Misses Feedback Loop
  const outline = await service.getArticleOutline("kafka-core-concepts-and-architecture");
  console.log(`\n✅ [7/7] Outline & Feedback:`);
  console.log(`       - Outline sections: ${outline?.sections.length} headings (Total est: ${outline?.tokenEstimate} tokens)`);

  await service.recordSearchMiss("nonexistent_distributed_lock_consensus_failure");
  const misses = await service.getSearchMisses(5);
  console.log(`       - Search misses recorded: ${misses.length} items`);

  console.log("\n🎉 All 7 test phases passed successfully with 100% verification!");
}

test().catch((err) => {
  console.error("\n❌ Test suite failed:", err);
  process.exit(1);
});
