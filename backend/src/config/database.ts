import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import envConfig from "./index.js";

const MONGODB_URI = envConfig.database.uri;

export async function connectDatabase(): Promise<void> {
  try {
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    };


    await mongoose.connect(MONGODB_URI, options);

    logger.info("✅ Connected to MongoDB");

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    logger.warn("Attempting to load in-memory MongoDB Mock...");
    try {
      const { enableMongooseMocking } = await import("./mongoose-mock.js");
      enableMongooseMocking();
      logger.info("🎉 In-Memory MongoDB Mock activated successfully");
    } catch (mockError) {
      logger.error("Failed to enable Mongoose mocking fallback:", mockError);
      throw error;
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}
