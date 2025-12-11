// ============================================================================
// FILE: src/server/db/index.ts
// SQLite database connection and configuration
// ============================================================================

import { Database } from "bun:sqlite";
import path from "node:path";

export { default as UserOperations } from './user'

// Singleton database instance
let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "dwellpass.db");

    db = new Database(dbPath, {
      create: true,
      strict: true, // Better error handling for missing params
    });

    // Enable WAL mode for better concurrent performance
    db.run("PRAGMA journal_mode = WAL;");

    // Other performance optimizations
    db.run("PRAGMA synchronous = NORMAL;");
    db.run("PRAGMA cache_size = -64000;"); // 64MB cache
    db.run("PRAGMA temp_store = MEMORY;");

    console.log(`✓ Database connected: ${dbPath}`);
  }

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("✓ Database closed");
  }
}

// ============================================================================
// FILE: src/server/db/schema.ts
// Database schema and migrations
// ============================================================================

export function initializeSchema(db: Database): void {
  try {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);

    // Events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('draft', 'scheduled', 'ongoing', 'completed', 'cancelled')),
        startTime INTEGER NOT NULL,
        endTime INTEGER NOT NULL,
        location TEXT NOT NULL,
        capacity INTEGER,
        hostId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (hostId) REFERENCES users(id) ON DELETE CASCADE,
        CHECK(endTime > startTime)
      )
    `);

    // Attendance table
    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        eventId TEXT NOT NULL,
        patronId TEXT NOT NULL,
        attended INTEGER NOT NULL DEFAULT 0,
        checkInTime INTEGER,
        checkOutTime INTEGER,
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (patronId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(eventId, patronId),
        CHECK(checkOutTime IS NULL OR checkInTime IS NULL OR checkOutTime >= checkInTime)
      )
    `);

    // Loyalty table
    db.run(`
      CREATE TABLE IF NOT EXISTS loyalty (
        id TEXT PRIMARY KEY,
        patronId TEXT NOT NULL,
        description TEXT NOT NULL,
        tier TEXT CHECK(tier IS NULL OR tier IN ('bronze', 'silver', 'gold', 'platinum')),
        points INTEGER CHECK(points IS NULL OR points >= 0),
        reward TEXT,
        issuedAt INTEGER NOT NULL,
        expiresAt INTEGER,
        FOREIGN KEY (patronId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Indexes for better query performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users(createdAt)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_events_hostId ON events(hostId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_events_startTime ON events(startTime)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_eventId ON attendance(eventId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_patronId ON attendance(patronId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_attended ON attendance(attended)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_loyalty_patronId ON loyalty(patronId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_loyalty_tier ON loyalty(tier)`);

    console.log("✓ Database schema initialized");
  } catch (error) {
    console.error("❌ Failed to initialize schema:", error);
    throw error;
  }
}