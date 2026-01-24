import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

// Lazy initialization variables
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let initialized = false;

// Initialize database connection lazily
function initializeDatabase() {
  if (initialized) return;

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.warn(
      "⚠️  DATABASE_URL not set. Running with in-memory storage. Data will not persist between restarts.",
    );
    initialized = true;
    return;
  }

  // Create connection pool with better retry and timeout settings
  pool = new Pool({
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // For local PostgreSQL, disable SSL
    ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
  });

  pool.on('error', (err: any) => {
    console.error('Unexpected error on idle client', err);
  });

  // Initialize drizzle with our pool and schema
  db = drizzle(pool, { schema });
  initialized = true;
}

// Export getters that initialize on first access
export function getPool(): Pool | null {
  initializeDatabase();
  return pool;
}

export function getDb() {
  initializeDatabase();
  return db;
}

// Helper function to check database connection
export const checkDatabaseConnection = async (): Promise<boolean> => {
  const currentPool = getPool();

  if (!currentPool) {
    console.log('No database connection available (DATABASE_URL not set)');
    return false;
  }

  let client;
  try {
    client = await currentPool.connect();
    await client.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  } finally {
    if (client) client.release();
  }
};
