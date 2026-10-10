---
name: knowledge_self_define
description: "Guides AI agents and developers in systematically formulating, recording, and persisting personal engineering lessons, architectural gotchas, and troubleshooting postmortems into the Knowledge Base via the REST API and Git-backed Markdown."
triggers:
  - "self define lesson"
  - "bài học cá nhân"
  - "ghi nhận bài học"
  - "log lesson"
  - "postmortem"
  - "engineering gotcha"
  - "self define problem"
  - "knowledge_self_define"
---

# Self-Defined Engineering Lessons & Troubleshooting Skill

This skill guides AI coding assistants (Antigravity, Cursor, Claude, Codex) and software engineers on how to systematically translate bugs, architectural surprises, performance regressions, and hard-won development lessons into structured **Self-Defined Problem Case Studies**.

Lessons are dual-persisted:
1. **Locally in Git**: As Markdown collections at `src/content/problems/{parentSlug}/{lessonSlug}.md`.
2. **Remotely on Cloudflare Edge**: Into SQLite D1 with FTS5 search indexing via `POST /api/kb/{parentSlug}/problems`.

---

## 1. Philosophy: Compounding Engineering Wisdom

In high-velocity software engineering, bugs and anti-patterns often recur because lessons are lost in chat histories, Slack channels, or terminal logs.

This skill transforms every failure into an **Institutional Learning Asset**:
* **Move from symptom fixing to root-cause eradication**: Don't just add a null check—ask why the contract permitted null in the first place.
* **Establish structural guardrails**: Complement code fixes with lint rules, architectural boundaries, or automated tests.
* **Immediate searchability for future agents**: Future AI sessions can instantly look up the error code or anti-pattern using `knowlege_search` to apply verified fixes without rediscovering the wheel.

---

## 2. The 5-Step Self-Definition Framework

When documenting a personal lesson or problem, follow this structured framework:

```
[Trigger / Symptom]
        │
        ▼
[5-Whys Root Cause] ──► Identify False Mental Model
        │
        ▼
[Verified Code Fix] ──► Clean Before/After Diff
        │
        ▼
[Systemic Guardrail] ──► Lint rule / Test / Invariant
        │
        ▼
[Engineering Takeaway] ──► 1-Sentence Guiding Heuristic
```

### The 4 Anatomy Components of a Lesson Record:

| Component | Purpose | Example |
| :--- | :--- | :--- |
| **Title & Error Code** | Unique identifier for fast-path retrieval | Title: `Database Connection Pool Exhaustion`<br>Code: `ERR_POOL_EXHAUSTED_CONCURRENCY` |
| **Error Symptoms** | Verbatim compiler log, runtime stack trace, or problematic code snippet | Stack trace showing `timeout exceeded when trying to connect, active connections: 20` |
| **5-Whys Root Cause** | 3-5 causation levels peeling away symptoms to reveal the core false assumption | Tracing from database timeout down to unbounded `Promise.all` over 200 events without a concurrency limiter. |
| **Verified Solution** | 1. Verified code diff<br>2. Guardrail/linter<br>3. Personal takeaway | Code diff adding `p-limit(8)` + takeaway: *"Async non-blocking I/O does not mean infinite downstream capacity."* |

---

## 3. Dedicated CLI Tool (`lesson_logger.py`)

Located at:
[lesson_logger.py](file:///Users/macbookair/Downloads/huynh_minh_tri/tri-portfolio/.agents/skills/knowledge_self_define/scripts/lesson_logger.py)

### Quick Commands:

```bash
# 1. Inspect existing parent domains to select where to attach the lesson
python3 .agents/skills/knowledge_self_define/scripts/lesson_logger.py list-parents

# 2. Generate a clean lesson JSON template to edit
python3 .agents/skills/knowledge_self_define/scripts/lesson_logger.py template -o /tmp/my_lesson.json

# 3. Log lesson from a prepared JSON file (dual-persists to Git and Edge D1)
python3 .agents/skills/knowledge_self_define/scripts/lesson_logger.py log -f /tmp/my_lesson.json

# 4. Log lesson directly with CLI flags
python3 .agents/skills/knowledge_self_define/scripts/lesson_logger.py log \
  --parent "kafka-pbx-event-streaming-architecture" \
  --title "Unbounded Promise.all Causes Database Connection Pool Exhaustion" \
  --error-code "ERR_POOL_EXHAUSTED" \
  --snippet "error: timeout exceeded when trying to connect (max: 20)" \
  --env "Node 22, PostgreSQL 16, BullMQ" \
  --root-cause "Unbounded Promise.all mapped 200 concurrent tasks against a 20-connection pool." \
  --solution "Wrapped mapping in p-limit(8) to enforce strict concurrency bounds." \
  --tags "nodejs,postgres,pool,concurrency,p-limit"
```

---

## 4. Workflows

### Workflow A: Logging a Lesson from a Live Incident (Interactive Flow)

When an unexpected bug or architectural trap is solved during a coding session:

1. **Select Parent Domain**:
   ```bash
   python3 .agents/skills/knowledge_self_define/scripts/lesson_logger.py list-parents
   ```
   Choose the appropriate parent slug (e.g. `kafka-pbx-event-streaming-architecture`, `kafka-core-concepts-and-architecture`, or `building-omnimer-health`).
2. **Draft the Lesson**:
   Copy and populate the template at:
   [lesson_template.json](file:///Users/macbookair/Downloads/huynh_minh_tri/tri-portfolio/.agents/skills/knowledge_self_define/resources/lesson_template.json)
3. **Execute Persistence**:
   ```bash
   python3 .agents/skills/knowledge_self_define/scripts/lesson_logger.py log -f lesson.json
   ```
   This automatically:
   - Creates `src/content/problems/<parentSlug>/<lessonSlug>.md` with proper YAML frontmatter and Markdown sections.
   - Posts to `POST /api/kb/<parentSlug>/problems` on Cloudflare D1 with Bearer token authentication.
   - Rebuilds the FTS5 index for instant search.
4. **Verify Fast-Path Retrieval**:
   ```bash
   python3 .agents/skills/knowlege_search/scripts/search_helper.py query "<errorCode>" --include-solution
   ```

---

### Workflow B: Defining an Anti-Pattern / Architecture Lesson (No Runtime Crash)

Lessons are not limited to crashes—architectural anti-patterns, design traps, and subtle performance leaks are ideal candidates:

1. **Synthesize a Conceptual Error Code**:
   Use descriptive uppercase codes:
   - `ANTI_PATTERN_UNBOUNDED_CONCURRENCY`
   - `GOTCHA_ASTRO_CLIENT_HYDRATION_MISMATCH`
   - `PITFALL_D1_BATCH_TRANSACTION_DEADLOCK`
   - `RACE_CONDITION_CACHE_STAMPEDE`
2. **Document the Anti-Pattern Code in Error Symptoms**:
   Include the flawed implementation before the fix:
   ```typescript
   // Anti-pattern: Missing idempotency key causing duplicate billing
   app.post('/webhook', async (req, res) => {
     await billUser(req.body.userId, req.body.amount);
   });
   ```
3. **Specify the 5-Whys Analysis**:
   Explain how distributed network retries turn this pattern into duplicate transactions.
4. **Provide the Guardrail & Takeaway**:
   Show the transactional deduplication pattern (`INSERT ... ON CONFLICT DO NOTHING`) and state the engineering principle:
   > *"Every webhook consumer must be strictly idempotent. Never trust HTTP transport delivery to be exactly-once."*

---

## 5. Directory Structure & Resources

```
.agents/skills/knowledge_self_define/
├── SKILL.md                          # This skill guide
├── scripts/
│   └── lesson_logger.py              # CLI & API sync automation
└── resources/
    ├── lesson_template.json          # Standard JSON schema payload
    ├── lesson_markdown_template.md   # Content collection template
    └── 5_whys_framework.md           # Guide to 5-Whys root cause analysis
```

---

## 6. Best Practices

1. **Never Omit the Exact Error Signature**: Verbatim stack traces or code patterns allow future AI agents to match queries with 100% precision.
2. **Enforce 5-Whys Depth**: Do not stop at superficial explanations like "the parameter was wrong." Always reach the architectural assumption.
3. **Always Include a Guardrail**: A fix without a guardrail will eventually be undone by another developer. Always specify a test assertion, lint rule, or boundary check.
4. **Keep Single Source of Truth**: Keep Git files in `src/content/problems/` and Cloudflare D1 synchronized using `npm run kb:sync` or `lesson_logger.py log`.
