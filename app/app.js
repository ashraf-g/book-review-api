const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ path: "./app/.env" });

const app = express();

// CORS configuration
app.use(cors({ origin: "*" }));

// Security headers
app.use(helmet());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy (for rate limiting, etc.)
app.set("trust proxy", false);

// Logging using morgan and custom logger
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const [method, url, status, responseTime] = message.trim().split(" ");
        logger.info(JSON.stringify({ method, url, status, responseTime }));
      },
    },
  })
);

// Compression middleware
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Adds RateLimit-* headers
  legacyHeaders: false, // Removes X-RateLimit-* headers (optional)
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many requests from this IP, please try again later.",
      retryAfter: `${Math.ceil(
        (req.rateLimit.resetTime - Date.now()) / 1000
      )} seconds`,
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    });
  },
});
app.use(limiter);

// Database connection
const db = require("./configs/db");
db();

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to server." });
});

// Dynamic route imports
const routes = ["user", "book", "review"];

routes.forEach((route) => {
  require(`./routes/${route}.route`)(app);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;
