import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; 
import fs from "fs";

import { logger } from "./utils/logger.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import teachersRoutes from "./routes/teachersRoutes.js";
import coursesRoutes from "./routes/coursesRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean); // Remove undefined values

// Helmet configuration with production-ready CSP
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Content Security Policy - adjust for production domains
const frontendUrl = process.env.FRONTEND_URL || "";
app.use(
    helmet.contentSecurityPolicy({  
        directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", frontendUrl, process.env.API_URL || ""].filter(Boolean),
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", frontendUrl].filter(Boolean),
        },
    })
);


// CORS configuration with environment-aware origin handling
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc) in development
      if (!origin) {
        if (process.env.NODE_ENV === "production") {
          // In production, be more strict - only allow if from allowed origins
          callback(null, false);
        } else {
          callback(null, true);
        }
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

// Trust proxy - important for cPanel/reverse proxy setups
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
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

app.use("/api/about", aboutRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/admin", limiter, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  // Log errors in production
  if (statusCode >= 500) {
    logger.error(`Error ${statusCode}: ${err.message}`, { stack: err.stack });
  }

  res.status(statusCode).json({ message });
});

// Get port from environment - cPanel usually assigns a specific port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
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