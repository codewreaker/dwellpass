// ============================================================================
// FILE: server/api/BaseAPI.ts
// Base API with Database Manager - Simple pattern for all APIs (PGlite)
// ============================================================================

import { PGlite } from '@electric-sql/pglite';
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';
import path from 'node:path';
import * as schema from '../db/schema.js';

// ============================================================================
// Database Manager (Singleton) - PGlite
// ============================================================================

class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private db: PgliteDatabase<typeof schema> | null = null;
  private client: PGlite | null = null;
  private readonly dbPath: string;
  private initPromise: Promise<void> | null = null;

  private constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'dwellpass');
  }

  public static getInstance(dbPath?: string): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(dbPath);
    }
    return DatabaseManager.instance;
  }

  public async getDatabase(): Promise<PgliteDatabase<typeof schema>> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    return this.db!;
  }

  public async getClient(): Promise<PGlite> {
    if (!this.client) {
      await this.initializeDatabase();
    }
    return this.client!;
  }

  private async initializeDatabase(): Promise<void> {
    // Prevent multiple initializations
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = (async () => {
      if (!this.client) {
        this.client = new PGlite(this.dbPath);
        await this.client.waitReady;
        console.log(`✓ PGlite database connected: ${this.dbPath}`);
      }

      if (!this.db) {
        this.db = drizzle(this.client, { schema });
      }
    })();

    await this.initPromise;
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.initPromise = null;
    }
  }
}

// ============================================================================
// Base API Class
// ============================================================================

/**
 * BaseAPI - Simple base class for CRUD operations with error handling
 * 
 * @template TEntity - The entity type (e.g., User)
 * @template TInsert - The insert type (e.g., NewUser)
 * @template TTable - The Drizzle table type
 * 
 * @example
 * ```typescript
 * class UserAPI extends BaseAPI<User, NewUser, typeof users> {
 *   protected readonly table = users;
 *   protected readonly tableName = 'users';
 * }
 * ```
 */
export abstract class BaseAPI<TEntity, TInsert, TTable> {
  protected db!: PgliteDatabase<typeof schema>;
  protected client!: PGlite;
  protected abstract readonly table: TTable;
  protected abstract readonly tableName: string;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initialize asynchronously
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    const dbManager = DatabaseManager.getInstance();
    this.db = await dbManager.getDatabase();
    this.client = await dbManager.getClient();
    this.initialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Find by ID with error handling
   */
  async findById(id: string): Promise<TEntity | undefined> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .select()
        .from(this.table as any)
        .where(eq((this.table as any).id, id))
        .limit(1);

      return result[0] as TEntity | undefined;
    } catch (error) {
      throw new Error(`Failed to find ${this.tableName} by ID: ${error}`);
    }
  }

  /**
   * Find all with error handling
   */
  async findAll(): Promise<TEntity[]> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .select()
        .from(this.table as any);

      return result as TEntity[];
    } catch (error) {
      throw new Error(`Failed to find all ${this.tableName}: ${error}`);
    }
  }

  /**
   * Create with error handling
   */
  async create(data: TInsert): Promise<TEntity> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .insert(this.table as any)
        .values(data as any)
        .returning();

      return result?.[0] as TEntity;
    } catch (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error}`);
    }
  }

  /**
   * Update with error handling
   */
  async update(id: string, data: Partial<TInsert>): Promise<TEntity | undefined> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .update(this.table as any)
        .set(data)
        .where(eq((this.table as any).id, id))
        .returning();

      return result?.[0] as TEntity | undefined;
    } catch (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error}`);
    }
  }

  /**
   * Delete with error handling
   */
  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();
    try {
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      await this.db
        .delete(this.table as any)
        .where(eq((this.table as any).id, id));

      return true;
    } catch (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error}`);
    }
  }
}
