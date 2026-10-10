---
name: knowlege_search
description: "Guides AI coding agents to search, discover, and retrieve technical knowledge, architectural guides, and verified troubleshooting case studies from the Knowledge Base with zero token waste using FTS5 section-level granularity, error code fast-paths, and compressed Markdown."
triggers:
  - "search knowledge"
  - "tìm kiếm kiến thức"
  - "tra cứu lỗi"
  - "kb search"
  - "troubleshoot"
  - "troubleshoot error"
  - "knowlege_search"
  - "knowledge_search"
---

# Knowledge Base Search & Retrieval Skill

This skill instructs AI coding assistants (Antigravity, Cursor, Claude, Codex) and developers on how to rapidly retrieve targeted technical context from the Cloudflare Edge Knowledge Base (`https://trihuynh.omnimer.io.vn` or `https://tri-portfolio.huynhminhtri1109.workers.dev`) with minimal prompt token consumption.

---

## 1. Core Principles: The Zero-Waste Token Economy

When assisting developers, LLM context windows are precious. Ingesting full 7,000-word architecture guides just to find one configuration flag wastes context and degrades attention quality.

This skill enforces a **Hierarchical Retrieval Strategy**:
1. **Error Code Fast-Path First**: When an exception occurs, match the normalized error code first. Returns the root cause and copy-pasteable fix in under **250 tokens**.
2. **Section Granularity Over Full Articles**: Query sections (`granularity=section`) to receive exact 100-300 token heading snippets instead of multi-thousand token documents.
3. **Outline Before Ingestion**: Before downloading an article body, fetch its outline (`format=outline`) consuming only ~150 tokens. Inspect section anchors and selectively fetch only the required subsection (`format=raw&section={anchor}`).

---

## 2. API Endpoints Quick Reference

| Action | HTTP Request | Output Format | Avg. Tokens |
| :--- | :--- | :--- | :--- |
| **Search Sections** | `GET /api/kb/search?q={query}&granularity=section&format=agent` | Compact Text | ~150 - 300 |
| **Lookup Fix by Error Code**| `GET /api/kb/search?q={errorCode}&format=agent&include=solution` | Plain Text | ~200 - 400 |
| **Get Article Outline** | `GET /api/kb/{slug}?format=outline` | JSON / List | ~150 |
| **Get Target Section** | `GET /api/kb/{slug}?format=raw&section={anchor}` | Raw Markdown | ~120 - 450 |
| **Get Parent Problems** | `GET /api/kb/{parentSlug}/problems` | JSON | ~300 - 800 |
| **Audit Missed Searches** | `GET /api/kb/misses?limit=20` | JSON | ~100 |

**Base URL**: `https://trihuynh.omnimer.io.vn` (Fallback: `https://tri-portfolio.huynhminhtri1109.workers.dev`).

---

## 3. Dedicated CLI Helper Tool

A preconfigured Python CLI tool is available at:
`.agents/skills/knowlege_search/scripts/search_helper.py`

### Common CLI Invocations:

```bash
# 1. Search sections in compact agent plain-text format (Default: section + agent)
python3 .agents/skills/knowlege_search/scripts/search_helper.py query "acks" --granularity section

# 2. Search for an exact error or exception and retrieve the verified fix directly
python3 .agents/skills/knowlege_search/scripts/search_helper.py query "CommitFailedException" --include-solution

# 3. Retrieve an article's outline to see all section headings and token estimates
python3 .agents/skills/knowlege_search/scripts/search_helper.py outline "kafka-core-concepts-and-architecture"

# 4. Fetch ONLY a single section using its heading anchor (handles URL-encoding automatically)
python3 .agents/skills/knowlege_search/scripts/search_helper.py section "kafka-core-concepts-and-architecture" "72-cấu-hình-độ-an-toàn-acks-của-producer"

# 5. Retrieve all troubleshooting cases attached to a parent system
python3 .agents/skills/knowlege_search/scripts/search_helper.py problems "kafka-pbx-event-streaming-architecture"

# 6. Check top search misses to see missing topics or unindexed keywords
python3 .agents/skills/knowlege_search/scripts/search_helper.py misses
```

---

## 4. Step-by-Step Retrieval Workflows

### Workflow 1: Troubleshooting Runtime Bugs & Errors
When you or the user encounter a compiler error, runtime exception, or system crash:

1. **Extract Error Identifier**: Identify the exact error code or class (e.g. `CommitFailedException`, `ERR_WORKER_OUT_OF_MEMORY`, `SQLITE_BUSY`, `DATA_INCONSISTENCY_EVENT_ORDER`).
2. **Execute Fast-Path Query**:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py query "<error_code>" --format agent --include-solution
   ```
3. **Parse Response**:
   - If a matching problem exists: Read the `Root Cause` and `Verified Solution` to fix the user's issue immediately.
   - If no exact hit: Fall back to natural language search query with `granularity=problem`.

### Workflow 2: Researching Architecture & Implementation Patterns
When designing a system component or configuring complex services:

1. **Query Sections with Compact Output**:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py query "<concept_or_keyword>" --granularity section --format agent
   ```
2. **Analyze Match**: Each hit displays:
   - Matching section heading
   - Article URL & Section Anchor
   - Estimated token count (~100-300 tokens)
   - Content snippet
3. **Fetch Exact Subsection If More Context Needed**:
   Use the `Raw Section URL` or pass the anchor to `search_helper.py section <slug> <anchor>`.
   Do NOT download the entire article unless the user explicitly requests an end-to-end review.

### Workflow 3: Discovering Knowledge & Gap Identification
1. If user queries return 0 results, the system automatically registers the query in the `search_misses` table.
2. AI agents can audit these queries via:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py misses
   ```
   This highlights topics where new documentation or troubleshooting cases should be authored using the companion `knowledge_create` skill.

---

## 5. Critical Technical Constraints

1. **Vietnamese Diacritics**:
   The search engine natively folds Vietnamese diacritics (`đ/Đ → d`, NFD stripping). Searching `"dam bao"` correctly matches `"đảm bảo"`. Users and agents may query in plain ASCII or accented Vietnamese.
2. **Edge URL Anchor Percent-Encoding**:
   Cloudflare Edge rejects unencoded non-ASCII characters in GET queries with `HTTP 400 Bad Request`.
   When making direct HTTP requests for a section, anchors containing Vietnamese characters MUST be percent-encoded:
   - Correct: `format=raw&section=72-c%E1%BA%A5u-h%C3%ACnh-%C4%91%E1%BB%99-an-to%C3%A0n-acks-c%E1%BB%A7a-producer`
   - `search_helper.py` handles this percent-encoding automatically.
3. **WAF User-Agent**:
   Cloudflare WAF drops requests from standard `python-urllib` User-Agents with `HTTP 403 Forbidden`. Custom scripts must set `User-Agent: Antigravity-KB-SearchHelper/2.0`.
