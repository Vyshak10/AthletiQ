import express from "express";
import { json } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import pg from "pg";
const { Pool } = pg;

const app = express();

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

// Routes
registerRoutes(app).then(async (server) => {
  if (process.env.NODE_ENV === "production") {
    log("production mode");
    serveStatic(app);
    server.listen(3000, () => {
      log('listening on port 3000');
    });
  } else {
    log("development mode");
    server.listen(5000, '0.0.0.0', () => {
      log('Server listening on port 5000');
    });
    await setupVite(app, server);
  }
});