---
name: knowledge_create
description: "Guides the creation, indexing, troubleshooting logging, and querying of technical knowledge base articles and problem resolutions via the Knowledge Base Edge REST API. Activates whenever the user asks to write, publish, or document a new technical article, architecture guide, or when recording an encounter with a bug/error and its verified fix into the knowledge repository. Also guides AI agents on retrieving compressed raw Markdown and troubleshooting patterns via FTS5 search."
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

# Knowledge Base & Troubleshooting Case Study Creator Skill

This skill guides AI Agents (Cursor, Claude, Antigravity, Codex) and developers on how to interact with the Knowledge Base REST API (`https://trihuynh.omnimer.io.vn` or `https://tri-portfolio.huynhminhtri1109.workers.dev`) to create technical documentation, record verified bug resolutions, and query knowledge with zero token waste.

---

## 1. When to Use This Skill

Activate this skill when:
- The user requests to write, publish, or index a new engineering knowledge article or architecture specification.
- A bug or runtime error is solved during coding, and the user wants to log the error symptom, root cause, and verified fix into the repository for future reference.
- An AI Agent needs to fetch compressed context, search solutions with BM25 ranking, or read raw Markdown without HTML markup.
- The user wants to automate synchronization between local Markdown files and Cloudflare D1.

---

## 2. API Endpoints Reference

| Purpose | Method | Endpoint | Auth Required | Format |
| :--- | :--- | :--- | :--- | :--- |
| **LLM Catalog** | `GET` | `/llms.txt` | No | Plain Text |
| **Search (FTS5 BM25)** | `GET` | `/api/kb/search?q={query}&type=all` | No | JSON |
| **List Articles** | `GET` | `/api/kb?limit=50&category={cat}` | No | JSON |
| **Create Article** | `POST` | `/api/kb` | **Yes** (`Bearer`) | JSON |
| **Get Article Detail** | `GET` | `/api/kb/{slug}` | No | JSON |
| **Get Raw Markdown** | `GET` | `/api/kb/{slug}?format=raw` | No | Text/Markdown |
| **Update Article** | `PUT` | `/api/kb/{slug}` | **Yes** (`Bearer`) | JSON |
| **List Problems** | `GET` | `/api/kb/{parentSlug}/problems` | No | JSON |
| **Add Problem Fix** | `POST` | `/api/kb/{parentSlug}/problems` | **Yes** (`Bearer`) | JSON |
| **Sync Disk to DB** | `POST` | `/api/kb/sync` | **Yes** (`Bearer`) | JSON |

**Base URL**: `https://trihuynh.omnimer.io.vn` (Fallback: `https://tri-portfolio.huynhminhtri1109.workers.dev` or `http://localhost:4321` in dev).

---

## 3. Authentication

All write endpoints (`POST`, `PUT`, `sync`) require the Bearer token header:

```http
Authorization: Bearer <KB_API_KEY>
```

- In production: Set via Cloudflare Worker secret `KB_API_KEY`.
- In local development: Defaults to `tri-kb-secret-key-2026` if `KB_API_KEY` is not exported.
- When scripting or calling via cURL, always read from environment variable `os.environ.get("KB_API_KEY", "tri-kb-secret-key-2026")`.

---

## 4. Workflows

### Workflow A: Creating a New Knowledge Base Article

When writing a new technical guide, follow this 4-step sequence:

1. **Verify Uniqueness**: Check if an article with a similar slug or title already exists:
   ```bash
   curl -s "https://trihuynh.omnimer.io.vn/api/kb/search?q=my-topic"
   ```
2. **Format the Payload**:
   - `slug`: Kebab-case, URL-safe identifier (e.g. `fastify-stream-compression`).
   - `title`: Clear, descriptive technical headline.
   - `description`: 1-2 sentence overview for humans.
   - `isKnowledgeBase`: `true` (places it in Tier 02 / D1 Repository).
   - `kbCategory`: One of: `architecture`, `research`, `guidelines`, `devops`, `ai-agents`, `backend`.
   - `targetAgents`: Array: `["claude", "cursor", "codex", "anti"]`.
   - `summaryForAgents`: High-density technical summary (30-80 words) optimized for LLM context compression.
   - `content`: Clean Markdown body.
   - `thumbnail`: Default `/images/blog/default.png` or path to custom graphic.
3. **Execute `POST /api/kb`**:
   ```bash
   curl -X POST https://trihuynh.omnimer.io.vn/api/kb \
     -H "Authorization: Bearer $KB_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "slug": "fastify-stream-compression",
       "title": "Fastify Streaming Compression at Scale",
       "description": "Techniques for high-throughput payload compression with backpressure handling.",
       "isKnowledgeBase": true,
       "kbCategory": "backend",
       "targetAgents": ["claude", "cursor", "codex", "anti"],
       "summaryForAgents": "Covers Brotli/Gzip stream pipelines, backpressure management, and memory limits in Fastify.",
       "content": "# Fastify Streaming Compression\n\nHigh-performance guide on handling gzip/brotli backpressure."
     }'
   ```
4. **Verify Live Output**:
   Check `GET /api/kb/fastify-stream-compression?format=raw` or visit `https://trihuynh.omnimer.io.vn/blog/fastify-stream-compression`.

---

### Workflow B: Logging a Troubleshooting Case Study (Attached to Parent)

Whenever an unexpected error occurs and is successfully solved, document it immediately as a Troubleshooting Case Study.

1. **Identify Parent Slug**: Find the parent article's slug representing the technology (e.g. `cloudflare-d1-hybrid-setup` or `building-omnimer-health`).
2. **Structure the Problem Record**:
   - `title`: Clear symptom-oriented title (e.g., `workerd runtime rejects better-sqlite3 native addon`).
   - `errorCode`: Exact machine error or exception name (e.g., `ERR_DLOPEN_FAILED`, `SQLITE_BUSY`, `EADDRINUSE`).
   - `errorSnippet`: The exact terminal stack trace or error log snippet.
   - `environment`: OS, runtime versions, package versions (e.g. `macOS Sequoia, Astro 7.3, Cloudflare workerd`).
   - `rootCause`: Precise technical analysis explaining *why* the failure happened.
   - `solution`: Step-by-step fix, code diff, or architectural workaround.
   - `tags`: Array of keywords for FTS5 index (e.g. `["workerd", "cloudflare", "d1", "sqlite"]`).
3. **Execute `POST /api/kb/{parentSlug}/problems`**:
   ```bash
   curl -X POST https://trihuynh.omnimer.io.vn/api/kb/cloudflare-d1-hybrid-setup/problems \
     -H "Authorization: Bearer $KB_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "workerd runtime rejects better-sqlite3 native addon",
       "errorCode": "ERR_DLOPEN_FAILED",
       "errorSnippet": "TypeError: Cannot read properties of undefined (reading glibcVersionRuntime) at isLinuxMusl",
       "environment": "macOS Sequoia, Astro 7.3, Cloudflare workerd",
       "rootCause": "Workerd runtime does not support native C++ Node addons. Attempting to load better-sqlite3 causes runtime crash.",
       "solution": "Use UniversalDatabaseAdapter that dynamically branches to env.DB from cloudflare:workers inside workerd, and only loads better-sqlite3 during CLI Node.js tasks.",
       "tags": ["workerd", "cloudflare", "d1", "sqlite"]
     }'
   ```
4. **Verify Searchability**:
   ```bash
   curl -s "https://trihuynh.omnimer.io.vn/api/kb/search?q=glibcVersionRuntime"
   ```
   The response will immediately return the problem record with BM25 highlighted `<mark>` snippet.

---

### Workflow C: Querying Context for AI Coding Agents

When pair-programming or fixing issues:
1. **Search across both articles and problems**:
   ```bash
   curl -s "https://trihuynh.omnimer.io.vn/api/kb/search?q=memory+leak"
   ```
2. **Inject Pristine Markdown (Zero HTML overhead)**:
   ```bash
   curl -s "https://trihuynh.omnimer.io.vn/api/kb/{slug}?format=raw"
   ```
3. **Fetch all verified fixes for a technology**:
   ```bash
   curl -s "https://trihuynh.omnimer.io.vn/api/kb/{parentSlug}/problems"
   ```

---

## 5. Helper Script Usage

A companion helper script is provided in `.agents/skills/knowledge_create/scripts/kb_helper.py`.

### Quick Commands:
```bash
# Search
python3 .agents/skills/knowledge_create/scripts/kb_helper.py search "workerd"

# Add problem
python3 .agents/skills/knowledge_create/scripts/kb_helper.py add-problem \
  --parent "cloudflare-d1-hybrid-setup" \
  --title "D1 triggers syntax error with exec" \
  --error-code "D1_EXEC_ERROR" \
  --error-snippet "Error in line 1: incomplete input: SQLITE_ERROR" \
  --env "Cloudflare D1, Wrangler 4.x" \
  --root-cause "Triggers contain semicolons inside BEGIN...END which naive exec splits incorrectly." \
  --solution "Execute schema via wrangler d1 execute DB --file=scripts/schema.sql." \
  --tags "d1,triggers,schema"

# Fetch raw markdown
python3 .agents/skills/knowledge_create/scripts/kb_helper.py get-raw "cloudflare-d1-hybrid-setup"
```

---

## 6. Best Practices & Quality Standards

1. **Token Efficiency**: Always write `summaryForAgents` with high information density. Avoid fluff words ("In this article we will explore..."). Instead write: "Covers X, resolves Y using pattern Z."
2. **Preserve Error Snippets**: Never summarize an error message when logging a problem. Keep the exact compiler/runtime error message in `errorSnippet` so future Agents can match it verbatim.
3. **Deterministic Slugs**: Use hyphen-separated lowercase strings without special characters or accents (e.g. `fhir-bundle-memory-leak`).
4. **Dual Storage**: When adding problems, the API stores records in Cloudflare D1 for fast Edge queries, and also mirrors to `src/content/problems/{parentSlug}/{problemSlug}.md` for Git versioning.
