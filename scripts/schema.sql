-- @name schema.sql
-- @description Cloudflare D1 / SQLite database schema for Knowledge Base, Sections FTS5, and Problem Troubleshooting Engine.

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
    source TEXT DEFAULT 'git',         -- 'git' for repository content, 'api' for edge-created content
    search_text TEXT,                  -- Lowercase diacritic-folded text for full recall search
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Full-Text Search Index (FTS5) for fast Agent queries with Unicode folding
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    slug UNINDEXED,
    title,
    description,
    hashtags,
    kb_category,
    summary_for_agents,
    raw_markdown,
    search_text,
    content='articles',
    content_rowid='rowid',
    tokenize = 'unicode61 remove_diacritics 2'
);

-- 3. Triggers to keep articles_fts synchronized with articles table
CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
    INSERT INTO articles_fts(rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES (new.rowid, new.slug, new.title, new.description, new.hashtags, new.kb_category, new.summary_for_agents, new.raw_markdown, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES ('delete', old.rowid, old.slug, old.title, old.description, old.hashtags, old.kb_category, old.summary_for_agents, old.raw_markdown, old.search_text);
END;

CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES ('delete', old.rowid, old.slug, old.title, old.description, old.hashtags, old.kb_category, old.summary_for_agents, old.raw_markdown, old.search_text);
    INSERT INTO articles_fts(rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES (new.rowid, new.slug, new.title, new.description, new.hashtags, new.kb_category, new.summary_for_agents, new.raw_markdown, new.search_text);
END;

-- 4. Troubleshooting Table (Problems & Solutions attached to parent knowledge article)
CREATE TABLE IF NOT EXISTS kb_problems (
    id TEXT PRIMARY KEY,
    parent_slug TEXT NOT NULL,           -- Foreign key linking to articles.slug
    title TEXT NOT NULL,
    error_code TEXT,                     -- e.g. 'CommitFailedException', 'ERR_WORKER_OUT_OF_MEMORY'
    error_code_norm TEXT,                -- Normalized uppercase error code for fast exact lookups
    error_snippet TEXT,                  -- Exact snippet of error message/log
    environment TEXT,                    -- e.g. 'Node 22, macOS, Wrangler 3.x'
    root_cause TEXT NOT NULL,            -- Root cause analysis
    solution_markdown TEXT NOT NULL,     -- Detailed solution and code fix
    tags TEXT NOT NULL,                  -- JSON array: ["d1", "sqlite", "fts5"]
    file_path TEXT,                      -- Path if exported to markdown
    search_text TEXT,                    -- Normalized diacritic-folded text for search
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
    search_text,
    content='kb_problems',
    content_rowid='rowid',
    tokenize = 'unicode61 remove_diacritics 2'
);

-- 6. Triggers for kb_problems_fts synchronization
CREATE TRIGGER IF NOT EXISTS kb_problems_ai AFTER INSERT ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES (new.rowid, new.id, new.parent_slug, new.title, new.error_code, new.error_snippet, new.root_cause, new.solution_markdown, new.tags, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS kb_problems_ad AFTER DELETE ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(kb_problems_fts, rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES ('delete', old.rowid, old.id, old.parent_slug, old.title, old.error_code, old.error_snippet, old.root_cause, old.solution_markdown, old.tags, old.search_text);
END;

CREATE TRIGGER IF NOT EXISTS kb_problems_au AFTER UPDATE ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(kb_problems_fts, rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES ('delete', old.rowid, old.id, old.parent_slug, old.title, old.error_code, old.error_snippet, old.root_cause, old.solution_markdown, old.tags, old.search_text);
    INSERT INTO kb_problems_fts(rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES (new.rowid, new.id, new.parent_slug, new.title, new.error_code, new.error_snippet, new.root_cause, new.solution_markdown, new.tags, new.search_text);
END;

-- 7. Section-level breakdown table for granular LLM retrieval
CREATE TABLE IF NOT EXISTS article_sections (
    id TEXT PRIMARY KEY,                 -- {slug}#{anchor}
    slug TEXT NOT NULL,                  -- Foreign key linking to articles.slug
    anchor TEXT NOT NULL,                -- Heading anchor slug (compatible with Astro headings)
    heading TEXT NOT NULL,               -- Heading text
    level INTEGER NOT NULL DEFAULT 2,    -- 2 for ##, 3 for ###
    ordinal INTEGER NOT NULL DEFAULT 0,  -- Order index within article
    content TEXT NOT NULL,               -- Markdown content under this heading
    token_estimate INTEGER NOT NULL DEFAULT 0, -- Token estimate (~chars / 3.8)
    search_text TEXT,                    -- Normalized diacritic-folded text for search
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(slug) REFERENCES articles(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_sections_slug ON article_sections(slug);

-- 8. FTS5 Index for Section-level searches
CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
    slug UNINDEXED,
    anchor UNINDEXED,
    heading,
    content,
    search_text,
    content='article_sections',
    content_rowid='rowid',
    tokenize = 'unicode61 remove_diacritics 2'
);

-- 9. Triggers for sections_fts synchronization
CREATE TRIGGER IF NOT EXISTS sections_ai AFTER INSERT ON article_sections BEGIN
    INSERT INTO sections_fts(rowid, slug, anchor, heading, content, search_text)
    VALUES (new.rowid, new.slug, new.anchor, new.heading, new.content, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS sections_ad AFTER DELETE ON article_sections BEGIN
    INSERT INTO sections_fts(sections_fts, rowid, slug, anchor, heading, content, search_text)
    VALUES ('delete', old.rowid, old.slug, old.anchor, old.heading, old.content, old.search_text);
END;

CREATE TRIGGER IF NOT EXISTS sections_au AFTER UPDATE ON article_sections BEGIN
    INSERT INTO sections_fts(sections_fts, rowid, slug, anchor, heading, content, search_text)
    VALUES ('delete', old.rowid, old.slug, old.anchor, old.heading, old.content, old.search_text);
    INSERT INTO sections_fts(rowid, slug, anchor, heading, content, search_text)
    VALUES (new.rowid, new.slug, new.anchor, new.heading, new.content, new.search_text);
END;

-- 10. Search Misses Feedback Loop: Records queries with 0 results
CREATE TABLE IF NOT EXISTS search_misses (
    q_norm TEXT PRIMARY KEY,
    hits INTEGER DEFAULT 1,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);
