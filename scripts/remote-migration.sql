-- @name remote-migration.sql
-- @description Cloudflare D1 Migration for full search & retrieval optimization.

-- 1. Alter articles table
ALTER TABLE articles ADD COLUMN source TEXT DEFAULT 'git';
ALTER TABLE articles ADD COLUMN search_text TEXT;

-- 2. Alter kb_problems table
ALTER TABLE kb_problems ADD COLUMN error_code_norm TEXT;
ALTER TABLE kb_problems ADD COLUMN search_text TEXT;

-- 3. Drop legacy triggers and FTS virtual tables
DROP TRIGGER IF EXISTS articles_ai;
DROP TRIGGER IF EXISTS articles_ad;
DROP TRIGGER IF EXISTS articles_au;
DROP TABLE IF EXISTS articles_fts;

DROP TRIGGER IF EXISTS kb_problems_ai;
DROP TRIGGER IF EXISTS kb_problems_ad;
DROP TRIGGER IF EXISTS kb_problems_au;
DROP TABLE IF EXISTS kb_problems_fts;

DROP TRIGGER IF EXISTS sections_ai;
DROP TRIGGER IF EXISTS sections_ad;
DROP TRIGGER IF EXISTS sections_au;
DROP TABLE IF EXISTS sections_fts;

-- 4. Create article_sections table
CREATE TABLE IF NOT EXISTS article_sections (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    anchor TEXT NOT NULL,
    heading TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 2,
    ordinal INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    token_estimate INTEGER NOT NULL DEFAULT 0,
    search_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(slug) REFERENCES articles(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_sections_slug ON article_sections(slug);

-- 5. Create enhanced FTS5 tables with unicode61 remove_diacritics 2
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

-- 6. Recreate triggers for articles_fts
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

-- 7. Recreate triggers for kb_problems_fts
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

-- 8. Create triggers for sections_fts
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

-- 9. Create search_misses table
CREATE TABLE IF NOT EXISTS search_misses (
    q_norm TEXT PRIMARY KEY,
    hits INTEGER DEFAULT 1,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);
