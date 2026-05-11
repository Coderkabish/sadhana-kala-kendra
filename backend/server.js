import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; 
import fs from "fs";

import { logger } from "./utils/logger.js";
import { correlationIdMiddleware, requestLoggingMiddleware } from "./middleware/errorCorrelationMiddleware.js";
import { getUserFriendlyError } from "./utils/errorMessages.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import teachersRoutes from "./routes/teachersRoutes.js";
import coursesRoutes from "./routes/coursesRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import activitiesRoutes from "./routes/activitiesRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import offersRoutes from "./routes/offersRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";

// Load environment variables
dotenv.config();

const requiredEnvVars = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "DB_PORT", "SESSION_TIMEOUT"];
const missingEnvVars = requiredEnvVars.filter((name) => process.env[name] === undefined);

if (missingEnvVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL) {
  console.error("FATAL ERROR: FRONTEND_URL is required in production.");
  process.exit(1);
}

const normalizeOrigin = (url) => url.replace(/\/$/, "");

const getWwwVariant = (origin) => {
  try {
    const parsed = new URL(origin);
    if (parsed.hostname.startsWith("www.")) {
      parsed.hostname = parsed.hostname.replace(/^www\./, "");
    } else {
      parsed.hostname = `www.${parsed.hostname}`;
    }
    return normalizeOrigin(parsed.toString());
  } catch {
    return null;
  }
};

const frontendUrl = process.env.FRONTEND_URL ? normalizeOrigin(process.env.FRONTEND_URL) : "";
const frontendUrls = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const app = express();
app.disable("x-powered-by");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const setCorpHeader = (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
};

// Production-ready CORS configuration
const explicitOrigins = [frontendUrl, ...frontendUrls].filter(Boolean);
const variantOrigins = explicitOrigins
  .map(getWwwVariant)
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...explicitOrigins, ...variantOrigins]));

// In development, allow common localhost variants for convenience
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(
    // "http://localhost:5173",
    // "http://127.0.0.1:5173",
    // "http://[::1]:5173",
  );
}

// Helmet configuration with production-ready CSP
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", frontendUrl].filter(Boolean),
        connectSrc: ["'self'", frontendUrl].filter(Boolean),
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// HTTPS enforcement middleware (redirect HTTP to HTTPS in production)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.protocol !== "https" && req.get("x-forwarded-proto") !== "https") {
      return res.redirect(301, `https://${req.get("host")}${req.url}`);
    }
    next();
  });
}

// ============ ERROR CORRELATION & REQUEST LOGGING ============
// Add correlation ID to each request for error tracking
app.use(correlationIdMiddleware);

// Log all requests with correlation IDs
if (process.env.LOG_LEVEL !== 'error') {
  app.use(requestLoggingMiddleware);
}

// CORS configuration with environment-aware origin handling
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, direct browser, etc)
      if (!origin) {
        callback(null, true);
        return;
      }

      // In local development, allow all origins to avoid localhost hostname/IP mismatch issues.
      if (process.env.NODE_ENV !== "production") {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        const corsError = new Error(`Not allowed by CORS: ${normalizedOrigin}`);
        corsError.statusCode = 403;
        callback(corsError);
      }
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

// ============ COMPRESSION MIDDLEWARE ============
// Enable gzip compression for all responses
// Reduces API response size by 60-70%
app.use(compression({
  level: 6, // Good balance between compression ratio and CPU usage
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Skip compression for GET requests from older browsers if needed
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Trust proxy - important for cPanel/reverse proxy setups
app.set("trust proxy", 1);

// Rate limiter for LOGIN ATTEMPTS ONLY (20 requests per 15 minutes)
// Auth already protected by: bcrypt password hashing, JWT tokens, input validation,
// generic error messages, 20-min session expiry, HttpOnly cookies with CSRF protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against limit
});

// Rate limiter for ADMIN PANEL (50 requests per 15 minutes)
// Protects admin operations from abuse while allowing public API unrestricted access
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});


app.use(express.json({ limit: "1mb" }));
app.use(cookieParser()); 
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);


app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Health check endpoint - useful for monitoring and debugging
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        node_env: process.env.NODE_ENV,
        port: process.env.PORT,
      },
      database: {
        status: "connected",
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
      },
      correlationId: req.correlationId,
    });
  } catch (error) {
    logger.error("Health check failed", {
      error: error.message,
      stack: error.stack,
      correlationId: req.correlationId,
    });
    
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      message: "Database connection failed",
      correlationId: req.correlationId,
    });
  }
});


app.use("/api/server", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// ============ PUBLIC API ROUTES (NO RATE LIMITING) ============
// These are safe to access freely by public users
app.use("/api/about", aboutRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/gallary", galleryRoutes);
app.use("/gallery", galleryRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/seo", seoRoutes);
app.use("/sitemap.xml", sitemapRoutes);

// ============ ADMIN ROUTES (RATE LIMITING APPLIED) ============
// Login has separate stricter rate limiting
app.use("/api/server/login", authLimiter);

// All other admin endpoints get general admin rate limiting
app.use("/api/server", adminLimiter, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Multer error handler (catches file upload errors)
app.use((err, req, res, next) => {
  // Handle multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: `File size exceeds 50MB limit. Please upload a smaller file.`
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      message: 'Too many files uploaded. Maximum 1 file allowed.'
    });
  }
  
  if (err.code === 'LIMIT_FIELD_KEY') {
    return res.status(400).json({ 
      message: 'Field key name too long.'
    });
  }
  
  if (err.code === 'LIMIT_FIELD_VALUE') {
    return res.status(400).json({ 
      message: 'Field value too long.'
    });
  }

  // Custom multer validation error (from fileFilter)
  if (err.name === 'MulterError' || (err.message && err.message.includes('Invalid'))) {
    return res.status(400).json({ 
      message: err.message || 'File upload validation failed.'
    });
  }

  // Generic error handling
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Log errors in production to keep technical details server-side
  if (statusCode >= 500) {
    const errorContext = {
      method: req.method,
      path: req.path,
      statusCode,
      message: err.message,
      stack: err.stack,
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    };
    
    // Log database-specific errors with more context
    if (err.code && err.code.startsWith('ER_')) {
      errorContext.sqlCode = err.code;
      errorContext.sqlMessage = err.sqlMessage;
    }
    
    logger.error(`[${statusCode}] ${req.method} ${req.path}`, errorContext);
  }

  // Return user-friendly message to client
  const userMessage = getUserFriendlyError(message, statusCode);
  res.status(statusCode).json({ 
    message: userMessage,
    correlationId: req.correlationId 
  });
});

// Get port from environment - cPanel usually assigns a specific port
const PORT = Number(process.env.PORT);

if (!PORT) {
  console.error("FATAL ERROR: PORT is not defined.");
  process.exit(1);
}

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  
  // Test database connection
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    logger.info(`Database connected successfully to ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
  } catch (err) {
    logger.error(`CRITICAL: Database connection failed on startup`, {
      message: err.message,
      code: err.code,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      stack: err.stack,
    });
  }
});

// Graceful shutdown handler for production
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
