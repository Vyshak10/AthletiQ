import express from "express";
import { json } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import pg from "pg";
import * as dotenv from "dotenv";
import tournamentsRouter from "./routes/tournaments";
import teamsRouter from "./routes/teams";
import matchesRouter from "./routes/matches";
import { supabase } from "./lib/supabase";
import { createServer } from "http";
const { Pool } = pg;

// Load environment variables from root directory
dotenv.config({ path: '../.env' });

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 9000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Session store setup
const PostgresStore = connectPgSimple(session);
const sessionStore = new PostgresStore({
  pool,
  createTableIfMissing: true,
});

// Middleware
app.use(json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Session handling
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register all routes
registerRoutes(app).catch(err => {
  console.error('Failed to register routes:', err);
  process.exit(1);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize server based on environment
if (process.env.NODE_ENV === "production") {
  log("production mode");
  serveStatic(app);
  server.listen(PORT, () => {
    log(`Server running on port ${PORT}`);
    log(`Frontend available at http://localhost:${PORT}`);
    log(`Backend API available at http://localhost:${PORT}/api`);
  });
} else {
  log("development mode");
  setupVite(app, server).catch(err => {
    console.error('Failed to setup Vite:', err);
    process.exit(1);
  });
  server.listen(PORT, () => {
    console.log(`[express] development mode`);
    console.log(`[express] Server running on port ${PORT}`);
    console.log(`[express] Frontend available at http://localhost:${PORT}`);
    console.log(`[express] Backend API available at http://localhost:${PORT}/api`);
  });
}