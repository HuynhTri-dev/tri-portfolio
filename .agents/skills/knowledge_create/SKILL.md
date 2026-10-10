---
name: knowledge_create
description: "Guides the authoring, publishing, and indexing of technical engineering articles and verified troubleshooting case studies into Cloudflare D1 via the Knowledge Base REST API. Activates whenever the user asks to write, publish, or document a new technical article, architecture guide, or when recording an encounter with a bug/error and its verified fix into the knowledge repository."
triggers:
  - "create knowledge base"
  - "write knowledge base"
  - "tạo knowledge"
  - "viết knowledge"
  - "thêm problem"
  - "ghi nhận lỗi"
  - "document bug"
  - "troubleshooting case study"
  - "log fix"
  - "kb api"
  - "knowledge_create"
---

# Knowledge Base Authoring & Troubleshooting Logger Skill

This skill guides AI Agents (Cursor, Claude, Antigravity, Codex) and developers on how to author, publish, and index technical architecture guides and verified troubleshooting case studies into the Edge Knowledge Base (`https://trihuynh.omnimer.io.vn` or `https://tri-portfolio.huynhminhtri1109.workers.dev`).

> [!NOTE]
> For searching, reading article outlines, and section-level querying with minimal token consumption, activate the companion **`knowlege_search`** skill (`.agents/skills/knowlege_search/SKILL.md`).

---

## 1. When to Use This Skill

Activate this skill when:
- **Authoring Articles**: The user requests to write, publish, or index a new engineering knowledge article, system architecture specification, or technical guide.
- **Logging Bug Solutions**: A bug, compiler error, or runtime exception was encountered and solved, and the user wants to record the symptom, root cause, and verified fix for future reference.
- **Syncing Knowledge**: Synchronizing local Markdown files (`src/content/blog/` and `src/content/problems/`) to Cloudflare D1.

---

## 2. API Endpoints Reference (Authoring & Ingestion)

| Purpose | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Create Article** | `POST` | `/api/kb` | **Yes** (`Bearer`) | Inserts article & automatically indexes sections into FTS5. |
| **Update Article** | `PUT` | `/api/kb/{slug}` | **Yes** (`Bearer`) | Updates content & regenerates FTS5 section index. |
| **Add Problem Fix** | `POST` | `/api/kb/{parentSlug}/problems` | **Yes** (`Bearer`) | Attaches verified fix to parent article & indexes into FTS5. |
| **Sync Disk to D1** | `POST` | `/api/kb/sync` | **Yes** (`Bearer`) | Scans local markdown files and syncs to D1 database. |

**Base URL**: `https://trihuynh.omnimer.io.vn` (Fallback: `https://tri-portfolio.huynhminhtri1109.workers.dev`).

---

## 3. Authentication

All write operations (`POST`, `PUT`, `sync`) require the Bearer token header:

```http
Authorization: Bearer <KB_API_KEY>
```

- In production: Configured via Cloudflare Worker secret `KB_API_KEY`.
- In local development: Defaults to `tri-kb-secret-key-2026`.
- The CLI helper `kb_helper.py` reads `os.environ.get("KB_API_KEY", "tri-kb-secret-key-2026")` automatically.

---

## 4. Workflows

### Workflow A: Publishing a New Knowledge Base Article

Follow this standard process when writing and indexing new engineering documentation:

1. **Check for Existing Content**:
   Before authoring, check if an article covering the topic already exists using the search tool:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py query "<topic>"
   ```
2. **Draft Content Using the JSON Template**:
   Inspect or copy the template at:
   [article_payload_template.json](file:///Users/macbookair/Downloads/huynh_minh_tri/tri-portfolio/.agents/skills/knowledge_create/resources/article_payload_template.json)

   Key fields:
   - `slug`: Kebab-case URL identifier (e.g. `sample-edge-streaming-architecture`).
   - `title`: Clear, descriptive technical headline.
   - `description`: 1-2 sentence overview for human readers.
   - `isKnowledgeBase`: `true` (registers into Tier 02 Knowledge Base).
   - `kbCategory`: One of: `architecture`, `research`, `guidelines`, `devops`, `ai-agents`, `backend`.
   - `targetAgents`: Array: `["claude", "cursor", "codex", "anti"]`.
   - `summaryForAgents`: High-density technical summary (30-80 words) optimized for LLM context compression.
   - `content`: Clean, structured Markdown with `##` headings for automatic section-level FTS indexing.
3. **Submit via CLI Helper**:
   ```bash
   python3 .agents/skills/knowledge_create/scripts/kb_helper.py create-article -f .agents/skills/knowledge_create/resources/article_payload_template.json
   ```
4. **Verify Live Section Indexing**:
   Confirm that the section extractor broke down the article into searchable headings:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py outline "<your-slug>"
   ```

---

### Workflow B: Logging a Troubleshooting Case Study

Whenever an unexpected error occurs during development and is successfully fixed, log it immediately so future agent sessions or developers don't have to re-solve it.

1. **Identify Parent System Slug**:
   Choose the parent article slug representing the relevant domain (e.g., `kafka-pbx-event-streaming-architecture`, `kafka-core-concepts-and-architecture`, or `building-omnimer-health`).
2. **Structure Problem Using the JSON Template**:
   Inspect or copy the template at:
   [problem_payload_template.json](file:///Users/macbookair/Downloads/huynh_minh_tri/tri-portfolio/.agents/skills/knowledge_create/resources/problem_payload_template.json)

   Key fields:
   - `title`: Symptom-oriented problem description.
   - `errorCode`: Exact compiler error code or exception class (e.g. `ERR_WORKER_OUT_OF_MEMORY`, `CommitFailedException`).
   - `errorSnippet`: Verbatim stack trace or error log snippet. **Do not summarize or paraphrase error messages.**
   - `environment`: Runtime, versions, and OS details.
   - `rootCause`: Precise mechanical explanation of why the failure occurred.
   - `solution`: Step-by-step resolution, code diff, and verification steps.
   - `tags`: Array of keywords for FTS5 index.
3. **Submit via CLI Helper**:
   ```bash
   python3 .agents/skills/knowledge_create/scripts/kb_helper.py add-problem \
     --parent "<parent-slug>" \
     -f .agents/skills/knowledge_create/resources/problem_payload_template.json
   ```
4. **Test Fast-Path Retrieval**:
   Verify that the problem is instantly discoverable by its error code:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py query "<errorCode>" --include-solution
   ```

---

### Workflow C: Disk-to-Database Synchronization

When working directly with local Git files:
1. Markdown articles live in `src/content/blog/<slug>.md`.
2. Troubleshooting case studies live in `src/content/problems/<parentSlug>/<problemName>.md`.
3. To sync local changes into Cloudflare D1:
   ```bash
   # Option 1: Via CLI Helper
   python3 .agents/skills/knowledge_create/scripts/kb_helper.py sync

   # Option 2: Via npm script
   npm run kb:sync
   ```

---

## 5. Helper Script Reference (`kb_helper.py`)

Located at:
`.agents/skills/knowledge_create/scripts/kb_helper.py`

### Authoring Commands:
```bash
# Create article from payload file
python3 .agents/skills/knowledge_create/scripts/kb_helper.py create-article -f payload.json

# Create article with inline arguments
python3 .agents/skills/knowledge_create/scripts/kb_helper.py create-article \
  --slug "my-feature-guide" \
  --title "My Feature Architecture Guide" \
  --description "Overview of architecture" \
  --category "architecture" \
  --content "# My Feature\n\n## Overview\nGuide content..."

# Add problem case study from payload file
python3 .agents/skills/knowledge_create/scripts/kb_helper.py add-problem \
  --parent "my-feature-guide" \
  -f problem.json

# Add problem with inline arguments
python3 .agents/skills/knowledge_create/scripts/kb_helper.py add-problem \
  --parent "my-feature-guide" \
  --title "Memory Leak under High Load" \
  --error-code "ERR_HEAP_EXHAUSTED" \
  --root-cause "Buffer retaining unbounded stream chunks" \
  --solution "Use stream chunking" \
  --tags "memory,leak,streaming"

# Trigger disk sync
python3 .agents/skills/knowledge_create/scripts/kb_helper.py sync
```

---

## 6. Authoring Quality Standards

1. **Clear Heading Hierarchy**: Use standard Markdown `##` (H2) and `###` (H3) headings. Each heading is indexed as an independent section for granular AI agent retrieval.
2. **Preserve Raw Error Snippets**: Never truncate or reword compiler stack traces in `errorSnippet`. Exact text ensures instant BM25 matching when agents search by exact error signatures.
3. **High-Density Agent Summaries**: Always write a concise 30-80 word technical summary in `summaryForAgents` emphasizing invariants, throughput limits, and integration contracts.
