/**
 * Logger Utility
 * This file sets up the Winston logger for logging application messages.
 * It includes custom formats for console and file logging.
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, json, colorize } = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({ filename: "app.log" }),
  ],
  exitOnError: false,
});

module.exports = logger;
