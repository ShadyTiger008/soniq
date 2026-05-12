import * as winston from "winston";

const logLevel = process.env.LOG_LEVEL || "info";
const nodeEnv = process.env.NODE_ENV || "development";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    // Handle message being an object
    let mainMsg = message;
    if (typeof message === "object") {
      mainMsg = JSON.stringify(message, null, 2);
    }
    
    let msg = `${timestamp} [${level}]: ${mainMsg}`;
    
    // Handle remaining meta
    if (Object.keys(meta).length > 0) {
      // Exclude service if it's the default and nothing else is there
      const filteredMeta = { ...meta };
      if (filteredMeta.service === "vibecue-backend" && Object.keys(filteredMeta).length === 1) {
        // Just return msg
      } else {
        msg += `\n${JSON.stringify(filteredMeta, null, 2)}`;
      }
    }
    return msg;
  })
);

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: "vibecue-backend" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// Add console transport in development
if (nodeEnv !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

