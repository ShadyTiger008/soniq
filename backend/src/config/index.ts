import { config } from "dotenv";

// Load environment variables
config();

/**
 * Parse allowed origins from environment variable or use defaults
 */
const parseAllowedOrigins = (): string[] => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  // Default origins for production and development
  const defaults = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://vibecue.xyz",
    "https://www.vibecue.xyz",
    "https://api.vibecue.xyz",
    "https://vibecue-88py.onrender.com",
    "https://vibecue-lime.vercel.app",
  ];

  return defaults;
};

export const envConfig = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development" || !process.env.NODE_ENV,
  port: parseInt(process.env.PORT || "5001", 10),
  
  database: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/vibecue",
  },
  
  cors: {
    allowedOrigins: parseAllowedOrigins(),
  },
  
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
    fallbackFile: "vibecue-14ec6-firebase-adminsdk-fbsvc-6f95f31557.json",
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || "vibecue-secret-key-2024",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
  },
  
  apiKeys: {
    youtube: process.env.YOUTUBE_API_KEY,
    unsplash: process.env.UNSPLASH_ACCESS_KEY,
    groq: process.env.GROQ_API_KEY,
    openRouter: process.env.OPENROUTER_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
  },
  
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  
  logging: {
    level: process.env.LOG_LEVEL || "info",
  }
} as const;

// Simple validation to ensure critical keys are present in production
if (envConfig.isProduction) {
  const criticalKeys = [
    { key: "database.uri", value: envConfig.database.uri },
    { key: "jwt.secret", value: envConfig.jwt.secret },
  ];
  
  criticalKeys.forEach(({ key, value }) => {
    if (!value || value.includes("secret-key")) {
      console.warn(`[WARNING] Critical config "${key}" is not set or using default in production!`);
    }
  });
}

export default envConfig;
