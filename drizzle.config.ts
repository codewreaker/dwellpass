// ============================================================================
// FILE: drizzle.config.ts
// Drizzle configuration for migrations and schema management (PGlite/PostgreSQL)
// ============================================================================

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://localhost/dwellpass',
  },
  verbose: true,
  strict: true,
});
