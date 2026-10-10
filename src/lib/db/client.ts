/**
 * @name client.ts
 * @description Universal Database Client supporting Cloudflare D1 at Edge/dev and local SQLite (better-sqlite3) for Node.js scripts.
 */

import path from "node:path";
import { SCHEMA_SQL } from "./schema";

export interface QueryResult<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta?: {
    changes?: number;
    last_row_id?: number | string;
    rows_read?: number;
    rows_written?: number;
  };
}

export interface IDatabase {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  execute(sql: string, params?: unknown[]): Promise<{ success: boolean; changes?: number }>;
  batch(statements: { sql: string; params?: unknown[] }[]): Promise<boolean>;
}

// Global cached local SQLite instance
let localDbInstance: any = null;

/**
 * Initializes and returns a local SQLite database instance via better-sqlite3 for Node.js environments
 */
async function getLocalSqliteDatabase(): Promise<any> {
  if (localDbInstance) return localDbInstance;

  // Import node:fs dynamically for Node.js CLI runtime
  const fs = await import("node:fs");
  const { default: Database } = await import("better-sqlite3");

  const dataDir = path.resolve(process.cwd(), "data");
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch {
    // Ignore sandbox or existing directory error
  }

  const dbPath = path.join(dataDir, "knowledge.db");
  const db = new Database(dbPath);

  // Enable WAL mode for high read/write concurrency
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Read and execute schema migration if tables don't exist
  db.exec(SCHEMA_SQL);

  localDbInstance = db;
  return localDbInstance;
}

/**
 * Wraps local better-sqlite3 in the uniform IDatabase interface
 */
class LocalSqliteAdapter implements IDatabase {
  private db: any = null;

  private async ensureDb() {
    if (!this.db) {
      this.db = await getLocalSqliteDatabase();
    }
    return this.db;
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const db = await this.ensureDb();
    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params) as T[];
      return { results: rows, success: true };
    } catch (error) {
      console.error("[LocalSqliteAdapter] Query error:", error, "SQL:", sql);
      throw error;
    }
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ success: boolean; changes?: number }> {
    const db = await this.ensureDb();
    try {
      const stmt = db.prepare(sql);
      const info = stmt.run(...params);
      return { success: true, changes: info.changes };
    } catch (error) {
      console.error("[LocalSqliteAdapter] Execute error:", error, "SQL:", sql);
      throw error;
    }
  }

  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<boolean> {
    const db = await this.ensureDb();
    const runTransaction = db.transaction((stmts: typeof statements) => {
      for (const item of stmts) {
        db.prepare(item.sql).run(...(item.params || []));
      }
    });
    runTransaction(statements);
    return true;
  }
}

/**
 * Wraps Cloudflare D1 Database binding in the uniform IDatabase interface
 */
class CloudflareD1Adapter implements IDatabase {
  private d1: any;
  private initialized = false;

  constructor(d1Binding: any) {
    this.d1 = d1Binding;
  }

  private async ensureInitialized() {
    this.initialized = true;
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    await this.ensureInitialized();
    try {
      const stmt = this.d1.prepare(sql).bind(...params);
      const res = await stmt.all();
      return {
        results: (res.results || []) as T[],
        success: res.success,
        meta: res.meta,
      };
    } catch (error) {
      console.error("[CloudflareD1Adapter] Query error:", error, "SQL:", sql);
      throw error;
    }
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ success: boolean; changes?: number }> {
    await this.ensureInitialized();
    try {
      const stmt = this.d1.prepare(sql).bind(...params);
      const res = await stmt.run();
      return {
        success: res.success,
        changes: res.meta?.changes,
      };
    } catch (error) {
      console.error("[CloudflareD1Adapter] Execute error:", error, "SQL:", sql);
      throw error;
    }
  }

  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<boolean> {
    await this.ensureInitialized();
    try {
      const prepared = statements.map((item) => this.d1.prepare(item.sql).bind(...(item.params || [])));
      const results = await this.d1.batch(prepared);
      return results.every((r: any) => r.success);
    } catch (error) {
      console.error("[CloudflareD1Adapter] Batch error:", error);
      throw error;
    }
  }
}

/**
 * Universal Database Adapter that routes to Cloudflare D1 when available or local SQLite
 */
class UniversalDatabaseAdapter implements IDatabase {
  private explicitBinding?: any;
  private resolvedAdapter: IDatabase | null = null;

  constructor(binding?: any) {
    this.explicitBinding = binding;
  }

  private async getAdapter(): Promise<IDatabase> {
    if (this.resolvedAdapter) return this.resolvedAdapter;

    // 1. Explicit binding passed in
    if (this.explicitBinding && typeof this.explicitBinding.prepare === "function") {
      this.resolvedAdapter = new CloudflareD1Adapter(this.explicitBinding);
      return this.resolvedAdapter;
    }

    // 2. Cloudflare workers runtime env.DB
    try {
      const cf = await import("cloudflare:workers");
      if (cf?.env?.DB && typeof cf.env.DB.prepare === "function") {
        this.resolvedAdapter = new CloudflareD1Adapter(cf.env.DB);
        return this.resolvedAdapter;
      }
    } catch {
      // Not in Cloudflare Workers / workerd runtime
    }

    // 3. Global DB
    if ((globalThis as any)?.DB && typeof (globalThis as any).DB.prepare === "function") {
      this.resolvedAdapter = new CloudflareD1Adapter((globalThis as any).DB);
      return this.resolvedAdapter;
    }

    // 4. Fallback to local better-sqlite3 for Node.js scripts (CLI, migrations, tests)
    this.resolvedAdapter = new LocalSqliteAdapter();
    return this.resolvedAdapter;
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const adapter = await this.getAdapter();
    return adapter.query<T>(sql, params);
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ success: boolean; changes?: number }> {
    const adapter = await this.getAdapter();
    return adapter.execute(sql, params);
  }

  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<boolean> {
    const adapter = await this.getAdapter();
    return adapter.batch(statements);
  }
}

/**
 * Factory function to obtain the appropriate Database instance.
 * Automatically selects Cloudflare D1 when available, or falls back to local SQLite.
 * 
 * @param d1Binding Optional Cloudflare D1 binding
 * @returns An IDatabase implementation
 */
export function getDb(d1Binding?: any): IDatabase {
  return new UniversalDatabaseAdapter(d1Binding);
}
