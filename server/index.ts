import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import dns from "node:dns";

// Force IPv4 to prevent connection timeouts with Neon DB on some VPS networks
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Trust all proxies (Cloudflare -> Nginx -> Express)
app.set('trust proxy', true);

// Initialize session store
import connectPg from "connect-pg-simple";
import { getPool } from "./db";
const PgSession = connectPg(session);

const pool = getPool();
const isProduction = app.get('env') === 'production';

// session debug logging
console.log("--- AUTH DEBUG INFO ---");
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Express Env: ${app.get('env')}`);
console.log(`Is Production: ${isProduction}`);
console.log(`Database URL present: ${!!process.env.DATABASE_URL}`);
console.log(`Database Pool created: ${!!pool}`);
console.log("-----------------------");

// Add session middleware for user authentication
app.use(session({
  store: pool ? new PgSession({
    pool,
    createTableIfMissing: true,
  }) : undefined,
  secret: process.env.SESSION_SECRET || 'sweetbite-bakery-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // True in production (requires HTTPS)
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Debug middleware to check protocol and headers
app.use((req, res, next) => {
  if (req.path === '/api/auth/login' || req.path === '/api/admin/login') {
    console.log(`[Login Attempt] Protocol: ${req.protocol}, Secure: ${req.secure}`);
    console.log(`[Login Attempt] X-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`);
    console.log(`[Login Attempt] Session ID: ${req.sessionID}`);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
