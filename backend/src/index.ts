import envConfig from "./config/index.js";
import dns from "node:dns";

// Fix for MongoDB Atlas resolution issues on certain local networks
if (envConfig.isDevelopment) {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  dns.setDefaultResultOrder("ipv4first");
}

import { server } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { logger } from "./utils/logger.js";
import { initializeSocketIO } from "./socket/index.js";

const { port: PORT, env: NODE_ENV } = envConfig;

// Initialize Socket.IO
initializeSocketIO(server);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`📡 Socket.IO server initialized`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
    // Force exit after 1s if close hangs
    setTimeout(() => process.exit(1), 1000);
  } else {
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

startServer();


