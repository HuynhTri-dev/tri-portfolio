-- @name schema.sql
-- @description Cloudflare D1 / SQLite database schema for Knowledge Base and Problem Troubleshooting Engine.

-- 1. Main articles metadata and content table
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    pub_date TEXT NOT NULL,
    updated_date TEXT,
    thumbnail TEXT DEFAULT '/images/blog/default.png',
    thumbnail_alt TEXT DEFAULT 'Article thumbnail',
    hashtags TEXT NOT NULL,            -- JSON array: ["Architecture", "Knowledge-Base"]
    seo_keywords TEXT,                 -- JSON array
    draft INTEGER DEFAULT 0,
    is_knowledge_base INTEGER DEFAULT 0, -- 1 if tagged as knowledge base
    kb_category TEXT DEFAULT 'general', -- 'architecture', 'research', 'guidelines', 'devops', 'ai-agents'
    target_agents TEXT,                -- JSON array: ["claude", "cursor", "codex", "anti"]
    summary_for_agents TEXT,           -- High-density summary for LLM context compression
    raw_markdown TEXT NOT NULL,        -- Full Markdown body without frontmatter
    raw_content TEXT NOT NULL,         -- Complete file including YAML frontmatter
    file_path TEXT,                    -- Relative file path if stored on disk
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Full-Text Search Index (FTS5) for fast Agent queries
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    slug UNINDEXED,
    title,
    description,
    hashtags,
    kb_category,
    summary_for_agents,
    raw_markdown,
    content='articles',
    content_rowid='rowid',
    tokenize = 'unicode61'
);

-- 3. Triggers to keep articles_fts synchronized with articles table
CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
    INSERT INTO articles_fts(rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown)
    VALUES (new.rowid, new.slug, new.title, new.description, new.hashtags, new.kb_category, new.summary_for_agents, new.raw_markdown);
END;

CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown)
    VALUES ('delete', old.rowid, old.slug, old.title, old.description, old.hashtags, old.kb_category, old.summary_for_agents, old.raw_markdown);
END;

CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown)
    VALUES ('delete', old.rowid, old.slug, old.title, old.description, old.hashtags, old.kb_category, old.summary_for_agents, old.raw_markdown);
    INSERT INTO articles_fts(rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown)
    VALUES (new.rowid, new.slug, new.title, new.description, new.hashtags, new.kb_category, new.summary_for_agents, new.raw_markdown);
END;

-- 4. Troubleshooting Table (Problems & Solutions attached to parent knowledge article)
CREATE TABLE IF NOT EXISTS kb_problems (
    id TEXT PRIMARY KEY,
    parent_slug TEXT NOT NULL,           -- Foreign key linking to articles.slug
    title TEXT NOT NULL,
    error_code TEXT,                     -- e.g. 'SQLITE_ERROR', 'ERR_MODULE_NOT_FOUND'
    error_snippet TEXT,                  -- Exact snippet of error message/log
    environment TEXT,                    -- e.g. 'Node 22, macOS, Wrangler 3.x'
    root_cause TEXT NOT NULL,            -- Root cause analysis
    solution_markdown TEXT NOT NULL,     -- Detailed solution and code fix
    tags TEXT NOT NULL,                  -- JSON array: ["d1", "sqlite", "fts5"]
    file_path TEXT,                      -- Path if exported to markdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_slug) REFERENCES articles(slug) ON DELETE CASCADE
);

-- 5. FTS5 Index for Problems & Error Solutions
CREATE VIRTUAL TABLE IF NOT EXISTS kb_problems_fts USING fts5(
    id UNINDEXED,
    parent_slug UNINDEXED,
    title,
    error_code,
    error_snippet,
    root_cause,
    solution_markdown,
    tags,
    content='kb_problems',
    content_rowid='rowid',
    tokenize = 'unicode61'
);

-- 6. Triggers for kb_problems_fts synchronization
CREATE TRIGGER IF NOT EXISTS kb_problems_ai AFTER INSERT ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags)
    VALUES (new.rowid, new.id, new.parent_slug, new.title, new.error_code, new.error_snippet, new.root_cause, new.solution_markdown, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS kb_problems_ad AFTER DELETE ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(kb_problems_fts, rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags)
    VALUES ('delete', old.rowid, old.id, old.parent_slug, old.title, old.error_code, old.error_snippet, old.root_cause, old.solution_markdown, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS kb_problems_au AFTER UPDATE ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(kb_problems_fts, rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags)
    VALUES ('delete', old.rowid, old.id, old.parent_slug, old.title, old.error_code, old.error_snippet, old.root_cause, old.solution_markdown, old.tags);
    INSERT INTO kb_problems_fts(rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags)
    VALUES (new.rowid, new.id, new.parent_slug, new.title, new.error_code, new.error_snippet, new.root_cause, new.solution_markdown, new.tags);
END;
