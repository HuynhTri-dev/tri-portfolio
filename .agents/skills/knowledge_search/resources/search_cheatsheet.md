# Knowledge Base Search & Retrieval Cheatsheet

> Reference guide for AI agents and developers querying the Cloudflare Edge Knowledge Base.

---

## 1. Endpoints Overview

| Target | Method | Endpoint URL | Description | Token Footprint |
| :--- | :--- | :--- | :--- | :--- |
| **Section Search** | `GET` | `/api/kb/search?q={query}&granularity=section&format=agent` | High precision heading match & snippet | **~100 - 300 tokens** |
| **Error Code Fast-Path** | `GET` | `/api/kb/search?q={errorCode}&format=agent&include=solution` | Exact exception match with verified fix | **~150 - 400 tokens** |
| **Article Outline** | `GET` | `/api/kb/{slug}?format=outline` | TOC, headings, anchors, token counts | **~150 tokens** |
| **Granular Section** | `GET` | `/api/kb/{slug}?format=raw&section={anchor}` | Raw markdown of ONLY target heading section | **~120 - 450 tokens** |
| **Full Raw Article** | `GET` | `/api/kb/{slug}?format=raw` | Complete unrendered markdown body | **3,000 - 8,000 tokens** |
| **Article Problems** | `GET` | `/api/kb/{parentSlug}/problems` | All troubleshooting case studies | **~300 - 900 tokens** |
| **Search Misses** | `GET` | `/api/kb/misses?limit=20` | Top queries with 0 hits (gap detection) | **~100 tokens** |

**Production Host:** `https://trihuynh.omnimer.io.vn` (Fallback: `https://tri-portfolio.huynhminhtri1109.workers.dev`)  
**Local Development:** `http://localhost:4321`

---

## 2. Search Query Parameters (`/api/kb/search`)

| Parameter | Type | Allowed Values | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `q` | `string` | any keywords, natural language, error codes | *required* | Auto-folded for Vietnamese diacritics (`đ/Đ → d`, NFD strip). |
| `granularity` | `string` | `section`, `article`, `problem`, `all` | `all` | Narrow search scope. Use `section` for highest token efficiency. |
| `format` | `string` | `agent`, `json` | `json` | `agent` formats output as compact markdown/text for LLM prompts. |
| `include` | `string` | `solution` | *none* | When set to `solution`, outputs verified fix markdown in problem hits. |
| `limit` | `number` | `1` to `50` | `10` | Limit total returned records. |

---

## 3. Recommended Token-Saving Workflows for AI Agents

### Scenario 1: Debugging an Error / Exception
1. Search with exact error code in agent format with solution included:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py query "CommitFailedException" --format agent --include-solution
   ```
2. Agent directly receives: Error code, symptom, root cause, and copy-pasteable verified fix. Cost: **~200 tokens** (vs 5,000+ tokens reading multiple guides).

### Scenario 2: Finding Specific Configuration or Implementation Details
1. Search with `granularity=section` and `format=agent`:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py query "acks=all" --granularity section
   ```
2. Read the returned snippet or fetch the exact section:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py section "kafka-core-concepts-and-architecture" "72-cấu-hình-độ-an-toàn-acks-của-producer"
   ```
3. Cost: **~120 tokens**!

### Scenario 3: Exploring a System Architecture
1. Request the outline first:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py outline "kafka-core-concepts-and-architecture"
   ```
2. Choose only the 1 or 2 sections relevant to the user's task and fetch them individually.

---

## 4. Critical Technical Gotchas

1. **Vietnamese Anchor URL Encoding**:
   Edge proxies (Cloudflare) reject unencoded non-ASCII characters in URL query strings with `HTTP 400 Bad Request`.
   When calling `/api/kb/{slug}?format=raw&section={anchor}` directly via cURL or Python, always URL-encode the anchor slug:
   ```bash
   # In bash:
   python3 -c "import urllib.parse; print(urllib.parse.quote('72-cấu-hình-độ-an-toàn-acks-của-producer'))"
   # Or simply use search_helper.py which handles percent-encoding automatically!
   ```

2. **Custom User-Agent Header**:
   Cloudflare WAF automatically returns `HTTP 403 Forbidden` to default `python-urllib` User-Agents. Always specify `User-Agent: Antigravity-KB-SearchHelper/2.0` when making HTTP requests.
