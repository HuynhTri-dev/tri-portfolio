/**
 * @name schema.ts
 * @description Cloudflare D1 and SQLite schema definition with FTS5 search, sections index, and triggers.
 */

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    pub_date TEXT NOT NULL,
    updated_date TEXT,
    thumbnail TEXT DEFAULT '/images/blog/default.png',
    thumbnail_alt TEXT DEFAULT 'Article thumbnail',
    hashtags TEXT NOT NULL,
    seo_keywords TEXT,
    draft INTEGER DEFAULT 0,
    is_knowledge_base INTEGER DEFAULT 0,
    kb_category TEXT DEFAULT 'general',
    target_agents TEXT,
    summary_for_agents TEXT,
    raw_markdown TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    file_path TEXT,
    source TEXT DEFAULT 'git',
    search_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS kb_problems (
    id TEXT PRIMARY KEY,
    parent_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    error_code TEXT,
    error_code_norm TEXT,
    error_snippet TEXT,
    environment TEXT,
    root_cause TEXT NOT NULL,
    solution_markdown TEXT NOT NULL,
    tags TEXT NOT NULL,
    file_path TEXT,
    search_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_slug) REFERENCES articles(slug) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS search_misses (
    q_norm TEXT PRIMARY KEY,
    hits INTEGER DEFAULT 1,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- SKILL KNOWLEDGE GRAPH (GRAPHDB MODEL)
-- =========================================================================

CREATE TABLE IF NOT EXISTS skill_domains (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#18c785',
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skill_nodes (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL,
    parent_id TEXT,
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    rank TEXT NOT NULL CHECK(rank IN ('F', 'D', 'C', 'B', 'A', 'S')),
    level INTEGER NOT NULL DEFAULT 50,
    node_type TEXT NOT NULL CHECK(node_type IN ('HUB', 'BRANCH', 'LEAF')),
    summary_en TEXT,
    summary_vi TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(domain_id) REFERENCES skill_domains(id),
    FOREIGN KEY(parent_id) REFERENCES skill_nodes(id)
);

CREATE TABLE IF NOT EXISTS skill_graph_edges (
    id TEXT PRIMARY KEY,
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    relation_type TEXT NOT NULL CHECK(relation_type IN ('BRANCHES_TO', 'DEPENDS_ON', 'COMPLEMENTS')),
    weight REAL DEFAULT 1.0,
    FOREIGN KEY(source_node_id) REFERENCES skill_nodes(id),
    FOREIGN KEY(target_node_id) REFERENCES skill_nodes(id)
);

CREATE TABLE IF NOT EXISTS article_skill_links (
    article_slug TEXT NOT NULL,
    skill_node_id TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'PROVES_KNOWLEDGE',
    PRIMARY KEY (article_slug, skill_node_id),
    FOREIGN KEY(article_slug) REFERENCES articles(slug) ON DELETE CASCADE,
    FOREIGN KEY(skill_node_id) REFERENCES skill_nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_skill_nodes_domain ON skill_nodes(domain_id);
CREATE INDEX IF NOT EXISTS idx_skill_nodes_parent ON skill_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON skill_graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_article_skills_node ON article_skill_links(skill_node_id);
`;
