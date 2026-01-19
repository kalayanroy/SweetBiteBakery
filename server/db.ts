import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

// Custom WebSocket wrapper to fix Neon serverless ErrorEvent message setter issue
class WebSocketWrapper extends ws {
  constructor(url: string, protocols?: string | string[]) {
    super(url, protocols);

    const originalAddEventListener = this.addEventListener;
    // @ts-ignore - necessary hack for property setter issue
    this.addEventListener = function (type: string, listener: any, options?: any) {
      if (type === 'error') {
        const wrappedListener = (event: any) => {
          // If the event is an ErrorEvent and message is read-only,
          // we create a proxy or a copy that allows setting the message
          if (event && event.constructor && event.constructor.name === 'ErrorEvent') {
            // It's an ErrorEvent, potentially read-only
            const proxy = new Proxy(event, {
              get(target, prop) {
                if (prop === 'message') return (target as any)._message || target.message;
                return (target as any)[prop];
              },
              set(target, prop, value) {
                if (prop === 'message') {
                  (target as any)._message = value;
                  return true;
                }
                (target as any)[prop] = value;
                return true;
              }
            });
            return listener.call(this, proxy);
          }
          return listener.call(this, event);
        };
        return originalAddEventListener.call(this, type as any, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type as any, listener, options);
    };
  }
}

neonConfig.webSocketConstructor = WebSocketWrapper as any;

// Make DATABASE_URL optional for local development
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL not set. Running with in-memory storage. Data will not persist between restarts.",
  );
}


// Create connection pool with better retry and timeout settings
export const pool = DATABASE_URL ? new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000, // Reduced to 30s
  connectionTimeoutMillis: 10000, // Reduced to 10s for faster failure/fallback
}) : null;


if (pool) {
  pool.on('error', (err: any) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit the process here, let the pool handle reconnection
    // process.exit(-1);
  });
}

// Initialize drizzle with our pool and schema (only if pool exists)
export const db = pool ? drizzle({ client: pool, schema }) : null;

// Helper function to check database connection
export const checkDatabaseConnection = async (): Promise<boolean> => {
  if (!pool) {
    console.log('No database connection available (DATABASE_URL not set)');
    return false;
  }

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
