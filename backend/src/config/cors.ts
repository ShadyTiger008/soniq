import { CorsOptions } from "cors";

// Parse allowed origins from environment variable or use defaults
const parseAllowedOrigins = (): string[] => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  // Default origins
  const defaults = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://soniq-lime.vercel.app",
    "https://soniq-124amfgst-shadytiger008s-projects.vercel.app",
    
  ];

  // In production, be more permissive if no explicit origins are set
  if (process.env.NODE_ENV === "production") {
    return defaults;
  }

  return defaults;
};

const allowedOrigins = parseAllowedOrigins();

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Normalize origin (remove trailing slash and protocol variations)
    const normalizedOrigin = origin.replace(/\/$/, "").toLowerCase();

    // Check if origin is in allowed list (case-insensitive)
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      const normalizedAllowed = allowedOrigin.replace(/\/$/, "").toLowerCase();
      // Exact match
      if (normalizedOrigin === normalizedAllowed) {
        return true;
      }
      // Match with/without www
      if (
        normalizedOrigin.replace(/^www\./, "") ===
        normalizedAllowed.replace(/^www\./, "")
      ) {
        return true;
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // In development, log and allow for easier debugging
      if (process.env.NODE_ENV === "development") {
        console.warn(`CORS: Allowing origin in dev mode: ${origin}`);
        return callback(null, true);
      }

      // In production, log for debugging but block
      console.warn(
        `CORS blocked origin: ${origin}. Allowed origins:`,
        allowedOrigins
      );
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cookie",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["X-Total-Count"],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};
