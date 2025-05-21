import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with better retry and timeout settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // maximum number of clients
  idleTimeoutMillis: 30000, // how long to keep idle connections
  connectionTimeoutMillis: 10000, // connection timeout
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize drizzle with our pool and schema
export const db = drizzle({ client: pool, schema });

// Helper function to check database connection
export const checkDatabaseConnection = async (): Promise<boolean> => {
  let client;
  try {
    client = await pool.connect();
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
