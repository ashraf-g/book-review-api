/**
 * Logger Utility
 * This file sets up the Winston logger for logging application messages.
 * It includes custom formats and separates error logs from general logs.
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, json } = format;

// Console log format
const consoleLogFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// JSON format for file logging
const fileLogFormat = combine(timestamp(), json());

// Create logger
const logger = createLogger({
  level: "info",
  transports: [
    // Console output
    new transports.Console({
      format: consoleLogFormat,
    }),

    // General logs (info, success, debug, etc.)
    new transports.File({
      filename: "logs/app.log",
      level: "info",
      format: fileLogFormat,
    }),

    // Error logs only
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileLogFormat,
    }),
  ],
  exitOnError: false,
});

// Add custom success method
logger.success = (msg) => {
  logger.log("success", msg);
};

module.exports = logger;
